import { Publisher, Subjects, TicketUpdatedEvent } from '@uitickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}