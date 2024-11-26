
//For the translations
export function change_lang(value)
{
	console.log(value);
	var current = getCookie('ft-lang');

	if (value !== current)
	{
		setCookie('ft-lang', value);
		location.reload();
	}
}
window.change_lang = change_lang;

//My dumbass thought it reset the cookie, sources seem to say otherwise, put nothing in days to have it as a temporary cookie
function setCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

//get a cookie by name
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}