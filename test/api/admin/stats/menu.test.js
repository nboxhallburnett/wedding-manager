import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import menuStatsEndpoint from '#api/admin/stats/menu';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/admin/stats/menu', () => {
	it('should aggregate adult and child meal choices', async () => {
		await getDb().collection('invitations').insertMany([
			{
				guests: [
					{
						status_ceremony: 1, // confirmed
						starter_id: 'soup',
						main_id: 'steak',
						dessert_id: 'cake'
					},
					{
						status_ceremony: 0, // declined - should be excluded
						starter_id: 'soup',
						main_id: 'fish',
						dessert_id: 'cake'
					}
				],
				children: [
					{
						starter_id: 'child-soup',
						main_id: 'child-nuggets',
						dessert_id: 'ice-cream'
					}
				]
			}
		]);

		const req = mockReq({
			ctx: { admin: true }
		});
		const { res, getData } = mockRes();

		await menuStatsEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.adult.soup, 1);
		assert.strictEqual(data.data.adult.steak, 1);
		assert.strictEqual(data.data.adult.cake, 1);
		assert.strictEqual(data.data.child['child-nuggets'], 1);
	});
});
