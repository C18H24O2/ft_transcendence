// @ts-check

//For the translations
export function change_lang(value) {
	var current = getCookie('ft-lang');

	if (value !== current) {
		setCookie('ft-lang', value);
		location.reload();
	}
}

// @ts-ignore
window.change_lang = change_lang;

//My dumbass thought it reset the cookie, sources seem to say otherwise, put nothing in days to have it as a temporary cookie
/**
 * @param {string} name
 * @param {string | undefined} value
 * @param {number | undefined} [days]
 */
export function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; SameSite=Strict" + "; path=/";
}

/**
 * Gets a cookie by its name.
 * 
 * @param {string} name
 * @returns {string | null} 
 */
export function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}