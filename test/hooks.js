import { after, afterEach, mock } from 'node:test';

// Import the real library using `import()` so we can create our client, while
// allowing for our mock to correctly wire up on subsequent `import..from` calls
const MongoDB = await import('mongodb');

const client = new MongoDB.MongoClient(process.env.TEST_MONGO_URI);
await client.connect();

export const db = client.db(`test_${process.pid}`);

// Redirect db() calls on the client to our per-worker isolated database
const origDb = client.db.bind(client);
client.db = name => (name ? origDb(name) : db);

// Create a MongoClient proxy so any `new MongoDB.MongoClient(...)` gets our connected client
class MockMongoClient {
	constructor() {
		return client;
	}
}

// Mock the mongodb driver so src/lib/db/index.js uses our client and isolated db,
// while letting the real connect(), close(), and index reconciliation code run
mock.module('mongodb', {
	exports: {
		...MongoDB,
		default: {
			...MongoDB,
			MongoClient: MockMongoClient
		},
		MongoClient: MockMongoClient
	}
});

// Drop all collections between tests to ensure isolation.
afterEach(async () => {
	const collections = await db.listCollections().toArray();
	await Promise.all(collections.map(({ name }) => db.collection(name).deleteMany({})));
});

// Clean up and close connections after all tests finish running
after(async () => {
	await db.dropDatabase();
	await client.close();
});
