import chalk from "chalk";
import commandExists from "command-exists";
import path from "path";
import {
  GITIGNORE,
  GITIGNORE_TEMPLATE_PATH,
  PACKAGE_JSON,
  PACKAGE_JSON_TEMPLATE_PATH,
  PROJECT_NAME,
  README_MD,
  README_MD_TEMPLATES_PATH,
  TEMPLATES_STATIC_DIR,
} from "../../constants";
import * as file from "../../file";
import { getGitHubUsername } from "../../github";
import { getInputString } from "../../prompt";
import { execShell } from "../../util";

export async function createProject(
  projectName: string,
  projectPath: string,
  authorName: string,
  createNewDir: boolean,
  skipNPMInstall: boolean,
): Promise<void> {
  if (createNewDir) {
    file.makeDir(projectPath);
  }

  copyStaticFiles(projectPath);
  copyDynamicFiles(projectName, projectPath, authorName);
  updateNodeModules(projectPath);
  await initGitRepository(projectPath, projectName);
  installNodeModules(projectPath, skipNPMInstall);

  console.log(`Successfully created project: ${chalk.green(projectName)}`);
}

// Copy static files, like ".eslintrc.js", "tsconfig.json", etc.
function copyStaticFiles(projectPath: string) {
  const staticFileList = file.getDirList(TEMPLATES_STATIC_DIR);
  staticFileList.forEach((fileName: string) => {
    const templateFilePath = path.join(TEMPLATES_STATIC_DIR, fileName);
    const destinationFilePath = path.join(projectPath, fileName);
    if (!file.exists(destinationFilePath)) {
      file.copy(templateFilePath, destinationFilePath);
    }
  });
}

// Copy files that need to have text replaced inside of them
function copyDynamicFiles(
  projectName: string,
  projectPath: string,
  authorName: string,
) {
  // ".gitignore"
  {
    const fileName = GITIGNORE;
    const templatePath = GITIGNORE_TEMPLATE_PATH;
    const template = file.read(templatePath);

    // Prepend a header with the project name
    let separatorLine = "# ";
    for (let i = 0; i < projectName.length; i++) {
      separatorLine += "-";
    }
    separatorLine += "\n";
    const gitignoreHeader = `${separatorLine}# ${projectName}\n${separatorLine}\n`;
    const gitignore = gitignoreHeader + template;

    const destinationPath = path.join(projectPath, `.${fileName}`); // We need to prepend a period
    file.write(destinationPath, gitignore);
  }

  // "package.json"
  {
    // Modify and copy the file
    const fileName = PACKAGE_JSON;
    const templatePath = PACKAGE_JSON_TEMPLATE_PATH;
    const template = file.read(templatePath);
    const packageJSON = template
      .replaceAll("PROJECT_NAME", projectName)
      .replaceAll("AUTHOR_NAME", authorName);
    const destinationPath = path.join(projectPath, fileName);
    file.write(destinationPath, packageJSON);
  }

  // "README.md"
  {
    const fileName = README_MD;
    const templatePath = README_MD_TEMPLATES_PATH;
    const template = file.read(templatePath);
    const readmeMD = template.replaceAll("PROJECT_NAME", projectName);
    const destinationPath = path.join(projectPath, fileName);
    file.write(destinationPath, readmeMD);
  }
}

function updateNodeModules(projectPath: string) {
  console.log("Finding out the latest versions of the NPM packages...");
  execShell(
    "npx",
    ["npm-check-updates", "--upgrade", "--packageFile", "package.json"],
    false,
    projectPath,
  );
}

async function initGitRepository(projectPath: string, projectName: string) {
  if (!commandExists.sync("git")) {
    console.log(
      'Git does not seem to be installed. (The "git" command is not in the path.) Skipping Git-related things.',
    );
    return;
  }

  const remoteURL = await getGitRemoteURL(projectName);
  if (remoteURL === "") {
    return;
  }

  execShell("git", ["init"], false, projectPath);
  execShell("git", ["branch", "-M", "main"], false, projectPath);
  execShell("git", ["remote", "add", "origin", remoteURL], false, projectPath);
  if (isGitNameAndEmailConfigured()) {
    execShell("git", ["add", "--all"], false, projectPath);
    execShell(
      "git",
      ["commit", "--message", `${PROJECT_NAME} template`],
      false,
      projectPath,
    );
  }
}

async function getGitRemoteURL(projectName: string) {
  const gitRemoteURL = getRemoteGitURLFromGitHub(projectName);
  if (gitRemoteURL !== null) {
    return gitRemoteURL;
  }

  return getInputString(`Paste in the remote Git URL for your project.
For example, if you have an SSH key, it would be something like:
${chalk.green("git@github.com:Alice/green-candle.git")}
If you don't have an SSH key, it would be something like:
${chalk.green("https://github.com/Alice/green-candle.git")}
If you don't want to initialize a Git repository for this project, press enter to skip.
`);
}

function getRemoteGitURLFromGitHub(projectName: string): string | null {
  const gitHubUsername = getGitHubUsername();
  if (gitHubUsername === undefined) {
    return null;
  }

  return `git@github.com:${gitHubUsername}/${projectName}.git`;
}

function isGitNameAndEmailConfigured() {
  const [nameExitStatus] = execShell(
    "git",
    ["config", "--global", "user.name"],
    true,
  );

  const [emailExitStatus] = execShell(
    "git",
    ["config", "--global", "user.email"],
    true,
  );

  return nameExitStatus === 0 && emailExitStatus === 0;
}

function installNodeModules(projectPath: string, skipNPMInstall: boolean) {
  if (skipNPMInstall) {
    return;
  }

  console.log("Installing node modules... (This can take a long time.)");
  execShell("npm", ["install"], false, projectPath);
}
