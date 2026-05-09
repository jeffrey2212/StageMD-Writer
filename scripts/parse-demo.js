import { readFileSync } from "node:fs";
import { parseStageMd, extractCharacters } from "../src/parser/stagemd.js";

const content = readFileSync("fixtures/into-wonderland-excerpt.stagemd", "utf8");
const ast = parseStageMd(content);
const characters = extractCharacters(ast);

console.log(`nodes: ${ast.nodes.length}`);
console.log("characters:");
for (const character of characters) {
  console.log(`- ${character.displayName}`);
}
