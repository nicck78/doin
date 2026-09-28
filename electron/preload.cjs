const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  loadData: () => ipcRenderer.invoke('storage:load'),
  saveData: (data) => ipcRenderer.invoke('storage:save', data),
  exportBackup: (data) => ipcRenderer.invoke('storage:export-backup', data),
  importBackup: () => ipcRenderer.invoke('storage:import-backup'),
  setMiniMode: (isMini) => ipcRenderer.invoke('window:set-mini-mode', isMini)
});
