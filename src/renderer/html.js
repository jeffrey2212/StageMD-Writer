function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function defaultCss() {
  return `
:root {
  --speaker-width: 8em;
  --dialogue-gap: 0.75em;
}
body {
  margin: 0;
  background: #f7f5ef;
  color: #1f1f1f;
  font-family: "Noto Serif TC", "PingFang TC", "Microsoft JhengHei", serif;
  line-height: 1.7;
}
main {
  width: min(900px, 92vw);
  margin: 2rem auto 4rem;
}
.scene-heading {
  font-size: 1.35rem;
  margin: 1.75rem 0 0.75rem;
}
.scene-meta {
  margin: 0.2rem 0;
}
.stage-direction {
  margin: 0.5rem 0;
  font-family: "DFKai-SB", "BiauKai", "KaiTi", "STKaiti", serif;
  letter-spacing: 0.02em;
}
.dialogue {
  display: grid;
  grid-template-columns: var(--speaker-width) minmax(0, 1fr);
  column-gap: var(--dialogue-gap);
  align-items: start;
  margin: 0.2rem 0;
}
.speaker {
  white-space: nowrap;
  text-align: left;
  font-weight: 600;
}
.speech {
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
.inline-direction {
  font-family: "DFKai-SB", "BiauKai", "KaiTi", "STKaiti", serif;
  color: #3b4a63;
}
.cue {
  margin: 0.45rem 0;
  color: #8f1f1f;
  font-weight: 600;
}
`;
}

function renderInlineDirections(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/[\[［]([^\]］]+)[\]］]/g, (_full, inner) => {
    return `<span class="inline-direction">【${inner}】</span>`;
  });
}

export function renderHtml(ast, options = {}) {
  const profile = options.profile ?? "reading";
  const includeCue = profile === "cue";
  const parts = [];

  for (const node of ast.nodes) {
    switch (node.type) {
      case "scene_heading":
        parts.push(`<h2 class="scene-heading">${escapeHtml(node.text)}</h2>`);
        break;
      case "scene_meta":
        parts.push(
          `<p class="scene-meta"><strong>${escapeHtml(node.key)}：</strong>${escapeHtml(node.value)}</p>`
        );
        break;
      case "stage_direction":
        parts.push(`<p class="stage-direction">${escapeHtml(node.text)}</p>`);
        break;
      case "dialogue":
        parts.push(
          `<div class="dialogue"><div class="speaker">${escapeHtml(node.speaker)}${escapeHtml(
            node.delimiter
          )}</div><div class="speech">${renderInlineDirections(node.speech)}</div></div>`
        );
        break;
      case "cue":
        if (includeCue) {
          parts.push(`<p class="cue">[CUE] ${escapeHtml(node.text)}</p>`);
        }
        break;
      default:
        break;
    }
  }

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StageMD Preview</title>
  <style>${defaultCss()}</style>
</head>
<body>
  <main>
${parts.join("\n")}
  </main>
</body>
</html>`;
}
