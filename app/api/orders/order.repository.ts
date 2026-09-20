import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { firestore } from '@/app/api/_shared/firebase';
import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { Medication } from '@/app/api/medications/medication.schema';
import { OrderStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import type { Order } from './order.schema';

const COLLECTION = 'orders';
const MEDICATIONS_COLLECTION = 'medications';

/** Sums `quantity` per `medicationId` — an order can list the same medication more than once. */
function aggregateQuantities(items: Order['items']): Map<string, number> {
	const totals = new Map<string, number>();
	for (const item of items)
		totals.set(
			item.medicationId,
			(totals.get(item.medicationId) ?? 0) + item.quantity
		);
	return totals;
}

/**
 * Firestore-backed repository for the `orders` collection. Inherits the
 * full CRUD surface from {@link FirestoreRepository}; adds the two
 * transactional operations that must stay atomic with `medications.stock`
 * (Phase 7's highest-risk requirement — same class of bug as Phase 5's
 * overlap check). Both aggregate by distinct `medicationId` first — an order
 * repeating the same medication across multiple line items must still check
 * and adjust stock exactly once per medication, for the summed quantity.
 */
export class OrderRepository extends FirestoreRepository<Order> {
	constructor() {
		super(COLLECTION);
	}

	findByClient(clientId: string) {
		return this.findMany({
			where: [{ field: 'clientId', op: '==', value: clientId }],
			orderBy: [{ field: 'createdAt', direction: 'desc' }],
		});
	}

	/**
	 * Creates the order and decrements each distinct medication's
	 * `stock` by its total ordered quantity, in one transaction. If any
	 * medication lacks sufficient stock, the whole transaction aborts and
	 * nothing is written — two concurrent orders that would jointly exceed
	 * stock can't both succeed, since the second to commit re-runs against
	 * the first's already-decremented stock.
	 */
	async createWithStockDecrement(data: Order): Promise<WithId<Order>> {
		try {
			return await firestore().runTransaction(async (transaction) => {
				const totals = aggregateQuantities(data.items);
				const medicationIds = [...totals.keys()];
				const medicationRefs = medicationIds.map((id) =>
					firestore().collection(MEDICATIONS_COLLECTION).doc(id)
				);
				const medicationSnapshots = await Promise.all(
					medicationRefs.map((ref) => transaction.get(ref))
				);

				medicationIds.forEach((medicationId, index) => {
					const snapshot = medicationSnapshots[index];
					if (!snapshot.exists)
						throw new createHttpError.NotFound(
							`Medication ${medicationId} not found`
						);
					const medication = snapshot.data() as Medication;
					if (!medication.active)
						throw new createHttpError.NotFound(
							`Medication ${medicationId} not found`
						);
					const requested = totals.get(medicationId)!;
					if (medication.stock < requested)
						throw new createHttpError.Conflict(
							`Insufficient stock for medication ${medicationId}`
						);
				});

				medicationIds.forEach((medicationId, index) => {
					const medication = medicationSnapshots[index].data() as Medication;
					const requested = totals.get(medicationId)!;
					transaction.update(medicationRefs[index], {
						stock: medication.stock - requested,
					});
				});

				const orderRef = this.collection.doc();
				transaction.set(orderRef, data);
				return { ...data, id: orderRef.id };
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/**
	 * Cancels a `PENDING` order and restores each distinct medication's
	 * `stock` by its total ordered quantity, in one transaction, re-checking
	 * the order is still `PENDING` at commit time to avoid double-restocking
	 * under a concurrent status change.
	 */
	async cancelWithRestock(id: string): Promise<WithId<Order>> {
		try {
			return await firestore().runTransaction(async (transaction) => {
				const orderRef = this.collection.doc(id);
				const orderSnapshot = await transaction.get(orderRef);
				if (!orderSnapshot.exists)
					throw new createHttpError.NotFound('Order not found');
				const order = orderSnapshot.data() as Order;
				if (order.status !== OrderStatus.PENDING)
					throw new createHttpError.UnprocessableEntity(
						`Cannot cancel an order with status ${order.status}`
					);

				const totals = aggregateQuantities(order.items);
				const medicationIds = [...totals.keys()];
				const medicationRefs = medicationIds.map((medicationId) =>
					firestore().collection(MEDICATIONS_COLLECTION).doc(medicationId)
				);
				const medicationSnapshots = await Promise.all(
					medicationRefs.map((ref) => transaction.get(ref))
				);

				medicationIds.forEach((medicationId, index) => {
					const snapshot = medicationSnapshots[index];
					if (!snapshot.exists) return;
					const medication = snapshot.data() as Medication;
					const restored = totals.get(medicationId)!;
					transaction.update(medicationRefs[index], {
						stock: medication.stock + restored,
					});
				});

				transaction.update(orderRef, { status: OrderStatus.CANCELLED });
				return { ...order, id, status: OrderStatus.CANCELLED };
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}
}
