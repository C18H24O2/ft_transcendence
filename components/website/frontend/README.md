# frontend

> The HTML/JavaScript frontend.

## required tools + nix

This project uses [pnpm](https://pnpm.io) as a project/dependency manager.

You can use the provided [nix](https://nix.dev) shell to get up and running, simply run:
```bash
nix-shell
```
And you will end up in a shell with every required dependency.

## setup

First, you need to install the required dependencies:
```bash
pnpm i
```

## develop

To develop on this, you can launch a development server, which will reload each time you make changes:
```bash
pnpm run dev
```

## build

To build the project into a minified and optimized packed HTML/CSS bundle, you can run:
```bash
pnpm run build
```

> :warning: **Note**: Some errors can occur during build time, but not in dev mode. If something doesn't seem to work right, try to run `pnpm run build` to see if something went wrong somewhere.
