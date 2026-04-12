import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);
const pkgPath = require.resolve('vite/package.json');
const pkg = require(pkgPath);
const cli = join(dirname(pkgPath), pkg.bin.vite);
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], { stdio: 'inherit', cwd: new URL('..', import.meta.url) });
process.exit(result.status ?? 1);
