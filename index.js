'use strict';
/* eslint-disable import/no-dynamic-require */
const determineModulesPlugin = require('./plugins/modules');

module.exports = (context, options) => {
	const plugins = determineModulesPlugin(options)
		.concat(require(`./plugins/best-match`))
		.map(module => require(module));

	return {plugins};
};
