import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import removeEndpoint from '#api/session/remove';
import config from '#conf';
import { mockReq, mockRes } from '#test/setup';

describe('DELETE /api/session', () => {
	it('should destroy session, clear cookie, and return 204', async () => {
		let destroyCalled = false;
		let clearedCookie = '';

		const req = mockReq({
			session: {
				invitationId: 'user-to-logout',
				destroy: cb => {
					destroyCalled = true;
					cb(null);
				}
			}
		});
		const { res, getStatus } = mockRes();
		res.clearCookie = name => {
			clearedCookie = name;
		};

		await removeEndpoint.action(req, res);

		assert.strictEqual(destroyCalled, true);
		assert.strictEqual(clearedCookie, config.server.session.name);
		assert.strictEqual(getStatus(), 204);
	});

	it('should reject when session.destroy returns an error', async () => {
		const req = mockReq({
			session: {
				destroy: cb => cb(new Error('Session destroy failed'))
			}
		});
		const { res } = mockRes();

		await assert.rejects(
			() => removeEndpoint.action(req, res),
			{ message: 'Session destroy failed' }
		);
	});
});
