/* ============================================================================
   WF-015 FOLK — Seed data (fictional, anonymized, production-shaped IDs)
   Mirrors WF-015_Mock_Data_Model.md. All names/data are demo-only.
   ========================================================================== */
(function (FOLK) {
  "use strict";

  const seed = {};

  /* ---- Centers & nodes (centralized + distributed) ---- */
  seed.centers = [
    { Center_ID: "CTR-HYD", Center_Name: "Hyderabad FOLK", Center_Model: "centralized" },
    { Center_ID: "CTR-MUM", Center_Name: "Mumbai FOLK", Center_Model: "distributed_node" },
  ];
  seed.nodes = [
    { Center_Node_ID: "CND-HYD-MAIN", Center_ID: "CTR-HYD", Node_Name: "Hyderabad Main Ashram", City: "Hyderabad", Active: true },
    { Center_Node_ID: "CND-MUM-AND", Center_ID: "CTR-MUM", Node_Name: "Andheri Node", City: "Mumbai", Active: true },
    { Center_Node_ID: "CND-MUM-DAD", Center_ID: "CTR-MUM", Node_Name: "Dadar Node", City: "Mumbai", Active: true },
    { Center_Node_ID: "CND-MUM-THA", Center_ID: "CTR-MUM", Node_Name: "Thane Node", City: "Mumbai", Active: true },
    { Center_Node_ID: "CND-MUM-VAS", Center_ID: "CTR-MUM", Node_Name: "Vashi Node", City: "Navi Mumbai", Active: true },
    { Center_Node_ID: "CND-MUM-BOR", Center_ID: "CTR-MUM", Node_Name: "Borivali Node", City: "Mumbai", Active: true },
  ];

  /* ---- Guides / accountable users ---- */
  seed.guides = [
    { Guide_ID: "GID-014", Guide_Name: "Arjun Das",       Center_Node_ID: "CND-MUM-AND",  Role: "primary_guide",       Sensitive_Access: "sensitive" },
    { Guide_ID: "GID-021", Guide_Name: "Radha Sharma",    Center_Node_ID: "CND-MUM-AND",  Role: "secondary_guide",     Sensitive_Access: "standard" },
    { Guide_ID: "GID-007", Guide_Name: "Govinda Rao",     Center_Node_ID: "CND-HYD-MAIN", Role: "center_head",         Sensitive_Access: "full" },
    { Guide_ID: "GID-033", Guide_Name: "Meera Nair",      Center_Node_ID: "CND-MUM-DAD",  Role: "primary_guide",       Sensitive_Access: "sensitive" },
    { Guide_ID: "GID-040", Guide_Name: "Vivek Joshi",     Center_Node_ID: "CND-MUM-THA",  Role: "presenter",           Sensitive_Access: "standard" },
    { Guide_ID: "GID-052", Guide_Name: "Lakshmi Iyer",    Center_Node_ID: "CND-HYD-MAIN", Role: "sadhana_coordinator", Sensitive_Access: "sensitive" },
    { Guide_ID: "OWN-003", Guide_Name: "Sanjay Kulkarni", Center_Node_ID: "CND-MUM-AND",  Role: "data_steward",        Sensitive_Access: "full" },
  ];

  /* ---- Contacts (root identity) joined with FOLK_Seeker ---- */
  // Each record carries identity + FOLK extension + source + journey signals.
  seed.seekers = [
    {
      Contact_ID: "CNT-100247", FOLK_Seeker_ID: "FSK-0091", Full_Name: "Rohit Mehta",
      Phone: "+91 98•••• 21", Email: "rohit.m••@example.com", City: "Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-AND", Primary_Guide_ID: "GID-014", Secondary_Guide_IDs: [],
      Current_Stage: "new_contact", Stage_Last_Updated: "2026-06-10",
      First_Contact_Date: "2026-06-10", First_Attendance_Date: null, Last_Attendance_Date: "2026-06-12",
      Repeat_Attendance_Count: 0, Seva_Engagement_Status: "none", AI_Risk_Flag: "none",
      Primary_Source: "paid_social", Source_Detail: "Instagram youth ad", Campaign_ID: "CMP-IGYOUTH",
      Created_Date: "2026-06-10",
    },
    {
      Contact_ID: "CNT-100255", FOLK_Seeker_ID: "FSK-0093", Full_Name: "Priya Nair",
      Phone: "+91 99•••• 07", Email: "priya.n••@example.com", City: "Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-AND", Primary_Guide_ID: "GID-021", Secondary_Guide_IDs: ["GID-014"],
      Current_Stage: "attending", Stage_Last_Updated: "2026-06-16",
      First_Contact_Date: "2026-04-22", First_Attendance_Date: "2026-04-29", Last_Attendance_Date: "2026-06-16",
      Repeat_Attendance_Count: 3, Seva_Engagement_Status: "none", AI_Risk_Flag: "none",
      Primary_Source: "book_distribution", Source_Detail: "BG set, college fest", Book_Distribution_Batch_ID: "BKB-2206",
      Created_Date: "2026-04-22",
    },
    {
      Contact_ID: "CNT-100262", FOLK_Seeker_ID: "FSK-0096", Full_Name: "Karthik Reddy",
      Phone: "+91 96•••• 44", Email: "karthik.r••@example.com", City: "Hyderabad",
      Center_ID: "CTR-HYD", Center_Node_ID: "CND-HYD-MAIN", Primary_Guide_ID: "GID-007", Secondary_Guide_IDs: ["GID-052"],
      Current_Stage: "reading_group", Stage_Last_Updated: "2026-06-20",
      First_Contact_Date: "2026-02-15", First_Attendance_Date: "2026-02-22", Last_Attendance_Date: "2026-06-20",
      Repeat_Attendance_Count: 7, Seva_Engagement_Status: "helper", AI_Risk_Flag: "none",
      Primary_Source: "online_course", Source_Detail: "Bhagavad-gita 101", Course_ID: "CRS-BG101",
      Created_Date: "2026-02-15",
    },
    {
      Contact_ID: "CNT-100271", FOLK_Seeker_ID: "FSK-0099", Full_Name: "Anjali Desai",
      Phone: "+91 90•••• 99", Email: "anjali.d••@example.com", City: "Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-DAD", Primary_Guide_ID: "GID-033", Secondary_Guide_IDs: [],
      Current_Stage: "sadhana_active", Stage_Last_Updated: "2026-06-23",
      First_Contact_Date: "2025-11-30", First_Attendance_Date: "2025-12-07", Last_Attendance_Date: "2026-06-21",
      Repeat_Attendance_Count: 12, Seva_Engagement_Status: "regular", AI_Risk_Flag: "none",
      Primary_Source: "referral", Source_Detail: "referred by FSK-0093", Referral_Contact_ID: "CNT-100255",
      Created_Date: "2025-11-30",
    },
    {
      Contact_ID: "CNT-100288", FOLK_Seeker_ID: "FSK-0104", Full_Name: "Suresh Pillai",
      Phone: "+91 95•••• 12", Email: "suresh.p••@example.com", City: "Hyderabad",
      Center_ID: "CTR-HYD", Center_Node_ID: "CND-HYD-MAIN", Primary_Guide_ID: "GID-007", Secondary_Guide_IDs: ["GID-052"],
      Current_Stage: "potential_preacher", Stage_Last_Updated: "2026-06-19",
      First_Contact_Date: "2024-09-12", First_Attendance_Date: "2024-09-19", Last_Attendance_Date: "2026-06-22",
      Repeat_Attendance_Count: 41, Seva_Engagement_Status: "core", AI_Risk_Flag: "none",
      Primary_Source: "festival", Source_Detail: "Janmashtami 2024",
      Created_Date: "2024-09-12",
    },
    {
      Contact_ID: "CNT-100290", FOLK_Seeker_ID: "FSK-0106", Full_Name: "Neha Kapoor",
      Phone: "+91 98•••• 56", Email: "neha.k••@example.com", City: "Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-THA", Primary_Guide_ID: "GID-040", Secondary_Guide_IDs: [],
      Current_Stage: "contacted", Stage_Last_Updated: "2026-05-18",
      First_Contact_Date: "2026-05-18", First_Attendance_Date: null, Last_Attendance_Date: null,
      Repeat_Attendance_Count: 1, Seva_Engagement_Status: "none", AI_Risk_Flag: "drop_off_medium",
      Primary_Source: "college_outreach", Source_Detail: "hostel room program", Campaign_ID: "CMP-IGYOUTH",
      Created_Date: "2026-05-18",
    },
    {
      Contact_ID: "CNT-100301", FOLK_Seeker_ID: "FSK-0110", Full_Name: "Aakash Verma",
      Phone: "+91 97•••• 33", Email: "aakash.v••@example.com", City: "Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-AND", Primary_Guide_ID: "GID-014", Secondary_Guide_IDs: ["GID-021"],
      Current_Stage: "attending", Stage_Last_Updated: "2026-03-05",
      First_Contact_Date: "2026-03-05", First_Attendance_Date: "2026-03-12", Last_Attendance_Date: "2026-05-02",
      Repeat_Attendance_Count: 4, Seva_Engagement_Status: "none", AI_Risk_Flag: "drop_off_high",
      Primary_Source: "college_outreach", Source_Detail: "campus stall",
      Created_Date: "2026-03-05",
    },
    {
      Contact_ID: "CNT-100312", FOLK_Seeker_ID: "FSK-0114", Full_Name: "Divya Menon",
      Phone: "+91 91•••• 20", Email: "divya.m••@example.com", City: "Navi Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-VAS", Primary_Guide_ID: "GID-033", Secondary_Guide_IDs: [],
      Current_Stage: "dormant", Stage_Last_Updated: "2024-04-01",
      First_Contact_Date: "2024-01-20", First_Attendance_Date: "2024-02-03", Last_Attendance_Date: "2024-03-28",
      Repeat_Attendance_Count: 6, Seva_Engagement_Status: "none", AI_Risk_Flag: "dormant_reengage",
      Primary_Source: "festival", Source_Detail: "Janmashtami 2023",
      Created_Date: "2024-01-20",
    },
    /* extra seekers to fill the boards / nodes */
    {
      Contact_ID: "CNT-100320", FOLK_Seeker_ID: "FSK-0118", Full_Name: "Manish Gupta",
      Phone: "+91 93•••• 71", Email: "manish.g••@example.com", City: "Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-BOR", Primary_Guide_ID: "GID-040", Secondary_Guide_IDs: [],
      Current_Stage: "new_contact", Stage_Last_Updated: "2026-06-18",
      First_Contact_Date: "2026-06-18", First_Attendance_Date: null, Last_Attendance_Date: null,
      Repeat_Attendance_Count: 0, Seva_Engagement_Status: "none", AI_Risk_Flag: "none",
      Primary_Source: "pamphlet", Source_Detail: "station distribution", Pamphlet_Batch_ID: "PMB-1109",
      Created_Date: "2026-06-18",
    },
    {
      Contact_ID: "CNT-100333", FOLK_Seeker_ID: "FSK-0122", Full_Name: "Sneha Pawar",
      Phone: "+91 94•••• 88", Email: "sneha.p••@example.com", City: "Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-DAD", Primary_Guide_ID: "GID-033", Secondary_Guide_IDs: [],
      Current_Stage: "reading_group", Stage_Last_Updated: "2026-06-15",
      First_Contact_Date: "2026-01-11", First_Attendance_Date: "2026-01-25", Last_Attendance_Date: "2026-06-19",
      Repeat_Attendance_Count: 9, Seva_Engagement_Status: "helper", AI_Risk_Flag: "none",
      Primary_Source: "referral", Source_Detail: "referred by FSK-0099", Referral_Contact_ID: "CNT-100271",
      Created_Date: "2026-01-11",
    },
    {
      Contact_ID: "CNT-100341", FOLK_Seeker_ID: "FSK-0126", Full_Name: "Rahul Khanna",
      Phone: "+91 99•••• 14", Email: "rahul.k••@example.com", City: "Hyderabad",
      Center_ID: "CTR-HYD", Center_Node_ID: "CND-HYD-MAIN", Primary_Guide_ID: "GID-052", Secondary_Guide_IDs: [],
      Current_Stage: "seva_engaged", Stage_Last_Updated: "2026-06-12",
      First_Contact_Date: "2025-07-04", First_Attendance_Date: "2025-07-18", Last_Attendance_Date: "2026-06-21",
      Repeat_Attendance_Count: 22, Seva_Engagement_Status: "regular", AI_Risk_Flag: "none",
      Primary_Source: "online_course", Source_Detail: "NOI 201", Course_ID: "CRS-NOI201",
      Created_Date: "2025-07-04",
    },
    {
      Contact_ID: "CNT-100350", FOLK_Seeker_ID: "FSK-0130", Full_Name: "Pooja Shetty",
      Phone: "+91 90•••• 60", Email: "pooja.s••@example.com", City: "Mumbai",
      Center_ID: "CTR-MUM", Center_Node_ID: "CND-MUM-AND", Primary_Guide_ID: "GID-021", Secondary_Guide_IDs: [],
      Current_Stage: "contacted", Stage_Last_Updated: "2026-06-09",
      First_Contact_Date: "2026-06-02", First_Attendance_Date: null, Last_Attendance_Date: null,
      Repeat_Attendance_Count: 0, Seva_Engagement_Status: "none", AI_Risk_Flag: "none",
      Primary_Source: "webinar", Source_Detail: "Intro webinar", Webinar_ID: "WBR-0420",
      Created_Date: "2026-06-02",
    },
  ];

  /* ---- Relationship timeline entries ---- */
  seed.timeline = [
    { Contact_ID: "CNT-100247", entries: [
      { when: "2026-06-10", type: "source", what: "Captured from Instagram youth ad (CMP-IGYOUTH)", by: "DMT_CRM" },
      { when: "2026-06-11", type: "contact", what: "Welcome WhatsApp sent (template)", by: "GID-014" },
      { when: "2026-06-12", type: "attendance", what: "Joined intro webinar WBR-0420 — 18 min dwell", by: "PRABHUPADA_WORLD" },
    ]},
    { Contact_ID: "CNT-100301", entries: [
      { when: "2026-03-05", type: "source", what: "Met at campus stall, exchanged number", by: "FOLK_CRM" },
      { when: "2026-03-12", type: "attendance", what: "First attended Tuesday reading group", by: "FOLK_CRM" },
      { when: "2026-04-02", type: "note", what: "Mentor note added (sensitive): family pressure", by: "GID-014" },
      { when: "2026-05-02", type: "attendance", what: "Last attendance — sadhana lapsed afterward", by: "FOLK_CRM" },
      { when: "2026-06-20", type: "ai", what: "Seeker Journey Agent raised drop_off_high risk", by: "agent" },
    ]},
    { Contact_ID: "CNT-100312", entries: [
      { when: "2024-01-20", type: "source", what: "First contact at Janmashtami 2023 festival", by: "FOLK_CRM" },
      { when: "2024-03-28", type: "attendance", what: "Last attendance before going dormant", by: "FOLK_CRM" },
      { when: "2024-04-10", type: "note", what: "Mentor note (restricted): personal bereavement", by: "GID-033" },
      { when: "2026-06-22", type: "ai", what: "Dormant Re-Activation Agent suggested festival hook", by: "agent" },
    ]},
    { Contact_ID: "CNT-100271", entries: [
      { when: "2025-11-30", type: "source", what: "Referred by Priya Nair (CNT-100255)", by: "FOLK_CRM" },
      { when: "2026-02-01", type: "milestone", what: "Began daily sadhana reporting", by: "SADHANA_TRACKER" },
      { when: "2026-05-15", type: "milestone", what: "Completed NOI 201 course", by: "PRABHUPADA_WORLD" },
      { when: "2026-06-23", type: "ai", what: "Sadhana Agent flagged Potential Preacher signal", by: "agent" },
    ]},
  ];

  /* ---- Follow-ups / drop-off-risk queue ---- */
  seed.followups = [
    { Followup_ID: "FUP-88231", Contact_ID: "CNT-100247", Last_Followup_Date: "2026-06-18", Next_Followup_Date: "2026-06-25",
      Next_Action: "Invite to Tuesday reading group", Next_Action_Owner: "GID-014", Followup_Channel: "whatsapp",
      Outcome: "pending", No_Response_Count: 0, Dormant_Status: "active", Recommended_Frequency: "weekly", Priority: 0.62 },
    { Followup_ID: "FUP-88240", Contact_ID: "CNT-100290", Last_Followup_Date: "2026-06-10", Next_Followup_Date: "2026-06-24",
      Next_Action: "Gentle check-in call (no pressure)", Next_Action_Owner: "GID-040", Followup_Channel: "call",
      Outcome: "pending", No_Response_Count: 2, Dormant_Status: "active", Recommended_Frequency: "biweekly", Priority: 0.71 },
    { Followup_ID: "FUP-88255", Contact_ID: "CNT-100301", Last_Followup_Date: "2026-06-12", Next_Followup_Date: "2026-06-24",
      Next_Action: "Personal touch — guide call (high risk)", Next_Action_Owner: "GID-014", Followup_Channel: "call",
      Outcome: "pending", No_Response_Count: 4, Dormant_Status: "active", Recommended_Frequency: "reduce_pause_auto", Priority: 0.93 },
    { Followup_ID: "FUP-88260", Contact_ID: "CNT-100312", Last_Followup_Date: "2024-04-15", Next_Followup_Date: "2026-06-28",
      Next_Action: "Festival re-engagement invite", Next_Action_Owner: "GID-033", Followup_Channel: "whatsapp",
      Outcome: "pending", No_Response_Count: 0, Dormant_Status: "dormant", Recommended_Frequency: "reactivation", Priority: 0.55 },
    { Followup_ID: "FUP-88271", Contact_ID: "CNT-100350", Last_Followup_Date: "2026-06-09", Next_Followup_Date: "2026-06-24",
      Next_Action: "Share intro reading list, invite to next webinar", Next_Action_Owner: "GID-021", Followup_Channel: "whatsapp",
      Outcome: "pending", No_Response_Count: 1, Dormant_Status: "active", Recommended_Frequency: "weekly", Priority: 0.48 },
  ];

  /* ---- Sadhana records (sensitive) ---- */
  seed.sadhana = [
    { Contact_ID: "CNT-100262", Sadhana_Report_Status: "active", Last_Sadhana_Report_Date: "2026-06-22", Chanting_Consistency: "steady", Rounds_Level: 8, Ashram_Level: "aspiring", Reading_Group_ID: "RDG-AND-TUE", Course_Completed: ["CRS-BG101"], Potential_Preacher_Flag: false },
    { Contact_ID: "CNT-100271", Sadhana_Report_Status: "active", Last_Sadhana_Report_Date: "2026-06-23", Chanting_Consistency: "strong", Rounds_Level: 16, Ashram_Level: "committed", Reading_Group_ID: "RDG-DAD-THU", Course_Completed: ["CRS-BG101", "CRS-NOI201"], Potential_Preacher_Flag: true },
    { Contact_ID: "CNT-100288", Sadhana_Report_Status: "active", Last_Sadhana_Report_Date: "2026-06-23", Chanting_Consistency: "strong", Rounds_Level: 16, Ashram_Level: "initiated", Reading_Group_ID: "RDG-HYD-MON", Course_Completed: ["CRS-BG101", "CRS-NOI201", "CRS-SB301"], Potential_Preacher_Flag: true },
    { Contact_ID: "CNT-100301", Sadhana_Report_Status: "lapsed", Last_Sadhana_Report_Date: "2026-05-02", Chanting_Consistency: "irregular", Rounds_Level: 4, Ashram_Level: "none", Reading_Group_ID: "RDG-AND-TUE", Course_Completed: [], Potential_Preacher_Flag: false },
    { Contact_ID: "CNT-100341", Sadhana_Report_Status: "active", Last_Sadhana_Report_Date: "2026-06-21", Chanting_Consistency: "steady", Rounds_Level: 12, Ashram_Level: "aspiring", Reading_Group_ID: "RDG-HYD-MON", Course_Completed: ["CRS-NOI201"], Potential_Preacher_Flag: false },
    { Contact_ID: "CNT-100333", Sadhana_Report_Status: "active", Last_Sadhana_Report_Date: "2026-06-20", Chanting_Consistency: "steady", Rounds_Level: 8, Ashram_Level: "aspiring", Reading_Group_ID: "RDG-DAD-THU", Course_Completed: ["CRS-BG101"], Potential_Preacher_Flag: false },
  ];

  /* ---- Mentor notes (access-controlled) ---- */
  seed.mentorNotes = [
    { Mentor_Note_ID: "MNT-5567", Contact_ID: "CNT-100255", Relationship_Timeline_ID: "RTL-100255", Author_Guide_ID: "GID-021", Sensitive_Note_Access_Level: "standard", Interest_Profile: "likes kirtan, philosophy curious", Family_Concern_Flag: false, Career_Concern_Flag: false, Spiritual_Doubts: "", Capture_Method: "manual", Note_Text: "Responds well to reading group; enjoys group chanting.", Date: "2026-06-16" },
    { Mentor_Note_ID: "MNT-5571", Contact_ID: "CNT-100301", Relationship_Timeline_ID: "RTL-100301", Author_Guide_ID: "GID-014", Sensitive_Note_Access_Level: "sensitive", Interest_Profile: "sincere but hesitant", Family_Concern_Flag: true, Career_Concern_Flag: false, Spiritual_Doubts: "fears detachment from family", Capture_Method: "voice_note", Note_Text: "Family pressure about time spent at center; fears detachment. Go gently.", Date: "2026-04-02" },
    { Mentor_Note_ID: "MNT-5578", Contact_ID: "CNT-100271", Relationship_Timeline_ID: "RTL-100271", Author_Guide_ID: "GID-033", Sensitive_Note_Access_Level: "sensitive", Interest_Profile: "strong sadhana, leadership potential", Family_Concern_Flag: false, Career_Concern_Flag: true, Spiritual_Doubts: "", Capture_Method: "manual", Note_Text: "Career-vs-seva tension; wants guidance balancing job and service.", Date: "2026-06-10" },
    { Mentor_Note_ID: "MNT-5590", Contact_ID: "CNT-100312", Relationship_Timeline_ID: "RTL-100312", Author_Guide_ID: "GID-033", Sensitive_Note_Access_Level: "restricted", Interest_Profile: "lapsed after personal loss", Family_Concern_Flag: true, Career_Concern_Flag: false, Spiritual_Doubts: "", Capture_Method: "voice_note", Note_Text: "Stopped attending after family bereavement; sensitive re-approach only via festival.", Date: "2024-04-10" },
  ];

  /* ---- Attendance ---- */
  seed.attendance = [
    { Attendance_ID: "ATT-44012", Contact_ID: "CNT-100255", Activity_Type: "reading_group", Activity_ID: "RDG-AND-TUE", Date: "2026-06-16", Mode: "offline", Duration_Min: null, Source_System: "FOLK_CRM" },
    { Attendance_ID: "ATT-44030", Contact_ID: "CNT-100262", Activity_Type: "course", Activity_ID: "CRS-BG101", Date: "2026-06-20", Mode: "online", Duration_Min: 52, Source_System: "PRABHUPADA_WORLD" },
    { Attendance_ID: "ATT-44041", Contact_ID: "CNT-100247", Activity_Type: "webinar", Activity_ID: "WBR-0420", Date: "2026-06-12", Mode: "online", Duration_Min: 18, Source_System: "PRABHUPADA_WORLD" },
    { Attendance_ID: "ATT-44055", Contact_ID: "CNT-100271", Activity_Type: "program", Activity_ID: "EVT-2206", Date: "2026-06-21", Mode: "offline", Duration_Min: null, Source_System: "FOLK_CRM" },
    { Attendance_ID: "ATT-44060", Contact_ID: "CNT-100333", Activity_Type: "reading_group", Activity_ID: "RDG-DAD-THU", Date: "2026-06-19", Mode: "offline", Duration_Min: null, Source_System: "FOLK_CRM" },
    { Attendance_ID: "ATT-44071", Contact_ID: "CNT-100288", Activity_Type: "program", Activity_ID: "EVT-2210", Date: "2026-06-22", Mode: "offline", Duration_Min: null, Source_System: "FOLK_CRM" },
    { Attendance_ID: "ATT-44080", Contact_ID: "CNT-100341", Activity_Type: "course", Activity_ID: "CRS-NOI201", Date: "2026-06-18", Mode: "online", Duration_Min: 47, Source_System: "PRABHUPADA_WORLD" },
    { Attendance_ID: "ATT-44090", Contact_ID: "CNT-100262", Activity_Type: "reading_group", Activity_ID: "RDG-AND-TUE", Date: "2026-06-17", Mode: "online", Duration_Min: 61, Source_System: "PRABHUPADA_WORLD" },
  ];

  /* ---- Trip / Yatra readiness ---- */
  seed.trips = [
    { Link_ID: "TYL-301", Contact_ID: "CNT-100271", Yatra_ID: "YTR-MAYAPUR26", Yatra_Readiness_Level: "high", Past_Trip_Count: 2, Payment_ID: "PAY-55012", Payment_Status: "confirmed" },
    { Link_ID: "TYL-305", Contact_ID: "CNT-100288", Yatra_ID: "YTR-MAYAPUR26", Yatra_Readiness_Level: "high", Past_Trip_Count: 5, Payment_ID: "PAY-55020", Payment_Status: "confirmed" },
    { Link_ID: "TYL-309", Contact_ID: "CNT-100262", Trip_ID: "TRP-PANDHARPUR1D", Yatra_Readiness_Level: "medium", Past_Trip_Count: 0, Payment_ID: null, Payment_Status: null },
    { Link_ID: "TYL-312", Contact_ID: "CNT-100255", Trip_ID: "TRP-PANDHARPUR1D", Yatra_Readiness_Level: "low", Past_Trip_Count: 0, Payment_ID: null, Payment_Status: null },
    { Link_ID: "TYL-318", Contact_ID: "CNT-100341", Yatra_ID: "YTR-MAYAPUR26", Yatra_Readiness_Level: "medium", Past_Trip_Count: 1, Payment_ID: null, Payment_Status: null },
  ];

  /* ---- CRM mapping layer ---- */
  seed.mapping = [
    { Mapping_ID: "MAP-9001", Contact_ID: "CNT-100247", Source_System: "DMT_CRM", Source_Record_Key: "dmt_lead_77231", Match_Confidence: 0.98, Mapping_Status: "confirmed", Data_Quality_Score: 0.95 },
    { Mapping_ID: "MAP-9002", Contact_ID: "CNT-100262", Source_System: "PRABHUPADA_WORLD", Source_Record_Key: "pw_user_4410", Match_Confidence: 0.91, Mapping_Status: "confirmed", Data_Quality_Score: 0.88 },
    { Mapping_ID: "MAP-9003", Contact_ID: "CNT-100271", Source_System: "SADHANA_TRACKER", Source_Record_Key: "st_2231", Match_Confidence: 0.86, Mapping_Status: "needs_review", Data_Quality_Score: 0.72 },
    { Mapping_ID: "MAP-9004", Contact_ID: "CNT-100301", Source_System: "FOLK_CRM", Source_Record_Key: "folk_8890", Match_Confidence: 0.99, Mapping_Status: "confirmed", Data_Quality_Score: 0.90 },
    { Mapping_ID: "MAP-9005", Contact_ID: "CNT-100255", Source_System: "DMT_CRM", Source_Record_Key: "dmt_lead_77310", Match_Confidence: 0.64, Mapping_Status: "needs_review", Data_Quality_Score: 0.60 },
    { Mapping_ID: "MAP-9006", Contact_ID: "CNT-100312", Source_System: "FOLK_CRM", Source_Record_Key: "folk_5521", Match_Confidence: 0.93, Mapping_Status: "confirmed", Data_Quality_Score: 0.81 },
    { Mapping_ID: "MAP-9007", Contact_ID: "CNT-100333", Source_System: "PRABHUPADA_WORLD", Source_Record_Key: "pw_user_4580", Match_Confidence: 0.58, Mapping_Status: "needs_review", Data_Quality_Score: 0.55 },
  ];

  /* ---- ERP references (reference-only) ---- */
  seed.erp = [
    { Contact_ID: "CNT-100271", Payment_ID: "PAY-55012", Receipt_ID: "RCT-31002", Approval_ID: "APR-7781", Event_ID: "YTR-MAYAPUR26", Donation_ID: null, Amount: "₹ 8,500", Purpose: "Mayapur Yatra 2026", Status: "confirmed" },
    { Contact_ID: "CNT-100288", Payment_ID: "PAY-55020", Receipt_ID: "RCT-31010", Approval_ID: "APR-7790", Event_ID: "YTR-MAYAPUR26", Donation_ID: null, Amount: "₹ 8,500", Purpose: "Mayapur Yatra 2026", Status: "confirmed" },
    { Contact_ID: "CNT-100341", Payment_ID: null, Receipt_ID: null, Approval_ID: null, Event_ID: "EVT-2210", Donation_ID: "DON-2255", Amount: "₹ 1,100", Purpose: "Festival donation", Status: "received" },
  ];

  /* ---- KCKE corpus ---- */
  seed.kcke = [
    { KCKE_Item_ID: "KCKE-BG-0307", Title: "Acting without attachment", Source_Reference: "Bhagavad-gita 3.7", Topic: "karma-yoga for students", Audience: "college youth", Content_Type: "outline", Approved_For_Public: true },
    { KCKE_Item_ID: "KCKE-BG-0218", Title: "The soul is eternal", Source_Reference: "Bhagavad-gita 2.18", Topic: "facing loss/grief", Audience: "grieving seeker", Content_Type: "qa", Approved_For_Public: true },
    { KCKE_Item_ID: "KCKE-NOI-05", Title: "Six favorable practices", Source_Reference: "Nectar of Instruction, v.5", Topic: "building sadhana", Audience: "reading group", Content_Type: "reading_list", Approved_For_Public: true },
    { KCKE_Item_ID: "KCKE-SB-0102", Title: "Inquiry into the Absolute", Source_Reference: "Srimad-Bhagavatam 1.1.2", Topic: "philosophy seekers", Audience: "advanced", Content_Type: "outline", Approved_For_Public: false },
    { KCKE_Item_ID: "KCKE-BG-0913", Title: "The most confidential knowledge", Source_Reference: "Bhagavad-gita 9.2", Topic: "bhakti essentials", Audience: "college youth", Content_Type: "outline", Approved_For_Public: true },
  ];

  /* ---- Content Factory jobs ---- */
  seed.cfJobs = [
    { CF_Job_ID: "CF-1042", Requested_By: "GID-040", Brief: 'College talk deck: "Acting without attachment"', Grounding_Refs: ["KCKE-BG-0307"], Status: "delivered", Artifact_ID: "ART-2207", Media_Asset_ID: "MED-7781", Requested_Date: "2026-06-15" },
    { CF_Job_ID: "CF-1050", Requested_By: "GID-033", Brief: "Grief-sensitive follow-up reading sheet", Grounding_Refs: ["KCKE-BG-0218"], Status: "in_production", Artifact_ID: null, Media_Asset_ID: null, Requested_Date: "2026-06-20" },
    { CF_Job_ID: "CF-1055", Requested_By: "GID-007", Brief: "Janmashtami reactivation reel", Grounding_Refs: ["KCKE-NOI-05"], Status: "requested", Artifact_ID: null, Media_Asset_ID: "MED-7790", Requested_Date: "2026-06-23" },
  ];

  /* ---- Approvals ---- */
  seed.approvals = [
    { Approval_ID: "APPR-3301", Item_Type: "dormant_recontact", Item_Ref: "FUP-88260", Contact_ID: "CNT-100312", Requested_By: "Dormant Re-Activation Agent", Approver_ID: "GID-033", Status: "pending", Reason: "", Timestamp: "2026-06-22 18:02", Payload: "Festival re-engagement invite (gentle, via Janmashtami)." },
    { Approval_ID: "APPR-3305", Item_Type: "yatra_invite", Item_Ref: "TYL-309", Contact_ID: "CNT-100262", Requested_By: "Yatra/Trip Interest Agent", Approver_ID: "GID-007", Status: "approved", Reason: "Good engagement; ready for 1-day trip.", Timestamp: "2026-06-22 18:40", Payload: "Invite to Pandharpur 1-day trip." },
    { Approval_ID: "APPR-3310", Item_Type: "public_content", Item_Ref: "CF-1055", Contact_ID: null, Requested_By: "GID-007", Approver_ID: "GID-007", Status: "pending", Reason: "", Timestamp: "2026-06-23 10:15", Payload: "Janmashtami reactivation reel — public devotional content." },
    { Approval_ID: "APPR-3312", Item_Type: "sensitive_followup", Item_Ref: "FUP-88255", Contact_ID: "CNT-100301", Requested_By: "Program Follow-up Agent", Approver_ID: "GID-014", Status: "edited", Reason: "Softened tone; switched from auto-WhatsApp to personal call.", Timestamp: "2026-06-23 09:25", Payload: "High-risk follow-up — over-contact safeguard triggered (4 no-responses)." },
  ];

  /* ---- Audit log ---- */
  seed.audit = [
    { Audit_ID: "AUD-99001", Actor: "Seeker Journey Agent", Actor_Type: "agent", Action: "stage_change_proposed (attending → risk_flag)", Entity_Ref: "FSK-0110 / CNT-100301", Center_Node_ID: "CND-MUM-AND", Timestamp: "2026-06-23 09:14" },
    { Audit_ID: "AUD-99002", Actor: "GID-014", Actor_Type: "user", Action: "mentor_note_read (sensitive)", Entity_Ref: "MNT-5571", Center_Node_ID: "CND-MUM-AND", Timestamp: "2026-06-23 09:20" },
    { Audit_ID: "AUD-99003", Actor: "GID-014", Actor_Type: "user", Action: "followup_draft_edited + approved", Entity_Ref: "FUP-88255", Center_Node_ID: "CND-MUM-AND", Timestamp: "2026-06-23 09:25" },
    { Audit_ID: "AUD-99004", Actor: "Data Quality Agent", Actor_Type: "agent", Action: "mapping_flagged_needs_review", Entity_Ref: "MAP-9005", Center_Node_ID: "CND-MUM-AND", Timestamp: "2026-06-23 07:02" },
    { Audit_ID: "AUD-99005", Actor: "GID-007", Actor_Type: "user", Action: "yatra_invite_approved", Entity_Ref: "APPR-3305", Center_Node_ID: "CND-HYD-MAIN", Timestamp: "2026-06-22 18:40" },
  ];

  /* ---- Program / course / reading-group catalog ---- */
  seed.catalog = [
    { Activity_ID: "RDG-AND-TUE", Name: "Andheri Tuesday Reading Group", Type: "reading_group", Center_Node_ID: "CND-MUM-AND", Mode: "hybrid" },
    { Activity_ID: "RDG-DAD-THU", Name: "Dadar Thursday Reading Group", Type: "reading_group", Center_Node_ID: "CND-MUM-DAD", Mode: "offline" },
    { Activity_ID: "RDG-HYD-MON", Name: "Hyderabad Monday Reading Group", Type: "reading_group", Center_Node_ID: "CND-HYD-MAIN", Mode: "offline" },
    { Activity_ID: "CRS-BG101", Name: "Bhagavad-gita 101", Type: "course", Center_Node_ID: "*", Mode: "online" },
    { Activity_ID: "CRS-NOI201", Name: "Nectar of Instruction 201", Type: "course", Center_Node_ID: "*", Mode: "online" },
    { Activity_ID: "CRS-SB301", Name: "Srimad-Bhagavatam 301", Type: "course", Center_Node_ID: "*", Mode: "online" },
    { Activity_ID: "WBR-0420", Name: "Intro to Bhakti Webinar", Type: "webinar", Center_Node_ID: "*", Mode: "online" },
    { Activity_ID: "EVT-2206", Name: "Sunday Feast Program", Type: "program", Center_Node_ID: "CND-MUM-DAD", Mode: "offline" },
    { Activity_ID: "EVT-2210", Name: "Hyderabad Sunday Program", Type: "program", Center_Node_ID: "CND-HYD-MAIN", Mode: "offline" },
  ];

  /* ---- Roles & routing matrix ---- */
  seed.routing = [
    { Process: "Follow-up send", Owner: "GID-014", Performer: "GID-021", Approver: "GID-014", Backup: "GID-021", Escalation: "GID-007", Reviewer: "GID-007", Data_Steward: "OWN-003" },
    { Process: "Stage change (sensitive)", Owner: "GID-007", Performer: "GID-014", Approver: "GID-007", Backup: "GID-033", Escalation: "GID-007", Reviewer: "GID-007", Data_Steward: "OWN-003" },
    { Process: "Public content", Owner: "GID-007", Performer: "GID-040", Approver: "GID-007", Backup: "GID-052", Escalation: "GID-007", Reviewer: "GID-007", Data_Steward: "OWN-003" },
    { Process: "CRM mapping merge", Owner: "OWN-003", Performer: "OWN-003", Approver: "OWN-003", Backup: "GID-007", Escalation: "GID-007", Reviewer: "GID-007", Data_Steward: "OWN-003" },
  ];

  /* ---- API usage metering (central billing, per node) ---- */
  seed.apiUsage = [
    { Center_Node_ID: "CND-HYD-MAIN", KCKE: 412, Content: 38, Media: 12, Voice: 6 },
    { Center_Node_ID: "CND-MUM-AND", KCKE: 286, Content: 24, Media: 9, Voice: 11 },
    { Center_Node_ID: "CND-MUM-DAD", KCKE: 154, Content: 14, Media: 4, Voice: 3 },
    { Center_Node_ID: "CND-MUM-THA", KCKE: 92, Content: 8, Media: 2, Voice: 1 },
    { Center_Node_ID: "CND-MUM-VAS", KCKE: 47, Content: 3, Media: 1, Voice: 0 },
    { Center_Node_ID: "CND-MUM-BOR", KCKE: 61, Content: 5, Media: 1, Voice: 0 },
  ];

  /* unit prices for the mock metered billing (CENTRAL API billing) */
  seed.apiPrices = { KCKE: 0.40, Content: 6.0, Media: 9.0, Voice: 1.2 };

  /* ---- FOLK Asset Library (approved assets returned from Content Factory/Media) ---- */
  seed.assets = [
    { Asset_ID: "ART-2207", Title: "College talk deck — Acting without attachment", Asset_Type: "deck", CF_Job_ID: "CF-1042", Grounding_Refs: ["KCKE-BG-0307"], Media_Asset_ID: "MED-7781", Approved_By: "GID-007", Approved_Date: "2026-06-16", Status: "approved" },
  ];

  /* ---- Field-outreach signals (college/hostel/room) for prioritization agent ---- */
  // responsiveness signals; mapped to existing contacts by source type
  seed.fieldSignals = [
    { Contact_ID: "CNT-100247", Channel: "instagram_dm", Response_Latency_Hrs: 3, Opened: true, Replied: true, Outreach_Type: "paid_social" },
    { Contact_ID: "CNT-100290", Channel: "hostel_visit", Response_Latency_Hrs: 30, Opened: true, Replied: false, Outreach_Type: "college_outreach" },
    { Contact_ID: "CNT-100301", Channel: "campus_stall", Response_Latency_Hrs: 72, Opened: true, Replied: false, Outreach_Type: "college_outreach" },
    { Contact_ID: "CNT-100320", Channel: "pamphlet_qr", Response_Latency_Hrs: 8, Opened: true, Replied: true, Outreach_Type: "pamphlet" },
    { Contact_ID: "CNT-100350", Channel: "webinar_followup", Response_Latency_Hrs: 5, Opened: true, Replied: true, Outreach_Type: "webinar" },
  ];

  FOLK.seed = seed;
})(window.FOLK = window.FOLK || {});
