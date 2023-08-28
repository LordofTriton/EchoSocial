import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI)  throw new Error('Define the MONGODB_URI environmental variable');
if (!MONGODB_DB) throw new Error('Define the MONGODB_DB environmental variable');

let cachedClient = null;
let cachedDb = null;

export async function getDB() {
    if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };

    const { client, db } = await connectDB()
    return { client, db }
}

export async function connectDB() {
    const opts = { useNewUrlParser: true, useUnifiedTopology: true };

    let client = new MongoClient(MONGODB_URI, opts);
    await client.connect();
    let db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client: cachedClient, db: cachedDb };
}