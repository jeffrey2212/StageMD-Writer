# StageMD 中文舞台劇劇本編輯器規格草案

## 目標

StageMD 是一個面向中文、粵語與華語舞台劇創作的劇本編輯器。它的核心概念接近 Markdown：作者在 editor 中使用輕量文字語法寫作，系統在 preview/export 時轉換成可閱讀、可排練、可列印的 HTML 或 PDF 格式。

本規格以 `output sample/_intoTheWonderland_wp5_演出版本Cue版.pdf` 作為第一個輸出版式參考。該 PDF 的主要特徵包括：

- 劇名、作者與版本資訊出現在開頭。
- 場次以「序場」、「第一場 - 最佳銷售員」等方式呈現。
- 場次下可有「場景：...」、「人物：...」等 metadata。
- 角色對話使用「角色： 對白」格式；換行後必須使用 hanging indent，讓續行準確對齊對白起點，這是中文輸出可讀性的核心要求。
- 舞台指示多為獨立段落，例如「燈亮，...」、「燈轉，...」、「燈暗，...」。
- 行內舞台指示使用全形或半形方括號，例如「[頓]」、「［這個時候Beta舉手］」。
- 頁腳呈現「第 N 頁（共 M 頁）」。
- Cue 版需要保留燈光、音效、停頓、進退場等演出提示。

## 產品範圍

### Editor

Editor 是主工作區，提供文字寫作、語法高亮、即時預覽、角色資料連動和輸出功能。

第一版應支援：

- StageMD 純文字語法編輯。
- HTML preview。
- PDF export。
- 場次、角色、舞台指示、行內指示、排版標記的語法高亮。
- 左側 project/script navigation。
- 角色清單自動偵測與手動管理。
- 基本劇本 metadata 管理。
- 對 PDF 範例風格的輸出模板。

後續版本可支援：

- 多模板輸出，例如閱讀版、排練版、Cue 版、投稿版。
- Revision tracking。
- 多人協作。
- 鎖定頁碼、排練備註、舞監 cue sheet。

### 左側導航與資料區

左側導航以 project 為單位，每個 project 代表一個劇本或創作案。每個 project 下可包含：

- 劇本文檔。
- 角色資料。
- 世界觀、設定、場景、時間線。
- Reference files，例如 PDF、Markdown、文字檔、圖片。
- Research notes。
- Agent tasks。

### Agentic AI 區

Agentic AI 主要負責資料搜集、整理、比對與輔助創作，而不是直接覆蓋作者文字。

第一版可先設計為 adapter abstraction，預留連接 `hermes-agent`：

- Web research：依 topic 搜集資料，產出來源摘要。
- Local reference QA：針對 project 內 PDF、MD、TXT 問答。
- Character extraction：從劇本文字中提取角色候選。
- Continuity check：檢查角色設定、稱呼、時間線是否矛盾。
- Scene research pack：為某一場景生成參考資料包。

AI 產物應存為 project assets，不應直接寫入劇本主文，除非使用者明確接受或插入。

## StageMD 語法草案

StageMD 應保持純文字可讀、低摩擦、適合中文輸入法。

### 文件 metadata

```stagemd
---
title: _intoTheWonderland_
author: 謝斐陳
version: 第五稿
export_profile: cue
language: zh-HK
---
```

### 場次

```stagemd
# 序場

# 第一場 - 最佳銷售員
@場景: 售樓處、辦公室、宴會廳等
@人物: Gigi、老闆、技術員、阿茵、亨少
```

場次 heading 會出現在左側 outline，並作為輸出分段依據。

### 舞台指示

獨立舞台指示可直接寫成自然段：

```stagemd
燈亮，三個同學穿著素色衣服，他們一起像小孩一樣玩遊戲。

大家席地而坐。
```

也可用顯式語法標記，以避免與旁白混淆：

```stagemd
[stage] 燈轉，Gigi 再次戴上面具，面向觀眾。
```

### 角色對話

基本格式：

```stagemd
老師: 同學仔，大家快啲嚟上課啦！快啲過嚟坐好。
同學們: 哦/快啲過嚟/我第一/我快過你呀
```

輸出時應轉成：

- 角色名獨立於對白開頭。
- 對白續行與首行對白區對齊。
- 角色名可從 project 角色表取得顯示名、顏色或註記。

### 中文對白縮排規則

中文舞台劇輸出的可讀性高度依賴角色名後的對白縮排。Renderer 不應只依賴普通空格或瀏覽器自然換行，而應使用明確的 layout contract。

推薦版式：

```text
老師：    好啦，我睇吓大家有無乖，隻腳仔坐得啱唔啱先。
          好啦，而家開始點名。Alpha、Beta、Gamma、Delta，
          疑，Delta呢？
Alpha：   佢好似病咗。
技術員：  臉面太精細，無得求其換㗎。
```

規則：

- 每個 dialogue block 分成 `speaker` 和 `speech` 兩個欄位。
- `speaker` 欄位使用固定寬度，預設可容納 4 個中文字加全形冒號。
- `speech` 欄位從固定的對白起點開始，所有自動換行續行都與該起點對齊。
- 短角色名不應讓對白起點提前；長角色名不應壓縮或覆蓋對白。
- 角色名超過欄位寬度時，模板需提供策略：
  - expand：該頁或該文件使用較寬 speaker 欄。
  - wrap：角色名另起一行，對白下一行開始。
  - compact：只在 Cue/表格版使用較小字號。
- 預設第一版採用 `expand`，根據文件內最長常用角色名計算 speaker 欄寬，並設上限；超過上限才 `wrap`。
- HTML preview 和 PDF export 必須使用同一組排版參數，避免預覽與輸出不同。

CSS 實作方向：

```css
.dialogue {
  display: grid;
  grid-template-columns: var(--speaker-width) 1fr;
  column-gap: var(--dialogue-gap);
}

.speaker {
  white-space: nowrap;
}

.speech {
  min-width: 0;
  overflow-wrap: break-word;
}
```

PDF engine 若不可靠支援 CSS grid，需在 PDF renderer 內用等價的 two-column layout，不能退回普通文字空格對齊。

### 行內舞台指示

```stagemd
老師: 好啦，我睇吓大家有無乖。[頓] 好啦，而家開始點名。
Gigi: 老闆，你睇下呢度。[拉著老闆的手放在胸口上]
```

輸出時可用不同字重、括號樣式或灰階區分，但必須保留在對白行內。

### 停頓、靜默與節奏

中文劇本常見停頓、靜默不一定用英文 screenplay 的 parenthetical 格式。StageMD 應支援短標記：

```stagemd
[pause]
[beat]
[silence 5s]
[靜默]
[停頓]
```

輸出預設：

- `[pause]` 顯示為「[頓]」。
- `[beat]` 顯示為「[停頓]」。
- `[silence 5s]` 顯示為「靜默 5 秒」或模板指定格式。
- 中文原文 `[靜默]`、`[停頓]` 保持原樣。

### Cue

Cue 可用明確標記，供 Cue 版輸出與舞監清單使用：

```stagemd
!cue light: LX 1 燈亮
!cue sound: SFX 3 一聲巨響
!cue prop: Gigi 除下面具
```

在閱讀版可隱藏或淡化；在 Cue 版中應保留、突出或匯出為 cue table。

### 註解

```stagemd
// 作者註：這段需要再查售樓處用語。
```

預設不輸出，可在 debug/export options 中選擇包含。

## 輸出格式

### HTML

HTML preview 需支援：

- 響應式閱讀。
- 場次 outline。
- 對白與舞台指示樣式。
- 可切換閱讀版、Cue 版。
- 點擊角色名查看角色資料。

### PDF

PDF export 需支援：

- A4。
- 中文字體嵌入或可靠 fallback。
- 頁碼與總頁數。
- 可控制邊距、行距、字號。
- 對白續行 hanging indent，續行必須對齊對白起點。
- 場次 metadata。
- Cue 版模板。

第一版輸出可先以 HTML/CSS paged media 或 headless browser 生成 PDF；若排版控制不足，再引入 dedicated PDF layout engine。

## 資料模型

### Project

```ts
type Project = {
  id: string;
  title: string;
  rootPath: string;
  scripts: ScriptDocument[];
  characters: Character[];
  references: ReferenceAsset[];
  notes: Note[];
  agentTasks: AgentTask[];
};
```

### ScriptDocument

```ts
type ScriptDocument = {
  id: string;
  projectId: string;
  title: string;
  path: string;
  format: "stagemd";
  metadata: ScriptMetadata;
  scenes: SceneIndex[];
};
```

### Character

```ts
type Character = {
  id: string;
  displayName: string;
  aliases: string[];
  description?: string;
  voiceNotes?: string;
  relationships?: string[];
  source: "manual" | "detected" | "agent";
};
```

### ReferenceAsset

```ts
type ReferenceAsset = {
  id: string;
  projectId: string;
  kind: "pdf" | "markdown" | "text" | "image" | "url";
  title: string;
  pathOrUrl: string;
  tags: string[];
  indexedAt?: string;
};
```

## 非目標

第一階段不處理：

- 完整多人即時協作。
- 複雜權限系統。
- 全自動劇本生成。
- 影視 screenplay 英文標準格式完整相容。
- 手機端完整編輯體驗。

## 風險與待決策

- PDF 輸出品質是核心風險，需早期做 vertical slice。
- 中文字體、標點、換行與粵語字可能造成跨平台差異。
- 角色名偵測需避免把普通段落誤判為對話。
- Agent 連接 `hermes-agent` 的 API 邊界需確認。
- Reference indexing 涉及 PDF 解析、中文分詞和來源引用，需要逐步收斂。
