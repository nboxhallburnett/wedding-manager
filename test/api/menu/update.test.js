import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import updateEndpoint from '#api/menu/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/menu/:menuItemId', () => {
	beforeEach(async () => {
		const menuItem = {
			id: 'item-1',
			title: 'Soup',
			description: 'Tomato Soup',
			course: 0,
			child: false,
			vegan: true,
			vegetarian: true,
			gluten_free: false,
			hidden: false
		};
		await getDb().collection('menu_items').insertOne(menuItem);
	});

	it('should update menu item properties with valid types', async () => {
		const req = mockReq({
			params: { menuItemId: 'item-1' },
			body: {
				title: 'Updated Soup',
				description: 'Tomato Soup, now with croutons!',
				course: 1,
				child: false,
				vegan: false,
				vegetarian: true,
				gluten_free: true,
				hidden: true
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);

		assert.strictEqual(getStatus(), 204);
		const updated = await getDb().collection('menu_items').findOne({ id: 'item-1' });
		assert.strictEqual(updated.title, 'Updated Soup');
		assert.strictEqual(updated.description, 'Tomato Soup, now with croutons!');
		assert.strictEqual(updated.course, 1);
		assert.strictEqual(updated.vegan, false);
		assert.strictEqual(updated.gluten_free, true);
		assert.strictEqual(updated.hidden, true);
		assert.ok(updated.updated instanceof Date);
	});

	it('should return 204 without modifying anything if no valid fields provided', async () => {
		const menuItem = {
			id: 'item-2',
			title: 'Bread',
			description: 'Don\'t fill yourself up before the main!',
			course: 0
		};
		await getDb().collection('menu_items').insertOne(menuItem);

		const req = mockReq({
			params: { menuItemId: 'item-2' },
			body: { unrecognized: 'field' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);

		assert.strictEqual(getStatus(), 204);
		const unchanged = await getDb().collection('menu_items').findOne({ id: 'item-2' });
		assert.strictEqual(unchanged.title, 'Bread');
		assert.strictEqual(unchanged.updated, undefined);
	});

	it('should throw 400 when a property has invalid type', async () => {
		const req = mockReq({
			params: { menuItemId: 'item-1' },
			body: { title: 123 },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			async () => {
				await updateEndpoint.action(req, res);
			},
			{ message: '"title" must be a string.' }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should throw 400 when course is less than 0', async () => {
		const req = mockReq({
			params: { menuItemId: 'item-1' },
			body: { course: -1 },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			async () => {
				await updateEndpoint.action(req, res);
			},
			{ message: '"course" contained an invalid value: Unknown course value: "-1"' }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should throw 400 when course is greater than 2', async () => {
		const req = mockReq({
			params: { menuItemId: 'item-1' },
			body: { course: 3 },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			async () => {
				await updateEndpoint.action(req, res);
			},
			{ message: '"course" contained an invalid value: Unknown course value: "3"' }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should throw 404 when menuItemId does not exist', async () => {
		const req = mockReq({
			params: { menuItemId: 'nonexistent-item' },
			body: { title: 'New Item' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			async () => {
				await updateEndpoint.action(req, res);
			},
			err => err === 'Not Found'
		);
		assert.strictEqual(getStatus(), 404);
	});
});
