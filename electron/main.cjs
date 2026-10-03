const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let normalBounds = null;

// Determine data file path in user data folder
const getDataFilePath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'doin_data.json');
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#0f172a',
    title: 'doin - 待办清单 & 专注计时',
    icon: fs.existsSync(path.join(__dirname, '../public/logo.ico'))
      ? path.join(__dirname, '../public/logo.ico')
      : path.join(__dirname, '../public/logo.png'),
    show: true, // 直接显示，不再处于隐形状态
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const isDevServer = Boolean(process.env.VITE_DEV_SERVER_URL);
  const distPath = path.join(__dirname, '../dist/index.html');

  if (isDevServer) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      setTimeout(() => mainWindow.loadURL('http://localhost:5173'), 1000);
    });
  }

  // 强制拉起窗口并获得焦点
  mainWindow.show();
  mainWindow.focus();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Safe Local File Persistence
ipcMain.handle('storage:load', async () => {
  try {
    const filePath = getDataFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(raw) };
    }
    return { success: true, data: null }; // First run
  } catch (err) {
    console.error('Error loading data:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('storage:save', async (_, data) => {
  try {
    const filePath = getDataFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Error saving data:', err);
    return { success: false, error: err.message };
  }
});

// IPC: Export backup JSON to user chosen file
ipcMain.handle('storage:export-backup', async (_, data) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: '导出 doin 备份数据',
      defaultPath: `doin-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON 数据备份', extensions: ['json'] }]
    });

    if (canceled || !filePath) return { canceled: true };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC: Import backup JSON from user chosen file
ipcMain.handle('storage:import-backup', async () => {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
      title: '选择要恢复的 doin 数据备份文件',
      filters: [{ name: 'JSON 数据备份', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (canceled || !filePaths || filePaths.length === 0) return { canceled: true };

    const content = fs.readFileSync(filePaths[0], 'utf-8');
    const parsed = JSON.parse(content);
    return { success: true, data: parsed, filePath: filePaths[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

const recoveryDir = () => path.join(app.getPath('userData'), 'doin-recovery');
const recoveryPath = (name) => {
  if (!/^doin-recovery-[\w-]+\.json$/.test(name)) throw new Error('恢复文件名不正确');
  return path.join(recoveryDir(), name);
};

ipcMain.handle('storage:save-recovery', async (_, data, name) => {
  try {
    fs.mkdirSync(recoveryDir(), { recursive: true });
    const filePath = recoveryPath(name);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { encoding: 'utf-8', flag: 'wx' });
    return { success: true, filePath, name };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('storage:list-recoveries', async () => {
  try {
    if (!fs.existsSync(recoveryDir())) return [];
    return fs.readdirSync(recoveryDir()).filter(name => /^doin-recovery-[\w-]+\.json$/.test(name)).sort().reverse();
  } catch (err) { return []; }
});

ipcMain.handle('storage:load-recovery', async (_, name) => {
  try { return { success: true, data: JSON.parse(fs.readFileSync(recoveryPath(name), 'utf-8')) }; }
  catch (err) { return { success: false, error: err.message }; }
});

// IPC: Toggle Mini Capsule Mode (Picture-in-Picture)
ipcMain.handle('window:set-mini-mode', async (_, isMini) => {
  if (!mainWindow) return { success: false };

  try {
    if (isMini) {
      if (!normalBounds) {
        normalBounds = mainWindow.getBounds();
      }
      mainWindow.setResizable(false);
      mainWindow.setMinimumSize(260, 70);
      mainWindow.setContentSize(320, 92);

      const [winWidth, winHeight] = mainWindow.getSize();
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
      const x = Math.max(0, screenWidth - winWidth - 24);
      const y = Math.max(0, screenHeight - winHeight - 24);

      mainWindow.setPosition(x, y);
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      return { success: true, isMini: true };
    } else {
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setResizable(true);
      mainWindow.setMinimumSize(980, 680);
      if (normalBounds) {
        mainWindow.setBounds(normalBounds);
        normalBounds = null;
      } else {
        mainWindow.setSize(1240, 820);
        mainWindow.center();
      }
      mainWindow.focus();
      return { success: true, isMini: false };
    }
  } catch (err) {
    console.error('Error toggling mini mode:', err);
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
