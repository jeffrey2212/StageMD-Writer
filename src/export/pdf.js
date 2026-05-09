import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";

function findPlaywrightIndex() {
  const directCandidates = [
    resolve("node_modules", "playwright", "index.js"),
    process.env.STAGEMD_PLAYWRIGHT_INDEX
  ].filter(Boolean);

  for (const candidate of directCandidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const roots = [
    join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules"),
    "C:\\Users\\Admin\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules"
  ];

  for (const root of roots) {
    const direct = join(root, "playwright", "index.js");
    if (existsSync(direct)) {
      return direct;
    }

    const pnpmRoot = join(root, ".pnpm");
    if (!existsSync(pnpmRoot)) {
      continue;
    }
    const dirs = readdirSync(pnpmRoot, { withFileTypes: true });
    for (const entry of dirs) {
      if (!entry.isDirectory() || !entry.name.startsWith("playwright@")) {
        continue;
      }
      const candidate = join(pnpmRoot, entry.name, "node_modules", "playwright", "index.js");
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

async function loadPlaywright() {
  const indexPath = findPlaywrightIndex();
  if (!indexPath) {
    throw new Error(
      [
        "Playwright runtime not found.",
        "Install playwright locally, or set STAGEMD_PLAYWRIGHT_INDEX to playwright/index.js."
      ].join(" ")
    );
  }
  const playwright = await import(pathToFileURL(indexPath).href);
  return playwright.default ?? playwright;
}

function toFileUrl(path) {
  return pathToFileURL(resolve(path)).href;
}

export async function exportPdfFromHtmlFile(options) {
  const playwright = await loadPlaywright();
  const chromium = playwright.chromium;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(toFileUrl(options.htmlPath), { waitUntil: "networkidle" });
    await page.pdf({
      path: options.pdfPath,
      format: "A4",
      margin: {
        top: "16mm",
        right: "12mm",
        bottom: "16mm",
        left: "12mm"
      },
      printBackground: true
    });
  } finally {
    await browser.close();
  }
}

