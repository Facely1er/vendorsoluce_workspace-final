import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);
const pkgPath = require.resolve('turbo/package.json');
const pkg = require(pkgPath);
const cli = join(dirname(pkgPath), pkg.bin.turbo);

// Known turbo `run` flags – anything NOT in this list and starting with `--`
// is treated as a pass-through argument for the underlying task (e.g. vitest's --run).
const TURBO_RUN_FLAG_PREFIXES = [
  '--filter', '--no-cache', '--force', '--concurrency', '--continue',
  '--dry-run', '--graph', '--parallel', '--output-logs', '--log-order',
  '--since', '--affected', '--daemon', '--no-daemon', '--cache-dir',
  '--token', '--api', '--team', '--scope', '--remote-only', '--summarize',
  '--profile', '--serial', '--global-deps', '--framework-inference',
];
function isTurboFlag(arg) {
  const base = arg.split('=')[0];
  return TURBO_RUN_FLAG_PREFIXES.includes(base);
}

const rawArgs = process.argv.slice(2);
let args = rawArgs;

// When `npm run test -- --run` is invoked, npm appends `--run` directly to the
// script args with no `--` separator.  Turbo does not recognise `--run`, so we
// must inject `--` before any unknown flags so they are forwarded to the task.
if (!rawArgs.includes('--') && rawArgs[0] === 'run') {
  const passthroughStart = rawArgs.findIndex(
    (a, i) => i >= 1 && a.startsWith('--') && !isTurboFlag(a),
  );
  if (passthroughStart !== -1) {
    args = [...rawArgs.slice(0, passthroughStart), '--', ...rawArgs.slice(passthroughStart)];
  }
}

const result = spawnSync(process.execPath, [cli, ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);
