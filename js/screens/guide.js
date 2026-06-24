/* ============================================================================
   WF-015 FOLK — Guide: Guide Workspace + One-on-One Prep.
   Guide Support Copilot prepares only; the human guide finalizes. Mentor-note
   capture is access-controlled + audited. Recording is out of scope [Scope: NV].
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, spine, agents, router } = FOLK;
  const esc = util.esc;
  const S = FOLK.screens = FOLK.screens || {};

  function myYouth() {
    const uid = store.session.userId;
    const role = store.session.role;
    const all = store.scopedSeekers();
    if (["center_head", "leadership", "data_steward"].includes(role)) return all;
    return all.filter((s) => s.Primary_Guide_ID === uid || (s.Secondary_Guide_IDs || []).includes(uid));
  }

  /* ---------- Guide Workspace ---------- */
  S.guide = {
    title: "Guide Workspace",
    render() {
      const youth = myYouth();
      const uid = store.session.userId;
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Guide Workspace</div><div class="page__sub">Your daily cockpit: assigned youth with stage, last contact, suggested tone, next action and recent signals. Sensitive flags shown only at your access level. Acting as <b>${esc(c.guideName(uid))}</b> (${esc(spine.auth.label())}).</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="badge badge--ai">✦ Guide Support Copilot</span></div>
        </div>
        ${youth.length ? `<div class="grid grid--2">${youth.map((s) => guideCard(s)).join("")}</div>` : c.empty("No youth assigned to you in this scope", "☺")}
      </div>`;
    },
    mount() {},
  };

  function guideCard(s) {
    const rk = agents.seekerJourney.risk(s);
    const notes = store.notesFor(s.Contact_ID).filter((n) => spine.auth.canReadNote(n.Sensitive_Note_Access_Level));
    const flags = notes.filter((n) => n.Family_Concern_Flag || n.Career_Concern_Flag);
    const fup = store.followupsFor(s.Contact_ID)[0];
    const tone = rk.level === "drop_off_high" ? "gentle, no-pressure" : flags.some((n) => n.Family_Concern_Flag) ? "empathetic (family)" : "warm, encouraging";
    return `<div class="card"><div class="card__body">
      <div class="row between">
        <div class="row">${c.avatar(s.Full_Name)}<div><b>${c.seekerLink(s.Contact_ID)}</b><div class="xs muted">${c.idChip(s.Contact_ID)}</div></div></div>
        ${c.stageBadge(s.Current_Stage)}
      </div>
      <div class="divider"></div>
      <dl class="def-list small">
        <dt>Last contact</dt><dd>${util.relDate(s.Last_Attendance_Date || s.First_Contact_Date)}</dd>
        <dt>Risk</dt><dd>${c.riskBadge(s.AI_Risk_Flag)}</dd>
        <dt>Suggested tone</dt><dd>${esc(tone)} <span class="badge badge--ai" style="margin-left:4px">✦</span></dd>
        <dt>Next action</dt><dd>${esc(fup ? fup.Next_Action : agents.seekerJourney.nextAction(s, rk))}</dd>
        ${flags.length ? `<dt>Sensitive</dt><dd>${flags.map((n) => c.badge(n.Family_Concern_Flag ? "family concern" : "career concern", "warn")).join(" ")}</dd>` : ""}
      </dl>
      <div class="row" style="margin-top:10px;gap:8px">
        <button class="btn btn--primary btn--sm" onclick="location.hash='#/guide/${esc(s.Contact_ID)}'">One-on-One Prep →</button>
        <button class="btn btn--sm" onclick="location.hash='#/seeker/${esc(s.Contact_ID)}'">360</button>
      </div>
    </div></div>`;
  }

  /* ---------- One-on-One Prep ---------- */
  S.oneOnOne = {
    title: (p) => { const s = store.seeker(p.id); return "Prep · " + (s ? s.Full_Name : p.id); },
    render(p) {
      const s = store.seeker(p.id);
      if (!s) return `<div class="page">${c.empty("Contact not found", "🔍")}</div>`;
      return `<div class="page">
        <div class="page__head">
          <div>
            <div class="row" style="gap:10px">${c.avatar(s.Full_Name)}<div class="page__title">One-on-One Prep</div></div>
            <div class="page__sub">${c.seekerLink(s.Contact_ID)} ${c.idChip(s.Contact_ID)} · ${c.stageBadge(s.Current_Stage)}</div>
          </div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">AUTH</span><span class="nv-flag">[Scope: NV]</span></div>
        </div>
        ${c.govBanner("AI prepares the brief from the relationship timeline and mentor-approved notes. The guide reviews and finalizes. Automatic conversation recording / real-time coaching is out of scope without explicit sign-off [Scope: NV].")}
        <div style="height:14px"></div>
        <div class="cols">
          <div class="stack">
            <div class="card"><div class="card__head"><h3>Pre-meeting brief</h3><div class="spacer"></div><span class="badge badge--ai">✦ prepared by AI</span></div>
              <div class="card__body" id="brief-out">${c.loading("Guide Support Copilot assembling brief…")}</div></div>
          </div>
          <div class="stack">
            ${captureCard(s)}
          </div>
        </div>
      </div>`;
    },
    mount(p) {
      const s = store.seeker(p.id);
      if (!s) return;
      agents.guideCopilot.prep(s.Contact_ID).then((b) => {
        const host = document.getElementById("brief-out");
        if (!host) return;
        host.innerHTML = `
          <div class="stack stack--sm">${b.brief.map((line) => `<div class="small">• ${esc(line)}</div>`).join("")}</div>
          <div class="divider"></div>
          <dl class="def-list">
            <dt>Suggested tone</dt><dd><b>${esc(b.suggestedTone)}</b></dd>
            <dt>Next action</dt><dd>${esc(b.suggestedNextAction)}</dd>
            ${b.sensitiveFlags.length ? `<dt>Be mindful of</dt><dd>${b.sensitiveFlags.map((f) => c.badge(f, "warn")).join(" ")}</dd>` : ""}
          </dl>
          <div class="xs muted" style="margin-top:8px">${esc(b.note)}</div>`;
      });
      bindCapture(s);
    },
  };

  function captureCard(s) {
    const canWrite = ["primary_guide", "center_head", "sadhana_coordinator"].includes(store.session.role);
    return `<div class="card"><div class="card__head"><h3>Capture mentor summary</h3><div class="spacer"></div><span class="badge badge--purple">sensitive</span></div>
      <div class="card__body">
        ${!canWrite ? c.govBanner("Your role cannot author mentor notes. View access is still gated by note level.", true) : `
        <div class="field"><label>Summary (manual / voice-note transcription)</label><textarea class="ctrl" id="note-text" rows="4" placeholder="Key points from the conversation — written or dictated by the guide. AI does not record the conversation."></textarea></div>
        <div class="grid grid--2" style="margin-top:10px">
          <div class="field"><label>Access level</label><select class="ctrl" id="note-level"><option value="standard">Standard</option><option value="sensitive" selected>Sensitive</option><option value="restricted">Restricted</option></select></div>
          <div class="field"><label>Capture method</label><select class="ctrl" id="note-method"><option value="manual">Manual</option><option value="voice_note">Voice note</option></select></div>
        </div>
        <div class="row row--wrap" style="margin-top:10px;gap:14px">
          <label class="row small" style="gap:6px"><input type="checkbox" id="f-family"> Family concern</label>
          <label class="row small" style="gap:6px"><input type="checkbox" id="f-career"> Career concern</label>
        </div>
        <button class="btn btn--primary btn--sm" id="save-note" style="margin-top:12px">Save mentor note (audited)</button>
        <div class="xs muted" style="margin-top:8px">Saved notes are access-controlled by level and every read is logged. The guide owns the content; AI only prepared the brief.</div>`}
      </div></div>`;
  }

  function bindCapture(s) {
    const btn = document.getElementById("save-note");
    if (!btn) return;
    btn.onclick = () => {
      const text = document.getElementById("note-text").value.trim();
      if (!text) { c.toast("Write a summary first", "warn"); return; }
      const note = {
        Mentor_Note_ID: util.rid("MNT"), Contact_ID: s.Contact_ID, Relationship_Timeline_ID: "RTL-" + s.Contact_ID.replace("CNT-", ""),
        Author_Guide_ID: store.session.userId, Sensitive_Note_Access_Level: document.getElementById("note-level").value,
        Interest_Profile: "", Family_Concern_Flag: document.getElementById("f-family").checked, Career_Concern_Flag: document.getElementById("f-career").checked,
        Spiritual_Doubts: "", Capture_Method: document.getElementById("note-method").value, Note_Text: text, Date: util.now().slice(0, 10),
      };
      store.state.mentorNotes.push(note);
      store.audit("mentor_note_created (" + note.Sensitive_Note_Access_Level + ")", note.Mentor_Note_ID, { contactId: s.Contact_ID });
      store.commit();
      c.toast("Mentor note saved & audited", "success");
    };
  }

  FOLK.screens = S;
})(window.FOLK = window.FOLK || {});
