import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createEndpoint from '#api/menu/create';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/menu', () => {
	it('should create a valid menu item', async () => {
		const req = mockReq({
			body: { title: 'Pizza', course: 1, description: 'If only this wasn\'t just test data' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await createEndpoint.action(req, res);

		assert.strictEqual(getStatus(), 204);

		const items = await getDb().collection('menu_items').find({}).toArray();
		assert.strictEqual(items.length, 1);
		assert.strictEqual(items[0].title, 'Pizza');
		assert.strictEqual(items[0].course, 1);
		assert.strictEqual(items[0].vegan, false);
	});

	it('should reject when title is missing or not a string', async () => {
		const reqMissing = mockReq({
			body: { course: 0 },
			ctx: { admin: true, log: () => {} }
		});
		const res1 = mockRes();

		await assert.rejects(
			() => createEndpoint.action(reqMissing, res1.res),
			{ message: /"title" is a required field/ }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const reqNotString = mockReq({
			body: { title: 123, course: 0 },
			ctx: { admin: true, log: () => {} }
		});
		const res2 = mockRes();

		await assert.rejects(
			() => createEndpoint.action(reqNotString, res2.res),
			{ message: '"title" must be a string.' }
		);
		assert.strictEqual(res2.getStatus(), 400);
	});

	it('should reject when course is missing or out of range', async () => {
		const reqMissing = mockReq({
			body: { title: 'Item' },
			ctx: { admin: true, log: () => {} }
		});
		const res1 = mockRes();

		await assert.rejects(
			() => createEndpoint.action(reqMissing, res1.res),
			{ message: '"course" is a required field.' }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const reqOutOfRange = mockReq({
			body: { title: 'Bad Item', course: 5 },
			ctx: { admin: true, log: () => {} }
		});
		const res2 = mockRes();

		await assert.rejects(
			() => createEndpoint.action(reqOutOfRange, res2.res),
			{ message: /Unknown course value/ }
		);
		assert.strictEqual(res2.getStatus(), 400);
	});

	it('should reject when description is not a string', async () => {
		const req = mockReq({
			body: { title: 'Apple Pi', course: 2, description: 3.14 },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => createEndpoint.action(req, res),
			{ message: '"description" must be a string.' }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
