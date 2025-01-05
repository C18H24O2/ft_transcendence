# -*- coding: utf-8 -*-

__disable_hook = False

if not __disable_hook:
    __disable_hook = True
    # add shutdown hook
    import atexit

    def shutdown():
        from .queue import pika_internal_connection
        if (conn := pika_internal_connection(init=False)) is not None:
            conn.close()

    atexit.register(shutdown)
