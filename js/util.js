/* ============================================================================
   WF-015 FOLK — small utilities (shared design-system helpers)
   ========================================================================== */
(function (FOLK) {
  "use strict";

  // Demo "today" is fixed for deterministic mock data.
  const TODAY = new Date("2026-06-24T10:30:00");

  const util = {
    TODAY,
    now() {
      const d = TODAY;
      return d.toISOString().slice(0, 16).replace("T", " ");
    },
    esc(s) {
      if (s === null || s === undefined) return "";
      return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },
    // days between an ISO date string and demo-today (positive = in the past)
    daysAgo(iso) {
      if (!iso) return null;
      const d = new Date(iso + "T00:00:00");
      return Math.round((TODAY - d) / 86400000);
    },
    daysUntil(iso) {
      if (!iso) return null;
      const d = new Date(iso + "T00:00:00");
      return Math.round((d - TODAY) / 86400000);
    },
    relDate(iso) {
      const n = util.daysAgo(iso);
      if (n === null) return "—";
      if (n === 0) return "today";
      if (n === 1) return "yesterday";
      if (n > 1) return n + "d ago";
      if (n === -1) return "tomorrow";
      return "in " + (-n) + "d";
    },
    titleCase(s) {
      return String(s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    },
    // simulate async service latency (the spine "feels real")
    delay(ms) { return new Promise((res) => setTimeout(res, ms)); },
    rid(prefix) { return prefix + "-" + Math.floor(1000 + (util._seq = (util._seq || 0) + 1) * 7 + (TODAY.getSeconds() * 13)); },
    pct(n) { return Math.round(n * 100) + "%"; },
    money(n) { return "₹ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 }); },
  };

  FOLK.util = util;
})(window.FOLK = window.FOLK || {});
