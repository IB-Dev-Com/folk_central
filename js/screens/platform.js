/* ============================================================================
   WF-015 FOLK — Platform-completeness surfaces:
   • Agents & Automations registry (six classification layers, runnable)
   • Field Outreach Prioritization
   • Integration / API Registry + Google Stack Mapping
   • FOLK Asset Library (brief → asset → approve loop closed)
   • KPI Scorecard (every KPI family)
   • Governance & Policy Center (AI can / cannot finalize matrix)
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, spine, agents, router } = FOLK;
  const esc = util.esc;
  const S = FOLK.screens = FOLK.screens || {};

  function page(title, sub, actions, body) {
    return `<div class="page">
      <div class="page__head"><div><div class="page__title">${esc(title)}</div><div class="page__sub">${sub}</div></div>
      <div class="spacer"></div><div class="page__actions">${actions || ""}</div></div>${body}</div>`;
  }

  /* ===========================================================================
     1. AGENTS & AUTOMATIONS REGISTRY
     =========================================================================== */
  const LAYERS = [
    { key: "Automated", tone: "info", desc: "Deterministic, rule-driven — no AI judgement.", caps: ["Contact intake", "Source tagging", "Attendance capture", "Duplicate detection", "Follow-up task creation", "Reminder creation", "Dashboard refresh", "Basic stage transitions"] },
    { key: "AI-assisted", tone: "ai", desc: "AI drafts / scores / suggests; a human decides.", caps: ["Follow-up drafting", "Stage classification", "Drop-off risk", "Guide meeting prep", "KCKE outlines", "Dormant suggestions", "Trip/Yatra readiness"] },
    { key: "Agentic", tone: "purple", desc: "Multi-step autonomous agents within guardrails.", caps: ["Seeker Journey", "Program Follow-up", "Sadhana Progress", "Data Quality", "Management Intelligence", "Field Outreach", "Dormant Contact"] },
    { key: "Human-approved", tone: "warn", desc: "AI may prepare but cannot finalize.", caps: ["Spiritual guidance", "Personal counseling", "Public devotional content", "Sensitive mentor notes", "Donor-sensitive comms", "Major role routing", "High-risk exceptions"] },
    { key: "Dashboard-visible", tone: "success", desc: "Surfaced as operational intelligence.", caps: ["Center-wise progress", "New/repeat contacts", "Sadhana gaps", "One-on-one gaps", "Drop-off risk", "Potential preachers", "Data quality", "Pending approvals"] },
    { key: "Platform-compatible", tone: "neutral", desc: "Cross-workflow architecture discipline.", caps: ["Common IDs", "Source tracking", "CRM continuity", "ERP-ready fields", "Integration contracts", "WF-013 replication", "BigQuery/Looker path"] },
  ];

  const REGISTRY = [
    { id: "seekerJourney", name: "Seeker Journey Agent", layer: "Agentic", tag: "D7→D30",
      purpose: "Track a youth from first contact to serious engagement and surface what should happen next.",
      automations: ["Ingests contact/attendance/source/follow-up/sadhana/mentor signals", "Computes current stage", "Proposes next action", "Raises AI_Risk_Flag", "Deterministic stage transition where unambiguous"],
      inputs: "Contact record, source, attendance history, follow-up dates, sadhana & mentor signals",
      outputs: "Current_Stage, Next_Action + Owner, AI_Risk_Flag",
      approval: "Stage changes & next actions are suggestions; guide/center-head confirms.",
      escalation: "Drop-off risk → assigned guide → center head → escalation owner",
      metric: "Stage/risk acceptance rate; overdue-follow-up reduction",
      demo: async () => { const s = store.seeker("CNT-100301"); const r = await agents.seekerJourney.run(s); return `risk <b>${r.risk}</b> · suggested stage <b>${util.titleCase(r.stage)}</b> · next: ${esc(r.nextAction)}`; } },
    { id: "followup", name: "Program Follow-up Agent", layer: "AI-assisted", tag: "D7/D14",
      purpose: "Generate human-approved follow-up drafts and tasks after touchpoints.",
      automations: ["Detects completed touchpoint", "Drafts contextual message", "Creates follow-up task (owner/channel/due)", "Frequency-aware over-contact safeguard"],
      inputs: "Event participation, channel, prior outcome/No_Response_Count, interest profile",
      outputs: "Draft message, follow-up task, updated Outcome after send",
      approval: "All drafts human-reviewed before send; no auto-send until provider API confirmed.",
      escalation: "Repeated non-response → guide/center head personal touch (not more reminders)",
      metric: "Draft acceptance; SLA adherence; response without over-contacting",
      demo: async () => { const s = store.seeker("CNT-100301"); const f = store.followupsFor("CNT-100301")[0]; const d = await agents.followup.draft(s, f); return `over-contact safeguard <b>${d.overContact.flag ? "TRIGGERED" : "clear"}</b> · draft: “${esc(d.message.slice(0, 60))}…”`; } },
    { id: "sadhana", name: "Sadhana Progress Agent", layer: "Agentic", tag: "D14/D30",
      purpose: "Track sadhana reports, chanting, ashram level, reading-group participation; flag gentle reminders.",
      automations: ["Ingests sadhana-tracker data", "Computes consistency/gaps", "Flags Potential_Preacher", "Proposes gentle, frequency-aware reminders"],
      inputs: "Report status, last report date, chanting consistency, rounds, ashram level, courses",
      outputs: "Sadhana gap flags, Potential_Preacher_Flag, frequency-aware reminder suggestions",
      approval: "Reminders recommended not automated; guide approves cadence per youth.",
      escalation: "Sustained drop-off feeds Seeker Journey risk + guide review",
      metric: "Report capture rate; gap-detection accuracy; preacher identification",
      demo: async () => { const r = await agents.sadhana.run("CNT-100301"); return `gap <b>${r.gap}</b> · ${esc(r.recommendation)}`; } },
    { id: "guideCopilot", name: "Guide Support Copilot", layer: "Human-approved", tag: "D30",
      purpose: "Prepare a guide before a one-on-one using timeline + mentor notes; suggest tone & next action.",
      automations: ["Assembles pre-meeting brief", "Suggests tone & next action", "Begins with manual/voice summaries — NOT auto recording"],
      inputs: "Relationship timeline, mentor notes (access-gated), recent attendance/sadhana",
      outputs: "Pre-meeting brief, suggested tone, next action, sensitive flags (per access level)",
      approval: "Uses mentor-approved notes + human review first; recording/real-time coaching needs explicit scope sign-off [Scope: NV].",
      escalation: "Sensitive spiritual/personal issues flagged to guide; never auto-resolved",
      metric: "Guide adoption; brief usefulness; trust preserved",
      demo: async () => { const b = await agents.guideCopilot.prep("CNT-100301"); return `tone <b>${esc(b.suggestedTone)}</b> · next: ${esc(b.suggestedNextAction)}`; } },
    { id: "contentPresentation", name: "Content Presentation Copilot", layer: "AI-assisted", tag: "D7/FUT",
      purpose: "Use KCKE to prepare source-grounded talks, outlines, Q&A, follow-up reading.",
      automations: ["Searches KCKE corpus", "Generates grounded outline/Q&A/reading list with citations"],
      inputs: "Audience, topic, KCKE source corpus, interest profile",
      outputs: "Source-grounded outline, Q&A, reading list — with citations",
      approval: "Public devotional content human-approved; generic AI must not produce spiritual content.",
      escalation: "Doctrinally uncertain content → human reviewer",
      metric: "Source-grounding accuracy; reviewer acceptance; presenter time saved",
      demo: async () => { const items = await spine.kcke.search({ topic: "attachment", audience: "college youth" }); return `KCKE returned <b>${items.length}</b> grounded source items with citations`; } },
    { id: "yatra", name: "Yatra / Trip Interest Agent", layer: "AI-assisted", tag: "D14/D30",
      purpose: "Identify youth ready for trips/Yatras and recommend a human-approved invite.",
      automations: ["Scores readiness from engagement + past trips + sadhana", "Recommends invite for human approval"],
      inputs: "Engagement/attendance, Past_Trip_Count, sadhana level, interest profile",
      outputs: "Yatra_Readiness_Level, recommended invite, trip linkage",
      approval: "Invites recommended only; human approves before contact.",
      escalation: "Payment/financial steps → ERP/finance owners, never finalized by AI",
      metric: "Invite acceptance / trip conversion; readiness accuracy",
      demo: async () => { const r = await agents.yatra.recommend(store.seeker("CNT-100271")); return `readiness <b>${r.level}</b> (score ${r.score}) · ${esc(r.invite)}`; } },
    { id: "dataQuality", name: "Data Quality Agent", layer: "Agentic", tag: "D7/D14 (high priority)",
      purpose: "Deduplicate, map cross-CRM contacts, find missing fields, source-tag, build Contact ID mapping.",
      automations: ["Duplicate detection", "Cross-CRM mapping to root Contact_ID", "Missing-field detection", "Automated source tagging", "Mapping-table generation", "CSV ingestion fallback"],
      inputs: "FOLK/DMT CRM, Prabhupada World/LMS, sadhana-tracker exports; raw/CSV",
      outputs: "Mapping table, dedupe results, Data_Quality_Score, missing/unmapped reports",
      approval: "Ambiguous merges flagged for human confirmation; data steward owns final mapping [Owner: NV].",
      escalation: "Persistent export errors / unresolved duplicates → data steward",
      metric: "Duplicate reduction; mapping coverage; quality-score improvement",
      demo: async () => { const iss = agents.dataQuality.issues(); return `<b>${iss.needsReview.length}</b> mappings need steward review · <b>${iss.missing.length}</b> missing-field flags`; } },
    { id: "mgmtIntelligence", name: "Management Intelligence Agent", layer: "Dashboard-visible", tag: "D14/D30",
      purpose: "Generate weekly center-head & leadership dashboards: progression, preachers, risk, data quality.",
      automations: ["Aggregates signals across centers/nodes", "Computes weekly progression & risk rollups", "Refreshes dashboards"],
      inputs: "All agent outputs, stage/risk flags, sadhana gaps, data-quality scores, center metadata",
      outputs: "Leadership + center-head dashboards, node health, preacher & risk rollups",
      approval: "Reporting layer; leadership interprets, AI doesn't finalize decisions/routing.",
      escalation: "Partner blockers + pending approvals surfaced as tiles for leadership",
      metric: "Dashboard usage in leadership cadence; decision turnaround",
      demo: async () => { const r = spine.bi.rollup(); return `rollup: <b>${r.total}</b> seekers · ${r.atRisk} at risk · ${r.preachers} preachers · ${util.pct(r.dqAvg)} data quality`; } },
    { id: "fieldOutreach", name: "Field Outreach Prioritization Agent", layer: "Agentic", tag: "2M",
      purpose: "For college/hostel/room outreach, identify high-response contacts and recommend early follow-up.",
      automations: ["Scores contacts by likely responsiveness", "Recommends prioritized early follow-up"],
      inputs: "Field outreach data (college/hostel/room), source detail, early-engagement signals",
      outputs: "Prioritized contact list, early follow-up recommendations",
      approval: "Recommendations only; field volunteers/guides decide actual outreach.",
      escalation: "Standard follow-up path (guide → center head)",
      metric: "Response rate of prioritized vs unprioritized; conversion to first attendance",
      demo: async () => { const r = agents.fieldOutreach.ranked(); return `top responder: <b>${r[0] ? store.seeker(r[0].sig.Contact_ID).Full_Name : "—"}</b> (score ${r[0] ? r[0].score : 0})`; } },
    { id: "dormant", name: "Dormant Contact Re-Activation Agent", layer: "AI-assisted", tag: "2M/FUT",
      purpose: "Surface older contacts ready to re-engage via festival, course, trip or mentor follow-up.",
      automations: ["Detects dormant contacts", "Matches re-engagement hook (festival/course/trip)", "Suggests mentor follow-up"],
      inputs: "Dormant_Status, No_Response_Count, last-attendance/follow-up dates, historical interest",
      outputs: "Reactivation candidate list, suggested hook/channel, suggested mentor follow-up",
      approval: "Suggestions only; mentor/guide approves re-contact to avoid pressure.",
      escalation: "Sensitive past drop-off (fear/family/guilt) handled with care via guide, not mass automation",
      metric: "Reactivation rate; re-attendance conversions",
      demo: async () => { const cands = agents.dormant.candidates(); return `<b>${cands.length}</b> dormant candidate(s) with gentle, guide-approved hooks`; } },
  ];

  S.agentsRegistry = {
    title: "Agents & Automations",
    render() {
      return page("Agents &amp; Automations Registry",
        "Every capability classified against the brief's six layers. AI drafts/scores/recommends; a human finalizes. Each agent below runs live against the mock data — provenance and approval points are explicit.",
        `<span class="badge badge--ai">10 agents</span>`,
        `<div class="card" style="margin-bottom:18px"><div class="card__head"><h3>Feature classification layers</h3></div><div class="card__body"><div class="grid grid--3">
          ${LAYERS.map((l) => `<div style="border:1px solid var(--c-border);border-radius:var(--r-md);padding:12px">
            <div class="row between">${c.badge(l.key, l.tone)}</div>
            <div class="xs muted" style="margin:6px 0">${esc(l.desc)}</div>
            <div class="tag-list">${l.caps.map((x) => `<span class="badge badge--neutral xs">${esc(x)}</span>`).join("")}</div>
          </div>`).join("")}
        </div></div></div>
        <div class="stack">${REGISTRY.map(agentCard).join("")}</div>`);
    },
    mount() {
      document.querySelectorAll("[data-run]").forEach((b) => b.onclick = async () => {
        const entry = REGISTRY.find((x) => x.id === b.dataset.run);
        const out = document.getElementById("run-" + entry.id);
        out.innerHTML = c.loading("Running " + entry.name + "…");
        try { out.innerHTML = c.aiBlock(entry.name + " — live output", `<div class="small">${await entry.demo()}</div><div class="xs muted" style="margin-top:6px">Output is a suggestion — routed through the human gate where required.</div>`); }
        catch (e) { out.innerHTML = `<div class="gov-banner warn">Run error: ${esc(e.message)}</div>`; }
      });
    },
  };

  function agentCard(a) {
    const tone = (LAYERS.find((l) => l.key === a.layer) || {}).tone || "neutral";
    return `<div class="card"><div class="card__body">
      <div class="row between">
        <div class="row" style="gap:8px"><b>${esc(a.name)}</b>${c.badge(a.layer, tone)}<span class="nv-flag">${esc(a.tag)}</span></div>
        <button class="btn btn--ai btn--sm" data-run="${a.id}">✦ Run live</button>
      </div>
      <div class="small" style="margin-top:6px">${esc(a.purpose)}</div>
      <div class="grid grid--2" style="margin-top:12px;gap:12px">
        <div><div class="xs muted" style="font-weight:700;text-transform:uppercase">Automations</div><ul style="margin:4px 0;padding-left:16px">${a.automations.map((x) => `<li class="small">${esc(x)}</li>`).join("")}</ul></div>
        <div class="stack stack--sm">
          <div><span class="xs muted">Inputs:</span> <span class="small">${esc(a.inputs)}</span></div>
          <div><span class="xs muted">Outputs:</span> <span class="small">${esc(a.outputs)}</span></div>
          <div><span class="xs muted">Human approval:</span> <span class="small">${esc(a.approval)}</span></div>
          <div><span class="xs muted">Escalation:</span> <span class="small">${esc(a.escalation)}</span></div>
          <div><span class="xs muted">Success metric:</span> <span class="small">${esc(a.metric)}</span></div>
        </div>
      </div>
      <div id="run-${a.id}" style="margin-top:10px"></div>
    </div></div>`;
  }

  /* ===========================================================================
     2. FIELD OUTREACH PRIORITIZATION
     =========================================================================== */
  S.fieldOutreach = {
    title: "Field Outreach Prioritization",
    render() {
      const ranked = agents.fieldOutreach.ranked();
      return page("Field Outreach Prioritization",
        "For college / hostel / room outreach, the agent scores contacts by likely responsiveness and recommends early follow-up. <b>Recommendations only</b> — field volunteers and guides decide actual outreach.",
        `<span class="badge badge--ai">✦ Agentic</span><span class="nv-flag">[Data: NV]</span>`,
        `<div class="card"><div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
          <thead><tr><th>Seeker</th><th>Outreach type</th><th>Channel</th><th>Opened</th><th>Replied</th><th>Latency</th><th class="num">Responsiveness</th><th>Priority</th><th></th></tr></thead>
          <tbody>${ranked.map(({ sig, score, tier }) => {
            const s = store.seeker(sig.Contact_ID);
            return `<tr>
              <td>${c.seekerLink(sig.Contact_ID)}<div class="xs muted">${c.idChip(sig.Contact_ID)}</div></td>
              <td class="small">${esc(util.titleCase(sig.Outreach_Type))}</td>
              <td class="small">${esc(util.titleCase(sig.Channel))}</td>
              <td>${sig.Opened ? "✓" : "—"}</td>
              <td>${sig.Replied ? c.badge("replied", "success") : c.badge("no reply", "neutral")}</td>
              <td class="small">${sig.Response_Latency_Hrs}h</td>
              <td class="num" style="width:120px">${c.bar(score / 100, score >= 70 ? "var(--c-success)" : score >= 40 ? "var(--c-warn)" : "#cbd2e0")}<span class="xs">${score}</span></td>
              <td>${c.badge(util.titleCase(tier) + " priority", tier === "high" ? "success" : tier === "medium" ? "warn" : "neutral")}</td>
              <td>${tier !== "low" ? `<button class="btn btn--primary btn--sm" data-fo="${sig.Contact_ID}">Recommend early follow-up</button>` : ""}</td>
            </tr>`;
          }).join("") || `<tr><td colspan="9">${c.empty("No field-outreach signals in scope")}</td></tr>`}</tbody>
        </table></div></div></div>`);
    },
    mount() {
      document.querySelectorAll("[data-fo]").forEach((b) => b.onclick = () => {
        const s = store.seeker(b.dataset.fo);
        store.state.followups.unshift({ Followup_ID: util.rid("FUP"), Contact_ID: s.Contact_ID, Last_Followup_Date: null, Next_Followup_Date: util.now().slice(0, 10), Next_Action: "Early outreach follow-up (high responsiveness)", Next_Action_Owner: s.Primary_Guide_ID, Followup_Channel: "whatsapp", Outcome: "pending", No_Response_Count: 0, Dormant_Status: "active", Recommended_Frequency: "weekly", Priority: 0.8 });
        store.audit("field_outreach_followup_created", s.Contact_ID, { actor: agents.fieldOutreach.name, actorType: "agent", contactId: s.Contact_ID });
        store.commit(); c.toast("Early follow-up task created for " + s.Full_Name, "success");
      });
    },
  };

  /* ===========================================================================
     3. INTEGRATION / API REGISTRY + GOOGLE STACK MAPPING
     =========================================================================== */
  const INTEGRATIONS = [
    { sys: "FOLK CRM / no-code app", dir: "bidirectional", contract: "Contact, source, stage, guide, attendance, follow-up (system of record)", fallback: "CSV upload", flag: "[API: NV]" },
    { sys: "DMT CRM", dir: "ingest", contract: "Leads → mapped to Contact_ID on entry to FOLK journey", fallback: "CSV lead export → manual map", flag: "[API: NV]" },
    { sys: "Prabhupada World / LMS", dir: "ingest", contract: "Course enrollment/attendance/completion via Course_ID/user → Contact_ID", fallback: "CSV/sample course data", flag: "[API: NV]" },
    { sys: "Sadhana tracker", dir: "ingest", contract: "Sadhana + ashram data (sensitive access controls)", fallback: "Manual field upload", flag: "[API: NV]" },
    { sys: "WhatsApp / calls", dir: "outbound", contract: "Human-approved drafts; no full API/voice until provider confirmed", fallback: "Draft-only → human-send", flag: "[API: NV]" },
    { sys: "Google Meet / Zoom", dir: "ingest", contract: "Meeting duration as enthusiasm signal", fallback: "Manual attendance upload", flag: "[API: NV]" },
    { sys: "KCKE", dir: "read-only", contract: "Source-grounded content + citations; no status written back", fallback: "Mock KCKE corpus", flag: "[API: NV]" },
    { sys: "Content Factory (WF-04)", dir: "request", contract: "Brief + grounding refs → artifact ID", fallback: "Manual content creation", flag: "—" },
    { sys: "Media AI", dir: "request", contract: "Reels/storyboards/visuals → media asset ID (human-approved)", fallback: "Manual media", flag: "—" },
    { sys: "Identity & CRM (WF-006)", dir: "bidirectional", contract: "Resolve/extend Contact_ID; read timeline; write FOLK extension fields", fallback: "CSV keyed to Contact_ID", flag: "[API: NV]" },
    { sys: "Central Billing / ERP", dir: "reference-only", contract: "Link Payment/Receipt/Approval/Donation IDs; never store financials", fallback: "Manual ID entry", flag: "—" },
    { sys: "BigQuery / Looker (BI)", dir: "publish", contract: "Push FOLK metrics/flags to leadership BI layer", fallback: "Sheets/Looker for MVP", flag: "—" },
    { sys: "ClickUp / task layer", dir: "optional", contract: "Execution/task governance if HKHT confirms use", fallback: "Sheets/manual tracking", flag: "[API: NV]" },
    { sys: "WF-001 (Trip/Yatra)", dir: "future", contract: "Yatra readiness → trip enrollment (Trip_ID/Yatra_ID)", fallback: "Sample trip data", flag: "future" },
    { sys: "WF-013 (replication)", dir: "config", contract: "FOLK config templates, center models, dashboards, training kit", fallback: "Template design now", flag: "2M/future" },
  ];

  const GSTACK = [
    { product: "Gemini Enterprise", use: "Internal drafting, summaries, data explanation, productivity copilots, Workspace search", agents: "Follow-up, Guide Copilot, Content Presentation" },
    { product: "Vertex AI / Agent Builder", use: "Production multi-step agentic routing, predictions, relationship intelligence", agents: "Seeker Journey, Sadhana, Data Quality, Yatra, Field Outreach, Dormant" },
    { product: "BigQuery / Looker Studio", use: "Production analytics + leadership dashboards", agents: "Management Intelligence, all dashboards" },
    { product: "Apps Script / AppSheet / Sheets", use: "Lightweight intake, CSV fallback, MVP dashboards", agents: "Data Quality (CSV), Attendance upload" },
    { product: "Cloud Run / Workflows", use: "Orchestration, scheduled jobs, integration glue", agents: "Mapping ingestion, dashboard refresh, content job advance" },
  ];

  S.integrations = {
    title: "Integration / API Registry",
    render() {
      return page("Integration / API Registry &amp; Google Stack Mapping",
        "Every shared-service seam as a stable contract with direction, fallback and validation flag — so either side can evolve independently. Plus the Google stack mapping the partner must deliver.",
        `<span class="seam-chip">all seams</span>`,
        `<div class="card" style="margin-bottom:18px"><div class="card__head"><h3>Integration contracts</h3><div class="spacer"></div><span class="muted small">${INTEGRATIONS.filter((i) => i.flag.includes("NV")).length} unconfirmed → fallback applies</span></div>
          <div class="card__body card__body--flush"><div class="scroll-x"><table class="table">
            <thead><tr><th>System / seam</th><th>Direction</th><th>Contract (what crosses)</th><th>Fallback</th><th>Flag</th></tr></thead>
            <tbody>${INTEGRATIONS.map((i) => `<tr>
              <td><b>${esc(i.sys)}</b></td>
              <td>${c.badge(i.dir, "info")}</td>
              <td class="small">${esc(i.contract)}</td>
              <td class="small muted">${esc(i.fallback)}</td>
              <td>${i.flag === "—" ? `<span class="badge badge--success xs">live-ready</span>` : c.nv(i.flag)}</td>
            </tr>`).join("")}</tbody>
          </table></div></div></div>
        <div class="card"><div class="card__head"><h3>Google stack mapping</h3></div>
          <div class="card__body card__body--flush"><table class="table">
            <thead><tr><th>Google product</th><th>Use in WF-015</th><th>Agents / features</th></tr></thead>
            <tbody>${GSTACK.map((g) => `<tr><td><b>${esc(g.product)}</b></td><td class="small">${esc(g.use)}</td><td class="small muted">${esc(g.agents)}</td></tr>`).join("")}</tbody>
          </table></div></div>`);
    },
  };

  /* ===========================================================================
     4. FOLK ASSET LIBRARY (brief → asset → approve loop closed)
     =========================================================================== */
  S.assets = {
    title: "FOLK Asset Library",
    render() {
      const assets = store.state.assets;
      const jobs = store.state.cfJobs;
      return page("FOLK Asset Library",
        "Approved assets returned from the Content Factory (WF-04) and Media AI land here. The brief → asset → approval handoff is shown end-to-end; only human-approved assets are published to the library.",
        `<span class="seam-chip">WF-04</span><span class="seam-chip">MEDIA</span>`,
        `<div class="grid grid--kpi" style="margin-bottom:16px">
          ${c.kpi({ label: "Approved assets", value: assets.length, sub: "in library", icon: "✓" })}
          ${c.kpi({ label: "Jobs in production", value: jobs.filter((j) => j.Status === "in_production").length, sub: "WF-04" })}
          ${c.kpi({ label: "Awaiting approval", value: store.state.approvals.filter((a) => a.Item_Type === "public_content" && a.Status === "pending").length, tone: "down", sub: "public content gate" })}
        </div>
        <div class="card" style="margin-bottom:16px"><div class="card__head"><h3>Approved assets</h3></div><div class="card__body">
          ${assets.length ? `<div class="grid grid--3">${assets.map((a) => `<div style="border:1px solid var(--c-border);border-radius:var(--r-md);overflow:hidden">
            <div style="height:90px;background:linear-gradient(135deg,var(--c-saffron-200),var(--c-saffron-400));display:grid;place-items:center;font-size:30px">${a.Asset_Type === "deck" ? "🖺" : a.Asset_Type === "reel" ? "▶" : "📄"}</div>
            <div style="padding:10px"><div class="small"><b>${esc(a.Title)}</b></div>
              <div class="xs muted" style="margin:4px 0">${c.idChip(a.Asset_ID)} ${a.Media_Asset_ID ? c.idChip(a.Media_Asset_ID) : ""}</div>
              <div class="tag-list">${(a.Grounding_Refs || []).map((r) => `<span class="badge badge--info xs">${esc(r)}</span>`).join("")}</div>
              <div class="xs muted" style="margin-top:6px">${c.badge("approved", "success")} by ${esc(c.guideName(a.Approved_By))} · ${esc(a.Approved_Date)}</div>
            </div></div>`).join("")}</div>` : c.empty("No approved assets yet — approve public content to publish here", "✦")}
        </div></div>
        <div class="card"><div class="card__head"><h3>Content Factory pipeline</h3><div class="spacer"></div><button class="btn btn--sm" onclick="location.hash='#/factory'">Open handoff →</button></div>
          <div class="card__body card__body--flush"><table class="table">
            <thead><tr><th>Job</th><th>Brief</th><th>Grounding</th><th>Status</th><th>Artifact / Media</th></tr></thead>
            <tbody>${jobs.map((j) => `<tr><td>${c.idChip(j.CF_Job_ID)}</td><td class="small">${esc(j.Brief)}</td><td class="small">${(j.Grounding_Refs || []).join(", ") || "—"}</td><td>${c.badge(util.titleCase(j.Status), j.Status === "delivered" ? "success" : j.Status === "in_production" ? "warn" : "neutral")}</td><td>${j.Artifact_ID ? c.idChip(j.Artifact_ID) : "—"} ${j.Media_Asset_ID ? c.idChip(j.Media_Asset_ID) : ""}</td></tr>`).join("")}</tbody>
          </table></div></div>`);
    },
  };

  /* ===========================================================================
     5. KPI SCORECARD (every KPI family from the inventory)
     =========================================================================== */
  S.kpis = {
    title: "KPI Scorecard",
    render() {
      const ss = store.scopedSeekers();
      const ids = new Set(ss.map((s) => s.Contact_ID));
      const r = spine.bi.rollup(ss);
      const att = store.state.attendance.filter((a) => ids.has(a.Contact_ID));
      const online = att.filter((a) => a.Mode === "online").length, offline = att.filter((a) => a.Mode === "offline").length;
      const sadhanaActive = store.state.sadhana.filter((x) => ids.has(x.Contact_ID) && x.Sadhana_Report_Status === "active").length;
      const sadhanaTotal = store.state.sadhana.filter((x) => ids.has(x.Contact_ID)).length;
      const trips = store.state.trips.filter((t) => ids.has(t.Contact_ID));
      const highReady = trips.filter((t) => t.Yatra_Readiness_Level === "high").length;
      const approvals = store.state.approvals;
      const resolved = approvals.filter((a) => a.Status !== "pending");
      const families = [
        { name: "Coverage & data health", kpis: [
          ["Contact ID mapping coverage", util.pct(store.state.mapping.filter((m) => m.Mapping_Status !== "needs_review").length / store.state.mapping.length)],
          ["Avg Data_Quality_Score", util.pct(r.dqAvg)],
          ["Unmapped / needs-review", String(r.needsReview)],
          ["Duplicate reduction", "—/mock"],
        ]},
        { name: "Engagement", kpis: [
          ["New contacts (30d)", String(r.newThis)],
          ["Repeat attenders (≥3)", String(r.repeat)],
          ["Online→offline conversion", util.pct(offline / (att.length || 1))],
          ["Seva-engaged", String(ss.filter((s) => s.Seva_Engagement_Status !== "none").length)],
        ]},
        { name: "Cultivation", kpis: [
          ["Potential preachers", String(r.preachers)],
          ["Sadhana-report capture", util.pct(sadhanaActive / (sadhanaTotal || 1))],
          ["Stage progression (mock)", "62%"],
          ["Sadhana-gap (lapsed)", String(r.sadhanaGaps)],
        ]},
        { name: "Risk & care", kpis: [
          ["Drop-off risk flagged", String(r.atRisk)],
          ["Overdue follow-ups", String(r.overdue)],
          ["Over-contact safeguards", String(store.state.followups.filter((f) => f.No_Response_Count >= 4).length)],
          ["One-on-one gap (mock)", "3"],
        ]},
        { name: "Conversion", kpis: [
          ["Yatra/trip high-readiness", String(highReady)],
          ["Invite acceptance (mock)", "71%"],
          ["Dormant reactivation rate", "—/mock"],
          ["Dormant in scope", String(r.dormant)],
        ]},
        { name: "AI performance", kpis: [
          ["Suggestions (audit, agent)", String(store.state.audit.filter((a) => a.Actor_Type === "agent").length)],
          ["Approved / edited", String(resolved.filter((a) => a.Status !== "rejected").length)],
          ["Draft acceptance (mock)", "82%"],
          ["Unresolved escalations", String(store.pendingApprovals().length)],
        ]},
        { name: "Governance", kpis: [
          ["Audit-trail entries", String(store.state.audit.length)],
          ["Approval turnaround (mock)", "< 1 day"],
          ["Routing processes validated", String(store.state.routing.length)],
          ["Sensitive-note reads logged", String(store.state.audit.filter((a) => /mentor_note_read/.test(a.Action)).length)],
        ]},
      ];
      return page("KPI Scorecard",
        "Every KPI family from the inventory, computed live from the scoped mock data. Real-data figures land when HKHT supplies anonymized exports; the schema and IDs are already production-shaped. " + c.nv("[Data: NV]"),
        `<span class="seam-chip">BI</span>`,
        `<div class="grid grid--2">${families.map((f) => `<div class="card"><div class="card__head"><h3>${esc(f.name)}</h3></div><div class="card__body">
          <div class="grid grid--2" style="gap:10px">${f.kpis.map(([k, v]) => `<div style="border:1px solid var(--c-border);border-radius:var(--r-sm);padding:10px"><div class="xs muted">${esc(k)}</div><div style="font-size:var(--fs-xl);font-weight:700">${esc(v)}</div></div>`).join("")}</div>
        </div></div>`).join("")}</div>`);
    },
  };

  /* ===========================================================================
     6. GOVERNANCE & POLICY CENTER (AI can / cannot finalize matrix)
     =========================================================================== */
  S.governanceCenter = {
    title: "Governance & Policy",
    render() {
      const audit = store.state.audit;
      return page("Governance &amp; Policy Center",
        "The guardrails that make this safe for spiritual cultivation: what AI may do, what it can never finalize, the sensitive-access model, routing validation and the audit guarantee.",
        `<span class="seam-chip">AUTH</span><button class="btn btn--sm" onclick="location.hash='#/audit'">Audit Trail →</button>`,
        `<div class="grid grid--2">
          <div class="card"><div class="card__head"><h3>✅ AI can do</h3></div><div class="card__body"><ul style="margin:0;padding-left:18px">
            ${["Draft messages", "Classify stage", "Summarize timeline", "Score risk / readiness", "Recommend follow-up frequency", "Route & alert", "Prepare dashboards", "Propose next action"].map((x) => `<li class="small" style="margin-bottom:4px">${esc(x)}</li>`).join("")}
          </ul></div></div>
          <div class="card" style="border-color:var(--c-danger-bg)"><div class="card__head"><h3>⛔ AI cannot finalize</h3></div><div class="card__body"><ul style="margin:0;padding-left:18px">
            ${["Sensitive spiritual guidance", "Personal counseling", "Public devotional / philosophical content", "Donor-sensitive messages", "Financial / payment / receipt decisions", "High-risk exceptions", "Major role routing"].map((x) => `<li class="small" style="margin-bottom:4px">${esc(x)}</li>`).join("")}
          </ul><div class="xs muted" style="margin-top:8px">All of these route to the Approvals human gate.</div></div></div>
        </div>
        <div style="height:16px"></div>
        <div class="grid grid--2">
          <div class="card"><div class="card__head"><h3>Sensitive access model</h3></div><div class="card__body stack stack--sm">
            <div class="row between"><span>${c.badge("standard", "neutral")}</span><span class="small">assigned guide + coordinators</span></div>
            <div class="row between"><span>${c.badge("sensitive", "purple")}</span><span class="small">assigned guide + center-head</span></div>
            <div class="row between"><span>${c.badge("restricted", "danger")}</span><span class="small">center-head / full only</span></div>
            <div class="divider"></div>
            <div class="xs muted">Every read of a sensitive note is audited. Switch role in the top bar to see gating live on Seeker 360.</div>
          </div></div>
          <div class="card"><div class="card__head"><h3>Guardrails in force</h3></div><div class="card__body stack stack--sm">
            <div class="row between"><span class="small">Draft-only sends (no auto-send)</span>${c.badge("on", "success")}</div>
            <div class="row between"><span class="small">Over-contact safeguard (frequency-aware)</span>${c.badge("on", "success")}</div>
            <div class="row between"><span class="small">Human-approved public content</span>${c.badge("on", "success")}</div>
            <div class="row between"><span class="small">Recording / real-time coaching</span><span class="nv-flag">[Scope: NV] off</span></div>
            <div class="row between"><span class="small">Routing validation before automation</span><span class="nv-flag">[Owner: NV]</span></div>
          </div></div>
        </div>
        <div style="height:16px"></div>
        ${c.govBanner("Audit guarantee: " + audit.length + " entries logged this session. Every AI suggestion, human approval, follow-up, stage change and sensitive-note access is recorded immutably with actor, entity and timestamp.")}`);
    },
  };

  FOLK.screens = S;
})(window.FOLK = window.FOLK || {});
