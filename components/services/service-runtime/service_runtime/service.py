from .logger import hijack_stdout
from .queue import ServiceQueue
import traceback

class Service:
    """Base class for all services
    """
    queue: ServiceQueue

    def __init__(self, name: str, queue: ServiceQueue):
        self.name = name
        self.queue = queue

    def launch(self):
        """Launches the service

        Service implementors should override this function
        """
        raise Exception("unimplemented")

    def shutdown(self):
        """Shuts down the service

        Service implementors may override this function
        """
        pass

    def provide_queue(self, queue_id: str) -> ServiceQueue:
        """Provides a queue to the service
        """
        return self.queue

    @staticmethod
    def run(service_class: type) -> None:
        """Runs the provided service class

        Args:
            service_class (type): The service class to run
        """
        hijack_stdout()

        print(f"Running service {service_class}")

        # Instantiate the service class
        try:
            service = service_class()
        except Exception as e:
            formatted = "\n".join(traceback.format_exception(e))
            print(f"Failed to instantiate service {service_class}:\n{formatted}")
            return

        # Run the service
        try:
            service.launch()
        except Exception as e:
            if e is KeyboardInterrupt:
                service.shutdown()
                return
            formatted = "\n".join(traceback.format_exception(e))
            print(f"Failed to run service {service_class}:\n{formatted}")
            return
