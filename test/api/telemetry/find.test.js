import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findEndpoint from '#api/telemetry/find';
import { adminAuth } from '#api/auth';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/telemetry', () => {
	it('should export adminAuth as auth handler', () => {
		assert.strictEqual(findEndpoint.auth, adminAuth);
	});

	it('should return telemetry events sorted by created descending', async () => {
		/** @type {Telemetry[]} */
		const events = [
			{
				id: 'tel-1',
				invitation: 'guest-1',
				path: '/details',
				path_match: '/details',
				path_name: 'Details',
				viewport: 'sm',
				created: new Date('2025-01-01T10:00:00Z')
			},
			{
				id: 'tel-2',
				invitation: 'guest-2',
				path: '/menu',
				path_match: '/menu',
				path_name: 'Menu',
				viewport: 'lg',
				created: new Date('2025-01-01T12:00:00Z')
			},
			{
				id: 'tel-3',
				invitation: null,
				path: '/',
				path_match: '/',
				path_name: 'Home',
				viewport: 'md',
				created: new Date('2025-01-01T11:00:00Z')
			}
		];
		await getDb().collection('telemetry').insertMany(events);

		const req = mockReq({
			ctx: { admin: true, log: () => {} }
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		const body = getData();
		assert.strictEqual(body.success, true);
		assert.strictEqual(body.data.length, 3);
		assert.strictEqual(body.data[0].id, 'tel-2');
		assert.strictEqual(body.data[0].path, '/menu');
		assert.strictEqual(body.data[0].path_name, 'Menu');
		assert.strictEqual(body.data[0].viewport, 'lg');
		assert.strictEqual(body.data[0].invitation, 'guest-2');

		assert.strictEqual(body.data[1].id, 'tel-3');
		assert.strictEqual(body.data[1].path, '/');
		assert.strictEqual(body.data[1].path_name, 'Home');
		assert.strictEqual(body.data[1].viewport, 'md');
		assert.strictEqual(body.data[1].invitation, null);

		assert.strictEqual(body.data[2].id, 'tel-1');
		assert.strictEqual(body.data[2].path, '/details');
		assert.strictEqual(body.data[2].path_name, 'Details');
		assert.strictEqual(body.data[2].viewport, 'sm');
		assert.strictEqual(body.data[2].invitation, 'guest-1');

		assert.strictEqual(body.data[0]._id, undefined);
	});

	it('should return empty list when no telemetry events exist', async () => {
		const req = mockReq({
			ctx: { admin: true, log: () => {} }
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		const body = getData();
		assert.strictEqual(body.success, true);
		assert.deepStrictEqual(body.data, []);
	});
});
