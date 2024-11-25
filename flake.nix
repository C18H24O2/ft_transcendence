{
  description = "ft_transcendence"; 

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs?ref=nixos-unstable";
    systems.url = "github:nix-systems/x86_64-linux";
  };

  outputs =
    { self, nixpkgs, ... }@inputs:
    let
      inherit (self) outputs;
      systems = (import inputs.systems);
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = import ./shell.nix { inherit pkgs; };
        }
      );
    };
}

# vim: ts=2 sw=2 et

