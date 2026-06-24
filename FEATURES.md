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
| Field Outreach Prioritization | AI-assisted / Agentic | 2M | Follow-up Queue (priority) | ✅ |
| Dormant Contact Re-Activation | AI-assisted | 2M | Dormant Reactivation | ✅ |

## Screens

| # | Screen | Section | Build tag | Status |
|---|---|---|---|---|
| 1 | Role Dashboard (Home) | Home | D7 | ✅ |
| 2 | Seeker 360 | People | D7 | ✅ |
| 3 | Journey / Stage Board | People | D7 | ✅ |
| 4 | Dormant Reactivation | People | 2M | ✅ |
| 5 | Follow-up & Drop-off-Risk Queue | Engagement | D7 | ✅ |
| 6 | Program / Course / Reading-Group Attendance | Engagement | D14 | ✅ |
| 7 | Sadhana Progress | Engagement | D14 | ✅ |
| 8 | Trip / Yatra Readiness | Engagement | D30 | ✅ |
| 9 | Guide Workspace | Guide | D30 | ✅ |
| 10 | One-on-One Prep | Guide | D30 | ✅ |
| 11 | Content Presentation Copilot (KCKE) | Content | D7/FUT | ✅ |
| 12 | Content Factory Request / Handoff (WF-04) | Content | 2M | ✅ |
| 13 | Center-Node Admin | Admin | D14 | ✅ |
| 14 | Data-Quality Console | Admin | D7 | ✅ |
| 15 | Roles & Access | Admin | D14 | ✅ |
| 16 | Billing / ERP References + API metering | Admin | D30 | ✅ |
| 17 | Approvals (human gate) | Governance | D14 | ✅ |
| 18 | Audit Trail | Governance | D30 | ✅ |
| 19 | Leadership Dashboard | Dashboards | D14 | ✅ |
| 20 | Center-Head Dashboard | Dashboards | D14 | ✅ |
| 21 | Guide Dashboard | Dashboards | D30 | ✅ |
| 22 | Data-Quality Dashboard | Dashboards | D7 | ✅ |
| 23 | AI-Performance Dashboard | Dashboards | 2M | ✅ |
| 24 | 2-Month Intelligence View | Dashboards | 2M | ✅ |

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
