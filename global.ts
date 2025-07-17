/** Invitation record */
type Invitation = {
	/** Invitation Identifier */
	id: String,
	/** Date the invitation was created */
	created: Date,
	/** Date the invitation was last updated */
	updated: Date,
	/** Number of times the invitation has accessed the application */
	login_count: Number,
	/** Whether the Invitation holder has elevated access to the system */
	admin?: Boolean,
	/** Guests the Invitation relates to */
	guests: {
		/** Name of the guest */
		name: String,
		/** Attendance confirmation of the guest. 0: Pending | 1: Confirmed | 2: Tentative | 3: Declined */
		status: 0|1|2|3,
		/** ID of the menu item the guest has selected for their starter */
		starter_id: MenuItem['id'],
		/** ID of the menu item the guest has selected for their main course */
		main_id: MenuItem['id'],
		/** ID of the menu item the guest has selected for their dessert */
		dessert_id: MenuItem['id']
	}[],
	children: {
		/** Name of the child */
		name: String,
		/** Age of the child */
		age: Number,
		/** ID of the menu item the child has selected for their starter */
		starter_id: MenuItem['id'],
		/** ID of the menu item the child has selected for their main course */
		main_id: MenuItem['id'],
		/** ID of the menu item the child has selected for their dessert */
		dessert_id: MenuItem['id']
	}[],
	/** Message from the Invitation recipient(s) */
	message: String,
	/** Songs the Invitation recipient(s) suggested for the reception */
	songs: String[]
}

/** Menu item definition */
type MenuItem = {
	/** Item Identifier */
	id: String,
	/** Date the item was defined */
	created: Date,
	/** Date the item was last updated */
	updated: Date,
	/** Whether the item is on the children's menu */
	child: Boolean,
	/** Course the item is applicable to. 0: Starter | 1: Main | 2: Dessert */
	course: Number,
	/** Title of the menu item */
	title: String,
	/** Description of the menu item */
	description: String,
	/** Whether the menu item is vegan */
	vegan: Boolean,
	/** Whether the menu item is vegetarian */
	vegetarian: Boolean,
	/** Whether the menu item is gluten free */
	gluten_free: Boolean
}
