# ft_trans's service-runtime library

> A library for abstracting away common service-related functionality

This bakes in a few things:
- RabbitMQ integration
- Custom logging
  - Console log format
  - (Future) logstash support
  - (Future) Error logging to Prometheus

## Usage

```python
from service_runtime import Service, ServiceQueue

class MyService(Service):
    def __init__(self, queue: ServiceQueue):
        super().__init__("auth-service", queue)

    def run(self):
        print("Starting service...")


if __name__ == "__main__":
    Service.run(MyService)
```