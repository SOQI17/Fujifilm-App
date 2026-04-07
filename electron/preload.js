const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getClients: (args) => ipcRenderer.invoke('get-clients', args),
  getConsumption: (args) => ipcRenderer.invoke('get-consumption', args),
  getLoyalty: () => ipcRenderer.invoke('get-loyalty'),
});
