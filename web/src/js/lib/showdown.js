const classMap = {
	table: 'table table-hover'
};

export const classExtensions = Object.keys(classMap).map(key => ({
	type: 'output',
	regex: new RegExp(`<${key}(.*)>`, 'g'),
	replace: `<${key} class="${classMap[key]}" $1>`
}));
