import { getGitHubUsername } from "../../github";
import { getInputString } from "../../prompt";
import { error } from "../../util";

export async function getAuthorName(): Promise<string> {
  const gitHubUsername = getGitHubUsername();
  if (gitHubUsername !== null) {
    return gitHubUsername;
  }

  return getNewAuthorName();
}

async function getNewAuthorName(): Promise<string> {
  console.log(
    "The author name was not found from the GitHub CLI configuration file.",
  );
  const authorName = await getInputString("Enter the author of the project:");
  if (authorName.length === 0) {
    error("You must enter an author name.");
  }

  return authorName;
}
