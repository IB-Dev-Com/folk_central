# WF-015 — Mock Data Model & Seed Records

**Module:** WF-015 FOLK Youth Cultivation (Multi-Center) — prototype
**Companion docs:** WF-015 Feature & Automation Inventory; Module Strategy & Architecture Note; Screen Map / IA
**Purpose:** Define the prototype's entities and fields (using the IDs from the inventory) and provide realistic **anonymized, fictional** seed records — multi-center nodes, guides, seekers at different stages, sadhana signals, mentor notes with access levels, and sample KCKE / Content-Factory items.

> All names, contacts, and data below are fictional and for prototype/demo use only. They preserve **production-shaped IDs** per the brief.

**ID conventions used in the seed data**

| Entity | Prefix | Example |
|---|---|---|
| Contact (root identity, ID/CRM/WF-006) | `CNT-` | `CNT-100247` |
| FOLK seeker | `FSK-` | `FSK-0091` |
| Center | `CTR-` | `CTR-MUM` |
| Center node | `CND-` | `CND-MUM-AND` |
| Guide | `GID-` | `GID-014` |
| Owner (any accountable user) | `OWN-` | `OWN-003` |
| Event / program | `EVT-` | `EVT-2206` |
| Course (Prabhupada World/LMS) | `CRS-` | `CRS-BG101` |
| Reading group | `RDG-` | `RDG-AND-TUE` |
| Webinar | `WBR-` | `WBR-0420` |
| Campaign | `CMP-` | `CMP-IGYOUTH` |
| Mentor note | `MNT-` | `MNT-5567` |
| Relationship timeline | `RTL-` | `RTL-100247` |
| Trip / Yatra | `TRP-`/`YTR-` | `YTR-MAYAPUR26` |
| Follow-up task | `FUP-` | `FUP-88231` |
| KCKE content item | `KCKE-` | `KCKE-BG-0307` |
| Content Factory job | `CF-` | `CF-1042` |
| Media asset | `MED-` | `MED-7781` |
| ERP refs (reference-only) | `PAY-`/`RCT-`/`APR-`/`DON-` | `PAY-55012` |
| Approval | `APPR-` | `APPR-3301` |
| Audit log | `AUD-` | `AUD-99001` |

---

## 1. Entity Overview

```
Center (CTR) ──< Center_Node (CND) ──< Guide (GID)
                                   │
Contact (CNT, root identity) ──1:1── FOLK_Seeker (FSK)
   │                                   │
   ├── Source_Attribution              ├── Journey_Stage (history)
   ├── Relationship_Timeline (RTL)     ├── Follow_Up (FUP)  ── Drop-off risk
   ├── Mentor_Note (MNT, access-lvl)   ├── Sadhana_Record
   ├── CRM_Mapping (source ↔ CNT)      ├── Attendance (EVT/CRS/RDG/WBR)
   └── ERP_Reference (PAY/RCT/...)     └── Trip_Yatra_Link (TRP/YTR)

KCKE_Item (KCKE) ──used by──> Content_Presentation ──hands off──> Content_Factory_Job (CF) ──> Media_Asset (MED)
Approval (APPR) and Audit_Log (AUD) reference any entity above.
```

---

## 2. Entity & Field Definitions

### 2.1 Center / Center_Node
`Center_ID`, `Center_Name`, `Center_Model` (`centralized` | `distributed_node`), `Center_Node_ID`, `Node_Name`, `City`, `Parent_Center_ID`, `Active`.

### 2.2 Guide
`Guide_ID`, `Guide_Name`, `Center_Node_ID`, `Role` (`primary_guide`|`secondary_guide`|`center_head`|`presenter`|`sadhana_coordinator`|`data_steward`), `Sensitive_Access` (`none`|`standard`|`sensitive`|`full`).

### 2.3 Contact (root identity — ID/CRM / WF-006)
`Contact_ID`, `Full_Name`, `Phone`, `Email`, `City`, `Center_ID`, `Center_Node_ID`, `Primary_Guide_ID`, `Secondary_Guide_IDs`, `Owner_ID`, `Created_Date`.

### 2.4 FOLK_Seeker (FOLK extension)
`FOLK_Seeker_ID`, `Contact_ID`, `Current_Stage`, `Stage_Last_Updated`, `First_Contact_Date`, `First_Attendance_Date`, `Last_Attendance_Date`, `Repeat_Attendance_Count`, `Seva_Engagement_Status`, `AI_Risk_Flag`, `Dashboard_Status`.
*Stage vocabulary:* `new_contact` → `contacted` → `attending` → `reading_group` → `sadhana_active` → `seva_engaged` → `potential_preacher` (plus `dormant`).

### 2.5 Source_Attribution
`Contact_ID`, `Primary_Source`, `Source_Detail`, `Book_Distribution_Batch_ID`, `Pamphlet_Batch_ID`, `Webinar_ID`, `Course_ID`, `Campaign_ID`, `Referral_Contact_ID`, `Event_ID`.

### 2.6 Follow_Up
`Followup_ID`, `Contact_ID`, `Last_Followup_Date`, `Next_Followup_Date`, `Next_Action`, `Next_Action_Owner`, `Followup_Channel` (`call`|`whatsapp`|`in_person`|`email`), `Outcome`, `No_Response_Count`, `Dormant_Status`, `Recommended_Frequency`.

### 2.7 Mentor_Note (sensitive — access controlled)
`Mentor_Note_ID`, `Contact_ID`, `Relationship_Timeline_ID`, `Interest_Profile`, `Spiritual_Doubts`, `Family_Concern_Flag`, `Career_Concern_Flag`, `Note_Text`, **`Sensitive_Note_Access_Level`** (`standard`|`sensitive`|`restricted`), `Author_Guide_ID`, `Capture_Method` (`manual`|`voice_note`).

### 2.8 Sadhana_Record
`Contact_ID`, `Sadhana_Report_Status`, `Last_Sadhana_Report_Date`, `Chanting_Consistency` (`none`|`irregular`|`steady`|`strong`), `Rounds_Level`, `Ashram_Level`, `Reading_Group_ID`, `Course_Completed`, `Potential_Preacher_Flag`.

### 2.9 Attendance
`Attendance_ID`, `Contact_ID`, `Activity_Type` (`program`|`course`|`reading_group`|`webinar`|`event`), `Activity_ID`, `Date`, `Mode` (`online`|`offline`), `Duration_Min` (Meet/Zoom signal `[API: NV]`), `Source_System`.

### 2.10 Trip_Yatra_Link
`Link_ID`, `Contact_ID`, `Trip_ID`/`Yatra_ID`, `Yatra_Readiness_Level` (`low`|`medium`|`high`), `Past_Trip_Count`, `Payment_ID` (ERP ref, optional), `Payment_Status` (optional).

### 2.11 CRM_Mapping (multi-CRM mapping layer — map, don't replace)
`Mapping_ID`, `Contact_ID`, `Source_System` (`DMT_CRM`|`FOLK_CRM`|`PRABHUPADA_WORLD`|`SADHANA_TRACKER`), `Source_Record_Key`, `Match_Confidence`, `Mapping_Status` (`auto`|`confirmed`|`needs_review`), `Data_Quality_Score`.

### 2.12 ERP_Reference (reference-only)
`Contact_ID`, `Donation_ID`, `Payment_ID`, `Receipt_ID`, `Approval_ID`, `Event_ID`, `Task_ID`. *Actual financial records remain in ERP.*

### 2.13 KCKE_Item
`KCKE_Item_ID`, `Title`, `Source_Reference` (e.g., scripture/Prabhupada ref), `Topic`, `Audience`, `Content_Type` (`outline`|`qa`|`reading_list`), `Approved_For_Public` (bool).

### 2.14 Content_Factory_Job
`CF_Job_ID`, `Requested_By`, `Brief`, `Grounding_Refs` (KCKE item IDs), `Status` (`requested`|`in_production`|`delivered`), `Artifact_ID`, `Media_Asset_ID`.

### 2.15 Approval & Audit
**Approval:** `Approval_ID`, `Item_Type`, `Item_Ref`, `Requested_By`, `Approver_ID`, `Status` (`pending`|`approved`|`edited`|`rejected`), `Reason`, `Timestamp`.
**Audit:** `Audit_ID`, `Actor` (`agent`|user), `Action`, `Entity_Ref`, `Before`, `After`, `Timestamp`.

---

## 3. Seed Records

### 3.1 Centers & Nodes (centralized + distributed)

| Center_ID | Center_Name | Center_Model | Center_Node_ID | Node_Name | City |
|---|---|---|---|---|---|
| CTR-HYD | Hyderabad FOLK | centralized | CND-HYD-MAIN | Hyderabad Main Ashram | Hyderabad |
| CTR-MUM | Mumbai FOLK | distributed_node | CND-MUM-AND | Andheri Node | Mumbai |
| CTR-MUM | Mumbai FOLK | distributed_node | CND-MUM-DAD | Dadar Node | Mumbai |
| CTR-MUM | Mumbai FOLK | distributed_node | CND-MUM-THA | Thane Node | Mumbai |
| CTR-MUM | Mumbai FOLK | distributed_node | CND-MUM-VAS | Vashi Node | Navi Mumbai |
| CTR-MUM | Mumbai FOLK | distributed_node | CND-MUM-BOR | Borivali Node | Mumbai |

*(Mumbai modeled as the five-node distributed structure from the transcript; Hyderabad as centralized.)*

### 3.2 Guides

| Guide_ID | Guide_Name | Center_Node_ID | Role | Sensitive_Access |
|---|---|---|---|---|
| GID-014 | Arjun Das | CND-MUM-AND | primary_guide | sensitive |
| GID-021 | Radha Sharma | CND-MUM-AND | secondary_guide | standard |
| GID-007 | Govinda Rao | CND-HYD-MAIN | center_head | full |
| GID-033 | Meera Nair | CND-MUM-DAD | primary_guide | sensitive |
| GID-040 | Vivek Joshi | CND-MUM-THA | presenter | standard |
| GID-052 | Lakshmi Iyer | CND-HYD-MAIN | sadhana_coordinator | sensitive |
| OWN-003 | Sanjay Kulkarni | CTR-MUM | data_steward | full |

### 3.3 Seekers at different stages (Contact + FOLK_Seeker joined)

| Contact_ID | FOLK_Seeker_ID | Name | Center_Node_ID | Primary_Guide | Current_Stage | First_Contact | Repeat_Attend | Seva_Status | AI_Risk_Flag |
|---|---|---|---|---|---|---|---|---|---|
| CNT-100247 | FSK-0091 | Rohit Mehta | CND-MUM-AND | GID-014 | new_contact | 2026-06-10 | 0 | none | none |
| CNT-100255 | FSK-0093 | Priya Nair | CND-MUM-AND | GID-021 | attending | 2026-04-22 | 3 | none | none |
| CNT-100262 | FSK-0096 | Karthik Reddy | CND-HYD-MAIN | GID-007 | reading_group | 2026-02-15 | 7 | helper | none |
| CNT-100271 | FSK-0099 | Anjali Desai | CND-MUM-DAD | GID-033 | sadhana_active | 2025-11-30 | 12 | regular | none |
| CNT-100288 | FSK-0104 | Suresh Pillai | CND-HYD-MAIN | GID-007 | potential_preacher | 2024-09-12 | 41 | core | none |
| CNT-100290 | FSK-0106 | Neha Kapoor | CND-MUM-THA | GID-040 | contacted | 2026-05-18 | 1 | none | drop_off_medium |
| CNT-100301 | FSK-0110 | Aakash Verma | CND-MUM-AND | GID-014 | attending | 2026-03-05 | 4 | none | drop_off_high |
| CNT-100312 | FSK-0114 | Divya Menon | CND-MUM-VAS | GID-033 | dormant | 2024-01-20 | 6 | none | dormant_reengage |

### 3.4 Source attribution (selected)

| Contact_ID | Primary_Source | Source_Detail | Course_ID | Campaign_ID | Referral_Contact_ID |
|---|---|---|---|---|---|
| CNT-100247 | paid_social | Instagram youth ad | — | CMP-IGYOUTH | — |
| CNT-100255 | book_distribution | BG set, college fest | — | — | — |
| CNT-100262 | online_course | Bhagavad-gita 101 | CRS-BG101 | — | — |
| CNT-100271 | referral | referred by FSK-0093 | — | — | CNT-100255 |
| CNT-100290 | college_outreach | hostel room program | — | CMP-IGYOUTH | — |
| CNT-100312 | festival | Janmashtami 2023 | — | — | — |

Batch IDs in use: `Book_Distribution_Batch_ID = BKB-2206`, `Pamphlet_Batch_ID = PMB-1109`, `Webinar_ID = WBR-0420`.

### 3.5 Follow-up & drop-off-risk queue (seed)

| Followup_ID | Contact_ID | Next_Followup_Date | Next_Action | Owner | Channel | No_Response_Count | Dormant_Status | Recommended_Frequency |
|---|---|---|---|---|---|---|---|---|
| FUP-88231 | CNT-100247 | 2026-06-25 | Invite to Tuesday reading group | GID-014 | whatsapp | 0 | active | weekly |
| FUP-88240 | CNT-100290 | 2026-06-24 | Gentle check-in call (no pressure) | GID-040 | call | 2 | active | biweekly |
| FUP-88255 | CNT-100301 | 2026-06-24 | Personal touch — guide call (high risk) | GID-014 | call | 4 | active | reduce / pause auto |
| FUP-88260 | CNT-100312 | 2026-06-28 | Festival re-engagement invite | GID-033 | whatsapp | 0 | dormant | reactivation |

*Note:* CNT-100301 shows the over-contacting safeguard — `No_Response_Count = 4` triggers a reduce/human-touch recommendation rather than more automated reminders.

### 3.6 Sadhana records (signals)

| Contact_ID | Report_Status | Last_Report | Chanting | Rounds | Ashram_Level | Reading_Group | Course_Completed | Potential_Preacher |
|---|---|---|---|---|---|---|---|---|
| CNT-100262 | active | 2026-06-22 | steady | 8 | aspiring | RDG-AND-TUE | CRS-BG101 | false |
| CNT-100271 | active | 2026-06-23 | strong | 16 | committed | RDG-DAD-THU | CRS-BG101, CRS-NOI201 | true |
| CNT-100288 | active | 2026-06-23 | strong | 16 | initiated | RDG-HYD-MON | CRS-BG101, CRS-NOI201, CRS-SB301 | true |
| CNT-100301 | lapsed | 2026-05-02 | irregular | 4 | none | RDG-AND-TUE | — | false |

CNT-100301's lapsed sadhana report feeds the `drop_off_high` flag in 3.3.

### 3.7 Mentor notes (with access levels)

| Mentor_Note_ID | Contact_ID | Author | Access_Level | Interest_Profile | Family_Concern | Career_Concern | Capture | Note_Text (anonymized) |
|---|---|---|---|---|---|---|---|---|
| MNT-5567 | CNT-100255 | GID-021 | standard | likes kirtan, philosophy curious | false | false | manual | "Responds well to reading group; enjoys group chanting." |
| MNT-5571 | CNT-100301 | GID-014 | sensitive | sincere but hesitant | true | false | voice_note | "Family pressure about time spent at center; fears detachment. Go gently." |
| MNT-5578 | CNT-100271 | GID-033 | sensitive | strong sadhana, leadership potential | false | true | manual | "Career-vs-seva tension; wants guidance balancing job and service." |
| MNT-5590 | CNT-100312 | GID-033 | restricted | lapsed after personal loss | true | false | voice_note | "Stopped attending after family bereavement; sensitive re-approach only via festival." |

*Access enforcement:* `standard` visible to assigned guide + coordinators; `sensitive` to assigned guide + center_head; `restricted` to center_head/full only. Every read is audited.

### 3.8 Attendance (online + offline)

| Attendance_ID | Contact_ID | Activity_Type | Activity_ID | Date | Mode | Duration_Min | Source_System |
|---|---|---|---|---|---|---|---|
| ATT-44012 | CNT-100255 | reading_group | RDG-AND-TUE | 2026-06-16 | offline | — | FOLK_CRM |
| ATT-44030 | CNT-100262 | course | CRS-BG101 | 2026-06-20 | online | 52 | PRABHUPADA_WORLD |
| ATT-44041 | CNT-100247 | webinar | WBR-0420 | 2026-06-12 | online | 18 | PRABHUPADA_WORLD |
| ATT-44055 | CNT-100271 | program | EVT-2206 | 2026-06-21 | offline | — | FOLK_CRM |

*Meet/Zoom duration (`Duration_Min`) as enthusiasm signal is `[API: NV]`; low 18-min webinar dwell for CNT-100247 is a soft early-interest signal.*

### 3.9 Trip / Yatra readiness

| Link_ID | Contact_ID | Yatra_ID | Readiness | Past_Trip_Count | Payment_ID | Payment_Status |
|---|---|---|---|---|---|---|
| TYL-301 | CNT-100271 | YTR-MAYAPUR26 | high | 2 | PAY-55012 | confirmed |
| TYL-305 | CNT-100288 | YTR-MAYAPUR26 | high | 5 | PAY-55020 | confirmed |
| TYL-309 | CNT-100262 | TRP-PANDHARPUR1D | medium | 0 | — | — |
| TYL-312 | CNT-100255 | TRP-PANDHARPUR1D | low | 0 | — | — |

*Payment IDs are ERP references only; finance records remain in ERP.*

### 3.10 CRM mapping layer (map, don't replace)

| Mapping_ID | Contact_ID | Source_System | Source_Record_Key | Match_Confidence | Mapping_Status | Data_Quality_Score |
|---|---|---|---|---|---|---|
| MAP-9001 | CNT-100247 | DMT_CRM | dmt_lead_77231 | 0.98 | confirmed | 0.95 |
| MAP-9002 | CNT-100262 | PRABHUPADA_WORLD | pw_user_4410 | 0.91 | confirmed | 0.88 |
| MAP-9003 | CNT-100271 | SADHANA_TRACKER | st_2231 | 0.86 | needs_review | 0.72 |
| MAP-9004 | CNT-100301 | FOLK_CRM | folk_8890 | 0.99 | confirmed | 0.90 |
| MAP-9005 | CNT-100255 | DMT_CRM | dmt_lead_77310 | 0.64 | needs_review | 0.60 |

*Two `needs_review` rows surface in the Data-Quality Console for the data steward (OWN-003) to confirm. All source keys retained — source systems keep running.*

### 3.11 KCKE items (source-grounded content)

| KCKE_Item_ID | Title | Source_Reference | Topic | Audience | Content_Type | Approved_For_Public |
|---|---|---|---|---|---|---|
| KCKE-BG-0307 | Acting without attachment | Bhagavad-gita 3.7 | karma-yoga for students | college youth | outline | true |
| KCKE-BG-0218 | The soul is eternal | Bhagavad-gita 2.18 | facing loss/grief | grieving seeker | qa | true |
| KCKE-NOI-05 | Six favorable practices | Nectar of Instruction, v.5 | building sadhana | reading group | reading_list | true |
| KCKE-SB-0102 | Inquiry into the Absolute | Srimad-Bhagavatam 1.1.2 | philosophy seekers | advanced | outline | false |

*KCKE stores only content + source refs — never contact/payment/attendance/task status.*

### 3.12 Content Factory jobs (WF-04 handoff)

| CF_Job_ID | Requested_By | Brief | Grounding_Refs | Status | Artifact_ID | Media_Asset_ID |
|---|---|---|---|---|---|---|
| CF-1042 | GID-040 | College talk deck: "Acting without attachment" | KCKE-BG-0307 | delivered | ART-2207 | MED-7781 |
| CF-1050 | GID-033 | Grief-sensitive follow-up reading sheet | KCKE-BG-0218 | in_production | — | — |
| CF-1055 | GID-007 | Janmashtami reactivation reel | KCKE-NOI-05 | requested | — | MED-7790 |

### 3.13 Approvals (human gate)

| Approval_ID | Item_Type | Item_Ref | Requested_By | Approver | Status |
|---|---|---|---|---|---|
| APPR-3301 | dormant_recontact | FUP-88260 (CNT-100312) | Dormant Agent | GID-033 | pending |
| APPR-3305 | yatra_invite | TYL-309 (CNT-100262) | Yatra Agent | GID-007 | approved |
| APPR-3310 | public_content | CF-1055 | GID-007 | GID-007 | pending |
| APPR-3312 | sensitive_followup | FUP-88255 (CNT-100301) | Follow-up Agent | GID-014 | edited |

### 3.14 Audit log (sample)

| Audit_ID | Actor | Action | Entity_Ref | Timestamp |
|---|---|---|---|---|
| AUD-99001 | Seeker Journey Agent | stage_change_proposed (attending→risk_flag) | FSK-0099 / CNT-100301 | 2026-06-23 09:14 |
| AUD-99002 | GID-014 | mentor_note_read (sensitive) | MNT-5571 | 2026-06-23 09:20 |
| AUD-99003 | GID-014 | followup_draft_edited + approved | FUP-88255 | 2026-06-23 09:25 |
| AUD-99004 | Data Quality Agent | mapping_flagged_needs_review | MAP-9005 | 2026-06-23 07:02 |
| AUD-99005 | GID-007 | yatra_invite_approved | APPR-3305 | 2026-06-22 18:40 |

---

## 4. How the Seed Data Exercises the Prototype

- **Multi-center:** Hyderabad (centralized) + Mumbai's five nodes exercise the `Center_Node_ID` switcher and center-scoped dashboards.
- **Stage spread:** seekers span `new_contact` → `potential_preacher` plus `dormant`, so the Journey Board and Seeker 360 show every stage.
- **Risk & safeguard:** CNT-100301 (high risk, lapsed sadhana, family pressure note, 4 no-responses) demonstrates drop-off detection *and* the anti-over-contacting recommendation routed for human approval.
- **Sensitive access:** notes at `standard` / `sensitive` / `restricted` levels test role-based gating and audit-on-read.
- **Map-don't-replace:** mapping rows from DMT / FOLK CRM / Prabhupada World / sadhana tracker — including two `needs_review` — drive the Data-Quality Console.
- **Content seam:** KCKE items → Content Factory jobs → media assets, with public-content approval gates, exercise the KCKE/WF-04/Media seams.
- **Governance:** Approvals queue + Audit log show the human gate and immutable trail end to end.

> Replace these fictional seeds with anonymized HKHT sample exports (per the brief's Immediate-Data list) when available; the schema and IDs are already production-shaped.
