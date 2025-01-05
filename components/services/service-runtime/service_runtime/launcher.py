#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import time
from .service import Service
from .logger import hijack_stdout
import importlib.util


def wrapped_start() -> int:
    print("Launching service")
    print(sys.argv)
    if len(sys.argv) != 2:
        print("Usage: python3 launcher.py <path/to/your-service.py>")
        return 1

    target_file = sys.argv[1]
    if not os.path.exists(target_file):
        print(f"File {target_file} does not exist")
        sys.exit(1)

    # Append the current dir to the sys.path so that we can import the service
    sys.path.append(os.path.dirname(__file__))
    sys.path.append(os.path.dirname(target_file))

    print(f"Loading service {target_file}")
    current_time = time.time()
    spec = importlib.util.spec_from_file_location("service", target_file)
    loader = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loader)

    # Instantiate the service class, and run it
    time_diff = time.time() - current_time
    time_str_in_ms = f"{time_diff * 1000:.2f}"
    print(f"Loaded service {target_file} in {time_str_in_ms}ms")

    try:
        hijack_stdout()
        Service.run(loader)
    except Exception as e:
        import traceback
        print(f"Failed to run service {target_file}: {e}")
        print(f"Traceback:\n{traceback.format_exc()}")
        return 1
    return 0
