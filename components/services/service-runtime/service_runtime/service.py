from .queue import ServiceQueue
from .remote_service import ServiceRequest, ServiceResponse
from .models import all_models
from .database import provide_database
import dataclasses
import functools
import json
import pika
import sys
from typing import Callable


def message(func: Callable):
    """Decorator for message handlers
    This basically tries to use the function arguments as the required
    message properties in the json payload received by the service queue.

    Note: This decorator is also looked-up by the service queue to find
    the message handlers
    """
    name = func.__name__
    setattr(func, "__SERVICE_METHOD", name)
    setattr(func, "__ORIGINAL", func)

    @functools.wraps(func)
    def decorator(func):
        # get function arguments (names)
        args = func.__code__.co_varnames[:func.__code__.co_argcount]
        print(f"Registering message handler {name} for {func.__name__}")
        for arg in args[1:]:
            print(f"\targument {arg}")
            arg_type = func.__annotations__.get(arg)
            if arg_type is None:
                raise Exception(
                    "Error while registering message handler "
                    f"{name} at func '{func.__name__}': argument '{arg}'"
                    " has no type annotation"
                )
            print(f"\targument type {arg_type}")
        return func
    return decorator


def lookup_type(name: str) -> object:
    return getattr(__builtins__, name, None)


def log(message: str):
    print(message, file=sys.stderr)


class ServiceMethod:
    def __init__(self, name: str, fn: Callable):
        self.name = name
        self.fn = fn

    def handle(self, message: ServiceRequest) -> ServiceResponse:
        arguments = []
        for arg in message.args:
            arg = dict(arg)
            t = lookup_type(arg["typename"])
            val = arg["value"]
            if t is None:
                res = val
            else:
                res = t(val)
            arguments.append(res)

        result = self.fn(*arguments)
        res_type = type(result)
        return ServiceResponse(result, res_type.__name__)

    def can_handle(self, message: ServiceRequest):
        # print(self.name, "-> checking if we can handle", message)
        if message.id != self.name:
            return False
    
        # print("Good name")

        # check if the number of arguments matches
        if len(message.args) != self.fn.__code__.co_argcount:
            # print("Bad number of args")
            # print(len(message.args))
            # print(len(self.fn.__code__.co_varnames))
            # print(self.fn.__code__.co_varnames)
            # print(self.fn.__code__.co_argcount)
            # print(self.fn.__code__)
            # print(self.fn.__name__)
            return False

        # print("Good number of args")

        # check if the argument types match
        for i, arg in enumerate(message.args):
            # print(i, "arg", arg)
            msg_type = arg['typename'] # this is required as APPARENTLY it's wrapped as a dict, not as an Argument object. WTF?
            fn_type = self.fn.__annotations__.get(self.fn.__code__.co_varnames[i])
            if fn_type == None or msg_type != fn_type.__name__:
                # print("no match :(")
                # print(msg_type)
                # print(fn_type)
                return False

        # print("Good args")

        return True


class Service:
    """Base class for all services
    """

    def shutdown(self):
        """Shuts down the service

        Service implementors may override this function
        """
        pass

    @staticmethod
    def run(service_module: object) -> None:
        """Runs the provided service class

        Args:
            service_class (type): The service class to run
        """
        globals = service_module.__dict__
        if "service_name" not in globals:
            # we do a bit of django-esque dumbfuckery here
            # YOU DON'T HAVE A RANDOM ASS VARIABLE IN YOUR FILE???? TOO BAD.
            raise Exception(f"Service {service_module} does not have a service_name")
        service_name = globals["service_name"]
        print(f"Running service {service_name}")

        database = provide_database()
        try:
            database.create_tables(all_models)
        except Exception as e:
            print("Error while creating tables", e, file=sys.stderr)
            return

        # get functions from the module
        functions = dict([(f, v) for f, v in service_module.__dict__.items() if not f.startswith("__") and hasattr(v, "__SERVICE_METHOD")])
        handlers = [ServiceMethod(f, getattr(v, "__ORIGINAL")) for f, v in functions.items()]

        print(f"Found {len(handlers)} message handlers")
        for handler in handlers:
            print(f" - {handler.name}")

        def handle_everything(channel, method, props, body):
            # print(f"Received message: {body}")
            # print(f"> Delivery tag: {method.delivery_tag}")
            # print(f"> Response ID: {props.reply_to}")
            # print(f"> Correlation ID: {props.correlation_id}")

            def reply(resp: ServiceResponse):
                channel.basic_publish(
                        exchange='',
                        routing_key=props.reply_to,
                        body=json.dumps(dataclasses.asdict(resp)).encode('utf-8'),
                        properties=pika.BasicProperties(
                            content_type='application/json',
                            delivery_mode=1,
                            correlation_id=props.correlation_id,
                        ),
                )
                channel.basic_ack(delivery_tag=method.delivery_tag)


            try:
                data = json.loads(body)
                request = ServiceRequest(**data)
                candidates = [h for h in handlers if h.can_handle(request)]
                if len(candidates) == 0:
                    err = f"No handler found for request: {request}"
                    print(err)
                    reply(ServiceResponse(result=err, result_type="error"))
                    return
                elif len(candidates) > 1:
                    err = f"Multiple handlers found for request: {request}"
                    print(err)
                    reply(ServiceResponse(result=err, result_type="error"))
                    return
                else:
                    try:
                        reply(candidates[0].handle(request))
                    except Exception as e:
                        err = f"Error handling request: {e}"
                        print(err)
                        reply(ServiceResponse(result=err, result_type="error"))
                        return
            except Exception as e:
                err = f"Error decoding message: {e}"
                print(err)
                reply(ServiceResponse(result=err, result_type="error"))
                return


            # print(f"Data: {data}")
            # channel.basic_publish(
            #         exchange='',
            #         routing_key=props.reply_to,
            #         body="john rabbit",
            #         properties=pika.BasicProperties(
            #             content_type='application/json',
            #             delivery_mode=1,
            #             correlation_id=props.correlation_id,
            #         )
            #     )
            # return

        with ServiceQueue(service_name) as queue:
            queue.set_callback_handler(handle_everything)
            queue.consume()

        from service_runtime.queue import pika_internal_connection
        pika_internal_connection().close()
