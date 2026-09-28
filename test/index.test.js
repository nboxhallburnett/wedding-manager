import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { start, stop } from '../src/index.js';
import config from '#conf';
import pkg from '../package.json' with { type: 'json' };

describe('Server Bootstrap', () => {
	let server;
	let baseUrl;

	before(async () => {
		// Listen on port 0 for an ephemeral port
		server = await start(0);
		const { port } = server.address();
		baseUrl = `http://${config.host}:${port}`;
	});

	after(async () => {
		await stop();
	});

	describe('GET /status', () => {
		it('should return server health status with version and uptime', async () => {
			const res = await fetch(`${baseUrl}/status`);
			assert.strictEqual(res.status, 200);

			const data = await res.json();
			assert.strictEqual(data.version, pkg.version);
			assert.strictEqual(typeof data.start_time, 'string');
			assert.strictEqual(typeof data.uptime, 'number');
		});
	});

	describe('Static assets', () => {
		it('should serve static files with cache headers and nosniff', async () => {
			const res = await fetch(`${baseUrl}/robots.txt`);
			assert.strictEqual(res.status, 200);
			assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
			assert.ok(res.headers.get('expires'));
		});
	});

	describe('Host validation', () => {
		it('should reject requests with an unsupported Host header', async () => {
			const res = await fetch(`${baseUrl}/api/about`, {
				headers: { 'x-forwarded-host': 'evil.attacker.com' }
			});
			assert.strictEqual(res.status, 400);

			const data = await res.json();
			assert.strictEqual(data.success, false);
			assert.strictEqual(data.description, 'Bad Request');
		});
	});

	describe('404 Fallback', () => {
		it('should return 404 JSON for unmatched API route when accepting json', async () => {
			const res = await fetch(`${baseUrl}/api/nonexistent-route`, {
				headers: { Accept: 'application/json' }
			});
			assert.strictEqual(res.status, 404);

			const data = await res.json();
			assert.strictEqual(data.success, false);
			assert.strictEqual(data.description, 'Not Found');
		});

		it('should return 404 JSON for unmatched non-API POST route when accepting json', async () => {
			const res = await fetch(`${baseUrl}/nonexistent-action`, {
				method: 'POST',
				headers: { Accept: 'application/json' }
			});
			assert.strictEqual(res.status, 404);

			const data = await res.json();
			assert.strictEqual(data.success, false);
			assert.strictEqual(data.description, 'Not Found');
		});

		it('should return 404 text for unmatched route when not accepting json or html', async () => {
			const res = await fetch(`${baseUrl}/some-random-file.bin`, {
				headers: { Accept: 'application/octet-stream' }
			});
			assert.strictEqual(res.status, 404);
			const text = await res.text();
			assert.strictEqual(text, 'Not Found');
		});
	});

	describe('Rate Limiting', () => {
		it('should rate limit unauthenticated API requests exceeding 10 per minute', async () => {
			let lastStatus = 200;
			// 10 requests are allowed, 11th should be 429
			for (let i = 0; i < 12; i++) {
				const res = await fetch(`${baseUrl}/api/about`);
				lastStatus = res.status;
				if (lastStatus === 429) {
					break;
				}
			}
			assert.strictEqual(lastStatus, 429);
		});
	});
});
