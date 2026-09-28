import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findOneEndpoint from '#api/invitation/find-one';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/invitation/:invitationId', () => {
	it('should return the invitation when it exists', async () => {
		await getDb().collection('invitations').insertOne({
			id: 'inv-alice',
			guests: [ { name: 'Alice' } ]
		});

		const req = mockReq({
			params: { invitationId: 'inv-alice' }
		});
		const { res, getData } = mockRes();

		await findOneEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.id, 'inv-alice');
		assert.strictEqual(data.data.guests[0].name, 'Alice');
	});

	it('should throw 404 when invitation does not exist', async () => {
		const req = mockReq({
			params: { invitationId: 'non-existent' }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => findOneEndpoint.action(req, res),
			err => err === 'Not Found'
		);
		assert.strictEqual(getStatus(), 404);
	});
});
