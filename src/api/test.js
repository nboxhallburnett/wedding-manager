module.exports = {
	path: 'test',
	action: (_req, res) => {
		return res.json({ success: true, data: { foo: 'bar' } });
	}
};
