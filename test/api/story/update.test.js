import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import updateEndpoint from '#api/story/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/story', () => {
	it('should update story items and return 204', async () => {
		const req = mockReq({
			body: {
				items: [
					{ title: 'First Date', description: 'At the park', date: '2020-05-01' }
				]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const doc = await getDb().collection('story').findOne({});
		assert.strictEqual(doc.items.length, 1);
		assert.strictEqual(doc.items[0].title, 'First Date');
		assert.ok(doc.updated instanceof Date);
	});

	it('should return 204 and not update when items is not an array or has invalid items', async () => {
		const req = mockReq({
			body: { items: 'not an array' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const doc = await getDb().collection('story').findOne({});
		assert.strictEqual(doc, null);
	});
});
