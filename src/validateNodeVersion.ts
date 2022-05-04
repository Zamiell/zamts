import chalk from "chalk";
import { PROJECT_NAME } from "./constants";
import { parseSemVer } from "./util";

const REQUIRED_MAJOR_VERSION = 16;

// This program requires Node to be at least v16.0.0,
// since that is the version that added the "fs.rmSync()" function
// (I tested on Node v15.0.0 and it failed)
export function validateNodeVersion(): void {
  const { version } = process;

  const [major, minor, patch] = parseSemVer(version);
  if (major >= REQUIRED_MAJOR_VERSION) {
    return;
  }

  console.error(
    `Your Node.js version is: ${chalk.red(`${major}.${minor}.${patch}`)}`,
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
