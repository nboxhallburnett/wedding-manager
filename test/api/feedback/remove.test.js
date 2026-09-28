import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import removeFeedbackEndpoint from '#api/feedback/remove';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('DELETE /api/feedback/:feedbackId', () => {
	it('should delete feedback by id and return 204', async () => {
		await getDb().collection('feedback').insertOne({
			id: 'fb-del',
			message: 'Delete me'
		});

		const req = mockReq({
			params: { feedbackId: 'fb-del' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await removeFeedbackEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const remaining = await getDb().collection('feedback').findOne({ id: 'fb-del' });
		assert.strictEqual(remaining, null);
	});

	it('should reject when feedbackId does not exist', async () => {
		const req = mockReq({
			params: { feedbackId: 'fb-who-dis' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => removeFeedbackEndpoint.action(req, res),
			{ message: /"feedbackId" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
