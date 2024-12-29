#!/usr/bin/env python3
import getpass
import bcrypt

password = getpass.getpass("Password: ")
hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
print(hashed_password.decode())
