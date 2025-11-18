#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Get the latest commit message and strip semantic prefixes
 */
function getLatestCommitMessage() {
  try {
    // Get the latest commit message
    const gitCommand = 'git log -1 --pretty=%B';
    const commitMessage = execSync(gitCommand).toString().trim();

    // Strip semantic prefix if it exists
    // Matches patterns like "feat:", "fix:", "docs:", etc.
    const semanticPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z-]+\))?:\s*/i;

    const cleanMessage = commitMessage.replace(semanticPattern, '');

    return cleanMessage;
  } catch (error) {
    console.error('Error getting commit message:', error.message);
    return '';
  }
}

// Output the processed commit message without a newline
// (better for capturing in shell variables)
process.stdout.write(getLatestCommitMessage());
