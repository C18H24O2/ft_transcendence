# website-service

> The frontend provider server, serving Server-Rendered (SSR'd) content to nginx

## required tools + nix

This project uses [Poetry](https://python-poetry.org/) as a project/dependency manager.  

You can use the provided [nix](https://nix.dev) shell to get up and running, simply run:
```bash
nix-shell
```
And you will end up in a shell with every required dependency.

## setup

First, ensure that the [frontend](./frontend) is properly **built** *(see the relevant [README](./frontend/README.md#build) section)*.

Then, you need to install the related dependencies:

```bash
poetry install
```

Finally, can run the server with the provided script:

```bash
# Make the script executable (run once)
chmod +x run.sh

# Run the script
./run.sh
```

