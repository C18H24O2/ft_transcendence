# -*- coding: utf-8 -*-


class RemoteService:
    def __init__(self, id: str):
        self.id = id


def remote_service(id: str, methods: list[str]) -> RemoteService:
    """Creates a remote service, basically a skeleton of a service that
    communicates synchronously with another service.
    """
    service = RemoteService(id)
    
    return service
