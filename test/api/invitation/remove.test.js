import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import removeEndpoint from '#api/invitation/remove';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('DELETE /api/invitation/:invitationId', () => {
	it('should remove an existing invitation and return 204', async () => {
		await getDb().collection('invitations').insertOne({
			id: 'inv-to-remove',
			guests: [ { name: 'Kevin' } ]
		});

		const req = mockReq({
			params: { invitationId: 'inv-to-remove' }
		});
		const { res, getStatus } = mockRes();

		await removeEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const remaining = await getDb().collection('invitations').findOne({ id: 'inv-to-remove' });
		assert.strictEqual(remaining, null);
	});

	it('should reject with 400 if invitation does not exist', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-not-found' }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => removeEndpoint.action(req, res),
			{ message: /"invitationId" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
