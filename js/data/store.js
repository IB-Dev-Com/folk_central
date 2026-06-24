/* ============================================================================
   WF-015 FOLK — Shared mock-data store
   Session-persistent state, audit logging, approvals, pub/sub re-render.
   This stands in for the platform's shared persistence; FOLK owns the FOLK
   surfaces and reads/writes shared entities through the spine services.
   ========================================================================== */
(function (FOLK) {
  "use strict";

  const KEY = "wf015_state_v1";
  const SESS_KEY = "wf015_session_v1";
  const listeners = new Set();
  let auditSeq = 99005;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function freshState() {
    const s = FOLK.seed;
    return {
      seekers: clone(s.seekers),
      timeline: clone(s.timeline),
      followups: clone(s.followups),
      sadhana: clone(s.sadhana),
      mentorNotes: clone(s.mentorNotes),
      attendance: clone(s.attendance),
      trips: clone(s.trips),
      mapping: clone(s.mapping),
      erp: clone(s.erp),
      kcke: clone(s.kcke),
      cfJobs: clone(s.cfJobs),
      approvals: clone(s.approvals),
      audit: clone(s.audit),
      catalog: clone(s.catalog),
      routing: clone(s.routing),
      apiUsage: clone(s.apiUsage),
      assets: clone(s.assets),
      fieldSignals: clone(s.fieldSignals),
    };
  }

  function load() {
    const fresh = freshState();
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // backfill any keys added since this session was first persisted
        Object.keys(fresh).forEach((k) => { if (saved[k] === undefined) saved[k] = fresh[k]; });
        return saved;
      }
    } catch (e) { /* ignore */ }
    return fresh;
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {
      // current acting user (drives AUTH / role-based access)
      userId: "GID-014",
      role: "primary_guide",
      // global center / node scope
      centerId: "ALL",
      nodeId: "ALL",
    };
  }

  const Store = {
    state: load(),
    session: loadSession(),

    persist() {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(this.state));
        sessionStorage.setItem(SESS_KEY, JSON.stringify(this.session));
      } catch (e) { /* quota / private mode — non-fatal for a prototype */ }
    },

    reset() {
      this.state = freshState();
      this.session = loadSession();
      this.persist();
      this.notify();
    },

    /* ---- pub/sub ---- */
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    notify() { listeners.forEach((fn) => fn(this.state, this.session)); },
    commit() { this.persist(); this.notify(); },

    /* ---- session helpers ---- */
    setSession(patch) { Object.assign(this.session, patch); this.commit(); },

    /* ---- lookups ---- */
    seeker(id) { return this.state.seekers.find((x) => x.Contact_ID === id); },
    guide(id) { return FOLK.seed.guides.find((g) => g.Guide_ID === id); },
    node(id) { return FOLK.seed.nodes.find((n) => n.Center_Node_ID === id); },
    center(id) { return FOLK.seed.centers.find((c) => c.Center_ID === id); },
    sadhanaFor(id) { return this.state.sadhana.find((x) => x.Contact_ID === id); },
    tripsFor(id) { return this.state.trips.filter((x) => x.Contact_ID === id); },
    erpFor(id) { return this.state.erp.filter((x) => x.Contact_ID === id); },
    timelineFor(id) { const t = this.state.timeline.find((x) => x.Contact_ID === id); return t ? t.entries : []; },
    notesFor(id) { return this.state.mentorNotes.filter((x) => x.Contact_ID === id); },
    followupsFor(id) { return this.state.followups.filter((x) => x.Contact_ID === id); },
    attendanceFor(id) { return this.state.attendance.filter((x) => x.Contact_ID === id); },
    mappingFor(id) { return this.state.mapping.filter((x) => x.Contact_ID === id); },

    /* ---- scope: filter a list of records by the active center/node ---- */
    inScope(rec) {
      const { centerId, nodeId } = this.session;
      const node = rec.Center_Node_ID;
      const center = rec.Center_ID;
      if (nodeId !== "ALL") return node === nodeId;
      if (centerId !== "ALL") {
        if (center) return center === centerId;
        const n = this.node(node);
        return n && n.Center_ID === centerId;
      }
      return true;
    },
    scopedSeekers() { return this.state.seekers.filter((s) => this.inScope(s)); },

    /* ---- audit (immutable append) ---- */
    audit(action, entityRef, opts = {}) {
      auditSeq += 1;
      const entry = {
        Audit_ID: "AUD-" + auditSeq,
        Actor: opts.actor || this.session.userId,
        Actor_Type: opts.actorType || "user",
        Action: action,
        Entity_Ref: entityRef,
        Center_Node_ID: opts.node || (this.seeker(opts.contactId || "") || {}).Center_Node_ID || this.session.nodeId,
        Timestamp: FOLK.util ? FOLK.util.now() : new Date().toISOString().slice(0, 16).replace("T", " "),
      };
      this.state.audit.unshift(entry);
      return entry;
    },

    /* ---- approvals ---- */
    addApproval(appr) {
      this.state.approvals.unshift(appr);
      this.audit("approval_requested (" + appr.Item_Type + ")", appr.Item_Ref, { actor: appr.Requested_By, actorType: "agent", contactId: appr.Contact_ID });
    },
    resolveApproval(id, status, reason) {
      const a = this.state.approvals.find((x) => x.Approval_ID === id);
      if (!a) return;
      a.Status = status;
      a.Reason = reason || a.Reason;
      a.Approver_ID = this.session.userId;
      a.Timestamp = FOLK.util.now();
      this.audit("approval_" + status, id, { contactId: a.Contact_ID });
      this.commit();
    },

    addAsset(asset) {
      this.state.assets.unshift(asset);
      this.audit("asset_added_to_library", asset.Asset_ID, { actor: asset.Approved_By });
    },

    pendingApprovals() {
      return this.state.approvals.filter((a) => a.Status === "pending" && (a.Contact_ID ? this.inScope(this.seeker(a.Contact_ID) || {}) : true));
    },
  };

  FOLK.store = Store;
})(window.FOLK = window.FOLK || {});
