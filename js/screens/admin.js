/* ============================================================================
   WF-015 FOLK — Admin: Center-Node Admin, Data-Quality Console,
   Roles & Access, Billing / ERP References + API metering.
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, spine, agents, router } = FOLK;
  const esc = util.esc;
  const S = FOLK.screens = FOLK.screens || {};

  /* ---------- Center-Node Admin ---------- */
  S.centers = {
    title: "Center-Node Admin",
    render() {
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Center-Node Admin</div><div class="page__sub">Manage the centralized vs. distributed-node structure (<span class="mono">Center_ID</span> / <span class="mono">Center_Node_ID</span>), program catalog and guide assignments. This config is the basis for WF-013 multi-center replication.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">AUTH</span><button class="btn btn--indigo btn--sm" id="wf013">📦 Generate WF-013 replication package</button></div>
        </div>
        <div class="grid grid--2">
          <div class="card"><div class="card__head"><h3>Center / node structure</h3></div><div class="card__body">
            ${FOLK.seed.centers.map((ct) => `
              <div style="margin-bottom:14px">
                <div class="row between"><b>${esc(ct.Center_Name)}</b>${c.badge(util.titleCase(ct.Center_Model), ct.Center_Model === "centralized" ? "info" : "purple")}</div>
                <div class="xs muted">${c.idChip(ct.Center_ID)}</div>
                <div style="margin-top:8px;padding-left:14px;border-left:2px solid var(--c-border)">
                  ${FOLK.seed.nodes.filter((n) => n.Center_ID === ct.Center_ID).map((n) => `
                    <div class="row between" style="padding:5px 0">
                      <span class="small">${esc(n.Node_Name)} <span class="muted xs">· ${esc(n.City)}</span></span>
                      <span class="row" style="gap:6px">${c.idChip(n.Center_Node_ID)}<span class="xs muted">${store.state.seekers.filter((s) => s.Center_Node_ID === n.Center_Node_ID).length} seekers</span></span>
                    </div>`).join("")}
                </div>
              </div>`).join("")}
          </div></div>
          <div class="stack">
            <div class="card"><div class="card__head"><h3>Program / course catalog</h3></div><div class="card__body card__body--flush"><table class="table">
              <thead><tr><th>Activity</th><th>Type</th><th>Node</th><th>Mode</th></tr></thead>
              <tbody>${store.state.catalog.map((a) => `<tr><td>${c.idChip(a.Activity_ID)} <span class="small">${esc(a.Name)}</span></td><td>${c.badge(util.titleCase(a.Type), "neutral")}</td><td class="small">${a.Center_Node_ID === "*" ? "All nodes" : esc(c.nodeName(a.Center_Node_ID))}</td><td class="small">${esc(a.Mode)}</td></tr>`).join("")}</tbody>
            </table></div></div>
            <div class="card"><div class="card__head"><h3>Guide assignments</h3></div><div class="card__body card__body--flush"><table class="table">
              <thead><tr><th>Guide</th><th>Node</th><th>Role</th><th>Access</th></tr></thead>
              <tbody>${FOLK.seed.guides.map((g) => `<tr><td>${esc(g.Guide_Name)} ${c.idChip(g.Guide_ID)}</td><td class="small">${esc(c.nodeName(g.Center_Node_ID))}</td><td class="small">${esc(util.titleCase(g.Role))}</td><td>${c.badge(util.titleCase(g.Sensitive_Access), g.Sensitive_Access === "full" ? "danger" : "purple")}</td></tr>`).join("")}</tbody>
            </table></div></div>
          </div>
        </div>
      </div>`;
    },
    mount() {
      document.getElementById("wf013").onclick = () => {
        c.overlay(`<div class="modal__head"><h3>📦 WF-013 Replication Package</h3></div>
          <div class="modal__body">
            <p class="small">A new center / node is stood up by instantiating the FOLK module against the shared spine with its own <span class="mono">Center_ID</span> — no new identity/auth/billing/BI build required.</p>
            <dl class="def-list small">
              <dt>Center model types</dt><dd>centralized · distributed_node</dd>
              <dt>Standard fields</dt><dd>journey, follow-up, mentor-memory, sadhana, trip</dd>
              <dt>Dashboard templates</dt><dd>leadership · center-head · guide · data-quality</dd>
              <dt>Stage vocabulary</dt><dd>${agents.STAGE_ORDER.map(util.titleCase).join(" → ")}</dd>
              <dt>Routing matrix</dt><dd>owner/performer/approver/backup/escalation/reviewer/steward</dd>
              <dt>Training kit</dt><dd>guide onboarding · sensitive-note governance</dd>
            </dl>
            ${c.govBanner("Template design now → multi-center package in the 2-month architecture → implementation future.")}
          </div>
          <div class="modal__foot"><button class="btn btn--primary" onclick="FOLK.c.closeOverlay()">Close</button></div>`);
      };
    },
  };

  /* ---------- Data-Quality Console ---------- */
  S.dataQuality = {
    title: "Data-Quality Console",
    render() {
      const m = store.state.mapping;
      const needs = m.filter((x) => x.Mapping_Status === "needs_review");
      const iss = agents.dataQuality.issues();
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Data-Quality Console</div><div class="page__sub">The multi-CRM mapping table (source key ↔ <span class="mono">Contact_ID</span>). The Data Quality Agent dedupes, scores and flags ambiguous merges — the <b>data steward</b> confirms. Source systems keep running; we map, not replace.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">MAP</span><span class="nv-flag">[API: NV]</span><span class="nv-flag">[Owner: NV]</span><button class="btn btn--sm" id="dq-csv">⬆ CSV import (fallback)</button></div>
        </div>
        <div class="grid grid--kpi" style="margin-bottom:16px">
          ${c.kpi({ label: "Source links", value: m.length, sub: "across 4 systems" })}
          ${c.kpi({ label: "Needs review", value: needs.length, tone: needs.length ? "down" : "", sub: "ambiguous merges", icon: "◈" })}
          ${c.kpi({ label: "Avg quality", value: util.pct(m.reduce((a, x) => a + x.Data_Quality_Score, 0) / m.length), tone: "up", sub: "Data_Quality_Score" })}
          ${c.kpi({ label: "Missing fields", value: iss.missing.length, sub: "auto-detected" })}
        </div>
        <div class="card"><div class="card__head"><h3>Cross-CRM mapping table</h3><div class="spacer"></div><span class="muted small">data steward confirms ambiguous merges</span></div>
          <div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
            <thead><tr><th>Mapping</th><th>Contact_ID</th><th>Source system</th><th>Source key</th><th>Confidence</th><th>Quality</th><th>Status</th><th></th></tr></thead>
            <tbody id="dq-rows">${m.map(mapRow).join("")}</tbody>
          </table></div></div></div>
      </div>`;
    },
    mount() {
      bindMapRows();
      document.getElementById("dq-csv").onclick = csvImport;
    },
  };

  function mapRow(m) {
    const tone = m.Mapping_Status === "confirmed" ? "success" : m.Mapping_Status === "needs_review" ? "warn" : "neutral";
    const canConfirm = ["data_steward", "center_head"].includes(store.session.role);
    return `<tr data-map="${m.Mapping_ID}">
      <td>${c.idChip(m.Mapping_ID)}</td>
      <td>${c.seekerLink(m.Contact_ID)}<div class="xs muted">${c.idChip(m.Contact_ID)}</div></td>
      <td class="mono small">${esc(m.Source_System)}</td>
      <td class="mono xs">${esc(m.Source_Record_Key)}</td>
      <td style="width:110px">${c.bar(m.Match_Confidence, m.Match_Confidence > 0.85 ? "var(--c-success)" : "var(--c-warn)")}<span class="xs muted">${util.pct(m.Match_Confidence)}</span></td>
      <td class="num">${util.pct(m.Data_Quality_Score)}</td>
      <td>${c.badge(util.titleCase(m.Mapping_Status), tone)}</td>
      <td>${m.Mapping_Status === "needs_review" ? (canConfirm ? `<button class="btn btn--primary btn--sm" data-confirm="${m.Mapping_ID}">Confirm merge</button>` : `<span class="xs muted">steward only</span>`) : ""}</td>
    </tr>`;
  }

  function bindMapRows() {
    document.querySelectorAll("[data-confirm]").forEach((b) => b.onclick = async () => {
      b.disabled = true; b.innerHTML = `<span class="spinner"></span>`;
      await agents.dataQuality.resolveMapping(b.dataset.confirm);
      store.commit();
      c.toast("Mapping merge confirmed by data steward — logged", "success");
    });
  }

  function csvImport() {
    const m = c.overlay(`<div class="modal__head"><h3>CSV import (fallback)</h3></div>
      <div class="modal__body">
        <p class="small">When a source connector isn't live <span class="nv-flag">[API: NV]</span>, records are imported via CSV and resolved by the Data Quality Agent against the root <span class="mono">Contact_ID</span>.</p>
        <div class="field"><label>Paste CSV rows (name, source_system, source_key)</label><textarea class="ctrl" id="csv-text" rows="5" placeholder="Aarav Joshi, FOLK_CRM, folk_9001\nIsha Rao, DMT_CRM, dmt_lead_8002"></textarea></div>
        <div class="gov-banner" style="margin-top:10px">Imported rows land as <b>needs_review</b> for steward confirmation — no silent auto-merge.</div>
      </div>
      <div class="modal__foot"><button class="btn" onclick="FOLK.c.closeOverlay()">Cancel</button><button class="btn btn--primary" id="csv-go">Import &amp; resolve</button></div>`);
    m.querySelector("#csv-go").onclick = async () => {
      const text = m.querySelector("#csv-text").value.trim() || "Aarav Joshi, FOLK_CRM, folk_9001\nIsha Rao, DMT_CRM, dmt_lead_8002";
      const rows = text.split("\n").map((l) => { const [name, ss, key] = l.split(",").map((x) => x.trim()); return { name, Source_System: ss, key }; }).filter((r) => r.name);
      m.querySelector("#csv-go").innerHTML = `<span class="spinner"></span> Resolving…`;
      await agents.dataQuality.importCSV(rows);
      store.commit(); c.closeOverlay(); c.toast(rows.length + " rows imported → needs review", "success");
    };
  }

  /* ---------- Roles & Access ---------- */
  S.roles = {
    title: "Roles & Access",
    render() {
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Roles &amp; Access</div><div class="page__sub">Role assignment, center scoping and <b>sensitive mentor-note access levels</b>. The routing matrix (owner / performer / approver / backup / escalation / reviewer / data steward) must be validated before automation goes live.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">AUTH</span><span class="nv-flag">[Owner: NV]</span></div>
        </div>
        <div class="grid grid--2">
          <div class="card"><div class="card__head"><h3>Roles &amp; sensitive-note access</h3></div><div class="card__body card__body--flush"><table class="table">
            <thead><tr><th>User</th><th>Role</th><th>Node</th><th>Note access</th></tr></thead>
            <tbody>${FOLK.seed.guides.map((g) => `<tr>
              <td>${esc(g.Guide_Name)} ${c.idChip(g.Guide_ID)}</td>
              <td>${c.badge(util.titleCase(g.Role), "info")}</td>
              <td class="small">${esc(c.nodeName(g.Center_Node_ID))}</td>
              <td>${accessExplain(g.Sensitive_Access)}</td>
            </tr>`).join("")}</tbody>
          </table></div></div>
          <div class="card"><div class="card__head"><h3>Routing matrix</h3></div><div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
            <thead><tr><th>Process</th><th>Owner</th><th>Approver</th><th>Escalation</th><th>Steward</th></tr></thead>
            <tbody>${store.state.routing.map((r) => `<tr><td class="small"><b>${esc(r.Process)}</b></td><td class="small">${esc(c.guideName(r.Owner))}</td><td class="small">${esc(c.guideName(r.Approver))}</td><td class="small">${esc(c.guideName(r.Escalation))}</td><td class="small">${esc(c.guideName(r.Data_Steward))}</td></tr>`).join("")}</tbody>
          </table></div></div></div>
        </div>
        <div style="height:14px"></div>
        ${c.govBanner("Access levels: standard (assigned guide + coordinators) · sensitive (assigned guide + center-head) · restricted (center-head / full only). Switch roles in the top bar to see gating live on Seeker 360.")}
      </div>`;
    },
  };

  function accessExplain(level) {
    const map = { none: ["neutral", "No sensitive"], standard: ["neutral", "Standard"], sensitive: ["purple", "Sensitive"], full: ["danger", "Full"] };
    const [tone, label] = map[level] || ["neutral", level];
    return c.badge(label, tone);
  }

  /* ---------- Billing / ERP References + API metering ---------- */
  S.billing = {
    title: "Billing / ERP & API",
    render() {
      const usage = spine.billing.usage();
      const prices = spine.billing.prices();
      const total = usage.reduce((a, r) => a + spine.billing.cost(r), 0);
      const erp = spine.billing.erpRefs();
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Billing / ERP References &amp; API Metering</div><div class="page__sub">Read-only ERP links (reference only — financial records stay in ERP) and the <b>central API billing</b> meter: KCKE / Content / Media / voice usage is metered per center-node for chargeback.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">BILL</span></div>
        </div>
        <div class="card" style="margin-bottom:16px"><div class="card__head"><h3>Central API usage by center-node</h3><div class="spacer"></div><span class="muted small">unit prices — KCKE ${util.money(prices.KCKE)} · Content ${util.money(prices.Content)} · Media ${util.money(prices.Media)} · Voice ${util.money(prices.Voice)}</span></div>
          <div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
            <thead><tr><th>Center-node</th><th class="num">KCKE</th><th class="num">Content</th><th class="num">Media</th><th class="num">Voice</th><th class="num">Metered cost</th></tr></thead>
            <tbody>${usage.map((r) => `<tr>
              <td>${esc(c.nodeName(r.Center_Node_ID))} ${c.idChip(r.Center_Node_ID)}</td>
              <td class="num">${r.KCKE}</td><td class="num">${r.Content}</td><td class="num">${r.Media}</td><td class="num">${r.Voice}</td>
              <td class="num"><b>${util.money(spine.billing.cost(r))}</b></td>
            </tr>`).join("")}
            <tr><td><b>Total (all nodes)</b></td><td class="num">${usage.reduce((a, r) => a + r.KCKE, 0)}</td><td class="num">${usage.reduce((a, r) => a + r.Content, 0)}</td><td class="num">${usage.reduce((a, r) => a + r.Media, 0)}</td><td class="num">${usage.reduce((a, r) => a + r.Voice, 0)}</td><td class="num"><b>${util.money(total)}</b></td></tr>
            </tbody>
          </table></div></div></div>
        <div class="card"><div class="card__head"><h3>ERP references (reference-only)</h3></div>
          <div class="card__body">
            <div class="gov-banner" style="margin-bottom:12px">🔗 FOLK links ERP IDs (Payment / Receipt / Approval / Donation); it never stores or finalizes financial records. AI cannot finalize a payment decision.</div>
            <div class="scroll-x"><table class="table">
              <thead><tr><th>Seeker</th><th>Purpose</th><th>Payment</th><th>Receipt</th><th>Approval</th><th class="num">Amount</th><th>Status</th></tr></thead>
              <tbody>${erp.map((e) => `<tr>
                <td>${c.seekerLink(e.Contact_ID)}</td><td class="small">${esc(e.Purpose)}</td>
                <td>${e.Payment_ID ? c.idChip(e.Payment_ID) : "—"}</td>
                <td>${e.Receipt_ID ? c.idChip(e.Receipt_ID) : "—"}</td>
                <td>${e.Approval_ID ? c.idChip(e.Approval_ID) : (e.Donation_ID ? c.idChip(e.Donation_ID) : "—")}</td>
                <td class="num">${esc(e.Amount)}</td><td>${c.badge(util.titleCase(e.Status), "success")}</td>
              </tr>`).join("")}</tbody>
            </table></div>
          </div></div>
      </div>`;
    },
  };

  FOLK.screens = S;
})(window.FOLK = window.FOLK || {});
