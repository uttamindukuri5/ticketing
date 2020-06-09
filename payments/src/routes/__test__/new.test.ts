import request from 'supertest';
import mongoose from 'mongoose';
import { OrderStatus } from '@uitickets/common';

import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('returns a 404 when purchasing an order does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie())
        .send({
            token: 'asdfasd',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('return a 401 when purchasing an order that doesn\'t belong to the user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie())
        .send({
            token: 'asdfa',
            orderId: order.id
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const 
        userId = mongoose.Types.ObjectId().toHexString(),
        order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            userId: userId,
            version: 0,
            price: 20,
            status: OrderStatus.Cancelled
        });
    
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie(userId))
        .send({
            orderId: order.id,
            token: 'asdfasd'
        })
        .expect(400);
});

it('returns a 204 with valid inputs', async () => {
    const 
        userId = mongoose.Types.ObjectId().toHexString(),
        order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            userId: userId,
            version: 0,
            price: 20,
            status: OrderStatus.Created
        });
    
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(20 * 100);
    expect(chargeOptions.currency).toEqual('usd');
    console.log(chargeOptions);

    const payment = await Payment.findOne({
        orderId: order.id
    });

    console.log(payment);

    expect(payment).not.toBeNull();
});

