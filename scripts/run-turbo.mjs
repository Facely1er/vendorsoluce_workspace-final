import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);
const pkgPath = require.resolve('turbo/package.json');
const pkg = require(pkgPath);
const cli = join(dirname(pkgPath), pkg.bin.turbo);
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
