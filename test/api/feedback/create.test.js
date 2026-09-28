import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createEndpoint from '#api/feedback/create';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/feedback', () => {
	it('should create feedback with a valid message', async () => {
		const req = mockReq({
			body: { message: 'Great wedding site!' },
			session: { invitationId: 'inv1' },
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await createEndpoint.action(req, res);

		assert.strictEqual(getStatus(), 204);

		const items = await getDb().collection('feedback').find({}).toArray();
		assert.strictEqual(items.length, 1);
		assert.strictEqual(items[0].message, 'Great wedding site!');
		assert.strictEqual(items[0].read, false);
	});

	it('should reject when message is empty or missing', async () => {
		const reqEmpty = mockReq({
			body: { message: '' },
			session: { invitationId: 'inv1' },
			ctx: { log: () => {} }
		});
		const res1 = mockRes();

		await assert.rejects(
			() => createEndpoint.action(reqEmpty, res1.res),
			{ message: /"message" is a required field/ }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const reqMissing = mockReq({
			body: {},
			session: { invitationId: 'inv1' },
			ctx: { log: () => {} }
		});
		const res2 = mockRes();

		await assert.rejects(
			() => createEndpoint.action(reqMissing, res2.res),
			{ message: /"message" is a required field/ }
		);
		assert.strictEqual(res2.getStatus(), 400);
	});

	it('should reject when message is not a string', async () => {
		const req = mockReq({
			body: { message: 12345 },
			session: { invitationId: 'inv1' },
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => createEndpoint.action(req, res),
			{ message: '"message" must be a string.' }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when message exceeds 512 characters', async () => {
		const req = mockReq({
			body: { message: 'x'.repeat(513) },
			session: { invitationId: 'inv1' },
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => createEndpoint.action(req, res),
			{ message: /"message" values must be 512 characters or less/ }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
