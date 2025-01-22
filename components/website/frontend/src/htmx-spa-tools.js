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
		console.log("Found hx-spa-pick attribute with undefined target on:", requestElement)
		return;
	}
	const parser = new DOMParser();
	const htmlResponse = parser.parseFromString(serverResponse, 'text/html');
	const injectedScripts = htmlResponse.querySelectorAll("script");
	const elem = htmlResponse.querySelector(target);
	if (!elem) {
		console.log(`hx-spa-pick attribute {target}' was not found.`);
		return;
	}
	const scripts = [];
	for (const script of injectedScripts) {
		// console.log("Injecting script tag: ", script.src);
		let newNode = document.createElement("script");
		for (const attr of script.attributes) {
			newNode.setAttribute(attr.name, attr.value);
		}
		newNode.setAttribute("x-ft-injected", "true");
		newNode.textContent = script.textContent;
		scripts.push(newNode);
	}
	if (swapType === "innerHTML") {
		event.detail.serverResponse = elem.innerHTML;
	} else if (swapType === "outerHTML") {
		event.detail.serverResponse = elem.outerHTML;
	} else {
		console.log("hx-swap attribute must be either 'innerHTML' or 'outerHTML'");
	}
	for (const toRemove of document.querySelectorAll("[x-ft-injected]")) {
		toRemove.remove();
	}
	for (const tag of scripts) {
		document.head.appendChild(tag);
	}
}

function preventDoubleHistorySave(event) {
	const path = event?.detail?.path;
	const currentPath = window.location.pathname;
	// console.log(`wanting to change from '${currentPath}' to '${path}'`);
	return (path !== currentPath);
}

function cancelDoubleReq(event) {
	const pathTarget = event?.detail?.path;
	// console.log("pathTarget:", pathTarget);
	// console.log("Event:", event);
	if (pathTarget) {
		const currentPath = window.location.pathname;
		// console.log(`wanting to change from '${currentPath}' to '${pathTarget}'`);
		if (pathTarget === currentPath) {
			// console.log("canceling");
			event.preventDefault();
			return false;
		}
	}
	return true;
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
	// console.log(name, event);
	if (name === "htmx:confirm") {
		return cancelDoubleReq(event);
	}
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
