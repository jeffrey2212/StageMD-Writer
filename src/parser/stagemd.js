const DIALOGUE_PATTERN = /^([\p{L}\p{N}_\-\s]{1,30})([:：])\s*(.+)$/u;
const SCENE_META_PATTERN = /^@([^:：\s]+)\s*[:：]\s*(.+)$/u;

export function parseStageMd(input) {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const nodes = [];
  let inFrontmatter = false;
  let frontmatterClosed = false;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();
    const lineNo = i + 1;

    if (!frontmatterClosed && line === "---") {
      if (!inFrontmatter && nodes.length === 0) {
        inFrontmatter = true;
        nodes.push({ type: "frontmatter_start", line: lineNo });
        continue;
      }
      if (inFrontmatter) {
        inFrontmatter = false;
        frontmatterClosed = true;
        nodes.push({ type: "frontmatter_end", line: lineNo });
        continue;
      }
    }

    if (inFrontmatter) {
      if (line === "") {
        nodes.push({ type: "blank", line: lineNo });
        continue;
      }
      const sceneMetaMatch = line.match(SCENE_META_PATTERN);
      if (sceneMetaMatch) {
        nodes.push({
          type: "frontmatter_field",
          line: lineNo,
          key: sceneMetaMatch[1].trim(),
          value: sceneMetaMatch[2].trim()
        });
      } else {
        nodes.push({ type: "frontmatter_text", line: lineNo, text: line });
      }
      continue;
    }

    if (line === "") {
      nodes.push({ type: "blank", line: lineNo });
      continue;
    }

    if (line.startsWith("//")) {
      nodes.push({ type: "comment", line: lineNo, text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push({ type: "scene_heading", line: lineNo, text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith("!cue ")) {
      nodes.push({ type: "cue", line: lineNo, text: line.slice(5).trim() });
      continue;
    }

    const sceneMetaMatch = line.match(SCENE_META_PATTERN);
    if (sceneMetaMatch) {
      nodes.push({
        type: "scene_meta",
        line: lineNo,
        key: sceneMetaMatch[1].trim(),
        value: sceneMetaMatch[2].trim()
      });
      continue;
    }

    const dialogueMatch = raw.match(DIALOGUE_PATTERN);
    if (dialogueMatch) {
      nodes.push({
        type: "dialogue",
        line: lineNo,
        speaker: dialogueMatch[1].trim(),
        delimiter: dialogueMatch[2],
        speech: dialogueMatch[3].trim()
      });
      continue;
    }

    nodes.push({ type: "stage_direction", line: lineNo, text: line });
  }

  return { nodes };
}

export function extractCharacters(ast) {
  const names = new Map();
  for (const node of ast.nodes) {
    if (node.type !== "dialogue") {
      continue;
    }
    const normalized = node.speaker.replace(/\s+/g, " ").trim();
    if (!names.has(normalized)) {
      names.set(normalized, {
        displayName: normalized,
        source: "detected"
      });
    }
  }
  return [...names.values()];
}
