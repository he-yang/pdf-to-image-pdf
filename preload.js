const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 选择文件
  selectFiles: () => ipcRenderer.invoke('selectFiles'),

  // 开始转换
  convertFile: (options) => ipcRenderer.invoke('convertFile', options),

  // 读取 PDF 文件（用于转换）
  readPdf: (options) => ipcRenderer.invoke('readPdf', options),

  // 提取PDF页面
  extractPages: (options) => ipcRenderer.invoke('extractPages', options),

  // 合并PDF文件
  mergePdfs: (options) => ipcRenderer.invoke('mergePdfs', options),

  // 获取PDF页数
  getPdfPageCount: (options) => ipcRenderer.invoke('getPdfPageCount', options),

  // 打开文件所在位置
  showInFolder: (options) => ipcRenderer.invoke('showInFolder', options),

  // 获取设置
  getSettings: () => ipcRenderer.invoke('getSettings'),

  // 保存设置
  saveSettings: (settings) => ipcRenderer.invoke('saveSettings', settings),

  // 检查文件是否存在
  checkFileExists: (options) => ipcRenderer.invoke('checkFileExists', options),

  // 获取语言设置
  getLanguage: () => ipcRenderer.invoke('getLanguage'),

  // 保存语言设置
  saveLanguage: (options) => ipcRenderer.invoke('saveLanguage', options),

  // 显示右键菜单
  showContextMenu: () => ipcRenderer.send('show-context-menu'),

  // 监听事件
  on: (channel, listener) => {
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },

  // 发送事件
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args);
  }
});
