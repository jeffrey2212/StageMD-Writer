import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import os from "node:os";
import { parseStageMd } from "../src/parser/stagemd.js";
import { renderHtml } from "../src/renderer/html.js";
import { exportPdfFromHtmlFile } from "../src/export/pdf.js";

function parseArgs(argv) {
  const input = argv[0];
  const output = argv[1];
  const profile = argv[2] ?? "cue";

  if (!input || !output) {
    throw new Error(
      "Usage: node scripts/export-pdf.js <input.stagemd> <output.pdf> [reading|cue]"
    );
  }
  if (profile !== "reading" && profile !== "cue") {
    throw new Error("Profile must be reading or cue.");
  }

  return { input: resolve(input), output: resolve(output), profile };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = readFileSync(args.input, "utf8");
  const ast = parseStageMd(source);
  const html = renderHtml(ast, { profile: args.profile });

  const tempDir = mkdtempSync(join(os.tmpdir(), "stagemd-"));
  const tempHtmlPath = join(tempDir, "preview.html");
  writeFileSync(tempHtmlPath, html, "utf8");

  try {
    await exportPdfFromHtmlFile({
      htmlPath: tempHtmlPath,
      pdfPath: args.output
    });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  console.log(`pdf exported: ${args.output}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

