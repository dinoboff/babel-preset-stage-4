/* eslint-disable import/no-dynamic-require */
import test from 'ava';
import proxyquire from 'proxyquire';

const {dependencies} = require('./package.json');
const v4 = require('./plugins/4.json');
const v6 = require('./plugins/6.json');
const v8 = require('./plugins/8.json');

const cjs = ['babel-plugin-transform-es2015-modules-commonjs'];

test('plugins are dependencies', t => {
	const set = new Set(Object.keys(dependencies));

	for (const plugin of v4) {
		t.true(set.has(plugin), `v4 plugin ${plugin}`);
	}

	for (const plugin of v6) {
		t.true(set.has(plugin), `v6 plugin ${plugin}`);
	}

	for (const plugin of v8) {
		t.true(set.has(plugin), `v8 plugin ${plugin}`);
	}

	for (const plugin of cjs) {
		t.true(set.has(plugin), `plugin ${plugin}`);
	}
});

test('plugins module transform plugin is configurable', t => {
	const buildPreset = require('./');

	for (const module of cjs) {
		const plugin = require(module);

		t.false(buildPreset({}, {modules: false}).plugins.some(p => p === plugin));

		t.true(buildPreset().plugins.some(p => p === plugin));
		t.true(buildPreset({}, {modules: 'commonjs'}).plugins.some(p => p === plugin));
	}
});

function buildsCorrectPreset(t, version, mapping) {
	const buildPreset = proxyquire('./', {
		'./plugins/best-match': proxyquire('./plugins/best-match', {
			process: {
				versions: {
					node: version
				}
			}
		})
	});

	const {plugins} = buildPreset({}, {modules: false});

	require(mapping).forEach((module, index) => {
		t.is(require(module), plugins[index], `${module} at index ${index}`);
	});
}
buildsCorrectPreset.title = (_, version) => `builds correct preset for Node.js ${version}`;

function computesCorrectPackageHash(t, version, mapping) {
	const expected = ['babel-plugin-transform-es2015-modules-commonjs']
		.concat(require(mapping))
		.map(module => require.resolve(`${module}/package.json`));

	t.plan(2);

	proxyquire('./package-hash', {
		'./plugins/best-match': proxyquire('./plugins/best-match', {
			process: {
				versions: {
					node: version
				}
			}
		}),
		'package-hash': {
			sync([preset, ...plugins]) {
				t.is(preset, require.resolve('./package.json'));
				t.deepEqual(plugins, expected);
			}
		}
	});
}
computesCorrectPackageHash.title = (_, version) => `computes correct package hash for Node.js ${version}`;

for (const [version, mapping] of [
	['4.7.2', './plugins/4.json'],
	['5.10.1', './plugins/4.json'],
	['6.9.4', './plugins/6.json'],
	['7.4.0', './plugins/6.json'],
	['8.0.0', './plugins/8.json']
]) {
	test([buildsCorrectPreset, computesCorrectPackageHash], version, mapping);
}
