# -*- coding: utf-8 -*-
from enum import StrEnum
import pika
import pika.adapters.blocking_connection
import pika.channel
import pika.exceptions
import pika.spec
import os
from typing import Callable, Optional

env = os.environ.copy()
rabbitmq_host = env.get("RABBITMQ_HOST", "rabbitmq")
rabbitmq_port = env.get("RABBITMQ_NODE_PORT", "5672")
rabbitmq_user = env.get("RABBITMQ_DEFAULT_USER", "guest")
rabbitmq_password = env.get("RABBITMQ_DEFAULT_PASS", "guest")
env["RABBITMQ_HOST"] = rabbitmq_host
env["RABBITMQ_PORT"] = rabbitmq_port
env["RABBITMQ_USER"] = rabbitmq_user
env["RABBITMQ_PASSWORD"] = rabbitmq_password

QueueCallback = Callable[[pika.channel.Channel, pika.spec.Basic.Deliver, pika.spec.BasicProperties, bytes], None]

connection: pika.BlockingConnection | None = None


def pika_internal_connection(init: bool = True) -> pika.BlockingConnection | None:
    global connection
    if connection is None and init:
        print(f"Initializing RabbitMQ connection ({rabbitmq_host}:{rabbitmq_port})...")
        # print(f"Host: {rabbitmq_host}")
        # print(f"Port: {rabbitmq_port}")
        # print(f"Username: {rabbitmq_user}")
        # print(f"Password: {rabbitmq_password}")
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            host=rabbitmq_host,
            port=rabbitmq_port,
            credentials=pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
        ))
    return connection


def pika_provide_channel() -> pika.adapters.blocking_connection.BlockingChannel:
    """Creates a new channel for the connection
    """
    if (conn := pika_internal_connection()) is None:
        raise Exception("No RabbitMQ connection available")
    return conn.channel()


class ServiceQueue:
    """A simple queue class for inter-service communication
    """

    __channel: pika.adapters.blocking_connection.BlockingChannel

    __queue: Optional[pika.spec.Queue]
    __callback: Optional[QueueCallback]
    __name: str

    def __init__(self, name: str):
        self.__queue = None
        self.__name = name

        try:
            self.__channel = pika_provide_channel()

            # self.__channel.exchange_declare(
            #     exchange='',
            # )
            print(f"Exchange {self.__name} declared")
        except Exception as e:
            print(f"Failed to initialize RabbitMQ connection: {str(e)}")
            raise e

    def __enter__(self):
        self.__queue = self.__channel.queue_declare(
            queue=self.__name,
        )

        # self.__channel.queue_bind(
        #     exchange='',
        #     queue=self.__name,
        # )
        print(f"Queue {self.__name} bound to exchange '<default exchange>'")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        pass

    def set_callback_handler(self, callback: QueueCallback) -> None:
        self.__callback = callback

    def consume(self) -> None:
        assert self.__channel is not None
        assert self.__queue is not None

        if self.__callback is None:
            raise Exception("No callback handler registered")
        assert self.__callback is not None

        self.__channel.basic_qos(prefetch_count=1)
        print(f"Setting up consuming from queue {self.__name}")
        self.__channel.basic_consume(
            queue=self.__name,
            on_message_callback=self.__callback,
            auto_ack=False
        )

        print("Starting consuming...")
        self.__channel.start_consuming()
