# jujuliu04

兩件關於同一個詞的互動小品，加上把它們裝訂起來的封面。

純靜態：沒有建置、沒有相依、沒有框架。直接開 `index.html` 就能看（建議用本機伺服器）。

線上：**https://wolfheluo.github.io/jujuliu04/**

## 結構

```
index.html          封面：hover「永遠」→ 斜切黑影掃入；hover「我願意」→ 暗場與光圈；
                    hover「以後」→ 標題被一條金線劃掉
forever/index.html  永遠：一片 75° 斜切的黑影，游標走到哪，光就切到哪
ring/index.html     我願意：拖動刻度，從 ¥1,750,000 走到 Priceless
list/index.html     以後：待實現的清單。隨時新增、勾選完成，完成的收進可展開的封存
list/seed.json      清單的底稿：本機沒有資料時，第一次打開會讀這一份
assets/             15 張去背戒指（PNG，alpha）
tokens.css          紙、墨、金、字、三檔時間
nav.css / nav.js    頁與頁之間：同一張紙蓋上、再退開
```

## 幾件事

- **斜切黑影**：一整片旋轉 75° 的漸層矩形，只推 `translateY`（合成器處理）。字被黑影蓋到的部分用 `clip-path` 換成紙色＋外光暈。
- **戒指對齊**：每張照片的戒圍圓心與直徑都量過（`ring/ring-frames.js`），統一縮放到同一個開口，換圖才不會抖。
- **過場**：米紙色的 `.curtain` 蓋滿才換頁，目的頁由 `<head>` 的 inline script 先掛上 `nav-arrive`，所以進場也是從滿的紙退開，不會閃一下內容。
- 兩頁左上角都有一條 10px 的 `← JUJU`，與封面同一套字。

## 以後 — 資料怎麼走

這個站沒有後端，所以清單住在你自己的瀏覽器裡（`localStorage`，key 是 `juju:list:v1`）。

- **第一次打開**（這台裝置還沒有資料）→ 讀 `list/seed.json` 當底稿，之後就以本機為準。
- **換裝置、換瀏覽器、清快取** → 又是空的；用頁尾的「匯入」把匯出的 JSON 放回去。
- **想讓另一台裝置也看到你新增的項目** → 「匯出」下載 JSON，貼回 `list/seed.json` 再 commit，另一台裝置清掉本機資料後就會讀到。
- 快捷鍵：任何時候按 `n` 可以直接開始新增。
- 刪除是兩段式（第一次點變成「確定」）；勾選後那一筆會劃掉、沉進下方的「已經一起完成的」，點一下標題可以改字。

## 本機

```bash
python -m http.server 8777
# http://127.0.0.1:8777
```

`prefers-reduced-motion` 全站關閉動畫與過場。

---

wolfheluo
