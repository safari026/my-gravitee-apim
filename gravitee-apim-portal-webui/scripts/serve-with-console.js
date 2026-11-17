const { spawn, spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const children = [];

function start(args, env) {
  const child = spawn(process.execPath, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  children.push(child);
  child.on('exit', code => {
    if (code && code !== 0) {
      stopAll();
      process.exit(code);
    }
  });
}

function stopAll() {
  for (const child of children) {
    if (child.exitCode != null || child.killed) {
      continue;
    }
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F']);
    } else {
      child.kill('SIGTERM');
    }
  }
}

start([path.join(__dirname, 'serve-dev.js')]);
start([path.join(repoRoot, 'node_modules', 'nx', 'bin', 'nx.js'), 'serve', 'console'], {
  NODE_OPTIONS: '--max_old_space_size=7168',
});

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});
process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});
