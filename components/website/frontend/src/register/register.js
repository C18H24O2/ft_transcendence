import '../shared.js';
import { authenticator } from 'otplib';

const issuer = "ft_trans";
let secret;

function generateQR(username)
{
	const otpAuthUrl = authenticator.keyuri(username, issuer, secret);
	//TODO: generate qrcode
}

function ctor()
{
	secret = authenticator.generateSecret(20);
}

function dtor()
{

}

setupPage(ctor, dtor)