// @ts-check

import { setupOauthButton } from "../oauth42.js";
import butterup from 'butteruptoasts';
import { setupPage } from "../shared.js";
butterup.options.toastLife = 3000;
import QRCode from "qrcode"
import { setCookie } from "../lang.js"; // at the club, straight up setting it, and by it well, jet slut say...., my cookits:)

let error_messages = {
	"empty_fields": "{{@ register.error.empty_fields @}}",
	"invalid_username": "{{@ register.error.invalid_username @}}",
	"known_user": "{{@ register.error.known_user @}}",
	"invalid_password": "{{@ register.error.invalid_password @}}",
	"invalid_totp": "{{@ register.error.invalid_totp @}}",
	"server_error": "{{@ register.error.server_error @}}",
	"unknown_error": "{{@ register.error.unknown_error @}}"
};

/**
 * @param {number} n The number of bytes
 */
function generateBase32Secret(n) {
    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    
    for (let i = 0; i < n; i++) {
        const randomIndex = Math.floor(Math.random() * base32Chars.length);
        secret += base32Chars[randomIndex];
    }
    
    return secret;
}

/**
 * Credits:
 * - my dad
 * - my mom
 * - liam's dad
 * - chat gippity
 * - pas doc
 * - doc
 * - le père de doc
 * - @sandoct la ref tavu
 * - pas maud mais genre vraiment pas
 * 
 * 
 * 
 * 
 * 
 * - cristophe car c'est le meilleur!!!!
 * 
 * @param {string} accountName
 * @param {string} secret
 */
function generateOtpAuthUri(accountName, secret) {
    const issuer = "ft_trans";
    return `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
}

let totpSecret = generateBase32Secret(20);

/**
 * @param {string} message
 */
function warn(message) {
	try {
		butterup.toast({
			title: 'Hey!',
			message: message,
			location: 'bottom-right',
			icon: true,
			dismissable: true,
			type: 'warning',
		});
	} catch (e) {
		// Fuck you and your error logging. why? because i said so.
		//                                     - Xavier Niel, probablement.
	}
}

/**
 * @param {string} message
 */
function failed(message) {
	try {
		if (!(message in error_messages)) {
			message = "unknown_error"
		}
		message = error_messages[message];

		butterup.toast({
			title: 'Error',
			message: message,
			location: 'bottom-right',
			icon: true,
			dismissable: true,
			type: 'error',
		});
	} catch (e) {
	}
}

/**
 * @param {{ preventDefault: () => void; target: any; }} event
 */
function tryRegister(event) {
	event.preventDefault();

	let form = event.target;
	let username = form.username.value;
	let password = form.password.value;
	let totpCode = form.totpCode.value;

	if (username === "" || password === "" || totpCode === "") {
		warn("{{@ register.error.empty_fields @}}");
		return;
	}

	fetch("/api/v1/auth/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: username,
			password: password,
			totp_secret: totpSecret,
			totp_code: totpCode,
		}),
	})
	.then((response) => response.json())
	.then((data) => {
		// console.log(data);
		if ("error" in data) {
			failed(data.error);
		} else if ("token" in data) {
			// YIPPIEEEEEEEEEEEEEEEEEEEEEEEE (autism reference)
			setCookie("x-ft-tkn", data.token, 30);
			window.location.href = "/";
		} else {
			failed("unknown_error");
		}
	})
	.catch((error) => {
		failed(error);
	});
}

function handleLoad() {
	try {
		setupOauthButton();
		totpSecret = generateBase32Secret(20);

		const qrCanvas = document.getElementById("qr-canvas");
		if (qrCanvas) {
			let uri = generateOtpAuthUri("le pongeur", totpSecret);
			QRCode.toCanvas(qrCanvas, uri, (/** @type {any} */ e) => {
				console.log("The totp uri is " + uri);
				if (e) {
					console.log("Failed to create the QR code, oh well, good luck :3");
					console.log("debugging info that you definitely should NOT read: " + e);
					// this is not console errors fuck you doc
				}
			});
		}

		const form = document.getElementById("register-form");
		if (form) {
			form.onsubmit = tryRegister;
		}
	} catch (e) {
	}
}

setupPage(handleLoad, () => {});
