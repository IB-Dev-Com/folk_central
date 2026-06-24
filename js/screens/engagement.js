/* ============================================================================
   WF-015 FOLK — Engagement: Follow-up & Risk Queue, Attendance,
   Sadhana Progress, Trip / Yatra Readiness.
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, spine, agents, router } = FOLK;
  const esc = util.esc;
  const S = FOLK.screens = FOLK.screens || {};

  /* ---------- Follow-up & Drop-off-Risk Queue ---------- */
  S.followups = {
    title: "Follow-up & Risk Queue",
    render() {
      const scoped = store.state.followups.filter((f) => { const s = store.seeker(f.Contact_ID); return s && store.inScope(s); });
      const ordered = agents.fieldOutreach.prioritize(scoped);
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Follow-up &amp; Drop-off-Risk Queue</div><div class="page__sub">Prioritized by the Field Outreach Prioritization Agent. Each item carries an AI-drafted message — <b>draft-only</b>; a human reviews & sends. The over-contact safeguard flags fatigue and recommends a personal touch instead of more automation.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">ID/CRM</span><span class="nv-flag">WhatsApp/calls [API: NV]</span></div>
        </div>
        ${c.govBanner("AI recommends follow-up frequency per youth — it does not blindly auto-remind. Over-contacting can create pressure or guilt.")}
        <div style="height:14px"></div>
        <div class="stack">${ordered.map((f) => fupCard(f)).join("") || c.empty("No follow-ups in this scope", "✉")}</div>
      </div>`;
    },
    mount() {
      document.querySelectorAll("[data-draft]").forEach((b) => b.onclick = () => genDraft(b.dataset.draft));
    },
  };

  function fupCard(f) {
    const s = store.seeker(f.Contact_ID);
    const overdue = util.daysUntil(f.Next_Followup_Date) < 0;
    const safeguard = f.No_Response_Count >= 4 || f.Recommended_Frequency === "reduce_pause_auto";
    return `<div class="card" id="fup-${f.Followup_ID}"><div class="card__body">
      <div class="row between">
        <div class="row">${c.avatar(s.Full_Name)}<div>
          <b>${c.seekerLink(s.Contact_ID)}</b> ${c.stageBadge(s.Current_Stage)}
          <div class="xs muted">${c.idChip(s.Contact_ID)} · ${esc(c.nodeName(s.Center_Node_ID))} · owner ${esc(c.guideName(f.Next_Action_Owner))}</div>
        </div></div>
        <div class="row" style="gap:8px">
          <span class="badge badge--${overdue ? "danger" : "info"}">${overdue ? "Overdue " : "Due "}${util.relDate(f.Next_Followup_Date)}</span>
          ${c.riskBadge(s.AI_Risk_Flag)}
        </div>
      </div>
      <div style="margin-top:10px" class="row row--wrap" style="gap:8px">
        <span class="small"><b>Next action:</b> ${esc(f.Next_Action)}</span>
        <span class="badge badge--neutral">${esc(f.Followup_Channel)}</span>
        <span class="badge badge--${safeguard ? "danger" : "neutral"}">freq: ${esc(util.titleCase(f.Recommended_Frequency))}</span>
        <span class="xs muted">${f.No_Response_Count} no-response</span>
      </div>
      ${safeguard ? `<div class="gov-banner warn" style="margin-top:10px">⚠ Over-contact safeguard: ${f.No_Response_Count} unanswered contacts — automation paused. Recommend a personal guide call, routed for approval.</div>` : ""}
      <div id="draft-${f.Followup_ID}" style="margin-top:12px">
        <button class="btn btn--ai btn--sm" data-draft="${f.Followup_ID}">✦ Draft follow-up message</button>
      </div>
    </div></div>`;
  }

  async function genDraft(fupId) {
    const f = store.state.followups.find((x) => x.Followup_ID === fupId);
    const s = store.seeker(f.Contact_ID);
    const host = document.getElementById("draft-" + fupId);
    host.innerHTML = c.loading("Program Follow-up Agent drafting…");
    const d = await agents.followup.draft(s, f);
    host.innerHTML = c.aiBlock(d.agent + " — draft (human-approved before send)", `
      ${d.overContact.flag ? `<div class="gov-banner warn" style="margin-bottom:8px">⚠ ${esc(d.overContact.reason)}</div>` : d.overContact.reason ? `<div class="xs muted" style="margin-bottom:6px">ℹ ${esc(d.overContact.reason)}</div>` : ""}
      <div class="field"><label>Editable draft · ${esc(d.channel)}</label><textarea class="ctrl" id="msg-${fupId}" rows="3">${esc(d.message)}</textarea></div>
      <div class="xs muted" style="margin-top:6px">${esc(d.note)}</div>
      <div class="row" style="margin-top:10px;gap:8px">
        ${d.requires_human_approval
          ? `<button class="btn btn--primary btn--sm" id="send-appr-${fupId}">Route to Approvals (sensitive)</button>`
          : `<button class="btn btn--primary btn--sm" id="send-${fupId}">Mark sent (human-send)</button>`}
        <button class="btn btn--sm" id="regen-${fupId}">↻ Regenerate</button>
      </div>`);
    const regen = document.getElementById("regen-" + fupId); if (regen) regen.onclick = () => genDraft(fupId);
    const send = document.getElementById("send-" + fupId);
    if (send) send.onclick = () => {
      const msg = document.getElementById("msg-" + fupId).value;
      f.Outcome = "sent_human"; f.Last_Followup_Date = util.now().slice(0, 10);
      store.audit("followup_sent (human) via " + d.channel, fupId, { contactId: f.Contact_ID });
      store.commit(); c.toast("Marked as sent by " + spine.auth.label() + " — logged", "success");
    };
    const sendAppr = document.getElementById("send-appr-" + fupId);
    if (sendAppr) sendAppr.onclick = () => {
      const msg = document.getElementById("msg-" + fupId).value;
      store.addApproval({
        Approval_ID: util.rid("APPR"), Item_Type: "sensitive_followup", Item_Ref: fupId, Contact_ID: f.Contact_ID,
        Requested_By: d.agent, Approver_ID: f.Next_Action_Owner, Status: "pending", Reason: "",
        Timestamp: util.now(), Payload: msg,
      });
      store.commit(); c.toast("Sensitive follow-up routed to Approvals", "info");
    };
  }

  /* ---------- Attendance ---------- */
  S.attendance = {
    title: "Attendance",
    render() {
      const scoped = store.state.attendance.filter((a) => { const s = store.seeker(a.Contact_ID); return s && store.inScope(s); });
      const online = scoped.filter((a) => a.Mode === "online").length;
      const offline = scoped.filter((a) => a.Mode === "offline").length;
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Program / Course / Reading-Group Attendance</div><div class="page__sub">Deterministic capture for programs, reading groups, webinars and courses. Online dwell (Meet/Zoom) is an enthusiasm signal. Manual + CSV fallback where connectors aren't live.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">MAP</span><span class="nv-flag">Meet/Zoom [API: NV]</span><button class="btn btn--sm" id="add-att">+ Capture attendance</button></div>
        </div>
        <div class="grid grid--kpi" style="margin-bottom:18px">
          ${c.kpi({ label: "Touchpoints", value: scoped.length, sub: "in scope" })}
          ${c.kpi({ label: "Offline", value: offline, sub: "physical association" })}
          ${c.kpi({ label: "Online", value: online, sub: "courses / webinars" })}
          ${c.kpi({ label: "Online→Offline", value: util.pct(offline / (scoped.length || 1)), tone: "up", sub: "conversion" })}
        </div>
        <div class="card"><div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
          <thead><tr><th>Seeker</th><th>Activity</th><th>Type</th><th>Date</th><th>Mode</th><th class="num">Dwell</th><th>Source</th></tr></thead>
          <tbody>${scoped.slice().sort((a, b) => b.Date.localeCompare(a.Date)).map((a) => `<tr>
            <td>${c.seekerLink(a.Contact_ID)}</td>
            <td>${c.idChip(a.Activity_ID)} <span class="small">${esc(activityName(a.Activity_ID))}</span></td>
            <td>${c.badge(util.titleCase(a.Activity_Type), "neutral")}</td>
            <td class="small">${esc(a.Date)}</td>
            <td>${c.badge(a.Mode, a.Mode === "offline" ? "success" : "info")}</td>
            <td class="num">${a.Duration_Min ? a.Duration_Min + "m" : "—"}</td>
            <td class="mono xs">${esc(a.Source_System)}</td>
          </tr>`).join("")}</tbody>
        </table></div></div></div>
      </div>`;
    },
    mount() {
      const b = document.getElementById("add-att"); if (b) b.onclick = addAttendance;
    },
  };

  function activityName(id) { const a = store.state.catalog.find((x) => x.Activity_ID === id); return a ? a.Name : ""; }

  function addAttendance() {
    const seekers = store.scopedSeekers();
    const acts = store.state.catalog;
    const m = c.overlay(`
      <div class="modal__head"><h3>Capture attendance</h3></div>
      <div class="modal__body stack">
        <div class="field"><label>Seeker</label><select class="ctrl" id="a-seeker">${seekers.map((s) => `<option value="${s.Contact_ID}">${esc(s.Full_Name)} (${s.Contact_ID})</option>`).join("")}</select></div>
        <div class="field"><label>Activity</label><select class="ctrl" id="a-act">${acts.map((a) => `<option value="${a.Activity_ID}">${esc(a.Name)} (${a.Type})</option>`).join("")}</select></div>
        <div class="grid grid--2">
          <div class="field"><label>Mode</label><select class="ctrl" id="a-mode"><option value="offline">Offline</option><option value="online">Online</option></select></div>
          <div class="field"><label>Dwell (min, online)</label><input class="ctrl" id="a-dwell" type="number" placeholder="e.g. 45"/></div>
        </div>
        <div class="gov-banner">Deterministic capture — feeds Seeker Journey + Management Intelligence. No AI judgement.</div>
      </div>
      <div class="modal__foot"><button class="btn" id="cancel">Cancel</button><button class="btn btn--primary" id="save">Capture</button></div>`);
    m.querySelector("#cancel").onclick = () => c.closeOverlay();
    m.querySelector("#save").onclick = () => {
      const cid = m.querySelector("#a-seeker").value;
      const aid = m.querySelector("#a-act").value;
      const mode = m.querySelector("#a-mode").value;
      const dwell = m.querySelector("#a-dwell").value;
      const act = acts.find((a) => a.Activity_ID === aid);
      store.state.attendance.unshift({ Attendance_ID: util.rid("ATT"), Contact_ID: cid, Activity_Type: act.Type, Activity_ID: aid, Date: util.now().slice(0, 10), Mode: mode, Duration_Min: dwell ? Number(dwell) : null, Source_System: "MANUAL" });
      const s = store.seeker(cid); if (s) { s.Repeat_Attendance_Count += 1; s.Last_Attendance_Date = util.now().slice(0, 10); }
      store.audit("attendance_captured", aid + " / " + cid, { contactId: cid });
      store.commit(); c.closeOverlay(); c.toast("Attendance captured", "success");
    };
  }

  /* ---------- Sadhana Progress ---------- */
  S.sadhana = {
    title: "Sadhana Progress",
    render() {
      const scoped = store.state.sadhana.filter((x) => { const s = store.seeker(x.Contact_ID); return s && store.inScope(s); });
      const canSee = spine.auth.caps().sensitive !== "standard" || ["sadhana_coordinator", "center_head", "primary_guide"].includes(store.session.role);
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Sadhana Progress</div><div class="page__sub">Chanting consistency, rounds, ashram level and reading-group participation. The Sadhana Progress Agent flags gaps and recommends <b>gentle, frequency-aware</b> reminders. Sadhana data is sensitive — access-controlled.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">MAP</span><span class="seam-chip">AUTH</span><span class="nv-flag">tracker [API: NV]</span></div>
        </div>
        ${!canSee ? c.govBanner("Your role has limited sadhana visibility. Sensitive progression data is gated by Sensitive_Note_Access_Level.", true) : ""}
        <div class="card"><div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
          <thead><tr><th>Seeker</th><th>Report</th><th>Chanting</th><th class="num">Rounds</th><th>Ashram</th><th>Reading group</th><th>Signal</th><th></th></tr></thead>
          <tbody>${scoped.map((x) => {
            const s = store.seeker(x.Contact_ID);
            const lapsed = x.Sadhana_Report_Status === "lapsed";
            return `<tr>
              <td>${c.seekerLink(x.Contact_ID)}</td>
              <td>${lapsed ? c.badge("Lapsed", "danger") : c.badge("Active", "success")}<div class="xs muted">${util.relDate(x.Last_Sadhana_Report_Date)}</div></td>
              <td>${chantDots(x.Chanting_Consistency)}</td>
              <td class="num">${x.Rounds_Level}</td>
              <td class="small">${esc(util.titleCase(x.Ashram_Level))}</td>
              <td>${c.idChip(x.Reading_Group_ID)}</td>
              <td>${x.Potential_Preacher_Flag ? c.badge("Potential Preacher", "success") : (lapsed ? c.badge("Sadhana gap", "warn") : c.badge("Healthy", "neutral"))}</td>
              <td>${lapsed ? `<button class="btn btn--ai btn--sm" data-sadhana="${x.Contact_ID}">✦ Suggest</button>` : ""}</td>
            </tr>`;
          }).join("") || `<tr><td colspan="8">${c.empty("No sadhana records in scope", "☸")}</td></tr>`}</tbody>
        </table></div></div></div>
        <div id="sadhana-out" style="margin-top:14px"></div>
      </div>`;
    },
    mount() {
      document.querySelectorAll("[data-sadhana]").forEach((b) => b.onclick = async () => {
        const out = document.getElementById("sadhana-out");
        out.innerHTML = `<div class="card"><div class="card__body">${c.loading("Sadhana Progress Agent…")}</div></div>`;
        const r = await agents.sadhana.run(b.dataset.sadhana);
        const s = store.seeker(b.dataset.sadhana);
        out.innerHTML = c.aiBlock(r.agent + " — recommendation for " + s.Full_Name, `
          <div class="small">${esc(r.recommendation)}</div>
          <div class="xs muted" style="margin-top:6px">Frequency-aware: the guide approves the cadence per youth — no blind auto-reminders.</div>
          <div class="row" style="margin-top:10px;gap:8px">
            <button class="btn btn--primary btn--sm" id="sadhana-route">Route gentle reminder → Approvals</button>
          </div>`);
        document.getElementById("sadhana-route").onclick = () => {
          store.addApproval({ Approval_ID: util.rid("APPR"), Item_Type: "sadhana_reminder", Item_Ref: s.FOLK_Seeker_ID, Contact_ID: s.Contact_ID, Requested_By: r.agent, Approver_ID: s.Primary_Guide_ID, Status: "pending", Reason: "", Timestamp: util.now(), Payload: "Gentle, frequency-aware sadhana reminder." });
          store.commit(); c.toast("Reminder routed to Approvals", "info");
        };
      });
    },
  };

  function chantDots(level) {
    const n = { none: 0, irregular: 1, steady: 2, strong: 3 }[level] || 0;
    return `<span title="${esc(level)}">${[0, 1, 2].map((i) => `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:2px;background:${i < n ? "var(--c-saffron-500)" : "#e6e8ef"}"></span>`).join("")}</span> <span class="xs muted">${esc(level)}</span>`;
  }

  /* ---------- Trip / Yatra Readiness ---------- */
  S.yatra = {
    title: "Trip / Yatra Readiness",
    render() {
      const seekers = store.scopedSeekers();
      const ranked = seekers.map((s) => ({ s, sc: agents.yatra.score(s), trip: store.tripsFor(s.Contact_ID)[0] }))
        .sort((a, b) => b.sc.score - a.sc.score);
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Trip / Yatra Readiness</div><div class="page__sub">The Yatra/Trip Interest Agent scores readiness from engagement + sadhana + past-trip history and recommends a <b>human-approved</b> invite. Payment steps are ERP-referenced only — never finalized by AI. Future link to WF-001.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">BILL</span><span class="seam-chip">WF-001 (future)</span></div>
        </div>
        <div class="card"><div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
          <thead><tr><th>Seeker</th><th>Stage</th><th class="num">Score</th><th>Readiness</th><th>Past trips</th><th>Trip link</th><th>Payment (ERP ref)</th><th></th></tr></thead>
          <tbody>${ranked.map(({ s, sc, trip }) => `<tr>
            <td>${c.seekerLink(s.Contact_ID)}</td>
            <td>${c.stageBadge(s.Current_Stage)}</td>
            <td class="num">${sc.score}</td>
            <td>${c.badge(util.titleCase(sc.level), sc.level === "high" ? "success" : sc.level === "medium" ? "warn" : "neutral")}</td>
            <td class="num">${trip ? trip.Past_Trip_Count : 0}</td>
            <td>${trip ? c.idChip(trip.Yatra_ID || trip.Trip_ID) : `<span class="muted xs">—</span>`}</td>
            <td>${trip && trip.Payment_ID ? c.idChip(trip.Payment_ID) + " " + c.badge(trip.Payment_Status, "info") : `<span class="muted xs">none</span>`}</td>
            <td>${sc.level !== "low" ? `<button class="btn btn--ai btn--sm" data-yatra="${s.Contact_ID}">✦ Recommend invite</button>` : ""}</td>
          </tr>`).join("")}</tbody>
        </table></div></div></div>
        <div id="yatra-out" style="margin-top:14px"></div>
      </div>`;
    },
    mount() {
      document.querySelectorAll("[data-yatra]").forEach((b) => b.onclick = async () => {
        const s = store.seeker(b.dataset.yatra);
        const out = document.getElementById("yatra-out");
        out.innerHTML = `<div class="card"><div class="card__body">${c.loading("Yatra/Trip Interest Agent scoring…")}</div></div>`;
        const r = await agents.yatra.recommend(s);
        out.innerHTML = c.aiBlock(r.agent + " — for " + s.Full_Name, `
          <div class="small"><b>${esc(r.invite)}</b> · readiness ${c.badge(util.titleCase(r.level), r.level === "high" ? "success" : "warn")} (score ${r.score})</div>
          <div class="xs muted" style="margin-top:6px">${esc(r.note)}</div>
          <div class="row" style="margin-top:10px"><button class="btn btn--primary btn--sm" id="yatra-route">Route invite → Approvals</button></div>`);
        document.getElementById("yatra-route").onclick = () => {
          const trip = store.tripsFor(s.Contact_ID)[0];
          store.addApproval({ Approval_ID: util.rid("APPR"), Item_Type: "yatra_invite", Item_Ref: trip ? trip.Link_ID : s.FOLK_Seeker_ID, Contact_ID: s.Contact_ID, Requested_By: r.agent, Approver_ID: store.seeker(s.Contact_ID).Primary_Guide_ID, Status: "pending", Reason: "", Timestamp: util.now(), Payload: r.invite });
          store.commit(); c.toast("Yatra invite routed to Approvals", "info");
        };
      });
    },
  };

  FOLK.screens = S;
})(window.FOLK = window.FOLK || {});
