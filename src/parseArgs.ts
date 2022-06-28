import yargs from "yargs";

export interface Args {
  _: string[];

  // init
  name?: string;
  yes?: boolean;
  useCurrentDir?: boolean;
  vscode?: boolean;
  npm?: boolean;
  yarn?: boolean;
  pnpm?: boolean;
  noGit?: boolean;
  skipInstall?: boolean;
  forceName?: boolean;

  // shared
  verbose?: boolean;
}

export function parseArgs(): Args {
  const yargsObject = yargs(process.argv.slice(2))
    .strict()
    .usage("usage: zamts <command> [options]")
    .scriptName("zamts")

    .alias("h", "help") // By default, only "--help" is enabled
    .alias("v", "version") // By default, only "--version" is enabled

    .command("init [name]", "Initialize a new TypeScript project.", (builder) =>
      builder
        .option("yes", {
          alias: "y",
          type: "boolean",
          description:
            'Answer yes to every dialog option, similar to how "npm init --yes" works.',
        })
        .option("use-current-dir", {
          alias: "u",
          type: "boolean",
          description: "Use the current directory as the root for the project",
        })
        .option("vscode", {
          alias: "c",
          type: "boolean",
          description: "Open the project in VSCode after initialization",
        })
        .option("npm", {
          alias: "n",
          type: "boolean",
          description: "Use NPM as the package manager instead of Yarn",
        })
        .option("yarn", {
          type: "boolean",
          description: "Use yarn as the package manager",
        })
        .option("pnpm", {
          alias: "p",
          type: "boolean",
          description: "Use pnpm as the package manager",
        })
        .option("no-git", {
          alias: "g",
          type: "boolean",
          description: "Do not initialize Git",
        })
        .option("skip-install", {
          alias: "i",
          type: "boolean",
          description:
            "Don't automatically install the dependencies after initializing the project",
        })
        .option("force-name", {
          alias: "f",
          type: "boolean",
          description: "Allow project names that are normally illegal",
        })
        .option("verbose", {
          alias: "v",
          type: "boolean",
          description: "Enable verbose output",
        }),
    )

    .parseSync();

  return yargsObject as Args;
}
