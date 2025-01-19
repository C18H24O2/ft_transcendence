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
	console.dir(event);
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
		// if (attr.name === "hx-spa-current") {
		// 	return;
		// }
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
	const elem = htmlResponse.querySelector(target);
	if (!elem) {
		console.warn(`hx-spa-pick attribute '${target}' was not found.`);
		return;
	}

	// console.log("Request element:", requestElement);
	// const currentElements = document.querySelectorAll("[hx-spa-current]");
	// for (const elem of currentElements) {
	// 	elem.removeAttribute("hx-spa-current");
	// }
	// requestElement.setAttribute("hx-spa-current", "true");

	if (swapType === "innerHTML") {
		event.detail.serverResponse = elem.innerHTML;
	} else if (swapType === "outerHTML") {
		event.detail.serverResponse = elem.outerHTML;
	} else {
		console.warn("hx-swap attribute must be either 'innerHTML' or 'outerHTML'");
	}

	const head = document.querySelector("head");
	for (const elem of head.querySelectorAll("[x-ft-added]")) {
		elem.remove();
	}

	const injectedScripts = htmlResponse.querySelectorAll("script");
	let scriptHtml = "";
	for (const script of injectedScripts) {
		console.log("Injecting script tag: ", script.src);
		script.setAttribute("x-ft-added", "true");
		
		let newScript = document.createElement("script");
		for (const attr of script.attributes) {
			newScript.setAttribute(attr.name, attr.value);
		}
		newScript.innerHTML = script.innerHTML;
		head.appendChild(newScript);
	}
	const injectedModulePreloads = htmlResponse.querySelectorAll("link[rel='modulepreload']");
	for (const link of injectedModulePreloads) {
		console.log("Injecting module preload link: ", link.href);
		link.setAttribute("x-ft-added", "true");

		let newLink = document.createElement("link");
		for (const attr of link.attributes) {
			newLink.setAttribute(attr.name, attr.value);
		}
		newLink.href = link.href;
		head.appendChild(newLink);
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
