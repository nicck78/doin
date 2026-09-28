import { getDefaultInitialData } from './defaultData.js';

const LOCAL_STORAGE_KEY = 'doin_app_data_v1';

export const storageManager = {
  // 检查是否在 Electron 环境中
  isElectron() {
    return typeof window !== 'undefined' && window.electronAPI && window.electronAPI.isElectron;
  },

  // 读取数据
  async load() {
    try {
      if (this.isElectron()) {
        const res = await window.electronAPI.loadData();
        if (res.success && res.data) {
          return res.data;
        }
      } else {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.error('Failed to load data, falling back to default:', e);
    }

    // 首次运行或数据为空，使用预设引导数据
    const initial = getDefaultInitialData();
    await this.save(initial);
    return initial;
  },

  // 保存数据
  async save(data) {
    try {
      if (this.isElectron()) {
        await window.electronAPI.saveData(data);
      }
      // 同时在 localStorage 保存一份作为热备
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save data:', e);
      return false;
    }
  },

  // 导出备份文件
  async exportBackup(data) {
    if (this.isElectron()) {
      return await window.electronAPI.exportBackup(data);
    } else {
      // 纯浏览器环境下的下载兜底方案
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doin-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    }
  },

  // 导入备份文件
  async importBackup() {
    if (this.isElectron()) {
      return await window.electronAPI.importBackup();
    } else {
      // 浏览器环境下的文件选择器
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) {
            resolve({ canceled: true });
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              resolve({ success: true, data });
            } catch (err) {
              resolve({ success: false, error: 'JSON 文件格式不正确' });
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }
  },

  // 动态切换桌面迷你悬浮胶囊模式 (画中画)
  async setMiniMode(isMini) {
    if (this.isElectron() && window.electronAPI.setMiniMode) {
      return await window.electronAPI.setMiniMode(isMini);
    }
    return { success: false, isMini };
  }
};
