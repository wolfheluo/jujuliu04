# jujuliu04

兩件關於同一個詞的互動小品，加上把它們裝訂起來的封面。

純靜態：沒有建置、沒有相依、沒有框架。直接開 `index.html` 就能看（建議用本機伺服器）。

## 結構

```
index.html        封面：hover「永遠」→ 斜切黑影掃入；hover「我願意」→ 暗場與光圈
forever.html      永遠：一片 75° 斜切的黑影，游標走到哪，光就切到哪
ring/             我願意：拖動刻度，從 ¥1,750,000 走到 Priceless
assets/           15 張去背戒指（PNG，alpha）
tokens.css        紙、墨、金、字、三檔時間
nav.css / nav.js  頁與頁之間：同一張紙蓋上、再退開
```

## 幾件事

- **斜切黑影**：一整片旋轉 75° 的漸層矩形，只推 `translateY`（合成器處理）。字被黑影蓋到的部分用 `clip-path` 換成紙色＋外光暈。
- **戒指對齊**：每張照片的戒圍圓心與直徑都量過（`ring/ring-frames.js`），統一縮放到同一個開口，換圖才不會抖。
- **過場**：米紙色的 `.curtain` 蓋滿才換頁，目的頁由 `<head>` 的 inline script 先掛上 `nav-arrive`，所以進場也是從滿的紙退開，不會閃一下內容。
- 兩頁左上角都有一條 10px 的 `← JUJU`，與封面同一套字。

## 本機

```bash
python -m http.server 8777
# http://127.0.0.1:8777
```

`prefers-reduced-motion` 全站關閉動畫與過場。

---

wolfheluo
