import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createEndpoint from '#api/telemetry/create';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/telemetry', () => {
	it('should create a telemetry event with valid data for authenticated guest', async () => {
		const req = mockReq({
			body: { path: '/details', path_match: '/details', path_name: 'Details', viewport: 'md' },
			session: { invitationId: 'guest-1' },
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await createEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const events = await getDb().collection('telemetry').find({}).toArray();
		assert.strictEqual(events.length, 1);
		assert.strictEqual(typeof events[0].id, 'string');
		assert.strictEqual(events[0].invitation, 'guest-1');
		assert.strictEqual(events[0].path, '/details');
		assert.strictEqual(events[0].path_match, '/details');
		assert.strictEqual(events[0].path_name, 'Details');
		assert.strictEqual(events[0].viewport, 'md');
		assert.ok(events[0].created instanceof Date);
	});

	it('should create a telemetry event for unauthenticated visitor', async () => {
		const req = mockReq({
			body: { path: '/', path_match: '/', path_name: 'Home', viewport: 'lg' },
			session: {},
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await createEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const events = await getDb().collection('telemetry').find({ path: '/' }).toArray();
		assert.strictEqual(events.length, 1);
		assert.strictEqual(events[0].invitation, null);
		assert.strictEqual(events[0].viewport, 'lg');
	});

	it('should reject invalid viewport size', async () => {
		const req = mockReq({
			body: { path: '/home', path_match: '/', path_name: 'Home', viewport: 'huge' },
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => createEndpoint.action(req, res),
			{ message: /"viewport" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when path is not a string', async () => {
		const req = mockReq({
			body: { path: 123, path_match: '/', path_name: 'Home', viewport: 'sm' },
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => createEndpoint.action(req, res),
			{ message: /"path" must be a string/ }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
