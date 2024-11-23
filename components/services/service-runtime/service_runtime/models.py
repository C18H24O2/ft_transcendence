from peewee import *
from service_runtime.database import provide_database


class User(Model):
    username = CharField()
    email = CharField()
    passwordHash = CharField()
    totpSecret = CharField()
    isVerified = BooleanField()

    displayName = CharField()
    # base64 encoded image
    profilePicture = CharField()

    class Meta:
        database = provide_database()


all_models = [User]
