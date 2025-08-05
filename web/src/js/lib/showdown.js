const classMap = {
	table: 'table table-hover',
	// h2: 'ui medium header',
	// ul: 'ui list',
	// li: 'ui item'
};

export const classExtensions = Object.keys(classMap).map(key => ({
	type: 'output',
	regex: new RegExp(`<${key}(.*)>`, 'g'),
	replace: `<${key} class="${classMap[key]}" $1>`
}));
