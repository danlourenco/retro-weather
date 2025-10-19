import pkg from '../../package.json';

export function load() {
	return {
		version: pkg.version
	};
}
