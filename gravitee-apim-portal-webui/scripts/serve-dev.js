const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const portalRoot = path.resolve(__dirname, '..');
const stubPath = path.join(portalRoot, '.pnp.cjs');
const stub = [
  '// Stops esbuild from walking up to an unrelated Yarn PnP manifest.',
  '// This project resolves packages from node_modules.',
  '',
].join('\n');

if (!fs.existsSync(path.join(portalRoot, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'))) {
  console.error('Classic portal dependencies are missing.');
  console.error('From gravitee-apim-portal-webui run: corepack yarn install');
  process.exit(1);
}

let createdStub = false;
if (!fs.existsSync(stubPath)) {
  fs.writeFileSync(stubPath, stub);
  createdStub = true;
}

const docker = spawnSync('docker', ['ps', '-q', '-f', 'name=^gio_apim_portal_ui$', '-f', 'publish=4100'], {
  encoding: 'utf8',
});
if (docker.status === 0 && docker.stdout.trim()) {
  console.log('Stopping gio_apim_portal_ui so port 4100 serves the local classic portal.');
  const stopped = spawnSync('docker', ['stop', 'gio_apim_portal_ui'], { stdio: 'inherit' });
  if (stopped.status !== 0) {
    console.error('Could not stop gio_apim_portal_ui. Free port 4100 and run this command again.');
    process.exit(stopped.status || 1);
  }
}

const child = spawn(
  process.execPath,
  [path.join(portalRoot, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), 'serve', '--port=4100', '--host=127.0.0.1'],
  {
    cwd: portalRoot,
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max_old_space_size=8192' },
  },
);

function removeStub() {
  if (createdStub) {
    fs.rmSync(stubPath, { force: true });
  }
}

child.on('exit', code => {
  removeStub();
  process.exit(code ?? 0);
});

function stop() {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F']);
  } else {
    child.kill('SIGTERM');
  }
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
