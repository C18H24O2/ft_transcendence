import { setupPage } from '/shared.js';

// console.log("Load vanilla", window.location.pathname);
// htmx.onLoad(function() {
// 	console.log("Load HTMX", window.location.pathname);
// });

setupPage(function() {
	console.log("The test page is loaded");
}, function() {
	console.log("The test page is unloaded");
});
