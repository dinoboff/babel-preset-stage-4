'use strict';
const packageHash = require('package-hash');
const determineModulesPlugin = require('./plugins/modules');

const plugins = Object.keys(determineModulesPlugin.supported)
	.map(k => determineModulesPlugin.supported[k])
	.concat(require('./plugins/best-match'))
	.map(module => require.resolve(`${module}/package.json`));

module.exports = packageHash.sync([require.resolve('./package.json')].concat(plugins));
