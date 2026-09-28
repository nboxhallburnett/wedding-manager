import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import updateGalleryEndpoint from '#api/gallery/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/gallery', () => {
	it('should update gallery items and return 204', async () => {
		const req = mockReq({
			body: {
				items: [ { path: 'photo.jpg', title: 'Photo' } ]
			},
			ctx: { admin: true, log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await updateGalleryEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const doc = await getDb().collection('gallery').findOne({});
		assert.strictEqual(doc.items.length, 1);
		assert.strictEqual(doc.items[0].path, 'photo.jpg');
	});
});
