/* ============================================================
   以後 — 清單
   資料：localStorage（juju:list:v1）
   第一次打開（本機沒有資料）→ 讀 seed.json 當底稿
   ============================================================ */
(() => {
  "use strict";

  const KEY = "juju:list:v1";
  const ARCHIVE_KEY = "juju:list:archive";

  const pageEl   = document.getElementById("listPage");
  const lineEl   = document.getElementById("line");
  const openEl   = document.getElementById("open");
  const doneEl   = document.getElementById("done");
  const archiveEl = document.getElementById("archive");
  const toggleEl = document.getElementById("archiveToggle");
  const countEl  = document.getElementById("count");
  const formEl   = document.getElementById("addForm");
  const inputEl  = document.getElementById("addInput");
  const exportEl = document.getElementById("exportBtn");
  const importEl = document.getElementById("importBtn");
  const fileEl   = document.getElementById("importFile");

  let items = [];
  let composing = false;
  let archiveOpen = false;

  /* ---------------- 資料 ---------------- */

  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (_) {}
  }

  function normalize(list, freshIds) {
    const out = [];
    for (const raw of Array.isArray(list) ? list : []) {
      const o = (typeof raw === "string") ? { text: raw } : (raw || {});
      const text = String(o.text || "").trim();
      if (!text) continue;
      out.push({
        id: freshIds || !o.id ? uid() : String(o.id),
        text: text.slice(0, 120),
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        doneAt: o.doneAt ? new Date(o.doneAt).toISOString() : null
      });
    }
    return out;
  }

  async function loadSeed() {
    try {
      const res = await fetch("seed.json", { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return normalize(Array.isArray(data) ? data : (data.items || []), true);
    } catch (_) { return []; }
  }

  /* ---------------- 畫面 ---------------- */

  const fmt = iso => {
    const d = new Date(iso);
    const p = n => String(n).padStart(2, "0");
    return d.getFullYear() + "." + p(d.getMonth() + 1) + "." + p(d.getDate());
  };

  function row(item) {
    const li = document.createElement("li");
    li.className = "row" + (item.doneAt ? " on" : "");
    li.dataset.id = item.id;

    const box = document.createElement("button");
    box.type = "button";
    box.className = "box";
    box.setAttribute("role", "checkbox");
    box.setAttribute("aria-checked", String(!!item.doneAt));
    box.setAttribute("aria-label", item.doneAt ? "取消完成" : "標記完成");
    box.addEventListener("click", () => toggle(item, li));

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = item.text;
    text.tabIndex = 0;
    text.title = "點一下可以改";
    text.addEventListener("click", () => edit(item, text));
    text.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); edit(item, text); }
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.textContent = "×";
    del.setAttribute("aria-label", "刪除這一筆");
    del.addEventListener("click", () => remove(item, del));

    li.append(box, text);
    if (item.doneAt) {
      const when = document.createElement("time");
      when.className = "when";
      when.dateTime = item.doneAt;
      when.textContent = fmt(item.doneAt);
      li.append(when);
    }
    li.append(del);
    return li;
  }

  function render() {
    const open = items.filter(i => !i.doneAt)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const done = items.filter(i => i.doneAt)
      .sort((a, b) => b.doneAt.localeCompare(a.doneAt));

    openEl.replaceChildren(...open.map(row));
    doneEl.replaceChildren(...done.map(row));

    countEl.textContent = String(done.length);
    archiveEl.hidden = done.length === 0;
    pageEl.classList.toggle("has-items", items.length > 0);

    applyArchive();
  }

  function applyArchive() {
    archiveEl.classList.toggle("open", archiveOpen);
    toggleEl.setAttribute("aria-expanded", String(archiveOpen));
  }

  function flashCount() {
    countEl.classList.remove("flash");
    void countEl.offsetWidth;
    countEl.classList.add("flash");
  }

  /* ---------------- 動作 ---------------- */

  function toggle(item, li) {
    /* 取消完成：直接回到上面 */
    if (item.doneAt) {
      item.doneAt = null;
      write();
      render();
      return;
    }

    /* 完成：先留著演完那一道斜線，再沉進封存 */
    item.doneAt = new Date().toISOString();
    write();

    /* 先讓那條線劃完（看得見），再淡出、沉進封存 */
    li.classList.add("on");
    const slash = document.createElement("span");
    slash.className = "slash";
    li.append(slash);

    setTimeout(() => li.classList.add("leaving"), 620);
    setTimeout(() => {
      render();
      flashCount();
    }, 980);
  }

  function edit(item, textEl) {
    if (textEl.dataset.editing) return;
    textEl.dataset.editing = "1";

    const input = document.createElement("input");
    input.className = "edit";
    input.type = "text";
    input.maxLength = 120;
    input.value = item.text;
    textEl.replaceWith(input);
    input.focus();
    input.select();

    let settled = false;
    const finish = save => {
      if (settled) return;
      settled = true;
      const v = input.value.trim();
      if (save && v && v !== item.text) {
        item.text = v;
        write();
      }
      render();
    };

    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); finish(true); }
      else if (e.key === "Escape") { e.preventDefault(); finish(false); }
    });
    input.addEventListener("blur", () => finish(true));
  }

  function remove(item, btn) {
    if (btn.dataset.confirm === "1") {
      items = items.filter(x => x.id !== item.id);
      write();
      render();
      return;
    }
    btn.dataset.confirm = "1";
    btn.classList.add("confirm");
    btn.textContent = "確定";
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      btn.dataset.confirm = "";
      btn.classList.remove("confirm");
      btn.textContent = "×";
    }, 4000);
  }

  function add() {
    const v = inputEl.value.trim();
    if (!v) return;
    items.push({
      id: uid(),
      text: v.slice(0, 120),
      createdAt: new Date().toISOString(),
      doneAt: null
    });
    write();
    inputEl.value = "";
    render();
    inputEl.focus();
  }

  /* ---------------- 事件 ---------------- */

  inputEl.addEventListener("compositionstart", () => { composing = true; });
  inputEl.addEventListener("compositionend", () => { composing = false; });

  formEl.addEventListener("submit", e => {
    e.preventDefault();
    if (composing) return;           /* 中文輸入法選字時的 Enter 不算送出 */
    add();
  });

  toggleEl.addEventListener("click", () => {
    archiveOpen = !archiveOpen;
    try { localStorage.setItem(ARCHIVE_KEY, archiveOpen ? "1" : "0"); } catch (_) {}
    applyArchive();
  });

  exportEl.addEventListener("click", () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), items };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = url;
    a.download = "juju-list-" + stamp + ".json";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });

  importEl.addEventListener("click", () => fileEl.click());

  fileEl.addEventListener("change", async () => {
    const file = fileEl.files && fileEl.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const next = normalize(Array.isArray(data) ? data : (data.items || []), true);
      if (!confirm("以這個檔案的 " + next.length + " 筆，取代目前的 " + items.length + " 筆？")) return;
      items = next;
      write();
      render();
    } catch (err) {
      alert("讀不了這個檔案：" + err.message);
    } finally {
      fileEl.value = "";
    }
  });

  /* 鍵盤：任何時候按 n 都可以直接開始新增 */
  document.addEventListener("keydown", e => {
    if (e.key !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    e.preventDefault();
    inputEl.focus();
  });

  /* ---------------- 開機 ---------------- */

  (async () => {
    try { archiveOpen = localStorage.getItem(ARCHIVE_KEY) === "1"; } catch (_) {}

    const saved = read();
    if (Array.isArray(saved)) {
      items = normalize(saved);
    } else {
      items = await loadSeed();
      write();
    }
    render();
  })();
})();
