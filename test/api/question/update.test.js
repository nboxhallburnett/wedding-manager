import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import updateEndpoint from '#api/question/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/question', () => {
	it('should update questions items and return 204', async () => {
		const req = mockReq({
			body: {
				items: [
					{ title: 'Dress code', answer: 'No, you write code!' }
				]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const doc = await getDb().collection('questions').findOne({});
		assert.strictEqual(doc.items.length, 1);
		assert.strictEqual(doc.items[0].title, 'Dress code');
	});
});
