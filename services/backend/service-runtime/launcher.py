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

    print(sys.argv)
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
    service = loader.load_module("service")

    print(f"Running service {service}")