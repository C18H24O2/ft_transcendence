from service_runtime.service import message
from service_runtime.models import User
from controller import validate_jwt, get_user_from_jwt, generate_jwt
from argon2 import PasswordHasher, exceptions as argon_exceptions
import peewee
from playhouse.shortcuts import model_to_dict
import re
from datetime import datetime, timezone
import pyotp
import sys

hasher = PasswordHasher(time_cost=10)
USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,32}$"


@message
def is_valid_token(token: str) -> bool:
	return validate_jwt(token)


@message
def get_user(token: str) -> dict:
    user = get_user_from_jwt(token)
    if user is None:
        return {"error": "invalid_token"}
    return model_to_dict(user)


@message
def register(username: str, password: str, totp_secret: str, totp_code: str) -> dict:

	if not re.fullmatch(USERNAME_PATTERN, username):
		return {"error": "invalid_username"}

	last_two_chars = username[-2:]
	if last_two_chars == "42":
		return {"error": "reserved_username"}

	if len(password) < 8 or len(password) > 255:
		return {"error": "invalid_password"}

	try:
		if User.select().where(User.username == username).exists():
			return {"error": "known_user"}
	except peewee.PeeweeException as e:
		print("register error:", e, file=sys.stderr)
		return {"error": "server_error"}

	totp = pyotp.TOTP(totp_secret)
	if not totp.verify(totp_code, valid_window=1):
		return {"error": "invalid_totp"}

	try:
		pwhash = hasher.hash(username + password)
		user = User.create(
			username=username,
			passwordHash=pwhash,
			totpSecret=totp_secret,
			registeredAt=datetime.now(timezone.utc),
			accountType=0 #that would be username + password account type
		)
		try:
			token = generate_jwt(user)
			return {"token": token}
		except Exception as e:
			user.delete_instance()
			raise e
	except Exception as e:
		print("register create error:", e, file=sys.stderr)
		return {"error": "server_error"}


@message
def login(username: str, password: str, totp_code: str) -> dict:
	# print(f"username: {username}", file=sys.stderr)
	# print(f"password: {password}", file=sys.stderr)
	# print(f"totp_code: {totp_code}", file=sys.stderr)

	try:
		user = User.get(User.username == username)
	except User.DoesNotExist:
		return {"error": "invalid_username"}
	except peewee.PeeweeException as e:
		print("login error:", e, file=sys.stderr)
		return {"error": "server_error"}

	try:
		hasher.verify(user.passwordHash, username + password)
	except argon_exceptions.VerifyMismatchError:
		return {"error": "invalid_password"}
	except argon_exceptions as e:
		print("login a2 error:", e, file=sys.stderr)
		return {"error": "server_error"}

	totp = pyotp.TOTP(user.totpSecret)
	if not totp.verify(totp_code, valid_window=1):
		return {"error": "invalid_totp"}

	token = generate_jwt(user);
	return {"token": token}


service_name = "auth-service"
