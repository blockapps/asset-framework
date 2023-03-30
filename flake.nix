{
  description = "Asset-Framework Dapp Generator";

  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.nixpkgs.url = "nixpkgs/nixos-21.05"; # Update this to the desired Nixpkgs channel

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        # Get the appropriate package set based on the system
        pkgs = nixpkgs.legacyPackages.${system};

        # Define the specific Node.js version
         
	nodejs1 = pkgs.nodejs-14_x.overrideAttrs (oldAttrs: rec {
    		version = "14.19.1";
        	name = "nodejs-${version}";

    		src = pkgs.fetchurl {
      			url = "https://nodejs.org/dist/v${version}/node-v${version}.tar.xz";
      			sha256 = "sha256-4a4J3YYas5rwRIO7XA+lTd2CtrFVQ76aJ+pnBKi6ndk=";
    		};
  	});

        # Define the dependencies for the Asset-Framework
        yarn = pkgs.yarn.override (_: {
    		nodejs = nodejs1;
  	});
        docker = pkgs.docker;
        git = pkgs.git;

        # Define the Asset-Framework repository
        assetFrameworkRepo = "https://github.com/blockapps/asset-framework.git";

        # Define the script that runs the 'yarn generate' command
        generateScript = pkgs.writeShellScriptBin "generate" ''
          #!/usr/bin/env bash
          set -euo pipefail

          dataModelXlsx="$1"
          targetDirectory="$2"

          git clone ${assetFrameworkRepo} /tmp/asset-framework
          cd /tmp/asset-framework

          # Set PATH to use specific Node.js version and Yarn from Nix store
          export PATH=${nodejs1}/bin:${yarn}/bin:$PATH

          yarn install

          # Run the 'yarn generate' command
          yarn generate "$dataModelXlsx" "$targetDirectory"
        '';

      in {
        # Define the 'generate' package that users can run
        packages.generate = generateScript;

        # Define the 'generate' app for convenience
        apps.generate = {
          type = "app";
          program = "${generateScript}/bin/generate";
        };

        # Default package (for convenience)
        defaultPackage = self.packages.${system}.generate;

        # Default app (for convenience)
        defaultApp = self.apps.${system}.generate;
      }
    );
}

