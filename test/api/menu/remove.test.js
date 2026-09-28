import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import removeEndpoint from '#api/menu/remove';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('DELETE /api/menu/:menuItemId', () => {
	it('should throw 400 when menuItemId does not exist', async () => {
		const req = mockReq({
			params: { menuItemId: 'non-existent' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			async () => {
				await removeEndpoint.action(req, res);
			},
			{ message: '"menuItemId" contained an invalid value' }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should remove adult menu item and unset from adult guests and children', async () => {
		const menuItem = {
			id: 'starter-1',
			title: 'Soup',
			course: 0,
			child: false
		};
		await getDb().collection('menu_items').insertOne(menuItem);

		const invitation1 = {
			id: 'inv-1',
			guests: [
				{ name: 'Alice', starter_id: 'starter-1', main_id: 'main-1' },
				{ name: 'Bob', starter_id: 'starter-2', main_id: 'main-1' }
			],
			children: [
				{ name: 'Charlie', starter_id: 'starter-1' }
			]
		};
		await getDb().collection('invitations').insertOne(invitation1);

		const req = mockReq({
			params: { menuItemId: 'starter-1' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await removeEndpoint.action(req, res);

		assert.strictEqual(getStatus(), 204);

		// Assert menu item removed
		const foundItem = await getDb().collection('menu_items').findOne({ id: 'starter-1' });
		assert.strictEqual(foundItem, null);

		// Assert invitation updated
		const updatedInv = await getDb().collection('invitations').findOne({ id: 'inv-1' });
		assert.strictEqual(updatedInv.guests[0].starter_id, '');
		assert.strictEqual(updatedInv.guests[1].starter_id, 'starter-2');
		assert.strictEqual(updatedInv.children[0].starter_id, '');
	});

	it('should remove children menu item and unset only from children', async () => {
		const menuItem = {
			id: 'child-dessert-1',
			title: 'Ice Cream',
			course: 2,
			child: true
		};
		await getDb().collection('menu_items').insertOne(menuItem);

		const invitation1 = {
			id: 'inv-2',
			guests: [
				{ name: 'Dave', dessert_id: 'adult-dessert-1' }
			],
			children: [
				{ name: 'Tommy', dessert_id: 'child-dessert-1' }
			]
		};
		await getDb().collection('invitations').insertOne(invitation1);

		const req = mockReq({
			params: { menuItemId: 'child-dessert-1' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await removeEndpoint.action(req, res);

		assert.strictEqual(getStatus(), 204);

		const foundItem = await getDb().collection('menu_items').findOne({ id: 'child-dessert-1' });
		assert.strictEqual(foundItem, null);

		const updatedInv = await getDb().collection('invitations').findOne({ id: 'inv-2' });
		// Adult dessert_id is untouched
		assert.strictEqual(updatedInv.guests[0].dessert_id, 'adult-dessert-1');
		// Child dessert_id is cleared
		assert.strictEqual(updatedInv.children[0].dessert_id, '');
	});
});
