import test from "node:test";
import assert from "node:assert/strict";
import { parseStageMd, extractCharacters } from "../src/parser/stagemd.js";

test("parse StageMD node types", () => {
  const source = [
    "# 序場",
    "@場景: 售樓處",
    "老師： 同學仔，大家快啲嚟上課啦！",
    "燈暗",
    "!cue light: LX 1",
    "// note"
  ].join("\n");

  const ast = parseStageMd(source);
  const types = ast.nodes
    .filter((n) => n.type !== "blank")
    .map((n) => n.type);

  assert.deepEqual(types, [
    "scene_heading",
    "scene_meta",
    "dialogue",
    "stage_direction",
    "cue",
    "comment"
  ]);
});

test("extract unique characters from dialogue lines", () => {
  const source = [
    "老師： 第一行",
    "老師： 第二行",
    "技術員: 第三行"
  ].join("\n");

  const ast = parseStageMd(source);
  const characters = extractCharacters(ast);
  assert.equal(characters.length, 2);
  assert.equal(characters[0].displayName, "老師");
  assert.equal(characters[1].displayName, "技術員");
});

test("frontmatter keys are not treated as character names", () => {
  const source = [
    "---",
    "title: Demo",
    "author: Alice",
    "---",
    "老師： 開始上課"
  ].join("\n");

  const ast = parseStageMd(source);
  const characters = extractCharacters(ast);
  assert.equal(characters.length, 1);
  assert.equal(characters[0].displayName, "老師");
});
