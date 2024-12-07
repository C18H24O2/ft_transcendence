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
rabbitmq_host = env.get("RABBITMQ_HOST", "rabbitmq") # rabbitmq container name on the docker network
rabbitmq_port = env.get("RABBITMQ_NODE_PORT", "5672")
rabbitmq_user = env.get("RABBITMQ_DEFAULT_USER", "guest")
rabbitmq_password = env.get("RABBITMQ_DEFAULT_PASS", "guest")
env["RABBITMQ_HOST"] = rabbitmq_host
env["RABBITMQ_PORT"] = rabbitmq_port
env["RABBITMQ_USER"] = rabbitmq_user
env["RABBITMQ_PASSWORD"] = rabbitmq_password

# channel: pika.channel.Channel - method: pika.spec.Basic.Deliver - properties: pika.spec.BasicProperties - body: bytes

QueueCallback = Callable[[pika.channel.Channel, pika.spec.Basic.Deliver, pika.spec.BasicProperties, bytes], None]

class ServiceQueue:
    """A simple queue class for inter-service communication
    """

    __connection: pika.BlockingConnection
    __channel: pika.adapters.blocking_connection.BlockingChannel
    __connected: bool

    __queue: Optional[pika.spec.Queue]
    __callback: Optional[QueueCallback]
    __name: str

    def __init__(self, name: str):
        self.__connected = False
        self.__queue = None
        self.__name = name

        try:
            print(f"Initializing RabbitMQ connection ({rabbitmq_host}:{rabbitmq_port})...")
            # print(f"Host: {rabbitmq_host}")
            # print(f"Port: {rabbitmq_port}")
            # print(f"Username: {rabbitmq_user}")
            # print(f"Password: {rabbitmq_password}")

            self.__connection = pika.BlockingConnection(pika.ConnectionParameters(
                host=rabbitmq_host,
                port=rabbitmq_port,
                credentials=pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
            ))
            self.__channel = self.__connection.channel()
            self.__connected = True

            self.__channel.exchange_declare(
                exchange=self.__name,
            )
        except Exception as e:
            print(f"Failed to initialize RabbitMQ connection: {str(e)}")
            self.__connected = False
            raise e

    def __enter__(self):

        self.__queue = self.__channel.queue_declare(
            queue='',
            exclusive=True,
        )

        self.__channel.queue_bind(
            exchange=self.__name,
            queue=self.__queue.method.queue,
        )
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if not self.__connected:
            return
        assert self.__connection is not None

        print("Closing connection...")
        self.__connection.close()

    def set_callback_handler(self, callback: QueueCallback) -> None:
        self.__callback = callback



    def consume(self) -> None:
        if not self.__connected:
            raise Exception("Cannot consume before connection is established")
        assert self.__channel is not None
        assert self.__queue is not None

        if self.__callback is None:
            raise Exception("No callback handler registered")
        assert self.__callback is not None

        self.__channel.basic_qos(prefetch_count=1)
        self.__channel.basic_consume(
            queue=self.__queue.method.queue,
            on_message_callback=self.__callback,
            auto_ack=False
        )

        print("Starting consuming...")
        self.__channel.start_consuming()
