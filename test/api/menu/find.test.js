import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findMenuEndpoint from '#api/menu/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/menu', () => {
	it('should return menu items sorted by child then course', async () => {
		await getDb().collection('menu_items').insertMany([
			{ id: 'item-2', title: 'Main', course: 1, child: false },
			{ id: 'item-1', title: 'Starter', course: 0, child: false },
			{ id: 'item-3', title: 'Child Main', course: 1, child: true }
		]);

		const req = mockReq({
			query: {},
			session: { invitationId: 'user1' }
		});
		const { res, getData } = mockRes();

		await findMenuEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 3);
		assert.strictEqual(data.data[0].id, 'item-1');
		assert.strictEqual(data.data[1].id, 'item-2');
		assert.strictEqual(data.data[2].id, 'item-3');
	});

	it('should filter by specific ID list in query', async () => {
		await getDb().collection('menu_items').insertMany([
			{ id: 'item-1', title: 'Starter', course: 0, child: false },
			{ id: 'item-2', title: 'Main', course: 1, child: false }
		]);

		const req = mockReq({
			query: { id: 'item-1' },
			session: { invitationId: 'user1' }
		});
		const { res, getData } = mockRes();

		await findMenuEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 1);
		assert.strictEqual(data.data[0].id, 'item-1');
	});
});
