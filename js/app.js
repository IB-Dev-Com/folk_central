/* ============================================================================
   WF-015 FOLK — Application shell, navigation, global controls, route wiring
   Reuses the shared platform-shell pattern: top bar + left rail + content.
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, router, spine } = FOLK;
  const esc = util.esc;

  /* ---- left-rail navigation model (role-scoped) ---- */
  const NAV = [
    { group: "Home", items: [
      { route: "/home", icon: "◧", label: "Role Dashboard" },
    ]},
    { group: "People", items: [
      { route: "/seekers", icon: "☷", label: "Seekers" },
      { route: "/board", icon: "▦", label: "Journey / Stage Board" },
      { route: "/dormant", icon: "◌", label: "Dormant Reactivation" },
    ]},
    { group: "Engagement", items: [
      { route: "/followups", icon: "✉", label: "Follow-up & Risk Queue" },
      { route: "/attendance", icon: "✓", label: "Attendance" },
      { route: "/sadhana", icon: "☸", label: "Sadhana Progress" },
      { route: "/yatra", icon: "⛰", label: "Trip / Yatra Readiness" },
    ]},
    { group: "Guide", items: [
      { route: "/guide", icon: "☺", label: "Guide Workspace" },
    ]},
    { group: "Content", items: [
      { route: "/content", icon: "✦", label: "Presentation Copilot" },
      { route: "/factory", icon: "⚒", label: "Content Factory Handoff" },
    ]},
    { group: "Admin", items: [
      { route: "/admin/centers", icon: "⌂", label: "Center-Node Admin" },
      { route: "/admin/data-quality", icon: "◈", label: "Data-Quality Console" },
      { route: "/admin/roles", icon: "⚿", label: "Roles & Access" },
      { route: "/admin/billing", icon: "₹", label: "Billing / ERP & API" },
    ]},
    { group: "Governance", items: [
      { route: "/approvals", icon: "⚖", label: "Approvals", badge: "approvals" },
      { route: "/audit", icon: "❑", label: "Audit Trail" },
    ]},
  ];

  const ROLE_OPTIONS = [
    { role: "primary_guide", userId: "GID-014" },
    { role: "center_head", userId: "GID-007" },
    { role: "leadership", userId: "GID-007" },
    { role: "sadhana_coordinator", userId: "GID-052" },
    { role: "presenter", userId: "GID-040" },
    { role: "data_steward", userId: "OWN-003" },
    { role: "secondary_guide", userId: "GID-021" },
  ];

  /* ---- render the static shell once ---- */
  function renderShell() {
    document.getElementById("app").innerHTML = `
      <div class="app">
        <div class="brand">
          <div class="brand__mark">F</div>
          <div class="brand__txt">
            <span class="brand__platform">HKHT Platform ▸ AI for Seva</span>
            <span class="brand__module">FOLK Youth Cultivation</span>
          </div>
        </div>
        <header class="topbar" id="topbar"></header>
        <nav class="rail" id="rail" aria-label="Primary"></nav>
        <main class="main"><div id="page"></div></main>
      </div>`;
  }

  function renderTopbar() {
    const s = store.session;
    const centers = [{ Center_ID: "ALL", Center_Name: "All Centers" }].concat(FOLK.seed.centers);
    let nodes = FOLK.seed.nodes;
    if (s.centerId !== "ALL") nodes = nodes.filter((n) => n.Center_ID === s.centerId);
    const nodeOpts = [{ Center_Node_ID: "ALL", Node_Name: "All Nodes" }].concat(nodes);
    const cap = spine.auth.caps();
    const user = store.guide(s.userId) || { Guide_Name: "User" };
    const pending = store.pendingApprovals().length;
    const crumb = (FOLK._activeTitle || "Home");

    document.getElementById("topbar").innerHTML = `
      <div class="topbar__crumb"><b>FOLK</b> <span>›</span> ${esc(crumb)}</div>
      <div class="topbar__spacer"></div>
      <div class="switcher">
        <label for="sw-center">Center</label>
        <select class="ctrl" id="sw-center" ${!spine.auth.can("cross_center") && s.role !== "center_head" ? "" : ""}>
          ${centers.map((ct) => `<option value="${ct.Center_ID}" ${ct.Center_ID === s.centerId ? "selected" : ""}>${esc(ct.Center_Name)}</option>`).join("")}
        </select>
        <select class="ctrl" id="sw-node">
          ${nodeOpts.map((n) => `<option value="${n.Center_Node_ID}" ${n.Center_Node_ID === s.nodeId ? "selected" : ""}>${esc(n.Node_Name)}</option>`).join("")}
        </select>
      </div>
      <div class="topbar__search">
        <input class="ctrl" id="sw-search" placeholder="Search Contact_ID / name" aria-label="Search contact" />
      </div>
      <button class="icon-btn" id="bell" title="Approvals" aria-label="Approvals queue">⚖${pending ? `<span class="dot">${pending}</span>` : ""}</button>
      <div class="switcher">
        <select class="ctrl" id="sw-role" title="Acting role (AUTH)">
          ${ROLE_OPTIONS.map((r) => `<option value="${r.role}" ${r.role === s.role ? "selected" : ""}>${esc(spineRoleLabel(r.role))}</option>`).join("")}
        </select>
      </div>
      <div class="userchip">${c.avatar(user.Guide_Name)}<div class="meta"><div class="n">${esc(user.Guide_Name)}</div><div class="r">${esc(cap.label)} · ${esc(store.guide(s.userId) ? store.guide(s.userId).Guide_ID : "")}</div></div></div>
    `;

    document.getElementById("sw-center").onchange = (e) => { store.setSession({ centerId: e.target.value, nodeId: "ALL" }); };
    document.getElementById("sw-node").onchange = (e) => { store.setSession({ nodeId: e.target.value }); };
    document.getElementById("sw-role").onchange = (e) => {
      const opt = ROLE_OPTIONS.find((r) => r.role === e.target.value);
      store.setSession({ role: opt.role, userId: opt.userId });
      c.toast("Now acting as " + spineRoleLabel(opt.role) + " — access & dashboards updated", "info");
    };
    document.getElementById("bell").onclick = () => router.navigate("/approvals");
    const search = document.getElementById("sw-search");
    search.onkeydown = (e) => {
      if (e.key !== "Enter") return;
      const q = e.target.value.trim();
      if (!q) return;
      spine.identity.resolve(q).then((r) => {
        if (r.matched) router.navigate("/seeker/" + r.Contact_ID);
        else c.toast("No contact matched “" + q + "”", "warn");
      });
    };
  }

  function spineRoleLabel(role) {
    return ({
      primary_guide: "Primary Guide", secondary_guide: "Secondary Guide", center_head: "Center Head",
      presenter: "Presenter", sadhana_coordinator: "Sadhana Coord.", data_steward: "Data Steward", leadership: "Leadership",
    })[role] || role;
  }

  function renderRail() {
    const pending = store.pendingApprovals().length;
    const path = router.current().path;
    const html = NAV.map((g) => `
      <div class="rail__group">
        <div class="rail__label">${esc(g.group)}</div>
        ${g.items.map((it) => {
          const active = path === it.route.replace(/^\//, "") || ("#" + it.route) === location.hash || location.hash === ("#" + it.route);
          const isActive = location.hash === "#" + it.route;
          const badge = it.badge === "approvals" && pending ? `<span class="badge-mini">${pending}</span>` : "";
          return `<a class="rail__item ${isActive ? "active" : ""}" href="#${it.route}"><span class="ic">${it.icon}</span>${esc(it.label)}${badge}</a>`;
        }).join("")}
      </div>`).join("");
    document.getElementById("rail").innerHTML = html;
  }

  /* ---- page mounting harness ---- */
  function mountPage(def, params) {
    FOLK._activeTitle = typeof def.title === "function" ? def.title(params) : def.title;
    const page = document.getElementById("page");
    let html = "";
    try { html = def.render(params) || ""; }
    catch (err) { html = `<div class="page"><div class="empty"><div class="ic">⚠</div>Screen error: ${esc(err.message)}</div></div>`; console.error(err); }
    page.innerHTML = html;
    renderTopbar();
    renderRail();
    if (def.mount) { try { def.mount(params); } catch (err) { console.error(err); } }
  }

  /* ---- wire routes from the screen registry ---- */
  function wireRoutes() {
    const S = FOLK.screens;
    const map = {
      "/home": S.home,
      "/seekers": S.seekers,
      "/seeker/:id": S.seeker360,
      "/board": S.board,
      "/dormant": S.dormant,
      "/followups": S.followups,
      "/attendance": S.attendance,
      "/sadhana": S.sadhana,
      "/yatra": S.yatra,
      "/guide": S.guide,
      "/guide/:id": S.oneOnOne,
      "/content": S.content,
      "/factory": S.factory,
      "/admin/centers": S.centers,
      "/admin/data-quality": S.dataQuality,
      "/admin/roles": S.roles,
      "/admin/billing": S.billing,
      "/approvals": S.approvals,
      "/audit": S.audit,
      // dashboards
      "/dash/leadership": S.dashLeadership,
      "/dash/center-head": S.dashCenterHead,
      "/dash/data-quality": S.dashDataQuality,
      "/dash/ai-performance": S.dashAI,
      "/dash/intelligence": S.dashIntelligence,
    };
    Object.keys(map).forEach((route) => {
      const def = map[route];
      if (!def) return;
      router.add(route, (params) => mountPage(def, params));
    });
    router.setNotFound(() => mountPage({ title: "Not found", render: () => `<div class="page">${c.empty("Screen not found", "🔍")}</div>` }, {}));
  }

  /* ---- re-render on store changes (scope/role/data) ---- */
  let rerenderQueued = false;
  store.subscribe(() => {
    if (rerenderQueued) return;
    rerenderQueued = true;
    requestAnimationFrame(() => { rerenderQueued = false; router.resolve(); });
  });

  /* ---- boot ---- */
  function boot() {
    renderShell();
    wireRoutes();
    router.start();
  }

  FOLK.app = { boot, NAV, mountPage };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.FOLK = window.FOLK || {});
