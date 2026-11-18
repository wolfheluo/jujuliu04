/* ============================================================
   JUJU — 過場
   · 出場：紙蓋上來（.curtain），內容縮 0.75%，等紙蓋滿才換頁
   · 進場：<head> 的 inline script 已先把 nav-arrive 掛上（紙是全的），
           這一支只負責把紙退開
   ============================================================ */
(() => {
  "use strict";

  const KEY = "juju:nav";
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let leaving = false;                 /* 避免連點造成兩次換頁 */

  /* ---------- 進場：紙退開 ---------- */
  function reveal(){
    /* 等第一次繪製完成，再拿掉 nav-arrive，才會有轉場而不是瞬間消失 */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove("nav-arrive");
      /* 紙退完之後通知頁面重新量測（縮放會影響 getBoundingClientRect） */
      setTimeout(() => window.dispatchEvent(new Event("juju:reveal")), 520);
    }));
  }

  function takeKey(){
    try {
      const on = sessionStorage.getItem(KEY) === "1";
      sessionStorage.removeItem(KEY);
      return on;
    } catch (_) { return false; }
  }

  if (root.classList.contains("nav-arrive")) reveal();

  /* ---------- 出場：只有站內連結才攔 ---------- */
  document.addEventListener("click", event => {
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href)) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    if (reduce.matches) return;          /* 關掉動畫：直接跳 */
    if (leaving) { event.preventDefault(); return; }
    leaving = true;

    event.preventDefault();
    try { sessionStorage.setItem(KEY, "1"); } catch (_) {}
    root.classList.add("nav-out");

    /* 紙蓋到約九成再換頁（轉場 0.34s，320ms 出發） */
    setTimeout(() => { window.location.href = href; }, 320);

    /* 保險：萬一換頁沒發生（被攔、下載、bfcache 凍結），不要卡住 */
    setTimeout(() => { leaving = false; }, 1600);
  }, true);

  /* ---------- 從上一頁返回（bfcache）時把殘留狀態清掉 ----------
     關鍵：leaving 一定要歸零，否則「進去再返回」之後整頁就再也點不動了 */
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;

    /* 由站內連結還原（頁面被 bfcache 留著）：補一段紙退開 */
    const fromLink = takeKey();

    leaving = false;
    root.classList.remove("nav-out", "nav-arrive");

    if (fromLink) {
      /* 先讓紙是滿的，下一帧再退開 */
      void root.offsetWidth;
      root.classList.add("nav-arrive");
      reveal();
    }
  });

  /* 分頁被切回來時再保險一次 */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && root.classList.contains("nav-out")) {
      leaving = false;
      root.classList.remove("nav-out");
    }
  });
})();
