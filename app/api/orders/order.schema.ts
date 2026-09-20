import { OrderStatus } from '@/constants/enum';
import { z } from 'zod';

export const orderItemSchema = z.object({
	medicationId: z.string().min(1),
	quantity: z.number().int().positive().max(1000),
});

export const orderSchema = z.object({
	clientId: z.string().min(1),
	items: z.array(orderItemSchema).min(1).max(50),
	status: z.nativeEnum(OrderStatus),
	createdAt: z.string(),
});

/** Client payload — `clientId`/`status`/`createdAt` are set server-side. */
export const createOrderSchema = orderSchema
	.pick({ items: true })
	.refine(
		(input) =>
			new Set(input.items.map((item) => item.medicationId)).size ===
			input.items.length,
		{ message: 'Duplicate medicationId in items', path: ['items'] }
	);

export const listOrdersQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	status: z.nativeEnum(OrderStatus).optional(),
	clientId: z.string().optional(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
