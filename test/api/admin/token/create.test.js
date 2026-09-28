import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createTokenEndpoint from '#api/admin/token/create';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/admin/token', () => {
	it('should create an auth token with valid name and description', async () => {
		const req = mockReq({
			body: { name: 'HA Token', description: 'Used by Home Assistant' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getData } = mockRes();

		await createTokenEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.name, 'HA Token');
		assert.strictEqual(typeof data.data.id, 'string');
		assert.strictEqual(data.data.id.length, 42);

		const tokenInDb = await getDb().collection('tokens').findOne({ name: 'HA Token' });
		assert.ok(tokenInDb);
	});

	it('should reject when name is missing or not a string', async () => {
		const reqMissing = mockReq({
			body: { description: 'Missing name' },
			ctx: { admin: true, log: () => {} }
		});
		const res1 = mockRes();

		await assert.rejects(
			() => createTokenEndpoint.action(reqMissing, res1.res),
			{ message: /"name" is a required field/ }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const reqNotString = mockReq({
			body: { name: 123 },
			ctx: { admin: true, log: () => {} }
		});
		const res2 = mockRes();

		await assert.rejects(
			() => createTokenEndpoint.action(reqNotString, res2.res),
			{ message: '"name" must be a string.' }
		);
		assert.strictEqual(res2.getStatus(), 400);
	});

	it('should reject when description is not a string', async () => {
		const req = mockReq({
			body: { name: 'Token', description: 456 },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => createTokenEndpoint.action(req, res),
			{ message: '"description" must be a string.' }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
