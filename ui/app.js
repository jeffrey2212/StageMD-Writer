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
const renderBtn = document.querySelector("#renderBtn");

let profile = "reading";

function setProfile(next) {
  profile = next;
  readingBtn.classList.toggle("is-active", next === "reading");
  cueBtn.classList.toggle("is-active", next === "cue");
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
  const html = renderHtml(ast, { profile });
  preview.srcdoc = html;
}

editor.value = DEFAULT_SCRIPT;
setProfile("reading");
renderNow();

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
  window.clearTimeout(renderNow._t);
  renderNow._t = window.setTimeout(renderNow, 180);
});

