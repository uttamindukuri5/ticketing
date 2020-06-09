import { Ticket } from '../ticket';

it('implements optimistic currency control', async (done)  => {
    // Create an instance of ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 5,
        userId: '123'
    });

    // Save the ticket to the database
    await ticket.save();

    // fetch the ticket twice 
    const 
        firstInstance = await Ticket.findById(ticket.id),
        secondInstance = await Ticket.findById(ticket.id);

    // maek the seperate changes to the ticket we fetched
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    // save the first fetched ticket
    await firstInstance!.save();

    // save the second fectched ticket and expect an error
    try {
        await secondInstance!.save();
    } catch (err) {
        return done();
    }

    throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});