import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import updateFeedbackEndpoint from '#api/feedback/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/feedback/:feedbackId', () => {
	it('should mark feedback as read and return 204', async () => {
		await getDb().collection('feedback').insertOne({
			id: 'fb-mark',
			message: 'I like what you\'ve done with the place',
			read: false
		});

		const req = mockReq({
			params: { feedbackId: 'fb-mark' },
			body: { read: true },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateFeedbackEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const updated = await getDb().collection('feedback').findOne({ id: 'fb-mark' });
		assert.strictEqual(updated.read, true);
	});

	it('should reject when feedbackId is not found', async () => {
		const req = mockReq({
			params: { feedbackId: 'ghost-fb' },
			body: { read: true },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateFeedbackEndpoint.action(req, res),
			{ message: /"feedbackId" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when read is not a boolean', async () => {
		await getDb().collection('feedback').insertOne({
			id: 'fb-bool',
			message: 'Test message',
			read: false
		});

		const req = mockReq({
			params: { feedbackId: 'fb-bool' },
			body: { read: 'yes' },
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateFeedbackEndpoint.action(req, res),
			{ message: '"read" must be a boolean.' }
		);
		assert.strictEqual(getStatus(), 400);
	});
});
