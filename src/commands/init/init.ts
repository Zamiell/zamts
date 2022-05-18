import commandExists from "command-exists";
import path from "path";
import { promptGitHubRepoOrGitRemoteURL } from "../../git";
import { checkIfProjectPathExists } from "./checkIfProjectPathExists";
import { createProject } from "./createProject";
import { getAuthorName } from "./getAuthorName";
import { getProjectPath } from "./getProjectPath";
import { installVSCodeExtensions } from "./installVSCodeExtensions";
import { promptVSCode } from "./promptVSCode";

export async function init(argv: Record<string, unknown>): Promise<void> {
  const skipNPMInstall = argv["skipNpmInstall"] === true;
  const useCurrentDir = argv["useCurrentDir"] === true;
  const verbose = argv["verbose"] === true;
  const vscode = argv["vscode"] === true;
  const yes = argv["yes"] === true;
  const forceName = argv["forceName"] === true;

  // Prompt the end-user for some information (and validate it as we go).
  const [projectPath, createNewDir] = await getProjectPath(
    argv,
    useCurrentDir,
    yes,
    forceName,
  );
  await checkIfProjectPathExists(projectPath, yes, verbose);
  const authorName = await getAuthorName(verbose);
  const projectName = path.basename(projectPath);
  const gitRemoteURL = await promptGitHubRepoOrGitRemoteURL(
    projectName,
    yes,
    verbose,
  );

  // Now that we have asked the user all of the questions we need, we can create the project.
  createProject(
    projectName,
    projectPath,
    authorName,
    createNewDir,
    gitRemoteURL,
    skipNPMInstall,
    verbose,
  );

  await openVSCode(projectPath, vscode, verbose);
}

async function openVSCode(
  projectPath: string,
  vscode: boolean,
  verbose: boolean,
) {
  const VSCodeCommand = getVSCodeCommand();
  if (VSCodeCommand === undefined) {
    console.log(
      'VSCode does not seem to be installed. (The "code" command is not in the path.) Skipping VSCode-related things.',
    );
    return;
  }

  installVSCodeExtensions(projectPath, VSCodeCommand, verbose);
  await promptVSCode(projectPath, VSCodeCommand, vscode, verbose);
}

function getVSCodeCommand(): string | undefined {
  for (const VSCodeCommand of ["code", "codium", "code-oss", "code-insiders"]) {
    if (commandExists.sync(VSCodeCommand)) {
      return VSCodeCommand;
    }
  }

  return undefined;
}
