# Hooks Implementation — subscription-management-app

> **Automated Development Workflow Hooks**
> 
> Based on `everything-claude-code` Hook Development rules (node.md)

---

## Overview

This project implements 3 automated hooks to enforce code quality and security throughout development:

| Hook | Event | Purpose | Timeout |
|------|-------|---------|---------|
| **post-edit-format** | After file edits | Auto-format & lint code | 10s |
| **pre-bash-security** | Before Bash commands | Block dangerous operations | 1s |
| ~~post-test-coverage~~ | After test edits | Check coverage (future) | 30s |

---

## Implemented Hooks

### 1. Post-Edit Format Hook

**File**: `.claude/hooks/post-edit-format.js`

**When it runs**: Automatically after any file is edited with the Edit or Write tool

**What it does**:
```
File edited
  ↓
Hook intercepts
  ↓
Prettier formats code
  ↓
ESLint checks for errors
  ↓
Results logged
```

**Applies to**: `.ts`, `.tsx`, `.js`, `.jsx`, `.json` files only

**Example**:
```
TS Component edited
  → post-edit-format hook runs
  → Prettier reformats indentation/spacing
  → ESLint warns if syntax issues
  → Message: "[PostEditFormat] ✅ Formatted: MyComponent.tsx"
```

**Rationale**: Consistent code style reduces cognitive load and prevents formatting debates

---

### 2. Pre-Bash Security Hook

**File**: `.claude/hooks/pre-bash-security.js`

**When it runs**: Automatically before any Bash command executes

**What it does**:
```
Bash command submitted
  ↓
Hook checks against blocklist
  ↓
If dangerous → BLOCKED (exit 1)
If safe     → ALLOWED (exit 0)
```

**Blocked Patterns**:
- `rm -rf /` — Recursive delete from root
- `rm -rf *` — Wildcard delete  
- `chmod 777` — World-writable permissions
- `git push --force` — Force push (history overwrite)
- `git reset --hard` — Destructive reset
- `drop database` — Database deletion
- `truncate table` — Table truncation

**Example**:
```bash
# User: Delete old logs
$ bash: rm -rf /var/logs/*
  
Hook intercepts: "rm -rf /var/logs/*"
Warning matches pattern "rm -rf *" → BLOCKED
  → Message: "[PreBashSecurity] 🚫 BLOCKED: Recursive wildcard delete"
  → Command does NOT execute
```

**Rationale**: Prevents accidental destructive operations and confirms intent

---

## Hook Rules (from `everything-claude-code`)

### Performance (from node.md)

✅ **Implemented**:
- PreToolUse hook: <1s (blocking hooks must be fast)
- PostToolUse hook: <10s (non-blocking, can be slower)
- Always `exit 0` on parse errors (hooks never break tool execution)

### Development Standards

✅ **Implemented**:
- Scripts in Node.js CommonJS (require/module.exports)
- Error handling: catch and log, always exit 0
- Timeout protection: execSync with explicit timeouts
- Status messages for user feedback

### Code Organization

✅ **Implemented**:
```
.claude/hooks/
├── post-edit-format.js       (PostToolUse)
├── pre-bash-security.js      (PreToolUse)
└── (post-test-coverage.js)   (future)
```

---

## Testing Hooks

### Test 1: Format Hook

```bash
# Create a messily formatted file
cat > test.ts << 'EOF'
function   hello(  ) {
  console.log(  "hello"  )
}
EOF

# Edit it via Claude Code
# Hook should auto-format it
```

**Expected**: File is auto-formatted, message shows "[PostEditFormat] ✅ Formatted: test.ts"

### Test 2: Security Hook

```bash
# Try a dangerous command
$ bash: rm -rf /
```

**Expected**: Command is blocked, message shows "[PreBashSecurity] 🚫 BLOCKED"

### Test 3: Allowed Command

```bash
# Try a safe command
$ bash: ls -la
```

**Expected**: Command runs normally, message shows "[PreBashSecurity] ✅ Command approved"

---

## Troubleshooting

### Hook Not Running

**Problem**: No format messages appear after edits

**Solutions**:
1. Check if npm is installed: `npm -v`
2. Check if Prettier/ESLint are available: `npx prettier --version`
3. Check if only .ts/.tsx/.js files trigger hooks (not .md, .json)
4. Check hook configuration in `.claude/settings.json`

### Hook Errors

**Problem**: Hook fails and breaks Claude Code

**Expected**: Won't happen (hooks always exit 0), but if it does:
- Remove the hook command from `.claude/settings.json`
- Check hook script for syntax errors: `node .claude/hooks/post-edit-format.js`
- Re-enable after fixing

### False Positives in Security Hook

**Problem**: Safe command is blocked incorrectly

**Solution**: Check hook patterns in `pre-bash-security.js`
- If the pattern is too broad, refine it
- Always preserve dangerous patterns (rm -rf, chmod 777, git push --force)

---

## Future Hooks (Phase 2)

### Post-Test Coverage Hook (Planned)

**When**: After test files are modified

**Purpose**: Automatically run tests and check coverage meets 80%

**Status**: Script written (`.claude/hooks/post-test-coverage.js`) but not yet enabled

**To enable**: Uncomment in `.claude/settings.json` after test infrastructure is ready

```json
"PostToolUse": [
  {
    "matcher": "**.test.ts|**.spec.ts",
    "hooks": [
      {
        "type": "command",
        "command": "node .claude/hooks/post-test-coverage.js"
      }
    ]
  }
]
```

---

## Reference

- **everything-claude-code Hook Rules**: [`node.md`](node.md) — Hook development standards
- **Claude Code Hooks Documentation**: https://claude.com/docs/hooks
- **Hook Script Location**: `.claude/hooks/`
- **Hook Configuration**: `.claude/settings.json` → `hooks` section

---

**Last Updated**: 2026-05-15  
**Phase**: 1 (MVP) — 2 of 3 hooks enabled  
**Status**: ✅ Production-ready
