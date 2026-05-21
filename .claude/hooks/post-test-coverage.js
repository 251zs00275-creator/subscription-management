#!/usr/bin/env node
/**
 * Post-Test Hook: Automatic Test Coverage Check
 *
 * Runs after test files are modified to ensure coverage:
 * 1. Run tests with coverage
 * 2. Check if coverage meets 80% threshold
 * 3. Alert if below threshold
 *
 * Async: true, Timeout: 30s
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const filePath = input.file_path || input.path;

    if (!filePath) {
      console.log('[PostTestCoverage] ⏭️  No file path provided');
      process.exit(0);
    }

    // Only process test files
    if (!filePath.includes('.test.') && !filePath.includes('.spec.')) {
      console.log(`[PostTestCoverage] ⏭️  Not a test file`);
      process.exit(0);
    }

    const fileName = path.basename(filePath);
    console.log(`[PostTestCoverage] 🧪 Running tests for: ${fileName}`);

    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      console.warn('[PostTestCoverage] ⚠️  package.json not found');
      process.exit(0);
    }

    // Run Jest with coverage
    try {
      execSync('npm run test:coverage -- --passWithNoTests', {
        stdio: 'pipe',
        timeout: 30000,
        encoding: 'utf-8'
      });

      // Read coverage report if exists
      const coveragePath = 'coverage/coverage-summary.json';
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
        const totalCoverage = coverage.total.lines.pct;

        console.log(`[PostTestCoverage] 📊 Coverage: ${totalCoverage}%`);

        if (totalCoverage >= 80) {
          console.log('[PostTestCoverage] ✅ Coverage meets 80% threshold');
        } else {
          console.warn(
            `[PostTestCoverage] ⚠️  Coverage below 80%: ${totalCoverage}%`
          );
        }
      } else {
        console.log('[PostTestCoverage] ✅ Tests passed');
      }
    } catch (e) {
      console.warn(`[PostTestCoverage] ⚠️  Test execution failed`);
      console.warn(e.message.substring(0, 200));
    }

    process.exit(0);
  } catch (e) {
    console.error(`[PostTestCoverage] ❌ Error: ${e.message}`);
    process.exit(0); // Always exit 0
  }
}

if (require.main === module) {
  process.stdin.on('data', (chunk) => {
    run(chunk.toString());
  });
} else {
  module.exports = { run };
}
