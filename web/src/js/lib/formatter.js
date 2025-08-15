const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, {
	numeric: 'auto'
});

// Formatter to make displayed date appropriately formatted for the users locale
export const dateFormatter = new Intl.DateTimeFormat(undefined, {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC'
});

/**
 * Escapes a string to ensure it is safe from XSS when used directly in html
 *
 * @param {String} string string to escape
 * @returns {String}
 */
export function escapeHtml(string) {
	const div = document.createElement('div');
	div.textContent = string;
	return div.innerHTML;
}

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

/**
 * Formats a date to a relative time string appropriate for the users locale
 *
 * @param {Date|Number} _date Date to format
 * @returns {String}
 */
export function fromNow(_date) {
	let date = _date;
	if (!(date instanceof Date)) {
		date = new Date(date);
	}
	if (isNaN(date)) {
		console.warn('Invalid date provided', _date);
		return '';
	}

	const diffInSeconds = (Date.now() - date) / 1000;
	const absDiffInSeconds = Math.abs(diffInSeconds);
	let unit;
	let value;

	// Less than a minute, use seconds
	if (absDiffInSeconds < 60) {
		unit = 'second';
		value = Math.round(diffInSeconds / 1000);

	// Less than an hour, use minutes
	} else if (absDiffInSeconds < (60 * 60)) {
		unit = 'minute';
		value = Math.round(diffInSeconds / 60);

	// Less than a day, use hours
	} else if (absDiffInSeconds < (24 * 60 * 60)) {
		unit = 'hour';
		value = Math.round(diffInSeconds / (60 * 60));

	// Less than a week, use days
	} else if (absDiffInSeconds < (7 * 24 * 60 * 60)) {
		unit = 'day';
		value = Math.round(diffInSeconds / (24 * 60 * 60));

	// Less than a month, use weeks
	} else if (absDiffInSeconds < (30 * 24 * 60 * 60)) {
		unit = 'week';
		value = Math.round(diffInSeconds / (7 * 24 * 60 * 60));

	// Less than a year, use months
	} else if (absDiffInSeconds < (365 * 24 * 60 * 60)) {
		unit = 'month';
		value = Math.round(diffInSeconds / (30 * 24 * 60 * 60));

	// Over a year, use years
	} else {
		unit = 'year';
		value = Math.round(diffInSeconds / (365 * 24 * 60 * 60));
	}

	return relativeTimeFormatter.format(value * -1, unit);
}

/** Map of display status messages for the stored `status_ceremony` and `status_reception` enum values */
export const statusMessages = [
	'Pending',
	'Attending',
	'Tentative',
	'Not Attending'
];
