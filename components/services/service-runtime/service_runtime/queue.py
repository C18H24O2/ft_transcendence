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

    __connection: Optional[pika.BlockingConnection]
    __channel: Optional[pika.adapters.blocking_connection.BlockingChannel]
    __connected: bool

    __queues: list[tuple[str]]
    __callbacks: list[tuple[str, QueueCallback]]

    def __init__(self):
        self.__connection = None
        self.__channel = None
        self.__connected = False
        self.__queues = []
        self.__callbacks = []

    def __enter__(self):
        try:
            print(f"Initializing RabbitMQ connection ({rabbitmq_host}:{rabbitmq_port})...")
            self.__connection = pika.BlockingConnection(pika.ConnectionParameters(
                host=rabbitmq_host,
                port=rabbitmq_port,
                credentials=pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
            ))
            self.__channel = self.__connection.channel()
            self.__connected = True
            self.__define_queues()
        except Exception as e:
            print(f"Failed to initialize RabbitMQ connection")
            self.__connection = None
            self.__channel = None
            self.__connected = False
            raise e
        return self
    
    def __define_queues(self):
        assert self.__channel is not None

        for queue_details in self.__queues:
            (queue_name,) = queue_details
            print(f"Declaring queue '{queue_name}'")
            self.__channel.queue_declare(queue=queue_name, durable=True)

    def __exit__(self, exc_type, exc_value, traceback):
        if not self.__connected:
            return
        assert self.__connection is not None

        print("Closing connection...")
        self.__connection.close()

    def declare_queue(self, queue_name: str) -> str:
        if self.__connected:
            raise Exception("Cannot declare queues after connection is established")
        self.__queues.append((queue_name,))
        return queue_name

    def publish(self, queue_id: str, message: str) -> None:
        if not self.__connected:
            raise Exception("Cannot publish before connection is established")
        assert self.__channel is not None
        print(f"Publishing to {queue_id}: {message}")
        self.__channel.basic_publish(exchange="", routing_key=queue_id, body=message)

    def add_consumer(self, queue_id: str, callback: QueueCallback) -> None:
        if self.__connected:
            raise Exception("Cannot add consumers after connection is established")
        self.__callbacks.append((queue_id, callback))

    def consume(self) -> None:
        if not self.__connected:
            raise Exception("Cannot consume before connection is established")
        assert self.__channel is not None

        if len(self.__callbacks) == 0:
            raise Exception("No consumers registered")

        for queue_details in self.__callbacks:
            (queue_id, callback) = queue_details
            print(f"Adding consumer for queue {queue_id}")
            self.__channel.basic_consume(queue=queue_id, on_message_callback=callback, auto_ack=True)

        print("Starting consuming...")
        self.__channel.start_consuming()
