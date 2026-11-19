import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const backend = fileURLToPath(new URL('.', import.meta.url));
const executable = process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python';
const python = [
  resolve(backend, '.venv', executable),
  resolve(backend, '../frontend/.venv', executable)
].find(existsSync);

if (!python) {
  console.error('Environment Python belum ada. Dari folder backend, jalankan:');
  console.error('python -m venv .venv');
  console.error(process.platform === 'win32'
    ? '.\\.venv\\Scripts\\python.exe -m pip install -r requirements.txt'
    : './.venv/bin/python -m pip install -r requirements.txt');
  process.exit(1);
}

const result = spawnSync(python, [
  '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8001'
], { cwd: backend, stdio: 'inherit' });

if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
