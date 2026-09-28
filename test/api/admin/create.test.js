import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createEndpoint from '#api/admin/create';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/admin', () => {
	it('should create an admin user with valid id', async () => {
		const req = mockReq({
			body: { id: 'AdminUser' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await createEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const admins = await getDb().collection('invitations').find({ admin: true }).toArray();
		assert.strictEqual(admins.length, 1);
		assert.strictEqual(admins[0].id, 'adminuser'); // Should be lowercased
		assert.strictEqual(admins[0].admin, true);
	});

	it('should reject when id is missing or not a string', async () => {
		const reqMissing = mockReq({
			body: {},
			ctx: { admin: true, log: () => {} }
		});
		const res1 = mockRes();
		await assert.rejects(
			() => createEndpoint.action(reqMissing, res1.res),
			{ message: /"id" must be a string/ }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const reqNotString = mockReq({
			body: { id: 123 },
			ctx: { admin: true, log: () => {} }
		});
		const res2 = mockRes();
		await assert.rejects(
			() => createEndpoint.action(reqNotString, res2.res),
			{ message: /"id" must be a string/ }
		);
		assert.strictEqual(res2.getStatus(), 400);
	});

	it('should reject when email flag is true but id is not an email', async () => {
		const req = mockReq({
			body: { id: 'not-an-email', email: true },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => createEndpoint.action(req, res),
			{ message: /must be an email address/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should accept valid email when email flag is true', async () => {
		const req = mockReq({
			body: { id: 'admin@example.com', email: true },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await createEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const admins = await getDb().collection('invitations').find({ admin: true }).toArray();
		assert.strictEqual(admins[0].email, true);
	});
});
