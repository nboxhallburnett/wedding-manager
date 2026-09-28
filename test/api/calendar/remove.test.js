import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import removeCalendarEndpoint from '#api/calendar/remove';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('DELETE /api/calendar/:calendarEventId', () => {
	it('should delete a calendar event and return 204', async () => {
		await getDb().collection('calendar_events').insertOne({
			id: 'ev-del',
			summary: 'The Boring Bit'
		});

		const req = mockReq({
			params: { calendarEventId: 'ev-del' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await removeCalendarEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const remaining = await getDb().collection('calendar_events').findOne({ id: 'ev-del' });
		assert.strictEqual(remaining, null);
	});

	it('should reject with 400 when event is not found', async () => {
		const req = mockReq({
			params: { calendarEventId: 'ev-bad' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => removeCalendarEndpoint.action(req, res),
			{ message: /"calendarEventId" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
