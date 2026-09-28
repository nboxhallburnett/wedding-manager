import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import handle from '../../src/routes/index.js';
import { mockReq, mockRes } from '#test/setup';

describe('Web Route Handler', () => {
	it('should pass through to next() when request does not accept HTML', async () => {
		let nextCalled = false;
		const req = mockReq({
			headers: { accept: 'application/json' }
		});
		const { res } = mockRes();

		await handle(req, res, () => {
			nextCalled = true;
		});

		assert.strictEqual(nextCalled, true);
	});

	it('should set CSP and render index template when request accepts HTML', async () => {
		let nextCalled = false;
		const req = mockReq({
			headers: { accept: 'text/html' }
		});
		const { res, getRenderView, getRenderData, getHeaders } = mockRes();

		await handle(req, res, () => {
			nextCalled = true;
		});

		assert.strictEqual(nextCalled, false);

		const headers = getHeaders();
		assert.strictEqual(headers['cache-control'], 'no-store, no-cache, must-revalidate');
		assert.strictEqual(headers['x-content-type-options'], 'nosniff');
		assert.ok(headers['content-security-policy'].includes('default-src \'self\''));
		assert.ok(headers['content-security-policy'].includes('frame-ancestors \'none\''));

		const view = getRenderView();
		const locals = getRenderData();
		assert.strictEqual(view, 'index');
		assert.ok(locals.assetManifest);
		assert.strictEqual(typeof locals.nonce, 'string');
		assert.ok(locals.indexJs.includes(locals.nonce));
	});
});
