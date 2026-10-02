const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('       doin 独立桌面版 (Windows x64) 打包工具');
console.log('====================================================');

const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release', 'doin-win32-x64');
const electronDist = path.join(rootDir, 'node_modules', 'electron', 'dist');

// 1. Build latest Vite static files
console.log('\n[1/5] 正在构建最新前端生产环境包 (Vite)...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

// 2. Ensure logo.ico is generated
console.log('\n[2/5] 正在校验并生成小海獭多分辨率 ICO 图标...');
const icoPath = path.join(rootDir, 'public', 'logo.ico');
const pngPath = path.join(rootDir, 'public', 'logo.png');
if (!fs.existsSync(icoPath) && fs.existsSync(pngPath)) {
  try {
    execSync(`python -c "from PIL import Image; img = Image.open('public/logo.png'); img.save('public/logo.ico', format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])"`, { cwd: rootDir, stdio: 'inherit' });
    console.log('ICO 图标生成成功！');
  } catch (err) {
    console.warn('ICO 图标转换提示:', err.message);
  }
} else {
  console.log('ICO 图标已就绪。');
}

// 3. Prepare release directory and copy Electron runtime
console.log('\n[3/5] 正在装配独立 Electron 桌面执行环境...');
const oldExe = path.join(releaseDir, 'electron.exe');
const newExe = path.join(releaseDir, 'doin.exe');

let needCopyRuntime = true;
if (fs.existsSync(newExe)) {
  try {
    fs.rmSync(releaseDir, { recursive: true, force: true });
    fs.mkdirSync(releaseDir, { recursive: true });
  } catch (err) {
    console.log('提示: 检测到旧 release 目录存在或 doin 正在运行，直接热更新应用代码与资源。');
    needCopyRuntime = false;
  }
} else {
  fs.mkdirSync(releaseDir, { recursive: true });
}

if (needCopyRuntime) {
  // Copy prebuilt runtime files
  fs.cpSync(electronDist, releaseDir, { recursive: true });

  // Rename electron.exe to doin.exe
  if (fs.existsSync(oldExe)) {
    fs.renameSync(oldExe, newExe);
  }
}

// 4. Bundle app code into resources/app
console.log('\n[4/5] 正在注入应用核心代码与资源资产...');
const resourcesDir = path.join(releaseDir, 'resources');
const appDir = path.join(resourcesDir, 'app');
fs.mkdirSync(appDir, { recursive: true });

// Remove default_app.asar
const defaultAsar = path.join(resourcesDir, 'default_app.asar');
if (fs.existsSync(defaultAsar)) {
  try {
    fs.rmSync(defaultAsar, { force: true });
  } catch (e) {}
}

// Copy dist, electron, public
fs.cpSync(path.join(rootDir, 'dist'), path.join(appDir, 'dist'), { recursive: true });
fs.cpSync(path.join(rootDir, 'electron'), path.join(appDir, 'electron'), { recursive: true });
fs.cpSync(path.join(rootDir, 'public'), path.join(appDir, 'public'), { recursive: true });

// Minimal runtime package.json
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
const appPkg = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  main: 'electron/main.cjs',
  author: pkg.author,
  license: pkg.license
};
fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(appPkg, null, 2), 'utf-8');

// 5. Generate shortcut
console.log('\n[5/5] 正在根目录创建带有小海獭专属图标的 Windows 快捷方式...');
const lnkPath = path.join(rootDir, 'doin.lnk');
try {
  const ps1Path = path.join(rootDir, 'scripts', 'create-shortcut.ps1');
  execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${ps1Path}"`, { stdio: 'inherit' });
  console.log('快捷方式已生成: doin.lnk');
} catch (e) {
  console.warn('生成快捷方式提示:', e.message);
}

console.log('\n====================================================');
console.log('🎉 打包全部大功告成！');
console.log('主程序路径: ' + newExe);
console.log('一键直达快捷方式: ' + lnkPath);
console.log('====================================================');
