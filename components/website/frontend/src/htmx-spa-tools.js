/**
 * Copyright (c) 2024  kiroussa <ft@xtrm.me> 
 *
 * This file is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * Handler for `hx-spa-pick`, which allows to only select part of the requested content to swap.
 * 
 * @param {Event} event 
 */
function handleBeforeSwap(event) {
	/** @type {Element} */
	const requestElement = event?.detail?.requestConfig?.elt;
	if (!requestElement) {
		return;
	}
	/** @type {String} */
	const serverResponse = event?.detail?.serverResponse;
	if (!serverResponse) {
		return ;
	}
	/** @type {String} */
	let target = undefined;
	let swapType = undefined;
	for (const attr of requestElement.attributes) {
		if (attr.name === "hx-spa-pick") {
			target = attr.value;
		}
		if (attr.name === "hx-swap") {
			swapType = attr.value;
		}
	}
	if (target === undefined) {
		console.warn("Found hx-spa-pick attribute with undefined target on:", requestElement)
		return;
	}
	const parser = new DOMParser();
	const htmlResponse = parser.parseFromString(serverResponse, 'text/html');
	const injectedScripts = htmlResponse.querySelectorAll("script");
	const elem = htmlResponse.querySelector(target);
	if (!elem) {
		console.warn(`hx-spa-pick attribute '${target}' was not found.`);
		return;
	}
	let scriptHtml = "";
	for (const script of injectedScripts) {
		console.log("Injecting script tag: ", script.src);
		scriptHtml += script.outerHTML;
	}
	if (swapType === "innerHTML") {
		event.detail.serverResponse = elem.innerHTML + scriptHtml;
	} else if (swapType === "outerHTML") {
		event.detail.serverResponse = elem.outerHTML + scriptHtml;
	} else {
		console.warn("hx-swap attribute must be either 'innerHTML' or 'outerHTML'");
	}
}

function preventDoubleHistorySave(event) {
	const path = event?.detail?.path;
	const currentPath = window.location.pathname;
	console.log(`wanting to change from '${currentPath}' to '${path}'`);
	return (path !== currentPath);
}

/**
 * Handles the HTMX events
 * 
 * @param {String} name 
 * @param {Event} event 
 * 
 * @returns {boolean} Whether this event should fire
 */
function spaHandleEvent(name, event) {
	console.log("Handling event:", name);
	if (name === "htmx:beforeSwap") {
		handleBeforeSwap(event);
	}
	if (name === "htmx:beforeHistorySave") {
		return preventDoubleHistorySave(event);
	}
	return true;
}

// @ts-ignore
htmx.defineExtension('spa-tools', {
	onEvent: spaHandleEvent,
});
