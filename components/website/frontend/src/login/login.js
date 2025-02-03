import { setupOauthButton } from "../oauth42.js";
import butterup from 'butteruptoasts';
import { setupPage } from "../shared.js";
butterup.options.toastLife = 3000;
import { setCookie } from '../lang.js';

let error_messages = {
	"empty_fields": "{{@ login.error.empty_fields @}}",
	"invalid_username": "{{@ login.error.invalid_username @}}",
	"known_user": "{{@ login.error.known_user @}}",
	"invalid_password": "{{@ login.error.invalid_password @}}",
	"invalid_totp": "{{@ login.error.invalid_totp @}}",
	"server_error": "{{@ login.error.server_error @}}",
	"unknown_error": "{{@ login.error.unknown_error @}}",
	"ft_api_error": "{{@ login.error.42_error @}}"
};

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

function tryLogin(event) {
	event.preventDefault();

	let form = event.target;
	let username = form.username.value;
	let password = form.password.value;
	let totpCode = form.totpCode.value;

	if (username === "" || password === "" || totpCode === "") {
		warn("{{@ login.error.empty_fields @}}");
		return;
	}

	fetch("/api/v1/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: username,
			password: password,
			totp_code: totpCode,
		}),
	})
	.then((response) => response.json())
	.then((data) => {
		console.log(data);
		if ("error" in data) {
			failed(data.error);
		} else if ("token" in data) {
			// YIPPIEEEEEEEEEEEEEEEEEEEEEEEE
			setCookie("x-ft-tkn", data.token, 30);
			window.location.href = "/";
		} else {
			failed("unknown_error");
		}
	})
	.catch((error) => {
		failed(error + "");
	});
}

function handleLoad() {
	try {
		// If we came from a redirection (42 oauth callback), check for an error
		// in the query params.
		const urlParams = new URLSearchParams(window.location.search);
		const error = urlParams.get("error");
		if (error) {
			failed(error);
		}
	} catch (e) {
	}
	try {
		setupOauthButton();
		const form = document.getElementById("login-form");
		if (form) {
			form.onsubmit = tryLogin;
		}
	} catch (e) {
	}
}

setupPage(handleLoad, () => {});
