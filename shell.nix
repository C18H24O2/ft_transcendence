{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    pnpm
    nodejs_22
    poetry
    python312
  ] ++ (with pkgs.python312Packages; [
    pika
    pyright
    django
    black
    mypy
  ]);
}

# vim: ts=2 sw=2 et
