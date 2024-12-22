# -*- coding: utf-8 -*-

from .service import Service, message
from .queue import ServiceQueue
from .remote_service import remote_service


__disable_hook = False

if not __disable_hook:
    __disable_hook = True
    # add shutdown hook
    import atexit
    from .queue import pika_internal_connection

    def shutdown():
        pika_internal_connection().close()

    atexit.register(shutdown)
