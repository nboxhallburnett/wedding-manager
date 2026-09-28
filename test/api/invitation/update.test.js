import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import updateEndpoint from '#api/invitation/update';
import { getDb, mockReq, mockRes } from '#test/setup';

describe('PUT /api/invitation/:invitationId', () => {
	beforeEach(async () => {
		// Seed menu items
		await getDb().collection('menu_items').insertMany([
			{ id: 'starter-1', course: 0, title: 'Soup', child: false },
			{ id: 'main-1', course: 1, title: 'Roast', child: false },
			{ id: 'dessert-1', course: 2, title: 'Cake', child: false },
			{ id: 'child-main-1', course: 1, title: 'Nuggets', child: true }
		]);

		// Seed initial invitation
		await getDb().collection('invitations').insertOne({
			id: 'inv-test-1',
			guests: [
				{ name: 'John Doe', status_ceremony: 0, status_reception: 0 }
			],
			children: [],
			songs: [],
			message: ''
		});
	});

	it('should successfully update guest RSVP details with valid selections', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				guests: [
					{
						name: 'John Doe',
						status_ceremony: 1,
						status_reception: 1,
						starter_id: 'starter-1',
						main_id: 'main-1',
						dessert_id: 'dessert-1',
						diet: 'Gluten-free'
					}
				],
				songs: [ 'Never Gonna Give You Up - Rick Astley' ],
				message: 'Looking forward to celebrating!'
			}
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const updated = await getDb().collection('invitations').findOne({ id: 'inv-test-1' });
		assert.strictEqual(updated.guests[0].status_ceremony, 1);
		assert.strictEqual(updated.guests[0].starter_id, 'starter-1');
		assert.strictEqual(updated.guests[0].diet, 'Gluten-free');
		assert.strictEqual(updated.songs[0], 'Never Gonna Give You Up - Rick Astley');
		assert.strictEqual(updated.message, 'Looking forward to celebrating!');
	});

	it('should reject modification by non-admin after RSVP deadline', async (t) => {
		t.mock.method(Date, 'now', () => new Date('2027-01-01').getTime());

		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { message: 'Late RSVP' }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /RSVP's cannot be modified after/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject non-admin modification if guest count changes', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			ctx: { admin: false },
			body: {
				guests: [
					{ name: 'John Doe' },
					{ name: 'Plus One' }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /Guest count cannot be modified/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reset guest status when name is blank', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				guests: [
					{ name: '' }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const updated = await getDb().collection('invitations').findOne({ id: 'inv-test-1' });
		assert.strictEqual(updated.guests[0].name, '');
		assert.strictEqual(updated.guests[0].status_ceremony, 0);
	});

	it('should reject invalid guest name type', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				guests: [
					{ name: 123 }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /Unsupported value: "123"/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject invalid guest status value', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				guests: [
					{ name: 'John Doe', status_ceremony: 42 }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /contained an invalid value: Unknown status value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject invalid guest reception status', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				guests: [
					{ name: 'John Doe', status_reception: -1 }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /contained an invalid value: Unknown status value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject invalid guest diet type', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				guests: [
					{ name: 'John Doe', diet: 999 }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /"guests\[0\].diet" contained an invalid value/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject unknown menu item', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				guests: [
					{ name: 'John Doe', starter_id: 'i-want-something-special' }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /contained an invalid value: Unknown menu item/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject "other" meal selection if dietary requirement is not specified', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				guests: [
					{ name: 'John Doe', starter_id: 'other' }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /A dietary requirement must be specified/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should reject when more than 5 children are added', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				children: [
					{ name: 'C1' }, { name: 'C2' }, { name: 'C3' },
					{ name: 'C4' }, { name: 'C5' }, { name: 'C6' }
				]
			}
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			{ message: /No more than 5 children can be added/ }
		);
		assert.strictEqual(getStatus(), 400);
	});

	it('should update children meals', async () => {
		const req = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: {
				children: [
					{ name: 'Little Timmy', age: 5, main_id: 'child-main-1', diet: 'None' },
					{ name: '' } // skipped
				]
			}
		});
		const { res, getStatus } = mockRes();

		await updateEndpoint.action(req, res);
		assert.strictEqual(getStatus(), 204);

		const updated = await getDb().collection('invitations').findOne({ id: 'inv-test-1' });
		assert.strictEqual(updated.children.length, 1);
		assert.strictEqual(updated.children[0].name, 'Little Timmy');
		assert.strictEqual(updated.children[0].main_id, 'child-main-1');
	});

	it('should reject invalid child attributes and meal selections', async () => {
		const badChildName = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { children: [ { name: 123 } ] }
		});
		const res1 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(badChildName, res1.res),
			{ message: /"children\[0\].name" contained an invalid value/ }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const badChildAge = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { children: [ { name: '"Kid"', age: 20 } ] }
		});
		const res2 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(badChildAge, res2.res),
			{ message: /Age must be a value between 0 and 17/ }
		);
		assert.strictEqual(res2.getStatus(), 400);

		const badChildDiet = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { children: [ { name: 'Kid', diet: 999 } ] }
		});
		const res3 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(badChildDiet, res3.res),
			{ message: /"children\[0\].diet" contained an invalid value/ }
		);
		assert.strictEqual(res3.getStatus(), 400);

		const badChildOther = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { children: [ { name: 'Kid', main_id: 'other' } ] }
		});
		const res4 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(badChildOther, res4.res),
			{ message: /A dietary requirement must be specified/ }
		);
		assert.strictEqual(res4.getStatus(), 400);

		const badChildUnknown = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { children: [ { name: 'Kid', main_id: 'unknown-dish' } ] }
		});
		const res5 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(badChildUnknown, res5.res),
			{ message: /Unknown menu item: "unknown-dish"/ }
		);
		assert.strictEqual(res5.getStatus(), 400);
	});

	it('should reject invalid messages', async () => {
		const notString = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { message: 12345 }
		});
		const res1 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(notString, res1.res),
			{ message: /Message must be a string/ }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const tooLong = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { message: 'a'.repeat(1025) }
		});
		const res2 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(tooLong, res2.res),
			{ message: /Message values must be 1024 characters or less/ }
		);
		assert.strictEqual(res2.getStatus(), 400);
	});

	it('should reject invalid songs recommendations', async () => {
		const notString = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { songs: [ 123 ] }
		});
		const res1 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(notString, res1.res),
			{ message: /Songs must be strings/ }
		);
		assert.strictEqual(res1.getStatus(), 400);

		const tooLong = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { songs: [ 'a'.repeat(101) ] }
		});
		const res2 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(tooLong, res2.res),
			{ message: /Song values must be 100 characters or less/ }
		);
		assert.strictEqual(res2.getStatus(), 400);

		const tooMany = mockReq({
			params: { invitationId: 'inv-test-1' },
			session: { invitationId: 'inv-test-1', admin: false },
			body: { songs: [ '1', '2', '3', '4', '5', '6' ] }
		});
		const res3 = mockRes();
		await assert.rejects(
			() => updateEndpoint.action(tooMany, res3.res),
			{ message: /Only five song recommendations allowed/ }
		);
		assert.strictEqual(res3.getStatus(), 400);
	});

	it('should throw 404 when invitation does not exist', async () => {
		const req = mockReq({
			params: { invitationId: 'nonexistent-invitation' },
			session: { invitationId: 'nonexistent-invitation', admin: false },
			body: { message: 'Hello' }
		});
		const { res, getStatus } = mockRes();

		await assert.rejects(
			() => updateEndpoint.action(req, res),
			err => err === 'Not Found'
		);
		assert.strictEqual(getStatus(), 404);
	});
});
