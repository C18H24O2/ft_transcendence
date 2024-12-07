from .queue import ServiceQueue
import functools
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
            raise Exception(f"Service {service_module} does not have a service_name")
        service_name = globals["service_name"]
        print(f"Running service {service_name}")

        service_queue = ServiceQueue(service_name)

        # get functions from the module
        functions = dict([(f, v) for f, v in service_module.__dict__.items() if not f.startswith("__") and hasattr(v, "__SERVICE_METHOD")])
        for f, v in functions.items():
            pass

        def handle_everything(channel, method, properties, body):
            print(f"Received message: {body}")
            channel.basic_ack(delivery_tag=method.delivery_tag)
            return

        with service_queue as queue:
            queue.set_callback_handler(handle_everything)
            queue.consume()
