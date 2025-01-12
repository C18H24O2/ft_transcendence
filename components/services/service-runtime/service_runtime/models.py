from peewee import *
from service_runtime.database import provide_database


class User(Model):
    username = CharField()
    passwordHash = CharField()
    totpSecret = CharField()
    registeredAt = DateField()
    accountType = IntegerField()
    class Meta:
        database = provide_database()


all_models = [User]
