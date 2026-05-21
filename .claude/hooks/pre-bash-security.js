#!/usr/bin/env node
/**
 * Pre-Bash Security Hook: Dangerous Command Blocker
 *
 * Runs before Bash execution to prevent destructive operations:
 * 1. Block rm -rf / chmod 777 / git push --force
 * 2. Require explicit confirmation for risky operations
 * 3. Log blocked attempts
 *
 * Blocking: true, Timeout: <200ms
 */

const DANGEROUS_PATTERNS = [
  // Destructive operations
  { pattern: /\brm\s+-rf\s+\//i, reason: 'Recursive delete from root' },
  { pattern: /\brm\s+-rf\s+\*/i, reason: 'Recursive wildcard delete' },
  {
    pattern: /\bchmod\s+777\b/i,
    reason: 'World-writable permissions'
  },
  {
    pattern: /\bchmod\s+666\b/i,
    reason: 'World-writable file permissions'
  },

  // Git force operations
  { pattern: /\bgit\s+push\s+--force/i, reason: 'Force push (overwrites history)' },
  { pattern: /\bgit\s+reset\s+--hard/i, reason: 'Hard reset (loses commits)' },

  // Process killing
  { pattern: /\bkill\s+-9\s+1\b/, reason: 'Kill PID 1 (breaks system)' },

  // Database operations
  {
    pattern: /\bdrop\s+database\b/i,
    reason: 'Database deletion'
  },
  {
    pattern: /\btruncate\s+table\b/i,
    reason: 'Table truncation'
  }
];

function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const command = input.command || '';

    if (!command) {
      console.log('[PreBashSecurity] ⏭️  No command provided');
      process.exit(0);
    }

    // Check against dangerous patterns
    for (const { pattern, reason } of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        console.error(
          `[PreBashSecurity] 🚫 BLOCKED: ${reason}\n` +
          `Command: ${command.substring(0, 100)}`
        );
        process.exit(1); // Block execution
      }
    }

    // Safe command - allow execution
    console.log('[PreBashSecurity] ✅ Command approved');
    process.exit(0);
  } catch (e) {
    console.error(`[PreBashSecurity] ⚠️  Parse error: ${e.message}`);
    process.exit(0); // Allow on parse error
  }
}

if (require.main === module) {
  process.stdin.on('data', (chunk) => {
    run(chunk.toString());
  });
} else {
  module.exports = { run };
}
