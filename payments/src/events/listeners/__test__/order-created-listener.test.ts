import { OrderCreatedEvent, OrderStatus } from '@uitickets/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

const setup = () => {
    const 
        listener = new OrderCreatedListener(natsWrapper.client),
        data: OrderCreatedEvent['data'] = {
            id: mongoose.Types.ObjectId().toHexString(),
            version: 0,
            expiresAt: 'asdfasf',
            userId: 'asdfa',
            status: OrderStatus.Created,
            ticket: {
                id: 'asdfa',
                price: 10
            }
        },
        // @ts-ignore
        msg: Message = {
            ack: jest.fn()
        };

    return { listener, data, msg };
};

it('replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});