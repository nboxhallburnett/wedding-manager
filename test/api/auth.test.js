import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { adminAuth, selfAuth, sessionAuth } from '#api/auth';
import { mockReq } from '#test/setup';

describe('API Auth', () => {
	describe('#adminAuth', () => {
		it('should return true when req.ctx.admin is true', async () => {
			const req = mockReq({ ctx: { admin: true, log: () => {} } });
			assert.strictEqual(await adminAuth(req), true);
		});

		it('should return false when req.ctx.admin is false', async () => {
			const req = mockReq();
			assert.strictEqual(await adminAuth(req), false);
		});
	});

	describe('#selfAuth', () => {
		it('should return true when invitationId matches params', async () => {
			const req = mockReq({
				params: { invitationId: 'abc123' },
				session: { invitationId: 'abc123' }
			});
			assert.strictEqual(await selfAuth(req), true);
		});

		it('should return true when request is admin', async () => {
			const req = mockReq({
				params: { invitationId: 'abc123' },
				ctx: { admin: true, log: () => {} }
			});
			assert.strictEqual(await selfAuth(req), true);
		});

		it('should return false when neither admin nor self', async () => {
			const req = mockReq({
				params: { invitationId: 'abc123' },
				session: { invitationId: 'xyz789' }
			});
			assert.strictEqual(await selfAuth(req), false);
		});
	});

	describe('#sessionAuth', () => {
		it('should return true when session has invitationId', async () => {
			const req = mockReq({ session: { invitationId: 'abc123' } });
			assert.strictEqual(await sessionAuth(req), true);
		});

		it('should return false when session has no invitationId', async () => {
			const req = mockReq();
			assert.strictEqual(await sessionAuth(req), false);
		});
	});
});
