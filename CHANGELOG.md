# Changelog — WF-015 FOLK Youth Cultivation Prototype

All notable changes to this prototype are recorded here.
This is a **prototype for developer handoff** — mock interactions only, no real backend.

## [0.2.0] — 2026-06-24 — Full-coverage pass (every feature, no priority filter)

### Added — 7 new screens (24 → 31) for total requirement coverage

- **Agents & Automations Registry** (`/agents`): all 10 agents with purpose, automations, inputs, outputs,
  human-approval points, escalation logic, success metric, classification and build tag — each with a
  **Run live** button that executes the real agent against the mock data. Includes the brief's six
  classification layers (Automated · AI-assisted · Agentic · Human-approved · Dashboard-visible · Platform-compatible).
- **Field Outreach Prioritization** (`/field-outreach`): responsiveness scoring for college/hostel/room
  outreach signals; recommends early follow-up (creates a task — recommendation only).
- **Integration / API Registry + Google Stack Mapping** (`/admin/integrations`): every shared-service seam
  as a contract (direction, what crosses, fallback, NV flag) plus the Gemini/Vertex/BigQuery-Looker/AppSheet/Cloud-Run mapping.
- **FOLK Asset Library** (`/assets`): approved Content Factory / Media AI assets land here; the
  brief → asset → approval handoff is closed end-to-end (approving public content publishes an asset).
- **KPI Scorecard** (`/kpis`): every KPI family from the inventory computed live from scoped mock data
  (coverage/data-health, engagement, cultivation, risk & care, conversion, AI performance, governance).
- **Governance & Policy Center** (`/governance`): the AI-can / AI-cannot-finalize matrix, sensitive-access
  model, guardrails in force, and the audit guarantee in one place.

### Added — deterministic automations (Automated layer)
- **Contact intake**: resolves identity on the CRM spine, source-tags, creates a `FOLK_Seeker` at
  `new_contact`, a confirmed mapping row, a timeline entry and a welcome follow-up task — all audited.
- **Dashboard refresh**: Management Intelligence Agent refresh action on the Leadership dashboard.
- Follow-up task creation now also reachable from Field Outreach.

### Changed / fixed
- Store now **backfills missing state keys** on load, so older persisted sessions migrate cleanly when
  new entities (assets, field signals) are added.
- Seed data extended: FOLK Asset Library seed, field-outreach responsiveness signals.
- Navigation reorganized: new **Intelligence** rail group; Integration Registry, Asset Library and
  Governance & Policy added to their sections.

### Verified
- All 31 routes render with **zero console errors**; all 10 agent Run-live outputs produce results;
  content-approval → asset-library loop confirmed (assets 1 → 2 on approval); sensitive-note gating,
  over-contact safeguard, approvals-apply and audit logging all confirmed via runtime checks.

## [0.1.0] — 2026-06-24

### Added — Initial autonomous build (all phases D7 → 2M screens)

**Platform spine & shell**
- Single-page application shell reusing the shared design-system pattern (top bar + left rail + content).
- Client-side hash router with session-persistent navigation and state (`sessionStorage`).
- Global Center / Center-Node switcher (`Center_ID` / `Center_Node_ID`) scoping every screen.
- Role switcher (guide / center-head / leadership / data-steward / presenter) driving role-based access and dashboards.
- Shared mock-data store with audit logging, approvals queue, and pub/sub re-render.

**Shared services (mocked behind clean interfaces)**
- Identity & CRM spine (WF-006): resolve/attach `Contact_ID`, relationship timeline, source attribution.
- KCKE knowledge engine: source-grounded outline / Q&A / reading-list generation with citations.
- Content Factory (WF-04): creative-brief → job → delivered artifact handoff with approval.
- Media AI: storyboard / reel / visual jobs (human-approved).
- Auth / roles / multi-center scoping with sensitive-note access levels.
- Central API billing: per center-node metering of KCKE / Content / Media / voice usage.
- Leadership Command Center (BI): FOLK KPI rollups.
- Multi-CRM mapping layer (FOLK-owned): source-key ↔ `Contact_ID` with CSV-import fallback.

**FOLK domain agents / copilots**
- Seeker Journey, Program Follow-up, Sadhana Progress, Guide Support Copilot,
  Content Presentation Copilot, Yatra/Trip Interest, Data Quality, Management Intelligence,
  Field Outreach Prioritization, Dormant Contact Re-Activation.

**Screens (24)**
- Home: Role Dashboard, Leadership / Center-Head / Guide / Data-Quality / AI-Performance / 2-Month Intelligence dashboards.
- People: Seeker 360 (gated mentor memory), Journey / Stage Board (drag to propose), Dormant Reactivation.
- Engagement: Follow-up & Drop-off-Risk Queue (draft-only, over-contact safeguard), Attendance, Sadhana Progress, Trip / Yatra Readiness.
- Guide: Guide Workspace, One-on-One Prep (manual / voice-note capture).
- Content: Content Presentation Copilot (KCKE), Content Factory Request / Handoff (WF-04 + Media AI).
- Admin: Center-Node Admin, Data-Quality Console, Roles & Access, Billing / ERP References + API metering.
- Governance: Approvals (human gate), Audit Trail.

**Governance**
- Every AI suggestion, approval, stage change, mentor-note read, and task logged to the audit trail.
- Sensitive mentor notes gated by `Sensitive_Note_Access_Level` (standard / sensitive / restricted).
- AI drafts/scores/recommends; a human finalizes spiritual guidance, sensitive sends, and public content.
- AI recommends follow-up frequency and flags over-contacting — never blindly auto-reminds.
- Simulated latency on all service calls so screens feel real.
