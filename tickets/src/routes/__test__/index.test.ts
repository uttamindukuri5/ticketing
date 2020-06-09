import request from 'supertest';
import { app } from '../../app';

const createTicket = ( title: string, price: number ) => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.getCookie())
        .send({
            title, price
        });
}

it('can fetch a list of tickets', async () => {
    await createTicket('Test', 20);
    await createTicket('Test 1', 25);
    await createTicket('Test 2', 15);

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3);
});