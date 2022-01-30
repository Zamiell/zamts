import commandExists from "command-exists";
import path from "path";
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

function getVSCodeCommand(): string | null {
  for (const VSCodeCommand of ["code", "codium", "code-oss", "code-insiders"]) {
    if (commandExists.sync(VSCodeCommand)) {
      return VSCodeCommand;
    }
  }

  return null;
}
