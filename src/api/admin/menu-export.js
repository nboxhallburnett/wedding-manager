import invitationDb from '../../lib/db/invitations.js';
import menuItemDb from '../../lib/db/menu-items.js';
import seatingDb from '../../lib/db/seating.js';
import { adminAuth } from '../auth.js';

/** @type {API} */
export default {
	path: 'admin/menu-export',
	auth: adminAuth,
	action: async (req, res) => {
		const guestMap = {};
		// We never want to include admin users in the set
		const filter = { admin: { $ne: true } };
		const invitationsCursor = await invitationDb.find(filter);
		// Loop over the returned cursor and create a map of invitations by their ID for easy reference later
		for await (const invitation of invitationsCursor) {
			guestMap[invitation.id] = invitation;
		}
		// And now we can close the cursor
		invitationsCursor.close();

		const menuItemsCursor = await menuItemDb.find();
		const menuMap = {};
		// Loop over the returned cursor and create a map of menu items by their ID for easy reference later
		for await (const menuItem of menuItemsCursor) {
			menuMap[menuItem.id] = menuItem;
		}

		// Fetch the seating plan record
		const data = await seatingDb.findOne({}, { projection: { _id: 0 } });

		let out = [];
		let menuCounts = {};

		// If we're enriching the response, loop over each table
		for (const [ idx, table ] of Object.entries(data.tables)) {
			if (!Number(idx)) {
				out.push('Top Table');
			} else {
				out.push('');
				out.push(`Table ${idx}`);
			}
			out.push([
				'#',
				'Name',
				'',
				'Starter',
				'',
				'',
				'',
				'Main',
				'',
				'',
				'',
				'',
				'Dessert',
				'',
				'',
				'',
				'Dietary Requirement',
				'',
				'Additional Information'
			].join('\t'));
			// And each set of that table
			for (const [ idx, seat ] of Object.entries(table.guests)) {
				// And add the occupants name from the associated record of the stored invitation ID
				seat.name = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.name;
				const starter_id = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.starter_id;
				const main_id = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.main_id;
				const dessert_id = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.dessert_id;
				for (const id of [ starter_id, main_id, dessert_id ]) {
					if (id && id !== 'other') {
						menuCounts[id] ??= 0;
						menuCounts[id]++;
					}
				}

				seat.starter = menuMap[starter_id]?.title || 'NONE';
				seat.main = menuMap[main_id]?.title || 'NONE';
				seat.dessert = menuMap[dessert_id]?.title || 'NONE';
				seat.diet = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.diet;

				out.push([
					String(Number(idx) + 1),
					seat.name,
					'',
					seat.starter,
					'',
					'',
					'',
					seat.main,
					'',
					'',
					'',
					'',
					seat.dessert,
					'',
					'',
					'',
					seat.diet || '',
					'',
					seat.child ? `Child (Age ${guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.age})` : ''
				].map(item => item.trim().replaceAll('\n', '').replaceAll('\t', ' ')).join('\t'));
			}
		}
		out.push('');
		out.push('');
		out.push('Order Totals');

		const menuStats = { 0: [], 1: [], 2: [] };
		for (const [ id, count ] of Object.entries(menuCounts)) {
			menuStats[menuMap[id].course].push({ ...menuMap[id], count });
		}
		for (const [ idx, course ] of Object.entries([ 'Starter', 'Main', 'Dessert' ])) {
			idx && out.push('');
			out.push(course);
			out.push([
				'Counts',
				'Item',
				'Note'
			].join('\t'));
			const courseItems = menuStats[idx];
			courseItems.sort((a, b) => {
				if (a.child && !b.child) {
					return 1;
				}
				if (!a.child && b.child) {
					return -1;
				}
				if (a.hidden && !b.hidden) {
					return 1;
				}
				if (!a.hidden && b.hidden) {
					return -1;
				}
				if (a.title > b.title) {
					return 1;
				}
				if (a.title < b.title) {
					return -1;
				}
				return 0;
			});
			for (const item of courseItems) {
				out.push([
					item.count,
					item.title,
					[ item.child ? 'Children\'s menu' : '', item.hidden ? 'Dietary Selection' : ''].filter(Boolean).join(' ')
				].join('\t'));
			}
		}

		return res.send(out.join('\n'));
	}
};
