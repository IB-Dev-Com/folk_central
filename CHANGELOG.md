# Changelog — WF-015 FOLK Youth Cultivation Prototype

All notable changes to this prototype are recorded here.
This is a **prototype for developer handoff** — mock interactions only, no real backend.

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
