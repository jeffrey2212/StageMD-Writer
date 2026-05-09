# StageMD Writer

中文舞台劇劇本編輯器。目標是用類 Markdown 的純文字語法寫劇本，並輸出適合閱讀、排練與 Cue 使用的 HTML/PDF。

目前本 repo 先放產品與工程規格：

- [產品規格](docs/spec.md)
- [需求文件](docs/requirements.md)
- [開發階段](docs/phases.md)
- [測試策略](docs/testing.md)

第一個版式參考為 `output sample/_intoTheWonderland_wp5_演出版本Cue版.pdf`。

## StageMD 語法

StageMD 是面向中文舞台劇的純文字格式，核心是「寫作時簡單、輸出時有排版」。

### 1) 文件 metadata（frontmatter）

```stagemd
---
title: _intoTheWonderland_
author: 謝斐陳
version: 第五稿
---
```

### 2) 場次

```stagemd
# 序場
# 第一場 - 最佳銷售員
```

### 3) 場次 metadata

```stagemd
@場景: 售樓處、辦公室、宴會廳等
@人物: Gigi、老闆、技術員、阿茵、亨少
```

### 4) 角色對白

```stagemd
老師： 同學仔，大家快啲嚟上課啦！
技術員: 爛成咁，點搞呀？
```

支援全形冒號 `：` 與半形冒號 `:`。

推薦的新格式（更易於自訂規則）：

```stagemd
!d 老師 | 同學仔，大家快啲嚟上課啦！
!d 舞監 A | LX 1 Standby
```

`!d` 格式的優點是不用依賴冒號判斷，且角色名稱可含空格。

對白續行可直接用前導空格：

```stagemd
!d Gigi | 我係一個叫Project TS計劃入面其中一個仿生人，
  佢哋之前通常叫我哋做1號、2號、3號咁。
```

### 5) 舞台指示（獨立段落）

```stagemd
燈亮，三個同學穿著素色衣服，他們一起像小孩一樣玩遊戲。
燈暗。
```

### 6) 對白內舞台指示（inline）

```stagemd
老師： 好啦，我睇吓大家有無乖。[頓] 好啦，而家開始點名。
Gigi： 求你［等我一陣］
```

render 時會轉成全形括號樣式：`【頓】`、`【等我一陣】`。

### 7) Cue（演出提示）

```stagemd
!cue light: LX 1 燈亮
!cue sound: SFX 3 一聲巨響
!cue prop: Gigi 除下面具
```

`reading` profile 預設隱藏 cue；`cue` profile 會顯示 cue。

### 8) 註解

```stagemd
// 作者註：這段需要再查售樓處用語。
```

目前註解不會輸出到 HTML/PDF。

常用命令：

- `node scripts/render-demo.js` 產生 HTML 預覽到 `dist/preview-cue.html`
- `node scripts/export-pdf.js fixtures/into-wonderland-excerpt.stagemd dist/preview-cue.pdf cue` 匯出 PDF
