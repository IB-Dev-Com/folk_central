# WF-015 — Screen Map / Information Architecture

**Module:** WF-015 FOLK Youth Cultivation (Multi-Center) — prototype
**Companion docs:** WF-015 Feature & Automation Inventory; WF-015 Module Strategy & Architecture Note
**Purpose:** Define every screen the FOLK prototype needs, how a user navigates between them, which features/agents live on each, and which shared-platform-spine seam each screen touches.

**Shared-service seam legend** (from the architecture note):

- `ID/CRM` — Identity & CRM (WF-006), root `Contact_ID`
- `KCKE` — source-grounded content
- `WF-04` — Content Factory
- `MEDIA` — Media AI
- `AUTH` — Auth / Roles / Multi-Center scoping
- `BILL` — Central Billing / ERP linkage (reference only)
- `BI` — Leadership Command Center (BigQuery/Looker)
- `DS` — Design System
- `MAP` — FOLK-owned multi-CRM mapping layer
- `[API: NV]` / `[Owner: NV]` / `[Scope: NV]` — access/owner/scope unconfirmed

---

## 1. Navigation Model

The prototype runs inside the future **single platform shell** as the "FOLK" module. Left-rail primary navigation, role-scoped by `AUTH`. Center context (`Center_ID` / `Center_Node_ID`) is a global switcher in the top bar, so every screen is filtered to the selected node unless the role grants cross-center view.

```
TOP BAR:  [Platform Shell ▸ FOLK]   [Center/Node switcher ▾]   [Search Contact_ID]   [Approvals ●]   [User/role ▾]

LEFT RAIL (role-scoped):
  ┌── HOME
  │     • Role Dashboard (guide / center-head / leadership / data-quality / AI-performance)
  ├── PEOPLE
  │     • Seeker 360
  │     • Journey / Stage Board
  │     • Dormant Reactivation
  ├── ENGAGEMENT
  │     • Follow-up & Drop-off-Risk Queue
  │     • Program / Course / Reading-Group Attendance
  │     • Sadhana Progress
  │     • Trip / Yatra Readiness
  ├── GUIDE
  │     • Guide Workspace
  │       └─ One-on-One Prep (drill-in)
  ├── CONTENT
  │     • Content Presentation Copilot (KCKE)
  │     • Content Factory Request / Handoff (WF-04)
  ├── ADMIN
  │     • Center-Node Admin
  │     • Data-Quality Console
  │     • Roles & Access
  │     • Billing / ERP References
  └── GOVERNANCE
        • Approvals
        • Audit Trail
```

**Primary drill-in pattern:** any `Contact_ID` anywhere (queue, board, dashboard, attendance) opens **Seeker 360** as a slide-over/detail page. Any contact's guide context opens **One-on-One Prep**. This keeps the seeker record the hub of navigation.

---

## 2. Screen-by-Screen Specification

### HOME

#### 2.1 Role Dashboard (Home)
- **Who:** all roles; content differs by role (guide / center-head / leadership / data-quality / AI-performance).
- **Lives here:** the role's headline tiles and "what needs me now" (pending approvals, overdue follow-ups, new risk flags). Entry point into deeper dashboards (Section "Dashboards").
- **Features/agents:** Management Intelligence Agent (rollups), surfaced flags from all agents.
- **Navigates to:** Seeker 360, Follow-up Queue, Approvals, the full dashboards.
- **Seams:** `BI`, `AUTH`, `DS`.

### PEOPLE

#### 2.2 Seeker 360
- **Who:** guides, center-heads, coordinators (sensitive sections gated).
- **Lives here:** the complete seeker record — identity header (`Contact_ID`, `FOLK_Seeker_ID`, `Center_Node_ID`, guides), source attribution, relationship timeline, current stage + history, follow-up history, sadhana panel, trip/Yatra panel, **mentor-memory panel (access-gated)**, ERP reference chips (payments/receipts, read-only).
- **Features/agents:** Seeker Journey Agent (stage + next action + risk), links to all other agents acting on this contact.
- **Navigates to:** One-on-One Prep, Follow-up Queue (this contact), Attendance, Sadhana, Trip/Yatra.
- **Seams:** `ID/CRM` (read contact + timeline; write FOLK extension fields), `AUTH` (mentor-note access level), `BILL` (ERP ID chips, reference-only), `MAP` (shows which source systems contributed), `DS`.

#### 2.3 Journey / Stage Board
- **Who:** guides, center-heads.
- **Lives here:** Kanban-style board of seekers by `Current_Stage` (first contact → attending → reading-group → sadhana → seva → potential preacher, etc.); drag = propose stage change (human-confirmed). Risk badges on cards.
- **Features/agents:** Seeker Journey Agent (stage classification, `AI_Risk_Flag`).
- **Navigates to:** Seeker 360 (card click), Follow-up Queue.
- **Seams:** `ID/CRM`, `AUTH`, `DS`. Stage changes write to `ID/CRM` and log to Audit.

#### 2.4 Dormant Reactivation
- **Who:** center-heads, guides.
- **Lives here:** list of dormant contacts (`Dormant_Status`) with a suggested re-engagement hook (festival/course/trip/mentor) and suggested owner; approve-to-act.
- **Features/agents:** Dormant Contact Re-Activation Agent (suggestions only).
- **Navigates to:** Seeker 360, Approvals.
- **Seams:** `ID/CRM`, `KCKE`/`WF-04` (if a content hook is generated), `AUTH`, `DS`.

### ENGAGEMENT

#### 2.5 Follow-up & Drop-off-Risk Queue
- **Who:** guides, callers, coordinators.
- **Lives here:** prioritized worklist of follow-ups due + drop-off-risk flags; each item shows AI-drafted message (editable), channel, owner, due date; **draft-only send** (human approves). Frequency-aware: flags over-contacting.
- **Features/agents:** Program Follow-up Agent (drafts/tasks), Seeker Journey Agent (risk), Field Outreach Prioritization Agent (priority order).
- **Navigates to:** Seeker 360, Approvals (for sensitive sends), One-on-One Prep.
- **Seams:** `ID/CRM`, WhatsApp/calls `[API: NV]` (draft-only fallback → human-send), `AUTH`, `DS`. All sends/edits logged to Audit.

#### 2.6 Program / Course / Reading-Group Attendance
- **Who:** sadhana/attendance coordinators, presenters.
- **Lives here:** attendance capture for weekend/daily programs, online reading groups, webinars, courses; repeat-attendance counts; online-to-offline conversion view. Manual upload + CSV fallback.
- **Features/agents:** deterministic attendance capture; feeds Seeker Journey + Management Intelligence.
- **Navigates to:** Seeker 360, Journey Board.
- **Seams:** `MAP` (Prabhupada World/LMS course data `[API: NV]`), `ID/CRM`, Google Meet/Zoom duration as enthusiasm signal `[API: NV]` (manual upload fallback), `DS`.

#### 2.7 Sadhana Progress
- **Who:** sadhana coordinators, guides (gated).
- **Lives here:** sadhana report status, chanting consistency, rounds, ashram level, reading-group participation; sadhana-gap flags; `Potential_Preacher_Flag`; frequency-aware gentle-reminder suggestions.
- **Features/agents:** Sadhana Progress Agent.
- **Navigates to:** Seeker 360, Follow-up Queue.
- **Seams:** `MAP` (sadhana tracker ingest with **sensitive access controls** `[API: NV]`), `ID/CRM`, `AUTH`, `DS`.

#### 2.8 Trip / Yatra Readiness
- **Who:** center-heads, guides, trip coordinators.
- **Lives here:** ranked list of seekers by `Yatra_Readiness_Level` with past-trip history; recommended **human-approved** invite; trip linkage chips. Payment steps are ERP-referenced only.
- **Features/agents:** Yatra/Trip Interest Agent. Future link to WF-001.
- **Navigates to:** Seeker 360, Approvals.
- **Seams:** `ID/CRM`, `BILL` (`Payment_ID`/`Payment_Status` reference-only), WF-001 (future), `DS`.

### GUIDE

#### 2.9 Guide Workspace
- **Who:** guides (own assigned youth); center-heads (oversight).
- **Lives here:** my assigned seekers, each with current stage, last contact, suggested tone, sensitive flags (gated), next action, recent attendance/sadhana signals. The guide's daily cockpit.
- **Features/agents:** Guide Support Copilot (summaries/tone), Seeker Journey Agent.
- **Navigates to:** One-on-One Prep, Seeker 360, Follow-up Queue.
- **Seams:** `ID/CRM`, `AUTH` (`Sensitive_Note_Access_Level`), `DS`.

#### 2.10 One-on-One Prep (drill-in of Guide Workspace / Seeker 360)
- **Who:** assigned guide.
- **Lives here:** pre-meeting brief assembled from relationship timeline + **mentor-approved notes**; suggested tone + next action; **voice-note / manual mentor-summary capture** (NOT automatic conversation recording).
- **Features/agents:** Guide Support Copilot — *human-approved layer; AI prepares only*.
- **Governance:** recording/real-time coaching is out of scope without explicit sign-off `[Scope: NV]`.
- **Navigates to:** Seeker 360, Approvals (if sensitive action proposed).
- **Seams:** `ID/CRM`, `AUTH`, `DS`. Mentor-note writes are access-controlled + audited.

### CONTENT

#### 2.11 Content Presentation Copilot (KCKE)
- **Who:** presenters, guides.
- **Lives here:** generate source-grounded talk outlines, Q&A, follow-up reading for a chosen audience + topic; citations to Prabhupada/KCKE sources; **human approval** before public/devotional use.
- **Features/agents:** Content Presentation Copilot.
- **Boundary:** read-only from KCKE; no contact/payment/attendance status written to KCKE; generic AI must not generate spiritual content.
- **Navigates to:** Content Factory Request (to produce final collateral), Approvals.
- **Seams:** `KCKE` `[API: NV]` (mock corpus fallback for demo), `AUTH`, `DS`.

#### 2.12 Content Factory Request / Handoff (WF-04)
- **Who:** presenters, content coordinators.
- **Lives here:** submit a content-generation job (brief + grounding refs from KCKE) to WF-04; track job status; receive returned artifact ID; request media assets.
- **Features/agents:** consumes Content Factory + Media AI.
- **Boundary:** Media AI for reels/storyboards/visuals only — not CRM/ERP/doctrinal authority.
- **Navigates to:** Content Presentation Copilot, Approvals.
- **Seams:** `WF-04`, `MEDIA`, `KCKE` (grounding refs), `DS`.

### ADMIN

#### 2.13 Center-Node Admin
- **Who:** center-heads, platform admins.
- **Lives here:** manage `Center_ID` / `Center_Node_ID` structure (centralized vs. distributed city-node), node metadata, program/course catalog per node, guide assignments. Basis for WF-013 replication config.
- **Features/agents:** none (config); feeds all scoping.
- **Navigates to:** Roles & Access, Dashboards.
- **Seams:** `AUTH` (center scoping), `ID/CRM`, `DS`.

#### 2.14 Data-Quality Console
- **Who:** data steward `[Owner: NV]`, admins.
- **Lives here:** duplicates, missing fields, unmapped records, stale contacts, source gaps, CRM export errors; the cross-CRM **mapping table** (source key ↔ `Contact_ID`); human-confirm ambiguous merges; `Data_Quality_Score`.
- **Features/agents:** Data Quality Agent (high priority).
- **Navigates to:** Seeker 360, Center-Node Admin.
- **Seams:** `MAP` (DMT / FOLK CRM / Prabhupada World / sadhana tracker — all `[API: NV]`, CSV fallback), `ID/CRM`, `DS`.

#### 2.15 Roles & Access
- **Who:** platform admins, center-heads.
- **Lives here:** role assignment, center scoping, and **sensitive mentor-note access levels** (`Sensitive_Note_Access_Level`); routing matrix (owner/performer/approver/backup/escalation/reviewer/data steward).
- **Governance:** routing must be validated before automation goes live `[Owner: NV]`.
- **Navigates to:** Approvals, Audit.
- **Seams:** `AUTH`, `DS`.

#### 2.16 Billing / ERP References
- **Who:** center-heads, finance-linked roles (read).
- **Lives here:** read-only view of linked ERP IDs (`Donation_ID`, `Payment_ID`, `Receipt_ID`, `Approval_ID`) tied to trips/Yatras/events. **No financial records stored or finalized here.**
- **Navigates to:** Trip/Yatra Readiness, Seeker 360.
- **Seams:** `BILL` (reference-only), `DS`.

### GOVERNANCE

#### 2.17 Approvals
- **Who:** approvers per routing matrix.
- **Lives here:** unified queue of items awaiting human decision — sensitive sends, stage changes flagged sensitive, dormant re-contact, Yatra invites, public/devotional content, donor-sensitive messages. Approve / edit / reject with reason.
- **Governance:** AI **cannot finalize** these; this screen is the human gate.
- **Navigates to:** the originating screen + Seeker 360; writes to Audit.
- **Seams:** `AUTH`, `ID/CRM`, `DS`.

#### 2.18 Audit Trail
- **Who:** admins, leadership, data steward.
- **Lives here:** immutable log of all AI suggestions, human approvals, follow-up tasks, stage changes, mentor-note access events; filter by `Contact_ID`, user, center, date.
- **Navigates to:** any referenced record.
- **Seams:** `AUTH`, `ID/CRM`, `DS`.

### DASHBOARDS (within Home / dedicated views)

#### 2.19 Leadership Dashboard
- Center-wise active/new contacts, repeat attendance, potential preachers, drop-off risk, overdue follow-ups, data quality, partner blockers. **Seams:** `BI`, `AUTH`.

#### 2.20 Center-Head Dashboard
- Center-node health, lead-source quality, program attendance, online-to-offline conversion, sadhana gaps, one-on-ones overdue, trip/Yatra readiness. **Seams:** `BI`, `AUTH`.

#### 2.21 Guide Dashboard
- (Surfaced in Guide Workspace) assigned youth, stage, last contact, suggested tone, sensitive flags, next action, recent signals. **Seams:** `BI`, `AUTH`.

#### 2.22 Data-Quality Dashboard
- Duplicates, missing fields, unmapped records, stale contacts, source gaps, export errors. **Seams:** `BI`, `MAP`.

#### 2.23 AI-Performance Dashboard
- Suggestions generated/approved, false alerts, draft acceptance, unresolved escalations `[Data: NV]`. **Seams:** `BI`.

#### 2.24 2-Month Intelligence View
- Trend/progression insights; early prediction readiness for drop-off, serious engagement, Yatra/trip conversion (`2M`). **Seams:** `BI`.

---

## 3. Screen → Feature → Seam Matrix (quick reference)

| Screen | Primary agent/feature | Key seams | Flags |
|---|---|---|---|
| Role Dashboard | Management Intelligence | BI, AUTH, DS | — |
| Seeker 360 | Seeker Journey | ID/CRM, AUTH, BILL, MAP | — |
| Journey / Stage Board | Seeker Journey | ID/CRM, AUTH | — |
| Dormant Reactivation | Dormant Contact Agent | ID/CRM, KCKE/WF-04, AUTH | — |
| Follow-up & Risk Queue | Program Follow-up + Risk + Field Outreach | ID/CRM, WhatsApp/calls, AUTH | `[API: NV]` |
| Attendance | deterministic capture | MAP, ID/CRM, Meet/Zoom | `[API: NV]` |
| Sadhana Progress | Sadhana Progress | MAP, ID/CRM, AUTH | `[API: NV]` |
| Trip / Yatra Readiness | Yatra/Trip Interest | ID/CRM, BILL, WF-001(future) | — |
| Guide Workspace | Guide Support Copilot | ID/CRM, AUTH | — |
| One-on-One Prep | Guide Support Copilot | ID/CRM, AUTH | `[Scope: NV]` |
| Content Presentation Copilot | Content Presentation Copilot | KCKE, AUTH | `[API: NV]` |
| Content Factory Request | WF-04 + Media AI | WF-04, MEDIA, KCKE | — |
| Center-Node Admin | config | AUTH, ID/CRM | — |
| Data-Quality Console | Data Quality Agent | MAP, ID/CRM | `[API: NV]` `[Owner: NV]` |
| Roles & Access | config / routing matrix | AUTH | `[Owner: NV]` |
| Billing / ERP References | reference-only | BILL | — |
| Approvals | human gate (all agents) | AUTH, ID/CRM | — |
| Audit Trail | logging | AUTH, ID/CRM | — |
| Dashboards (×6) | Management Intelligence | BI, AUTH, MAP | `[Data: NV]` |

---

## 4. Prototype Build Priority (mapped to phase plan)

- **Day-7 demo screens:** Seeker 360, Journey/Stage Board, Follow-up & Risk Queue (draft-only), Data-Quality Console, one Dashboard mock, Center-Node switcher. (Mock/sample data.)
- **Day-14 MVP screens:** add Attendance, Sadhana Progress, Center-Head Dashboard, Approvals, Roles & Access (basic). (1–2 center nodes.)
- **Day-30 base screens:** add Guide Workspace + One-on-One Prep (manual/voice notes), Audit Trail, Trip/Yatra Readiness, Billing/ERP references.
- **2-Month / future:** Content Presentation Copilot (if KCKE access), Content Factory handoff, Dormant Reactivation, Field-outreach prioritization surfacing, 2-Month Intelligence View; WF-013 replication config in Center-Node Admin.
