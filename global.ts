type AttendanceStatus = {
	0: 'Pending',
	1: 'Confirmed'
	2: 'Tentative',
	3: 'Declined'
}

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
		/** Attendance confirmation of the guest for the wedding ceremony. */
		status_ceremony: keyof AttendanceStatus,
		/** Attendance confirmation of the guest for the wedding reception. */
		status_reception: keyof AttendanceStatus,
		/** Dietary requirement for the guest. Used if the defined menu does not cover their specific requirements */
		diet: String,
		/** ID of the menu item the guest has selected for their starter */
		starter_id: MenuItem['id'] | 'other',
		/** ID of the menu item the guest has selected for their main course */
		main_id: MenuItem['id'] | 'other',
		/** ID of the menu item the guest has selected for their dessert */
		dessert_id: MenuItem['id'] | 'other'
	}[],
	children: {
		/** Name of the child */
		name: String,
		/** Age of the child */
		age: Number,
		/** Dietary requirement for the child. Used if the defined menu does not cover their specific requirements */
		diet: String,
		/** ID of the menu item the child has selected for their starter */
		starter_id: MenuItem['id'] | 'other',
		/** ID of the menu item the child has selected for their main course */
		main_id: MenuItem['id'] | 'other',
		/** ID of the menu item the child has selected for their dessert */
		dessert_id: MenuItem['id'] | 'other'
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

/** Calendar event definition */
type CalendarEvent = {
	/** Event Identifier */
	id: String,
	/** Whether it is an all day event */
	allDay?: Boolean,
	/** The description to include in the body of the event */
	description: String,
	/** The date/time the event is scheduled to end */
	end?: Date
	/** Contact detail to mark as the event organizer */
	organizer: {
		/** Name to use as the event organizer */
		name: String,
		/** Email address to use for the event organizer */
		email: String
	},
	/** The date/time the event is scheduled to start */
	start: Date,
	/** The summary to use for the event */
	summary: String,
	/** The timezone the event is scheduled in. Defaults to UTC. E.g. `'Europe/London'` */
	timezone?: String,
	/** Configuration for the event location */
	location: {
		/** Name of the location for the generated calendar event */
		title: String,
		/** Address of the location for the generated calendar event */
		address: String,
		/** iCal geo radius. Used for generating Apple's `X-APPLE-STRUCTURED-LOCATION` */
		radius?: Number,
		/** Object containing the coordinates of the event location */
		geo?: {
			/** Latitude of the event location */
			lat: Number,
			/** Longitude of the event location */
			lon: Number
		}
	}
}

/** Definition of an item to display on the Q&A page */
type Question = {
	/** Title to use for the question */
	title: String,
	/** Answer to the question */
	answer: String
	/** Whether the answer should be rendered as markdown */
	markdown: Boolean
}

/** Definition of an item to display on the gallery page */
type Image = {
	/** Path to the image */
	path: String,
	/** Caption to show alongside the image */
	caption?: String
}
