import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import updateCalendarEndpoint from '#api/calendar/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/calendar/:calendarEventId', () => {
	beforeEach(async () => {
		await getDb().collection('calendar_events').insertOne({
			id: 'ev-upd',
			summary: 'Old Summary',
			start: new Date('2026-12-31T14:00:00Z'),
			end: new Date('2026-12-31T15:00:00Z'),
			timezone: 'UTC'
		});
	});

	it('should update a calendar event with valid properties and return 204', async () => {
		const req = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: {
				summary: 'New Summary',
				description: 'We changed venue',
				timezone: 'Europe/London',
				allDay: false,
				start: '2026-12-31T16:00:00Z',
				end: '2026-12-31T18:00:00Z',
				organizer: {
					name: 'Host Name',
					email: 'host@example.com'
				},
				location: {
					title: 'Fancy Location',
					address: '123 Some Pl',
					radius: 50,
					geo: { lat: 45.0, lon: -75.0 }
				}
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateCalendarEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const updated = await getDb().collection('calendar_events').findOne({ id: 'ev-upd' });
		assert.strictEqual(updated.summary, 'New Summary');
		assert.strictEqual(updated.organizer.name, 'Host Name');
		assert.strictEqual(updated.location.title, 'Fancy Location');
		assert.strictEqual(updated.location.radius, 50);
	});

	it('should return 204 without modifying when empty update', async () => {
		const req = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: {},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateCalendarEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);
	});

	it('should reject invalid property types', async () => {
		const req = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: {
				summary: 12345
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateCalendarEndpoint.action(req, res),
			{ message: /"summary" must be a string/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject invalid date strings for start or end', async () => {
		const req = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: { start: 'not-a-date' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateCalendarEndpoint.action(req, res),
			{ message: '"start" must be a valid Date.' }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should validate organizer name and email', async () => {
		const req1 = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: { organizer: { name: 123, email: 'test@example.com' } },
			ctx: { admin: true, log: () => {} }
		});
		const res1 = mockRes();
		await assert.rejects(
			() => updateCalendarEndpoint.action(req1, res1.res),
			{ message: '"organizer.name" must be a String.' }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const req2 = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: { organizer: { name: 'Alice', email: 456 } },
			ctx: { admin: true, log: () => {} }
		});
		const res2 = mockRes();
		await assert.rejects(
			() => updateCalendarEndpoint.action(req2, res2.res),
			{ message: '"organizer.email" must be a valid email address.' }
		);
		assert.strictEqual(res2.getStatus(), 400);
	});

	it('should validate location title, address, radius, and geo', async () => {
		const badTitle = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: { location: { title: 123 } },
			ctx: { admin: true, log: () => {} }
		});
		const res1 = mockRes();
		await assert.rejects(
			() => updateCalendarEndpoint.action(badTitle, res1.res),
			{ message: '"location.title" must be a String.' }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const badAddress = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: { location: { title: 'Venue', address: 123 } },
			ctx: { admin: true, log: () => {} }
		});
		const res2 = mockRes();
		await assert.rejects(
			() => updateCalendarEndpoint.action(badAddress, res2.res),
			{ message: '"location.address" must be a String.' }
		);
		assert.strictEqual(res2.getStatus(), 400);

		const badRadius = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: { location: { title: 'Venue', radius: -5 } },
			ctx: { admin: true, log: () => {} }
		});
		const res3 = mockRes();
		await assert.rejects(
			() => updateCalendarEndpoint.action(badRadius, res3.res),
			{ message: '"location.radius" must be a positive Number.' }
		);
		assert.strictEqual(res3.getStatus(), 400);

		const badLat = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: { location: { title: 'Venue', geo: { lat: 100, lon: 0 } } },
			ctx: { admin: true, log: () => {} }
		});
		const res4 = mockRes();
		await assert.rejects(
			() => updateCalendarEndpoint.action(badLat, res4.res),
			{ message: '"location.geo.lat" must be a Number between -90 and 90.' }
		);
		assert.strictEqual(res4.getStatus(), 400);

		const badLon = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: { location: { title: 'Venue', geo: { lat: 0, lon: 200 } } },
			ctx: { admin: true, log: () => {} }
		});
		const res5 = mockRes();
		await assert.rejects(
			() => updateCalendarEndpoint.action(badLon, res5.res),
			{ message: '"location.geo.lon" must be a Number between -180 and 180.' }
		);
		assert.strictEqual(res5.getStatus(), 400);
	});

	it('should throw 404 when calendar event does not exist', async () => {
		const req = mockReq({
			params: { calendarEventId: 'nonexistent-event' },
			body: { summary: 'New Event' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateCalendarEndpoint.action(req, res),
			err => err === 'Not Found'
		);
		assert.strictEqual(getStatus(), 404);
	});

	it('should catch ical-generator errors when tentative event is invalid', async () => {
		await getDb().collection('calendar_events').updateOne(
			{ id: 'ev-upd' },
			{ $set: { status: 'INVALID_STATUS' } }
		);

		const req = mockReq({
			params: { calendarEventId: 'ev-upd' },
			body: {
				summary: 'New Summary'
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateCalendarEndpoint.action(req, res),
			Error
		);
		assert.strictEqual(getStatus(), 400);
	});
});
