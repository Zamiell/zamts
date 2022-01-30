import commandExists from "command-exists";
import path from "path";
import yaml from "yaml";
import * as file from "./file";
import { GitHubCLIHostsYAML } from "./types/GitHubCLIHostsYAML";

export function getGitHubUsername(): string | null {
  // If the GitHub CLI is installed, we can derive the user's GitHub username
  if (
    !commandExists.sync("gh") ||
    process.env.APPDATA === undefined ||
    process.env.APPDATA === ""
  ) {
    return null;
  }

  const githubCLIHostsPath = path.join(
    process.env.APPDATA,
    "GitHub CLI",
    "hosts.yml",
  );
  if (!file.exists(githubCLIHostsPath)) {
    return null;
  }

  const configYAMLRaw = file.read(githubCLIHostsPath);
  const configYAML = yaml.parse(configYAMLRaw) as GitHubCLIHostsYAML;

  const githubCom = configYAML["github.com"];
  if (githubCom === undefined) {
    return null;
  }

  const { user } = githubCom;
  if (user === "") {
    return null;
  }

  return user;
}
