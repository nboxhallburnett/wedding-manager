import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findEndpoint from '#api/story/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/story', () => {
	it('should return our story items when present', async () => {
		await getDb().collection('story').insertOne({
			items: [
				{ title: 'How We Met', description: 'Something romantic', date: '2020-01-01' }
			]
		});

		const req = mockReq();
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 1);
		assert.strictEqual(data.data[0].title, 'How We Met');
	});

	it('should return empty array when no story items exist', async () => {
		const req = mockReq();
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.deepStrictEqual(data.data, []);
	});
});
