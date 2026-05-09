const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1120,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "..", "ui", "index.html"));
}

ipcMain.handle("file:open", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "StageMD", extensions: ["stagemd", "md", "txt"] },
      { name: "All files", extensions: ["*"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, "utf8");
  return {
    canceled: false,
    path: filePath,
    name: path.basename(filePath),
    content
  };
});

ipcMain.handle("file:save", async (_event, payload) => {
  const targetPath = payload?.path;
  const content = payload?.content ?? "";
  if (!targetPath) {
    return { ok: false, reason: "missing_path" };
  }
  await fs.writeFile(targetPath, content, "utf8");
  return { ok: true, path: targetPath, name: path.basename(targetPath) };
});

ipcMain.handle("file:saveAs", async (_event, payload) => {
  const content = payload?.content ?? "";
  const suggestedName = payload?.suggestedName || "script.stagemd";

  const result = await dialog.showSaveDialog({
    defaultPath: suggestedName,
    filters: [{ name: "StageMD", extensions: ["stagemd"] }]
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  await fs.writeFile(result.filePath, content, "utf8");
  return {
    canceled: false,
    ok: true,
    path: result.filePath,
    name: path.basename(result.filePath)
  };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

