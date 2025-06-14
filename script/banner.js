/**
 * @param {string} packageName - package name
 * @param {string} version - package version
 * @param {string} [gitRepo] - Git repository URL
 * @returns {string} - formatted banner string
 */
export function createBanner(packageName, version, gitRepo) {
  if (gitRepo.startsWith("git+")) {
    gitRepo = gitRepo.slice(4);
  }
  if (gitRepo.endsWith(".git")) {
    gitRepo = gitRepo.slice(0, -4);
  }

  return `/**
 * ${packageName} v${version}
 * 
 * Copyright (c) ${new Date().getFullYear()} Da'Inihlus
 * License: MIT
 * ${gitRepo ? `Repository: ${gitRepo}` : ""}
 */
`;
}
