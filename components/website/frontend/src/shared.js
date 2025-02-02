// @ts-check

import './theme.js';
import './lang.js';

import './shared.css';
import './butterup.css';

import 'htmx-ext-preload';
import './htmx-spa-tools.js';

import './chat/chat.css';
import './chat/chat.js';

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

/**
 * patching the fact that htmx for some reason decided that reloading history from local cache should be default behavior
 * so here we are
*/
function restoreBehavior()
{
	let path = window.location.pathname;

	if (path === lastLoadPath)
		return;
	const pageDataDestroy = pageDataCache[lastLoadPath];
	if (pageDataDestroy !== undefined)
	{
		// console.log("[Pager] Running destructor for", lastLoadPath);
		lastLoadPath = undefined;
		const [ctor, dtor] = pageDataDestroy;
		dtor();
	}
	const pageData = pageDataCache[path];
	if (pageData !== undefined)
	{
		// console.log("[Pager] Running constructor for ", path);
		lastLoadPath = path;
		const [ctor, dtor] = pageData;
		ctor();
	}
}

document.addEventListener('htmx:afterSwap', runConstructors);
document.addEventListener('htmx:beforeSwap', runDestructors);
document.addEventListener('htmx:historyRestore', restoreBehavior);