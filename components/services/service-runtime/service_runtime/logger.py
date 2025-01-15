# -*- coding: utf-8 -*-
import inspect
import io
import sys
from datetime import datetime
import threading


class LoggingStream(io.TextIOWrapper):
    """A custom stream that redirects to a custom logger
    """
    __stream: io.TextIOWrapper
    __buffer: str

    def __init__(self, stream: io.TextIOWrapper | None):
        if stream is None:
            raise Exception("LoggingStream: stream cannot be None")
        self.__stream = stream
        self.__buffer = ""

    def write(self, message: str) -> int:
        self.__buffer += message
        if "\n" in self.__buffer:
            self.flush()
        return len(message)

    def flush(self):
        if self.__buffer:
            log = self.format_log(self.__buffer)
            self.__stream.write(log)
            self.__buffer = ""
        self.__stream.flush()

    def format_log(self, message: str) -> str:
        """Formats the log message
        """

        # get calling function/file/line
        frame = inspect.currentframe()
        try:
            caller = inspect.getouterframes(frame, 4)[3]
            file = caller.filename
            file = file.split("/")[-1]
            line = caller.lineno
            function = caller.function
        except IndexError as e:
            self.__stream.write(f"Error getting caller: {e}\n")
            file = "?"
            line = 0
            function = "?"

        time = datetime.now().strftime("%H:%M:%S")
        thread_name = threading.current_thread().name
        thread = thread_name.replace("Thread-", "")
        return f"[{time}] [{thread}/{file}:{function}:{line}] {message}"


def hijack_stdout():
    """Redirects stdout and stderr to custom loggers
    """
    sys.stdout = LoggingStream(sys.__stdout__)
    sys.stderr = LoggingStream(sys.__stderr__)
