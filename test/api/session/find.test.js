import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findEndpoint from '#api/session/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/session', () => {
	it('should return pending OAuth state if session is pending', async () => {
		const req = mockReq({
			session: {
				invitationId: 'admin@example.com',
				state: 'xyz-state',
				pending: true
			}
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.id, 'admin@example.com');
		assert.strictEqual(data.data.state, 'xyz-state');
		assert.strictEqual(data.data.pending, true);
	});

	it('should return full invitation for active session', async () => {
		await getDb().collection('invitations').insertOne({
			id: 'active-session-inv',
			guests: [ { name: 'Active User' } ]
		});

		const req = mockReq({
			session: {
				invitationId: 'active-session-inv'
			}
		});
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.id, 'active-session-inv');
		assert.strictEqual(data.data.guests[0].name, 'Active User');
	});
});
