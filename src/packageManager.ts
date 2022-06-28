import commandExists from "command-exists";
import { Args } from "./parseArgs";
import { PackageManager } from "./types/PackageManager";
import { ensureAllCases, error } from "./utils";

const PACKAGE_MANAGER_LOCK_FILE_NAMES: {
  readonly [key in PackageManager]: string;
} = {
  [PackageManager.NPM]: "package-lock.json",
  [PackageManager.YARN]: "yarn.lock",
  [PackageManager.PNPM]: "pnpm-lock.yaml",
} as const;

export function getPackageManagerLockFileName(
  packageManager: PackageManager,
): string {
  return PACKAGE_MANAGER_LOCK_FILE_NAMES[packageManager];
}

export function getPackageManagerInstallCommand(
  packageManager: PackageManager,
): [command: string, args: string[]] {
  switch (packageManager) {
    case PackageManager.NPM: {
      return ["npm", ["install"]];
    }

    case PackageManager.YARN: {
      return ["yarn", ["install"]];
    }

    case PackageManager.PNPM: {
      return ["pnpm", ["install"]];
    }

    default: {
      return ensureAllCases(packageManager);
    }
  }
}

export function getPackageManagerInstallCICommand(
  packageManager: PackageManager,
): string {
  switch (packageManager) {
    case PackageManager.NPM: {
      return "npm ci";
    }

    case PackageManager.YARN: {
      return "yarn install --frozen-lockfile";
    }

    case PackageManager.PNPM: {
      return "pnpm install --frozen-lockfile";
    }

    default: {
      return ensureAllCases(packageManager);
    }
  }
}

export function getPackageManagerUsedForNewProject(args: Args): PackageManager {
  const packageManagerFromArgs = getPackageManagerFromArgs(args);
  if (packageManagerFromArgs !== undefined) {
    return packageManagerFromArgs;
  }

  if (commandExists.sync("yarn")) {
    return PackageManager.YARN;
  }

  if (commandExists.sync("pnpm")) {
    return PackageManager.PNPM;
  }

  return PackageManager.NPM;
}

function getPackageManagerFromArgs(args: Args) {
  const npm = args.npm === true;
  if (npm) {
    const npmExists = commandExists.sync("npm");
    if (!npmExists) {
      error(
        'You specified the "npm" flag, but "npm" does not seem to be a valid command.',
      );
    }

    return PackageManager.NPM;
  }

  const yarn = args.yarn === true;
  if (yarn) {
    const yarnExists = commandExists.sync("npm");
    if (!yarnExists) {
      error(
        'You specified the "yarn" flag, but "yarn" does not seem to be a valid command.',
      );
    }

    return PackageManager.YARN;
  }

  const pnpm = args.pnpm === true;
  if (pnpm) {
    const pnpmExists = commandExists.sync("pnpm");
    if (!pnpmExists) {
      error(
        'You specified the "pnpm" flag, but "pnpm" does not seem to be a valid command.',
      );
    }

    return PackageManager.PNPM;
  }

  return undefined;
}
