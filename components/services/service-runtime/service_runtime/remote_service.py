# -*- coding: utf-8 -*-
import pika
from .queue import pika_internal_connection, pika_provide_channel
import uuid
import json
from dataclasses import dataclass
import dataclasses


@dataclass
class ServiceRequest:
    id: str
    args: list[dict]
    response_id: str


@dataclass
class ServiceResponse:
    response_id: str
    result: object
    result_type: str


class ServiceRequestHandler:
    def __init__(self, id: str, name: str):
        self.id = id
        self.name = name
        self.channel = pika_provide_channel()
        self.channel.exchange_declare(
            exchange=self.id,
            exchange_type='direct',
        )

        self.response_id = str(uuid.uuid4())
        self.callback_queue = None
        self.response = None

    def setup_listener(self):
        print(f"Setting up RPC handler for exchange='{self.id}' method='{self.name}'")
        result = self.channel.queue_declare(queue='', exclusive=True)
        self.callback_queue = result.method.queue

        print(f"Binding callback queue '{self.callback_queue}' to exchange '{self.id}'")
        self.channel.queue_bind(
            exchange=self.id,
            queue=self.callback_queue,
            routing_key=self.response_id,
        )

        print(f"Starting consuming from callback queue '{self.callback_queue}'")
        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=False
        )

    def on_response(self, ch, method, props, body):
        print(f"Received response: {body}")
        print(f"> Self Response ID: {self.response_id}")
        print(f"> Delivery tag: {method.delivery_tag}")
        print(f"> Response ID: {props.reply_to}")
        print(f"> Correlation ID: {props.correlation_id}")
        if self.response_id == props.correlation_id:
            self.response = body
            ch.basic_ack(delivery_tag=method.delivery_tag)

    def send_request(self, *args, **kwargs):
        if len(args) > 0:
            raise Exception("Remote service methods cannot have positional arguments")

        arguments: list[dict] = []
        for k, v in kwargs.items():
            arg = {"name": k, "value": v, "type": type(v).__name__}
            arguments.append(arg)
        request = ServiceRequest(id=self.name, args=arguments, response_id=self.response_id)
        dumped = json.dumps(dataclasses.asdict(request)).encode('utf-8')

        print(f"[{self.id}/{self.name}] Sending message: {dumped}")

        print(f"Publishing message to exchange '{self.id}'")
        self.channel.basic_publish(
            exchange=self.id,
            routing_key='',
            body=dumped,
            properties=pika.BasicProperties(
                content_type='application/json',
                delivery_mode=1,
                reply_to=self.callback_queue,
                correlation_id=self.response_id,
            )
        )

    def await_response(self):
        print(f"Awaiting response for {self.id}/{self.name}")
        connection = pika_internal_connection()
        while self.response is None:
            connection.process_data_events(time_limit=None)
        print(f"Response received: {self.response}")


handler_cache: dict[tuple[str, str], ServiceRequestHandler] = {}


def gen_method(id: str, name: str):
    global handler_cache

    if (id, name) in handler_cache:
        handler = handler_cache[(id, name)]
    else:
        handler = ServiceRequestHandler(id, name)
        handler.setup_listener()
        handler_cache[(id, name)] = handler

    def method(*args, **kwargs):
        handler.send_request(*args, **kwargs)
        handler.await_response()
        return handler.response

    return method


class MethodGeneratorHolder:
    def __init__(self, id: str):
        self.id = id

    def __getattr__(self, name):
        print(f"Getting method {name} on service {self.id}")
        return gen_method(self.id, name)


def remote_service(id: str) -> MethodGeneratorHolder:
    """Creates a remote service, basically a skeleton of a service that
    communicates synchronously with another service.
    """
    return MethodGeneratorHolder(id)
