# StageMD Development Phases

## Phase 0: Foundation

目標：建立可開發、可測試、可演示的專案骨架。

交付：

- App 技術棧決策。
- Repo 結構。
- StageMD fixture samples。
- Parser package skeleton。
- Renderer/exporter package skeleton。
- Basic UI shell with project sidebar and editor area。
- CI/test command。

建議技術方向：

- Desktop/local-first first：Electron 或 Tauri + web frontend。
- Editor：Monaco 或 CodeMirror 6。
- Parser：TypeScript parser，輸出 typed AST。
- Preview：React/Vue/Svelte 任一，但需保持 renderer 可測。
- PDF：先用 Chromium print-to-PDF 驗證版面。

完成標準：

- 開發者能啟動 app shell。
- 測試能跑。
- 一份 sample `.stagemd` 能被 parser 解析。

## Phase 1: StageMD Core

目標：完成劇本語法、AST、HTML preview vertical slice。

交付：

- StageMD parser。
- AST schema。
- Parser diagnostics。
- HTML renderer。
- 範例劇本轉換 preview。
- 場次 outline。
- 角色自動偵測。

重點：

- 先支援範例 PDF 中真正出現的格式。
- 對話與舞台指示判斷要保守。
- 保留 source position，方便後續 editor sync。

完成標準：

- `fixtures/into-wonderland-excerpt.stagemd` 可穩定轉 HTML。
- Parser unit tests 覆蓋場次、metadata、對話、續行、行內指示、cue。

## Phase 2: Editor UX

目標：讓作者可以真的寫。

交付：

- Code editor integration。
- Syntax highlighting。
- Autocomplete for character names and cue keywords。
- Dirty state and save。
- Split view preview。
- Search。
- Scene navigation。
- Character panel。

完成標準：

- 使用者可以新建 project、寫一場戲、預覽、儲存、重新打開。
- 中文輸入法無明顯卡頓或 composition bug。

## Phase 3: PDF Export

目標：輸出可排練、可分享的 PDF。

交付：

- PDF export pipeline。
- Reading profile。
- Cue profile。
- A4 pagination。
- Page footer with current/total page count。
- Chinese font strategy。
- Export settings UI。

完成標準：

- 一份 20-30 頁中文劇本能輸出 PDF。
- 與範例 PDF 的核心版式相近：角色對話縮排、舞台指示段落、頁腳。
- 有 PDF visual smoke tests。

## Phase 4: Project Knowledge Base

目標：把 reference、設定、角色資料納入 project。

交付：

- Project file layout。
- Reference import。
- PDF/Markdown/Text indexing。
- Notes。
- Character profile editor。
- Reference search。
- Source citation model。

完成標準：

- 使用者可以放入 reference PDF/MD/TXT。
- 可以搜尋 reference。
- 可以把 reference 摘要或引用加到 notes。

## Phase 5: Agentic AI Integration

目標：連接 research workflow，預留 `hermes-agent`。

交付：

- Agent provider interface。
- Mock provider。
- Hermes adapter。
- Research task UI。
- Task status and result storage。
- Source-aware result format。
- Character extraction/check task。
- Continuity check task。

完成標準：

- 使用者可以對 project references 或 web topic 發出 research task。
- 結果保存在 project 內，帶 sources。
- 使用者可選擇把結果插入 notes、角色資料或劇本。

## Phase 6: Revision and Production Tools

目標：支援排練、改稿與演出製作。

交付：

- Version snapshots。
- Change notes。
- Cue sheet export。
- Rehearsal notes。
- Lock scene/page references。
- Print profiles。

完成標準：

- 舞監可以由劇本匯出 cue list。
- 作者可以比較版本變更。

## Phase 7: Collaboration

目標：多人共同使用。

交付：

- Optional sync backend。
- Comments。
- Role-based sharing。
- Conflict handling。

完成標準：

- 多人可讀寫同一 project，且純文字劇本仍可安全保存。

## 建議最小 MVP

最小 MVP 應切在 Phase 3 結束：

- Local project。
- StageMD editor。
- HTML preview。
- 角色自動偵測。
- PDF export。
- Cue profile。

Agent 和 reference 可以在 MVP 後開始，但資料模型要在 Phase 0/1 就預留。
