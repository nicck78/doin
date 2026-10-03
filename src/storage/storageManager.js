import { getDefaultInitialData } from './defaultData.js';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isAndroidApp } from '../platform/platform.js';
import { validateBackup } from './backupData.js';

const LOCAL_STORAGE_KEY = 'doin_app_data_v1';
let lastSave = Promise.resolve();

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
        if (!res.success) throw new Error(res.error || '桌面数据读取失败');
      } else if (isAndroidApp()) {
        const { value } = await Preferences.get({ key: LOCAL_STORAGE_KEY });
        if (value) return JSON.parse(value);
      } else {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      throw e;
    }

    // 首次运行或数据为空，使用预设引导数据
    const initial = isAndroidApp()
      ? { version: '1.0.0', theme: 'dark', lang: 'zh', tasks: [], focusSessions: [], dailyReviews: {} }
      : getDefaultInitialData();
    await this.save(initial);
    return initial;
  },

  // 保存数据
  save(data) {
    // 按用户操作的顺序写盘，避免较早的慢写入最后完成、覆盖较新的任务。
    const write = async () => {
      try {
        if (this.isElectron()) {
          const result = await window.electronAPI.saveData(data);
          if (!result.success) throw new Error(result.error || '桌面写入失败');
        } else if (isAndroidApp()) {
          await Preferences.set({ key: LOCAL_STORAGE_KEY, value: JSON.stringify(data) });
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        }
        return true;
      } catch (e) {
        console.error('Failed to save data:', e);
        return false;
      }
    };
    const pending = lastSave.then(write, write);
    lastSave = pending.then(() => undefined, () => undefined);
    return pending;
  },

  // 导出备份文件
  async exportBackup(data) {
    validateBackup(data);
    if (this.isElectron()) {
      return await window.electronAPI.exportBackup(data);
    } else if (isAndroidApp()) {
      const path = `doin-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      try {
        const result = await Filesystem.writeFile({ path, data: JSON.stringify(data, null, 2), directory: Directory.Cache, encoding: Encoding.UTF8 });
        await Share.share({ title: '保存 doin 备份', url: result.uri, dialogTitle: '选择保存位置' });
        return { success: true, note: '请确认文件已在所选位置保存；分享操作本身不能证明对方已接收。' };
      } catch (error) {
        return { success: false, error: String(error) };
      }
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
              const data = validateBackup(JSON.parse(event.target.result));
              resolve({ success: true, data });
            } catch (err) {
              resolve({ success: false, error: err.message });
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }
  },

  async saveRecovery(data) {
    validateBackup(data);
    const name = `doin-recovery-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    if (this.isElectron()) {
      return window.electronAPI.saveRecovery(data, name);
    }
    if (isAndroidApp()) {
      const result = await Filesystem.writeFile({ path: `recovery/${name}`, data: JSON.stringify(data, null, 2), directory: Directory.Data, encoding: Encoding.UTF8, recursive: true });
      return { success: true, filePath: result.uri, name };
    }
    const key = `doin_recovery_${name}`;
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true, filePath: key, name };
  },

  async listRecoveries() {
    if (this.isElectron()) return window.electronAPI.listRecoveries();
    if (isAndroidApp()) {
      try {
        const { files } = await Filesystem.readdir({ path: 'recovery', directory: Directory.Data });
        return files.map(file => file.name).filter(name => name.startsWith('doin-recovery-') && name.endsWith('.json')).sort().reverse();
      } catch { return []; }
    }
    return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter(key => key?.startsWith('doin_recovery_'))
      .map(key => key.slice('doin_recovery_'.length)).sort().reverse();
  },

  async loadRecovery(name) {
    if (!/^doin-recovery-[\w-]+\.json$/.test(name)) return { success: false, error: '恢复文件名不正确' };
    try {
      if (this.isElectron()) return window.electronAPI.loadRecovery(name);
      if (isAndroidApp()) {
        const { data } = await Filesystem.readFile({ path: `recovery/${name}`, directory: Directory.Data, encoding: Encoding.UTF8 });
        return { success: true, data: validateBackup(JSON.parse(data)) };
      }
      return { success: true, data: validateBackup(JSON.parse(localStorage.getItem(`doin_recovery_${name}`))) };
    } catch (error) { return { success: false, error: String(error) }; }
  },

  // 动态切换桌面迷你悬浮胶囊模式 (画中画)
  async setMiniMode(isMini) {
    if (this.isElectron() && window.electronAPI.setMiniMode) {
      return await window.electronAPI.setMiniMode(isMini);
    }
    return { success: false, isMini };
  }
};
