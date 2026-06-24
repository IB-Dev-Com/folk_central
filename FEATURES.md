# Features — WF-015 FOLK Youth Cultivation Prototype

Feature → Screen → Status. Status legend: ✅ built (mock) · 🟡 partial · ⬜ not started.
Build tags (from the inventory): `D7` `D14` `D30` `2M` `FUT`.

> Prototype scope: mock interactions only, realistic mock data, simulated latency.
> The architecture (IDs, contracts, approval gates, dashboards) is production-shaped per the brief.

## Shared Platform Spine (consumed via clean interfaces)

| Service | Interface (mock) | Surfaced on | Status |
|---|---|---|---|
| Identity & CRM (WF-006) | `spine.identity.resolve/get/timeline/writeExtension` | Seeker 360, everywhere | ✅ |
| KCKE knowledge engine | `spine.kcke.search/generate` | Content Presentation Copilot | ✅ |
| Content Factory (WF-04) | `spine.contentFactory.submitJob/getJob` | Content Factory Request/Handoff | ✅ |
| Media AI | `spine.media.requestAsset/getAsset` | Content Factory Request/Handoff | ✅ |
| Auth / Roles / Multi-Center | `spine.auth.can/scope/sensitiveAccess` | Role switcher, gating | ✅ |
| Central API billing | `spine.billing.meter/usage` | Billing / ERP References | ✅ |
| Leadership Command Center (BI) | `spine.bi.rollup` | Dashboards | ✅ |
| Design System | tokens.css + components | All screens | ✅ |
| Multi-CRM mapping layer (FOLK) | `spine.mapping.table/confirm/importCSV` | Data-Quality Console | ✅ |

## FOLK Agents / Copilots

| Agent | Classification | Build tag | Screen(s) | Status |
|---|---|---|---|---|
| Seeker Journey | Agentic | D7→D30 | Seeker 360, Journey Board | ✅ |
| Program Follow-up | AI-assisted / Deterministic | D7/D14 | Follow-up Queue | ✅ |
| Sadhana Progress | Agentic / AI-assisted | D14/D30 | Sadhana Progress | ✅ |
| Guide Support Copilot | Human-approved | D30 | Guide Workspace, One-on-One Prep | ✅ |
| Content Presentation Copilot | AI-assisted + Human-approved | D7/FUT | Content Presentation Copilot | ✅ |
| Yatra / Trip Interest | AI-assisted | D14/D30 | Trip / Yatra Readiness | ✅ |
| Data Quality | Agentic (high priority) | D7/D14 | Data-Quality Console | ✅ |
| Management Intelligence | Dashboard-visible / Agentic | D14/D30 | Dashboards | ✅ |
| Field Outreach Prioritization | AI-assisted / Agentic | 2M | Field Outreach (responsiveness scoring) | ✅ |
| Dormant Contact Re-Activation | AI-assisted | 2M | Dormant Reactivation | ✅ |

> Every agent above is also surfaced in the **Agents & Automations Registry** with its purpose, automations,
> inputs, outputs, human-approval points, escalation logic, success metric, classification layer and build tag —
> and a **Run live** button that executes it against the mock data.

## Screens (31 total)

| # | Screen | Section | Build tag | Status |
|---|---|---|---|---|
| 1 | Role Dashboard (Home) | Home | D7 | ✅ |
| 2 | Seekers list + **Contact Intake** (deterministic) | People | D7 | ✅ |
| 3 | Seeker 360 | People | D7 | ✅ |
| 4 | Journey / Stage Board | People | D7 | ✅ |
| 5 | Dormant Reactivation | People | 2M | ✅ |
| 6 | Follow-up & Drop-off-Risk Queue | Engagement | D7 | ✅ |
| 7 | Field Outreach Prioritization | Engagement | 2M | ✅ |
| 8 | Program / Course / Reading-Group Attendance | Engagement | D14 | ✅ |
| 9 | Sadhana Progress | Engagement | D14 | ✅ |
| 10 | Trip / Yatra Readiness | Engagement | D30 | ✅ |
| 11 | Guide Workspace | Guide | D30 | ✅ |
| 12 | One-on-One Prep | Guide | D30 | ✅ |
| 13 | Content Presentation Copilot (KCKE) | Content | D7/FUT | ✅ |
| 14 | Content Factory Request / Handoff (WF-04) | Content | 2M | ✅ |
| 15 | FOLK Asset Library (brief→asset→approve closed) | Content | 2M | ✅ |
| 16 | Agents & Automations Registry (6 layers, runnable) | Intelligence | all | ✅ |
| 17 | KPI Scorecard (all KPI families) | Intelligence | all | ✅ |
| 18 | Center-Node Admin (+ WF-013 package) | Admin | D14 | ✅ |
| 19 | Data-Quality Console | Admin | D7 | ✅ |
| 20 | Integration / API Registry + Google Stack Mapping | Admin | 2M | ✅ |
| 21 | Roles & Access | Admin | D14 | ✅ |
| 22 | Billing / ERP References + API metering | Admin | D30 | ✅ |
| 23 | Approvals (human gate) | Governance | D14 | ✅ |
| 24 | Governance & Policy Center (AI can/cannot matrix) | Governance | all | ✅ |
| 25 | Audit Trail | Governance | D30 | ✅ |
| 26 | Leadership Dashboard (+ MI refresh) | Dashboards | D14 | ✅ |
| 27 | Center-Head Dashboard | Dashboards | D14 | ✅ |
| 28 | Guide Dashboard (in Guide Workspace) | Dashboards | D30 | ✅ |
| 29 | Data-Quality Dashboard | Dashboards | D7 | ✅ |
| 30 | AI-Performance Dashboard | Dashboards | 2M | ✅ |
| 31 | 2-Month Intelligence View | Dashboards | 2M | ✅ |

## Deterministic automations (Automated layer — no AI judgement)

| Automation | Where | Status |
|---|---|---|
| Contact intake | Seekers → New contact intake | ✅ |
| Source tagging | Contact intake + Seeker 360 | ✅ |
| Attendance capture | Attendance → Capture | ✅ |
| Duplicate / mapping detection | Data-Quality Console | ✅ |
| Follow-up task creation | Field Outreach + Contact intake | ✅ |
| Reminder creation | Follow-up Queue | ✅ |
| Dashboard refresh | Leadership (MI agent) | ✅ |
| Basic stage transitions | Journey Board → Approvals | ✅ |

## Six classification layers (brief §2) — all represented in the Agents Registry
Automated · AI-assisted · Agentic · Human-approved · Dashboard-visible · Platform-compatible ✅

## Cross-cutting

| Feature | Status |
|---|---|
| Center / Center-Node global switcher (scoping) | ✅ |
| Role switcher + role-based access control | ✅ |
| Sensitive mentor-note gating (standard/sensitive/restricted) + audit-on-read | ✅ |
| Approvals queue (approve / edit / reject with reason) | ✅ |
| Audit trail (immutable log, filterable) | ✅ |
| Follow-up frequency recommendation + over-contact safeguard | ✅ |
| Draft-only sends (human-approved) | ✅ |
| CSV-import fallback (mapping layer) | ✅ |
| Session-persistent state | ✅ |
| Simulated service latency | ✅ |
| Responsive + accessible (keyboard, ARIA, contrast) | ✅ |
