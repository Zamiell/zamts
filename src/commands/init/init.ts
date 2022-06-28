import commandExists from "command-exists";
import path from "path";
import { promptGitHubRepoOrGitRemoteURL } from "../../git";
import { getPackageManagerUsedForNewProject } from "../../packageManager";
import { Args } from "../../parseArgs";
import { checkIfProjectPathExists } from "./checkIfProjectPathExists";
import { createProject } from "./createProject";
import { getAuthorName } from "./getAuthorName";
import { getProjectPath } from "./getProjectPath";
import { installVSCodeExtensions } from "./installVSCodeExtensions";
import { promptVSCode } from "./promptVSCode";

export async function init(args: Args): Promise<void> {
  const packageManager = getPackageManagerUsedForNewProject(args);
  const noGit = args.noGit === true;
  const skipNPMInstall = args.skipInstall === true;
  const useCurrentDir = args.useCurrentDir === true;
  const verbose = args.verbose === true;
  const vscode = args.vscode === true;
  const yes = args.yes === true;
  const forceName = args.forceName === true;

  // Prompt the end-user for some information (and validate it as we go).
  const [projectPath, createNewDir] = await getProjectPath(
    args,
    useCurrentDir,
    yes,
    forceName,
  );
  await checkIfProjectPathExists(projectPath, yes, verbose);
  const authorName = await getAuthorName(verbose);
  const projectName = path.basename(projectPath);
  const gitRemoteURL = await promptGitHubRepoOrGitRemoteURL(
    projectName,
    noGit,
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
    packageManager,
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
