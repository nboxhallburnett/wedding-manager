import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findEndpoint from '#api/admin/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/admin', () => {
	it('should return list of admin users excluding _id', async () => {
		await getDb().collection('invitations').insertMany([
			{ id: 'admin1@example.com', admin: true, email: true },
			{ id: 'guest1', guests: [] }
		]);

		const req = mockReq({
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 1);
		assert.strictEqual(data.data[0].id, 'admin1@example.com');
		assert.strictEqual(data.data[0]._id, undefined);
	});
});
