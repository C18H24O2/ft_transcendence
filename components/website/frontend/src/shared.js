// @ts-check

import './theme.js';
import './lang.js';

import './shared.css';
import './butterup.css';

import 'htmx-ext-preload';
import './htmx-spa-tools.js';

import * as feather from 'feather-icons';
feather.replace({});

const pageDataCache = new Map();
let lastLoadPath = undefined;

export function setupPage(ctor, dtor) {
	const path = window.location.pathname;
	pageDataCache[path] = [ctor, dtor];

	// console.log("[Pager] Registered PageData for", path);

	runConstructors();
}

function runConstructors() {
	let path = window.location.pathname;
	// console.log("[Pager] Running constructors");
	// console.log("[Pager] Current page", path);
	// console.log("[Pager] Last page", lastLoadPath);
	if (lastLoadPath !== path) {
		// console.log("[Pager] New page", path);
		const pageData = pageDataCache[path];
		if (pageData !== undefined) {
			lastLoadPath = path;
			const [ctor, dtor] = pageData;
			// console.log("[Pager] Running constructor for", path);
			ctor();
		}
	}
}

function runDestructors() {
	let path = window.location.pathname;
	let pageData = pageDataCache[path];
	if (pageData !== undefined) {
		lastLoadPath = undefined;
		const [ctor, dtor] = pageData;
		// console.log("[Pager] Running destructor for", path);
		dtor();
	}
}

document.addEventListener('htmx:afterSwap', runConstructors);
document.addEventListener('htmx:beforeSwap', runDestructors);
