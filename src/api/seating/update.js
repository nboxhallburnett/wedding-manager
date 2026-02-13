import seatingDb from '../../lib/db/seating.js';
import { adminAuth } from '../auth.js';

/** @type {API<{}, DiningRoom>} */
export default {
	method: 'put',
	path: 'seating',
	auth: adminAuth,
	action: async (req, res) => {
		const tables = req.body.tables;
		if (!Array.isArray(tables)) {
			res.status(400);
			throw new Error('"tables" contained an invalid value: Tables must be an array');
		}
		for (const [ idx, table ] of tables.entries()) {
			if (Object.prototype.hasOwnProperty.call(table, 'id') && typeof table.id !== 'string') {
				res.status(400);
				throw new Error(`"tables[${idx}].id" contained an invalid value: Tables must contain an ID`);
			}
			if (Object.prototype.hasOwnProperty.call(table, 'x') && typeof table.x !== 'number' && table.x < 0) {
				res.status(400);
				throw new Error(`"tables[${idx}].x" contained an invalid value: Unsupported value "${table.x}"`);
			}
			if (Object.prototype.hasOwnProperty.call(table, 'y') && typeof table.y !== 'number' && table.y < 0) {
				res.status(400);
				throw new Error(`"tables[${idx}].y" contained an invalid value: Unsupported value "${table.y}"`);
			}
			if (Object.prototype.hasOwnProperty.call(table, 'rotation') && typeof table.rotation !== 'number' && (table.rotation < 0 || table.rotation > 360)) {
				res.status(400);
				throw new Error(`"tables[${idx}].rotation" contained an invalid value: Unsupported value "${table.rotation}"`);
			}
			if (!Array.isArray(table.guests)) {
				res.status(400);
				throw new Error(`"tables[${idx}].guests" contained an invalid value: Table guest content must be an array`);
			}
			for (const [ chairIdx, occupant ] of (table.guests || []).entries()) {
				// Verify the id contains a valid string
				if (Object.prototype.hasOwnProperty.call(occupant, 'id') && typeof occupant.id !== 'string') {
					res.status(400);
					throw new Error(`"tables[${idx}].guests[${chairIdx}].id" contained an invalid value: Unsupported value: "${occupant.id}"`);
				}
				// Verify the idx contains a valid number
				if (Object.prototype.hasOwnProperty.call(occupant, 'idx') && typeof occupant.idx !== 'number' || occupant.idx < 0) {
					res.status(400);
					throw new Error(`"tables[${idx}].guests[${chairIdx}].idx" contained an invalid value: Unsupported value: "${occupant.idx}"`);
				}
				// Verify 'child' contains a boolean
				if (Object.prototype.hasOwnProperty.call(occupant, 'child') && typeof occupant.child !== 'boolean') {
					res.status(400);
					throw new Error(`"tables[${idx}].guests[${chairIdx}].child" contained an invalid value: Unsupported value: "${occupant.child}"`);
				}
			}
		}

		// Verify the room ratio is valid
		if (req.body.ratio < 0 || req.body.ratio > 5 || typeof req.body.ratio !== 'number') {
			res.status(400);
			throw new Error(`"ratio" contained an invalid value: "${req.body.ratio}"`);
		}

		// Verify the table scale is valid
		if (req.body.scale < 0 || req.body.scale > 1.5 || typeof req.body.scale !== 'number') {
			res.status(400);
			throw new Error(`"scale" contained an invalid value: "${req.body.scale}"`);
		}

		req.ctx.log('Updating seating plan');
		await seatingDb.updateOne({}, { $set: {
			ratio: req.body.ratio || 1,
			scale: req.body.scale || 1,
			tables,
			updated: new Date()
		} }, { upsert: true });

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
