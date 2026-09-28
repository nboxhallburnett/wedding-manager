import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';

import removeTokenEndpoint from '#api/admin/token/remove';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('DELETE /api/admin/token/:tokenId', () => {
	it('should delete token by MongoDB _id and return 204', async () => {
		const result = await getDb().collection('tokens').insertOne({
			id: 'tok-123',
			name: 'Totally Temporary Token'
		});

		const req = mockReq({
			params: { tokenId: result.insertedId.toString() },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await removeTokenEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const remaining = await getDb().collection('tokens').findOne({ _id: result.insertedId });
		assert.strictEqual(remaining, null);
	});

	it('should reject with 400 when tokenId does not exist', async () => {
		const req = mockReq({
			params: { tokenId: new ObjectId().toString() },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => removeTokenEndpoint.action(req, res),
			{ message: /"tokenId" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
