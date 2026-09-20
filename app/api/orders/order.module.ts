import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';

/**
 * Composition root for the orders module — the only place concrete classes
 * are wired together. Route handlers import the ready `orderController`.
 */
const repository = new OrderRepository();
const service = new OrderService(repository);

export const orderController = new OrderController(service);
