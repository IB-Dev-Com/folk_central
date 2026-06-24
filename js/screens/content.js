/* ============================================================================
   WF-015 FOLK — Content: Presentation Copilot (KCKE) + Content Factory
   Request / Handoff (WF-04 + Media AI).
   KCKE is read-only & source-grounded; public devotional content is human-approved.
   ========================================================================== */
(function (FOLK) {
  "use strict";
  const { store, util, c, spine, agents, router } = FOLK;
  const esc = util.esc;
  const S = FOLK.screens = FOLK.screens || {};

  let selected = [];   // chosen KCKE items
  let lastGen = null;  // last generated content

  /* ---------- Content Presentation Copilot ---------- */
  S.content = {
    title: "Presentation Copilot",
    render() {
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Content Presentation Copilot</div><div class="page__sub">Generate <b>source-grounded</b> talk outlines, Q&amp;A and reading lists from the KCKE knowledge engine, with citations to Prabhupada / scripture. Generic AI must not produce spiritual content — only KCKE-grounded items are used, and public/devotional output is human-approved.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">KCKE</span><span class="nv-flag">[API: NV]</span></div>
        </div>
        <div class="cols">
          <div class="stack">
            <div class="card"><div class="card__head"><h3>1 · Brief</h3></div><div class="card__body">
              <div class="grid grid--2">
                <div class="field"><label>Audience</label><select class="ctrl" id="cp-aud">
                  <option value="college youth">College youth</option>
                  <option value="reading group">Reading group</option>
                  <option value="grieving seeker">Grieving seeker</option>
                  <option value="advanced">Advanced</option>
                  <option value="any">Any</option>
                </select></div>
                <div class="field"><label>Format</label><select class="ctrl" id="cp-fmt">
                  <option value="outline">Talk outline</option>
                  <option value="qa">Q&amp;A set</option>
                  <option value="reading_list">Reading list</option>
                </select></div>
              </div>
              <div class="field" style="margin-top:10px"><label>Topic</label><input class="ctrl" id="cp-topic" placeholder="e.g. acting without attachment" value="acting without attachment"/></div>
              <button class="btn btn--indigo btn--sm" id="cp-search" style="margin-top:12px">🔎 Search KCKE corpus</button>
            </div></div>
            <div class="card" id="cp-results-card" style="display:none"><div class="card__head"><h3>2 · KCKE source items</h3><div class="spacer"></div><span class="muted small">select to ground the content</span></div><div class="card__body" id="cp-results"></div></div>
          </div>
          <div class="stack">
            <div class="card"><div class="card__head"><h3>3 · Generated (grounded)</h3><div class="spacer"></div><span class="badge badge--ai">✦ + human approval</span></div>
              <div class="card__body" id="cp-output">${c.empty("Search KCKE and select source items, then generate.", "✦")}</div></div>
          </div>
        </div>
      </div>`;
    },
    mount() {
      selected = [];
      document.getElementById("cp-search").onclick = doSearch;
    },
  };

  async function doSearch() {
    const topic = document.getElementById("cp-topic").value.trim();
    const audience = document.getElementById("cp-aud").value;
    const card = document.getElementById("cp-results-card");
    const host = document.getElementById("cp-results");
    card.style.display = "";
    host.innerHTML = c.loading("Querying KCKE knowledge engine…");
    const items = await spine.kcke.search({ topic, audience });
    if (!items.length) { host.innerHTML = c.empty("No KCKE items matched — broaden the topic/audience"); return; }
    host.innerHTML = items.map((it) => `
      <label class="row between" style="padding:8px;border:1px solid var(--c-border);border-radius:var(--r-sm);margin-bottom:8px;cursor:pointer">
        <span><input type="checkbox" data-kcke="${it.KCKE_Item_ID}"> <b>${esc(it.Title)}</b>
          <div class="xs muted" style="margin-left:22px">${esc(it.Source_Reference)} · ${esc(util.titleCase(it.Content_Type))} · ${esc(it.Audience)}</div></span>
        ${it.Approved_For_Public ? c.badge("public-approved", "success") : c.badge("review required", "warn")}
      </label>`).join("") + `<button class="btn btn--ai btn--sm" id="cp-gen" style="margin-top:6px" disabled>✦ Generate grounded content</button>`;
    host.querySelectorAll("[data-kcke]").forEach((cb) => cb.onchange = () => {
      selected = Array.from(host.querySelectorAll("[data-kcke]:checked")).map((x) => store.state.kcke.find((k) => k.KCKE_Item_ID === x.dataset.kcke));
      document.getElementById("cp-gen").disabled = selected.length === 0;
    });
    host.querySelector("#cp-gen").onclick = doGenerate;
  }

  async function doGenerate() {
    const topic = document.getElementById("cp-topic").value.trim();
    const audience = document.getElementById("cp-aud").value;
    const format = document.getElementById("cp-fmt").value;
    const out = document.getElementById("cp-output");
    out.innerHTML = c.loading("Generating source-grounded content…");
    const res = await spine.kcke.generate({ items: selected, format, audience, topic });
    lastGen = res;
    store.audit("kcke_content_generated (" + format + ")", topic, { actor: agents.contentPresentation.name, actorType: "agent" });
    out.innerHTML = renderGenerated(res);
    bindGenerated(res);
  }

  function renderGenerated(res) {
    let body = "";
    if (res.format === "qa") body = res.body.map((x) => `<div style="margin-bottom:10px"><div class="small"><b>${esc(x.q)}</b></div><div class="small">${esc(x.a)}</div><div class="xs muted">cite: ${x.cite.replace(/\*/g, "")}</div></div>`).join("");
    else if (res.format === "reading_list") body = `<ol style="margin:0;padding-left:18px">${res.body.map((x) => `<li class="small" style="margin-bottom:6px">${x.item.replace(/\*/g, "")} — <span class="muted">${esc(x.why)}</span></li>`).join("")}</ol>`;
    else body = res.body.map((x) => `<div style="margin-bottom:10px"><div class="small"><b>${esc(x.h)}</b></div><div class="small">${esc(x.p)}</div>${x.cite ? `<div class="xs muted">cite: ${x.cite.replace(/\*/g, "")}</div>` : ""}</div>`).join("");
    return `
      <div class="ai-block" style="margin-bottom:12px"><div class="ai-block__head"><span class="spark">✦</span>Grounded ${esc(util.titleCase(res.format))} · ${esc(res.audience)}</div>
        ${body}
      </div>
      <div class="card" style="box-shadow:none;border-color:var(--c-border)"><div class="card__body">
        <div class="small"><b>Citations</b> (source-grounded — KCKE)</div>
        <div class="tag-list" style="margin-top:6px">${res.citations.map((cc) => `<span class="badge badge--info" title="${esc(cc.title)}">${esc(cc.id)} · ${esc(cc.ref)}</span>`).join("")}</div>
      </div></div>
      <div class="gov-banner warn" style="margin-top:12px">⚠ Public/devotional content requires human approval before use.</div>
      <div class="row" style="margin-top:12px;gap:8px">
        <button class="btn btn--primary btn--sm" id="cp-approve">Route for approval</button>
        <button class="btn btn--indigo btn--sm" id="cp-handoff">Hand off to Content Factory →</button>
      </div>`;
  }

  function bindGenerated(res) {
    document.getElementById("cp-approve").onclick = () => {
      store.addApproval({ Approval_ID: util.rid("APPR"), Item_Type: "public_content", Item_Ref: res.citations.map((x) => x.id).join(","), Contact_ID: null, Requested_By: store.session.userId, Approver_ID: "GID-007", Status: "pending", Reason: "", Timestamp: util.now(), Payload: `${util.titleCase(res.format)} on "${res.topic}" for ${res.audience}. Grounded: ${res.citations.map((x) => x.id).join(", ")}.` });
      store.commit(); c.toast("Content routed for human approval", "info");
    };
    document.getElementById("cp-handoff").onclick = () => {
      sessionStorage.setItem("cp_handoff", JSON.stringify({ brief: `${util.titleCase(res.format)} on "${res.topic}" for ${res.audience}`, refs: res.citations.map((x) => x.id) }));
      router.navigate("/factory");
    };
  }

  /* ---------- Content Factory Request / Handoff ---------- */
  S.factory = {
    title: "Content Factory Handoff",
    render() {
      const jobs = store.state.cfJobs;
      let handoff = null;
      try { handoff = JSON.parse(sessionStorage.getItem("cp_handoff") || "null"); } catch (e) {}
      return `<div class="page">
        <div class="page__head">
          <div><div class="page__title">Content Factory Request / Handoff</div><div class="page__sub">Send a creative brief (with KCKE grounding refs) to the Content Factory (WF-04). Track the job to a delivered artifact, and request Media AI assets. The handoff and approval are shown explicitly.</div></div>
          <div class="spacer"></div><div class="page__actions"><span class="seam-chip">WF-04</span><span class="seam-chip">MEDIA</span><span class="seam-chip">KCKE</span></div>
        </div>
        <div class="cols">
          <div class="stack">
            <div class="card"><div class="card__head"><h3>New content-generation job</h3></div><div class="card__body">
              <div class="field"><label>Creative brief</label><textarea class="ctrl" id="cf-brief" rows="3" placeholder="Describe the asset to produce">${handoff ? esc(handoff.brief) : ""}</textarea></div>
              <div class="field" style="margin-top:10px"><label>Grounding refs (KCKE item IDs, comma-separated)</label><input class="ctrl" id="cf-refs" value="${handoff ? esc(handoff.refs.join(", ")) : ""}" placeholder="KCKE-BG-0307"/></div>
              <label class="row small" style="gap:6px;margin-top:10px"><input type="checkbox" id="cf-media"> Also request a Media AI asset (reel / storyboard / visual)</label>
              <button class="btn btn--primary btn--sm" id="cf-submit" style="margin-top:12px">Submit to Content Factory →</button>
              ${handoff ? `<div class="xs muted" style="margin-top:8px">Pre-filled from the Presentation Copilot handoff.</div>` : ""}
            </div></div>
            ${c.govBanner("Boundary: Media AI produces reels/storyboards/visuals only — never CRM/ERP or a source of spiritual truth. Public output stays human-approved.")}
          </div>
          <div class="stack">
            <div class="card"><div class="card__head"><h3>Jobs &amp; handoff status</h3></div><div class="card__body card__body--flush">
              <table class="table"><thead><tr><th>Job</th><th>Brief</th><th>Status</th><th>Artifact</th><th></th></tr></thead>
              <tbody id="cf-rows">${jobs.map(jobRow).join("")}</tbody></table>
            </div></div>
          </div>
        </div>
      </div>`;
    },
    mount() {
      document.getElementById("cf-submit").onclick = submitJob;
      bindJobRows();
      sessionStorage.removeItem("cp_handoff");
    },
  };

  function jobRow(j) {
    const statusTone = { requested: "neutral", in_production: "warn", delivered: "success" }[j.Status];
    return `<tr data-job="${j.CF_Job_ID}">
      <td>${c.idChip(j.CF_Job_ID)}<div class="xs muted">${esc(c.guideName(j.Requested_By))}</div></td>
      <td class="small">${esc(j.Brief)}<div class="xs muted">refs: ${(j.Grounding_Refs || []).join(", ") || "—"}</div></td>
      <td>${c.badge(util.titleCase(j.Status), statusTone)}</td>
      <td>${j.Artifact_ID ? c.idChip(j.Artifact_ID) : "—"}${j.Media_Asset_ID ? "<br>" + c.idChip(j.Media_Asset_ID) : ""}</td>
      <td>${j.Status !== "delivered" ? `<button class="btn btn--sm" data-advance="${j.CF_Job_ID}">Advance ▸</button>` : c.badge("✓ done", "success")}</td>
    </tr>`;
  }

  function bindJobRows() {
    document.querySelectorAll("[data-advance]").forEach((b) => b.onclick = async () => {
      b.disabled = true; b.innerHTML = `<span class="spinner"></span>`;
      await spine.contentFactory.advance(b.dataset.advance);
      store.commit();
      c.toast("Content Factory job advanced", "info");
    });
  }

  async function submitJob() {
    const brief = document.getElementById("cf-brief").value.trim();
    if (!brief) { c.toast("Enter a brief first", "warn"); return; }
    const refs = document.getElementById("cf-refs").value.split(",").map((x) => x.trim()).filter(Boolean);
    const wantsMedia = document.getElementById("cf-media").checked;
    const btn = document.getElementById("cf-submit");
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Submitting…`;
    const job = await spine.contentFactory.submitJob({ brief, groundingRefs: refs, requestedBy: store.session.userId, wantsMedia });
    if (wantsMedia) await spine.media.requestAsset({ spec: "reel/storyboard for: " + brief, requestedBy: store.session.userId });
    store.commit();
    c.toast("Job " + job.CF_Job_ID + " submitted to Content Factory", "success");
  }

  FOLK.screens = S;
})(window.FOLK = window.FOLK || {});
