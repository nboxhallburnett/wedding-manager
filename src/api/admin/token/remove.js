import { ObjectId } from 'mongodb';

import tokenDb from '../../../lib/db/tokens.js';

/** @type {API<TokenPath} */
export default {
	method: 'delete',
	path: 'admin/token/:tokenId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		// Validate the token exists. We use the mongo document ID here rather than the token `id` value.
		const token = await tokenDb.findOne({ _id: new ObjectId(req.params.tokenId) });
		if (!token) {
			res.status(400);
			throw new Error('"tokenId" contained an invalid value');
		}

		req.ctx.log('Removing auth token "%s"', token.name);

		// Remove the record from the collection
		await tokenDb.deleteOne({ _id: token._id });

		// No need to return any data on successful removal
		return res.status(204).send();
	}
};
