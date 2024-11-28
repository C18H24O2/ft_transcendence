import butterup from 'butteruptoasts';
butterup.options.toastLife = 3000;

function loginWarn(message) {
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

function loginFailed(message) {
	try {
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

function handleLoad() {
	try {
		const form = document.getElementById("login-form");
		form.onsubmit = tryLogin;
	} catch (e) {
	}
}

handleLoad();
htmx.onLoad(handleLoad);
