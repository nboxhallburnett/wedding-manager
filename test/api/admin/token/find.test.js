import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findTokensEndpoint from '#api/admin/token/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/admin/token', () => {
	it('should return token records excluding the secret id property', async () => {
		await getDb().collection('tokens').insertOne({
			id: 'secret-id-xyz',
			name: 'My Token'
		});

		const req = mockReq({
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await findTokensEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 1);
		assert.strictEqual(data.data[0].name, 'My Token');
		assert.strictEqual(data.data[0].id, undefined);
		assert.ok(data.data[0]._id);
	});
});
