import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findFeedbackEndpoint from '#api/feedback/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/feedback', () => {
	it('should return feedback items sorted by read then created desc', async () => {
		await getDb().collection('feedback').insertMany([
			{ id: 'fb-1', message: 'Read feedback', read: true, created: new Date('2026-01-01') },
			{ id: 'fb-2', message: 'Unread feedback', read: false, created: new Date('2026-01-02') }
		]);

		const req = mockReq({
			query: {},
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await findFeedbackEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 2);
		assert.strictEqual(data.data[0].id, 'fb-2'); // Unread first
	});

	it('should filter feedback by read status query', async () => {
		await getDb().collection('feedback').insertMany([
			{ id: 'fb-read', message: 'I recognise this one', read: true },
			{ id: 'fb-unread', message: 'Brand new', read: false }
		]);

		const req = mockReq({
			query: { read: 'false' },
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await findFeedbackEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 1);
		assert.strictEqual(data.data[0].id, 'fb-unread');
	});
});
