#!/usr/bin/env node
/**
 * Post-Edit Hook: Automatic Code Formatting & Linting
 *
 * Runs after file edits to ensure code quality:
 * 1. Format with Prettier
 * 2. Check with ESLint
 * 3. Log results
 *
 * Timeout: <1s (fast, non-blocking)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const filePath = input.file_path || input.path;

    if (!filePath) {
      console.error('[PostEditFormat] ⚠️  No file path provided');
      process.exit(0);
    }

    // Only process TypeScript/JavaScript files
    const ext = path.extname(filePath);
    if (!['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
      console.log(`[PostEditFormat] ⏭️  Skipped (${ext})`);
      process.exit(0);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`[PostEditFormat] ⚠️  File not found: ${filePath}`);
      process.exit(0);
    }

    const fileName = path.basename(filePath);

    // Run Prettier (format)
    try {
      execSync(`npx prettier --write "${filePath}"`, {
        stdio: 'pipe',
        timeout: 5000
      });
      console.log(`[PostEditFormat] ✅ Formatted: ${fileName}`);
    } catch (e) {
      console.warn(`[PostEditFormat] ⚠️  Prettier failed: ${e.message}`);
    }

    // Run ESLint (lint)
    try {
      execSync(`npx eslint "${filePath}" --max-warnings=0`, {
        stdio: 'pipe',
        timeout: 5000
      });
      console.log(`[PostEditFormat] ✅ Linted: ${fileName}`);
    } catch (e) {
      // ESLint errors are warnings, don't block
      console.warn(`[PostEditFormat] ⚠️  Lint warnings: ${fileName}`);
    }

    process.exit(0);
  } catch (e) {
    console.error(`[PostEditFormat] ❌ Error: ${e.message}`);
    process.exit(0); // Always exit 0 - don't block tool execution
  }
}

// Support both direct execution and module export
if (require.main === module) {
  const input = process.stdin.on('data', (chunk) => {
    run(chunk.toString());
  });
} else {
  module.exports = { run };
}
