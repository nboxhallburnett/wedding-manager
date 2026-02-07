import { nanoid } from 'nanoid';

import telemetryDb from '../../lib/db/telemetry.js';

const viewportSizes = [
	'xs',
	'sm',
	'md',
	'lg',
	'xl',
	'xxl'
];

/** @type {API<{}, Telemetry} */
export default {
	method: 'post',
	path: 'telemetry',
	action: async (req, res) => {
		/** @type {Telemetry} */
		const event = {
			id: nanoid(),
			invitation: req.session.invitationId,
			created: new Date(),
			path: req.body.path,
			path_match: req.body.path_match,
			path_name: req.body.path_name,
			viewport: req.body.viewport
		};

		for (const field of [ 'path', 'path_match', 'path_name' ]) {
			// Ensure the field is defined as a string
			if (typeof event[field] !== 'string') {
				res.status(400);
				throw new Error(`"${field}" must be a string.`);
			}
		}

		// Ensure a valid viewport size was supplied
		if (!viewportSizes.includes(event.viewport)) {
			res.status(400);
			throw new Error('"viewport" contained an invalid value.');
		}

		// Insert the telemetry event
		await telemetryDb.insertOne(event);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
