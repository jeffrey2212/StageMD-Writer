const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("stageApi", {
  openFile: () => ipcRenderer.invoke("file:open"),
  saveFile: (payload) => ipcRenderer.invoke("file:save", payload),
  saveFileAs: (payload) => ipcRenderer.invoke("file:saveAs", payload)
});

