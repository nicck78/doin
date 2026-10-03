const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

// 仅用于手动传输验收。每次启动使用一个全新的、被 Git 忽略的资料夹。
const root = path.resolve(__dirname, '../.android-tools/transfer-test');
const profile = path.join(root, `desktop-profile-${Date.now()}`);
fs.mkdirSync(profile, { recursive: true });
app.disableHardwareAcceleration();
app.setPath('userData', profile);
if (path.resolve(app.getPath('userData')) !== profile) {
  throw new Error('隔离资料夹未生效，已停止启动以保护真实 doin 数据');
}

console.log(`ISOLATED_DOIN_PROFILE=${profile}`);
app.on('browser-window-created', (_event, window) => {
  const title = 'doin — 隔离测试';
  window.setTitle(title);
  window.on('page-title-updated', event => {
    event.preventDefault();
    window.setTitle(title);
  });
});

require('../electron/main.cjs');
