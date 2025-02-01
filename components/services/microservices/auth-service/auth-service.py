from service_runtime.service import message
from service_runtime.models import User
from controller import validate_jwt, generate_jwt
from argon2 import PasswordHasher, exceptions as argon_exceptions
import peewee
import re
from datetime import datetime, timezone
import pyotp

hasher = PasswordHasher(time_cost=10)


@message
def is_valid_token(token: str) -> bool:
	return validate_jwt(token)[0]


@message
def get_user(token: str) -> User:
	return validate_jwt(token)[1]


@message
def register(username: str, password: str, totp_secret: str, totp_code: str) -> dict:
	pattern = r"^[a-zA-Z0-9_-]{3,32}$"

	if not re.fullmatch(pattern, username):
		return  {"error": "invalid Username"}

	if len(password) < 8:
		return {"error": "Password is too short"}

	try:
		if User.select().where(User.username == username).exists():
			return {"error": "User already exists"}
	except peewee.PeeweeException as e:
		return {"error": "Server Error: " + str(e)}

	totp = pyotp.TOTP(totp_secret)
	if not totp.verify(totp_code, valid_window=1):
		return {"error": "invalid totp code"}

	try:
		pwhash = hasher.hash(username + password)
		user = User.create(
			username=username,
			passwordHash=pwhash,
			totpSecret=totp_secret,
			registeredAt=datetime.now(timezone.utc),
			accountType=0 #that would be username + password account type
		)
		token = generate_jwt(user)
		return {"token": token}
	except peewee.PeeweeException as e:
		return {"error": "Server Error: " + str(e)}


@message
def login(username: str, password: str, totp_code: str) -> dict:
	try:
		user = User.get(User.username == username)
	except User.DoesNotExist:
		return {"error" : "Invalid password or username"}
	except peewee.PeeweeException as e:
		return {"error": "Server Error: " + str(e)}

	try:
		hasher.verify(user.passwordHash, username + password)
	except argon_exceptions.VerifyMismatchError:
		return {"error": "Invalid password or username"}
	except argon_exceptions: 
		return {"error": "password verification error"}

	# TODO: install pyotp into the project
	totp = pyotp.TOTP(user.totpSecret)
	if not totp.verify(totp_code, valid_window=1):
		return {"error": "invalid totp code"}

	token = generate_jwt(user);
	return {"token": token}


service_name = "auth-service"
