import { OrderCancelledEvent, OrderStatus } from '@uitickets/common';
import { Message } from 'node-nats-streaming';
import mongoose, { mongo } from 'mongoose';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';

const setup = async () => {
    const 
        listener = new OrderCancelledListener(natsWrapper.client),
        order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            status: OrderStatus.Created,
            price: 10,
            userId: 'aasdfa',
            version: 0
        });
    
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asdfad'
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
    const { listener, data, order, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})