import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import downloadEndpoint from '#api/calendar/download';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/calendar.ics', () => {
	it('should generate an .ics calendar file containing database events', async () => {
		await getDb().collection('calendar_events').insertMany([
			{
				id: 'event-ceremony',
				summary: 'Wedding Ceremony',
				start: new Date('2026-12-31T13:30:00Z'),
				end: new Date('2026-12-31T14:15:00Z'),
				location: 'Glamorous Wedding Location',
				description: 'It\'s got enough seats for everyone, and plenty of parking too.'
			}
		]);

		const req = mockReq();
		const { res, getData, getHeaders, getStatus } = mockRes();

		await downloadEndpoint.action(req, res);

		assert.strictEqual(getStatus(), 200);

		const headers = getHeaders();
		assert.strictEqual(headers['content-type'], 'text/calendar; charset=utf-8');
		assert.strictEqual(headers['content-disposition'], 'attachment; filename="calendar.ics"');

		const icsContent = getData();
		assert.strictEqual(typeof icsContent, 'string');
		assert.ok(icsContent.includes('BEGIN:VCALENDAR'));
		assert.ok(icsContent.includes('SUMMARY:Wedding Ceremony'));
		assert.ok(icsContent.includes('LOCATION:Glamorous Wedding Location'));
		assert.ok(icsContent.includes('END:VCALENDAR'));
	});
});
