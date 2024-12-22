# -*- coding: utf-8 -*-
from enum import StrEnum
import pika
import pika.adapters.blocking_connection
import pika.channel
import pika.exceptions
import pika.spec
import os
from typing import Optional, Callable

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

connection: Optional[pika.BlockingConnection] = None


def pika_internal_connection() -> pika.BlockingConnection:
    global connection
    if connection is None:
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
    return pika_internal_connection().channel()


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

            self.__channel.exchange_declare(
                exchange=self.__name,
                exchange_type='direct',
            )
            print(f"Exchange {self.__name} declared")
        except Exception as e:
            print(f"Failed to initialize RabbitMQ connection: {str(e)}")
            raise e

    def __enter__(self):
        self.__queue = self.__channel.queue_declare(
            queue='',
            exclusive=True,
        )

        queue_name: str = self.__queue.method.queue
        self.__channel.queue_bind(
            exchange=self.__name,
            queue=queue_name,
        )
        print(f"Queue {queue_name} bound to exchange {self.__name}")
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
        queue_name: str = self.__queue.method.queue
        print(f"Setting up consuming from queue {queue_name}")
        self.__channel.basic_consume(
            queue=queue_name,
            on_message_callback=self.__callback,
            auto_ack=False
        )

        print("Starting consuming...")
        self.__channel.start_consuming()
