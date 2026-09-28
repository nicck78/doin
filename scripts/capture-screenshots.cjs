const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const doinScreenshotsDir = path.resolve(__dirname, '../screenshots');
const websiteAssetsDir = 'D:\\___aaa\\Projects\\website\\wechat-article-assets';

[doinScreenshotsDir, websiteAssetsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  }
});

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getOffsetDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = getTodayString();
const mockData = {
  version: '1.0.0',
  theme: 'light',
  tasks: [
    {
      id: 'task-1',
      title: '文献精读：大模型推理加速与多智能体架构',
      estimatedMinutes: 45,
      startDate: getOffsetDate(-1),
      dueDate: getOffsetDate(2),
      color: 'indigo',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: '大学物理：电磁感应课后习题与思维导图',
      estimatedMinutes: 30,
      startDate: today,
      dueDate: today,
      color: 'emerald',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: '公众号推文：整理 doin 第二篇开发实录素材',
      estimatedMinutes: 60,
      startDate: today,
      dueDate: getOffsetDate(1),
      color: 'amber',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      title: '设计小海獭专属多分辨率 ICO 图标',
      estimatedMinutes: 25,
      startDate: getOffsetDate(-1),
      dueDate: today,
      color: 'blue',
      isCompleted: true,
      completedAt: `${today}T10:30:00.000Z`,
      createdAt: new Date().toISOString()
    }
  ],
  focusSessions: [
    {
      id: 'session-1',
      date: today,
      durationSeconds: 1500,
      mode: 'stopwatch',
      taskId: 'task-1',
      taskTitle: '文献精读：大模型推理加速与多智能体架构',
      completedAt: `${today}T09:30:00.000Z`
    },
    {
      id: 'session-2',
      date: today,
      durationSeconds: 2700,
      mode: 'stopwatch',
      taskId: 'task-2',
      taskTitle: '大学物理：电磁感应课后习题与思维导图',
      completedAt: `${today}T11:15:00.000Z`
    }
  ],
  dailyReviews: {
    [today]: {
      notes: '今天完成了桌面悬浮药丸的开发与排版优化，双栏工作台左右对称非常舒展。晚上把核心功能整理了一遍，思路很顺畅，继续保持心流！',
      updatedAt: new Date().toISOString()
    }
  }
};

ipcMain.handle('storage:load', async () => ({ success: true, data: mockData }));
ipcMain.handle('storage:save', async () => ({ success: true }));
ipcMain.handle('storage:export-backup', async () => ({ canceled: true }));
ipcMain.handle('storage:import-backup', async () => ({ canceled: true }));
ipcMain.handle('window:set-mini-mode', async () => ({ success: true }));

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function saveImage(win, filename) {
  const image = await win.webContents.capturePage();
  const pngBuffer = image.toPNG();
  const file1 = path.join(doinScreenshotsDir, filename);
  fs.writeFileSync(file1, pngBuffer);
  if (fs.existsSync(websiteAssetsDir)) {
    const file2 = path.join(websiteAssetsDir, filename);
    fs.writeFileSync(file2, pngBuffer);
  }
  console.log(`[截图成功] ${filename} (${pngBuffer.length} bytes)`);
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1240,
    height: 820,
    show: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.resolve(__dirname, '../electron/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const distPath = path.resolve(__dirname, '../dist/index.html');
  await win.loadFile(distPath);
  await sleep(1000);

  // 1. 今日页面 - 浅色纯白双栏工作台
  await saveImage(win, '01-today-dual-column-light.png');

  // 2. 切换暗黑模式
  await win.webContents.executeJavaScript(`
    const themeBtn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('暗黑'));
    if (themeBtn) themeBtn.click();
  `);
  await sleep(400);
  await saveImage(win, '02-today-dual-column-dark.png');

  // 3. 切换全景 7 天时间轴
  await win.webContents.executeJavaScript(`
    const timelineBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('全景'));
    if (timelineBtn) timelineBtn.click();
  `);
  await sleep(500);
  await saveImage(win, '03-timeline-7days.png');

  // 4. 切换专注页面 & 开启纯净禅模式
  await win.webContents.executeJavaScript(`
    const focusBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('专注'));
    if (focusBtn) focusBtn.click();
  `);
  await sleep(500);

  // 启动秒表并进入禅模式
  await win.webContents.executeJavaScript(`
    const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '开始' || b.textContent.trim() === '开始专注');
    if (startBtn) startBtn.click();
  `);
  await sleep(300);

  await win.webContents.executeJavaScript(`
    const zenBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('禅模式'));
    if (zenBtn) zenBtn.click();
  `);
  await sleep(500);
  await saveImage(win, '04-focus-zen-mode.png');

  // 5. 退出禅模式，进入悬浮药丸形态
  await win.webContents.executeJavaScript(`
    const exitZenBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('退出禅模式'));
    if (exitZenBtn) exitZenBtn.click();
  `);
  await sleep(300);

  // 模拟切换至悬浮药丸视图
  win.setContentSize(320, 92);
  await win.webContents.executeJavaScript(`
    const miniBtn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('悬浮药丸'));
    if (miniBtn) miniBtn.click();
  `);
  await sleep(500);
  await saveImage(win, '05-mini-capsule-pip.png');

  console.log('\n全部 5 张高清真机演示截图捕获完成！');
  app.quit();
});
