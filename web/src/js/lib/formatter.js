/**
 * Formats an events display date/time
 *
 * @param {CalendarEvent} event
 * @returns {String}
 */
export function formatEventDate(event) {
	const start = new Date(event.start);
	const end = new Date(event.end);

	// If the event is all day then just show the date
	if (event.allDay) {
		return start.toLocaleDateString();
	}

	// If the start and end dates are on the same day, only show the date once
	if (start.toLocaleDateString() === end.toLocaleDateString()) {
		return `${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
	}

	// Otherwise show the start and end as full datetime strings
	return `${start.toLocaleString()} - ${end.toLocaleString()}`;
}

// Formatter to make displayed date appropriately formatted for the users locale
export const dateFormatter = new Intl.DateTimeFormat(undefined, {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
	timezone: 'UTC'
});
