import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hostname } from 'os';

import findLogsEndpoint from '#api/admin/logs/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/admin/logs', () => {
	it('should return logs filtered by current hostname and sorted by created desc', async () => {
		const host = hostname();
		await getDb().collection('logs').insertMany([
			{ host, message: 'First log', created: new Date('2026-01-01T10:00:00Z') },
			{ host, message: 'Second log', created: new Date('2026-01-01T11:00:00Z') },
			{ host: 'other-host', message: 'Other log', created: new Date('2026-01-01T12:00:00Z') }
		]);

		const req = mockReq({
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await findLogsEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 2);
		assert.strictEqual(data.data[0].message, 'Second log');
		assert.strictEqual(data.data[1].message, 'First log');
		assert.strictEqual(data.data[0].host, undefined);
	});
});
