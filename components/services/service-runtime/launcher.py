#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import time
from service_runtime.service import Service
from service_runtime.logger import hijack_stdout

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 launcher.py <path/to/your-service.py>")
        sys.exit(1)

    target_file = sys.argv[1]
    if not os.path.exists(target_file):
        print(f"File {target_file} does not exist")
        sys.exit(1)

    # Append the current dir to the sys.path so that we can import the service
    sys.path.append(os.path.dirname(__file__))
    sys.path.append(os.path.dirname(target_file))

    print(f"Loading service {target_file}")
    current_time = time.time()
    import importlib.util
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
        sys.exit(1)
