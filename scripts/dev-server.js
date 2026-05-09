import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.argv[2] || 4173);

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".pdf", "application/pdf"]
]);

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const candidate = normalize(clean).replace(/^(\.\.[/\\])+/, "");
  return resolve(root, `.${candidate}`);
}

const server = http.createServer((req, res) => {
  const reqPath = req.url === "/" ? "/ui/index.html" : req.url;
  const filePath = safePath(reqPath);

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Not found");
    return;
  }

  const type = mime.get(extname(filePath).toLowerCase()) || "application/octet-stream";
  res.statusCode = 200;
  res.setHeader("content-type", type);
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`StageMD dev server running at http://localhost:${port}/ui/index.html`);
});

