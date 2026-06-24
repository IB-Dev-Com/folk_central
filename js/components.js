/* ============================================================================
   WF-015 FOLK — Shared UI components (design-system helpers)
   HTML-string builders + overlay/toast controllers.
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { util, store } = FOLK;
  const esc = util.esc;

  const STAGE_LABELS = {
    new_contact: "New Contact", contacted: "Contacted", attending: "Attending",
    reading_group: "Reading Group", sadhana_active: "Sadhana Active",
    seva_engaged: "Seva Engaged", potential_preacher: "Potential Preacher", dormant: "Dormant",
  };

  const c = {
    STAGE_LABELS,

    stageBadge(stage) {
      return `<span class="stage-badge" style="background:var(--stage-${stage})">${esc(STAGE_LABELS[stage] || stage)}</span>`;
    },

    riskBadge(flag) {
      if (!flag || flag === "none") return `<span class="badge badge--success"><span class="dot-ic"></span>On track</span>`;
      const map = {
        drop_off_high: ["danger", "High drop-off risk"],
        drop_off_medium: ["warn", "Medium risk"],
        dormant_reengage: ["neutral", "Dormant — re-engage"],
      };
      const [tone, label] = map[flag] || ["neutral", util.titleCase(flag)];
      return `<span class="badge badge--${tone}"><span class="dot-ic"></span>${esc(label)}</span>`;
    },

    idChip(id) { return `<span class="id-chip">${esc(id)}</span>`; },
    seam(label) { return `<span class="seam-chip" title="Shared platform spine seam">${esc(label)}</span>`; },
    nv(flag) { return `<span class="nv-flag" title="Not validated — fallback applies">${esc(flag)}</span>`; },

    badge(text, tone) { return `<span class="badge badge--${tone || "neutral"}">${esc(text)}</span>`; },

    avatar(name) {
      const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      return `<span class="avatar">${esc(initials)}</span>`;
    },

    kpi({ label, value, sub, delta, tone, icon }) {
      return `<div class="kpi">
        <div class="kpi__label">${icon ? icon + " " : ""}${esc(label)}</div>
        <div class="kpi__value">${value}</div>
        ${sub || delta ? `<div class="kpi__sub">${delta ? `<span class="kpi__delta ${tone || ""}">${esc(delta)}</span> ` : ""}${sub ? esc(sub) : ""}</div>` : ""}
      </div>`;
    },

    aiBlock(title, inner) {
      return `<div class="ai-block"><div class="ai-block__head"><span class="spark">✦</span>${esc(title)}</div>${inner}</div>`;
    },

    guideName(id) { const g = store.guide(id); return g ? g.Guide_Name : id; },
    nodeName(id) { const n = store.node(id); return n ? n.Node_Name : id; },

    seekerLink(id) {
      const s = store.seeker(id);
      const name = s ? s.Full_Name : id;
      return `<a href="#/seeker/${esc(id)}" class="seeker-link">${esc(name)}</a>`;
    },

    bar(pct, color) {
      return `<div class="bar"><span style="width:${Math.round(pct * 100)}%;${color ? "background:" + color : ""}"></span></div>`;
    },

    empty(text, icon) {
      return `<div class="empty"><div class="ic">${icon || "✦"}</div><div>${esc(text)}</div></div>`;
    },

    /* ---- overlays ---- */
    overlay(html, { slide } = {}) {
      c.closeOverlay();
      const scrim = document.createElement("div");
      scrim.className = "scrim";
      scrim.innerHTML = `<div class="modal ${slide ? "slideover" : ""}" role="dialog" aria-modal="true">${html}</div>`;
      scrim.addEventListener("mousedown", (e) => { if (e.target === scrim) c.closeOverlay(); });
      document.body.appendChild(scrim);
      const esc = (e) => { if (e.key === "Escape") c.closeOverlay(); };
      document.addEventListener("keydown", esc);
      scrim._esc = esc;
      c._scrim = scrim;
      return scrim.querySelector(".modal");
    },
    closeOverlay() {
      if (c._scrim) { document.removeEventListener("keydown", c._scrim._esc); c._scrim.remove(); c._scrim = null; }
    },

    /* ---- toast ---- */
    toast(msg, tone) {
      let wrap = document.querySelector(".toasts");
      if (!wrap) { wrap = document.createElement("div"); wrap.className = "toasts"; document.body.appendChild(wrap); }
      const t = document.createElement("div");
      const icons = { success: "✓", warn: "!", info: "ⓘ", "": "✓" };
      t.className = "toast toast--" + (tone || "success");
      t.innerHTML = `<span class="ic">${icons[tone || ""]}</span><span>${esc(msg)}</span>`;
      wrap.appendChild(t);
      setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .3s"; setTimeout(() => t.remove(), 320); }, 3200);
    },

    /* ---- spinner inline ---- */
    loading(text) { return `<div class="row" style="gap:10px;color:var(--c-ink-3);padding:8px 0"><span class="spinner"></span>${esc(text || "Working…")}</div>`; },

    govBanner(text, warn) {
      return `<div class="gov-banner ${warn ? "warn" : ""}"><span class="ic">${warn ? "⚠" : "🛡"}</span><span>${text}</span></div>`;
    },
  };

  FOLK.c = c;
})(window.FOLK = window.FOLK || {});
