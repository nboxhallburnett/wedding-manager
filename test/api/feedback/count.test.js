import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import countFeedbackEndpoint from '#api/feedback/count';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/feedback/count', () => {
	it('should return total count of feedback items', async () => {
		await getDb().collection('feedback').insertMany([
			{ id: 'fb-1', read: false },
			{ id: 'fb-2', read: true }
		]);

		const req = mockReq({
			query: {},
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await countFeedbackEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data, 2);
	});

	it('should return filtered count by read status', async () => {
		await getDb().collection('feedback').insertMany([
			{ id: 'fb-1', read: false },
			{ id: 'fb-2', read: true }
		]);

		const req = mockReq({
			query: { read: 'false' },
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await countFeedbackEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data, 1);
	});
});
