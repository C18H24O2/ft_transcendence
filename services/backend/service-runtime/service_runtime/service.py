from .logger import hijack_stdout
from .queue import ServiceQueue

class Service:
    """Base class for all services
    """
    def __init__(self, name: str, queue: ServiceQueue):
        self.name = name
        self.queue = None

    @staticmethod
    def run(service_class: type) -> None:
        """Runs the provided service class

        Args:
            service_class (type): The service class to run
        """
        hijack_stdout()

        # Create a queue instance
        queue = ServiceQueue()

        # Instantiate the service class
        try:
            service = service_class(queue)
        except Exception as e:
            print(f"Failed to instantiate service {service_class}: {e}")
            return

        # Run the service
        service.run()