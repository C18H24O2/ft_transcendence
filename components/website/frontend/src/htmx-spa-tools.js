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
    for (const attr of requestElement.attributes) {
        if (attr.name === "hx-spa-pick") {
            target = attr.value;
            break;
        }
    }
    if (target === undefined) {
        console.error("Found hx-spa-pick attribute with undefined target on:", requestElement)
        return;
    }
    const parser = new DOMParser();
    const htmlResponse = parser.parseFromString(serverResponse, 'text/html');
    const elem = htmlResponse.querySelector(target);
    if (!elem) {
        console.error(`hx-spa-pick attribute '${target}' was not found.`);
        return;
    }
    event.detail.serverResponse = elem.innerHTML;
}

function preventDoubleHistorySave(event) {
    const path = event?.detail?.path;
    const currentPath = window.location.pathname;
    // console.log(`wanting to change from '${currentPath}' to '${path}'`);
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
    console.log(name, event);
    if (name === "htmx:beforeSwap") {
        handleBeforeSwap(event);
    }
    if (name === "htmx:beforeHistorySave") {
        return preventDoubleHistorySave(event);
    }
    return true;
}

htmx.defineExtension('spa-tools', {
    onEvent: spaHandleEvent,
});