// @ts-check

import './theme.js';
import './lang.js';

import './shared.css';
import './butterup.css';

import 'htmx-ext-preload';
import './htmx-spa-tools.js';

import * as feather from 'feather-icons';
feather.replace({});

let intervals = [];

export function startInterval(callback, delay) {
	intervals.push(setInterval(callback, delay));
}
window.startInterval = startInterval;

export function stopInterval(callback) {
	for (const interval of intervals) {
		if (interval === callback) {
			clearInterval(interval);
			intervals.splice(intervals.indexOf(interval), 1);
		}
	}
}
window.stopInterval = stopInterval;

htmx.onLoad(() => {
	// Clear intervals
	for (const interval of intervals) {
		clearInterval(interval);
	}
	intervals = [];
});
