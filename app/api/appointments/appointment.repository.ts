import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { firestore } from '@/app/api/_shared/firebase';
import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import { AppointmentStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import type { Appointment } from './appointment.schema';

const COLLECTION = 'appointments';
const DAY_LOCKS_COLLECTION = 'appointment-day-locks';
const PETS_COLLECTION = 'pets';
// 500 writes/transaction: leaves room for the pet delete + day-lock sets.
const MAX_CASCADE_APPOINTMENTS = 400;

type SlotInterval = { start: string; end: string };
type DayLock = { slots: Record<string, SlotInterval> };

/**
 * Firestore-backed repository for the `appointments` collection. Inherits
 * the full CRUD surface from {@link FirestoreRepository}; adds the
 * overlap-safe transactional create/cancel needed by Phase 5's
 * highest-risk requirement (no double-booking under concurrent requests).
 *
 * A `set`/`create` on a brand-new appointment document contends with
 * nothing — Firestore only serializes transactions around documents that
 * are actually read, and a not-yet-existing doc can't be locked. Overlap
 * safety therefore hinges on a single shared **day-lock** document per
 * calendar day (`appointment-day-locks/{day}`, keyed by UTC date, holding a
 * `slots` map of `appointmentId -> {start, end}`) that every create/cancel
 * for that day reads and writes inside its transaction — that's the
 * document Firestore actually contends on and retries against.
 */
export class AppointmentRepository extends FirestoreRepository<Appointment> {
	constructor() {
		super(COLLECTION);
	}

	findByClient(clientId: string) {
		return this.findMany({
			where: [{ field: 'clientId', op: '==', value: clientId }],
			orderBy: [{ field: 'start', direction: 'desc' }],
		});
	}

	/**
	 * Creates an appointment iff no already-booked slot overlaps
	 * `[data.start, data.end)`. Checks both `dayKey`'s and `previousDayKey`'s
	 * day-lock docs — an appointment starting late on the previous day can
	 * still end after this day's start, so a same-day-only check would miss
	 * it — then reserves the slot in `dayKey`'s lock (the day the
	 * appointment *starts* on) and creates the appointment, all in one
	 * transaction.
	 */
	async createIfNoOverlap(
		data: Appointment,
		dayKey: string,
		previousDayKey: string
	): Promise<WithId<Appointment>> {
		try {
			return await firestore().runTransaction(async (transaction) => {
				const dayLockRef = firestore()
					.collection(DAY_LOCKS_COLLECTION)
					.doc(dayKey);
				const previousDayLockRef = firestore()
					.collection(DAY_LOCKS_COLLECTION)
					.doc(previousDayKey);

				const [daySnapshot, previousDaySnapshot] = await Promise.all([
					transaction.get(dayLockRef),
					transaction.get(previousDayLockRef),
				]);

				const daySlots =
					(daySnapshot.data() as DayLock | undefined)?.slots ?? {};
				const previousDaySlots =
					(previousDaySnapshot.data() as DayLock | undefined)?.slots ?? {};

				const overlaps = [
					...Object.values(daySlots),
					...Object.values(previousDaySlots),
				].some((slot) => slot.start < data.end && slot.end > data.start);
				if (overlaps)
					throw new createHttpError.Conflict(
						'Requested time slot overlaps an existing appointment'
					);

				const appointmentRef = this.collection.doc();
				transaction.set(
					dayLockRef,
					{
						slots: {
							...daySlots,
							[appointmentRef.id]: { start: data.start, end: data.end },
						},
					},
					{ merge: true }
				);
				transaction.set(appointmentRef, data);
				return { ...data, id: appointmentRef.id };
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/**
	 * Transitions an appointment to `CANCELLED` and frees its reserved slot
	 * from that day's lock doc, in one transaction. Re-checks the current
	 * status at commit time (only `PENDING`/`CONFIRMED` may cancel) so a
	 * concurrent status change can't double-free a slot.
	 */
	async cancelAndFreeSlot(id: string): Promise<WithId<Appointment>> {
		try {
			return await firestore().runTransaction(async (transaction) => {
				const appointmentRef = this.collection.doc(id);
				const appointmentSnapshot = await transaction.get(appointmentRef);
				if (!appointmentSnapshot.exists)
					throw new createHttpError.NotFound('Appointment not found');
				const appointment = appointmentSnapshot.data() as Appointment;
				if (
					appointment.status !== AppointmentStatus.PENDING &&
					appointment.status !== AppointmentStatus.CONFIRMED
				)
					throw new createHttpError.UnprocessableEntity(
						`Cannot transition appointment from ${appointment.status} to ${AppointmentStatus.CANCELLED}`
					);

				const dayKey = appointment.start.slice(0, 10);
				const dayLockRef = firestore()
					.collection(DAY_LOCKS_COLLECTION)
					.doc(dayKey);
				const daySnapshot = await transaction.get(dayLockRef);
				const daySlots = {
					...((daySnapshot.data() as DayLock | undefined)?.slots ?? {}),
				};
				delete daySlots[id];

				transaction.set(dayLockRef, { slots: daySlots }, { merge: true });
				transaction.update(appointmentRef, {
					status: AppointmentStatus.CANCELLED,
				});
				return {
					...appointment,
					id,
					status: AppointmentStatus.CANCELLED,
				};
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/**
	 * Deletes pet `petId` and cancels its upcoming `PENDING`/`CONFIRMED`
	 * appointments (freeing their day-lock slots exactly like
	 * {@link cancelAndFreeSlot}) in ONE transaction, so no orphaned active
	 * appointment can survive the pet. Past and finished/cancelled
	 * appointments are left untouched as history.
	 *
	 * Query is `petId ==` + `start >` (covered by the existing
	 * petId/start composite index); status is filtered in memory.
	 * ponytail: a transaction caps at 500 writes (1 pet delete + 1 update per
	 * appointment + 1 per distinct day-lock); we reject above
	 * MAX_CASCADE_APPOINTMENTS upcoming appointments rather than risk a
	 * partial commit. Chunk (cancel first, then delete pet) if that bites.
	 */
	async deletePetCancellingUpcoming(petId: string): Promise<void> {
		try {
			await firestore().runTransaction(async (transaction) => {
				const upcoming = await transaction.get(
					this.collection
						.where('petId', '==', petId)
						.where('start', '>', new Date().toISOString())
						.limit(MAX_CASCADE_APPOINTMENTS + 1)
				);
				if (upcoming.size > MAX_CASCADE_APPOINTMENTS)
					throw new createHttpError.UnprocessableEntity(
						'Pet has too many upcoming appointments; cancel some first'
					);
				const active = upcoming.docs.filter((doc) => {
					const { status } = doc.data() as Appointment;
					return (
						status === AppointmentStatus.PENDING ||
						status === AppointmentStatus.CONFIRMED
					);
				});

				// Reads must all precede writes: load each affected day lock once.
				const dayKeys = [
					...new Set(
						active.map((doc) => (doc.data() as Appointment).start.slice(0, 10))
					),
				];
				const lockRefs = dayKeys.map((key) =>
					firestore().collection(DAY_LOCKS_COLLECTION).doc(key)
				);
				const lockSnapshots = await Promise.all(
					lockRefs.map((ref) => transaction.get(ref))
				);

				lockSnapshots.forEach((snapshot, index) => {
					const slots = {
						...((snapshot.data() as DayLock | undefined)?.slots ?? {}),
					};
					for (const doc of active)
						if ((doc.data() as Appointment).start.startsWith(dayKeys[index]))
							delete slots[doc.id];
					transaction.set(lockRefs[index], { slots }, { merge: true });
				});
				for (const doc of active)
					transaction.update(doc.ref, { status: AppointmentStatus.CANCELLED });
				transaction.delete(firestore().collection(PETS_COLLECTION).doc(petId));
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}
}
