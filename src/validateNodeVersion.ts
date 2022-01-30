import chalk from "chalk";
import { PROJECT_NAME } from "./constants";
import { error } from "./util";

const REQUIRED_MAJOR_VERSION = 16;

// This program requires Node to be at least v16.0.0,
// since that is the version that added the "fs.rmSync()" function
// (I tested on Node v15.0.0 and it failed)
export function validateNodeVersion(): void {
  const { version } = process;

  const match = /^v(\d+)\.(\d+)\.(\d)+$/g.exec(version);
  if (match === null) {
    error(`Failed to parse your NodeJS version of: ${version}`);
  }

  const majorVersionString = match[1];
  const majorVersion = parseInt(majorVersionString, 10);
  if (Number.isNaN(majorVersion)) {
    error(
      `Failed to parse the major version number from: ${majorVersionString}`,
    );
  }

  const minorVersionString = match[2];
  const minorVersion = parseInt(minorVersionString, 10);
  if (Number.isNaN(minorVersion)) {
    error(
      `Failed to parse the minor version number from: ${minorVersionString}`,
    );
  }

  const patchVersionString = match[3];
  const patchVersion = parseInt(patchVersionString, 10);
  if (Number.isNaN(patchVersion)) {
    error(
      `Failed to parse the patch version number from: ${patchVersionString}`,
    );
  }

  if (majorVersion >= REQUIRED_MAJOR_VERSION) {
    return;
  }

  console.error(
    `Your Node.js version is: ${chalk.red(
      `${majorVersionString}.${minorVersionString}.${patchVersionString}`,
    )}`,
  );
  console.error(
    `${PROJECT_NAME} requires a Node.js version of ${chalk.red(
      "16.0.0",
    )} or greater.`,
  );
  console.error(
    `Please upgrade your version of Node.js before using ${PROJECT_NAME}.`,
  );
  process.exit(1);
}
