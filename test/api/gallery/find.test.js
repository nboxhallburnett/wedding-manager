import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findGalleryEndpoint from '#api/gallery/find';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/gallery', () => {
	it('should return gallery items', async () => {
		await getDb().collection('gallery').insertOne({
			items: [ { path: 'img1.jpg', title: 'Sunset' } ]
		});

		const req = mockReq({
			session: { invitationId: 'user1' }
		});
		const { res, getData } = mockRes();

		await findGalleryEndpoint.action(req, res);
		const data = getData();
		assert.strictEqual(data.success, true);
		assert.strictEqual(data.data.length, 1);
		assert.strictEqual(data.data[0].path, 'img1.jpg');
	});
});
