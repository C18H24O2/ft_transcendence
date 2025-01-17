{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    pnpm
    nodejs_22
    poetry
    python312
    typescript
  ] ++ (with pkgs.python312Packages; [
    bcrypt
    pyjwt
    markupsafe
    gunicorn
    pika
    peewee
    pyright
    django
    channels
    black
    mypy
  ]);
}

# vim: ts=2 sw=2 et
