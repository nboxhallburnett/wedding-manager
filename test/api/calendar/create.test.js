import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createCalendarEndpoint from '#api/calendar/create';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/calendar', () => {
	it('should create a calendar event and return 204', async () => {
		const req = mockReq({
			body: {
				summary: 'Cake Cutting',
				start: '2026-12-31T20:00:00Z',
				end: '2026-12-31T20:30:00Z',
				location: 'Main Ballroom',
				timezone: 'UTC'
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await createCalendarEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const events = await getDb().collection('calendar_events').find({}).toArray();
		assert.strictEqual(events.length, 1);
		assert.strictEqual(events[0].summary, 'Cake Cutting');
	});
});
