# WF-015 — Module Strategy & Architecture Note

**Module:** WF-015 FOLK Youth Cultivation (Multi-Center)
**Program:** AI for HKHT Seva — Hyderabad AI Revenue & Seva Growth Platform
**Status:** Architecture decision record (ADR) — separate module on a shared platform spine

---

## 1. Decision

**WF-015 will be built as a SEPARATE MODULE on a SHARED PLATFORM SPINE.**

It is explicitly **not** two other things:

- **Not merged into the WF-002/003/006 app.** FOLK youth cultivation has its own domain model (seeker journey, sadhana progression, mentor memory, Yatra readiness, dormant reactivation), its own user roles (FOLK heads, guides, presenters, sadhana coordinators), and its own multi-center/multi-node structure. Folding it into the Phase-1 app would bloat that app and couple two release cadences that should move independently.
- **Not a standalone silo.** FOLK does not get its own private copy of identity, CRM, auth, billing, content generation, or dashboards. Re-implementing those would fragment the contact graph, duplicate governance, and break cross-workflow intelligence (the whole point of "relationship intelligence, not isolated follow-up").

**The rule:** WF-015 *consumes* shared platform services through defined contracts and *owns* only the FOLK-specific surfaces on top. This is the same pattern every workflow module (WF-001, WF-013, etc.) will follow.

**Why this is the right call:** it preserves the brief's Day-1 mandate — "the first build may be small, but IDs, data contracts, approval gates, dashboards, and integration paths must be designed from Day 1" — while keeping FOLK shippable on its own timeline and ready for WF-013 multi-center replication.

---

## 2. The Shared Platform Spine (services WF-015 consumes)

| Shared service | What WF-015 gets from it | WF-015 does NOT |
|---|---|---|
| **Identity & CRM (WF-006)** | Root `Contact_ID` as canonical identity; contact graph, source attribution, relationship timeline, stage/status store. | Mint its own contact IDs or keep a private contact master. |
| **KCKE** | Source-grounded Krishna-conscious content, Prabhupada references, presentation/Q&A grounding for the Content Presentation Copilot. | Store contact/payment/attendance/task status in KCKE, or treat generic AI as a source of spiritual truth. |
| **Content Factory (WF-04)** | Production of talks, reading lists, follow-up content artifacts, campaign collateral. | Re-build a content pipeline inside FOLK. |
| **Media AI** | Reels, storyboards, presentation visuals, event/Yatra/festival media. | Use Media AI as CRM/ERP or as a doctrinal authority. |
| **Auth / Roles / Multi-Center** | Authentication, role-based access control, `Center_ID`/`Center_Node_ID` scoping, sensitive-note access levels. | Implement its own login or its own access-control scheme. |
| **Central Billing / ERP linkage** | Validated financial records (payments, receipts, approvals) referenced by ERP IDs only. | Hold real financial records — FOLK links `Payment_ID`/`Receipt_ID`/`Approval_ID`, it does not own them. |
| **Leadership Command Center (BI)** | BigQuery/Looker layer where FOLK dashboards surface alongside other workflows for leadership. | Maintain a parallel, disconnected reporting stack. |
| **Design System** | Shared UI components, dashboard tiles, interaction patterns, accessibility. | Fork a separate visual language. |

---

## 3. FOLK-Specific Surfaces WF-015 Owns

These are unique to FOLK and live in the WF-015 module:

- **Domain agents/copilots:** Seeker Journey, Program Follow-up, Sadhana Progress, Guide Support Copilot, Content Presentation Copilot, Yatra/Trip Interest, Data Quality, Management Intelligence, Field Outreach Prioritization, Dormant Contact Re-Activation.
- **FOLK extension fields** layered on the shared contact: `FOLK_Seeker_ID`, journey/stage fields, follow-up fields, **mentor memory** (`Mentor_Note_ID`, interest profile, spiritual/family/career concern flags, `Sensitive_Note_Access_Level`), sadhana/progression fields, trip/Yatra linkage.
- **FOLK workflow logic:** stage transitions, drop-off-risk scoring, interaction-frequency recommendation, Yatra readiness, dormant detection.
- **FOLK role surfaces & dashboards:** guide dashboard, center-head dashboard, FOLK slice of the leadership view, data-quality and AI-performance views.
- **The multi-CRM mapping layer** (Section 5) — FOLK-owned, because the source systems (DMT, FOLK CRM, Prabhupada World, sadhana tracker) are FOLK's to reconcile.

---

## 4. Integration Contracts Between WF-015 and Each Shared Service

Each interface is a stable contract, so either side can evolve independently. `[API: NV]` marks where access is still unconfirmed and a CSV/manual fallback applies.

| Interface | Direction | Contract (what crosses the boundary) | Fallback |
|---|---|---|---|
| **WF-015 ↔ Identity/CRM (WF-006)** | bidirectional | Resolve/extend on `Contact_ID`; read contact + timeline; write FOLK extension fields and stage/status updates. | CSV import keyed to `Contact_ID` `[API: NV]`. |
| **WF-015 → KCKE** | request/response | Query: audience + topic + interest profile → response: source-grounded outline/Q&A/reading list with citations. Read-only; no status written back. | Mock KCKE corpus for demo `[API: NV]`. |
| **WF-015 → Content Factory (WF-04)** | request | Content-generation job (brief + grounding refs) → returns content artifact ID. | Manual content creation. |
| **WF-015 → Media AI** | request | Media job (storyboard/reel/visual spec) → returns media asset ID. | Manual media. |
| **WF-015 ↔ Auth/Roles/Multi-Center** | enforced | Every request carries identity + role + `Center_ID`/`Center_Node_ID`; sensitive mentor notes gated by `Sensitive_Note_Access_Level`. | n/a (mandatory). |
| **WF-015 → Billing/ERP** | reference-only | Link ERP IDs (`Payment_ID`, `Receipt_ID`, `Approval_ID`); never store financial records. AI cannot finalize payment decisions. | Manual ID entry. |
| **WF-015 → Leadership Command Center (BigQuery/Looker)** | publish | Push FOLK metrics/flags to the shared BI layer for leadership/center-head dashboards. | Sheets/Looker for MVP. |
| **WF-015 → Design System** | consume | Use shared components/tiles/patterns. | n/a. |
| **WF-015 ↔ WF-001 (Trip/Yatra)** | future | Yatra readiness → trip enrollment linkage (`Trip_ID`/`Yatra_ID`). | Sample trip data (future). |

**Source-system mapping interfaces** (FOLK-owned mapping layer, see Section 5): DMT CRM, FOLK CRM/no-code app, Prabhupada World/LMS, sadhana tracker, plus signal sources WhatsApp/calls and Google Meet/Zoom — all `[API: NV]` with CSV/manual-upload fallbacks.

---

## 5. Multi-CRM Mapping Layer — Map, Don't Replace

The first architecture **maps and integrates** existing systems onto the shared `Contact_ID` rather than forcing a migration. Existing apps keep running; the mapping layer reconciles them.

How it works:

1. **Ingest** records from each source (DMT CRM leads, FOLK CRM/no-code app, Prabhupada World/LMS course data, sadhana tracker) via API or CSV fallback `[API: NV]`.
2. **Resolve identity** with the **Data Quality Agent**: deduplicate, fuzzy-match, and link each source record to a single root `Contact_ID`, producing a persistent **mapping table** (source key ↔ `Contact_ID`).
3. **Project** source fields into the FOLK data model — sadhana data lands in sadhana/progression fields **under sensitive access controls**; course data maps via `Course_ID`; DMT leads attach as journey entries.
4. **Govern** quality with a `Data_Quality_Score`, missing-field and unmapped-record reports, and human confirmation on ambiguous merges (data steward owns final mapping `[Owner: NV]`).

The source systems remain the operational tools their teams use today; WF-015 adds a unifying contact spine and intelligence layer on top — never a rip-and-replace.

---

## 6. Architecture Diagram

```
                          LEADERSHIP COMMAND CENTER (BigQuery / Looker)
                          ▲ FOLK metrics, flags, center-node health
                          │
┌─────────────────────────┴──────────────────────────────────────────────┐
│                      WF-015 FOLK YOUTH CULTIVATION  (separate module)     │
│                                                                          │
│  FOLK-OWNED SURFACES                                                      │
│   • Agents: Seeker Journey · Program Follow-up · Sadhana · Guide Copilot  │
│            Content Presentation · Yatra/Trip · Data Quality ·            │
│            Mgmt Intelligence · Field Outreach · Dormant Re-Activation     │
│   • FOLK fields: FOLK_Seeker_ID, journey, follow-up, mentor memory,      │
│                  sadhana/progression, trip/Yatra                          │
│   • FOLK dashboards: guide · center-head · data-quality · AI-performance  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │   MULTI-CRM MAPPING LAYER  (map, don't replace)                  │    │
│  │   Data Quality Agent → dedupe → mapping table (src ↔ Contact_ID) │    │
│  └───▲──────────▲──────────────▲──────────────▲────────────────────┘    │
│      │CSV/API   │CSV/API       │CSV/API       │CSV/API   [API: NV]       │
│   DMT CRM   FOLK CRM/app   Prabhupada World  Sadhana tracker             │
│                                  /LMS                                     │
└───────┬───────────┬───────────┬───────────┬───────────┬─────────────────┘
        │ Contact_ID│ KCKE      │ content   │ media     │ auth/roles/center
        ▼           ▼           ▼           ▼           ▼      + billing/ERP ref
┌──────────────────────────────────────────────────────────────────────────┐
│                      SHARED PLATFORM SPINE                                  │
│  Identity & CRM (WF-006) │ KCKE │ Content Factory (WF-04) │ Media AI │      │
│  Auth / Roles / Multi-Center │ Central Billing / ERP linkage │              │
│  Leadership Command Center (BI) │ Design System                             │
└──────────────────────────────────────────────────────────────────────────┘

Legend:  ▲▼ = contract interface   [API: NV] = access unconfirmed, CSV/manual fallback
Signal feeds (WhatsApp/calls, Google Meet/Zoom) enter via the mapping layer, [API: NV].
```

In words: source CRMs/apps feed the FOLK-owned **mapping layer**, which reconciles everything onto the shared `Contact_ID`. WF-015's agents and dashboards sit on top of that, while reaching **down** into the shared spine for identity, content, media, auth, billing, and BI through stable contracts — and pushing FOLK intelligence **up** into the Leadership Command Center.

---

## 7. Future Merge Path — One Platform Shell & WF-013 Replication

The module pattern is deliberately replication-ready:

- **One platform shell.** As more workflow modules ship (WF-001, WF-015, others), they all consume the same spine and the same design system, so they can be presented to users under a **single platform shell** — one login, one navigation, one command center — with each module as a tab/surface rather than a separate app. WF-015 is built to slot into that shell without rework.
- **WF-013 multi-center replication.** Because WF-015 keeps its FOLK config (center model types, standard fields, dashboard templates, training kit) cleanly separated from the shared spine, that configuration becomes a **replication package**: a new center or node is stood up by instantiating the FOLK module against the shared spine with its own `Center_ID`/`Center_Node_ID` — no new identity/auth/billing/BI build required. This is the "template design now → multi-center package in the 2-month architecture → implementation future" path.

The sequence is therefore: **build WF-015 as a separate module now → harden the shared contracts → package FOLK config for WF-013 → present all modules under one platform shell.** Each step is additive; none requires collapsing WF-015 into another app or breaking it out into a silo.

---

*This note records the architectural decision and its rationale. Integration access flags (`[API: NV]`, `[Owner: NV]`) mirror the WF-015 partner brief and must be confirmed before the corresponding contract goes live.*
