import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findCalendarEndpoint from '#api/calendar/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/calendar', () => {
	it('should return all calendar events', async () => {
		await getDb().collection('calendar_events').insertOne({
			id: 'ev-1',
			summary: 'Wedding Breakfast'
		});

		const req = mockReq({
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await findCalendarEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 1);
		assert.strictEqual(data.data[0].summary, 'Wedding Breakfast');
	});
});
