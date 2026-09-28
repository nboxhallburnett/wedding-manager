import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import findOneGalleryEndpoint from '#api/gallery/find-one';
import { mockReq, mockRes } from '#test/setup';

describe('GET /api/gallery/*item_path', () => {
	it('should reject invalid path containing parent directory traversal with 404', async () => {
		const req = mockReq({
			params: { item_path: [ '..', 'secret.txt' ] },
			query: { type: 'jpeg' },
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => findOneGalleryEndpoint.action(req, res),
			err => err === 'Not Found'
		);
		assert.strictEqual(getStatus(), 404);
	});

	it('should reject unsupported image format with 400', async () => {
		const req = mockReq({
			params: { item_path: [ 'img', 'background.jpeg' ] },
			query: { type: 'gif' }, // unsupported
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => findOneGalleryEndpoint.action(req, res),
			{ message: /"type" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should resize and serve an allowed image type with caching headers', async () => {
		const req = mockReq({
			params: { item_path: [ 'img', 'background.jpeg' ] },
			query: { type: 'webp' },
			ctx: { log: () => {} }
		});
		const { res, getData, getHeaders } = mockRes();

		let responseType = '';
		res.type = t => {
			responseType = t;
		};

		await findOneGalleryEndpoint.action(req, res);

		assert.strictEqual(responseType, 'webp');
		const headers = getHeaders();
		assert.ok(headers['cache-control'].includes('private'));
		assert.strictEqual(headers['x-content-type-options'], 'nosniff');

		const buffer = getData();
		assert.ok(Buffer.isBuffer(buffer));
	});

	it('should return 404 when requested image does not exist on disk', async () => {
		const req = mockReq({
			params: { item_path: [ 'img', 'nonexistent-photo.jpeg' ] },
			query: { type: 'jpeg' },
			ctx: { log: () => {} }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => findOneGalleryEndpoint.action(req, res),
			err => err === 'Not Found'
		);
		assert.strictEqual(getStatus(), 404);
	});
});
