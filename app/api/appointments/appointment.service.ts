import type { Identity } from '@/app/api/_shared/http/http.types';
import type {
	FirestoreCrudRepository,
	ReadRepository,
} from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import type { Pet } from '@/app/api/pets/pet.schema';
import type { Service } from '@/app/api/services/service.schema';
import { AppointmentStatus } from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import createHttpError from 'http-errors';
import type { AppointmentRepository } from './appointment.repository';
import type {
	Appointment,
	CreateAppointmentInput,
	ListAppointmentsQuery,
	UpdateAppointmentStatusInput,
} from './appointment.schema';
import type { AppointmentListResult } from './appointment.types';

/** Fixed status state machine — anything not listed for a status is a 422. */
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
	[AppointmentStatus.PENDING]: [
		AppointmentStatus.CONFIRMED,
		AppointmentStatus.CANCELLED,
	],
	[AppointmentStatus.CONFIRMED]: [
		AppointmentStatus.ATTENDED,
		AppointmentStatus.CANCELLED,
		AppointmentStatus.NO_SHOW,
	],
	[AppointmentStatus.ATTENDED]: [],
	[AppointmentStatus.CANCELLED]: [],
	[AppointmentStatus.NO_SHOW]: [],
};

/**
 * Appointment domain logic — highest-risk module (overlap validation,
 * ownership, fixed state machine). Depends only on repository abstractions
 * (DIP); concrete repositories are chosen in `appointment.module.ts`.
 */
export class AppointmentService {
	constructor(
		private readonly repo: AppointmentRepository &
			FirestoreCrudRepository<Appointment>,
		private readonly petRepo: ReadRepository<Pet>,
		private readonly serviceRepo: ReadRepository<Service>
	) {}

	private canManageAll(identity: Identity): boolean {
		return hasPermission(identity.permissions, [
			Permission.APPOINTMENTS_MANAGE_ALL,
		]);
	}

	async list(
		identity: Identity,
		query: ListAppointmentsQuery
	): Promise<AppointmentListResult> {
		const { page, pageSize, status, clientId } = query;
		const effectiveClientId = this.canManageAll(identity)
			? clientId
			: identity.uid;

		const clauses: NonNullable<FirestoreQueryOptions<Appointment>['where']> =
			[];
		if (effectiveClientId)
			clauses.push({ field: 'clientId', op: '==', value: effectiveClientId });
		if (status) clauses.push({ field: 'status', op: '==', value: status });
		const where = clauses.length ? clauses : undefined;

		const [items, total] = await Promise.all([
			this.repo.findMany({
				where,
				orderBy: [{ field: 'start', direction: 'desc' }],
				offset: (page - 1) * pageSize,
				limit: pageSize,
			}),
			this.repo.count({ where }),
		]);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				pageCount: Math.max(1, Math.ceil(total / pageSize)),
			},
		};
	}

	async getById(identity: Identity, id: string): Promise<WithId<Appointment>> {
		const appointment = await this.repo.findById(id);
		if (
			!appointment ||
			(!this.canManageAll(identity) && appointment.clientId !== identity.uid)
		)
			throw new createHttpError.NotFound('Appointment not found');
		return appointment;
	}

	async create(
		identity: Identity,
		input: CreateAppointmentInput
	): Promise<WithId<Appointment>> {
		const canManageAll = this.canManageAll(identity);
		// Never trust a client-provided clientId/staffId — only a caller with
		// the manage-all bypass (staff booking on a client's behalf) may set
		// them; a plain client's appointment is always their own.
		const clientId = canManageAll
			? (input.clientId ?? identity.uid)
			: identity.uid;
		const staffId = canManageAll ? input.staffId : undefined;

		const pet = await this.petRepo.findById(input.petId);
		if (!pet || pet.ownerId !== clientId)
			throw new createHttpError.NotFound('Pet not found');

		const service = await this.serviceRepo.findById(input.serviceId);
		if (!service || !service.active)
			throw new createHttpError.NotFound('Service not found');

		const start = new Date(input.start);
		if (Number.isNaN(start.getTime()))
			throw new createHttpError.BadRequest('Invalid start date');
		const end = new Date(start.getTime() + service.durationMinutes * 60_000);

		const dayKey = start.toISOString().slice(0, 10);
		const previousDay = new Date(start);
		previousDay.setUTCDate(previousDay.getUTCDate() - 1);
		const previousDayKey = previousDay.toISOString().slice(0, 10);

		return this.repo.createIfNoOverlap(
			{
				clientId,
				petId: input.petId,
				serviceId: input.serviceId,
				staffId,
				start: start.toISOString(),
				end: end.toISOString(),
				status: AppointmentStatus.PENDING,
				createdAt: new Date().toISOString(),
			},
			dayKey,
			previousDayKey
		);
	}

	/** Client-side cancel of their own appointment, only while it hasn't started yet. */
	async cancel(identity: Identity, id: string): Promise<WithId<Appointment>> {
		const appointment = await this.repo.findById(id);
		if (!appointment || appointment.clientId !== identity.uid)
			throw new createHttpError.NotFound('Appointment not found');
		if (new Date(appointment.start).getTime() <= Date.now())
			throw new createHttpError.UnprocessableEntity(
				'Cannot cancel an appointment that has already started'
			);
		return this.repo.cancelAndFreeSlot(id);
	}

	/** Staff-side status transitions (confirm/attend/no-show/cancel). */
	async updateStatus(
		identity: Identity,
		id: string,
		input: UpdateAppointmentStatusInput
	): Promise<WithId<Appointment>> {
		const appointment = await this.repo.findById(id);
		if (!appointment)
			throw new createHttpError.NotFound('Appointment not found');
		this.assertTransition(appointment.status, input.status);
		if (input.status === AppointmentStatus.CANCELLED)
			return this.repo.cancelAndFreeSlot(id);
		await this.repo.update(id, { status: input.status });
		return this.getById(identity, id);
	}

	private assertTransition(
		from: AppointmentStatus,
		to: AppointmentStatus
	): void {
		if (!ALLOWED_TRANSITIONS[from].includes(to))
			throw new createHttpError.UnprocessableEntity(
				`Cannot transition appointment from ${from} to ${to}`
			);
	}
}
