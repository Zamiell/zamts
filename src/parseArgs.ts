import yargs from "yargs";

export function parseArgs(): Record<string, unknown> {
  const yargsObject = yargs(process.argv.slice(2))
    .strict()
    .usage("usage: zamts <command> [options]")
    .scriptName("zamts")

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
        .option("skip-npm-install", {
          alias: "i",
          type: "boolean",
          description:
            'Don\'t automatically run "npm install" after initializing the project',
        })
        .option("verbose", {
          alias: "v",
          type: "boolean",
          description: "Enable verbose output",
        }),
    )

    .alias("h", "help") // By default, only "--help" is enabled
    .alias("v", "version"); // By default, only "--version" is enabled

  return yargsObject.argv as Record<string, unknown>;
}
