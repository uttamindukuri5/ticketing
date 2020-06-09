import { Publisher, Subjects, TicketCreatedEvent } from '@uitickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}