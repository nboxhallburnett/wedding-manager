import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import statsEndpoint from '#api/admin/stats/invitations';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/admin/stats/invitations', () => {
	it('should aggregate invitation stats correctly without telemetry query', async () => {
		await getDb().collection('invitations').insertMany([
			{
				id: 'inv-attending',
				login_count: 3,
				guests: [
					{ name: 'Alice', status_ceremony: 1, status_reception: 1 },
					{ name: '', status_ceremony: 0, status_reception: 0 } // unused plus-one
				],
				children: [ { name: 'Child A' } ],
				songs: [ 'Song 1', 'Song 2' ],
				message: 'Congratulations!'
			},
			{
				id: 'inv-declined',
				login_count: 1,
				guests: [
					{ name: 'Bob', status_ceremony: 0, status_reception: 0 }
				],
				children: [],
				songs: [],
				message: ''
			}
		]);

		const req = mockReq({
			query: {},
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await statsEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.unused_plus_one, 1);
		assert.strictEqual(data.data.total_children, 1);
		assert.strictEqual(data.data.total_logins, 4);
		assert.strictEqual(data.data.total_song_requests, 2);
		assert.strictEqual(data.data.total_messages, 1);
	});

	it('should include telemetry breakdown when telemetry query parameter is present', async () => {
		await getDb().collection('telemetry').insertMany([
			{ path_name: 'Home', viewport: 'lg' },
			{ path_name: 'Home', viewport: 'lg' },
			{ path_name: 'RSVP', viewport: 'sm' }
		]);

		const req = mockReq({
			query: { telemetry: 'true' },
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await statsEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.ok(data.data.telemetry);
		assert.strictEqual(data.data.telemetry.Home.count, 2);
		assert.strictEqual(data.data.telemetry.RSVP.count, 1);
	});
});
