# -*- coding: utf-8 -*-
import pika
from .queue import pika_internal_connection, pika_provide_channel
import uuid
import json
from dataclasses import dataclass
import dataclasses


@dataclass
class Argument:
    name: str
    value: object
    typename: str


@dataclass
class ServiceRequest:
    id: str
    args: list[Argument]


@dataclass
class ServiceResponse:
    result: object
    result_type: str


class ServiceRequestHandler:
    def __init__(self, id: str):
        self.service_type = id
        self.channel = pika_provide_channel()
        # self.channel.exchange_declare(
        #     exchange='',
        #     exchange_type='direct',
        # )

        # self.response_id = str(uuid.uuid4())
        self.callback_queue = None
        self.responses = {}

    def setup_listener(self):
        print(f"Setting up RPC handler for exchange='{self.service_type}'")
        result = self.channel.queue_declare(
            queue='',
            exclusive=True
        )
        self.callback_queue = result.method.queue

        print(f"Binding callback queue '{self.callback_queue}' to exchange '<default exchange>'")
        # self.channel.queue_bind(
        #     exchange='',
        #     queue=self.callback_queue,
        #     # routing_key=self.response_id,
        # )

        print(f"Starting consuming from callback queue '{self.callback_queue}'")
        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=False
        )

    def on_response(self, ch, method, props, body):
        # print(f"Received response: {body}")
        # print(f"> Delivery tag: {method.delivery_tag}")
        # print(f"> Response ID: {props.reply_to}")
        # print(f"> Correlation ID: {props.correlation_id}")
        self.responses[props.correlation_id] = json.loads(body)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    def send_request(self, name, corr_id, args, kwargs):
        if len(args) > 0:
            raise Exception("Remote service methods cannot have positional arguments")

        arguments = [Argument(k, v, type(v).__name__) for k, v in kwargs.items()]
        request = ServiceRequest(id=name, args=arguments)
        dumped = json.dumps(dataclasses.asdict(request)).encode('utf-8')

        # print(f"[{self.service_type}/{name}] Sending message: {dumped}")

        # print(f"Publishing message to queue '{self.service_type}' on exchange '<default exchange>'")
        self.channel.basic_publish(
            exchange='',
            routing_key=self.service_type,
            body=dumped,
            properties=pika.BasicProperties(
                content_type='application/json',
                delivery_mode=1,
                reply_to=self.callback_queue,
                correlation_id=corr_id,
            )
        )

    def await_response(self, name, corr_id):
        # print(f"Awaiting response for {self.service_type}/{name}")
        connection = pika_internal_connection()
        assert connection is not None

        while corr_id not in self.responses:
            connection.process_data_events(time_limit=None) # Yes, this should be `None`. Yes, the typing is messed up. No, i can't find a way to disable my lsp linting for this specific line and Yes i'm going fucking mental about it.
        value = self.responses.pop(corr_id)
        # print(f"Response received")
        return value


class ServiceException(Exception):
    pass


handler_cache: dict[str, ServiceRequestHandler] = {}


def gen_method(id: str, name: str):
    global handler_cache

    if id in handler_cache:
        handler = handler_cache[id]
    else:
        handler = ServiceRequestHandler(id)
        handler.setup_listener()
        handler_cache[id] = handler

    def method(*args, **kwargs):
        corr_id = str(uuid.uuid4())
        handler.send_request(name, corr_id, args, kwargs)
        resp = handler.await_response(name, corr_id)
        if "result_type" in resp and resp["result_type"] == "error":
            raise ServiceException(str(resp["result"]))
        return resp["result"]

    return method


class MethodGeneratorHolder:
    def __init__(self, id: str):
        self.id = id

    def __getattr__(self, name):
        # print(f"Getting method {name} on service {self.id}")
        return gen_method(self.id, name)


def remote_service(id: str) -> MethodGeneratorHolder:
    """Creates a remote service, basically a skeleton of a service that
    communicates synchronously with another service.
    """
    return MethodGeneratorHolder(id)
