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
	}[],
	/** Message from the Invitation recipient(s) */
	message: String,
	/** Songs the Invitation recipient(s) suggested for the reception */
	songs: String[]
}
