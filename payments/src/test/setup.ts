import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            getCookie(id?: string): string[];
        }
    }
}

jest.mock('../nats-wrapper.ts');
jest.mock('../stripe.ts');

process.env.STRIPE_KEY = 'sk_test_51GrXjJFuamlLfGgSuDcXMQhZQneLAUHLcC0JUhG87fBU3k9HmdtrFC6191hrla6LqhR1BQAs2aGeqcByltlyWaqf00RCN9oufW';

let mongo: any; 

beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasf';
    
    mongo = new MongoMemoryServer();

    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.getCookie = (id?: string) => {
    // Build a JWT payload. { id, email }
    const 
        payload = {
            id: id || new mongoose.Types.ObjectId().toHexString(),
            email: 'test@test.com'
        },
        token = jwt.sign(payload, process.env.JWT_KEY!),
        session = { jwt: token },
        sessionJSON = JSON.stringify(session),
        base64 = Buffer.from(sessionJSON).toString('base64');

    return [`express:sess=${base64}`]
}
