from .logger import hijack_stdout
from .queue import ServiceQueue
from .database import provide_database
from .models import all_models
import traceback


def message(name: str):
    """Decorator for message handlers
    This basically tries to use the function arguments as the required message properties
    in the json payload received by the service queue.

    Note: This decorator is also looked-up by the service queue to find the message handlers
    """
    def decorator(func):
        func.message_name = name
        # get function arguments (names)
        args = func.__code__.co_varnames[:func.__code__.co_argcount]
        print(f"Registering message handler {name} for {func.__name__}")
        for arg in args[1:]:
            print(f"\targument {arg}")
            arg_type = func.__annotations__.get(arg)
            if arg_type is None:
                raise Exception(f"Error while registering message handler {name} at func '{func.__name__}': argument '{arg}' has no type annotation")
            print(f"\targument type {arg_type}")
        return func
    return decorator

def internal_service_launch(self):
    """Internal function for launching a service
    """
    print(f"Launching service {self.__class__}")
    print("This is insane")


def scan_for_handlers(self):
    """Scans the service class for message handlers
    """
    message_handlers = {}
    for name, func in self.__class__.__dict__.items():
        if hasattr(func, "message_name"):
            print(f"Found message handler {func.__name__}")
            message_handlers[func.message_name] = func
    return message_handlers


def service(id: str):
    """Decorator for service classes
    """
    def decorator(service_class):
        service_class.service_id = id
        service_class._IS_AT_SERVICE = True
        orig_init = service_class.__init__

        def await_connections(self):
            print("Awaiting connections")

        def le_init(self, *args, **kwargs):
            self.database = provide_database()
            self.database.create_tables(all_models)
            self.queue = ServiceQueue()
            self.message_handlers = scan_for_handlers(self)
            orig_init(self, *args, **kwargs)
            self._await_connections()

        service_class._await_connections = await_connections
        service_class._service_launch = internal_service_launch

        service_class.__init__ = le_init
        return service_class
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
    def run(service_class: type) -> None:
        """Runs the provided service class

        Args:
            service_class (type): The service class to run
        """
        hijack_stdout()

        # Check if the service class is decorated with @service
        if not hasattr(service_class, "_IS_AT_SERVICE"):
            raise Exception(f"Service class {service_class} is not decorated with @service")

        print(f"Running service {service_class}")

        # Instantiate and run the service class
        service = None
        try:
            service = service_class()
        except Exception as e:
            if e is KeyboardInterrupt:
                if hasattr(service, "shutdown"):
                    service.shutdown() # mypy: ignore
                return
            formatted = "\n".join(traceback.format_exception(e))
            print(f"Failed to instantiate service {service_class}:\n{formatted}")
            return
