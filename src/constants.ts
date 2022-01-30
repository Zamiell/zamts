import os from "os";
import path from "path";

const cwd = process.cwd();

// https://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
const homeDir = os.homedir();

export const CURRENT_DIRECTORY_NAME = path.basename(cwd);
export const CWD = cwd;
export const HOME_DIR = homeDir;
export const PROJECT_NAME = "zamts";

// zamts
const REPO_ROOT = path.join(__dirname, "..", "..");

// zamts/file-templates
const TEMPLATES_DIR = path.join(REPO_ROOT, "file-templates");

// zamts/file-templates/static
export const TEMPLATES_STATIC_DIR = path.join(TEMPLATES_DIR, "static");

// isaacscript/file-templates/dynamic
const TEMPLATES_DYNAMIC_DIR = path.join(TEMPLATES_DIR, "dynamic");
export const GITIGNORE = "gitignore"; // Not named ".gitignore" to prevent NPM from deleting it
export const GITIGNORE_TEMPLATE_PATH = path.join(
  TEMPLATES_DYNAMIC_DIR,
  GITIGNORE,
);
export const MAIN_TS = "main.ts";
export const MAIN_TS_TEMPLATE_PATH = path.join(TEMPLATES_DYNAMIC_DIR, MAIN_TS);
export const PACKAGE_JSON = "package.json";
export const PACKAGE_JSON_TEMPLATE_PATH = path.join(
  TEMPLATES_DYNAMIC_DIR,
  PACKAGE_JSON,
);
export const README_MD = "README.md";
export const README_MD_TEMPLATES_PATH = path.join(
  TEMPLATES_DYNAMIC_DIR,
  README_MD,
);
