/* ============================================================================
   WF-015 FOLK — People: Seekers list, Seeker 360, Journey Board, Dormant.
   Seeker 360 is the navigation hub; mentor memory is access-gated + audited.
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, spine, agents, router } = FOLK;
  const esc = util.esc;
  const S = FOLK.screens = FOLK.screens || {};

  /* ---------- Seekers list ---------- */
  S.seekers = {
    title: "Seekers",
    render() {
      const list = store.scopedSeekers();
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Seekers</div><div class="page__sub">Every contact resolves to a root <span class="mono">Contact_ID</span> on the Identity/CRM spine (WF-006). Click any seeker to open Seeker 360.</div></div>
          <div class="spacer"></div>
          <div class="page__actions"><span class="seam-chip">ID/CRM</span><span class="seam-chip">AUTH</span><button class="btn btn--primary btn--sm" id="intake">+ New contact intake</button></div>
        </div>
        <div class="card"><div class="card__body card__body--flush"><div class="scroll-x">
          <table class="table">
            <thead><tr><th>Seeker</th><th>Contact_ID</th><th>Node</th><th>Stage</th><th>Guide</th><th class="num">Attend.</th><th>Last contact</th><th>Risk</th></tr></thead>
            <tbody>${list.map((s) => `<tr class="clickable" data-id="${s.Contact_ID}">
              <td><div class="row">${c.avatar(s.Full_Name)}<b>${esc(s.Full_Name)}</b></div></td>
              <td>${c.idChip(s.Contact_ID)}</td>
              <td class="small">${esc(c.nodeName(s.Center_Node_ID))}</td>
              <td>${c.stageBadge(s.Current_Stage)}</td>
              <td class="small">${esc(c.guideName(s.Primary_Guide_ID))}</td>
              <td class="num">${s.Repeat_Attendance_Count}</td>
              <td class="small">${util.relDate(s.Last_Attendance_Date || s.First_Contact_Date)}</td>
              <td>${c.riskBadge(s.AI_Risk_Flag)}</td>
            </tr>`).join("") || `<tr><td colspan="8">${c.empty("No seekers in this scope")}</td></tr>`}</tbody>
          </table>
        </div></div></div>
      </div>`;
    },
    mount() {
      document.querySelectorAll("tr.clickable").forEach((tr) => tr.onclick = () => router.navigate("/seeker/" + tr.dataset.id));
      const ib = document.getElementById("intake"); if (ib) ib.onclick = contactIntake;
    },
  };

  /* Deterministic contact intake: resolve identity → source-tag → FOLK seeker → welcome task */
  function contactIntake() {
    const nodes = FOLK.seed.nodes;
    const guides = FOLK.seed.guides;
    const m = c.overlay(`
      <div class="modal__head"><h3>New contact intake</h3></div>
      <div class="modal__body stack">
        ${c.govBanner("Deterministic automation — resolves identity on the CRM spine, source-tags, creates a FOLK_Seeker at new_contact and a welcome follow-up task. No AI judgement.")}
        <div class="field"><label>Full name</label><input class="ctrl" id="i-name" placeholder="e.g. Aarav Joshi"/></div>
        <div class="grid grid--2">
          <div class="field"><label>Node</label><select class="ctrl" id="i-node">${nodes.map((n) => `<option value="${n.Center_Node_ID}">${esc(n.Node_Name)}</option>`).join("")}</select></div>
          <div class="field"><label>Primary guide</label><select class="ctrl" id="i-guide">${guides.filter((g) => g.Role.includes("guide") || g.Role === "center_head").map((g) => `<option value="${g.Guide_ID}">${esc(g.Guide_Name)}</option>`).join("")}</select></div>
        </div>
        <div class="grid grid--2">
          <div class="field"><label>Primary source</label><select class="ctrl" id="i-source"><option value="paid_social">Paid social</option><option value="book_distribution">Book distribution</option><option value="college_outreach">College outreach</option><option value="festival">Festival</option><option value="referral">Referral</option><option value="webinar">Webinar</option><option value="pamphlet">Pamphlet</option></select></div>
          <div class="field"><label>Source detail</label><input class="ctrl" id="i-detail" placeholder="e.g. campus stall"/></div>
        </div>
      </div>
      <div class="modal__foot"><button class="btn" id="cancel">Cancel</button><button class="btn btn--primary" id="save">Resolve &amp; intake</button></div>`);
    m.querySelector("#cancel").onclick = () => c.closeOverlay();
    m.querySelector("#save").onclick = async () => {
      const name = m.querySelector("#i-name").value.trim();
      if (!name) { c.toast("Enter a name", "warn"); return; }
      const save = m.querySelector("#save"); save.disabled = true; save.innerHTML = `<span class="spinner"></span> Resolving…`;
      const res = await spine.identity.resolve(name); // resolve on the CRM spine (WF-006)
      const cid = res.matched ? res.Contact_ID : res.Contact_ID;
      const node = store.node(m.querySelector("#i-node").value);
      const fsk = "FSK-" + util.rid("X").split("-")[1];
      const seeker = {
        Contact_ID: cid, FOLK_Seeker_ID: fsk, Full_Name: name, Phone: "+91 ••••• ••", Email: name.toLowerCase().split(" ")[0] + "••@example.com", City: node.City,
        Center_ID: node.Center_ID, Center_Node_ID: node.Center_Node_ID, Primary_Guide_ID: m.querySelector("#i-guide").value, Secondary_Guide_IDs: [],
        Current_Stage: "new_contact", Stage_Last_Updated: util.now().slice(0, 10), First_Contact_Date: util.now().slice(0, 10),
        First_Attendance_Date: null, Last_Attendance_Date: null, Repeat_Attendance_Count: 0, Seva_Engagement_Status: "none", AI_Risk_Flag: "none",
        Primary_Source: m.querySelector("#i-source").value, Source_Detail: m.querySelector("#i-detail").value, Created_Date: util.now().slice(0, 10),
      };
      store.state.seekers.unshift(seeker);
      // deterministic: welcome follow-up task + mapping row + timeline
      store.state.followups.unshift({ Followup_ID: util.rid("FUP"), Contact_ID: cid, Last_Followup_Date: null, Next_Followup_Date: util.now().slice(0, 10), Next_Action: "Welcome + invite to first program", Next_Action_Owner: seeker.Primary_Guide_ID, Followup_Channel: "whatsapp", Outcome: "pending", No_Response_Count: 0, Dormant_Status: "active", Recommended_Frequency: "weekly", Priority: 0.5 });
      store.state.mapping.unshift({ Mapping_ID: util.rid("MAP"), Contact_ID: cid, Source_System: "FOLK_CRM", Source_Record_Key: "intake_" + cid, Match_Confidence: 1.0, Mapping_Status: "confirmed", Data_Quality_Score: 0.9 });
      store.state.timeline.push({ Contact_ID: cid, entries: [{ when: util.now().slice(0, 10), type: "source", what: "Contact intake — source-tagged (" + util.titleCase(seeker.Primary_Source) + ")", by: "FOLK_CRM" }] });
      store.audit("contact_intake (source-tagged) + welcome task", cid, { contactId: cid });
      store.commit(); c.closeOverlay(); c.toast("Intake complete — " + name + " created at New Contact", "success");
      router.navigate("/seeker/" + cid);
    };
  }

  /* ---------- Seeker 360 ---------- */
  S.seeker360 = {
    title: (p) => { const s = store.seeker(p.id); return s ? s.Full_Name : "Seeker"; },
    render(p) {
      const s = store.seeker(p.id);
      if (!s) return `<div class="page">${c.empty("Contact not found: " + esc(p.id), "🔍")}</div>`;
      const tl = store.timelineFor(s.Contact_ID);
      const sad = store.sadhanaFor(s.Contact_ID);
      const trips = store.tripsFor(s.Contact_ID);
      const erp = store.erpFor(s.Contact_ID);
      const maps = store.mappingFor(s.Contact_ID);
      const fups = store.followupsFor(s.Contact_ID);

      return `<div class="page">
        <div class="page__head">
          <div>
            <div class="row" style="gap:10px">${c.avatar(s.Full_Name)}<div class="page__title">${esc(s.Full_Name)}</div>${c.stageBadge(s.Current_Stage)}${c.riskBadge(s.AI_Risk_Flag)}</div>
            <div class="page__sub row row--wrap" style="gap:8px;margin-top:8px">
              ${c.idChip(s.Contact_ID)} ${c.idChip(s.FOLK_Seeker_ID)} ${c.idChip(s.Center_Node_ID)}
              <span class="muted">·</span> Guide: <b>${esc(c.guideName(s.Primary_Guide_ID))}</b>
              ${s.Secondary_Guide_IDs && s.Secondary_Guide_IDs.length ? `<span class="muted">+ ${s.Secondary_Guide_IDs.map(c.guideName).join(", ")}</span>` : ""}
            </div>
          </div>
          <div class="spacer"></div>
          <div class="page__actions">
            <button class="btn btn--sm" onclick="location.hash='#/guide/${esc(s.Contact_ID)}'">One-on-One Prep</button>
            <button class="btn btn--sm" onclick="location.hash='#/followups'">Follow-ups</button>
            <button class="btn btn--ai" id="run-journey">✦ Run Seeker Journey Agent</button>
          </div>
        </div>

        <div id="journey-out"></div>

        <div class="cols">
          <div class="stack">
            ${cardTimeline(tl)}
            ${cardSadhana(sad, s)}
            ${cardTrips(trips)}
          </div>
          <div class="stack">
            ${cardIdentity(s, maps)}
            ${cardMentorMemory(s)}
            ${cardFollowups(fups)}
            ${cardERP(erp)}
          </div>
        </div>
      </div>`;
    },
    mount(p) {
      const s = store.seeker(p.id);
      if (!s) return;
      const btn = document.getElementById("run-journey");
      if (btn) btn.onclick = async () => {
        const out = document.getElementById("journey-out");
        out.innerHTML = `<div class="card"><div class="card__body">${c.loading("Seeker Journey Agent analysing signals…")}</div></div><div style="height:16px"></div>`;
        const res = await agents.seekerJourney.run(s);
        out.innerHTML = renderJourneyResult(s, res) + `<div style="height:16px"></div>`;
        bindJourneyResult(s, res);
      };
      // gated mentor note reveal
      document.querySelectorAll("[data-reveal-note]").forEach((b) => b.onclick = () => revealNote(b.dataset.revealNote, p.id));
    },
  };

  function renderJourneyResult(s, res) {
    const changed = res.stageChanged && res.stage !== s.Current_Stage;
    return c.aiBlock(res.agent + " — suggestion (human-approved)", `
      <div class="grid grid--2" style="gap:12px">
        <div>
          <div class="small muted">Suggested stage</div>
          <div class="row" style="margin:4px 0">${c.stageBadge(res.stage)} ${changed ? c.badge("change proposed", "warn") : c.badge("no change", "neutral")}</div>
          <div class="xs muted">${esc(res.stageReasons.join(" · "))}</div>
        </div>
        <div>
          <div class="small muted">Risk</div>
          <div style="margin:4px 0">${c.riskBadge(res.risk)}</div>
          <div class="xs muted">${esc(res.riskReasons.join(" · ") || "no risk signals")}</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="small"><b>Recommended next action:</b> ${esc(res.nextAction)}</div>
      <div class="xs muted" style="margin-top:6px">✋ AI cannot finalize. Send the stage change to the Approvals queue for human confirmation.</div>
      <div class="row" style="margin-top:10px;gap:8px">
        ${changed ? `<button class="btn btn--primary btn--sm" id="propose-stage">Propose stage change → Approvals</button>` : ""}
        <button class="btn btn--sm" id="log-only">Log suggestion only</button>
      </div>`);
  }

  function bindJourneyResult(s, res) {
    const prop = document.getElementById("propose-stage");
    if (prop) prop.onclick = () => {
      store.addApproval({
        Approval_ID: util.rid("APPR"), Item_Type: "stage_change", Item_Ref: s.FOLK_Seeker_ID,
        Contact_ID: s.Contact_ID, Requested_By: res.agent, Approver_ID: s.Primary_Guide_ID,
        Status: "pending", Reason: "", Timestamp: util.now(),
        Payload: `Stage ${util.titleCase(s.Current_Stage)} → ${util.titleCase(res.stage)}. ${res.stageReasons.join("; ")}`,
      });
      store.commit();
      c.toast("Stage change proposed — routed to Approvals", "info");
    };
    const log = document.getElementById("log-only");
    if (log) log.onclick = () => { store.audit("journey_suggestion_logged", s.FOLK_Seeker_ID, { actor: res.agent, actorType: "agent", contactId: s.Contact_ID }); store.commit(); c.toast("Suggestion logged to audit trail"); };
  }

  function cardIdentity(s, maps) {
    return `<div class="card"><div class="card__head"><h3>Identity & source</h3><div class="spacer"></div><span class="seam-chip">ID/CRM</span><span class="seam-chip">MAP</span></div>
      <div class="card__body">
        <dl class="def-list">
          <dt>Primary source</dt><dd>${esc(util.titleCase(s.Primary_Source))}</dd>
          <dt>Detail</dt><dd>${esc(s.Source_Detail || "—")}</dd>
          <dt>First contact</dt><dd>${esc(s.First_Contact_Date)} <span class="muted xs">(${util.relDate(s.First_Contact_Date)})</span></dd>
          <dt>Phone</dt><dd class="mono">${esc(s.Phone)}</dd>
          <dt>Email</dt><dd class="mono">${esc(s.Email)}</dd>
        </dl>
        <div class="divider"></div>
        <div class="small muted" style="margin-bottom:6px">Contributing source systems (mapped, not replaced):</div>
        <div class="tag-list">${maps.length ? maps.map((m) => `<span class="badge ${m.Mapping_Status === "needs_review" ? "badge--warn" : "badge--neutral"}" title="${esc(m.Source_Record_Key)} · conf ${util.pct(m.Match_Confidence)}">${esc(m.Source_System)}${m.Mapping_Status === "needs_review" ? " ⚠" : ""}</span>`).join("") : `<span class="muted small">none mapped</span>`}</div>
      </div></div>`;
  }

  function cardTimeline(tl) {
    return `<div class="card"><div class="card__head"><h3>Relationship timeline</h3><div class="spacer"></div><span class="seam-chip">ID/CRM</span></div>
      <div class="card__body">${tl.length ? `<div class="timeline">${tl.slice().reverse().map((e) => `
        <div class="tl-item"><div class="tl-when">${esc(e.when)} · ${esc(e.by)}</div><div class="tl-what">${e.type === "ai" ? "✦ " : ""}${esc(e.what)}</div></div>`).join("")}</div>` : c.empty("No timeline entries")}</div></div>`;
  }

  function cardSadhana(sad, s) {
    if (!sad) return `<div class="card"><div class="card__head"><h3>Sadhana</h3><div class="spacer"></div><span class="seam-chip">MAP</span></div><div class="card__body">${c.empty("No sadhana record — ingested from tracker " + "[API: NV]", "☸")}</div></div>`;
    const lapsed = sad.Sadhana_Report_Status === "lapsed";
    return `<div class="card"><div class="card__head"><h3>Sadhana panel</h3>${sad.Potential_Preacher_Flag ? c.badge("Potential Preacher", "success") : ""}<div class="spacer"></div><span class="seam-chip">MAP</span><span class="nv-flag">[API: NV]</span></div>
      <div class="card__body">
        <dl class="def-list">
          <dt>Report status</dt><dd>${lapsed ? c.badge("Lapsed", "danger") : c.badge("Active", "success")} <span class="muted xs">${util.relDate(sad.Last_Sadhana_Report_Date)}</span></dd>
          <dt>Chanting</dt><dd>${esc(util.titleCase(sad.Chanting_Consistency))} · ${sad.Rounds_Level} rounds</dd>
          <dt>Ashram level</dt><dd>${esc(util.titleCase(sad.Ashram_Level))}</dd>
          <dt>Courses</dt><dd>${sad.Course_Completed.length ? sad.Course_Completed.map((x) => c.idChip(x)).join(" ") : "—"}</dd>
        </dl>
      </div></div>`;
  }

  function cardTrips(trips) {
    return `<div class="card"><div class="card__head"><h3>Trip / Yatra</h3><div class="spacer"></div><span class="seam-chip">BILL</span></div>
      <div class="card__body">${trips.length ? trips.map((t) => `<div class="row between" style="padding:6px 0;border-bottom:1px solid var(--c-border)">
        <span>${c.idChip(t.Yatra_ID || t.Trip_ID)} ${c.badge(util.titleCase(t.Yatra_Readiness_Level) + " readiness", t.Yatra_Readiness_Level === "high" ? "success" : t.Yatra_Readiness_Level === "medium" ? "warn" : "neutral")}</span>
        <span class="small muted">${t.Payment_ID ? c.idChip(t.Payment_ID) + " " + c.badge(t.Payment_Status, "info") : "no payment"}</span>
      </div>`).join("") : c.empty("No trip links", "⛰")}</div></div>`;
  }

  function cardFollowups(fups) {
    return `<div class="card"><div class="card__head"><h3>Follow-up history</h3></div>
      <div class="card__body">${fups.length ? fups.map((f) => `<div style="padding:6px 0;border-bottom:1px solid var(--c-border)">
        <div class="row between"><b class="small">${esc(f.Next_Action)}</b>${c.badge(f.Followup_Channel, "neutral")}</div>
        <div class="xs muted">Due ${util.relDate(f.Next_Followup_Date)} · ${f.No_Response_Count} no-response · freq: ${esc(util.titleCase(f.Recommended_Frequency))}</div>
      </div>`).join("") : c.empty("No follow-ups")}</div></div>`;
  }

  function cardERP(erp) {
    return `<div class="card"><div class="card__head"><h3>ERP references</h3><div class="spacer"></div><span class="seam-chip">BILL</span></div>
      <div class="card__body">
        <div class="gov-banner" style="margin-bottom:10px">🔗 Reference-only. Financial records remain in ERP; FOLK never stores or finalizes them.</div>
        ${erp.length ? erp.map((e) => `<dl class="def-list" style="margin-bottom:8px">
          ${e.Payment_ID ? `<dt>Payment</dt><dd>${c.idChip(e.Payment_ID)} ${esc(e.Amount)} · ${esc(e.Purpose)} ${c.badge(e.Status, "success")}</dd>` : ""}
          ${e.Receipt_ID ? `<dt>Receipt</dt><dd>${c.idChip(e.Receipt_ID)}</dd>` : ""}
          ${e.Donation_ID ? `<dt>Donation</dt><dd>${c.idChip(e.Donation_ID)} ${esc(e.Amount)}</dd>` : ""}
        </dl>`).join("") : c.empty("No ERP references", "₹")}
      </div></div>`;
  }

  /* mentor memory — access gated */
  function cardMentorMemory(s) {
    const notes = store.notesFor(s.Contact_ID);
    return `<div class="card"><div class="card__head"><h3>Mentor memory</h3><div class="spacer"></div><span class="seam-chip">AUTH</span><span class="badge badge--purple">sensitive</span></div>
      <div class="card__body">
        ${notes.length ? notes.map((n) => {
          const can = spine.auth.canReadNote(n.Sensitive_Note_Access_Level);
          if (!can) return `<div class="locked-panel" style="margin-bottom:10px"><span class="ic lock">🔒</span>
            <div><b>${esc(util.titleCase(n.Sensitive_Note_Access_Level))} note</b> by ${esc(c.guideName(n.Author_Guide_ID))}</div>
            <div class="xs">Your role (${esc(spine.auth.label())}) cannot view this note. Access is logged.</div></div>`;
          return `<div id="note-${n.Mentor_Note_ID}" style="padding:8px;border:1px solid var(--c-border);border-radius:var(--r-md);margin-bottom:10px;background:var(--c-surface-2)">
            <div class="row between"><span class="row" style="gap:6px">${c.badge(util.titleCase(n.Sensitive_Note_Access_Level), n.Sensitive_Note_Access_Level === "restricted" ? "danger" : "purple")}${c.badge(util.titleCase(n.Capture_Method), "neutral")}</span><span class="xs muted">${esc(n.Date)}</span></div>
            <div class="note-body" style="margin-top:8px">
              <button class="btn btn--sm" data-reveal-note="${n.Mentor_Note_ID}">👁 Reveal note (logs access)</button>
            </div>
            <div class="xs muted" style="margin-top:8px">${n.Family_Concern_Flag ? c.badge("family concern", "warn") : ""} ${n.Career_Concern_Flag ? c.badge("career concern", "warn") : ""} by ${esc(c.guideName(n.Author_Guide_ID))}</div>
          </div>`;
        }).join("") : c.empty("No mentor notes", "✎")}
        <div class="xs muted">Every read of a sensitive note is recorded in the Audit Trail. Access levels: standard · sensitive · restricted.</div>
      </div></div>`;
  }

  function revealNote(noteId, contactId) {
    const n = store.state.mentorNotes.find((x) => x.Mentor_Note_ID === noteId);
    if (!n) return;
    store.audit("mentor_note_read (" + n.Sensitive_Note_Access_Level + ")", noteId, { contactId });
    store.persist();
    const host = document.querySelector("#note-" + noteId + " .note-body");
    if (host) host.innerHTML = `<div class="small">${esc(n.Note_Text)}</div>${n.Interest_Profile ? `<div class="xs muted" style="margin-top:4px">Interest: ${esc(n.Interest_Profile)}</div>` : ""}${n.Spiritual_Doubts ? `<div class="xs muted">Doubt: ${esc(n.Spiritual_Doubts)}</div>` : ""}`;
    c.toast("Sensitive note access logged to audit", "info");
  }

  /* ---------- Journey / Stage Board ---------- */
  const BOARD_STAGES = agents.STAGE_ORDER.concat(["dormant"]);
  S.board = {
    title: "Journey / Stage Board",
    render() {
      const list = store.scopedSeekers();
      const cols = BOARD_STAGES.map((stage) => {
        const cards = list.filter((s) => s.Current_Stage === stage);
        return `<div class="kcol" data-stage="${stage}">
          <div class="kcol__head">${c.stageBadge(stage)}<span class="count">${cards.length}</span></div>
          <div class="kcol__body" data-drop="${stage}">
            ${cards.map((s) => `<div class="kcard" draggable="true" data-id="${s.Contact_ID}">
              <div class="row between"><span class="kname">${esc(s.Full_Name)}</span></div>
              <div class="kmeta">${esc(c.nodeName(s.Center_Node_ID))} · ${s.Repeat_Attendance_Count} att.</div>
              <div style="margin-top:6px">${s.AI_Risk_Flag !== "none" ? c.riskBadge(s.AI_Risk_Flag) : `<span class="xs muted">${esc(c.guideName(s.Primary_Guide_ID))}</span>`}</div>
            </div>`).join("")}
          </div>
        </div>`;
      }).join("");
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Journey / Stage Board</div><div class="page__sub">Drag a card to <b>propose</b> a stage change. Proposals route to Approvals for human confirmation — AI never finalizes a stage. Risk badges from the Seeker Journey Agent.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">ID/CRM</span><span class="seam-chip">AUTH</span></div>
        </div>
        <div class="kanban">${cols}</div>
      </div>`;
    },
    mount() {
      let dragId = null;
      document.querySelectorAll(".kcard").forEach((card) => {
        card.ondragstart = (e) => { dragId = card.dataset.id; card.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; };
        card.ondragend = () => card.classList.remove("dragging");
        card.onclick = () => router.navigate("/seeker/" + card.dataset.id);
      });
      document.querySelectorAll(".kcol__body").forEach((col) => {
        col.ondragover = (e) => { e.preventDefault(); col.classList.add("dragover"); };
        col.ondragleave = () => col.classList.remove("dragover");
        col.ondrop = (e) => {
          e.preventDefault(); col.classList.remove("dragover");
          const newStage = col.dataset.drop;
          const s = store.seeker(dragId);
          if (!s || s.Current_Stage === newStage) return;
          proposeStageChange(s, newStage);
        };
      });
    },
  };

  function proposeStageChange(s, newStage) {
    const m = c.overlay(`
      <div class="modal__head"><h3>Propose stage change</h3></div>
      <div class="modal__body">
        <p>Move <b>${esc(s.Full_Name)}</b> ${c.idChip(s.Contact_ID)} from ${c.stageBadge(s.Current_Stage)} to ${c.stageBadge(newStage)}?</p>
        ${c.govBanner("AI/board changes are proposals. This routes to the assigned guide / center-head for confirmation and is logged.", true)}
        <div class="field" style="margin-top:12px"><label>Note (optional)</label><textarea class="ctrl" id="stage-note" rows="2" placeholder="Why this change?"></textarea></div>
      </div>
      <div class="modal__foot"><button class="btn" id="cancel">Cancel</button><button class="btn btn--primary" id="confirm">Send to Approvals</button></div>`);
    m.querySelector("#cancel").onclick = () => c.closeOverlay();
    m.querySelector("#confirm").onclick = () => {
      const note = m.querySelector("#stage-note").value.trim();
      store.addApproval({
        Approval_ID: util.rid("APPR"), Item_Type: "stage_change", Item_Ref: s.FOLK_Seeker_ID, Contact_ID: s.Contact_ID,
        Requested_By: store.session.userId, Approver_ID: s.Primary_Guide_ID, Status: "pending", Reason: "",
        Timestamp: util.now(), Payload: `Stage ${util.titleCase(s.Current_Stage)} → ${util.titleCase(newStage)}.${note ? " " + note : ""}`,
        _stageTarget: newStage,
      });
      store.commit();
      c.closeOverlay();
      c.toast("Stage change proposed for " + s.Full_Name + " — routed to Approvals", "info");
    };
  }

  /* ---------- Dormant Reactivation ---------- */
  S.dormant = {
    title: "Dormant Reactivation",
    render() {
      const list = agents.dormant.candidates();
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Dormant Reactivation</div><div class="page__sub">The Dormant Re-Activation Agent surfaces older contacts who may be ready to return — matched to a gentle re-engagement hook. <b>Suggestions only</b>; a guide approves re-contact to avoid pressure.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="badge badge--ai">✦ AI-assisted</span></div>
        </div>
        ${list.length ? `<div class="grid grid--2">${list.map((s) => {
          const h = agents.dormant.hook(s);
          const restricted = store.notesFor(s.Contact_ID).some((n) => n.Sensitive_Note_Access_Level === "restricted");
          return `<div class="card"><div class="card__body">
            <div class="row between"><div class="row">${c.avatar(s.Full_Name)}<div><b>${esc(s.Full_Name)}</b><div class="xs muted">${c.idChip(s.Contact_ID)} · dormant ${util.daysAgo(s.Last_Attendance_Date)}d</div></div></div>${c.riskBadge(s.AI_Risk_Flag)}</div>
            ${c.aiBlock("Suggested re-engagement", `
              <div class="small"><b>Hook:</b> ${esc(h.hook)}</div>
              <div class="small"><b>Owner:</b> ${esc(c.guideName(h.owner))}</div>
              <div class="xs muted" style="margin-top:6px">${restricted ? "⚠ " : ""}${esc(h.care)}</div>
            `)}
            <div class="row" style="margin-top:10px;gap:8px">
              <button class="btn btn--primary btn--sm" data-approve="${s.Contact_ID}">Approve re-contact → Approvals</button>
              <button class="btn btn--sm" onclick="location.hash='#/seeker/${esc(s.Contact_ID)}'">Open 360</button>
            </div>
          </div></div>`;
        }).join("")}</div>` : c.empty("No dormant candidates in this scope", "◌")}
      </div>`;
    },
    mount() {
      document.querySelectorAll("[data-approve]").forEach((b) => b.onclick = () => {
        const s = store.seeker(b.dataset.approve);
        const h = agents.dormant.hook(s);
        store.addApproval({
          Approval_ID: util.rid("APPR"), Item_Type: "dormant_recontact", Item_Ref: s.FOLK_Seeker_ID, Contact_ID: s.Contact_ID,
          Requested_By: agents.dormant.name, Approver_ID: h.owner, Status: "pending", Reason: "",
          Timestamp: util.now(), Payload: h.hook + " — " + h.care,
        });
        store.commit();
        c.toast("Re-contact proposed for " + s.Full_Name + " — routed to Approvals", "info");
      });
    },
  };

  FOLK.screens = S;
})(window.FOLK = window.FOLK || {});
