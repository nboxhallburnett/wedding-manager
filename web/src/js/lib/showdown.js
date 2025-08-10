import { dateFormatter } from './formatter';

const classMap = {
	table: 'table table-hover'
};

/**
 * A set of extensions that apply classes to specific element node types
 */
export const classExtensions = Object.keys(classMap).map(key => ({
	type: 'output',
	regex: new RegExp(`<${key}(.*)>`, 'g'),
	replace: `<${key} class="${classMap[key]}" $1>`
}));

/**
 * An extension to perform locale date formatting on defined content.
 * Use: `^^date yyyy-mm-dd`
 */
export const dateExtension = {
	type: 'lang',
	regex: /\^\^date \d{4}-\d{2}-\d{2}/g,
	replace: function(match) {
		// Get the date string from the match
		const date = new Date(match.substring(7));
		// If doesn't get a valid date, just return what was defined
		if (isNaN(date)) {
			return match.substring(7);
		}
		// Otherwise run it though the common date formatter
		return dateFormatter.format(date);
	}
};
