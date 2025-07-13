/** RSVP record */
type RSVP = {
	/** RSVP Identifier */
	id: String,
	/** Whether the RSVP holder has elevated access to the system */
	admin?: Boolean,
	/** Guests the RSVP relates to */
	guests: {
		/** Name of the guest */
		name: String,
		/** Attendance confirmation of the guest. 0: Pending | 1: Confirmed | 2: Tentative | 3: Declined */
		status: 0|1|2|3,
	}[]
}
