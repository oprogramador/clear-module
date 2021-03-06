'use strict';
const path = require('path');
const resolveFrom = require('resolve-from');
const callerPath = require('caller-path');

const clear = moduleId => {
	if (typeof moduleId !== 'string') {
		throw new TypeError(`Expected a \`string\`, got \`${typeof moduleId}\``);
	}

	const filePath = resolveFrom(path.dirname(callerPath()), moduleId);

	// Delete itself from module parent
	if (require.cache[filePath] && require.cache[filePath].parent) {
		let i = require.cache[filePath].parent.children.length;

		while (i--) {
			if (require.cache[filePath].parent.children[i].id === filePath) {
				require.cache[filePath].parent.children.splice(i, 1);
			}
		}
	}

	// Delete module from cache
	delete require.cache[filePath];
	Object.keys(require.cache).filter(key => new RegExp(moduleId).test(key)).forEach(key => {
		delete require.cache[key];
	});
};

clear.all = () => {
	for (const moduleId of Object.keys(require.cache)) {
		clear(moduleId);
	}
};

clear.match = regex => {
	for (const moduleId of Object.keys(require.cache)) {
		if (regex.test(moduleId)) {
			clear(moduleId);
		}
	}
};

module.exports = clear;
