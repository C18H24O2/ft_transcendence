# -*- coding: utf-8 -*-
import pika
import os

env = os.environ.copy()
rabbitmq_host = env.get("RABBITMQ_HOST", "localhost")
rabbitmq_port = env.get("RABBITMQ_PORT", "5672")
rabbitmq_user = env.get("RABBITMQ_USER", "guest")
rabbitmq_password = env.get("RABBITMQ_PASSWORD", "guest")
env["RABBITMQ_HOST"] = rabbitmq_host
env["RABBITMQ_PORT"] = rabbitmq_port
env["RABBITMQ_USER"] = rabbitmq_user
env["RABBITMQ_PASSWORD"] = rabbitmq_password

class ServiceQueue:
    """A simple queue class for inter-service communication
    """
    def __init__(self):
        self.__connection = pika.BlockingConnection(pika.ConnectionParameters(
            host=rabbitmq_host,
            port=rabbitmq_port,
            credentials=pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
        ))
        self.__channel = connection.channel()
    
    def close(self):
        self.__connection.close()

    def declare(self, queue_name: str, durable: bool = True):
        self.__channel.queue_declare(queue=queue_name, durable=durable)