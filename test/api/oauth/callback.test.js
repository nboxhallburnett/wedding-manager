import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { OAuth2Client } from 'google-auth-library';

import callbackEndpoint from '#api/oauth/callback';
import config from '#conf';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/oauth/callback', () => {
	describe('auth', () => {
		it('should return 403 if OAuth is not configured on the server', async () => {
			const req = mockReq({
				session: { invitationId: 'admin@example.com' }
			});
			const result = await callbackEndpoint.auth(req);
			assert.strictEqual(result, 403);
		});

		it('should return false if OAuth is configured but session is not pending', async () => {
			const originalClientId = config.oauth.client_id;
			config.oauth.client_id = 'test-client-id.apps.googleusercontent.com';

			try {
				const req = mockReq({
					session: { invitationId: 'admin@example.com' }
				});
				const result = await callbackEndpoint.auth(req);
				assert.strictEqual(result, false);
			} finally {
				config.oauth.client_id = originalClientId;
			}
		});

		it('should allow callback when session has pending OAuth state', async () => {
			const originalClientId = config.oauth.client_id;
			config.oauth.client_id = 'test-client-id.apps.googleusercontent.com';

			try {
				const req = mockReq({
					session: {
						invitationId: 'admin@example.com',
						pending: true,
						state: 'state-abc'
					}
				});
				const result = await callbackEndpoint.auth(req);
				assert.strictEqual(result, true);
			} finally {
				config.oauth.client_id = originalClientId;
			}
		});
	});

	describe('action', () => {
		it('should reject when state does not match session state', async () => {
			const req = mockReq({
				session: { state: 'expected-state', pending: true, invitationId: 'admin@example.com' },
				body: { state: 'wrong-state', credential: 'dummy-token' }
			});
			const { res, getStatus } = mockRes();

			await assert.rejects(
				() => callbackEndpoint.action(req, res),
				{ message: /"state" contained an invalid value/ }
			);
			assert.strictEqual(getStatus(), 400);
		});

		it('should reject when credential is missing', async () => {
			const req = mockReq({
				session: { state: 'my-state', pending: true, invitationId: 'admin@example.com' },
				body: { state: 'my-state' }
			});
			const { res, getStatus } = mockRes();

			await assert.rejects(
				() => callbackEndpoint.action(req, res),
				{ message: /"credential" is a required parameter/ }
			);
			assert.strictEqual(getStatus(), 400);
		});

		it('should verify Google ID token, complete login, and clear pending session', async () => {
			await getDb().collection('invitations').insertOne({
				id: 'admin@example.com',
				admin: true,
				login_count: 0
			});

			// Mock verifyIdToken on OAuth2Client prototype
			const verifyMock = mock.method(OAuth2Client.prototype, 'verifyIdToken', async () => ({
				getPayload: () => ({
					email: 'admin@example.com',
					email_verified: true
				})
			}));

			try {
				const req = mockReq({
					session: {
						invitationId: 'admin@example.com',
						pending: true,
						state: 'oauth-state-ok'
					},
					body: {
						state: 'oauth-state-ok',
						credential: 'valid-google-jwt'
					},
					ctx: { log: () => {} }
				});
				const { res, getData } = mockRes();

				await callbackEndpoint.action(req, res);

				const data = getData();
				assert.strictEqual(data.success, true);
				assert.strictEqual(data.data.id, 'admin@example.com');
				assert.strictEqual(req.session.pending, undefined);
				assert.strictEqual(req.session.state, undefined);

				const updated = await getDb().collection('invitations').findOne({ id: 'admin@example.com' });
				assert.strictEqual(updated.login_count, 1);
			} finally {
				verifyMock.mock.restore();
			}
		});

		it('should reject if token email does not match pending invitation email', async () => {
			const verifyMock = mock.method(OAuth2Client.prototype, 'verifyIdToken', async () => ({
				getPayload: () => ({
					email: 'different-email@example.com',
					email_verified: true
				})
			}));

			try {
				const req = mockReq({
					session: {
						invitationId: 'admin@example.com',
						pending: true,
						state: 'state-val'
					},
					body: {
						state: 'state-val',
						credential: 'token-wrong-email'
					},
					ctx: { log: () => {} }
				});
				const { res, getStatus } = mockRes();

				await assert.rejects(
					() => callbackEndpoint.action(req, res),
					{ message: /"credential" contained an invalid value/ }
				);
				assert.strictEqual(getStatus(), 400);
			} finally {
				verifyMock.mock.restore();
			}
		});
	});
});
