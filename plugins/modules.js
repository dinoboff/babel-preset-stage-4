'use strict';

const supported = {
	commonjs: 'babel-plugin-transform-es2015-modules-commonjs'
};

module.exports = function (options) {
	const modules = options && options.modules !== null ? options.modules : 'commonjs';

	if (modules === false) {
		return [];
	}

	const plugin = supported[modules];

	if (!plugin) {
		throw new Error('@ava/stage-4 only supports commonjs module transformation.');
	}

	return [plugin];
};

module.exports.supported = supported;
