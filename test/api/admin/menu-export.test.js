import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import menuExportEndpoint from '#api/admin/menu-export';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('GET /api/admin/menu-export', () => {
	it('should generate tab-delimited export of seating and meal choices with sorting and multiple tables', async () => {
		await getDb().collection('invitations').insertMany([
			{
				id: 'inv-1',
				guests: [
					{
						name: 'Guest One',
						status_ceremony: 1,
						starter_id: 'm-starter-1',
						main_id: 'm-main-1',
						dessert_id: 'm-dessert',
						diet: 'Vegetarian'
					}
				],
				children: [
					{
						name: 'Kid One',
						age: 7,
						starter_id: 'm-starter-child',
						main_id: 'm-main-child',
						dessert_id: 'm-dessert-diet'
					}
				]
			},
			{
				id: 'inv-2',
				guests: [
					{
						name: 'Guest Two',
						starter_id: 'm-starter-2',
						main_id: 'm-main-2',
						dessert_id: 'm-dessert'
					}
				],
				children: []
			}
		]);

		await getDb().collection('menu_items').insertMany([
			{ id: 'm-starter-1', title: 'Leek & Potato Soup', course: 0, child: false, hidden: false },
			{ id: 'm-starter-2', title: 'Apple Salad', course: 0, child: false, hidden: false },
			{ id: 'm-starter-child', title: 'Tomato Soup', course: 0, child: true, hidden: false },
			{ id: 'm-main-1', title: 'Mushroom Risotto', course: 1, child: false, hidden: false },
			{ id: 'm-main-2', title: 'Beef Sirloin', course: 1, child: false, hidden: true },
			{ id: 'm-main-child', title: 'Chicken Tenders & Chips', course: 1, child: true, hidden: false },
			{ id: 'm-dessert', title: 'Apple Pie', course: 2, child: false, hidden: false },
			{ id: 'm-dessert-diet', title: 'Vegan Chocolate Cake', course: 2, child: false, hidden: true }
		]);

		await getDb().collection('seating').insertOne({
			tables: [
				{
					id: 'top-table',
					guests: [ { id: 'inv-1', idx: 0, child: false } ]
				},
				{
					id: 'table-2',
					guests: [
						{ id: 'inv-1', idx: 0, child: true },
						{ id: 'inv-2', idx: 0, child: false }
					]
				}
			]
		});

		const req = mockReq({
			ctx: { admin: true, log: () => {} }
		});
		const { res, getData } = mockRes();

		await menuExportEndpoint.action(req, res);

		const text = getData();
		assert.strictEqual(typeof text, 'string');
		assert.ok(text.includes('Top Table'));
		assert.ok(text.includes('Table 1'));
		assert.ok(text.includes('Guest One'));
		assert.ok(text.includes('Kid One'));
		assert.ok(text.includes('Child (Age 7)'));
		assert.ok(text.includes('Order Totals'));
		assert.ok(text.includes('Children\'s menu'));
		assert.ok(text.includes('Dietary Selection'));
	});
});
