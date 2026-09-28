import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createEndpoint from '#api/session/create';
import config from '#conf';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('POST /api/session', () => {
	describe('auth', () => {
		it('should return false when invitationId is not found', async () => {
			const req = mockReq({
				body: { invitationId: 'unknown-id' }
			});
			const result = await createEndpoint.auth(req);
			assert.strictEqual(result, false);
		});

		it('should allow guest invitation and set session', async () => {
			await getDb().collection('invitations').insertOne({
				id: 'guest-1',
				guests: [ { name: 'Alice' } ]
			});

			const req = mockReq({
				body: { invitationId: 'guest-1' }
			});
			const result = await createEndpoint.auth(req);
			assert.strictEqual(result, true);
			assert.strictEqual(req.session.invitationId, 'guest-1');
			assert.strictEqual(req.session.admin, undefined);
		});

		it('should allow admin from private IP and set session.admin', async () => {
			await getDb().collection('invitations').insertOne({
				id: 'admin-local',
				admin: true
			});

			const req = mockReq({
				body: { invitationId: 'admin-local' },
				_ip: '127.0.0.1'
			});
			const result = await createEndpoint.auth(req);
			assert.strictEqual(result, true);
			assert.strictEqual(req.session.admin, true);
		});

		it('should return 403 for admin from public IP without oauth email', async () => {
			await getDb().collection('invitations').insertOne({
				id: 'admin-public',
				admin: true,
				email: false
			});

			const req = mockReq({
				body: { invitationId: 'admin-public' },
				_ip: '8.8.8.8'
			});
			const result = await createEndpoint.auth(req);
			assert.strictEqual(result, 403);
		});

		it('should set pending session when admin has email and OAuth is configured', async () => {
			const originalClientId = config.oauth.client_id;
			config.oauth.client_id = 'test-client-id.apps.googleusercontent.com';

			try {
				await getDb().collection('invitations').insertOne({
					id: 'admin-oauth@example.com',
					admin: true,
					email: true
				});

				const req = mockReq({
					body: { invitationId: 'admin-oauth@example.com' },
					_ip: '8.8.8.8'
				});
				const result = await createEndpoint.auth(req);
				assert.strictEqual(result, true);
				assert.strictEqual(req.session.pending, true);
				assert.strictEqual(typeof req.session.state, 'string');
			} finally {
				config.oauth.client_id = originalClientId;
			}
		});
	});

	describe('action', () => {
		it('should return oauth state when session is pending', async () => {
			const req = mockReq({
				session: {
					invitationId: 'admin-oauth',
					pending: true,
					state: 'state-123'
				},
				ctx: {
					invitation: { id: 'admin-oauth' },
					log: () => {}
				}
			});
			const { res, getData } = mockRes();

			await createEndpoint.action(req, res);
			const data = getData();
			assert.strictEqual(data.success, true);
			assert.strictEqual(data.data.oauth, true);
			assert.strictEqual(data.data.state, 'state-123');
		});

		it('should return invitation and increment login count for completed login', async () => {
			await getDb().collection('invitations').insertOne({
				id: 'guest-login',
				login_count: 0
			});

			const req = mockReq({
				session: { invitationId: 'guest-login' },
				ctx: {
					invitation: { id: 'guest-login', guests: [ { name: 'Bob' } ] },
					log: () => {}
				}
			});
			const { res, getData } = mockRes();

			await createEndpoint.action(req, res);
			const data = getData();
			assert.strictEqual(data.success, true);
			assert.strictEqual(data.data.id, 'guest-login');

			// Check increment in db
			const updated = await getDb().collection('invitations').findOne({ id: 'guest-login' });
			assert.strictEqual(updated.login_count, 1);
		});
	});
});
