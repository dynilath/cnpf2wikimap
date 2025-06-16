#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getLatestTag() {
  try {
    return execSync("git describe --tags --abbrev=0").toString().trim();
  } catch {
    return null;
  }
}

function getCurrentCommitTags() {
  try {
    return execSync("git tag --points-at HEAD").toString().trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function isSemver(tag) {
  return /^v?\d+\.\d+\.\d+$/.test(tag);
}

function bumpVersion(version, type) {
  let [major, minor, patch] = version.replace(/^v/, "").split(".").map(Number);
  if (type === "minor") {
    minor++;
    patch = 0;
  } else {
    patch++;
  }
  return `${major}.${minor}.${patch}`;
}

function getCommitsSinceTag(tag) {
  if (!tag) return execSync("git log --pretty=%s").toString().split("\n");
  return execSync(`git log ${tag}..HEAD --pretty=%s`).toString().split("\n");
}

function main() {
  const pkgPath = path.resolve(__dirname, "../package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  const latestTag = getLatestTag();
  const currentTags = getCurrentCommitTags();
  const hasSemverTag = currentTags.some(isSemver);

  if (hasSemverTag) {
    console.log("Current commit already has a semver tag. Skip version bump.");
    return;
  }

  let currentVersion = latestTag && isSemver(latestTag) ? latestTag.replace(/^v/, "") : pkg.version;
  const commits = getCommitsSinceTag(latestTag && isSemver(latestTag) ? latestTag : null);
  const hasFeat = commits.some((msg) => /^feat(\(|:)/.test(msg));
  const newVersion = bumpVersion(currentVersion, hasFeat ? "minor" : "patch");

  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  execSync(`git tag v${newVersion}`);
  console.log(`Version bumped to ${newVersion}`);
}

main();
