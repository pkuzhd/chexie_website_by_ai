#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const rootDir = process.cwd();
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend_nodejs');

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

const log = (prefix, message, color) => {
  console.log(`${color}[${prefix}] ${colors.reset}${message}`);
};

let frontendProcess = null;
let backendProcess = null;
let isRestarting = false;

const runDev = (name, dir, color) => {
  log(name, '正在启动...', color);
  
  const child = spawn('npm', ['run', 'dev'], {
    cwd: dir,
    shell: true,
    env: { ...process.env }
  });

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
    if (!isRestarting && code !== 0 && code !== null) {
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

  return child;
};

const killProcess = (child, name) => {
  if (child && !child.killed) {
    log(name, '正在停止...', colors.yellow);
    child.kill('SIGTERM');
    setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }, 2000);
  }
};

const cleanup = () => {
  log('系统', '正在终止所有进程...', colors.cyan);
  killProcess(frontendProcess, '前端');
  killProcess(backendProcess, '后端');
};

const restartAll = () => {
  if (isRestarting) return;
  
  isRestarting = true;
  console.log();
  log('系统', '========================================', colors.cyan);
  log('系统', '正在重启所有服务...', colors.yellow);
  log('系统', '========================================', colors.cyan);
  console.log();

  killProcess(frontendProcess, '前端');
  killProcess(backendProcess, '后端');

  setTimeout(() => {
    backendProcess = runDev('后端', backendDir, colors.green);
    setTimeout(() => {
      frontendProcess = runDev('前端', frontendDir, colors.blue);
      isRestarting = false;
    }, 1000);
  }, 1500);
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    console.log();
    cleanup();
    process.exit(0);
  }
  
  if (key.ctrl && key.name === 'r') {
    restartAll();
  }
});

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
console.log('快捷键:');
console.log('  Ctrl + C  退出');
console.log('  Ctrl + R  重启所有服务');
console.log();

backendProcess = runDev('后端', backendDir, colors.green);
setTimeout(() => {
  frontendProcess = runDev('前端', frontendDir, colors.blue);
}, 1000);
