import chalk from "chalk";
import path from "path";
import {
  GITIGNORE,
  GITIGNORE_TEMPLATE_PATH,
  PACKAGE_JSON,
  PACKAGE_JSON_TEMPLATE_PATH,
  README_MD,
  README_MD_TEMPLATES_PATH,
  TEMPLATES_STATIC_DIR,
} from "../../constants";
import * as file from "../../file";
import { initGitRepository } from "../../git";
import { PackageManager } from "../../types/PackageManager";
import { ensureAllCases, execShell } from "../../utils";

export function createProject(
  projectName: string,
  projectPath: string,
  authorName: string,
  createNewDir: boolean,
  gitRemoteURL: string | undefined,
  skipInstall: boolean,
  packageManager: PackageManager,
  verbose: boolean,
): void {
  if (createNewDir) {
    file.makeDir(projectPath, verbose);
  }

  copyStaticFiles(projectPath, verbose);
  copyDynamicFiles(projectName, projectPath, authorName, verbose);
  updateNodeModules(projectPath, verbose);
  installNodeModules(projectPath, skipInstall, packageManager, verbose);
  formatFiles(projectPath, verbose);

  // Only make the initial commit once all of the files have been copied and formatted.
  initGitRepository(projectPath, gitRemoteURL, verbose);

  console.log(`Successfully created project: ${chalk.green(projectName)}`);
}

// Copy static files, like ".eslintrc.js", "tsconfig.json", etc.
function copyStaticFiles(projectPath: string, verbose: boolean) {
  const staticFileList = file.getDirList(TEMPLATES_STATIC_DIR, verbose);
  staticFileList.forEach((fileName: string) => {
    const templateFilePath = path.join(TEMPLATES_STATIC_DIR, fileName);
    const destinationFilePath = path.join(projectPath, fileName);
    if (!file.exists(destinationFilePath, verbose)) {
      file.copy(templateFilePath, destinationFilePath, verbose);
    }
  });
}

// Copy files that need to have text replaced inside of them.
function copyDynamicFiles(
  projectName: string,
  projectPath: string,
  authorName: string,
  verbose: boolean,
) {
  // `.gitignore`
  {
    const fileName = GITIGNORE;
    const templatePath = GITIGNORE_TEMPLATE_PATH;
    const template = file.read(templatePath, verbose);

    // Prepend a header with the project name.
    let separatorLine = "# ";
    for (let i = 0; i < projectName.length; i++) {
      separatorLine += "-";
    }
    separatorLine += "\n";
    const gitignoreHeader = `${separatorLine}# ${projectName}\n${separatorLine}\n`;
    const gitignore = gitignoreHeader + template;

    const destinationPath = path.join(projectPath, `.${fileName}`); // We need to prepend a period
    file.write(destinationPath, gitignore, verbose);
  }

  // `package.json`
  {
    // Modify and copy the file.
    const fileName = PACKAGE_JSON;
    const templatePath = PACKAGE_JSON_TEMPLATE_PATH;
    const template = file.read(templatePath, verbose);
    const packageJSON = template
      .replaceAll("PROJECT_NAME", projectName)
      .replaceAll("AUTHOR_NAME", authorName);
    const destinationPath = path.join(projectPath, fileName);
    file.write(destinationPath, packageJSON, verbose);
  }

  // `README.md`
  {
    const fileName = README_MD;
    const templatePath = README_MD_TEMPLATES_PATH;
    const template = file.read(templatePath, verbose);
    const readmeMD = template.replaceAll("PROJECT_NAME", projectName);
    const destinationPath = path.join(projectPath, fileName);
    file.write(destinationPath, readmeMD, verbose);
  }
}

function updateNodeModules(projectPath: string, verbose: boolean) {
  console.log("Finding out the latest versions of the NPM packages...");
  execShell(
    "npx",
    ["npm-check-updates", "--upgrade", "--packageFile", "package.json"],
    verbose,
    false,
    projectPath,
  );
}

function installNodeModules(
  projectPath: string,
  skipInstall: boolean,
  packageManager: PackageManager,
  verbose: boolean,
) {
  if (skipInstall) {
    return;
  }

  console.log("Installing node modules... (This can take a long time.)");

  switch (packageManager) {
    case PackageManager.NPM: {
      execShell("npm", ["install"], verbose, false, projectPath);
      break;
    }

    case PackageManager.Yarn: {
      execShell("yarn", [], verbose, false, projectPath);
      break;
    }

    default: {
      ensureAllCases(packageManager);
    }
  }
}

function formatFiles(projectPath: string, verbose: boolean) {
  execShell(
    "npx",
    ["prettier", "--write", projectPath],
    verbose,
    false,
    projectPath,
  );
}
