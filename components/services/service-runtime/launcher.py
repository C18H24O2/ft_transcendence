#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import time
from typing import Optional

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

    # Launch the target_file, as __name__ == "__main__"
    from importlib.machinery import SourceFileLoader
    loader = SourceFileLoader("service", target_file)

    # Instantiate the service class, and run it
    print(f"Loading service {target_file}")
    current_time = time.time()
    service = loader.load_module("service")
    time_diff = time.time() - current_time
    time_str_in_ms = f"{time_diff * 1000:.2f}"
    print(f"Loaded service {target_file} in {time_str_in_ms}ms")
    service.launch()
