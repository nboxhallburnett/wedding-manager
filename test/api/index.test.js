import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Express from 'express';

import { init } from '#api/index';

describe('API Wire-up', () => {
	it('should mount API routes, apply cache-control headers, and handle 404s', async () => {
		const app = Express();
		app.use(Express.json());
		await init(app);

		const server = await new Promise(resolve => {
			const s = app.listen(0, '127.0.0.1', () => resolve(s));
		});
		const { port } = server.address();
		const baseUrl = `http://127.0.0.1:${port}`;

		try {
			// Test cache control headers on /api/
			const resAbout = await fetch(`${baseUrl}/api/about`);
			assert.strictEqual(resAbout.headers.get('cache-control'), 'no-store, no-cache, must-revalidate');
			assert.strictEqual(resAbout.headers.get('expires'), '0');

			// Test 404 on unknown /api/* route
			const res404 = await fetch(`${baseUrl}/api/destination-unknown`);
			assert.strictEqual(res404.status, 404);
			const data404 = await res404.json();
			assert.strictEqual(data404.success, false);
			assert.strictEqual(data404.description, 'Not Found');
		} finally {
			await new Promise(resolve => server.close(resolve));
		}
	});

	it('should enforce auth check and handle errors in registered actions', async () => {
		const app = Express();
		app.use(Express.json());

		// Middleware to inject ctx and session
		let adminReq = false;
		app.use((req, res, next) => {
			req.id = 'disp-test';
			req.ctx = { admin: adminReq, log: () => {} };
			req.session = { admin: adminReq };
			next();
		});

		await init(app);

		const server = await new Promise(resolve => {
			const s = app.listen(0, '127.0.0.1', () => resolve(s));
		});
		const { port } = server.address();
		const baseUrl = `http://127.0.0.1:${port}`;

		try {
			// Auth check failure
			adminReq = false;
			const resUnauthorized = await fetch(`${baseUrl}/api/menu`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Item' })
			});
			assert.strictEqual(resUnauthorized.status, 401);
			const dataUnauth = await resUnauthorized.json();
			assert.strictEqual(dataUnauth.success, false);
			assert.strictEqual(dataUnauth.description, 'Unauthorized');

			// Handled error with action-defined status code
			adminReq = true;
			const resHandled = await fetch(`${baseUrl}/api/calendar/nonexistent-event-id`);
			assert.strictEqual(resHandled.status, 404);
			const dataHandled = await resHandled.json();
			assert.strictEqual(dataHandled.success, false);
			assert.strictEqual(dataHandled.description, 'Not Found');
		} finally {
			await new Promise(resolve => server.close(resolve));
		}
	});
});
