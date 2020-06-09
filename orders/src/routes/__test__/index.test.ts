import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string, price: number) => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(), 
        title, 
        price });
    await ticket.save();

    return ticket;
}

it('fetches orders for an particular user', async () => {
    // Create three tickets
    const
        ticketOne = await buildTicket('Ticket One', 20),
        ticketTwo = await buildTicket('Ticket Two', 30),
        ticketThree = await buildTicket('Ticket Three', 40),
        // Create two users
        userOne = global.getCookie(),
        userTwo = global.getCookie();

    // Create one order as User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    // Create two order as User #2
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);

    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    // Make sure we only got the orders for User #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);

});