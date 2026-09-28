import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findOneCalendarEndpoint from '#api/calendar/find-one';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/calendar/:calendarEventId', () => {
	it('should return a specific event by id', async () => {
		await getDb().collection('calendar_events').insertOne({
			id: 'ev-specific',
			summary: 'Speeches'
		});

		const req = mockReq({
			params: { calendarEventId: 'ev-specific' },
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await findOneCalendarEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.id, 'ev-specific');
		assert.strictEqual(data.data.summary, 'Speeches');
	});

	it('should throw 404 when event is not found', async () => {
		const req = mockReq({
			params: { calendarEventId: 'non-existent' },
			ctx: { admin: true }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => findOneCalendarEndpoint.action(req, res),
			err => err === 'Not Found'
		);
		assert.strictEqual(getStatus(), 404);
	});
});
