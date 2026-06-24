/* ============================================================================
   WF-015 FOLK — SHARED PLATFORM SPINE (mocked behind clean interfaces)
   Each service is an object with a documented contract. WF-015 consumes these;
   it never re-implements identity, auth, billing, content, media, or BI.
   All calls simulate latency + meter API usage so screens feel real.
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util } = FOLK;

  /* --------------------------------------------------------------------------
     Identity & CRM (WF-006) — root Contact_ID is canonical identity.
     FOLK writes only its extension fields back through this seam.
     ------------------------------------------------------------------------ */
  const identity = {
    async resolve(query) {
      await util.delay(280);
      const q = (query || "").toLowerCase();
      const hit = store.state.seekers.find(
        (s) => s.Contact_ID.toLowerCase() === q || s.Full_Name.toLowerCase().includes(q)
      );
      return hit
        ? { matched: true, Contact_ID: hit.Contact_ID, confidence: 0.97 }
        : { matched: false, Contact_ID: util.rid("CNT"), confidence: 0 };
    },
    get(contactId) { return store.seeker(contactId); },
    timeline(contactId) { return store.timelineFor(contactId); },
    // FOLK extension write-back (stage / next-action / risk) — audited.
    writeExtension(contactId, patch, opts = {}) {
      const s = store.seeker(contactId);
      if (!s) return;
      const before = {};
      Object.keys(patch).forEach((k) => (before[k] = s[k]));
      Object.assign(s, patch);
      store.audit(opts.action || "folk_extension_write", "CNT " + contactId, {
        contactId, actor: opts.actor, actorType: opts.actorType,
      });
    },
  };

  /* --------------------------------------------------------------------------
     KCKE knowledge engine — source-grounded content with citations.
     Read-only; FOLK never writes contact/payment/attendance status here.
     ------------------------------------------------------------------------ */
  const kcke = {
    async search({ topic, audience }) {
      await util.delay(360);
      bill("CND", "KCKE", 1);
      const t = (topic || "").toLowerCase();
      return store.state.kcke.filter(
        (k) =>
          (!topic || k.Topic.toLowerCase().includes(t) || k.Title.toLowerCase().includes(t)) &&
          (!audience || audience === "any" || k.Audience === audience)
      );
    },
    // Generate a grounded outline / Q&A / reading list from chosen KCKE items.
    async generate({ items, format, audience, topic }) {
      await util.delay(900);
      bill(store.session.nodeId, "KCKE", 3);
      const refs = items.map((i) => ({ id: i.KCKE_Item_ID, ref: i.Source_Reference, title: i.Title }));
      const made = buildGrounded(format, topic, audience, items);
      return {
        format, topic, audience,
        body: made,
        citations: refs,
        grounded: true,
        requires_human_approval: true, // public devotional content gate
        note: "Generated only from KCKE source-grounded items. A human must approve before public/devotional use.",
      };
    },
  };

  function buildGrounded(format, topic, audience, items) {
    const cite = (it) => `${it.Title} — *${it.Source_Reference}*`;
    if (format === "qa") {
      return items.slice(0, 3).map((it, i) => ({
        q: `Q${i + 1}. How does this apply to ${audience.replace(/_/g, " ")} facing "${topic}"?`,
        a: `Grounded in ${it.Source_Reference}: ${it.Title}. The verse teaches the principle directly; present it with a relatable example, then invite reflection.`,
        cite: cite(it),
      }));
    }
    if (format === "reading_list") {
      return items.map((it) => ({ item: cite(it), why: `Recommended for "${topic}" (${audience.replace(/_/g, " ")}).` }));
    }
    // outline
    return [
      { h: "Opening hook", p: `Connect "${topic}" to a daily-life situation ${audience.replace(/_/g, " ")} recognise.` },
      { h: "Core teaching", p: `Anchor on ${items[0] ? items[0].Source_Reference : "the chosen verse"} — ${items[0] ? items[0].Title : ""}.`, cite: items[0] ? cite(items[0]) : "" },
      { h: "Supporting points", p: items.slice(1).map((it) => cite(it)).join("; ") || "Add 1–2 supporting verses from KCKE." },
      { h: "Q&A readiness", p: "Anticipate doubts; keep answers source-grounded, never speculative." },
      { h: "Call to action", p: "Invite to the next reading group / program — no pressure." },
    ];
  }

  /* --------------------------------------------------------------------------
     Content Factory (WF-04) — creative brief → job → approved artifact.
     ------------------------------------------------------------------------ */
  const contentFactory = {
    async submitJob({ brief, groundingRefs, requestedBy, wantsMedia }) {
      await util.delay(700);
      bill(store.session.nodeId, "Content", 1);
      const job = {
        CF_Job_ID: util.rid("CF"),
        Requested_By: requestedBy,
        Brief: brief,
        Grounding_Refs: groundingRefs || [],
        Status: "requested",
        Artifact_ID: null,
        Media_Asset_ID: wantsMedia ? null : null,
        wantsMedia: !!wantsMedia,
        Requested_Date: util.now().slice(0, 10),
      };
      store.state.cfJobs.unshift(job);
      store.audit("content_factory_job_submitted", job.CF_Job_ID, { actor: requestedBy });
      return job;
    },
    // simulate WF-04 advancing the job
    async advance(jobId) {
      const job = store.state.cfJobs.find((j) => j.CF_Job_ID === jobId);
      if (!job) return null;
      await util.delay(600);
      if (job.Status === "requested") { job.Status = "in_production"; }
      else if (job.Status === "in_production") {
        job.Status = "delivered";
        job.Artifact_ID = util.rid("ART");
        bill(store.session.nodeId, "Content", 2);
        if (job.wantsMedia && !job.Media_Asset_ID) job.Media_Asset_ID = util.rid("MED");
      }
      store.audit("content_factory_status (" + job.Status + ")", jobId, { actor: "Content Factory (WF-04)", actorType: "agent" });
      return job;
    },
    getJob(id) { return store.state.cfJobs.find((j) => j.CF_Job_ID === id); },
  };

  /* --------------------------------------------------------------------------
     Media AI — storyboards / reels / visuals (human-approved).
     ------------------------------------------------------------------------ */
  const media = {
    async requestAsset({ spec, requestedBy }) {
      await util.delay(650);
      bill(store.session.nodeId, "Media", 1);
      const id = util.rid("MED");
      store.audit("media_asset_requested", id + " (" + spec + ")", { actor: requestedBy });
      return { Media_Asset_ID: id, spec, status: "storyboard_ready", requires_human_approval: true };
    },
  };

  /* --------------------------------------------------------------------------
     Auth / Roles / Multi-Center — every request carries identity + role +
     center scope; sensitive mentor notes gated by access level.
     ------------------------------------------------------------------------ */
  const ROLE_CAPS = {
    primary_guide:       { sensitive: "sensitive", canApprove: true,  crossCenter: false, label: "Primary Guide" },
    secondary_guide:     { sensitive: "standard",  canApprove: false, crossCenter: false, label: "Secondary Guide" },
    center_head:         { sensitive: "full",      canApprove: true,  crossCenter: false, label: "Center Head" },
    presenter:           { sensitive: "standard",  canApprove: false, crossCenter: false, label: "Presenter" },
    sadhana_coordinator: { sensitive: "sensitive", canApprove: false, crossCenter: false, label: "Sadhana Coordinator" },
    data_steward:        { sensitive: "full",      canApprove: false, crossCenter: true,  label: "Data Steward" },
    leadership:          { sensitive: "standard",  canApprove: true,  crossCenter: true,  label: "Leadership" },
  };
  const ACCESS_RANK = { standard: 1, sensitive: 2, restricted: 3, full: 99 };

  const auth = {
    caps() { return ROLE_CAPS[store.session.role] || ROLE_CAPS.primary_guide; },
    label() { return this.caps().label; },
    can(action) {
      const c = this.caps();
      if (action === "approve") return c.canApprove;
      if (action === "cross_center") return c.crossCenter;
      return true;
    },
    // can the current role read a mentor note at the given access level?
    canReadNote(noteLevel) {
      const grant = this.caps().sensitive; // standard | sensitive | full
      const need = ACCESS_RANK[noteLevel] || 1;
      const have = grant === "full" ? 99 : ACCESS_RANK[grant] || 1;
      return have >= need;
    },
  };

  /* --------------------------------------------------------------------------
     Central API billing — meter KCKE / Content / Media / voice per node.
     ------------------------------------------------------------------------ */
  function bill(nodeId, kind, units) {
    const node = (nodeId && nodeId !== "ALL") ? nodeId : store.session.nodeId;
    const target = (node && node !== "ALL") ? node : "CND-MUM-AND";
    let row = store.state.apiUsage.find((r) => r.Center_Node_ID === target);
    if (!row) { row = { Center_Node_ID: target, KCKE: 0, Content: 0, Media: 0, Voice: 0 }; store.state.apiUsage.push(row); }
    row[kind] = (row[kind] || 0) + units;
  }
  const billing = {
    meter: bill,
    usage() { return store.state.apiUsage; },
    prices() { return FOLK.seed.apiPrices; },
    cost(row) {
      const p = FOLK.seed.apiPrices;
      return row.KCKE * p.KCKE + row.Content * p.Content + row.Media * p.Media + row.Voice * p.Voice;
    },
    // ERP references — reference-only; FOLK never holds financial records.
    erpRefs(contactId) { return contactId ? store.erpFor(contactId) : store.state.erp; },
  };

  /* --------------------------------------------------------------------------
     Leadership Command Center (BI) — FOLK KPIs roll up here.
     ------------------------------------------------------------------------ */
  const bi = {
    rollup(scopeSeekers) {
      const ss = scopeSeekers || store.scopedSeekers();
      const ids = new Set(ss.map((s) => s.Contact_ID));
      const fups = store.state.followups.filter((f) => ids.has(f.Contact_ID));
      const overdue = fups.filter((f) => util.daysUntil(f.Next_Followup_Date) < 0).length;
      const atRisk = ss.filter((s) => /drop_off/.test(s.AI_Risk_Flag)).length;
      const dormant = ss.filter((s) => s.Current_Stage === "dormant").length;
      const preachers = ss.filter((s) => s.Current_Stage === "potential_preacher").length;
      const sadhanaGaps = store.state.sadhana.filter((x) => ids.has(x.Contact_ID) && x.Sadhana_Report_Status === "lapsed").length;
      const newThis = ss.filter((s) => util.daysAgo(s.First_Contact_Date) <= 30).length;
      const repeat = ss.filter((s) => s.Repeat_Attendance_Count >= 3).length;
      const mapScoped = store.state.mapping.filter((m) => ids.has(m.Contact_ID));
      const dqAvg = mapScoped.length ? mapScoped.reduce((a, m) => a + m.Data_Quality_Score, 0) / mapScoped.length : 0;
      const needsReview = mapScoped.filter((m) => m.Mapping_Status === "needs_review").length;
      return {
        total: ss.length, newThis, repeat, atRisk, dormant, preachers, sadhanaGaps,
        overdue, dqAvg, needsReview,
        pendingApprovals: store.pendingApprovals().length,
      };
    },
  };

  FOLK.spine = { identity, kcke, contentFactory, media, auth, billing, bi };
})(window.FOLK = window.FOLK || {});
