import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isPrivateIp, middleware } from '#lib/admin';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('Admin', () => {
	describe('#isPrivateIp', () => {
		it('should return true for loopback address', () => {
			assert.strictEqual(isPrivateIp('127.0.0.1'), true);
		});

		it('should return true for 10.x.x.x private range', () => {
			assert.strictEqual(isPrivateIp('10.0.0.1'), true);
			assert.strictEqual(isPrivateIp('10.255.255.255'), true);
		});

		it('should return true for 172.16.x.x private range', () => {
			assert.strictEqual(isPrivateIp('172.16.0.1'), true);
			assert.strictEqual(isPrivateIp('172.31.255.255'), true);
		});

		it('should return true for 192.168.x.x private range', () => {
			assert.strictEqual(isPrivateIp('192.168.0.1'), true);
			assert.strictEqual(isPrivateIp('192.168.1.100'), true);
		});

		it('should return false for public IP addresses', () => {
			assert.strictEqual(isPrivateIp('8.8.8.8'), false);
			assert.strictEqual(isPrivateIp('203.0.113.1'), false);
		});
	});

	describe('#middleware', () => {
		it('should mark request as admin when req.session.admin is true', async () => {
			let nextCalled = false;
			const req = mockReq({ session: { admin: true } });
			const { res } = mockRes();

			await middleware(req, res, () => {
				nextCalled = true;
			});

			assert.strictEqual(nextCalled, true);
			assert.strictEqual(req.ctx.admin, true);
		});

		it('should grant admin and store token name when a valid x-auth-token is provided', async () => {
			await getDb().collection('tokens').insertOne({
				id: 'secret-token-123',
				name: 'Auth Tolkien'
			});

			let nextCalled = false;
			const req = mockReq({
				headers: { 'x-auth-token': 'secret-token-123' }
			});
			const { res } = mockRes();

			await middleware(req, res, () => {
				nextCalled = true;
			});

			assert.strictEqual(nextCalled, true);
			assert.strictEqual(req.ctx.admin, true);
			assert.strictEqual(req.ctx.token, 'Auth Tolkien');
		});

		it('should log warning and continue without admin when an invalid x-auth-token is provided', async () => {
			let logMessage = '';
			let nextCalled = false;
			const req = mockReq({
				headers: { 'x-auth-token': 'invalid-token' },
				ctx: {
					log: (msg, arg) => {
						logMessage = `${msg} ${arg}`;
					}
				}
			});
			const { res } = mockRes();

			await middleware(req, res, () => {
				nextCalled = true;
			});

			assert.strictEqual(nextCalled, true);
			assert.strictEqual(req.ctx.admin, false);
			assert.ok(logMessage.includes('Invalid auth token provided'));
		});

		it('should continue without modifying ctx when neither session nor token is present', async () => {
			let nextCalled = false;
			const req = mockReq();
			const { res } = mockRes();

			await middleware(req, res, () => {
				nextCalled = true;
			});

			assert.strictEqual(nextCalled, true);
			assert.strictEqual(req.ctx.admin, false);
			assert.strictEqual(req.ctx.token, undefined);
		});
	});
});
