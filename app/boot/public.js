var express = require('express');
var path = require('path');

module.exports = function _public(app) {
	var boot_dir = app.get('$boot_dir');
	app.use(express.static(path.join(boot_dir, '../public')));
};

