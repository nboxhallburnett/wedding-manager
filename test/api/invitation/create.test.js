import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createEndpoint from '#api/invitation/create';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/invitation', () => {
	it('should create an invitation with valid guests', async () => {
		const req = mockReq({
			body: { guests: [ { name: 'Alice' }, { name: 'Bob' } ] },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await createEndpoint.action(req, res);

		assert.strictEqual(getStatus(), 204);

		const invitations = await getDb().collection('invitations').find({}).toArray();
		assert.strictEqual(invitations.length, 1);
		assert.strictEqual(invitations[0].guests.length, 2);
		assert.strictEqual(invitations[0].guests[0].name, 'Alice');
		assert.strictEqual(invitations[0].guests[0].status_ceremony, 0);
	});

	it('should reject when no guests are provided', async () => {
		const req = mockReq({
			body: { guests: [] },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => createEndpoint.action(req, res),
			{ message: /At least one guest is required/ }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
