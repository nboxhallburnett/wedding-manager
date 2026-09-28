import httpMocks from 'node-mocks-http';
import { db } from '#test/hooks';

/**
 * Get the test database instance for seeding/asserting.
 *
 * @returns {import('mongodb').Db}
 */
export function getDb() {
	return db;
}

/**
 * Create a mock Express request enriched with WeddingManagerRequest properties.
 *
 * @param {Object} [overrides] Properties to merge onto the request
 * @returns {import('../src/server.js').WeddingManagerRequest}
 */
export function mockReq(overrides = {}) {
	const req = httpMocks.createRequest(overrides);

	// WeddingManagerRequest extensions
	req.id ??= 'test-req-id';
	req.session ??= {};
	req.ctx ??= {};
	req.ctx.admin ??= false;
	req.ctx.log ??= () => {};
	req._ip ??= '127.0.0.1';

	// Apply any ctx overrides that were passed
	if (overrides.ctx) {
		Object.assign(req.ctx, overrides.ctx);
	}

	return req;
}

/**
 * Create a mock Express response that captures status codes and response data.
 *
 * @returns {{ res: import('express').Response, getStatus: () => number, getData: () => any, getHeaders: () => Object }}
 */
export function mockRes() {
	const res = httpMocks.createResponse();

	// Wrap json/send/render to capture data for assertions
	let data;
	let renderData;
	let renderView;
	const origJson = res.json.bind(res);
	const origSend = res.send.bind(res);
	const origRender = res.render.bind(res);
	const origEnd = res.end.bind(res);

	res.json = body => {
		data = body;
		return origJson(body);
	};
	res.send = body => {
		if (body !== undefined) {
			data = body;
		}
		return origSend(body);
	};
	res.render = (view, options, fn) => {
		renderView = view;
		renderData = options;
		return origRender(view, options, fn);
	};
	res.end = (chunk, encoding, cb) => {
		if (chunk !== undefined && typeof chunk !== 'function') {
			data = typeof chunk === 'string' ? chunk : chunk.toString();
		}
		return origEnd(chunk, encoding, cb);
	};

	return {
		res,
		getStatus: () => res.statusCode,
		getData: () => data ?? renderData,
		getRenderView: () => renderView ?? res._getRenderView?.(),
		getRenderData: () => renderData ?? res._getRenderData?.(),
		getHeaders: () => res.getHeaders()
	};
}
