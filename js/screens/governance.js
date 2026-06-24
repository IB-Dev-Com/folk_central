/* ============================================================================
   WF-015 FOLK — Governance: Approvals (human gate) + Audit Trail.
   AI cannot finalize sensitive items; this is where a human decides. Every
   resolution writes to the immutable audit log.
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, spine, agents, router } = FOLK;
  const esc = util.esc;
  const S = FOLK.screens = FOLK.screens || {};

  const TYPE_LABEL = {
    stage_change: "Stage change", sensitive_followup: "Sensitive follow-up",
    dormant_recontact: "Dormant re-contact", yatra_invite: "Yatra invite",
    public_content: "Public content", sadhana_reminder: "Sadhana reminder",
  };

  /* ---------- Approvals ---------- */
  S.approvals = {
    title: "Approvals",
    render() {
      const all = store.state.approvals.filter((a) => a.Contact_ID ? store.inScope(store.seeker(a.Contact_ID) || {}) : true);
      const pending = all.filter((a) => a.Status === "pending");
      const resolved = all.filter((a) => a.Status !== "pending");
      const canApprove = spine.auth.can("approve");
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Approvals — Human Gate</div><div class="page__sub">Unified queue of items awaiting a human decision: sensitive sends, stage changes, dormant re-contact, Yatra invites, public/devotional content. <b>AI cannot finalize these.</b> Approve / edit / reject with a reason — all logged.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">AUTH</span>${canApprove ? "" : `<span class="badge badge--warn">your role can't approve — switch role to Center Head / Primary Guide</span>`}</div>
        </div>
        <div class="card" style="margin-bottom:16px"><div class="card__head"><h3>Pending</h3><span class="badge badge--warn" style="margin-left:6px">${pending.length}</span></div>
          <div class="card__body stack">${pending.length ? pending.map((a) => apprCard(a, canApprove)).join("") : c.empty("Nothing pending — the human gate is clear", "✓")}</div></div>
        <div class="card"><div class="card__head"><h3>Recently resolved</h3></div>
          <div class="card__body card__body--flush"><table class="table">
            <thead><tr><th>Item</th><th>Type</th><th>Seeker</th><th>Decision</th><th>By</th><th>When</th></tr></thead>
            <tbody>${resolved.map((a) => `<tr>
              <td>${c.idChip(a.Approval_ID)}</td>
              <td>${esc(TYPE_LABEL[a.Item_Type] || a.Item_Type)}</td>
              <td>${a.Contact_ID ? c.seekerLink(a.Contact_ID) : "—"}</td>
              <td>${decisionBadge(a.Status)}${a.Reason ? `<div class="xs muted">${esc(a.Reason)}</div>` : ""}</td>
              <td class="small">${esc(c.guideName(a.Approver_ID))}</td>
              <td class="xs muted">${esc(a.Timestamp)}</td>
            </tr>`).join("") || `<tr><td colspan="6">${c.empty("No resolved items yet")}</td></tr>`}</tbody>
          </table></div></div>
      </div>`;
    },
    mount() { bindAppr(); },
  };

  function apprCard(a, canApprove) {
    return `<div class="card" style="box-shadow:none;border-color:var(--c-border)" id="appr-${a.Approval_ID}"><div class="card__body">
      <div class="row between">
        <div class="row" style="gap:8px">${c.badge(TYPE_LABEL[a.Item_Type] || a.Item_Type, "purple")}${c.idChip(a.Approval_ID)}${a.Contact_ID ? c.seekerLink(a.Contact_ID) : ""}</div>
        <span class="xs muted">requested by ${esc(c.guideName(a.Requested_By))} · ${esc(a.Timestamp)}</span>
      </div>
      <div class="ai-block" style="margin-top:10px"><div class="ai-block__head"><span class="spark">✦</span>Proposed by ${esc(a.Requested_By)}</div>
        <div class="small">${esc(a.Payload || "—")}</div></div>
      ${canApprove ? `<div class="row" style="margin-top:12px;gap:8px">
        <button class="btn btn--primary btn--sm" data-appr-approve="${a.Approval_ID}">✓ Approve</button>
        <button class="btn btn--sm" data-appr-edit="${a.Approval_ID}">✎ Edit &amp; approve</button>
        <button class="btn btn--danger btn--sm" data-appr-reject="${a.Approval_ID}">✕ Reject</button>
        <span class="xs muted" style="margin-left:auto">Approver: ${esc(c.guideName(a.Approver_ID))}</span>
      </div>` : `<div class="xs muted" style="margin-top:10px">Awaiting ${esc(c.guideName(a.Approver_ID))} (${esc(spine.auth.label())} can't finalize this).</div>`}
    </div></div>`;
  }

  function decisionBadge(status) {
    const map = { approved: ["success", "Approved"], edited: ["info", "Edited & approved"], rejected: ["danger", "Rejected"] };
    const [tone, label] = map[status] || ["neutral", status];
    return c.badge(label, tone);
  }

  function applyApproval(a) {
    // apply side-effects of an approved item
    if (a.Item_Type === "stage_change" && a._stageTarget) {
      spine.identity.writeExtension(a.Contact_ID, { Current_Stage: a._stageTarget, Stage_Last_Updated: util.now().slice(0, 10) }, { action: "stage_change_applied", actor: store.session.userId });
    }
    if (a.Item_Type === "stage_change" && !a._stageTarget && /→\s*([A-Za-z ]+)/.test(a.Payload)) {
      const m = a.Payload.match(/→\s*([A-Za-z ]+)/);
      const target = (m[1] || "").trim().toLowerCase().replace(/ /g, "_").replace(/\.$/, "");
      const s = store.seeker(a.Contact_ID);
      if (s && FOLK.agents.STAGE_ORDER.concat(["dormant"]).includes(target)) {
        spine.identity.writeExtension(a.Contact_ID, { Current_Stage: target, Stage_Last_Updated: util.now().slice(0, 10) }, { action: "stage_change_applied", actor: store.session.userId });
      }
    }
  }

  function bindAppr() {
    document.querySelectorAll("[data-appr-approve]").forEach((b) => b.onclick = () => {
      const a = store.state.approvals.find((x) => x.Approval_ID === b.dataset.apprApprove);
      applyApproval(a);
      store.resolveApproval(a.Approval_ID, "approved", a.Reason);
      c.toast("Approved & applied — logged to audit", "success");
    });
    document.querySelectorAll("[data-appr-reject]").forEach((b) => b.onclick = () => {
      promptReason("Reject", (reason) => { store.resolveApproval(b.dataset.apprReject, "rejected", reason); c.toast("Rejected — logged", "warn"); });
    });
    document.querySelectorAll("[data-appr-edit]").forEach((b) => b.onclick = () => {
      const a = store.state.approvals.find((x) => x.Approval_ID === b.dataset.apprEdit);
      const m = c.overlay(`<div class="modal__head"><h3>Edit &amp; approve</h3></div>
        <div class="modal__body">
          <div class="field"><label>Content / payload</label><textarea class="ctrl" id="ed-payload" rows="4">${esc(a.Payload || "")}</textarea></div>
          <div class="field" style="margin-top:10px"><label>Reason for edit</label><input class="ctrl" id="ed-reason" placeholder="e.g. softened tone, switched to personal call"/></div>
        </div>
        <div class="modal__foot"><button class="btn" onclick="FOLK.c.closeOverlay()">Cancel</button><button class="btn btn--primary" id="ed-save">Approve with edit</button></div>`);
      m.querySelector("#ed-save").onclick = () => {
        a.Payload = m.querySelector("#ed-payload").value;
        applyApproval(a);
        store.resolveApproval(a.Approval_ID, "edited", m.querySelector("#ed-reason").value || "edited before approval");
        c.closeOverlay(); c.toast("Edited & approved — logged", "success");
      };
    });
  }

  function promptReason(title, cb) {
    const m = c.overlay(`<div class="modal__head"><h3>${esc(title)}</h3></div>
      <div class="modal__body"><div class="field"><label>Reason (logged to audit)</label><textarea class="ctrl" id="r-text" rows="3" placeholder="Why?"></textarea></div></div>
      <div class="modal__foot"><button class="btn" onclick="FOLK.c.closeOverlay()">Cancel</button><button class="btn btn--danger" id="r-go">${esc(title)}</button></div>`);
    m.querySelector("#r-go").onclick = () => { const v = m.querySelector("#r-text").value.trim(); c.closeOverlay(); cb(v); };
  }

  /* ---------- Audit Trail ---------- */
  S.audit = {
    title: "Audit Trail",
    render() {
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Audit Trail</div><div class="page__sub">Immutable log of every AI suggestion, human approval, follow-up, stage change and <b>sensitive mentor-note access</b>. Filter by actor type, center or free text.</div></div>
          <div class="spacer"></div><div class="page__actions">
            <select class="ctrl" id="au-type"><option value="">All actors</option><option value="agent">Agents (AI)</option><option value="user">Users</option></select>
            <input class="ctrl" id="au-q" placeholder="Filter…" style="width:180px"/>
          </div>
        </div>
        <div class="card"><div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
          <thead><tr><th>Audit_ID</th><th>Actor</th><th>Action</th><th>Entity</th><th>Node</th><th>When</th></tr></thead>
          <tbody id="au-rows">${rows(store.state.audit)}</tbody>
        </table></div></div></div>
      </div>`;
    },
    mount() {
      const apply = () => {
        const type = document.getElementById("au-type").value;
        const q = document.getElementById("au-q").value.toLowerCase();
        const filtered = store.state.audit.filter((a) =>
          (!type || a.Actor_Type === type) &&
          (!q || (a.Action + a.Entity_Ref + a.Actor).toLowerCase().includes(q)));
        document.getElementById("au-rows").innerHTML = rows(filtered);
      };
      document.getElementById("au-type").onchange = apply;
      document.getElementById("au-q").oninput = apply;
    },
  };

  function rows(list) {
    if (!list.length) return `<tr><td colspan="6">${c.empty("No matching audit entries")}</td></tr>`;
    return list.map((a) => `<tr>
      <td>${c.idChip(a.Audit_ID)}</td>
      <td>${a.Actor_Type === "agent" ? `<span class="badge badge--ai">✦ ${esc(a.Actor)}</span>` : `<span class="small">${esc(c.guideName(a.Actor))}</span>`}</td>
      <td class="small">${esc(a.Action)}</td>
      <td class="mono xs">${esc(a.Entity_Ref)}</td>
      <td class="xs muted">${esc(a.Center_Node_ID || "—")}</td>
      <td class="xs muted">${esc(a.Timestamp)}</td>
    </tr>`).join("");
  }

  FOLK.screens = S;
})(window.FOLK = window.FOLK || {});
