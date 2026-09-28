import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import findEndpoint from '#api/invitation/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/invitation', () => {
	beforeEach(async () => {
		await getDb().collection('invitations').insertMany([
			{ id: 'inv1', guests: [ { name: 'Alice', starter_id: 'menu1' } ] },
			{ id: 'inv2', guests: [ { name: 'Bob', starter_id: 'menu2' } ] },
			{ id: 'admin1', admin: true, guests: [] }
		]);
	});

	it('should return non-admin invitations', async () => {
		const req = mockReq({ query: {} });
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		assert.strictEqual(getData().success, true);
		assert.strictEqual(getData().data.length, 2);
	});

	it('should filter by menuItemId query parameter', async () => {
		const req = mockReq({ query: { menuItemId: 'menu1' } });
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		assert.strictEqual(getData().success, true);
		assert.strictEqual(getData().data.length, 1);
		assert.strictEqual(getData().data[0].id, 'inv1');
	});
});
