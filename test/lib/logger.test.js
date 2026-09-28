import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import logger, { middleware, registerLogDb } from '#lib/logger';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('Logger', () => {
	describe('#logger', () => {
		it('should return a scoped debug logger instance', () => {
			const log = logger('test-ns');
			assert.strictEqual(typeof log, 'function');
			assert.ok(log.namespace.endsWith(':test-ns'));
		});
	});

	describe('#middleware', () => {
		it('should attach scoped log, start time, and normalized ip in middleware', () => {
			let nextCalled = false;
			const req = mockReq({
				id: 'test-req-logger',
				headers: { 'x-forwarded-for': '203.0.113.195' }
			});
			const { res } = mockRes();

			middleware(req, res, () => {
				nextCalled = true;
			});

			assert.strictEqual(nextCalled, true);
			assert.strictEqual(typeof req.ctx.log, 'function');
			assert.strictEqual(typeof req._startTime, 'number');
			assert.strictEqual(req._ip, '203.0.113.195');

			// Trigger res.end to test response time calculation and logging
			res.end();
		});
	});

	describe('#registerLogDb', () => {
		it('should buffer logs before registered, support TTY formatting, and flush on registration', async () => {
			const log = logger('pre-db');
			log.enabled = true;

			const origIsTTY = process.stdout.isTTY;
			process.stdout.isTTY = true;
			log.useColors = true;
			try {
				log('Gotta go fast');
			} finally {
				process.stdout.isTTY = origIsTTY;
				log.useColors = false;
			}

			await registerLogDb();

			// Writing through a logger after DB registration
			const postLog = logger('db-test');
			postLog.enabled = true;
			postLog('db here I come!');

			// Give the async inserts time to do their thing
			await new Promise(resolve => setTimeout(resolve, 50));

			const logs = await getDb().collection('logs').find({}).toArray();
			assert.ok(Array.isArray(logs));

			const preDbLog = logs.find(l => l.ns === 'pre-db');
			assert.ok(preDbLog, 'Buffered log with namespace "pre-db" should be flushed to collection');
			assert.strictEqual(preDbLog.message, 'Gotta go fast');

			const postDbLog = logs.find(l => l.ns === 'db-test');
			assert.ok(postDbLog, 'Direct log with namespace "db-test" should be inserted into collection');
			assert.strictEqual(postDbLog.message, 'db here I come!');
		});
	});
});
