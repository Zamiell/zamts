#!/usr/bin/env node

import chalk from "chalk";
import * as dotenv from "dotenv";
import figlet from "figlet";
import path from "path";
import sourceMapSupport from "source-map-support";
import updateNotifier from "update-notifier";
import pkg from "../package.json";
import { checkForWindowsTerminalBugs } from "./checkForWindowsTerminalBugs";
import { init } from "./commands/init/init";
import { CWD, PROJECT_NAME } from "./constants";
import { parseArgs } from "./parseArgs";
import { promptInit } from "./prompt";
import { Command, DEFAULT_COMMAND } from "./types/Command";
import { ensureAllCases, error } from "./util";
import { validateNodeVersion } from "./validateNodeVersion";

main().catch((err) => {
  error(`${PROJECT_NAME} failed:`, err);
});

async function main(): Promise<void> {
  sourceMapSupport.install();
  promptInit();
  validateNodeVersion();

  // Load environment variables from the ".env" file
  const envFile = path.join(CWD, ".env");
  dotenv.config({ path: envFile });

  // Get command line arguments
  const argv = parseArgs();

  printBanner();

  // Check for a new version
  updateNotifier({ pkg }).notify();

  // Pre-flight checks
  await checkForWindowsTerminalBugs();

  await handleCommands(argv);
  process.exit(0);
}

function printBanner() {
  console.log(chalk.green(figlet.textSync(PROJECT_NAME)));
  const bannerLength = 29; // From measuring the banner created by Figlet
  const version = `v${pkg.version}`;
  const leftPaddingAmount = Math.floor((bannerLength + version.length) / 2);
  console.log(version.padStart(leftPaddingAmount));
  console.log();
}

async function handleCommands(argv: Record<string, unknown>) {
  const positionalArgs = argv._ as string[];
  let command: Command;
  if (positionalArgs.length > 0) {
    command = positionalArgs[0] as Command;
  } else {
    command = DEFAULT_COMMAND;
  }

  switch (command) {
    case "init": {
      await init(argv);
      break;
    }

    default: {
      ensureAllCases(command);
      break;
    }
  }
}
