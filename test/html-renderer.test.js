import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseStageMd } from "../src/parser/stagemd.js";
import { renderHtml } from "../src/renderer/html.js";

test("renderer creates speaker/speech two-column dialogue layout", () => {
  const source = [
    "# 序場",
    "老師： 第一行對白很長很長很長，這裡測試換行對齊。",
    "燈暗"
  ].join("\n");
  const ast = parseStageMd(source);
  const html = renderHtml(ast, { profile: "reading" });

  assert.match(html, /grid-template-columns: var\(--speaker-width\) minmax\(0, 1fr\)/);
  assert.match(html, /class="dialogue"/);
  assert.match(html, /class="speaker">老師：/);
  assert.match(html, /class="speech">第一行對白很長很長很長，這裡測試換行對齊。/);
  assert.match(html, /\.speaker\s*\{[\s\S]*text-align: left;/);
  assert.match(html, /\.speech\s*\{[\s\S]*white-space: pre-wrap;[\s\S]*overflow-wrap: break-word;/);
});

test("cue is hidden in reading profile and shown in cue profile", () => {
  const source = ["!cue light: LX 1 燈亮"].join("\n");
  const ast = parseStageMd(source);

  const readingHtml = renderHtml(ast, { profile: "reading" });
  const cueHtml = renderHtml(ast, { profile: "cue" });

  assert.doesNotMatch(readingHtml, /\[CUE\]/);
  assert.match(cueHtml, /\[CUE\] light: LX 1 燈亮/);
});

test("inline stage directions in dialogue render with full-width brackets", () => {
  const source = [
    "老師： 好啦，我睇吓大家有無乖。[頓] 而家開始點名。",
    "技術員： 求你［等我一陣］"
  ].join("\n");
  const ast = parseStageMd(source);
  const html = renderHtml(ast, { profile: "reading" });

  assert.match(html, /<span class="inline-direction">【頓】<\/span>/);
  assert.match(html, /<span class="inline-direction">【等我一陣】<\/span>/);
});

test("long dialogue keeps hanging-indent contract after speaker colon", () => {
  const source = "超長角色名稱測試： 這是一段非常長的對白，目的是讓視窗變窄時自動換行，第二行仍然要跟冒號後起點對齊。";
  const ast = parseStageMd(source);
  const html = renderHtml(ast, { profile: "reading" });

  assert.match(html, /class="dialogue"/);
  assert.match(html, /grid-template-columns: var\(--speaker-width\) minmax\(0, 1fr\)/);
  assert.match(html, /class="speaker">超長角色名稱測試：<\/div><div class="speech">/);
});

test("renders long Gigi monologue from fixture with dialogue alignment contract", () => {
  const source = readFileSync("fixtures/gigi-long-monologue.stagemd", "utf8");
  const ast = parseStageMd(source);
  const html = renderHtml(ast, { profile: "reading" });

  assert.match(html, /class="speaker">Gigi：<\/div><div class="speech">/);
  assert.match(html, /Project TS計劃入面其中一個仿生人/);
  assert.match(html, /grid-template-columns: var\(--speaker-width\) minmax\(0, 1fr\)/);
});

test("stage directions use distinct Kai-style font family", () => {
  const source = "燈轉，Gigi再次戴上面具，面向觀眾。";
  const ast = parseStageMd(source);
  const html = renderHtml(ast, { profile: "reading" });

  assert.match(html, /\.stage-direction\s*\{[\s\S]*font-family: "DFKai-SB", "BiauKai", "KaiTi", "STKaiti", serif;/);
});

test("embedded mode uses full-width layout for iframe preview", () => {
  const source = "老師： 測試預覽模式";
  const ast = parseStageMd(source);
  const html = renderHtml(ast, { profile: "reading", embedded: true });

  assert.match(html, /<body class="is-embedded">/);
  assert.match(html, /box-sizing: border-box;/);
  assert.match(html, /body\.is-embedded \{[\s\S]*overflow-x: hidden;/);
  assert.match(html, /body\.is-embedded main \{/);
  assert.match(html, /width: 100%;/);
});
