import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findOneMenuEndpoint from '#api/menu/find-one';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/menu/:menuItemId', () => {
	it('should return a specific menu item', async () => {
		await getDb().collection('menu_items').insertOne({
			id: 'item-pie',
			title: 'Apple Pie'
		});

		const req = mockReq({
			params: { menuItemId: 'item-pie' },
			session: { invitationId: 'user1' }
		});
		const { res, getData } = mockRes();

		await findOneMenuEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.id, 'item-pie');
		assert.strictEqual(data.data.title, 'Apple Pie');
	});

	it('should throw 404 when item is not found', async () => {
		const req = mockReq({
			params: { menuItemId: 'item-not-found' },
			session: { invitationId: 'user1' }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => findOneMenuEndpoint.action(req, res),
			err => err === 'Not Found'
		);
		assert.strictEqual(getStatus(), 404);
	});
});
