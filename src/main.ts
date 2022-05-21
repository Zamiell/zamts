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
import { ensureAllCases, error } from "./utils";
import { validateNodeVersion } from "./validateNodeVersion";

main().catch((err) => {
  error(`${PROJECT_NAME} failed:`, err);
});

async function main(): Promise<void> {
  sourceMapSupport.install();
  promptInit();
  validateNodeVersion();

  // Load environment variables from the ".env" file.
  const envFile = path.join(CWD, ".env");
  dotenv.config({ path: envFile });

  // Get command line arguments.
  const argv = parseArgs();
  const verbose = argv["verbose"] === true;

  printBanner();

  // Check for a new version.
  updateNotifier({ pkg }).notify();

  // Pre-flight checks.
  await checkForWindowsTerminalBugs(verbose);

  await handleCommands(argv);
  process.exit(0);
}

function printBanner() {
  const bannerText = figlet.textSync(PROJECT_NAME);
  console.log(chalk.green(bannerText));

  const version = `v${pkg.version}`;
  const bannerTextLines = bannerText.split("\n");
  const firstBannerTextLine = bannerTextLines[0];
  if (firstBannerTextLine === undefined) {
    throw new Error("Failed to get the first line of the banner text.");
  }
  const bannerLength = firstBannerTextLine.length;
  const leftPaddingAmount = Math.floor((bannerLength + version.length) / 2);
  console.log(version.padStart(leftPaddingAmount));

  console.log();
}

async function handleCommands(argv: Record<string, unknown>) {
  const positionalArgs = argv["_"] as string[];
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
