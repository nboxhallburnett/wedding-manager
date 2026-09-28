import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findEndpoint from '#api/seating/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/seating', () => {
	it('should return raw seating plan for admin when enrich is not specified', async () => {
		const seating = {
			tables: [
				{
					id: 1,
					guests: [
						{ id: 'inv-1', idx: 0, child: false },
						{ id: 'inv-1', idx: 1, child: false }
					]
				}
			]
		};
		await getDb().collection('seating').insertOne(seating);

		const req = mockReq({
			query: {},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		const body = getData();
		assert.strictEqual(body.success, true);
		assert.strictEqual(body.data.tables.length, 1);
		assert.strictEqual(body.data.tables[0].guests[0].id, 'inv-1');
		assert.strictEqual(body.data.tables[0].guests[0].idx, 0);
	});

	it('should sanitize seat id and idx for non-admin when enrich is not specified', async () => {
		const seating = {
			tables: [
				{
					id: 1,
					guests: [
						{ id: 'inv-1', idx: 0, child: false }
					]
				}
			]
		};
		await getDb().collection('seating').insertOne(seating);

		const req = mockReq({
			query: {},
			ctx: { admin: false, log: () => {} }
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		const body = getData();
		assert.strictEqual(body.success, true);
		assert.strictEqual(body.data.tables[0].guests[0].id, undefined);
		assert.strictEqual(body.data.tables[0].guests[0].idx, undefined);
	});

	it('should return enriched seating plan for admin with guest names and meal selections', async () => {
		const seating = {
			tables: [
				{
					id: 1,
					guests: [
						{ id: 'inv-1', idx: 0, child: false },
						{ id: 'inv-1', idx: 0, child: true }
					]
				}
			]
		};
		await getDb().collection('seating').insertOne(seating);

		const invitation = {
			id: 'inv-1',
			admin: false,
			guests: [
				{ name: 'John Doe', starter_id: 's1', main_id: 'm1', dessert_id: 'd1' }
			],
			children: [
				{ name: 'La Ti Doe', starter_id: 'cs1', main_id: 'cm1', dessert_id: 'cd1' }
			]
		};
		await getDb().collection('invitations').insertOne(invitation);

		const req = mockReq({
			query: { enrich: 'true' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		const body = getData();
		assert.strictEqual(body.success, true);
		const table = body.data.tables[0];
		assert.strictEqual(table.guests[0].name, 'John Doe');
		assert.strictEqual(table.guests[0].starter_id, 's1');
		assert.strictEqual(table.guests[0].main_id, 'm1');
		assert.strictEqual(table.guests[0].dessert_id, 'd1');
		assert.strictEqual(table.guests[0].id, 'inv-1');
		assert.strictEqual(table.guests[0].idx, 0);

		assert.strictEqual(table.guests[1].name, 'La Ti Doe');
		assert.strictEqual(table.guests[1].starter_id, 'cs1');
		assert.strictEqual(table.guests[1].main_id, 'cm1');
		assert.strictEqual(table.guests[1].dessert_id, 'cd1');
		assert.strictEqual(table.guests[1].id, 'inv-1');
	});

	it('should return enriched seating plan for non-admin with names only and sanitized IDs', async () => {
		const seating = {
			tables: [
				{
					id: 1,
					guests: [
						{ id: 'inv-1', idx: 0, child: false }
					]
				}
			]
		};
		await getDb().collection('seating').insertOne(seating);

		const invitation = {
			id: 'inv-1',
			admin: false,
			guests: [
				{ name: 'John Doe', starter_id: 's1', main_id: 'm1', dessert_id: 'd1' }
			]
		};
		await getDb().collection('invitations').insertOne(invitation);

		const req = mockReq({
			query: { enrich: 'true' },
			ctx: { admin: false, log: () => {} }
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		const body = getData();
		assert.strictEqual(body.success, true);
		const seat = body.data.tables[0].guests[0];
		assert.strictEqual(seat.name, 'John Doe');
		assert.strictEqual(seat.starter_id, undefined);
		assert.strictEqual(seat.id, undefined);
		assert.strictEqual(seat.idx, undefined);
	});

	it('should handle empty seating plan gracefully when enriched', async () => {
		const req = mockReq({
			query: { enrich: 'true' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);

		const body = getData();
		assert.strictEqual(body.success, true);
		assert.strictEqual(body.data, null);
	});
});
