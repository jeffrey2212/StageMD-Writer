# StageMD Requirements

## 使用者

主要使用者：

- 劇作家：需要專注寫作、快速改稿、輸出排練版。
- 導演：需要閱讀場次、角色、舞台指示與版本變化。
- 舞台監督：需要 Cue 版、頁碼、燈光音效提示、排練備註。
- Dramaturg / research assistant：需要管理 reference、整理資料、查證設定。

## 功能需求

### R1 Project 管理

- 使用者可以建立、打開、重新命名、刪除 project。
- 每個 project 可以包含多份劇本文檔。
- 左側導航可以按 project 顯示 scripts、characters、references、notes、agent tasks。
- Project metadata 至少包含 title、author、language、createdAt、updatedAt。

### R2 StageMD 編輯器

- 使用者可以用純文字語法編輯劇本。
- 編輯器需支援中文輸入法，不應破壞 composition event。
- 需提供語法高亮：場次、metadata、角色名、舞台指示、行內指示、cue、comment。
- 需提供基本快捷鍵：儲存、預覽、輸出、搜尋。
- 需支援 undo/redo。
- 需支援文件 dirty state。

### R3 Parser

- Parser 需將 StageMD 轉為 AST。
- Parser 需保留原始文字位置，用於錯誤提示、outline、preview sync。
- Parser 需辨識：
  - frontmatter metadata
  - scene heading
  - scene metadata
  - dialogue
  - stage direction
  - inline direction
  - cue
  - comment
  - blank line / paragraph
- Parser 發生錯誤時不可阻止使用者繼續編輯，應顯示可恢復診斷。

### R4 Preview

- 使用者可以看到 HTML preview。
- Preview 需支援跟隨 editor scroll。
- Preview 需支援閱讀版與 Cue 版切換。
- Preview 需呈現中文劇本排版，而非英文 screenplay 格式。
- Preview 中角色對話需使用固定 speaker 欄與 speech 欄，長對白自動換行後必須對齊 speech 欄起點。

### R5 PDF Export

- 使用者可以輸出 PDF。
- PDF 需包含頁碼與總頁數。
- PDF 需支援 A4 版面。
- PDF 需支援中文字體。
- PDF 需保留角色對話、舞台指示、行內指示、Cue 標記。
- PDF 需保證中文角色對話 hanging indent：同一段對白的第二行及後續行不得回到頁面左邊界，也不得與角色名重疊。
- PDF export 需提供角色欄寬策略，至少支援依最長角色名自動計算欄寬並設定上限。
- PDF 需至少有兩種 profile：
  - reading：清爽閱讀版。
  - cue：保留演出 cue 的排練版。

### R6 角色管理

- 系統可以從對白行自動偵測角色。
- 使用者可以手動新增、合併、改名角色。
- 角色可有 alias，例如「老師」、「Teacher」或不同版本稱呼。
- 角色資料變更可反映在 editor autocomplete 和 preview。
- 刪除角色不應刪除劇本文字，只移除角色資料。

### R7 Reference 管理

- 使用者可以將 PDF、Markdown、TXT、URL 加入 project references。
- Reference 可加 tag、摘要、備註。
- 系統可為 reference 建立 index，供搜尋和 agent 使用。
- Reference 原文需可追溯來源位置，例如 PDF 頁碼或 markdown heading。

### R8 Agentic AI

- 系統需提供 agent adapter，第一目標為可連接 `hermes-agent`。
- 使用者可以建立 research task。
- Agent task 需保留 prompt、status、result、sources、createdAt。
- Agent result 預設存入 notes/research，不直接覆寫 script。
- 使用者可以將 agent result 片段插入劇本或角色資料。
- Agent 需能使用 project references 作為 context。

### R9 搜尋與導覽

- 左側 outline 需顯示場次。
- 可搜尋全文、角色、reference。
- 點選場次可跳至 editor 對應位置。
- 錯誤診斷可點擊跳到原文。

### R10 檔案與版本

- 第一版可使用 local filesystem。
- 劇本文檔以 `.stagemd` 儲存。
- Project metadata 可用 JSON。
- 應避免 lock-in：核心劇本必須是純文字。

## 非功能需求

### NFR1 效能

- 10 萬字劇本在普通筆電上可流暢編輯。
- Parser 應支援 incremental 或 debounce parse。
- Preview 更新不應阻塞輸入。

### NFR2 可用性

- 中文輸入法、全形標點和粵語字需是一等公民。
- 錯誤訊息應用作者能理解的語言描述。
- 預設模板應接近中文舞台劇排練稿，而非英語 screenplay。
- 對白縮排需作為第一級可用性要求；只要長對白換行後難以追讀，該輸出即視為不合格。

### NFR3 可測試性

- Parser、renderer、exporter、agent adapter 需分層。
- StageMD fixtures 需覆蓋範例 PDF 中出現的格式。
- PDF export 需有 snapshot 或 visual regression 測試。

### NFR4 安全與資料保護

- Local reference 不應未經確認上傳到外部 agent。
- Agent task 需標示使用了哪些 sources。
- API keys 不應存入 project 明文檔案。

### NFR5 可擴展性

- 輸出模板需可替換。
- Agent provider 需可替換。
- Parser AST 需保留向後相容空間。

## 驗收標準

第一個 MVP 可接受條件：

- 可以建立 project。
- 可以編輯一份 `.stagemd`。
- 可以解析並 preview 至少 4 類內容：場次、角色對白、舞台指示、行內指示。
- 可以從劇本自動列出角色。
- 可以輸出 A4 PDF，格式大致對齊範例 PDF 的中文舞台劇排版，並正確處理角色對話續行縮排。
- 可以加入 reference file 並在 project 中列出。
- 可以建立一個 mock agent research task，保存結果。
