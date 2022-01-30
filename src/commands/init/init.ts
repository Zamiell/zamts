import chalk from "chalk";
import commandExists from "command-exists";
import path from "path";
import { CWD, PROJECT_NAME } from "../../constants";
import { checkIfProjectPathExists } from "./checkIfProjectPathExists";
import { createProject } from "./createProject";
import { getAuthorName } from "./getAuthorName";
import { getProjectPath } from "./getProjectPath";
import { installVSCodeExtensions } from "./installVSCodeExtensions";
import { promptVSCode } from "./promptVSCode";

export async function init(argv: Record<string, unknown>): Promise<void> {
  // Prompt the end-user for some information (and validate it as we go)
  const [projectPath, createNewDir] = await getProjectPath(argv);
  await checkIfProjectPathExists(projectPath);
  const authorName = await getAuthorName();
  const projectName = path.basename(projectPath);
  const skipNPMInstall = argv.skipNpmInstall === true;

  await createProject(
    projectName,
    projectPath,
    authorName,
    createNewDir,
    skipNPMInstall,
  );
  await openVSCode(projectPath, argv);
  printFinishMessage(projectPath, projectName);
}

async function openVSCode(projectPath: string, argv: Record<string, unknown>) {
  const VSCodeCommand = getVSCodeCommand();
  if (VSCodeCommand === null) {
    console.log(
      'VSCode does not seem to be installed. (The "code" command is not in the path.) Skipping VSCode-related things.',
    );
    return;
  }

  installVSCodeExtensions(projectPath, VSCodeCommand);
  await promptVSCode(projectPath, argv, VSCodeCommand);
}

function getVSCodeCommand() {
  for (const VSCodeCommand of ["code", "codium", "code-oss", "code-insiders"]) {
    if (commandExists.sync(VSCodeCommand)) {
      return VSCodeCommand;
    }
  }

  return null;
}

function printFinishMessage(projectPath: string, projectName: string) {
  let commandsToType = "";
  if (projectPath !== CWD) {
    commandsToType += `"${chalk.green(`cd ${projectName}`)}" and `;
  }
  commandsToType += `"${chalk.green("npx isaacscript")}"`;
  console.log(`Now, start ${PROJECT_NAME} by typing ${commandsToType}.`);
}
