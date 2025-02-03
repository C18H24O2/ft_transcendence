function generateBase32Secret(n) {
    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    
    for (let i = 0; i < n; i++) {
        const randomIndex = Math.floor(Math.random() * base32Chars.length);
        secret += base32Chars[randomIndex];
    }
    
    return secret;
}

export function setupOauthButton() {
	let oauthButton = document.getElementById("oauth42-button");
	let state = generateBase32Secret(32);
	if (oauthButton) {                                //                     special case handled in website/service/main.py (because we know our stuff.)
		oauthButton.addEventListener("click", () => { //                                           vvvvvvvvvvvvvvvvv
			window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id={{@ oauth42.client_id @}}&redirect_uri=https%3A%2F%2Flocalhost%3A8043%2Fapi%2Fv1%2Fauth%2Foauth-callback&response_type=code&scope=public";
		});
	}
}
