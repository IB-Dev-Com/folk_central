/* ============================================================================
   WF-015 FOLK — Home (Role Dashboard) + Leadership / Center-Head /
   Data-Quality / AI-Performance / 2-Month Intelligence dashboards.
   Powered by the Management Intelligence Agent → BI rollup (shared spine).
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, spine, agents, router } = FOLK;
  const esc = util.esc;
  const S = FOLK.screens = FOLK.screens || {};

  function scopeLabel() {
    const s = store.session;
    if (s.nodeId !== "ALL") return c.nodeName(s.nodeId);
    if (s.centerId !== "ALL") { const ct = store.center(s.centerId); return ct ? ct.Center_Name : s.centerId; }
    return "All Centers · 6 nodes";
  }

  function kpiRow(r) {
    return `<div class="grid grid--kpi">
      ${c.kpi({ label: "Active seekers", value: r.total, sub: scopeLabel(), icon: "☷" })}
      ${c.kpi({ label: "New (30d)", value: r.newThis, delta: "+", tone: "up", sub: "first contact" })}
      ${c.kpi({ label: "Repeat attenders", value: r.repeat, sub: "≥ 3 attendances" })}
      ${c.kpi({ label: "Drop-off risk", value: r.atRisk, tone: r.atRisk ? "down" : "", sub: "needs care", icon: "⚠" })}
      ${c.kpi({ label: "Potential preachers", value: r.preachers, tone: "up", sub: "cultivation wins", icon: "★" })}
      ${c.kpi({ label: "Overdue follow-ups", value: r.overdue, tone: r.overdue ? "down" : "", sub: "SLA" })}
    </div>`;
  }

  function needsMeNow() {
    const pend = store.pendingApprovals();
    const overdue = store.state.followups.filter((f) => {
      const s = store.seeker(f.Contact_ID); return s && store.inScope(s) && util.daysUntil(f.Next_Followup_Date) < 0;
    });
    const risk = store.scopedSeekers().filter((s) => /drop_off/.test(s.AI_Risk_Flag));
    const item = (icon, tone, text, href) => `<a class="row between" style="padding:10px 0;border-bottom:1px solid var(--c-border);text-decoration:none;color:inherit" href="#${href}">
      <span class="row"><span class="badge badge--${tone}">${icon}</span>${text}</span><span class="muted">›</span></a>`;
    let rows = "";
    if (pend.length) rows += item("⚖", "warn", `<b style="margin-right:6px">${pend.length}</b> approval${pend.length > 1 ? "s" : ""} awaiting your decision`, "/approvals");
    if (overdue.length) rows += item("✉", "danger", `<b style="margin-right:6px">${overdue.length}</b> overdue follow-up${overdue.length > 1 ? "s" : ""}`, "/followups");
    if (risk.length) rows += item("⚠", "danger", `<b style="margin-right:6px">${risk.length}</b> seeker${risk.length > 1 ? "s" : ""} at drop-off risk`, "/board");
    const dq = store.state.mapping.filter((m) => m.Mapping_Status === "needs_review");
    if (dq.length) rows += item("◈", "warn", `<b style="margin-right:6px">${dq.length}</b> CRM mappings need review`, "/admin/data-quality");
    if (!rows) rows = c.empty("All clear — nothing needs you right now", "✓");
    return `<div class="card"><div class="card__head"><h3>What needs me now</h3></div><div class="card__body">${rows}</div></div>`;
  }

  function dashLinks() {
    const role = store.session.role;
    const links = [
      { r: "/dash/leadership", t: "Leadership", d: "Center-wise rollups, preachers, risk, data quality", roles: ["leadership", "center_head"] },
      { r: "/dash/center-head", t: "Center-Head", d: "Node health, conversion, sadhana gaps", roles: ["center_head", "leadership", "primary_guide"] },
      { r: "/guide", t: "Guide", d: "My assigned youth & next actions", roles: ["primary_guide", "secondary_guide", "sadhana_coordinator"] },
      { r: "/dash/data-quality", t: "Data Quality", d: "Duplicates, mapping, missing fields", roles: ["data_steward", "center_head", "leadership"] },
      { r: "/dash/ai-performance", t: "AI Performance", d: "Suggestions vs approvals, false alerts", roles: ["leadership", "center_head", "data_steward"] },
      { r: "/dash/intelligence", t: "2-Month Intelligence", d: "Trend & early-prediction readiness", roles: ["leadership", "center_head"] },
    ];
    return `<div class="grid grid--3">${links.map((l) => {
      const allowed = l.roles.includes(role) || role === "leadership";
      return `<a class="card ${allowed ? "" : ""}" href="#${l.r}" style="text-decoration:none;color:inherit;display:block">
        <div class="card__body">
          <div class="row between"><b>${esc(l.t)} Dashboard</b><span class="seam-chip">BI</span></div>
          <div class="muted small" style="margin-top:6px">${esc(l.d)}</div>
          ${allowed ? "" : `<div class="xs muted" style="margin-top:8px">🔒 limited for your role</div>`}
        </div></a>`;
    }).join("")}</div>`;
  }

  /* ---------- Role Dashboard (Home) ---------- */
  S.home = {
    title: "Role Dashboard",
    render() {
      const r = spine.bi.rollup();
      const cap = spine.auth.label();
      return `<div class="page">
        <div class="page__head">
          <div>
            <div class="page__title">Welcome — ${esc(cap)} view</div>
            <div class="page__sub">Scope: <b>${esc(scopeLabel())}</b>. The Management Intelligence Agent rolls FOLK signals up to your dashboards; every AI suggestion routes through a human gate.</div>
          </div>
          <div class="spacer"></div>
          <div class="page__actions">
            <button class="btn" id="reset-demo" title="Reset prototype data">↺ Reset demo</button>
            <button class="btn btn--primary" onclick="location.hash='#/board'">Open Journey Board</button>
          </div>
        </div>
        ${c.govBanner("Prototype on mock data — IDs, contracts, approval gates & dashboards are production-shaped. AI recommends; a human finalizes spiritual guidance, sensitive sends & public content.")}
        <div style="height:16px"></div>
        ${kpiRow(r)}
        <div style="height:20px"></div>
        <div class="cols">
          <div class="stack">
            <div class="card"><div class="card__head"><h3>Dashboards</h3><span class="muted small">role-scoped</span></div><div class="card__body">${dashLinks()}</div></div>
          </div>
          <div class="stack">
            ${needsMeNow()}
          </div>
        </div>
      </div>`;
    },
    mount() {
      const btn = document.getElementById("reset-demo");
      if (btn) btn.onclick = () => { store.reset(); c.toast("Prototype data reset", "info"); };
    },
  };

  /* ---------- shared dashboard page wrapper ---------- */
  function dashPage(title, sub, body, extraActions) {
    return `<div class="page">
      <div class="page__head">
        <div><div class="page__title">${esc(title)}</div><div class="page__sub">${sub}</div></div>
        <div class="spacer"></div>
        <div class="page__actions">${extraActions || ""}<span class="seam-chip">BI</span><span class="seam-chip">AUTH</span><button class="btn btn--sm" onclick="location.hash='#/home'">← Home</button></div>
      </div>${body}</div>`;
  }

  /* ---------- Leadership Dashboard ---------- */
  S.dashLeadership = {
    title: "Leadership Dashboard",
    render() {
      // roll up per center
      const rows = FOLK.seed.centers.map((ct) => {
        const ss = store.state.seekers.filter((s) => s.Center_ID === ct.Center_ID);
        const r = spine.bi.rollup(ss);
        return { ct, r };
      });
      const r = spine.bi.rollup(store.scopedSeekers());
      return dashPage("Leadership Command Center — FOLK", "FOLK KPIs roll up alongside other workflows for leadership. Center-wise health, potential preachers, drop-off risk, data quality, partner blockers.",
        kpiRow(r) + `<div style="height:18px"></div>
        <div class="card"><div class="card__head"><h3>Center-wise rollup</h3><span class="muted small">${esc(util.now())}</span></div>
        <div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
          <thead><tr><th>Center</th><th>Model</th><th class="num">Seekers</th><th class="num">New 30d</th><th class="num">Repeat</th><th class="num">At risk</th><th class="num">Preachers</th><th class="num">Overdue</th><th class="num">Data quality</th></tr></thead>
          <tbody>${rows.map(({ ct, r }) => `<tr>
            <td><b>${esc(ct.Center_Name)}</b></td>
            <td>${c.badge(util.titleCase(ct.Center_Model), ct.Center_Model === "centralized" ? "info" : "purple")}</td>
            <td class="num">${r.total}</td><td class="num">${r.newThis}</td><td class="num">${r.repeat}</td>
            <td class="num">${r.atRisk ? `<span class="badge badge--danger">${r.atRisk}</span>` : 0}</td>
            <td class="num">${r.preachers}</td><td class="num">${r.overdue}</td>
            <td class="num">${util.pct(r.dqAvg)}</td></tr>`).join("")}</tbody>
        </table></div></div></div>
        <div style="height:16px"></div>
        <div class="grid grid--2">
          <div class="card"><div class="card__head"><h3>Partner blockers / NV flags</h3></div><div class="card__body stack stack--sm">
            <div class="row between"><span>WhatsApp / call provider API</span>${c.nv("[API: NV]")}</div>
            <div class="row between"><span>Sadhana tracker export</span>${c.nv("[API: NV]")}</div>
            <div class="row between"><span>KCKE production access</span>${c.nv("[API: NV]")}</div>
            <div class="row between"><span>Owner/approver routing validation</span>${c.nv("[Owner: NV]")}</div>
          </div></div>
          <div class="card"><div class="card__head"><h3>Governance pulse</h3></div><div class="card__body stack stack--sm">
            <div class="row between"><span>Pending approvals</span><b>${r.pendingApprovals}</b></div>
            <div class="row between"><span>Audit entries logged</span><b>${store.state.audit.length}</b></div>
            <div class="row between"><span>Sadhana gaps (lapsed)</span><b>${r.sadhanaGaps}</b></div>
            <div class="row between"><span>Mappings needing review</span><b>${r.needsReview}</b></div>
          </div></div>
        </div>`,
        `<button class="btn btn--ai btn--sm" id="mi-refresh">✦ Refresh rollup</button>`);
    },
    mount() {
      const b = document.getElementById("mi-refresh");
      if (b) b.onclick = () => { store.audit("dashboard_refresh (Management Intelligence)", "leadership", { actor: agents.mgmtIntelligence.name, actorType: "agent" }); store.commit(); c.toast("Management Intelligence Agent refreshed the rollup", "info"); };
    },
  };

  /* ---------- Center-Head Dashboard ---------- */
  S.dashCenterHead = {
    title: "Center-Head Dashboard",
    render() {
      const ss = store.scopedSeekers();
      const r = spine.bi.rollup(ss);
      // node health within scope
      const nodes = FOLK.seed.nodes.filter((n) => store.session.centerId === "ALL" || n.Center_ID === store.session.centerId);
      const online = store.state.attendance.filter((a) => a.Mode === "online").length;
      const offline = store.state.attendance.filter((a) => a.Mode === "offline").length;
      const conv = offline + online ? offline / (online + offline) : 0;
      return dashPage("Center-Head Dashboard", "Center-node health, lead-source quality, program attendance, online-to-offline conversion, sadhana gaps, one-on-ones overdue, trip/Yatra readiness.",
        kpiRow(r) + `<div style="height:18px"></div>
        <div class="grid grid--2">
          <div class="card"><div class="card__head"><h3>Node health</h3></div><div class="card__body card__body--flush"><table class="table">
            <thead><tr><th>Node</th><th class="num">Seekers</th><th class="num">At risk</th><th>Health</th></tr></thead>
            <tbody>${nodes.map((n) => {
              const ns = store.state.seekers.filter((s) => s.Center_Node_ID === n.Center_Node_ID);
              const risk = ns.filter((s) => /drop_off|dormant/.test(s.AI_Risk_Flag)).length;
              const health = ns.length ? 1 - risk / ns.length : 1;
              return `<tr><td>${esc(n.Node_Name)}</td><td class="num">${ns.length}</td><td class="num">${risk}</td><td style="width:120px">${c.bar(health, health > 0.7 ? "var(--c-success)" : "var(--c-warn)")}</td></tr>`;
            }).join("")}</tbody></table></div></div>
          <div class="stack">
            <div class="card"><div class="card__head"><h3>Online → Offline conversion</h3></div><div class="card__body">
              <div class="kpi__value">${util.pct(conv)}</div>
              <div class="muted small">${offline} offline vs ${online} online touchpoints</div>
              <div style="margin-top:10px">${c.bar(conv, "var(--c-indigo-500)")}</div>
            </div></div>
            <div class="card"><div class="card__head"><h3>Lead-source quality</h3></div><div class="card__body stack stack--sm">
              ${sourceBars(ss)}
            </div></div>
          </div>
        </div>`);
    },
  };

  function sourceBars(ss) {
    const by = {};
    ss.forEach((s) => { by[s.Primary_Source] = (by[s.Primary_Source] || 0) + 1; });
    const max = Math.max(1, ...Object.values(by));
    return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
      `<div><div class="row between small"><span>${esc(util.titleCase(k))}</span><b>${v}</b></div>${c.bar(v / max, "var(--c-saffron-500)")}</div>`).join("");
  }

  /* ---------- Data-Quality Dashboard ---------- */
  S.dashDataQuality = {
    title: "Data-Quality Dashboard",
    render() {
      const m = store.state.mapping;
      const needs = m.filter((x) => x.Mapping_Status === "needs_review").length;
      const avg = m.reduce((a, x) => a + x.Data_Quality_Score, 0) / (m.length || 1);
      const bySys = {};
      m.forEach((x) => { (bySys[x.Source_System] = bySys[x.Source_System] || { n: 0, ok: 0 }); bySys[x.Source_System].n++; if (x.Mapping_Status === "confirmed") bySys[x.Source_System].ok++; });
      return dashPage("Data-Quality Dashboard", "Duplicates, missing fields, unmapped records, stale contacts, source gaps, CRM export errors — across the map-don't-replace mapping layer.",
        `<div class="grid grid--kpi">
          ${c.kpi({ label: "Mapping coverage", value: util.pct(m.filter((x) => x.Mapping_Status !== "needs_review").length / m.length), sub: m.length + " source links" })}
          ${c.kpi({ label: "Avg data-quality", value: util.pct(avg), tone: "up", sub: "Data_Quality_Score" })}
          ${c.kpi({ label: "Needs review", value: needs, tone: needs ? "down" : "", sub: "ambiguous merges", icon: "◈" })}
          ${c.kpi({ label: "Source systems", value: Object.keys(bySys).length, sub: "mapped, not replaced" })}
        </div><div style="height:18px"></div>
        <div class="card"><div class="card__head"><h3>By source system</h3><span class="seam-chip">MAP</span></div><div class="card__body card__body--flush"><table class="table">
          <thead><tr><th>Source system</th><th class="num">Records</th><th class="num">Confirmed</th><th>Confidence</th><th>Flag</th></tr></thead>
          <tbody>${Object.entries(bySys).map(([k, v]) => `<tr><td class="mono">${esc(k)}</td><td class="num">${v.n}</td><td class="num">${v.ok}</td><td style="width:140px">${c.bar(v.ok / v.n, "var(--c-success)")}</td><td>${c.nv("[API: NV]")}</td></tr>`).join("")}</tbody>
        </table></div></div>
        <div style="height:12px"></div>
        <button class="btn btn--primary" onclick="location.hash='#/admin/data-quality'">Open Data-Quality Console →</button>`);
    },
  };

  /* ---------- AI-Performance Dashboard ---------- */
  S.dashAI = {
    title: "AI-Performance Dashboard",
    render() {
      const aud = store.state.audit;
      const suggestions = aud.filter((a) => a.Actor_Type === "agent").length + 18;
      const approved = store.state.approvals.filter((a) => a.Status === "approved" || a.Status === "edited").length + 9;
      const rejected = store.state.approvals.filter((a) => a.Status === "rejected").length + 1;
      const accept = approved / (approved + rejected);
      return dashPage("AI-Performance Dashboard", "Suggestions generated vs approved, false alerts, draft acceptance, unresolved escalations. " + c.nv("[Data: NV]") + " — figures are illustrative on mock data.",
        `<div class="grid grid--kpi">
          ${c.kpi({ label: "Suggestions generated", value: suggestions, sub: "all agents", icon: "✦" })}
          ${c.kpi({ label: "Draft acceptance", value: util.pct(accept), tone: "up", sub: approved + " approved / edited" })}
          ${c.kpi({ label: "False alerts", value: "4%", tone: "up", sub: "risk flags overturned" })}
          ${c.kpi({ label: "Unresolved escalations", value: store.pendingApprovals().length, sub: "awaiting human" })}
        </div><div style="height:18px"></div>
        <div class="card"><div class="card__head"><h3>Per-agent acceptance (mock)</h3></div><div class="card__body stack stack--sm">
          ${[["Seeker Journey", 0.88], ["Program Follow-up", 0.82], ["Sadhana Progress", 0.79], ["Yatra/Trip", 0.74], ["Data Quality", 0.93], ["Dormant Re-Activation", 0.68]]
            .map(([n, v]) => `<div><div class="row between small"><span>${esc(n)} Agent</span><b>${util.pct(v)}</b></div>${c.bar(v, v > 0.8 ? "var(--c-success)" : "var(--c-ai)")}</div>`).join("")}
        </div></div>
        <div style="height:12px"></div>
        ${c.govBanner("Every suggestion, approval, edit and rejection is captured in the Audit Trail — this dashboard reads from that immutable log.")}`);
    },
  };

  /* ---------- 2-Month Intelligence View ---------- */
  S.dashIntelligence = {
    title: "2-Month Intelligence View",
    render() {
      const ss = store.scopedSeekers();
      const preacherReady = ss.filter((s) => { const sd = store.sadhanaFor(s.Contact_ID); return sd && sd.Potential_Preacher_Flag; });
      const riskPredicted = ss.filter((s) => /drop_off/.test(s.AI_Risk_Flag));
      const yatraReady = store.state.trips.filter((t) => t.Yatra_Readiness_Level === "high");
      return dashPage("2-Month Intelligence View", "Trend & progression insights; early-prediction readiness for drop-off, serious engagement and Yatra/trip conversion. " + c.nv("2M"),
        `<div class="grid grid--3">
          ${predCard("Drop-off prediction", riskPredicted.length, "seekers trending to disengage in the next cycle", "danger", riskPredicted)}
          ${predCard("Serious-engagement readiness", preacherReady.length, "consistent sadhana → preacher / leadership track", "success", preacherReady)}
          ${predCard("Yatra/Trip conversion", yatraReady.length, "high readiness — invite candidates", "info", yatraReady.map((t) => store.seeker(t.Contact_ID)).filter(Boolean))}
        </div>
        <div style="height:16px"></div>
        <div class="card"><div class="card__head"><h3>Progression trend (illustrative)</h3></div><div class="card__body">
          ${trendSpark()}
          <div class="muted small" style="margin-top:10px">Early-prediction models are 2-month architecture; the prototype shows the readiness surface, not a trained model.</div>
        </div></div>`);
    },
  };

  function predCard(title, n, sub, tone, seekers) {
    return `<div class="card"><div class="card__body">
      <div class="row between"><b>${esc(title)}</b><span class="badge badge--ai">✦ predicted</span></div>
      <div class="kpi__value" style="color:var(--c-${tone === "danger" ? "danger" : tone === "success" ? "success" : "info"})">${n}</div>
      <div class="muted small">${esc(sub)}</div>
      <div class="divider"></div>
      ${seekers.slice(0, 4).map((s) => `<div class="small" style="padding:2px 0">${c.seekerLink(s.Contact_ID)} ${c.idChip(s.Contact_ID)}</div>`).join("") || `<div class="muted small">None in scope</div>`}
    </div></div>`;
  }

  function trendSpark() {
    const pts = [12, 18, 15, 22, 28, 31, 30, 38, 44];
    const max = Math.max(...pts), w = 100 / (pts.length - 1);
    const d = pts.map((p, i) => `${i * w},${40 - (p / max) * 36}`).join(" ");
    return `<svg viewBox="0 0 100 42" preserveAspectRatio="none" style="width:100%;height:120px">
      <polyline points="${d}" fill="none" stroke="var(--c-saffron-500)" stroke-width="1.4" vector-effect="non-scaling-stroke"/>
      <polyline points="0,42 ${d} 100,42" fill="var(--c-saffron-100)" opacity="0.5" stroke="none"/>
    </svg>`;
  }

  FOLK.screens = S;
})(window.FOLK = window.FOLK || {});
