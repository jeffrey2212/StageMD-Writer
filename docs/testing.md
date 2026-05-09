# StageMD Testing Strategy

## 測試目標

StageMD 的高風險區域是中文劇本 parser、中文字排版、PDF 輸出，以及 agent/reference 的來源追溯。測試策略需確保：

- 作者輸入不會被破壞。
- StageMD 語法能穩定轉 AST。
- HTML/PDF 輸出符合中文舞台劇格式。
- 中文角色對話換行後維持 hanging indent，可讀性不被長對白破壞。
- 角色偵測不會大量誤判。
- Agent 結果可追溯，不會無聲覆寫劇本。

## Test Fixtures

建立 `fixtures/`：

- `minimal.stagemd`：最小文件。
- `dialogue.stagemd`：多角色對話與續行。
- `stage-directions.stagemd`：獨立舞台指示。
- `inline-directions.stagemd`：`[頓]`、`［動作］`、混合半形/全形括號。
- `cue.stagemd`：light/sound/prop cue。
- `into-wonderland-excerpt.stagemd`：根據 PDF 範例整理 2-3 頁節錄。
- `edge-cases.stagemd`：角色名內含英文、數字、空格、粵語字、冒號出現在普通句子。

## Unit Tests

### Parser

測試：

- Frontmatter 解析。
- 場次 heading。
- `@場景`、`@人物` metadata。
- `角色: 對白` 與 `角色：對白`。
- 對白續行。
- 獨立舞台指示。
- 行內指示。
- Cue 指令。
- Comment 不輸出。
- Source position。
- 錯誤恢復。

### Character Extraction

測試：

- 從 dialogue node 產生角色清單。
- 同一角色多次出現只建立一次。
- alias 合併。
- 普通段落中的冒號不誤判為角色。
- `老師：`、`Gigi:`、`CS-200:` 等中英混合情境。

### Renderer

測試：

- AST to HTML。
- Dialogue block class names。
- Dialogue layout contract：speaker 與 speech 分欄，speech 續行對齊。
- Stage direction class names。
- Inline direction markup。
- Cue profile include cue。
- Reading profile hide or soften cue。

## Integration Tests

### Editor Flow

測試：

- 建立 project。
- 新增 script。
- 輸入中文。
- 儲存。
- 重新打開。
- Preview 更新。
- 點 outline 跳到場次。

### Reference Flow

測試：

- 匯入 Markdown。
- 匯入 PDF。
- 建立 index。
- 搜尋 keyword。
- 顯示 source location。

### Agent Flow

使用 mock provider 測試：

- 建立 research task。
- Task status: queued -> running -> completed。
- Result 儲存。
- Sources 儲存。
- 插入 notes。
- 不自動改寫 script。

## PDF Tests

### Smoke Tests

- 將 `minimal.stagemd` 輸出 PDF。
- 將 `into-wonderland-excerpt.stagemd` 輸出 PDF。
- 確認 PDF 存在且頁數大於 0。
- 確認 PDF 可抽取文字。
- 確認頁腳包含頁碼。

### Visual Regression

對 PDF 頁面 render PNG，做 snapshot compare：

- Page 1 title/scene layout。
- Dialogue indentation，尤其是長中文對白自動換行後的 hanging indent。
- Stage direction paragraph。
- Footer location。
- Cue profile cue visibility。

允許小範圍 pixel diff，因中文字體與系統渲染可能有差異。

### Typography Checks

自動或半自動檢查：

- 中文字未變成 tofu squares。
- 長對白有正常換行，第二行及後續行對齊對白起點。
- 角色名與對白不重疊。
- 短角色名和長角色名混排時，對白起點保持一致或採用明確的長角色名 wrap 策略。
- 頁腳不壓到正文。
- 行內指示不丟失。

## Manual QA Checklist

每次 release 前：

- 用繁體中文輸入法連續輸入 5 分鐘。
- 複製貼上 PDF 範例中的一段文字，確認 parser 不崩潰。
- 新增角色，確認 autocomplete 出現。
- 修改角色名，確認角色 panel 更新但劇本文字不被自動改掉。
- 匯出 reading PDF。
- 匯出 cue PDF。
- 打開 PDF 檢查頁碼、角色對話續行縮排、舞台指示、Cue。
- 加入 reference，搜尋其中一個詞。
- 跑 mock agent task，確認結果可追溯來源。

## Acceptance Test: MVP

Given 一個新 project，
When 使用者貼入一段包含場次、場景、人物、角色對白、舞台指示和行內指示的 StageMD，
Then 系統應：

- 顯示場次 outline。
- 自動列出角色。
- 在 preview 中呈現中文劇本格式。
- 成功輸出 PDF。
- PDF 中保留中文、對白、舞台指示、頁碼，且長對白續行對齊對白起點。

## 測試資料原則

- 測試資料可包含自寫範例與使用者提供的節錄。
- 不把完整 copyrighted PDF 轉存為 fixture，除非使用者明確授權並確認使用範圍。
- 若使用 PDF 範例，只保留短節錄與格式特徵，用於 parser 和排版驗證。
