#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const rootDir = process.cwd();
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend_nodejs');

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = (prefix, message, color) => {
  console.log(`${color}[${prefix}] ${colors.reset}${message}`);
};

const processes = [];

const runDev = (name, dir, color) => {
  log(name, '正在启动...', color);
  
  const child = spawn('npm', ['run', 'dev'], {
    cwd: dir,
    shell: true,
    env: { ...process.env }
  });

  processes.push(child);

  child.stdout.on('data', (data) => {
    data.toString().split('\n').filter(line => line.trim()).forEach(line => {
      log(name, line, color);
    });
  });

  child.stderr.on('data', (data) => {
    data.toString().split('\n').filter(line => line.trim()).forEach(line => {
      log(name, line, color);
    });
  });

  child.on('close', (code) => {
    if (code !== 0) {
      log(name, `进程退出，代码: ${code}`, colors.red);
      cleanup();
      process.exit(1);
    }
  });

  child.on('error', (err) => {
    log(name, `启动失败: ${err.message}`, colors.red);
    cleanup();
    process.exit(1);
  });
};

const cleanup = () => {
  log('系统', '正在终止所有进程...', colors.cyan);
  processes.forEach(child => {
    if (!child.killed) child.kill('SIGTERM');
  });
};

process.on('SIGINT', () => {
  console.log();
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

console.log('========================================');
console.log('   同时启动前端和后端开发服务器');
console.log('========================================');
console.log();

runDev('后端', backendDir, colors.green);
setTimeout(() => runDev('前端', frontendDir, colors.blue), 1000);
