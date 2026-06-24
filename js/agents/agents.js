/* ============================================================================
   WF-015 FOLK — Domain agents & copilots (FOLK-owned surfaces)
   AI may draft / score / route / recommend. A HUMAN finalizes. Every output is
   a SUGGESTION carrying provenance; nothing here writes a final decision.
   Each agent simulates latency and explains its reasoning (explainability).
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, spine } = FOLK;

  const STAGE_ORDER = ["new_contact", "contacted", "attending", "reading_group", "sadhana_active", "seva_engaged", "potential_preacher"];

  /* ---- 1. Seeker Journey Agent ---- */
  const seekerJourney = {
    name: "Seeker Journey Agent",
    classify(seeker) {
      const att = seeker.Repeat_Attendance_Count;
      const sad = store.sadhanaFor(seeker.Contact_ID);
      let suggested = seeker.Current_Stage;
      const reasons = [];
      if (seeker.Current_Stage === "dormant") {
        return { suggested: "dormant", reasons: ["No activity for " + util.daysAgo(seeker.Last_Attendance_Date) + "d"], risk: "dormant_reengage" };
      }
      if (att >= 6 && sad && sad.Sadhana_Report_Status === "active") suggested = "sadhana_active";
      else if (att >= 2) suggested = "attending";
      else if (att >= 1 || seeker.First_Attendance_Date) suggested = "contacted";
      if (sad && sad.Potential_Preacher_Flag) { suggested = "potential_preacher"; reasons.push("Potential-preacher signal from sadhana"); }
      reasons.push(att + " repeat attendances");
      const idx = STAGE_ORDER.indexOf(suggested);
      const cur = STAGE_ORDER.indexOf(seeker.Current_Stage);
      return { suggested, reasons, advance: idx > cur };
    },
    risk(seeker) {
      const lastAtt = util.daysAgo(seeker.Last_Attendance_Date);
      const sad = store.sadhanaFor(seeker.Contact_ID);
      const fup = store.followupsFor(seeker.Contact_ID)[0];
      const noResp = fup ? fup.No_Response_Count : 0;
      let level = "none", reasons = [];
      if (seeker.Current_Stage === "dormant") { level = "dormant_reengage"; reasons.push("Dormant — long inactivity"); }
      else if ((lastAtt !== null && lastAtt > 45) || (sad && sad.Sadhana_Report_Status === "lapsed") || noResp >= 4) {
        level = "drop_off_high";
        if (sad && sad.Sadhana_Report_Status === "lapsed") reasons.push("Sadhana lapsed");
        if (lastAtt > 45) reasons.push("No attendance " + lastAtt + "d");
        if (noResp >= 4) reasons.push(noResp + " no-responses");
      } else if ((lastAtt !== null && lastAtt > 21) || noResp >= 2) {
        level = "drop_off_medium"; reasons.push("Engagement cooling");
      }
      return { level, reasons };
    },
    async run(seeker) {
      await util.delay(500);
      const cls = this.classify(seeker);
      const rk = this.risk(seeker);
      return {
        agent: this.name,
        stage: cls.suggested, stageChanged: cls.advance, stageReasons: cls.reasons,
        risk: rk.level, riskReasons: rk.reasons,
        nextAction: this.nextAction(seeker, rk),
        requires_human_approval: true,
      };
    },
    nextAction(seeker, rk) {
      if (rk.level === "drop_off_high") return "Personal guide call — pause automated reminders";
      if (rk.level === "drop_off_medium") return "Gentle check-in (no pressure)";
      if (seeker.Current_Stage === "new_contact") return "Welcome + invite to first program";
      if (seeker.Current_Stage === "attending") return "Invite to reading group";
      if (seeker.Current_Stage === "reading_group") return "Introduce daily sadhana";
      return "Maintain regular contact";
    },
  };

  /* ---- 2. Program Follow-up Agent (draft-only) ---- */
  const followup = {
    name: "Program Follow-up Agent",
    async draft(seeker, fup) {
      await util.delay(550);
      const n = seeker.Full_Name.split(" ")[0];
      const over = this.overContact(fup);
      let msg;
      if (over.flag) {
        msg = `Hari bol ${n} 🙏 No pressure at all — just letting you know we're always here whenever you'd like to drop by. Take your time.`;
      } else if (seeker.Current_Stage === "dormant") {
        msg = `Hari bol ${n} 🙏 It's been a while! We'd love to see you at the upcoming festival — warm, no obligation. Would you like details?`;
      } else if (fup && /reading group/i.test(fup.Next_Action)) {
        msg = `Hari bol ${n} 🙏 Our Tuesday reading group meets this week — we'd love to have you join. Shall I save you a seat?`;
      } else {
        msg = `Hari bol ${n} 🙏 Hope you're well! Wanted to personally invite you to our next program. Would that work for you?`;
      }
      return {
        agent: this.name,
        channel: fup ? fup.Followup_Channel : "whatsapp",
        message: msg,
        overContact: over,
        draft_only: true,
        requires_human_approval: over.flag || (fup && fup.Recommended_Frequency === "reduce_pause_auto"),
        note: "Draft only. A human reviews and sends — no auto-send until provider API confirmed [API: NV].",
      };
    },
    // Anti-over-contacting safeguard — recommends frequency, never blindly reminds.
    overContact(fup) {
      if (!fup) return { flag: false, reason: "" };
      if (fup.No_Response_Count >= 4 || fup.Recommended_Frequency === "reduce_pause_auto")
        return { flag: true, reason: `${fup.No_Response_Count} unanswered contacts — recommend pausing automation and a personal human touch instead.` };
      if (fup.No_Response_Count >= 2)
        return { flag: false, reason: "Reduce cadence to biweekly — approaching contact fatigue." };
      return { flag: false, reason: "" };
    },
  };

  /* ---- 3. Sadhana Progress Agent ---- */
  const sadhana = {
    name: "Sadhana Progress Agent",
    async run(contactId) {
      await util.delay(420);
      const s = store.sadhanaFor(contactId);
      if (!s) return { agent: this.name, gap: false, note: "No sadhana record yet." };
      const lapsed = s.Sadhana_Report_Status === "lapsed";
      const gapDays = util.daysAgo(s.Last_Sadhana_Report_Date);
      return {
        agent: this.name,
        gap: lapsed || gapDays > 14,
        potentialPreacher: s.Potential_Preacher_Flag,
        recommendation: lapsed
          ? "Gentle reminder appropriate — but frequency-aware; do not over-remind. Route to guide."
          : (s.Potential_Preacher_Flag ? "Strong, consistent sadhana — consider mentorship / seva leadership track." : "Healthy cadence — maintain."),
        requires_human_approval: lapsed,
      };
    },
  };

  /* ---- 4. Guide Support Copilot (human-approved; prepares only) ---- */
  const guideCopilot = {
    name: "Guide Support Copilot",
    async prep(contactId) {
      await util.delay(700);
      const s = store.seeker(contactId);
      const tl = store.timelineFor(contactId);
      const sad = store.sadhanaFor(contactId);
      const notesVisible = store.notesFor(contactId).filter((n) => spine.auth.canReadNote(n.Sensitive_Note_Access_Level));
      const rk = seekerJourney.risk(s);
      let tone = "warm, encouraging";
      if (rk.level === "drop_off_high") tone = "gentle, no-pressure, listen first";
      else if (notesVisible.some((n) => n.Family_Concern_Flag)) tone = "empathetic — be mindful of family pressure";
      return {
        agent: this.name,
        brief: [
          `${s.Full_Name} is at "${util.titleCase(s.Current_Stage)}", ${s.Repeat_Attendance_Count} attendances.`,
          tl.length ? `Recent: ${tl[tl.length - 1].what}` : "No timeline entries yet.",
          sad ? `Sadhana: ${sad.Chanting_Consistency}, ${sad.Rounds_Level} rounds (${sad.Sadhana_Report_Status}).` : "No sadhana data.",
        ],
        suggestedTone: tone,
        suggestedNextAction: seekerJourney.nextAction(s, rk),
        sensitiveFlags: notesVisible.filter((n) => n.Family_Concern_Flag || n.Career_Concern_Flag).map((n) => n.Family_Concern_Flag ? "family concern" : "career concern"),
        prepared_by_ai: true,
        note: "AI prepares only. The guide reviews mentor-approved notes and finalizes. Automatic recording / real-time coaching is out of scope [Scope: NV].",
      };
    },
  };

  /* ---- 5. Content Presentation Copilot (wraps KCKE seam) ---- */
  const contentPresentation = {
    name: "Content Presentation Copilot",
    search: (q) => spine.kcke.search(q),
    generate: (req) => spine.kcke.generate(req),
  };

  /* ---- 6. Yatra / Trip Interest Agent ---- */
  const yatra = {
    name: "Yatra/Trip Interest Agent",
    score(seeker) {
      const sad = store.sadhanaFor(seeker.Contact_ID);
      const trips = store.tripsFor(seeker.Contact_ID);
      let pts = 0;
      pts += Math.min(seeker.Repeat_Attendance_Count, 20) * 2;
      if (sad) pts += { none: 0, irregular: 5, steady: 12, strong: 20 }[sad.Chanting_Consistency] || 0;
      pts += (trips[0] ? trips[0].Past_Trip_Count : 0) * 6;
      const level = pts >= 45 ? "high" : pts >= 20 ? "medium" : "low";
      return { level, score: pts };
    },
    async recommend(seeker) {
      await util.delay(380);
      const sc = this.score(seeker);
      return {
        agent: this.name, level: sc.level, score: sc.score,
        invite: sc.level === "low" ? "Build engagement before inviting" : `Recommend invite to ${sc.level === "high" ? "Mayapur Yatra" : "a 1-day trip"}`,
        requires_human_approval: true,
        note: "Invite is a recommendation; a human approves before contact. Payment steps are ERP-referenced only.",
      };
    },
  };

  /* ---- 7. Data Quality Agent ---- */
  const dataQuality = {
    name: "Data Quality Agent",
    issues() {
      const dupes = [];
      const missing = [];
      store.state.seekers.forEach((s) => {
        if (!s.Email || /••/.test(s.Email)) { /* masked demo — skip */ }
        if (!s.First_Attendance_Date && s.Repeat_Attendance_Count > 0) missing.push({ Contact_ID: s.Contact_ID, field: "First_Attendance_Date" });
      });
      const needsReview = store.state.mapping.filter((m) => m.Mapping_Status === "needs_review");
      return { needsReview, missing, dupes };
    },
    async resolveMapping(mappingId) {
      await util.delay(300);
      const m = store.state.mapping.find((x) => x.Mapping_ID === mappingId);
      if (m) { m.Mapping_Status = "confirmed"; m.Match_Confidence = Math.max(m.Match_Confidence, 0.9); store.audit("mapping_merge_confirmed", mappingId, { contactId: m.Contact_ID }); }
      return m;
    },
    async importCSV(rows) {
      await util.delay(900);
      // mock: each row produces a mapping entry needing review
      const made = rows.map((r, i) => ({
        Mapping_ID: util.rid("MAP"),
        Contact_ID: r.Contact_ID || ("CNT-" + (200000 + i)),
        Source_System: r.Source_System || "FOLK_CRM",
        Source_Record_Key: r.key || ("csv_row_" + (i + 1)),
        Match_Confidence: r.Contact_ID ? 0.82 : 0.5,
        Mapping_Status: r.Contact_ID ? "auto" : "needs_review",
        Data_Quality_Score: r.Contact_ID ? 0.78 : 0.55,
      }));
      made.forEach((m) => store.state.mapping.unshift(m));
      store.audit("csv_import (" + made.length + " rows)", "mapping_layer", { actor: "Data Quality Agent", actorType: "agent" });
      return made;
    },
  };

  /* ---- 8. Management Intelligence Agent (BI rollups) ---- */
  const mgmtIntelligence = {
    name: "Management Intelligence Agent",
    rollup: (ss) => spine.bi.rollup(ss),
  };

  /* ---- 9. Field Outreach Prioritization Agent ---- */
  const fieldOutreach = {
    name: "Field Outreach Prioritization Agent",
    prioritize(fups) {
      return fups.slice().sort((a, b) => b.Priority - a.Priority);
    },
    // Score a field-outreach contact by likely responsiveness (college/hostel/room).
    score(sig) {
      let pts = 0;
      if (sig.Replied) pts += 50;
      if (sig.Opened) pts += 15;
      pts += Math.max(0, 35 - sig.Response_Latency_Hrs); // faster reply = higher
      const score = Math.max(0, Math.min(100, Math.round(pts)));
      return { score, tier: score >= 70 ? "high" : score >= 40 ? "medium" : "low" };
    },
    ranked() {
      return store.state.fieldSignals
        .filter((sig) => { const s = store.seeker(sig.Contact_ID); return s && store.inScope(s); })
        .map((sig) => ({ sig, ...this.score(sig) }))
        .sort((a, b) => b.score - a.score);
    },
  };

  /* ---- 10. Dormant Contact Re-Activation Agent ---- */
  const dormant = {
    name: "Dormant Re-Activation Agent",
    candidates() {
      return store.scopedSeekers().filter((s) => s.Current_Stage === "dormant" || s.AI_Risk_Flag === "dormant_reengage");
    },
    hook(seeker) {
      const notes = store.notesFor(seeker.Contact_ID);
      const restricted = notes.find((n) => n.Sensitive_Note_Access_Level === "restricted");
      if (restricted) return { hook: "Festival (sensitive re-approach)", owner: seeker.Primary_Guide_ID, care: "Sensitive past drop-off — gentle, guide-only, never mass automation." };
      return { hook: "Festival / course invitation", owner: seeker.Primary_Guide_ID, care: "Warm re-engagement; human approves." };
    },
  };

  FOLK.agents = {
    seekerJourney, followup, sadhana, guideCopilot, contentPresentation,
    yatra, dataQuality, mgmtIntelligence, fieldOutreach, dormant,
    STAGE_ORDER,
  };
})(window.FOLK = window.FOLK || {});
