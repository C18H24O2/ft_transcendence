import butterup from 'butteruptoasts';
butterup.options.toastLife = 3000;

function loginWarn(message) {
	butterup.toast({
		title: 'Hey!',
		message: message,
		location: 'bottom-right',
		icon: true,
		dismissable: true,
		type: 'warning',
	});
}

function loginFailed(message) {
	butterup.toast({
		title: 'Error',
		message: message,
		location: 'bottom-right',
		icon: true,
		dismissable: true,
		type: 'error',
	});
}

function tryLogin(event) {
	event.preventDefault();
	let form = event.target;
	let username = form.username.value;
	let password = form.password.value;

	if (username == "" || password == "") {
		loginWarn("Please enter a valid username and password");
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
		}),
	}).then((response) => {
		if (response.status == 200) {
			window.location.href = "/";
		} else {
			loginFailed("Invalid username or password");
		}
	})
	.catch((error) => {
		loginFailed(error + "");
	});
}

try {
	let elem = document.getElementById("login-form");
	elem.onsubmit = tryLogin;
} catch (e) {
}
