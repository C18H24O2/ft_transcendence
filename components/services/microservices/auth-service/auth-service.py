from service_runtime.service import message
from service_runtime.models import User
from controller import validate_jwt
from argon2 import PasswordHasher
import peewee
import re

hasher = PasswordHasher(time_cost=10)


@message
def is_valid_token(token: str) -> bool:
    return validate_jwt(token)[0]


@message
def get_user(token: str) -> User:
    return validate_jwt(token)[1]


@message
def register(username: str, password: str, totp_secret: str, totp_code: str) -> dict:
	# TODO: validate username, password, token&code (size, format, etc)
	pattern = r"^[a-zA-Z0-9_-]{3,32}$"

	if not bool(re.fullmatch(pattern, username)):
		return  #Username is invalid TODO: valid error code

    # TODO: check if user exists
	if User.select().where(User.username == username).exists():
		return #User already exists TODO: valid error code
      
    # TODO: hash password w/ argon2
	pwhash = hasher.hash(username + password)
	# TODO: create user in database

	# TODO: generate JWT with user
	return {"token": "fuck you"}


@message
def login(username: str, password: str, totp_code: str) -> dict:
    # TODO: validate username, password, token&code (size, format, etc)

    # TODO: get user from database (with username)
    # TODO: check password (username + passwrod since salted) 

    # TODO: check totp code

    # TODO: generate JWT with user
    return {"token": "fuck you"}


service_name = "auth-service"
