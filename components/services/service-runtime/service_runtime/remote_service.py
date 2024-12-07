# -*- coding: utf-8 -*-


def gen_method(id: str, name: str):
    def method(*args, **kwargs):
        if len(args) > 0:
            raise Exception("Remote service methods cannot have positional arguments")
        return
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
