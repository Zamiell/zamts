import chalk from "chalk";
import { spawnSync, SpawnSyncReturns } from "child_process";
import { CWD } from "./constants";

export const ensureAllCases = (obj: never): never => obj;

export function error(...args: unknown[]): never {
  console.error(...args);
  process.exit(1);
}

/** Returns an array of exit status and stdout. */
export function execShell(
  command: string,
  args: string[] = [],
  allowFailure = false,
  cwd = CWD,
): [number | null, string] {
  // On Windows, "spawnSync()" will not account for spaces in arguments
  // Thus, wrap everything in a double quote
  // This will cause arguments that naturally have double quotes to fail
  if (command.includes('"')) {
    throw new Error(
      "execShell cannot execute commands with double quotes in the command.",
    );
  }
  for (let i = 0; i < args.length; i++) {
    if (args[i].includes('"')) {
      throw new Error(
        "execShell cannot execute commands with double quotes in the arguments.",
      );
    }

    args[i] = `"${args[i]}"`; // eslint-disable-line no-param-reassign
  }

  const commandDescription = `${command} ${args.join(" ")}`.trim();

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

  const exitStatus = spawnSyncReturns.status;
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
