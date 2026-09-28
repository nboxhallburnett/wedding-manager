import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import updateEndpoint from '#api/about/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/about', () => {
	it('should update about content and return 204', async () => {
		const req = mockReq({
			body: { content: 'New wedding about text.' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const doc = await getDb().collection('about').findOne({});
		assert.strictEqual(doc.content, 'New wedding about text.');
	});
});
