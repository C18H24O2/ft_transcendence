#!/usr/bin/env python3

import os
import sys

START_MARKER = "MODULES_START"
END_MARKER = "MODULES_END"

if __name__ == "__main__":
    total_minor = 0
    total_major = 0
    with open("README.md", "r") as f:
        lines = f.readlines()
        in_modules = False
        for line in lines:
            if START_MARKER in line:
                in_modules = True
                continue
            if END_MARKER in line:
                in_modules = False
                continue
            if in_modules:
                orig = line
                line = line.strip()
                if line.startswith("- ["):
                    line = line[3:]
                    state = True if line[0] == 'x' else False
                    if not state:
                        continue
                    line = line[3:]
                    if line[0] != '(':
                        print("Error parsing line:", orig)
                        sys.exit(1)
                    minor = True if line.lower().startswith("(minor") else False
                    title = line[8:]
                    if minor:
                        print("Found minor:", title)
                        total_minor += 1
                    else:
                        print("Found major:", title)
                        total_major += 1
    print("\n\nTotal modules:")
    print("> Major:", total_major)
    print("> Minor:", total_minor)
    e_total = total_major + int(total_minor / 2.0)
    print("> Effective Total:", e_total, f"({total_major + total_minor / 2.})")
    print("\nTotal project grade:")
    points = 30 + total_minor * 5 + total_major * 10
    print(f"> Points: {points}/125")

