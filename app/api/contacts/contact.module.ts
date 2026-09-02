import { ContactController } from './contact.controller';
import { ContactRepository } from './contact.repository';
import { ContactService } from './contact.service';

/**
 * Composition root for the contacts module — the only place concrete classes are
 * wired together. Route handlers import the ready `contactController`.
 */
const repository = new ContactRepository();
const service = new ContactService(repository);

export const contactController = new ContactController(service);
