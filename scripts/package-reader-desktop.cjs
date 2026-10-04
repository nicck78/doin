const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const source = path.join(root, 'node_modules', 'electron', 'dist');
const target = path.join(root, 'release', `doin-reader-${pkg.version}-windows-x64`);

if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  throw new Error('缺少前端构建；请先运行 npm run build');
}
if (!fs.existsSync(path.join(source, 'electron.exe'))) {
  throw new Error('缺少 Electron Windows 运行环境');
}
if (fs.existsSync(target)) {
  throw new Error(`目标目录已存在，先人工核对后再处理：${target}`);
}

fs.mkdirSync(target, { recursive: true });
fs.cpSync(source, target, { recursive: true });
fs.renameSync(path.join(target, 'electron.exe'), path.join(target, 'doin-reader.exe'));

const resources = path.join(target, 'resources');
fs.rmSync(path.join(resources, 'default_app.asar'), { force: true });
const appDir = path.join(resources, 'app');
fs.mkdirSync(appDir);
for (const name of ['dist', 'electron', 'public']) {
  fs.cpSync(path.join(root, name), path.join(appDir, name), { recursive: true });
}
fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify({
  name: 'doin-reader',
  productName: 'doin Reader',
  version: pkg.version,
  main: 'electron/reader-main.cjs',
  license: pkg.license
}, null, 2));
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(target, 'DOIN-LICENSE.txt'));
fs.copyFileSync(path.join(root, '读者体验版-安装与备份.md'), path.join(target, '安装与备份说明.md'));

console.log(`完整 Windows 文件夹已生成：${target}`);
