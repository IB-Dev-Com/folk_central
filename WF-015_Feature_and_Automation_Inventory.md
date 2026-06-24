# WF-015 — FOLK Youth Cultivation: Feature & Automation Inventory

**Module:** WF-015 FOLK Youth Cultivation (Multi-Center)
**Program:** AI for HKHT Seva — Hyderabad AI Revenue & Seva Growth Platform
**Source brief:** WF-015 Google / Implementation Partner Brief, Multi-Center Updated Version
**Source basis:** Earlier WF-015 blueprint + revised 30-Day Production Brief + Mumbai FOLK transcript + Google Partner Scope Alignment Note + Gap Analysis + Important Upgrades documents
**Core rule:** *The current workflow is evidence of today's reality, not the target design.*
**Positioning:** Production-shaped, multi-center FOLK relationship-intelligence module — not a standalone FOLK app or generic chatbot. The first build may be small, but IDs, data contracts, approval gates, dashboards, and integration paths must be designed from Day 1.

**Validation-flag legend** (carried from the brief, used throughout this inventory):

- `[API: NV]` — API / connector / export interface **not validated**; access unconfirmed.
- `[Data: NV]` — required dataset / sample **not validated** or not yet supplied by HKHT.
- `[Owner: NV]` — accountable owner / approver / backup / routing **not validated**.
- `[Scope: NV]` — feature depth / governance scope **not validated**; needs explicit sign-off.

**Build-tag legend** (this inventory's shorthand for phase placement):

- `D7` — Day 1–7 production-shaped demo on mock/sample data.
- `D14` — Day 8–14 selected-user MVP (1–2 center nodes).
- `D30` — Day 15–30 controlled production base (one center node).
- `2M` — 2-month production architecture.
- `FUT` — Beyond 2 months / roadmap only (must not be promised as a Day-30 deliverable).

---

## 1. Scope & Strategic Frame

WF-015 tracks each youth from first contact through programs, reading groups, mentor touchpoints, sadhana progression, seva engagement, trips/Yatras, and long-term preacher/devotee/congregation development. The central design shift is **from isolated program follow-up to relationship intelligence**: a full seeker timeline, mentor memory, sadhana signals, dormant-contact reactivation, and center-wise dashboards.

The platform must support **two operating models simultaneously**: the centralized weekend-stay center model and the distributed city-node model (e.g., Mumbai's five-center structure). It must **map and integrate** existing CRMs/apps rather than force a replacement, and must let AI *recommend* follow-up intensity rather than blindly automate reminders (over-contacting can cause pressure or guilt).

---

## 2. Feature Classification (the brief's own layering table)

The brief defines six layers. Every capability in this inventory inherits one of these classifications.

| Layer | Meaning | Capabilities in this layer |
|---|---|---|
| **Automated (Deterministic)** | Runs without AI judgement; rule-driven. | Contact intake, source tagging, attendance capture, duplicate detection, follow-up task creation, reminder creation, dashboard refresh, basic stage transitions. |
| **AI-assisted** | AI drafts/scores/suggests; a human decides. | Follow-up drafting, stage classification, drop-off risk detection, guide meeting preparation, KCKE-grounded presentation outlines, dormant reactivation suggestions, trip/Yatra readiness suggestions. |
| **Agentic** | Multi-step autonomous agents (within guardrails). | Seeker Journey, Program Follow-up, Sadhana Progress, Data Quality, Management Intelligence, Field Outreach Prioritization, Dormant Contact agents. |
| **Human-approved** | AI may prepare but **cannot finalize**. | Spiritual guidance, personal counseling, public devotional/philosophical content, sensitive mentor notes, donor-sensitive communication, major role routing, high-risk exceptions. |
| **Dashboard-visible** | Surfaced as operational intelligence. | Center-wise progress, new/repeat contacts, sadhana gaps, one-on-one gaps, drop-off risk, potential preachers, data quality, pending approvals, partner blockers. |
| **Platform-compatible** | Cross-workflow architecture discipline. | Common IDs, source tracking, CRM continuity, ERP-ready fields, integration contracts, WF-013 replication readiness, BigQuery/Looker path. |

**Partner classification request (Section 13 of the brief)** — the partner must classify each item against these options:

| Feature / Capability | Required classification options |
|---|---|
| Seeker Journey Agent | Day-7 demo / Day-14 MVP / Day-30 base / production custom build |
| Data Quality Agent | Buildable immediately / needs sample data / production persistent DB required |
| Multi-CRM mapping | CSV-based / API-dependent / custom integration / future phase |
| Sadhana Progress Agent | Buildable now / requires tracker export / requires sensitive access design |
| Guide Support Copilot | Manual note-based now / recording-based future / not included without approval |
| KCKE Presentation Copilot | Mock only / KCKE API-dependent / future roadmap |
| WhatsApp follow-up | Draft-only / template API-dependent / human-send / future automation |
| Google Meet/Zoom attendance import | Manual upload / API-dependent / future connector |
| Dashboard | Sheets/Looker demo / production BigQuery/Looker / custom dashboard |
| WF-013 replication | Template design now / implementation future / multi-center package in 2-month architecture |

---

## 3. Agent & Copilot Inventory

Each entry below gives **purpose, automations, inputs, outputs, data, tools, human-approval points, escalation, success metric, classification, and build tag**. Inputs/outputs/data fields reference the WF-015 data model in Section 4.

### 3.1 Seeker Journey Agent
- **Purpose:** Track a youth from first contact to serious engagement and surface what should happen next.
- **Automations:** Ingests contact/attendance/source/follow-up/sadhana/mentor signals; computes current stage; proposes next action; raises risk flags. Triggers deterministic stage transitions where rules are unambiguous and routes ambiguous cases for AI classification.
- **Inputs:** Contact record, `Primary_Source`/`Source_Detail`, attendance history (`First/Last_Attendance_Date`, `Repeat_Attendance_Count`), `Last/Next_Followup_Date`, sadhana signals, mentor-note signals.
- **Outputs:** `Current_Stage` + `Stage_Last_Updated`, recommended `Next_Action` + `Next_Action_Owner`, `AI_Risk_Flag` (e.g., drop-off risk).
- **Data:** Identity, Source tracking, Journey, Follow-up, Sadhana/progression, Mentor-memory signals (access-controlled).
- **Tools:** Vertex AI / Agent Builder (classification, recommendation, routing); BigQuery/Looker for the signals layer; FOLK CRM as system of record.
- **Human-approval points:** Stage changes and next actions are *suggestions*; guide/center-head confirms before sensitive outreach. AI cannot finalize spiritual-guidance actions.
- **Escalation:** Drop-off risk and high-risk exceptions route to the assigned guide → center head → escalation owner `[Owner: NV]`.
- **Success metric:** Stage/risk suggestion acceptance rate; reduction in overdue follow-ups; accurate identification of serious-engagement transitions.
- **Classification:** Agentic.
- **Build tag:** `D7` (mock) → `D14` (selected-user MVP) → `D30` (controlled base).

### 3.2 Program Follow-up Agent
- **Purpose:** Generate human-approved follow-up drafts and tasks after programs, courses, reading groups, webinars, and events.
- **Automations:** Detects a completed touchpoint; drafts a contextual follow-up message; creates a follow-up task with owner, channel, and due date.
- **Inputs:** Event/program participation, `Followup_Channel`, prior `Outcome`/`No_Response_Count`, contact interest profile.
- **Outputs:** Draft follow-up message, follow-up task (`Next_Action`, `Next_Action_Owner`, `Next_Followup_Date`), updated `Outcome` after send.
- **Data:** Journey, Follow-up, Source tracking.
- **Tools:** Gemini Enterprise (drafting/summaries); task layer (ClickUp where confirmed `[API: NV]`); WhatsApp/calls as **draft-only** initially `[API: NV]`.
- **Human-approval points:** All drafts are human-reviewed before send; no auto-send until template/provider API is confirmed.
- **Escalation:** Repeated non-response (`No_Response_Count` threshold) escalates to guide/center head for a personal touch instead of more automated reminders.
- **Success metric:** Draft acceptance rate; follow-up SLA adherence; response/re-attendance rate without over-contacting.
- **Classification:** AI-assisted (drafting) over Deterministic (task creation).
- **Build tag:** `D7`/`D14`.

### 3.3 Sadhana Progress Agent
- **Purpose:** Track sadhana reports, chanting consistency, ashram level, and reading-group participation, and flag where a gentle reminder is appropriate.
- **Automations:** Ingests sadhana-tracker data; computes consistency/gaps; flags potential-preacher signals; proposes gentle, frequency-aware reminders.
- **Inputs:** `Sadhana_Report_Status`, `Last_Sadhana_Report_Date`, `Chanting_Consistency`, `Rounds_Level`, `Ashram_Level`, `Reading_Group_ID`, `Course_Completed`.
- **Outputs:** Sadhana gap flags, `Potential_Preacher_Flag`, frequency-aware reminder suggestions.
- **Data:** Sadhana/progression (ingested with **sensitive access controls**).
- **Tools:** Sadhana tracker (export/ingest `[API: NV]`); Vertex AI for scoring; Looker for sadhana-gap tiles.
- **Human-approval points:** Reminders are recommended, not blindly automated; guide approves cadence per youth.
- **Escalation:** Sustained sadhana drop-off feeds the Seeker Journey drop-off risk flag and guide review.
- **Success metric:** Sadhana-report capture rate; accurate gap detection; correct potential-preacher identification.
- **Classification:** Agentic / AI-assisted (with sensitive-data governance).
- **Build tag:** `D14` (sample) → `D30` (controlled base) `[Data: NV]`.

### 3.4 Guide Support Copilot
- **Purpose:** Prepare a guide before a one-on-one interaction using the relationship timeline and mentor notes; suggest tone and next action.
- **Automations:** Assembles a pre-meeting brief from timeline + mentor notes; suggests tone and a next action. **Begins with manual/voice mentor summaries — not automatic private-conversation recording.**
- **Inputs:** `Relationship_Timeline_ID`, mentor notes (`Mentor_Note_ID`, `Interest_Profile`, `Spiritual_Doubts`, `Family_Concern_Flag`, `Career_Concern_Flag`), recent attendance/sadhana signals.
- **Outputs:** Pre-meeting brief, suggested tone, suggested next action, sensitive flags surfaced (per access level).
- **Data:** Mentor memory (with `Sensitive_Note_Access_Level`), Journey, Sadhana/progression.
- **Tools:** Gemini Enterprise (summarization); voice-note capture for mentor summaries; role-based access control layer.
- **Human-approval points:** Uses **mentor-approved notes and human review first**; automatic recording / real-time coaching requires **separate governance and explicit scope approval** `[Scope: NV]`.
- **Escalation:** Sensitive spiritual/personal issues are flagged to the guide; never auto-resolved by AI.
- **Success metric:** Guide adoption; quality/usefulness of pre-meeting briefs; trust preserved (no sensitivity breaches).
- **Classification:** Human-approved (AI prepares only).
- **Build tag:** `D30` (limited) → deeper version in `2M`/`FUT` `[Scope: NV]`.

### 3.5 Content Presentation Copilot
- **Purpose:** Use KCKE to prepare source-grounded talks, outlines, Q&A, and follow-up reading for a specific audience and topic.
- **Automations:** Generates presentation outlines, Q&A, and follow-up reading lists grounded in KCKE source material (Prabhupada references, devotional/philosophical content).
- **Inputs:** Audience profile, topic, KCKE source corpus, prior interaction/interest profile.
- **Outputs:** Source-grounded talk outline, Q&A set, follow-up reading recommendations.
- **Data:** KCKE corpus (source-grounded only). **KCKE must not store contact status, payment status, attendance, or task status.**
- **Tools:** KCKE (interface details `[API: NV]`); Vertex AI graph/RAG; Media AI for supporting reels/storyboards (boundary: Media AI must not become CRM/ERP or a source of spiritual truth).
- **Human-approval points:** Public devotional/philosophical content is **human-approved**; generic (non-KCKE-grounded) AI must not produce spiritual content.
- **Escalation:** Spiritually sensitive or doctrinally uncertain content routes to a human reviewer.
- **Success metric:** Source-grounding accuracy; reviewer acceptance; presenter time saved.
- **Classification:** AI-assisted + Human-approved.
- **Build tag:** `D7` (mock, if KCKE sample available) → otherwise `FUT` `[API: NV]`.

### 3.6 Yatra / Trip Interest Agent
- **Purpose:** Identify youth ready for one-day, two-day, or longer trips/Yatras or physical-association touchpoints, and recommend a human-approved invite.
- **Automations:** Scores Yatra/trip readiness from engagement + past-trip history; recommends an invite for human approval.
- **Inputs:** Engagement/attendance signals, `Past_Trip_Count`, sadhana level, interest profile.
- **Outputs:** `Yatra_Readiness_Level`, recommended invite (human-approved), trip linkage (`Trip_ID`/`Yatra_ID`).
- **Data:** Trip/Yatra linkage, Journey, Sadhana/progression; `Payment_ID`/`Payment_Status` only when relevant (financial records remain in ERP).
- **Tools:** Vertex AI (recommendation); FOLK CRM; future integration with **WF-001** (trip/Yatra workflow).
- **Human-approval points:** Invites are recommended only and require human approval before contact.
- **Escalation:** Payment/financial steps route to ERP/finance owners, not finalized by AI.
- **Success metric:** Invite acceptance / trip conversion rate; accuracy of readiness scoring.
- **Classification:** AI-assisted.
- **Build tag:** `D14`/`D30` (sample data); WF-001 integration later.

### 3.7 Data Quality Agent
- **Purpose:** Deduplicate, map cross-CRM contacts, identify missing fields, source-tag records, and create the Contact ID mapping.
- **Automations:** Duplicate detection; cross-CRM contact mapping to root `Contact_ID`; missing-field detection; automated source tagging; mapping-table generation.
- **Inputs:** FOLK CRM, DMT CRM, Prabhupada World/LMS, sadhana-tracker exports; raw/CSV records.
- **Outputs:** Contact ID mapping table, dedupe results, `Data_Quality_Score`, missing-field and unmapped-record reports, CRM export-error list.
- **Data:** Identity, Source tracking, Dashboard (`Data_Quality_Score`).
- **Tools:** BigQuery (matching at scale); Vertex AI (fuzzy entity resolution); CSV ingestion fallback `[API: NV]`.
- **Human-approval points:** Ambiguous merges flagged for human confirmation; data steward owns final mapping `[Owner: NV]`.
- **Escalation:** Persistent export errors / unresolved duplicates escalate to the data steward.
- **Success metric:** Duplicate reduction; mapping coverage; `Data_Quality_Score` improvement; reduced unmapped records.
- **Classification:** Agentic over Deterministic (dedupe rules) — flagged **high priority**.
- **Build tag:** `D7`/`D14` (high priority).

### 3.8 Management Intelligence Agent
- **Purpose:** Generate weekly center-head and leadership dashboards: progression, potential preachers, drop-off risk, data quality, center-node health.
- **Automations:** Aggregates signals across centers/nodes; computes weekly progression and risk rollups; refreshes leadership/center-head dashboards.
- **Inputs:** All agent outputs, stage/risk flags, sadhana gaps, data-quality scores, center-node metadata.
- **Outputs:** Weekly leadership + center-head dashboards/tiles, center-node health view, potential-preacher and drop-off-risk rollups.
- **Data:** Journey, Follow-up, Sadhana/progression, Dashboard, Identity (Center/Center_Node).
- **Tools:** BigQuery / Looker Studio (production analytics); Sheets/Looker for MVP depending on data readiness.
- **Human-approval points:** Reporting layer; leadership interprets, AI does not finalize decisions or routing.
- **Escalation:** Partner blockers and pending approvals are surfaced as dashboard tiles for leadership action.
- **Success metric:** Dashboard usage in leadership cadence; decision turnaround on flagged items.
- **Classification:** Dashboard-visible + Agentic (aggregation).
- **Build tag:** `D14`/`D30`.

### 3.9 Field Outreach Prioritization Agent
- **Purpose:** For college/hostel/room outreach, identify high-response contacts and recommend early follow-up.
- **Automations:** Scores field-outreach contacts by likely responsiveness; recommends prioritized early follow-up.
- **Inputs:** Field outreach data (college/hostel/room), source detail, early-engagement signals.
- **Outputs:** Prioritized contact list, early follow-up recommendations.
- **Data:** Source tracking, Journey, Follow-up.
- **Tools:** Vertex AI (prioritization scoring); FOLK CRM.
- **Human-approval points:** Recommendations only; field volunteers/guides decide actual outreach.
- **Escalation:** Standard follow-up escalation path (guide → center head).
- **Success metric:** Response rate of prioritized vs. unprioritized outreach; conversion to first attendance.
- **Classification:** AI-assisted / Agentic.
- **Build tag:** `2M` architecture unless sample field data is ready `[Data: NV]`.

### 3.10 Dormant Contact Re-Activation Agent
- **Purpose:** Surface older contacts who may be ready for re-engagement via festival, course, trip, or mentor follow-up.
- **Automations:** Detects dormant contacts; matches them to a re-engagement hook (festival/course/trip); suggests a mentor follow-up.
- **Inputs:** `Dormant_Status`, `No_Response_Count`, last-attendance/last-followup dates, historical interest profile.
- **Outputs:** Reactivation candidate list, suggested re-engagement channel/hook, suggested mentor follow-up.
- **Data:** Follow-up (`Dormant_Status`), Journey, Mentor memory, Trip/Yatra linkage.
- **Tools:** Vertex AI (propensity/timing); FOLK CRM; long-term relationship memory store.
- **Human-approval points:** Suggestions only; mentor/guide approves re-contact to avoid pressure.
- **Escalation:** Sensitive past drop-off reasons (fear of detachment, family pressure, guilt) handled with care via guide, not mass automation.
- **Success metric:** Reactivation rate; re-attendance/re-engagement conversions.
- **Classification:** AI-assisted; long-term intelligent version is roadmap.
- **Build tag:** `2M`; intelligent long-term version `FUT`.

---

## 4. Data Model, IDs & ERP-Ready Fields

The partner must propose a master data model and integration contract **before** building production components. The schema must support both direct CRM implementation and interim mapping over existing CRMs/apps.

### 4.1 Identity (root + linkage)
`Contact_ID` is the **root identity**. Linked: `FOLK_Seeker_ID`, `Center_ID`, `Center_Node_ID`, `Primary_Guide_ID`, `Secondary_Guide_IDs`, `Owner_ID`. (Platform identity discipline also links Donor ID, Yatri ID, Campaign ID, Event ID, Course ID, Guide ID, Task ID where relevant.)

### 4.2 Source tracking
`Primary_Source`, `Source_Detail`, `Book_Distribution_Batch_ID`, `Pamphlet_Batch_ID`, `Webinar_ID`, `Course_ID`, `Campaign_ID`, `Referral_Contact_ID`, `Event_ID`.

### 4.3 Journey / stages
`Current_Stage`, `Stage_Last_Updated`, `First_Contact_Date`, `First_Attendance_Date`, `Last_Attendance_Date`, `Repeat_Attendance_Count`, `Seva_Engagement_Status`.

### 4.4 Follow-up
`Last_Followup_Date`, `Next_Followup_Date`, `Next_Action`, `Next_Action_Owner`, `Followup_Channel`, `Outcome`, `No_Response_Count`, `Dormant_Status`.

### 4.5 Mentor memory (with sensitive-access levels)
`Mentor_Note_ID`, `Relationship_Timeline_ID`, `Interest_Profile`, `Spiritual_Doubts`, `Family_Concern_Flag`, `Career_Concern_Flag`, **`Sensitive_Note_Access_Level`**. Sensitive mentor notes require role-based access — not every coordinator should see all youth-sensitive context.

### 4.6 Sadhana / progression
`Sadhana_Report_Status`, `Last_Sadhana_Report_Date`, `Chanting_Consistency`, `Rounds_Level`, `Ashram_Level`, `Reading_Group_ID`, `Course_Completed`, `Potential_Preacher_Flag`.

### 4.7 Trip / Yatra linkage
`Trip_ID`, `Yatra_ID`, `Yatra_Readiness_Level`, `Past_Trip_Count`, `Payment_ID` (if applicable), `Payment_Status` (if applicable).

### 4.8 Dashboard references
`Dashboard_Status`, `Data_Quality_Score`, `AI_Risk_Flag`, `Approval_Status`, `Escalation_Status`.

### 4.9 ERP-ready references (link only — actual financial records stay in ERP/finance)
`Donation_ID`, `Payment_ID`, `Receipt_ID`, `Approval_ID`, `Event_ID`, `Task_ID` where applicable.

**System boundaries on data:**
- **CRM/DBMS** stores contacts, source attribution, follow-ups, touchpoints, relationship timeline, stages, mentor notes, relationship status.
- **ERP** stores validated financial/operational records (payments, receipts, inventory, vouchers, procurement, finance, HR, approvals). WF-015 only **links** to ERP IDs when relevant.
- **KCKE** stores source-grounded Krishna-conscious content only — **not** contact/payment/attendance/task status.
- **Media AI** supports reels/presentations/storyboards/event content — **not** CRM, ERP, or a source of spiritual truth.

---

## 5. Multi-Center / Multi-Node Model

The same platform must support **two structures at once**: centralized weekend-stay center models and distributed city-node models (Mumbai's five-center structure being the reference case). The enabling field is **`Center_Node_ID`** (local program nodes) layered under `Center_ID`.

Mumbai-evidence requirements baked into the platform design (treated as design requirements, not late scope changes):

| Mumbai evidence | Platform implication |
|---|---|
| Distributed center model | Support `Center_Node_ID` and local program nodes. |
| Online + offline cultivation | Support online courses/webinars/e-learning/daily online reading groups **and** physical touch (trips, festivals, center visits). |
| Multiple CRMs/apps already exist | First architecture must **map/integrate, not replace**. |
| Individual follow-up frequency varies | AI **recommends** frequency per youth; does not blindly automate reminders. |
| Drop-off psychology | Model drop-off causes: fear of detachment, family/friend pressure, misunderstanding, guilt, avoidance of guide calls. |
| Mentor memory | Capture **structured mentor notes** without weakening trust. |
| Long-term cultivation | Support dormant-contact reactivation and long-term relationship memory (a youth may return after years). |

---

## 6. Multi-CRM Mapping (Mapping, NOT Replacement)

The first architecture maps existing systems onto the common `Contact_ID` rather than replacing them.

| Source system | What it contributes | Mapping target | Flag |
|---|---|---|---|
| **DMT CRM** | Leads that enter the FOLK journey | Mapped to `Contact_ID`; lead → FOLK seeker linkage | `[API: NV]` |
| **FOLK CRM / no-code app** | Contact, source, stage, guide, attendance, follow-up (system of record for journey) | Root `Contact_ID` / `FOLK_Seeker_ID` | `[API: NV]` (export/API/webhook to be classified; CSV fallback acceptable for demo/MVP) |
| **Prabhupada World / LMS (e-learning)** | Course enrollment, attendance, completion, user records, online journey events | Mapped into FOLK CRM via `Course_ID` / user ID → `Contact_ID` | `[API: NV]` |
| **Sadhana tracker** | Sadhana report + ashram-level data | Ingested into Sadhana/progression fields **with sensitive access controls** | `[API: NV]` |

Mapping is mediated by the **Data Quality Agent** (Section 3.7), which resolves duplicates and produces the cross-CRM Contact ID mapping table.

---

## 7. Dashboards

| Dashboard | Tiles / decisions triggered | Flag |
|---|---|---|
| **Leadership** | Center-wise active contacts, new contacts, repeat attendance, potential preachers, drop-off risk, overdue follow-ups, data quality, partner blockers. | — |
| **Center-head** | Center-node health, lead-source quality, program attendance, online-to-offline conversion, sadhana gaps, one-on-ones overdue, trip/Yatra readiness. | — |
| **Guide** | Assigned youth, current stage, last contact, suggested tone, sensitive flags, next action, recent attendance/sadhana signals. | Sensitive flags subject to access level |
| **Data quality** | Duplicates, missing fields, unmapped records, stale contacts, source gaps, CRM export errors. | — |
| **AI performance** | Suggestions generated, suggestions approved, false alerts, draft acceptance, unresolved escalations. | `[Data: NV]` |
| **2-month intelligence view** | Trend/progression insights; early prediction readiness for drop-off, serious engagement, and Yatra/trip conversion. | `2M` |

---

## 8. Governance & Human Approval

| Area | Rule |
|---|---|
| **AI can do** | Draft, classify, summarize, score, recommend, route, alert, prepare dashboards, propose next action. |
| **AI cannot finalize** | Sensitive spiritual guidance, counseling, public devotional/philosophical content, donor-sensitive messages, financial/payment/receipt decisions, high-risk exceptions. |
| **Guide Support Copilot boundary** | Use mentor-approved notes and human review first. Automatic recording / real-time coaching needs separate governance + explicit scope approval `[Scope: NV]`. |
| **Access control** | Sensitive mentor notes need role-based access (`Sensitive_Note_Access_Level`); not every coordinator sees all youth-sensitive context. |
| **Routing validation** | Accountable owner, performer, approver, backup, escalation person, dashboard reviewer, and data steward must be validated before automation routes go live `[Owner: NV]`. |
| **Audit trail** | Log all AI-generated suggestions, human approvals, follow-up tasks, and stage changes. |

---

## 9. Integrations & Boundaries

Each integration carries a fallback and an `[API: NV]` flag where access is unconfirmed.

| Integration | Expectation / boundary | Fallback | Flag |
|---|---|---|---|
| **Existing FOLK CRM / app** | Classify export/API/webhook availability. | CSV upload for demo/MVP. | `[API: NV]` |
| **DMT CRM** | Map leads to `Contact_ID` on entry to FOLK journey. | CSV lead export → manual mapping. | `[API: NV]` |
| **Prabhupada World / LMS** | Map course enrollment/attendance/completion/user records into FOLK CRM. | CSV/sample course data. | `[API: NV]` |
| **Sadhana tracker** | Ingest sadhana + ashram-level data with sensitive access controls. | Manual sadhana field upload. | `[API: NV]` |
| **WhatsApp / calls** | Human-approved drafts initially; no full API/voice integration promised until provider/API confirmed. | Draft-only → human-send. | `[API: NV]` |
| **Google Meet / Zoom** | Meeting attendance duration as an enthusiasm signal; needs capability/access validation. | Manual attendance upload. | `[API: NV]` |
| **KCKE** | Source-grounded presentation/devotional/philosophical support only. | Mock KCKE content for demo. | `[API: NV]` |
| **Content Factory (WF-04) / Media AI** | Reels, presentations, storyboards, event/Yatra/festival content; **not** CRM/ERP/source of spiritual truth. | Manual content creation. | — |
| **BigQuery / Looker Studio** | Production analytics + leadership dashboards. | Sheets/Looker for MVP per data readiness. | — |
| **Vertex AI / Agent Builder** | Production-grade multi-step agentic routing, predictions, relationship intelligence beyond simple GE drafts. | GE drafts for early phases. | — |
| **Gemini Enterprise** | Internal drafting, summarization, data explanation, productivity copilots, Drive/Workspace search, review workflows. | — | — |
| **ClickUp / task layer** | Optional execution/task-governance integration if HKHT confirms use for WF-015 tasks. | Sheets/manual task tracking. | `[API: NV]` |
| **WF-001 (Trip/Yatra)** | Future integration for Yatra/Trip Interest Agent. | Sample trip data. | future |
| **WF-013 (replication)** | FOLK config templates, center model types, standard fields, dashboard templates, training kit designed for replication. | Template design now. | `2M`/future |

**Google stack mapping the partner must deliver:** Gemini Enterprise vs Vertex AI / Agent Builder vs BigQuery / Looker Studio vs Apps Script / AppSheet / Sheets vs Cloud Run / Workflows.

---

## 10. KPIs

Drawn from the dashboards, agent success metrics, and acceptance criteria:

- **Coverage & data health:** Contact ID mapping coverage, duplicate reduction, `Data_Quality_Score`, unmapped/stale record counts, CRM export-error rate.
- **Engagement:** New contacts, repeat-attendance count/rate, online-to-offline conversion, seva-engagement status progression.
- **Cultivation:** Stage progression rate, potential-preacher identification, sadhana-report capture rate, sadhana-gap closure.
- **Risk & care:** Drop-off-risk detection accuracy, overdue follow-up reduction, one-on-one gap closure — **without over-contacting** (interaction-frequency appropriateness).
- **Conversion:** Yatra/trip readiness → invite acceptance → trip conversion; dormant-contact reactivation rate.
- **AI performance:** Suggestions generated vs. approved, draft acceptance rate, false-alert rate, unresolved escalations `[Data: NV]`.
- **Governance:** Audit-trail completeness, approval turnaround, routing validity.

---

## 11. Phase Plan (Day-7 / Day-14 / Day-30 / 2-Month) + Acceptance Criteria

| Phase | Expected outcome | Dependency / checkpoint | Acceptance criteria |
|---|---|---|---|
| **Day 1–7 — Demo** | Production-shaped demo on mock/sample data: multi-center FOLK CRM view, Contact ID mapping, Seeker Journey Agent, Program Follow-up draft, Data Quality Agent, dashboard mock. | HKHT provides anonymized sample contacts, attendance, sadhana, course, follow-up data `[Data: NV]`. | Show multi-center FOLK journey with sample data, common IDs, Seeker Journey, follow-up draft, data-quality view, dashboard mock. |
| **Day 8–14 — MVP** | Selected-user MVP for 1–2 center nodes: intake/CSV upload, dedupe/mapping, attendance/follow-up, AI draft, sadhana signal, center dashboard, human-approval flow. | Existing app/CRM exports; selected users; approval owners `[Owner: NV]` `[API: NV]`. | Selected users upload/use sample data, create follow-up tasks/drafts, review dashboard, validate stage/risk suggestions. |
| **Day 15–30 — Production Base** | Controlled live/near-live usage for one center node: stable data path, dashboard, manual fallback, guide notes, AI-assist with human review, explicit scope sign-off. | Partner classifies live vs. CSV vs. mock; HKHT validates owner + data steward `[Scope: NV]`. | Controlled production base with stable data path, human approval, fallback, dashboard, owner routing, audit trail. |
| **2-Month — Architecture** | Production architecture for multi-center WF-015: persistent data store, common IDs, integration architecture, KCKE interface, BI layer, security model, API registry, support model, WF-013 packaging. | TRD, solution architecture, integration decisions, cost estimate, risk register. | TRD, production architecture, integration plan, persistent data path, security model, cost plan, WF-013 replication package. |
| **Beyond 2 Months — Roadmap (`FUT`)** | Devotee Intelligence Graph, predictive progression, real-time guide assistance, social-signal intelligence, advanced dormant reactivation, federated multi-center learning. | Future roadmap only — do **not** convert into a Day-30 promise `[Scope: NV]`. | — |

---

## 12. Risks, Safeguards & Validation Flags

| Risk | Why it matters | Safeguard | Flag |
|---|---|---|---|
| Disconnected tools | Multiple CRMs/apps remain unlinked. | Common `Contact_ID` + mapping layer first. | `[API: NV]` |
| Demo mistaken for production | Users may expect a live integrated system from a mock. | Classify every feature: mock / CSV / API-ready / live. | `[Scope: NV]` |
| Over-contacting youth | Excess follow-up creates pressure or guilt. | Interaction-frequency recommendation + mentor approval. | `[Data: NV]` |
| Sensitive mentor notes exposed | Personal/spiritual issues may be mishandled. | Role-based access + sensitive-note level. | `[Owner: NV]` |
| KCKE boundary confusion | Generic AI could create spiritually inaccurate content. | Use KCKE source-grounding + human approval. | `[API: NV]` |
| Guide Support Copilot overreach | Recording / real-time guidance can damage trust. | Start with mentor summaries; recording features future only. | `[Scope: NV]` |
| Weak adoption | Busy guides may not use the tools. | Simple UI, voice-note capture, daily/weekly support rhythm. | `[Scope: NV]` |
| Wrong routing | Transcript-derived names may not be current owners. | Validate accountable owner, performer, approver, backup. | `[Owner: NV]` |

---

## 13. Immediate HKHT Data Required

| Data / file | Why needed | Phase | Status |
|---|---|---|---|
| FOLK CRM sample export | Contact, source, stage, guide, attendance, follow-up. | D7/D14 | `[Data: NV]` |
| DMT CRM sample leads | Test lead mapping into FOLK journey. | D7/D14 | `[Data: NV]` |
| Prabhupada World sample data | Course enrollment, completion, attendance, user ID. | D14 | `[Data: NV]` |
| Sadhana tracker fields | Define sadhana signal + access model. | D14/D30 | `[Data: NV]` |
| Event/attendance sheet | Build attendance + repeat-participation dashboard. | D7 | `[Data: NV]` |
| Follow-up tracker | Define SLAs + next-action fields. | D7/D14 | `[Data: NV]` |
| Mentor note samples | Anonymized examples to design Guide Support Copilot. | D14/D30 | `[Data: NV]` |
| Program/course list | Map standard + local programs. | D7 | `[Data: NV]` |
| Dashboard/report examples | Align management view + KPIs. | D7 | `[Data: NV]` |
| Owner/approver matrix | Route tasks + approvals. | D7/D14 | `[Owner: NV]` |

---

## 14. Partner Deliverables Required

TRD; Solution Architecture (current apps/CRMs → mapping layer → agent layer → dashboard layer → future ERP-ready path); Google Stack Mapping; Agent Architecture (tools, inputs, outputs, approval gates, escalation logic); CRM/Data Architecture (Contact ID strategy, multi-CRM mapping, source tagging, relationship timeline, data-quality model); Integration Architecture (FOLK CRM, DMT CRM, Prabhupada World, sadhana tracker, WhatsApp/call systems, Google Meet/Zoom, KCKE, dashboards); Dashboard Architecture (leadership, center-head, guide, data-quality, AI-performance); Security & Access Model (sensitive mentor notes, devotional content review, dashboards, role-based visibility); Deployment Architecture (demo, MVP, production base, 2-month); API/Connector Requirements + API Registry; Cost Estimate & Licensing; Rollout Plan (D7/D14/D30/2M); Risk Register & Mitigation; HKHT-Side Dependencies & Data Requirements; Acceptance Criteria & Handover Plan.

---

*Inventory derived in full from the WF-015 FOLK Youth Cultivation Multi-Center Updated Partner Brief (all 20 tables and sections 1–16 + Appendix A). All `[NV]` flags reflect items the brief itself marked as not-validated; they must be confirmed by HKHT/partner before the corresponding feature goes live.*
