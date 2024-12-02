# -*- coding: utf-8 -*-
import os
import peewee


env = os.environ.copy()
postgres_host = env.get("POSTGRES_HOST", "0.0.0.0")
postgres_port = env.get("POSTGRES_PORT", "5432")
postgres_user = env.get("POSTGRES_USER", "guest")
postgres_password = env.get("POSTGRES_PASSWORD", "guest")
postgres_database = env.get("POSTGRES_DB", "postgres")
env["POSTGRES_HOST"] = postgres_host
env["POSTGRES_PORT"] = postgres_port
env["POSTGRES_USER"] = postgres_user
env["POSTGRES_PASSWORD"] = postgres_password
env["POSTGRES_DB"] = postgres_database

database = None


def provide_database():
    global database
    if database is None:
        database = peewee.PostgresqlDatabase(
            postgres_database,
            host=postgres_host,
            port=postgres_port,
            user=postgres_user,
            password=postgres_password
        )
    return database
