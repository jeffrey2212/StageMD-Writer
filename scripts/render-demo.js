import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { parseStageMd } from "../src/parser/stagemd.js";
import { renderHtml } from "../src/renderer/html.js";

const sourcePath = "fixtures/into-wonderland-excerpt.stagemd";
const outputPath = "dist/preview-cue.html";

const content = readFileSync(sourcePath, "utf8");
const ast = parseStageMd(content);
const html = renderHtml(ast, { profile: "cue" });

mkdirSync("dist", { recursive: true });
writeFileSync(outputPath, html, "utf8");

console.log(`rendered: ${outputPath}`);
