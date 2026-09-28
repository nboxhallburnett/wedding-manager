import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import updateEndpoint from '#api/seating/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/seating', () => {
	it('should update seating plan with valid data', async () => {
		const req = mockReq({
			body: {
				ratio: 1.5,
				scale: 1,
				tables: [ {
					id: 'table-1',
					x: 100,
					y: 200,
					rotation: 0,
					guests: [ { id: 'inv1', idx: 0, child: false } ]
				} ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const seating = await getDb().collection('seating').findOne({});
		assert.strictEqual(seating.ratio, 1.5);
		assert.strictEqual(seating.tables.length, 1);
	});

	it('should reject when tables is not an array', async () => {
		const req = mockReq({
			body: { ratio: 1, scale: 1, tables: 'not-array' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /Tables must be an array/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when table.id is not a string', async () => {
		const req = mockReq({
			body: {
				ratio: 1,
				scale: 1,
				tables: [ { id: 123, guests: [] } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /Tables must contain an ID/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when table x, y, or rotation are invalid', async () => {
		const badX = mockReq({
			body: {
				ratio: 1,
				scale: 1,
				tables: [ { id: 't1', x: -5, guests: [] } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const res1 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(badX, res1.res),
			{ message: /"tables\[0\].x" contained an invalid value/ }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const badY = mockReq({
			body: {
				ratio: 1,
				scale: 1,
				tables: [ { id: 't1', y: -5, guests: [] } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const res2 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(badY, res2.res),
			{ message: /"tables\[0\].y" contained an invalid value/ }
		);
		assert.strictEqual(res2.getStatus(), 400);

		const badRot = mockReq({
			body: {
				ratio: 1,
				scale: 1,
				tables: [ { id: 't1', rotation: -10, guests: [] } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const res3 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(badRot, res3.res),
			{ message: /"tables\[0\].rotation" contained an invalid value/ }
		);
		assert.strictEqual(res3.getStatus(), 400);
	});

	it('should reject when table.guests is not an array', async () => {
		const req = mockReq({
			body: {
				ratio: 1,
				scale: 1,
				tables: [ { id: 't1', guests: 'invalid' } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /Table guest content must be an array/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when occupant id is not a string', async () => {
		const req = mockReq({
			body: {
				ratio: 1,
				scale: 1,
				tables: [ { id: 't1', guests: [ { id: 123, idx: 0, child: false } ] } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /Unsupported value: "123"/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when occupant idx is negative or invalid', async () => {
		const req = mockReq({
			body: {
				ratio: 1,
				scale: 1,
				tables: [ { id: 't1', guests: [ { id: 'inv1', idx: -1, child: false } ] } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /Unsupported value: "-1"/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when occupant child is not boolean', async () => {
		const req = mockReq({
			body: {
				ratio: 1,
				scale: 1,
				tables: [ { id: 't1', guests: [ { id: 'inv1', idx: 0, child: 'no' } ] } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /Unsupported value: "no"/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when ratio is out of range', async () => {
		const req = mockReq({
			body: { ratio: 10, scale: 1, tables: [ { id: 't1', guests: [] } ] },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /"ratio" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when scale is out of range', async () => {
		const req = mockReq({
			body: { ratio: 1, scale: 2.5, tables: [ { id: 't1', guests: [] } ] },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /"scale" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
