import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findEndpoint from '#api/about/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/about', () => {
	it('should return about content when present', async () => {
		await getDb().collection('about').insertOne({
			content: 'About our wedding.'
		});

		const req = mockReq();
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.content, 'About our wedding.');
	});
});
