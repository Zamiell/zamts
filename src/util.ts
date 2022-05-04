import chalk from "chalk";
import { spawnSync, SpawnSyncReturns } from "child_process";
import { CWD } from "./constants";

/** From: https://github.com/expandjs/expandjs/blob/master/lib/kebabCaseRegex.js */
const KEBAB_CASE_REGEX =
  /^([a-z](?![\d])|[\d](?![a-z]))+(-?([a-z](?![\d])|[\d](?![a-z])))*$|^$/;

export const ensureAllCases = (obj: never): never => obj;

export function error(...args: unknown[]): never {
  console.error(...args);
  process.exit(1);
}

/** Returns an array of exit status and stdout. */
export function execShell(
  command: string,
  args: string[] = [],
  verbose = false,
  allowFailure = false,
  cwd = CWD,
): [exitStatus: number, stdout: string] {
  // On Windows, "spawnSync()" will not account for spaces in arguments
  // Thus, wrap everything in a double quote
  // This will cause arguments that naturally have double quotes to fail
  if (command.includes('"')) {
    throw new Error(
      "execShell cannot execute commands with double quotes in the command.",
    );
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg !== undefined && arg.includes('"')) {
      throw new Error(
        "execShell cannot execute commands with double quotes in the arguments.",
      );
    }

    args[i] = `"${args[i]}"`; // eslint-disable-line no-param-reassign
  }

  const commandDescription = `${command} ${args.join(" ")}`.trim();

  if (verbose) {
    console.log(`Executing command: ${commandDescription}`);
  }

  let spawnSyncReturns: SpawnSyncReturns<Buffer>;
  try {
    spawnSyncReturns = spawnSync(command, args, {
      shell: true,
      cwd,
    });
  } catch (err) {
    error(
      `Failed to run the "${chalk.green(commandDescription)}" command:`,
      err,
    );
  }

  if (verbose) {
    console.log(`Executed command: ${commandDescription}`);
  }

  const exitStatus = spawnSyncReturns.status;
  if (exitStatus === null) {
    error(`Failed to get the return status of command: ${commandDescription}`);
  }

  const stdout = spawnSyncReturns.output.join("\n").trim();

  if (exitStatus !== 0) {
    if (allowFailure) {
      return [exitStatus, stdout];
    }

    console.error(
      `Failed to run the "${chalk.green(
        commandDescription,
      )}" command with an exit code of ${exitStatus}.`,
    );
    console.error("The output was as follows:");
    console.error(stdout);
    process.exit(1);
  }

  return [exitStatus, stdout];
}

// From: https://stackoverflow.com/questions/1731190/check-if-a-string-has-white-space
export function hasWhiteSpace(s: string): boolean {
  return /\s/g.test(s);
}

export function isKebabCase(s: string): boolean {
  return KEBAB_CASE_REGEX.test(s);
}

/**
 * parseIntSafe is a more reliable version of parseInt. By default, "parseInt('1a')" will return
 * "1", which is unexpected. This returns either an integer or NaN.
 */
function parseIntSafe(input: unknown): number {
  if (typeof input !== "string") {
    return NaN;
  }

  // Remove all leading and trailing whitespace
  let trimmedInput = input.trim();

  const isNegativeNumber = trimmedInput.startsWith("-");
  if (isNegativeNumber) {
    // Remove the leading minus sign before we match the regular expression
    trimmedInput = trimmedInput.substring(1);
  }

  if (/^\d+$/.exec(trimmedInput) === null) {
    // "\d" matches any digit (same as "[0-9]")
    return NaN;
  }

  if (isNegativeNumber) {
    // Add the leading minus sign back
    trimmedInput = `-${trimmedInput}`;
  }

  return parseInt(trimmedInput, 10);
}

export function parseSemVer(
  versionString: string,
): [major: number, minor: number, patch: number] {
  const match = /^v*(\d+)\.(\d+)\.(\d+)/g.exec(versionString);
  if (match === null) {
    error(`Failed to parse the version string of: ${versionString}`);
  }

  const [, majorVersionString, minorVersionString, patchVersionString] = match;

  const majorVersion = parseIntSafe(majorVersionString);
  if (Number.isNaN(majorVersion)) {
    error(`Failed to parse the major version number from: ${versionString}`);
  }

  const minorVersion = parseIntSafe(minorVersionString);
  if (Number.isNaN(minorVersion)) {
    error(`Failed to parse the minor version number from: ${versionString}`);
  }

  const patchVersion = parseIntSafe(patchVersionString);
  if (Number.isNaN(patchVersion)) {
    error(`Failed to parse the patch version number from: ${versionString}`);
  }

  return [majorVersion, minorVersion, patchVersion];
}
