import type { Identity } from '@/app/api/_shared/http/http.types';
import type { FirestoreCrudRepository } from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import { OrderStatus } from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import createHttpError from 'http-errors';
import type { OrderRepository } from './order.repository';
import type { CreateOrderInput, ListOrdersQuery, Order } from './order.schema';
import type { OrderListResult } from './order.types';

/**
 * Order domain logic — stock decrement/restock happen only through
 * {@link OrderRepository}'s transactional methods. Depends only on
 * repository abstractions (DIP); the concrete repository is chosen in
 * `order.module.ts`.
 */
export class OrderService {
	constructor(
		private readonly repo: OrderRepository & FirestoreCrudRepository<Order>
	) {}

	private canManageAll(identity: Identity): boolean {
		return hasPermission(identity.permissions, [Permission.ORDERS_MANAGE_ALL]);
	}

	async list(
		identity: Identity,
		query: ListOrdersQuery
	): Promise<OrderListResult> {
		const { page, pageSize, status, clientId } = query;
		const effectiveClientId = this.canManageAll(identity)
			? clientId
			: identity.uid;

		const clauses: NonNullable<FirestoreQueryOptions<Order>['where']> = [];
		if (effectiveClientId)
			clauses.push({ field: 'clientId', op: '==', value: effectiveClientId });
		if (status) clauses.push({ field: 'status', op: '==', value: status });
		const where = clauses.length ? clauses : undefined;

		const [items, total] = await Promise.all([
			this.repo.findMany({
				where,
				orderBy: [{ field: 'createdAt', direction: 'desc' }],
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

	async getById(identity: Identity, id: string): Promise<WithId<Order>> {
		const order = await this.repo.findById(id);
		if (
			!order ||
			(!this.canManageAll(identity) && order.clientId !== identity.uid)
		)
			throw new createHttpError.NotFound('Order not found');
		return order;
	}

	create(identity: Identity, input: CreateOrderInput): Promise<WithId<Order>> {
		return this.repo.createWithStockDecrement({
			clientId: identity.uid,
			items: input.items,
			status: OrderStatus.PENDING,
			createdAt: new Date().toISOString(),
		});
	}

	/** Owner (while `PENDING`) or staff with the manage-all bypass may cancel. */
	async cancel(identity: Identity, id: string): Promise<WithId<Order>> {
		await this.getById(identity, id);
		return this.repo.cancelWithRestock(id);
	}

	/** Staff-only: marks a `PENDING` order as picked up. */
	async fulfill(identity: Identity, id: string): Promise<WithId<Order>> {
		if (!this.canManageAll(identity)) throw new createHttpError.Forbidden();
		const order = await this.repo.findById(id);
		if (!order) throw new createHttpError.NotFound('Order not found');
		if (order.status !== OrderStatus.PENDING)
			throw new createHttpError.UnprocessableEntity(
				`Cannot fulfill an order with status ${order.status}`
			);
		await this.repo.update(id, { status: OrderStatus.FULFILLED });
		return this.getById(identity, id);
	}
}
