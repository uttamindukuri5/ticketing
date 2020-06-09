import { Subjects, Publisher, ExpirationCompleteEvent } from '@uitickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}