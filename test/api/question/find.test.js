import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findEndpoint from '#api/question/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/question', () => {
	it('should return questions array', async () => {
		await getDb().collection('questions').insertOne({
			questions: [
				{ question: 'Is parking available?', answer: 'Yes, on site, and plenty of it.' }
			]
		});

		const req = mockReq();
		const { res, getData } = mockRes();

		await findEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.questions.length, 1);
		assert.strictEqual(data.data.questions[0].question, 'Is parking available?');
	});
});
