import { parseStageMd, extractCharacters } from "../src/parser/stagemd.js";
import { renderHtml } from "../src/renderer/html.js";

const DEFAULT_SCRIPT = `---
title: _intoTheWonderland_
author: 謝斐陳
version: 第五稿
---

# 第一場 - 最佳銷售員
@場景: 售樓處、辦公室、宴會廳等
@人物: Gigi、老闆、技術員、阿茵、亨少

燈轉，Gigi再次戴上面具，面向觀眾，其他人退場。
Gigi： 佢哋叫我做Gigi，我好鍾意呢個名，因為有一種與別不同嘅感覺。我係一個叫Project TS計劃入面其中一個仿生人，佢哋之前通常叫我哋做1號、2號、3號咁。【停頓】出到嚟做嘢同模擬好唔同。
!cue light: LX 1 燈亮
`;

const editor = document.querySelector("#editor");
const preview = document.querySelector("#preview");
const sceneList = document.querySelector("#sceneList");
const characterList = document.querySelector("#characterList");
const readingBtn = document.querySelector("#readingBtn");
const cueBtn = document.querySelector("#cueBtn");
const openBtn = document.querySelector("#openBtn");
const saveBtn = document.querySelector("#saveBtn");
const saveAsBtn = document.querySelector("#saveAsBtn");
const renderBtn = document.querySelector("#renderBtn");
const statusBar = document.querySelector("#statusBar");
const fileInput = document.querySelector("#fileInput");
const projectName = document.querySelector(".project-name");
const projectMeta = document.querySelector(".project-meta");

let profile = "reading";
let currentFileHandle = null;
let currentFileName = "untitled.stagemd";
let currentFilePath = null;
let isDirty = true;
const stageApi = window.stageApi || null;

function setProfile(next) {
  profile = next;
  readingBtn.classList.toggle("is-active", next === "reading");
  cueBtn.classList.toggle("is-active", next === "cue");
}

function updateStatus() {
  projectName.textContent = currentFileName;
  if (currentFilePath) {
    projectMeta.textContent = "electron file";
  } else if (currentFileHandle) {
    projectMeta.textContent = "linked file";
  } else {
    projectMeta.textContent = "local draft";
  }
  statusBar.textContent = isDirty ? `未儲存變更: ${currentFileName}` : `已儲存: ${currentFileName}`;
}

function renderLists(ast) {
  const scenes = ast.nodes.filter((n) => n.type === "scene_heading");
  sceneList.innerHTML = scenes.map((s) => `<li>${s.text}</li>`).join("");

  const characters = extractCharacters(ast);
  characterList.innerHTML = characters
    .map((c) => `<li>${c.displayName}</li>`)
    .join("");
}

function renderNow() {
  const ast = parseStageMd(editor.value);
  renderLists(ast);
  const html = renderHtml(ast, { profile, embedded: true });
  preview.srcdoc = html;
}

function setDirty(next) {
  isDirty = next;
  updateStatus();
}

function suggestFileName() {
  const match = editor.value.match(/^title:\s*(.+)$/m);
  if (!match) {
    return "script.stagemd";
  }
  return `${match[1].trim().replace(/[\\/:*?"<>|]/g, "_")}.stagemd`;
}

function downloadTextFile(name, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function openWithPicker() {
  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: "StageMD files",
        accept: {
          "text/plain": [".stagemd", ".md", ".txt"]
        }
      }
    ],
    multiple: false
  });
  const file = await handle.getFile();
  const text = await file.text();
  currentFileHandle = handle;
  currentFileName = file.name;
  editor.value = text;
  renderNow();
  setDirty(false);
}

async function openWithInputFallback() {
  fileInput.value = "";
  fileInput.click();
}

async function saveToHandle(handle) {
  const writable = await handle.createWritable();
  await writable.write(editor.value);
  await writable.close();
}

async function saveAsWithPicker() {
  const handle = await window.showSaveFilePicker({
    suggestedName: currentFileName === "untitled.stagemd" ? suggestFileName() : currentFileName,
    types: [
      {
        description: "StageMD files",
        accept: {
          "text/plain": [".stagemd"]
        }
      }
    ]
  });
  await saveToHandle(handle);
  currentFileHandle = handle;
  currentFileName = handle.name || currentFileName;
  setDirty(false);
}

async function saveNow() {
  if (stageApi?.saveFile && currentFilePath) {
    const result = await stageApi.saveFile({ path: currentFilePath, content: editor.value });
    if (!result?.ok) {
      throw new Error("Electron save failed");
    }
    currentFileName = result.name || currentFileName;
    setDirty(false);
    return;
  }
  if (stageApi?.saveFileAs) {
    await saveAsNow();
    return;
  }

  if (window.showSaveFilePicker && currentFileHandle) {
    await saveToHandle(currentFileHandle);
    setDirty(false);
    return;
  }
  if (window.showSaveFilePicker) {
    await saveAsWithPicker();
    return;
  }
  downloadTextFile(currentFileName, editor.value);
  setDirty(false);
}

async function saveAsNow() {
  if (stageApi?.saveFileAs) {
    const result = await stageApi.saveFileAs({
      suggestedName: currentFileName,
      content: editor.value
    });
    if (result?.canceled) {
      return;
    }
    if (!result?.ok) {
      throw new Error("Electron saveAs failed");
    }
    currentFilePath = result.path;
    currentFileName = result.name || currentFileName;
    currentFileHandle = null;
    setDirty(false);
    return;
  }

  if (window.showSaveFilePicker) {
    await saveAsWithPicker();
    return;
  }
  const nextName = window.prompt("輸出檔名", currentFileName) || currentFileName;
  currentFileName = nextName.endsWith(".stagemd") ? nextName : `${nextName}.stagemd`;
  downloadTextFile(currentFileName, editor.value);
  setDirty(false);
}

editor.value = DEFAULT_SCRIPT;
setProfile("reading");
renderNow();
setDirty(true);

readingBtn.addEventListener("click", () => {
  setProfile("reading");
  renderNow();
});

cueBtn.addEventListener("click", () => {
  setProfile("cue");
  renderNow();
});

renderBtn.addEventListener("click", renderNow);

editor.addEventListener("input", () => {
  setDirty(true);
  window.clearTimeout(renderNow._t);
  renderNow._t = window.setTimeout(renderNow, 180);
});

openBtn.addEventListener("click", async () => {
  try {
    if (stageApi?.openFile) {
      const result = await stageApi.openFile();
      if (!result?.canceled) {
        editor.value = result.content;
        currentFilePath = result.path;
        currentFileName = result.name;
        currentFileHandle = null;
        renderNow();
        setDirty(false);
      }
      return;
    }

    if (window.showOpenFilePicker) {
      await openWithPicker();
      return;
    }
    await openWithInputFallback();
  } catch (error) {
    if (error?.name !== "AbortError") {
      statusBar.textContent = `開檔失敗: ${error.message}`;
    }
  }
});

saveBtn.addEventListener("click", async () => {
  try {
    await saveNow();
  } catch (error) {
    if (error?.name !== "AbortError") {
      statusBar.textContent = `儲存失敗: ${error.message}`;
    }
  }
});

saveAsBtn.addEventListener("click", async () => {
  try {
    await saveAsNow();
  } catch (error) {
    if (error?.name !== "AbortError") {
      statusBar.textContent = `另存失敗: ${error.message}`;
    }
  }
});

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const text = await file.text();
  editor.value = text;
  currentFileHandle = null;
  currentFilePath = null;
  currentFileName = file.name;
  renderNow();
  setDirty(false);
});

