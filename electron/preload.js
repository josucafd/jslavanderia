const { contextBridge, ipcRenderer } = require('electron')

// Expondo API para comunicação com o frontend via IPC
contextBridge.exposeInMainWorld('electronAPI', {
  // --------------------------
  // Funções relacionadas a arquivos e diretórios
  // --------------------------
  openExcelFile: () => ipcRenderer.invoke('open-excel-file'),
  selectReadFolder: () => ipcRenderer.invoke('select-read-folder'),
  selectWriteFolder: () => ipcRenderer.invoke('select-write-folder'),
  readDir: folderPath => ipcRenderer.invoke('read-dir', folderPath),
  joinPath: (dir, file) => ipcRenderer.invoke('join-path', dir, file),
  getPhotoUrl: filePath => ipcRenderer.invoke('get-photo-url', filePath),
  readImageFile: path => ipcRenderer.invoke('read-image-file', path),
  findPhoto: (dirPath, referencia) =>
    ipcRenderer.invoke('find-photo', dirPath, referencia),
  loadImageBase64: filePath =>
    ipcRenderer.invoke('load-image-base64', filePath),

  // --------------------------
  // Funções relacionadas a configurações
  // --------------------------
  saveSettings: settings => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  openSocialWindow: () => ipcRenderer.send('open-social-window'),
  openExternalLink: url => ipcRenderer.invoke('open-external-link', url),
  // --------------------------
  // Funções relacionadas à programação (salvar dados)
  // --------------------------
  saveProgram: data => ipcRenderer.invoke('save-program', data),
  saveProgrammingMass: args =>
    ipcRenderer.invoke('save-programming-mass', args),
  fetchProgrammingData: () => ipcRenderer.invoke('fetch-programming-data'),
  fetchProgrammingDataFiltered: filters =>
    ipcRenderer.invoke('fetch-programming-data-filtered', filters),
  updatePrintedStatus: recordId =>
    ipcRenderer.invoke('update-printed-status', recordId),

  // --------------------------
  // Funções relacionadas à versão e atualização do app
  // --------------------------
  getVersion: () => ipcRenderer.invoke('get-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  restartApp: () => ipcRenderer.invoke('restart-app'),

  // --------------------------
  // Eventos relacionados à atualização
  // --------------------------
  onUpdateAvailable: callback => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: callback => ipcRenderer.on('update-downloaded', callback),
  onDownloadProgress: callback => ipcRenderer.on('download-progress', callback),
})
