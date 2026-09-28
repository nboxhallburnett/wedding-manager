import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { connect, close, MongoClient } from '#lib/db/index';
import indexDefinitions from '#lib/db/indexes';
import { getDb } from '#test/setup';

describe('Database', () => {
	describe('#connect', () => {
		it('should connect and create all collections and indexes defined in indexes.js', async () => {
			const db = getDb();

			await connect();

			const collections = await db.listCollections().toArray();
			const collectionNames = collections.map(c => c.name);

			const missingCollections = Object.keys(indexDefinitions).filter(c => !collectionNames.includes(c));
			assert.deepStrictEqual(missingCollections, []);

			const missingIndexes = [];
			for (const definedCollection of Object.keys(indexDefinitions)) {
				const collection = db.collection(definedCollection);
				const indexes = await collection.listIndexes().toArray();
				const indexNames = indexes.map(i => i.name);

				for (const [ , opts ] of indexDefinitions[definedCollection]) {
					if (!indexNames.includes(opts.name)) {
						missingIndexes.push(`${definedCollection}.${opts.name}`);
					}
				}
			}

			assert.deepStrictEqual(missingIndexes, []);
		});

		it('should remove unknown indexes from collections while preserving defined and default indexes', async () => {
			const db = getDb();

			// Ensure collection and defined indexes exist
			await connect();

			// Add an unknown index to invitations collection
			const collection = db.collection('invitations');
			await collection.createIndex({ unknown_field: 1 }, { name: 'unknown_index' });

			let indexes = await collection.listIndexes().toArray();
			assert.ok(indexes.some(i => i.name === 'unknown_index'));

			// Run connect() again to trigger index reconciliation
			await connect();

			indexes = await collection.listIndexes().toArray();
			assert.strictEqual(indexes.some(i => i.name === 'unknown_index'), false, 'Rogue index should be removed');
			assert.ok(indexes.some(i => i.name === '_id_'), '_id_ index must be preserved');
			assert.ok(indexes.some(i => i.name === 'invitation_id'), 'Defined index must be preserved');
		});
	});

	describe('#close', () => {
		it('should close database connection when close() is invoked', async () => {
			let closeCalled = false;
			const origClose = MongoClient.close;
			MongoClient.close = async () => {
				closeCalled = true;
			};

			try {
				await close();
				assert.strictEqual(closeCalled, true);
			} finally {
				MongoClient.close = origClose;
			}
		});
	});
});
