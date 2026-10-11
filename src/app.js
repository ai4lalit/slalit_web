(function(){
"use strict";
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
};
const P = DATA.profile;
const S = DATA.site;
/* fill {caseStudyCount}/{articleCount} tokens; **bold** -> <strong> */
const fill = t => String(t ?? "").replace("{caseStudyCount}", DATA.projects.length).replace("{articleCount}", DATA.articles.length);
const md = t => esc(fill(t)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const I = {
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.5L16 9.5"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  strategy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  ai:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/></svg>',
  people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.8.3 5 2.6 5 5.8"/></svg>',
  transformation:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h11l-3-3M20 17H9l3 3"/><path d="M19 7a4 4 0 0 1 1 3M5 17a4 4 0 0 1-1-3"/></svg>',
  linkedin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4z"/></svg>'
};
const NAV = [["home","Home"],["work","Work"],["thinking","Thinking"],["journey","Journey"],["about","About"],["photography","Photography"],["resume","Résumé"]];

/* ---------------- THEME ---------------- */
const root = document.documentElement;
function systemDark(){ return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches; }
function currentTheme(){ return root.getAttribute("data-theme") || (systemDark() ? "dark" : "light"); }
const savedTheme = store.get("ls-theme", null);
if (savedTheme === "light" || savedTheme === "dark") root.setAttribute("data-theme", savedTheme);
function toggleTheme(){
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  store.set("ls-theme", next);
  $("#themeBtn").setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
  toast(next === "dark" ? "Dark mode on" : "Light mode on");
}
$("#themeBtn").addEventListener("click", toggleTheme);

/* ---------------- UTIL ---------------- */
let toastT;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("show"), 2200); }
async function copyText(text, btn){
  try{ await navigator.clipboard.writeText(text); toast("Copied: " + (text.length > 40 ? "message text" : text)); }
  catch(e){
    const r = document.createRange(); const n = btn && btn.closest("[data-copy-target]") ? $(btn.closest("[data-copy-target]").dataset.copyTarget) : null;
    if (n){ r.selectNodeContents(n); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Text selected — press Ctrl/⌘+C to copy"); }
    else toast(text);
  }
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-copy]");
  if (b){ e.preventDefault(); copyText(b.dataset.copy, b); }
});
const catCls = k => k === "enterprise" ? "amb" : "";
const projIdx = id => DATA.projects.findIndex(p => p.id === id);

/* ---------------- NAV ---------------- */
$("#navLinks").innerHTML = NAV.slice(1).map(([k,l]) => `<li><a href="#${k}" data-nav="${k}">${l}</a></li>`).join("");
$("#mobileLinks").innerHTML = NAV.map(([k,l],i) => `<a href="#${k}" data-nav="${k}">${l}<span>0${i+1}</span></a>`).join("") + `<a href="#contact" data-nav="contact">Contact<span>08</span></a>`;
$("#footWork").innerHTML = DATA.projects.slice(0,4).map(p => `<li><a href="#case.${p.id}">${esc(p.title.split(":")[0])}</a></li>`).join("") + `<li><a href="#work">All case studies</a></li>`;
const mm = $("#mobileMenu");
function setMenu(open){ mm.classList.toggle("open", open); $("#menuBtn").setAttribute("aria-expanded", open); document.body.style.overflow = open ? "hidden" : ""; if(open) $("#menuClose").focus(); }
$("#menuBtn").addEventListener("click", () => setMenu(true));
$("#menuClose").addEventListener("click", () => setMenu(false));
mm.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
window.addEventListener("scroll", () => {
  $("#nav").classList.toggle("scrolled", scrollY > 8);
  const pr = $("#progress");
  if (!pr.hidden){ const h = document.documentElement.scrollHeight - innerHeight; pr.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + "%"; }
  scrollHooks.forEach(f => f());
}, {passive:true});
let scrollHooks = [];

/* ---------------- VIEWS ---------------- */
function pageHead(eyebrow, title, lede, crumb){
  return `<header class="page-head"><div class="gridbg"></div><div class="wrap">
    <div class="crumb"><a href="#home">~/lalit</a><span>/</span><span>${crumb}</span></div>
    <h1 class="reveal">${title}</h1>${lede ? `<p class="lede reveal" style="animation-delay:.08s">${lede}</p>` : ""}
  </div></header>`;
}
function workRows(list){
  return list.map(p => `<a class="work-row" href="#case.${p.id}">
      <span class="idx">${String(projIdx(p.id)+1).padStart(2,"0")} / ${String(DATA.projects.length).padStart(2,"0")}</span>
      <div><span class="cat">${esc(p.category)}</span><h3>${esc(p.title)}</h3>
        <div class="metrics-mini">${p.metrics.map(m => `<span class="tag">${esc(m.label)} <b>${esc(m.value)}</b></span>`).join("")}</div></div>
      <p class="desc">${esc(p.description)}</p>
      <div class="yr"><span>${esc(p.year)}</span><span class="arrow-circle">${I.arrow}</span></div>
    </a>`).join("");
}
function artCard(a, feature){
  const c = /Strategy|Leadership/.test(a.category) ? "amb" : "";
  return `<a class="art-card${feature ? " feature" : ""}" href="#article.${a.id}">
    <div class="meta"><span class="c ${c}">${esc(a.category)}</span><span>${esc(a.date)}</span></div>
    <h3>${esc(a.title)}</h3>
    ${feature ? `<blockquote>${esc(a.fullContent.keyQuote)}</blockquote>` : ""}
    <p>${esc(a.shortDescription)}</p>
    <div class="foot"><span>${esc(a.readingTime)}</span><span class="r">Read ${I.arrow}</span></div>
  </a>`;
}
function ctaBand(){
  return `<section class="cta-band alt"><div class="wrap">
    <span class="eyebrow">${md(S.sections.cta.eyebrow)}</span>
    <h2 style="margin-top:18px">${md(S.sections.cta.titleLead)} <em>${md(S.sections.cta.titleAccent)}</em>${md(S.sections.cta.titleTail)}</h2>
    <div class="row"><p>${md(S.sections.cta.body)}</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary" href="#contact">Start a conversation ${I.arrow}</a><a class="btn btn-ghost" href="#resume">View résumé</a></div></div>
  </div></section>`;
}

/* HOME */
function viewHome(){
  const feat = DATA.projects, H = S.hero, X = S.sections;
  const latest = DATA.articles.slice().sort((a,b) => new Date("1 "+b.date) - new Date("1 "+a.date)).slice(0,3);
  return `
  <section class="hero"><div class="gridbg"></div><div class="wrap hero-grid">
    <div>
      <span class="status reveal"><span class="pulse"></span>${H.statusTags.map(md).join(' <span style="opacity:.4">/</span> ')}</span>
      <h1 class="reveal" style="animation-delay:.05s">${md(H.headline.lead)} <span class="thin">${md(H.headline.joiner)}</span> ${md(H.headline.middle)} <span class="acc">${md(H.headline.accent)}</span></h1>
      <p class="sub reveal" style="animation-delay:.12s">${md(H.subhead)}</p>
      <p class="intro reveal" style="animation-delay:.18s">${md(H.intro)}</p>
      <div class="hero-ctas reveal" style="animation-delay:.24s"><a class="btn btn-primary" href="${esc(H.primaryCta.href)}">${md(H.primaryCta.label)} ${I.arrow}</a><a class="btn btn-ghost" href="${esc(H.secondaryCta.href)}">${md(H.secondaryCta.label)}</a></div>
    </div>
    <figure class="portrait reveal" style="margin:0;animation-delay:.1s">
      <span class="tick tl"></span><span class="tick tr"></span><span class="tick bl"></span><span class="tick br"></span>
      <div class="portrait-frame"><img src="${esc(H.portrait.src)}" alt="${esc(H.portrait.alt)}" width="1070" height="1470"></div>
      <figcaption class="portrait-tag"><span>${md(H.portrait.captionLeft)} <b>${md(H.portrait.captionAccent)}</b></span><span>${md(H.portrait.captionRight)}</span></figcaption>
      <span class="coords">SYS // 25Y.EXP_NODE — PUNE 18.5204° N</span>
    </figure>
  </div></section>

  <div class="ticker"><div class="ticker-row">
    ${S.stats.map(x => `<div class="ticker-cell"><b>${md(x.value)}</b><span>${md(x.label)}</span></div>`).join("")}
  </div></div>

  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">${md(X.work.eyebrow)}</span><h2>${md(X.work.title)}</h2></div>
      <a class="link-arrow" href="#work">All case studies ${I.arrow}</a></div>
    <div class="work-list">${workRows(feat.slice(0, X.work.homeCount || 3))}</div>
  </div></section>

  <section class="sec alt"><div class="wrap dial-wrap">
    <div>
      <span class="eyebrow">${md(X.autonomy.eyebrow)}</span>
      <h2 style="font-size:clamp(32px,4.4vw,52px);margin-top:14px">${md(X.autonomy.title)}</h2>
      <p class="muted" style="margin-top:18px;max-width:46ch">${md(X.autonomy.body)}</p>
      <div class="seg" role="group" aria-label="Autonomy mode" id="seg">
        <span class="thumb" id="segThumb"></span>
        <button type="button" data-mode="0" aria-pressed="true">Ask</button>
        <button type="button" data-mode="1" aria-pressed="false">Assist</button>
        <button type="button" data-mode="2" aria-pressed="false">Agent</button>
      </div>
      <div class="dial-meter">
        <div class="meter"><span>Agent autonomy</span><span class="bar"><i id="mA"></i></span><span class="v" id="mAv"></span></div>
        <div class="meter"><span>Human checkpoints</span><span class="bar amber"><i id="mH"></i></span><span class="v" id="mHv"></span></div>
      </div>
      <a class="link-arrow" style="margin-top:28px" href="#article.agentic-workflows-beyond-chat">Read: Agentic workflows beyond chat ${I.arrow}</a>
    </div>
    <div class="console" aria-live="polite">
      <div class="console-bar"><span class="dots"><i></i><i></i><i></i></span><span>AMI ASSISTANT · DATA</span><span class="mode-pill" id="modePill">ASK</span></div>
      <div class="console-body" id="consoleBody"></div>
    </div>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">${md(X.leadership.eyebrow)}</span><h2>${md(X.leadership.title)}</h2></div>
      <p>${md(X.leadership.body)}</p></div>
    ${pillarsHTML()}
  </div></section>

  <section class="sec alt"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">${md(X.thinking.eyebrow)}</span><h2>${md(X.thinking.title)}</h2></div>
      <a class="link-arrow" href="#thinking">All ${DATA.articles.length} essays ${I.arrow}</a></div>
    <div class="art-grid">${artCard(latest[0], true)}${artCard(latest[1])}</div>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">${md(X.journey.eyebrow)}</span><h2>${md(X.journey.title)}</h2></div>
      <a class="link-arrow" href="#journey">See the full journey ${I.arrow}</a></div>
    <div class="arc">${DATA.career.map(c => `<a class="arc-step${c.isMilestone ? " ms" : ""}" href="#journey" data-open="${c.id}"><b>${esc(c.title)}</b><span>${esc(c.period)}</span></a>`).join("")}</div>
  </div></section>

  <section class="sec alt"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">${md(X.photography.eyebrow)}</span><h2>${md(X.photography.title)}</h2></div>
      <p>${md(X.photography.body)}</p></div>
    <div class="photo-grid" id="homePhotos"></div>
    <a class="link-arrow" href="#photography">Visit the gallery ${I.arrow}</a>
  </div></section>
  ${ctaBand()}`;
}
function pillarsHTML(){
  return `<div class="pillars">${DATA.pillars.map(p => `
    <div class="pillar" role="button" tabindex="0" aria-expanded="false">
      <span class="pi">${I[p.iconName] || I.strategy}</span>
      <h3>${esc(p.title.charAt(0) + p.title.slice(1).toLowerCase()).replace("Ux","UX").replace("Ai ","AI ")}</h3>
      <p>${esc(p.description)}</p>
      <ul>${p.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul>
      <span class="more">${I.plus}<span>How</span></span>
    </div>`).join("")}</div>`;
}
const MODES = [
  {k:"ASK", auto:15, hum:100, steps:[["Collect deadlock log for DB2P","done","Done"],["Identify conflicting transactions","wait","Approve?"],["Draft reorganisation plan","idle","Queued"],["Apply change in production","idle","Queued"]],
   note:"The agent recommends each step and waits for your explicit confirmation before it moves on.", acts:["Approve step","Edit"]},
  {k:"ASSIST", auto:55, hum:45, steps:[["Collect deadlock log for DB2P","done","Auto"],["Identify conflicting transactions","done","Auto"],["Draft reorganisation plan","run","Running"],["Apply change in production","wait","Needs you"]],
   note:"Low-risk analysis runs automatically. The agent pauses before anything that alters system state.", acts:["Review intent preview","Pause"]},
  {k:"AGENT", auto:90, hum:12, steps:[["Collect deadlock log for DB2P","done","Auto"],["Identify conflicting transactions","done","Auto"],["Draft reorganisation plan","done","Auto"],["Apply change in production","done","Logged"]],
   note:"Multi-step execution with a full audit trail and one-click rollback always in view.", acts:["View audit trail","Roll back"]}
];
function setMode(i){
  const m = MODES[i]; const body = $("#consoleBody"); if (!body) return;
  $$("#seg button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.mode === i)));
  $("#segThumb").style.transform = `translateX(${i*100}%)`;
  $("#modePill").textContent = m.k;
  $("#mA").style.width = m.auto + "%"; $("#mAv").textContent = m.auto;
  $("#mH").style.width = m.hum + "%"; $("#mHv").textContent = m.hum;
  body.innerHTML = `<div class="incident"><div><div class="mono" style="color:var(--faint)">INC-8842 · Data product line</div><h4>Deadlock spike on payments database</h4></div><span class="sev">SEV 2</span></div>
    <ol class="steps">${m.steps.map((s,j) => `<li class="step ${s[1]}"><span class="ic">${s[1]==="done" ? "✓" : s[1]==="run" ? "" : j+1}</span><span>${s[0]}</span><span class="st">${s[2]}</span></li>`).join("")}</ol>
    <div class="console-foot"><p>${m.note}</p><div class="acts">${m.acts.map((a,j) => `<button type="button" class="btn btn-sm ${j ? "btn-ghost" : "btn-primary"}" data-demo="${esc(a)}">${a}</button>`).join("")}</div></div>`;
}

/* WORK INDEX */
function viewWork(){
  const counts = {all:DATA.projects.length, ai:DATA.projects.filter(p=>p.categoryKey==="ai").length, enterprise:DATA.projects.filter(p=>p.categoryKey==="enterprise").length};
  const f = store.get("ls-workfilter","all");
  return pageHead("", md(S.sections.work.pageTitle), md(S.sections.work.pageLede), "work") + `
  <section class="sec" style="padding-top:40px"><div class="wrap">
    <div class="toolbar"><div class="filters" role="group" aria-label="Filter case studies">
      ${[["all","All"],["ai","AI experiences"],["enterprise","Enterprise UX"]].map(([k,l]) => `<button type="button" class="chip" data-wf="${k}" aria-pressed="${f===k}">${l}<span class="n">${counts[k]}</span></button>`).join("")}
    </div><span class="mono muted">2022 — 2026</span></div>
    <div class="work-list" id="workList"></div>
  </div></section>${ctaBand()}`;
}
function renderWorkList(f){
  const list = f === "all" ? DATA.projects : DATA.projects.filter(p => p.categoryKey === f);
  $("#workList").innerHTML = workRows(list);
  $$("[data-wf]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.wf === f)));
  store.set("ls-workfilter", f);
}

/* CASE STUDY */
const PHASES = [["phase1Discover","Discover"],["phase2Define","Define"],["phase3Ideate","Ideate"],["phase4Prototype","Prototype"],["phase5Implement","Implement"]];
function phasePanel(p, i){
  const ph = p.designThinkingFlow[PHASES[i][0]];
  const li = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  if (i===0) return `<p class="ov">${esc(ph.overview.replace(/^Phase \d: /,""))}</p><div class="kv">
      <div><h4>Research</h4><ul>${ph.researchAnalytics.map(r => `<li><b>${esc(r.metric)}</b> — ${esc(r.detail)}</li>`).join("")}</ul></div>
      <div><h4>Who we studied</h4>${li(ph.userCohorts)}</div>
      <div class="wide"><h4>Key insights</h4>${li(ph.keyInsights)}</div></div>`;
  if (i===1) return `<div class="problem-q"><span>How might we…</span>${esc(ph.coreProblemStatement.replace(/^How might we /i,"").replace(/^./, c=>c))}</div><div class="kv">
      <div><h4>Friction points</h4>${li(ph.cognitiveFrictionPoints)}</div>
      <div><h4>Jobs to be done</h4>${li(ph.jobsToBeDone)}</div>
      <div class="wide"><h4>Mental-model mismatch</h4><p>${esc(ph.mentalModelMisalignment)}</p></div></div>`;
  if (i===2) return `<p class="ov"><span class="mono" style="color:var(--accent);display:block;margin-bottom:8px">North star</span>${esc(ph.northStarVision)}</p>
      ${ph.architecturalShifts.map(s => `<div class="shift"><div class="from">${esc(s.from)}</div>${I.arrow}<div class="to">${esc(s.to)}</div></div><p class="shift-why">${esc(s.rationale)}</p>`).join("")}
      <div class="kv" style="margin-top:18px"><div class="wide"><h4>Trade-offs we chose</h4>${li(ph.strategicTradeOffs)}</div></div>`;
  if (i===3) return `<p class="ov">${esc(ph.validationApproach)}</p>
      <div class="scroll-x"><table class="test-table"><thead><tr><th>Test</th><th>Baseline</th><th>Prototype</th><th>Result</th></tr></thead><tbody>
      ${ph.usabilityTestingMetrics.map(t => `<tr><td>${esc(t.test)}</td><td>${esc(t.baseline)}</td><td>${esc(t.prototype)}</td><td>${esc(t.gain)}</td></tr>`).join("")}</tbody></table></div>
      <div class="kv" style="margin-top:18px"><div class="wide"><h4>Prototype highlights</h4>${li(ph.interactiveHighlights)}</div></div>`;
  return `<div class="kv"><div class="wide"><h4>Governance</h4><p>${esc(ph.governanceFramework)}</p></div>
      <div><h4>Design-system integration</h4><p>${esc(ph.designSystemIntegration)}</p></div>
      <div><h4>Feedback loops</h4><p>${esc(ph.continuousFeedbackLoops)}</p></div></div>`;
}
function viewCase(id){
  const i = projIdx(id); if (i < 0) return viewNotFound();
  const p = DATA.projects[i], prev = DATA.projects[(i - 1 + DATA.projects.length) % DATA.projects.length], next = DATA.projects[(i + 1) % DATA.projects.length];
  const L = p.leadershipPerspective, R = p.businessOutcomesAndROI;
  const toc = [["cs-overview","Overview"],["cs-process","Design process"],["cs-leadership","Leadership"],["cs-outcomes","Outcomes"],["cs-takeaway","Takeaway"]];
  return `<header class="cs-hero"><div class="gridbg"></div><div class="wrap">
    <div class="crumb"><a href="#home">~/lalit</a><span>/</span><a href="#work">work</a><span>/</span><span>${esc(p.id)}</span></div>
    <div style="margin-top:28px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span class="eyebrow" style="color:${p.categoryKey==="enterprise" ? "var(--amber)" : "var(--accent)"}">${esc(p.category)}</span><span class="tag">Case ${String(i+1).padStart(2,"0")} / ${String(DATA.projects.length).padStart(2,"0")}</span></div>
    <h1 class="reveal">${esc(p.title)}</h1>
    <p class="sub reveal" style="animation-delay:.06s">${esc(p.subtitle)}</p>
    <dl class="cs-meta reveal" style="animation-delay:.12s">
      <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
      <div><dt>Timeline</dt><dd>${esc(p.duration)}</dd></div>
      <div><dt>Team</dt><dd>${esc(p.teamComposition)}</dd></div>
      <div><dt>Stakeholders</dt><dd>${p.stakeholders.map(esc).join(" · ")}</dd></div>
    </dl>
  </div></header>
  <div class="wrap cs-layout">
    <nav class="toc" aria-label="Case study sections"><span class="mono">On this page</span>${toc.map(([h,l]) => `<a href="#${h}" data-toc="${h}">${l}</a>`).join("")}</nav>
    <div class="cs-body">
      <section class="cs-block" id="cs-overview"><span class="eyebrow">Overview</span><h2>The challenge</h2>
        <p class="lead">${esc(p.detailedSummary)}</p>
        <div class="ps" style="margin-top:28px"><div class="p"><h3>Problem</h3><p>${esc(p.problemSpace)}</p></div><div class="s"><h3>Solution</h3><p>${esc(p.solution)}</p></div></div>
        <div class="big-metrics">${p.metrics.map(m => `<div class="big-metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>
      </section>
      <section class="cs-block" id="cs-process"><span class="eyebrow">Design process</span><h2>Five phases, from evidence to delivery</h2>
        <div class="phase-tabs" role="tablist" aria-label="Design phases">${PHASES.map(([k,l],j) => `<button type="button" role="tab" id="tab-${j}" aria-controls="phasePanel" aria-selected="${j===0}" data-phase="${j}" tabindex="${j===0?0:-1}"><span class="n">0${j+1}</span><span class="t">${l}</span></button>`).join("")}</div>
        <div class="phase-panel" id="phasePanel" role="tabpanel" aria-labelledby="tab-0">${phasePanel(p,0)}</div>
      </section>
      <section class="cs-block" id="cs-leadership"><span class="eyebrow">Leadership perspective</span><h2>How I led it</h2>
        <dl class="persp">
          <div><dt>Mandate</dt><dd>${esc(L.executiveMandate)}</dd></div>
          <div><dt>Strategic role</dt><dd>${esc(L.strategicRole)}</dd></div>
          <div><dt>Cross-functional</dt><dd>${esc(L.crossFunctionalSynergy)}</dd></div>
          <div><dt>Team leadership</dt><dd>${esc(L.teamLeadership)}</dd></div>
          <div><dt>Transformation</dt><dd>${esc(L.orgTransformation)}</dd></div>
        </dl>
      </section>
      <section class="cs-block" id="cs-outcomes"><span class="eyebrow">Outcomes</span><h2>What changed</h2>
        <ul class="outcomes">${p.keyOutcomes.map(o => `<li>${I.check}<span>${esc(o)}</span></li>`).join("")}${R.commercialBenefits.map(o => `<li>${I.check}<span>${esc(o)}</span></li>`).join("")}<li>${I.check}<span>${esc(R.operationalSavings)}</span></li></ul>
        <div class="big-metrics">${R.roiMetrics.map(m => `<div class="big-metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span><p>${esc(m.context)}</p></div>`).join("")}</div>
      </section>
      <section class="cs-block" id="cs-takeaway"><div class="pull"><span class="mono">Leadership takeaway</span><span class="pull-mark">“</span>${esc(p.leadershipTakeaway)}</div></section>
    </div>
  </div>
  <div class="wrap pn">
    <a href="#case.${prev.id}"><span class="mono">← Previous case</span><b>${esc(prev.title)}</b></a>
    <a class="next" href="#case.${next.id}"><span class="mono">Next case →</span><b>${esc(next.title)}</b></a>
  </div>`;
}

/* THINKING */
function viewThinking(){
  const cats = ["All", ...new Set(DATA.articles.map(a => a.category))];
  return pageHead("", md(S.sections.thinking.pageTitle), md(S.sections.thinking.pageLede), "thinking") + `
  <section class="sec" style="padding-top:40px"><div class="wrap">
    <div class="toolbar"><div class="filters" role="group" aria-label="Filter essays">${cats.map((c,i) => `<button type="button" class="chip" data-af="${esc(c)}" aria-pressed="${i===0}">${esc(c)}<span class="n">${c==="All" ? DATA.articles.length : DATA.articles.filter(a=>a.category===c).length}</span></button>`).join("")}</div>
      <label class="search"><span class="mono" style="position:absolute;left:-9999px">Search essays</span>${I.search}<input id="artSearch" type="search" placeholder="Search essays and tags…" autocomplete="off"></label></div>
    <div class="art-grid" id="artGrid"></div>
  </div></section>`;
}
let artState = {cat:"All", q:""};
function renderArticles(){
  const q = artState.q.trim().toLowerCase();
  const list = DATA.articles.filter(a => (artState.cat === "All" || a.category === artState.cat) &&
    (!q || (a.title + " " + a.shortDescription + " " + a.tags.join(" ") + " " + a.category).toLowerCase().includes(q)));
  $("#artGrid").innerHTML = list.length ? list.map((a,i) => artCard(a, i===0 && artState.cat==="All" && !q)).join("") : `<div class="empty" style="grid-column:1/-1">No essays match “${esc(artState.q)}”. Try “trust”, “agentic” or “strategy”.</div>`;
  $$("[data-af]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.af === artState.cat)));
}
function viewArticle(id){
  const i = DATA.articles.findIndex(a => a.id === id); if (i < 0) return viewNotFound();
  const a = DATA.articles[i], F = a.fullContent;
  const related = DATA.articles.filter(x => x.id !== a.id).map(x => [x, x.tags.filter(t => a.tags.includes(t)).length + (x.category === a.category ? 1 : 0)]).sort((m,n) => n[1]-m[1]).slice(0,3).map(x=>x[0]);
  return `<article><header class="art-head wrap">
      <div class="crumb"><a href="#home">~/lalit</a><span>/</span><a href="#thinking">thinking</a><span>/</span><span>${esc(a.id)}</span></div>
      <h1 class="reveal">${esc(a.title)}</h1>
      <div class="art-meta"><b>${esc(a.category)}</b><span>${esc(a.date)}</span><span>${esc(a.readingTime)}</span><span>By Lalit Shahane</span></div>
    </header>
    <div class="wrap"><blockquote class="key-quote reveal" style="animation-delay:.08s">${esc(F.keyQuote)}</blockquote></div>
    <div class="wrap"><div class="prose">
      <p class="lead">${esc(F.lead)}</p>
      ${F.sections.map((s,j) => `<h2><span class="no">${String(j+1).padStart(2,"0")}</span>${esc(s.heading)}</h2><p>${esc(s.body)}</p>
        <blockquote>${esc(s.quote)}</blockquote>
        <ul>${s.bulletPoints.map(b => { const k = b.indexOf(":"); return `<li>${k > 0 && k < 40 ? `<b>${esc(b.slice(0,k))}:</b>${esc(b.slice(k+1))}` : esc(b)}</li>`; }).join("")}</ul>`).join("")}
      <div class="takeaways"><h3>Key takeaways</h3><ol>${F.takeaways.map(t => `<li><span>${esc(t)}</span></li>`).join("")}</ol></div>
      <div class="tags">${a.tags.map(t => `<span class="tag">#${esc(t)}</span>`).join("")}</div>
      <div class="share"><span class="mono muted">Share</span>
        <button type="button" class="copy" data-copy="${esc(a.title)} — Lalit Shahane">${I.copy}Copy title</button>
        <a class="link-arrow" href="#thinking" style="margin-left:auto">${I.back} All essays</a></div>
    </div></div>
  </article>
  <section class="sec alt"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">Keep reading</span><h2>Related essays</h2></div></div>
    <div class="art-grid">${related.map(x => artCard(x)).join("")}</div></div></section>`;
}

/* JOURNEY */
function viewJourney(){
  const ms = DATA.career.filter(c => c.isMilestone).length;
  return pageHead("", md(S.sections.journey.pageTitle), md(S.sections.journey.pageLede), "journey") + `
  <section class="sec" style="padding-top:40px"><div class="wrap" style="max-width:980px">
    <div class="tl-controls">
      <label class="switch"><input type="checkbox" id="msOnly"><span class="tr"></span><span>Show milestones only <span class="mono muted">(${ms})</span></span></label>
      <div style="display:flex;gap:8px"><button class="chip" type="button" id="expandAll">Expand all</button><button class="chip" type="button" id="collapseAll">Collapse all</button></div>
    </div>
    <div class="timeline" id="timeline"><span class="fill" id="tlFill"></span><ol class="tl-list">
    ${DATA.career.map((c,i) => `<li class="tl-item${c.isMilestone ? " ms" : ""}" id="tl-${c.id}" data-ms="${c.isMilestone}">
      <span class="tl-node"></span>
      <div class="tl-card" role="button" tabindex="0" aria-expanded="false">
        <span class="stage">STAGE ${String(i+1).padStart(2,"0")}</span>
        <span style="min-width:0"><h3>${esc(c.title)}</h3><span class="org" style="display:block">${esc(c.organization)} · ${esc(c.period)}</span>
          <span class="d" style="display:block">${esc(c.description)}</span>
          <span class="hl"><span style="display:block"><p><b>What it built</b>${esc(c.highlight)}</p></span></span></span>
        <span class="tl-side">${c.isMilestone ? `<span class="badge">Milestone</span>` : ""}<span class="plus">${I.plus}</span></span>
      </div></li>`).join("")}
    </ol></div>
    <p class="mono muted" style="margin-top:20px">Teal nodes mark major career transformation milestones.</p>
  </div></section>${ctaBand()}`;
}

/* ABOUT */
function viewAbout(){
  const A = S.about;
  return pageHead("", md(A.pageTitle), "", "about") + `
  <section class="sec"><div class="wrap about-grid">
    <figure class="about-photo" style="margin:0">
      <div class="portrait-frame"><img src="${esc(A.photo.src)}" alt="${esc(A.photo.alt)}" width="1070" height="1470" style="object-position:center 25%"></div>
      <figcaption class="mono muted" style="margin-top:14px">${md(A.photo.caption)}</figcaption>
    </figure>
    <div class="about-copy">
      <p class="big">${md(A.intro)}</p>
      ${A.paragraphs.map(t => `<p>${md(t)}</p>`).join("")}
      <div class="chips-row">${A.highlights.map(([a,b]) => `<span><b>${md(a)}</b>${md(b)}</span>`).join("")}</div>
      <h3 style="font-size:22px;margin-top:44px">Today</h3>
      <p style="margin-top:10px">${md(A.currentRole)}</p>
      <div class="portfolio-map">${A.portfolio.map(([a,b]) => `<div class="pm"><b>${md(a)}</b><span>${md(b)}</span></div>`).join("")}</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:36px"><a class="btn btn-primary" href="#journey">More about my journey ${I.arrow}</a><a class="btn btn-ghost" href="#resume">Résumé</a></div>
    </div>
  </div></section>
  <section class="sec alt"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Leadership &amp; impact</span><h2>Four areas I lead in</h2></div><p>Select a card to see how each one shows up in practice.</p></div>
    ${pillarsHTML()}
  </div></section>
  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Academic foundation</span><h2>Education &amp; credentials</h2></div></div>
    <div class="creds">${DATA.creds.map(c => `<div class="cred"><span class="seal">${I.check}</span><span class="badge">${esc(c.badge)}</span><h3>${esc(c.degree)}</h3><span class="f">${esc(c.field)}</span><p>${esc(c.institution)}</p></div>`).join("")}</div>
  </div></section>${ctaBand()}`;
}

/* PHOTOGRAPHY */
function photoStories(){ return [...store.get("ls-photos", []), ...DATA.photos]; }
const PALETTES = {
  "Light & Architecture":["#2b1a10","#8a4b1f","#e8a24a","#f6d79a"],
  "Nature & Landscapes":["#0c1f1c","#1e4a3f","#6a9a7a","#d6e6d9"],
  "Street & Culture":["#1b0f14","#6b2335","#d9733b","#f3c46b"],
  "Moments & Moods":["#0a1220","#2a3b55","#8ea2bc","#e6e2da"]
};
function hash(s){ let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function study(story, w=800, h=1000){
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const x = cv.getContext("2d"); let seed = hash(story.id); const rnd = () => ((seed = Math.imul(seed ^ seed >>> 15, 2246822507) ^ Math.imul(seed ^ seed >>> 13, 3266489909)) >>> 0) / 4294967296;
  const pal = PALETTES[story.category] || PALETTES["Moments & Moods"];
  const g = x.createLinearGradient(0,0,0,h); g.addColorStop(0,pal[3]); g.addColorStop(.55,pal[2]); g.addColorStop(1,pal[1]); x.fillStyle = g; x.fillRect(0,0,w,h);
  const sun = x.createRadialGradient(w*(.3+rnd()*.4), h*.32, 0, w*.5, h*.32, w*.7); sun.addColorStop(0,"rgba(255,244,214,.85)"); sun.addColorStop(1,"rgba(255,244,214,0)"); x.fillStyle = sun; x.fillRect(0,0,w,h);
  if (story.category === "Light & Architecture"){
    const n = 3 + Math.floor(rnd()*2), aw = w / n;
    for (let i=0;i<n;i++){ x.fillStyle = pal[0]; x.fillRect(i*aw, h*.18, aw*.16, h); x.fillRect(i*aw + aw*.84, h*.18, aw*.16, h);
      x.beginPath(); x.moveTo(i*aw, h*.18); x.lineTo(i*aw+aw, h*.18); x.lineTo(i*aw+aw, h*.42); x.quadraticCurveTo(i*aw+aw*.84, h*.24, i*aw+aw/2, h*.24); x.quadraticCurveTo(i*aw+aw*.16, h*.24, i*aw+aw*.16, h*.42); x.lineTo(i*aw, h*.42); x.fill(); }
    x.fillRect(0,0,w,h*.18); x.globalAlpha = .35; x.fillStyle = pal[3];
    for (let i=0;i<n;i++){ x.beginPath(); x.moveTo(i*aw+aw*.2,h*.45); x.lineTo(i*aw+aw*.95,h); x.lineTo(i*aw+aw*.5,h); x.fill(); } x.globalAlpha = 1;
  } else if (story.category === "Nature & Landscapes"){
    for (let l=0;l<5;l++){ x.fillStyle = l===4 ? pal[0] : `rgba(${l*10+12},${l*18+30},${l*14+28},${.35+l*.15})`; x.beginPath(); x.moveTo(0,h);
      let y = h*(.42 + l*.11); for (let px=0; px<=w; px+=w/40){ y += (rnd()-.5)*h*.04; x.lineTo(px, y - Math.sin(px/w*Math.PI*(1+l))*h*.05); } x.lineTo(w,h); x.fill();
      x.fillStyle = "rgba(240,245,240,.18)"; x.fillRect(0,h*(.48+l*.11),w,h*.03); }
  } else if (story.category === "Street & Culture"){
    for (let i=0;i<46;i++){ const r = 10 + rnd()*70; const gx = x.createRadialGradient(0,0,0,0,0,r); const c = pal[1 + Math.floor(rnd()*3)];
      x.save(); x.translate(rnd()*w, rnd()*h*.75); gx.addColorStop(0, c); gx.addColorStop(1, "rgba(0,0,0,0)"); x.globalAlpha = .55; x.fillStyle = gx; x.beginPath(); x.arc(0,0,r,0,7); x.fill(); x.restore(); }
    x.fillStyle = pal[0]; x.beginPath(); x.ellipse(w*.5, h*.86, w*.2, h*.06, 0, 0, 7); x.fill(); x.beginPath(); x.arc(w*.5, h*.62, w*.07, 0, 7); x.fill(); x.fillRect(w*.38, h*.68, w*.24, h*.2);
    x.fillStyle = "#f3b24a"; for (let i=0;i<5;i++){ x.beginPath(); x.ellipse(w*(.3+i*.1), h*.93, 14, 7, 0, 0, 7); x.fill(); }
  } else {
    for (let i=0;i<9;i++){ x.fillStyle = `rgba(230,226,218,${.05+rnd()*.08})`; x.fillRect(0, h*(.5+i*.05), w, 2+rnd()*6); }
    x.fillStyle = pal[0]; const by = h*.62; x.beginPath(); x.moveTo(w*.28,by); x.quadraticCurveTo(w*.5,by+h*.06,w*.74,by-6); x.lineTo(w*.7,by+h*.03); x.quadraticCurveTo(w*.5,by+h*.07,w*.32,by+h*.03); x.fill();
    x.fillRect(w*.5,by-h*.09,8,h*.09); x.beginPath(); x.arc(w*.5+4,by-h*.1,12,0,7); x.fill();
    x.globalAlpha = .3; x.fillRect(w*.3, by+h*.08, w*.42, 3); x.globalAlpha = 1;
  }
  const grain = x.getImageData(0,0,w,h), d = grain.data; for (let i=0;i<d.length;i+=4){ const n=(rnd()-.5)*18; d[i]+=n; d[i+1]+=n; d[i+2]+=n; } x.putImageData(grain,0,0);
  const vg = x.createRadialGradient(w/2,h/2,w*.3,w/2,h/2,w*.85); vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,.45)"); x.fillStyle = vg; x.fillRect(0,0,w,h);
  return cv;
}
const studyCache = {};
function photoMedia(s, big){
  if (s.imageUrl) return `<img src="${esc(s.imageUrl)}" alt="${esc(s.title)} — ${esc(s.location)}" loading="lazy">`;
  return `<canvas data-study="${esc(s.id)}" width="800" height="${big ? 900 : [1000,820,1060,900][hash(s.id)%4]}" aria-label="Light study for ${esc(s.title)}"></canvas>`;
}
function hydrateStudies(scope){
  $$("canvas[data-study]", scope).forEach(cv => {
    const s = photoStories().find(p => p.id === cv.dataset.study); if (!s) return;
    const key = s.id + cv.height; if (!studyCache[key]) studyCache[key] = study(s, 800, cv.height).toDataURL("image/jpeg", .85);
    const img = new Image(); img.onload = () => cv.getContext("2d").drawImage(img, 0, 0); img.src = studyCache[key];
  });
}
function photoCard(s){
  return `<div class="photo-card" role="button" tabindex="0" data-photo="${esc(s.id)}">
    <div class="img">${photoMedia(s)}${s.imageUrl ? "" : `<span class="study">Light study</span>`}<div class="exif">${s.exif ? [s.exif.aperture, s.exif.shutter, "ISO " + s.exif.iso].filter(Boolean).map(e => `<span>${esc(e)}</span>`).join("") : ""}</div></div>
    <div class="cap"><span class="mono">${esc(s.category)}${s.mine ? `<span class="mine">Added by you</span>` : ""}</span><h3>${esc(s.title)}</h3><p>${esc(s.subtitle)}</p>
      <span class="loc">${I.pin}${esc(s.location)} · ${esc(s.year)}</span></div></div>`;
}
function viewPhotography(){
  const cats = ["All", ...new Set(DATA.photos.map(p => p.category))];
  return pageHead("", md(S.sections.photography.pageTitle), md(S.sections.photography.pageLede), "photography") + `
  <section class="sec" style="padding-top:40px"><div class="wrap">
    <div class="toolbar"><div class="filters" role="group" aria-label="Filter photo stories">${cats.map((c,i) => `<button type="button" class="chip" data-pf="${esc(c)}" aria-pressed="${i===0}">${esc(c)}</button>`).join("")}</div>
      <button type="button" class="btn btn-primary btn-sm" id="addStory">${I.plus.replace('<svg','<svg width="16" height="16"')} Post a photo story</button></div>
    <div class="photo-grid" id="photoGrid"></div>
    <p class="mono muted" style="margin-top:12px">Frames marked “Light study” are generated colour studies standing in until the original photograph is added.</p>
  </div></section>`;
}
let photoCat = "All";
function renderPhotos(){
  const list = photoStories().filter(s => photoCat === "All" || s.category === photoCat);
  const g = $("#photoGrid"); g.innerHTML = list.length ? list.map(photoCard).join("") : `<div class="empty">No stories in this category yet.</div>`;
  hydrateStudies(g);
  $$("[data-pf]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.pf === photoCat)));
}

/* RESUME */
function viewResume(){
  return `<div class="wrap"><div class="crumb" style="padding-top:32px"><a href="#home">~/lalit</a><span>/</span><span>resume</span></div>
  <div class="resume reveal">
    <div class="rs-head"><div><h1>Lalit Shahane</h1><p class="role">${md(S.resume.title)}</p><p class="muted" style="margin-top:6px;font-size:15px">${md(S.resume.currentRole)}</p></div>
      <div class="ct"><span>${esc(P.location)}</span><span>${esc(P.email)} <button class="copy" type="button" data-copy="${esc(P.email)}" style="margin-left:6px">${I.copy}Copy</button></span><a href="${esc(P.linkedInUrl)}" target="_blank" rel="noopener">${esc(P.linkedInDisplay)} ↗</a></div></div>
    <div class="rs-sec"><h2>Summary</h2><p>${md(S.resume.summary)}</p></div>
    <div class="rs-sec"><h2>Competencies</h2><div class="rs-comp">${DATA.pillars.map(p => `<div><b>${esc(p.title)}</b><span>${esc(p.description)}</span></div>`).join("")}</div></div>
    <div class="rs-sec"><h2>Recent work</h2><div class="rs-cs">${DATA.projects.map(p => `<a href="#case.${p.id}"><b>${esc(p.title)}</b><span>${esc(p.year)}</span></a>`).join("")}</div></div>
    <div class="rs-sec"><h2>Career</h2><div class="rs-roles">${DATA.career.slice().reverse().map(c => `<div class="rs-role"><b>${esc(c.title)}</b><span class="p">${esc(c.period)}</span><span class="o">${esc(c.organization)}</span><p>${esc(c.description)}</p></div>`).join("")}</div></div>
    <div class="rs-sec"><h2>Education</h2><div class="rs-comp">${DATA.creds.map(c => `<div><b>${esc(c.degree)}</b><span>${esc(c.field)} · ${esc(c.badge)}</span></div>`).join("")}</div></div>
    <div class="rs-sec"><h2>References</h2><p class="muted">Available on request. <a href="#contact" class="link-arrow" style="margin-left:6px">Get in touch ${I.arrow}</a></p></div>
  </div></div>`;
}

/* CONTACT */
function viewContact(){
  const draft = store.get("ls-contact-draft", {});
  const topics = S.contact.topics;
  return pageHead("", md(S.contact.pageTitle), md(S.contact.pageLede), "contact") + `
  <div class="wrap contact-grid">
    <div>
      <div class="channel" style="border-top:1px solid var(--line)"><span class="mono">Email</span><span class="val">${esc(P.email)}<button class="copy" type="button" data-copy="${esc(P.email)}">${I.copy}Copy</button></span></div>
      <div class="channel"><span class="mono">LinkedIn</span><a class="val" href="${esc(P.linkedInUrl)}" target="_blank" rel="noopener">${esc(P.linkedInDisplay)} ↗</a></div>
      <div class="channel"><span class="mono">Based in</span><span class="val">${esc(P.location)} · <span id="clock2">IST</span></span></div>
      <div class="channel"><span class="mono">Open to</span><span style="color:var(--muted)">${md(S.contact.openTo)}</span></div>
    </div>
    <form id="contactForm" novalidate>
      <div class="form">
        <div class="field"><label for="cf-name">Your name</label><input id="cf-name" name="name" autocomplete="name" value="${esc(draft.name||"")}" required><span class="err">Please add your name.</span></div>
        <div class="field"><label for="cf-email">Your email</label><input id="cf-email" name="email" type="email" autocomplete="email" value="${esc(draft.email||"")}" required><span class="err">Enter an email like name@company.com.</span></div>
        <div class="field full"><label for="cf-org">Company or organization <span style="text-transform:none;letter-spacing:0;color:var(--faint)">(optional)</span></label><input id="cf-org" name="org" autocomplete="organization" value="${esc(draft.org||"")}"></div>
        <div class="field full"><label>What’s it about?</label><div class="topics">${topics.map((t,i) => `<input type="radio" name="topic" id="cf-t${i}" value="${esc(t)}" ${(draft.topic||topics[0])===t ? "checked" : ""}><label for="cf-t${i}">${t}</label>`).join("")}</div></div>
        <div class="field full"><label for="cf-msg">Message</label><textarea id="cf-msg" name="msg" required placeholder="Hello Lalit, I would like to connect about…">${esc(draft.msg||"")}</textarea><span class="err">Add a short message (at least 10 characters).</span></div>
        <div class="full" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center"><button class="btn btn-primary" type="submit">Prepare message ${I.arrow}</button><span class="muted" style="font-size:14px">Your draft is kept in this browser until you send it.</span></div>
      </div>
      <div id="composed" style="margin-top:24px"></div>
    </form>
  </div>`;
}

function viewNotFound(){
  return `<section class="notfound"><div class="wrap"><span class="eyebrow">Error 404 · route not found</span><h1>Off the map.</h1><p class="muted" style="margin-top:16px;max-width:44ch">That page doesn’t exist. It may have moved, or the link was mistyped.</p><div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap"><a class="btn btn-primary" href="#home">Back home ${I.arrow}</a><a class="btn btn-ghost" href="#work">See the work</a></div></div></section>`;
}

/* ---------------- ROUTER ---------------- */
const TITLES = {home:S.meta.title, work:"Work", thinking:"Thinking", journey:"Career journey", about:"About", photography:"Photography", resume:"Résumé", contact:"Contact"};
function parse(){
  const h = decodeURIComponent(location.hash.slice(1)) || "home";
  const [r, ...rest] = h.split(".");
  return {r, id: rest.join(".")};
}
let lastRoute = "";
function route(){
  const {r, id} = parse();
  if (r.startsWith("cs-")) { const el = document.getElementById(r); if (el){ el.scrollIntoView({behavior:"smooth"}); } return; }
  const key = r + "." + id; if (key === lastRoute) return; lastRoute = key;
  scrollHooks = [];
  const main = $("#main");
  let html, title;
  switch(r){
    case "home": html = viewHome(); title = TITLES.home; break;
    case "work": html = viewWork(); break;
    case "case": html = viewCase(id); title = (DATA.projects.find(p=>p.id===id)||{}).title; break;
    case "thinking": html = viewThinking(); break;
    case "article": html = viewArticle(id); title = (DATA.articles.find(a=>a.id===id)||{}).title; break;
    case "journey": html = viewJourney(); break;
    case "about": html = viewAbout(); break;
    case "photography": html = viewPhotography(); break;
    case "resume": html = viewResume(); break;
    case "contact": html = viewContact(); break;
    default: html = viewNotFound(); title = "Not found";
  }
  main.innerHTML = `<div class="view">${html}</div>`;
  document.title = (title || TITLES[r] || "Lalit Shahane") + (r === "home" ? " — " + S.meta.titleSuffix : " · " + S.meta.title);
  const navKey = r === "case" ? "work" : r === "article" ? "thinking" : r;
  $$("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === navKey));
  $$("[data-nav]").forEach(a => a.dataset.nav === navKey ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current"));
  $("#progress").hidden = r !== "article"; $("#progress").style.width = "0";
  window.scrollTo({top:0, behavior:"instant"});
  mount(r, id);
}
function mount(r, id){
  if (r === "home"){
    setMode(0);
    const hp = $("#homePhotos"); hp.innerHTML = photoStories().slice(0,3).map(photoCard).join(""); hydrateStudies(hp);
  }
  if (r === "work") renderWorkList(store.get("ls-workfilter","all"));
  if (r === "thinking"){ artState = {cat:"All", q:""}; renderArticles(); }
  if (r === "photography"){ photoCat = "All"; renderPhotos(); }
  if (r === "journey"){
    const pending = sessionStorage && (()=>{ try{ return sessionStorage.getItem("ls-open"); }catch(e){ return null; } })();
    if (pending){ try{ sessionStorage.removeItem("ls-open"); }catch(e){} const el = document.getElementById("tl-" + pending); if (el){ toggleTl(el, true); setTimeout(() => el.scrollIntoView({behavior:"smooth", block:"center"}), 120); } }
    const tl = $("#timeline"), fill = $("#tlFill");
    scrollHooks.push(() => { const b = tl.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (innerHeight*.6 - b.top) / b.height)); fill.style.height = (p * (b.height - 16)) + "px"; });
    scrollHooks[0]();
  }
  if (r === "case"){
    const links = $$("[data-toc]");
    scrollHooks.push(() => { let cur = links[0]; links.forEach(l => { const s = document.getElementById(l.dataset.toc); if (s && s.getBoundingClientRect().top < innerHeight*.35) cur = l; }); links.forEach(l => l.classList.toggle("on", l === cur)); });
    scrollHooks[0]();
  }
}
window.addEventListener("hashchange", route);

/* ---------------- DELEGATED INTERACTIONS ---------------- */
function toggleTl(item, force){
  const open = force ?? !item.classList.contains("open");
  item.classList.toggle("open", open); $(".tl-card", item).setAttribute("aria-expanded", open);
}
document.addEventListener("click", e => {
  const t = e.target;
  const toc = t.closest("[data-toc]"); if (toc){ e.preventDefault(); document.getElementById(toc.dataset.toc).scrollIntoView({behavior:"smooth"}); return; }
  const seg = t.closest("#seg button"); if (seg){ setMode(+seg.dataset.mode); return; }
  const demo = t.closest("[data-demo]"); if (demo){ toast(demo.dataset.demo + " — demo only"); return; }
  const pil = t.closest(".pillar"); if (pil){ const o = !pil.classList.contains("open"); pil.classList.toggle("open", o); pil.setAttribute("aria-expanded", o); $(".more span", pil).textContent = o ? "Close" : "How"; return; }
  const wf = t.closest("[data-wf]"); if (wf){ renderWorkList(wf.dataset.wf); return; }
  const af = t.closest("[data-af]"); if (af){ artState.cat = af.dataset.af; renderArticles(); return; }
  const pf = t.closest("[data-pf]"); if (pf){ photoCat = pf.dataset.pf; renderPhotos(); return; }
  const ph = t.closest("[data-phase]"); if (ph){ selectPhase(+ph.dataset.phase); return; }
  const tl = t.closest(".tl-card"); if (tl){ toggleTl(tl.closest(".tl-item")); return; }
  if (t.closest("#expandAll")){ $$(".tl-item").forEach(i => toggleTl(i, true)); return; }
  if (t.closest("#collapseAll")){ $$(".tl-item").forEach(i => toggleTl(i, false)); return; }
  const arc = t.closest("[data-open]"); if (arc){ try{ sessionStorage.setItem("ls-open", arc.dataset.open); }catch(err){} return; }
  const pc = t.closest("[data-photo]"); if (pc){ openPhoto(pc.dataset.photo); return; }
  if (t.closest("#addStory")){ openAddStory(); return; }
  if (t.closest("[data-close]")){ closeModal(); return; }
  const nav = t.closest("[data-lb]"); if (nav){ openPhoto(nav.dataset.lb); return; }
  const del = t.closest("[data-del]"); if (del){
    if (del.dataset.armed){ store.set("ls-photos", store.get("ls-photos",[]).filter(s => s.id !== del.dataset.del)); closeModal(); renderPhotos(); toast("Story removed"); }
    else { del.dataset.armed = "1"; del.textContent = "Click again to remove"; }
    return;
  }
});
document.addEventListener("change", e => {
  if (e.target.id === "msOnly"){ const on = e.target.checked; $$(".tl-item").forEach(i => i.hidden = on && i.dataset.ms !== "true"); scrollHooks.forEach(f=>f()); }
});
document.addEventListener("input", e => {
  if (e.target.id === "artSearch"){ artState.q = e.target.value; renderArticles(); }
  if (e.target.closest("#contactForm")){ const f = $("#contactForm"); store.set("ls-contact-draft", {name:f.name.value, email:f.email.value, org:f.org.value, msg:f.msg.value, topic:(f.querySelector("[name=topic]:checked")||{}).value}); e.target.closest(".field")?.classList.remove("invalid"); }
});
function selectPhase(j){
  const {id} = parse(); const p = DATA.projects.find(x => x.id === id);
  $$("[data-phase]").forEach(b => { const on = +b.dataset.phase === j; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  const pnl = $("#phasePanel"); pnl.setAttribute("aria-labelledby", "tab-" + j); pnl.innerHTML = phasePanel(p, j); pnl.style.animation = "none"; pnl.offsetHeight; pnl.style.animation = "";
}
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.getAttribute && e.target.getAttribute("role") === "button"){ e.preventDefault(); e.target.click(); return; }
  const tab = e.target.closest && e.target.closest("[data-phase]");
  if (tab && (e.key === "ArrowRight" || e.key === "ArrowLeft")){ const j = (+tab.dataset.phase + (e.key === "ArrowRight" ? 1 : 4)) % 5; selectPhase(j); $(`[data-phase="${j}"]`).focus(); e.preventDefault(); return; }
  if (e.key === "Escape"){ if ($("#modal").classList.contains("open")) closeModal(); else if (mm.classList.contains("open")) setMenu(false); return; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "t" || e.key === "T"){ toggleTheme(); }
  if ($("#modal").classList.contains("open") && (e.key === "ArrowRight" || e.key === "ArrowLeft")){ const b = $(`[data-lb-dir="${e.key === "ArrowRight" ? "next" : "prev"}"]`); if (b) b.click(); }
  if (e.key === "/" && $("#artSearch")){ e.preventDefault(); $("#artSearch").focus(); }
});

/* ---------------- MODAL ---------------- */
let lastFocus;
function openModal(html, label){
  lastFocus = document.activeElement;
  const box = $("#modalBox"); box.innerHTML = `<button class="icon-btn modal-close" type="button" data-close aria-label="Close">${I.close}</button>` + html;
  $("#modal").classList.add("open"); $("#modal").setAttribute("aria-hidden","false"); document.body.style.overflow = "hidden";
  setTimeout(() => (box.querySelector("[autofocus]") || box.querySelector(".modal-close")).focus(), 30);
}
function closeModal(){ $("#modal").classList.remove("open"); $("#modal").setAttribute("aria-hidden","true"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
$("#modal").addEventListener("keydown", e => {
  if (e.key !== "Tab") return; const f = $$("button, a[href], input, select, textarea", $("#modalBox")).filter(x => !x.disabled && x.offsetParent);
  if (!f.length) return; const first = f[0], last = f[f.length-1];
  if (e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
});
function openPhoto(id){
  const all = photoStories().filter(s => photoCat === "All" || s.category === photoCat || parse().r !== "photography");
  const i = all.findIndex(s => s.id === id); if (i < 0) return; const s = all[i];
  const prev = all[(i - 1 + all.length) % all.length], next = all[(i + 1) % all.length];
  openModal(`<div class="lb"><div class="lb-img">${photoMedia(s, true)}</div>
    <div class="lb-txt"><span class="eyebrow">${esc(s.category)}</span><h2 id="modalTitle">${esc(s.title)}</h2><p class="sub">${esc(s.subtitle)}</p>
      <span class="loc mono muted" style="display:flex;gap:6px;align-items:center;text-transform:none;letter-spacing:.02em">${I.pin.replace('<svg','<svg width="14" height="14"')}${esc(s.location)} · ${esc(s.year)}</span>
      ${s.exif ? `<div class="exif-table"><div><span>Aperture</span><b>${esc(s.exif.aperture||"—")}</b></div><div><span>Shutter</span><b>${esc(s.exif.shutter||"—")}</b></div><div><span>ISO</span><b>${esc(s.exif.iso||"—")}</b></div></div>` : ""}
      ${s.cameraGear ? `<p class="mono muted" style="text-transform:none;letter-spacing:.02em">${esc(s.cameraGear)}</p>` : ""}
      <p class="story">${esc(s.story)}</p>
      ${s.philosophy ? `<p class="phil"><b>What it taught me</b>${esc(s.philosophy)}</p>` : ""}
      ${s.mine ? `<button type="button" class="copy" data-del="${esc(s.id)}" style="align-self:start">Remove this story</button>` : ""}
      <div class="lb-nav"><button class="btn btn-ghost btn-sm" type="button" data-lb="${esc(prev.id)}" data-lb-dir="prev">← ${esc(prev.title)}</button><span class="mono muted">${i+1} / ${all.length}</span><button class="btn btn-ghost btn-sm" type="button" data-lb="${esc(next.id)}" data-lb-dir="next">${esc(next.title)} →</button></div>
    </div></div>`);
  hydrateStudies($("#modalBox"));
}
function openAddStory(){
  const cats = Object.keys(PALETTES);
  openModal(`<form id="storyForm" novalidate style="padding:clamp(24px,4vw,40px)">
    <span class="eyebrow">New photo story</span><h2 id="modalTitle" style="font-size:clamp(28px,3vw,36px);margin:12px 0 8px">Post a photo story</h2>
    <p class="muted" style="margin-bottom:24px;font-size:15px">Stories you add are saved in this browser only.</p>
    <div class="form">
      <div class="field"><label for="sf-title">Title</label><input id="sf-title" name="title" required autofocus><span class="err">Give the story a title.</span></div>
      <div class="field"><label for="sf-cat">Category</label><select id="sf-cat" name="category">${cats.map(c => `<option>${c}</option>`).join("")}</select></div>
      <div class="field full"><label for="sf-sub">One-line caption</label><input id="sf-sub" name="subtitle"></div>
      <div class="field"><label for="sf-loc">Location</label><input id="sf-loc" name="location" required><span class="err">Where was this taken?</span></div>
      <div class="field"><label for="sf-year">Year</label><input id="sf-year" name="year" inputmode="numeric" value="${new Date().getFullYear()}"></div>
      <div class="field full"><label for="sf-gear">Camera &amp; lens</label><input id="sf-gear" name="gear" placeholder="e.g. Fujifilm X-T5 · 33mm f/1.4"></div>
      <div class="field"><label for="sf-ap">Aperture</label><input id="sf-ap" name="ap" placeholder="f/2.8"></div>
      <div class="field"><label for="sf-sh">Shutter · ISO</label><input id="sf-sh" name="sh" placeholder="1/250s · 200"></div>
      <div class="field full"><label for="sf-story">The story</label><textarea id="sf-story" name="story" required></textarea><span class="err">Tell the story behind the frame.</span></div>
      <div class="field full"><label for="sf-phil">What it taught you <span style="text-transform:none;letter-spacing:0;color:var(--faint)">(optional)</span></label><input id="sf-phil" name="phil"></div>
      <div class="field full"><label for="sf-file">Photo <span style="text-transform:none;letter-spacing:0;color:var(--faint)">(optional — a light study is drawn if you skip it)</span></label>
        <label class="drop" id="drop" for="sf-file">Drop an image here or <b style="color:var(--accent)">browse</b><input id="sf-file" type="file" accept="image/*" hidden><span id="dropPrev"></span></label></div>
      <div class="full" style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-primary" type="submit">Publish story ${I.arrow}</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>
    </div></form>`);
  let imgData = null;
  const fileIn = $("#sf-file"), drop = $("#drop");
  const take = file => { if (!file || !/^image\//.test(file.type)) { toast("Choose an image file (JPG, PNG or WebP)."); return; }
    const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 1100 / Math.max(im.width, im.height)); const c = document.createElement("canvas"); c.width = Math.round(im.width*s); c.height = Math.round(im.height*s); c.getContext("2d").drawImage(im,0,0,c.width,c.height); imgData = c.toDataURL("image/jpeg", .8); $("#dropPrev").innerHTML = `<img src="${imgData}" alt="Preview">`; }; im.src = r.result; }; r.readAsDataURL(file); };
  fileIn.addEventListener("change", () => take(fileIn.files[0]));
  ["dragenter","dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => take(e.dataTransfer.files[0]));
  $("#storyForm").addEventListener("submit", e => {
    e.preventDefault(); const f = e.target; let ok = true;
    ["title","location","story"].forEach(n => { const bad = !f[n].value.trim(); f[n].closest(".field").classList.toggle("invalid", bad); if (bad && ok){ f[n].focus(); ok = false; } });
    if (!ok) return;
    const [sh, iso] = f.sh.value.split("·").map(x => x.trim());
    const s = {id:"mine-" + Date.now(), mine:true, title:f.title.value.trim(), subtitle:f.subtitle.value.trim(), category:f.category.value, location:f.location.value.trim(), year:f.year.value.trim(), cameraGear:f.gear.value.trim(),
      exif:(f.ap.value || sh) ? {aperture:f.ap.value.trim(), shutter:sh||"", iso:iso||""} : null, story:f.story.value.trim(), philosophy:f.phil.value.trim(), imageUrl:imgData};
    const list = store.get("ls-photos", []); list.unshift(s);
    if (!store.set("ls-photos", list)){ s.imageUrl = null; list[0] = s; if (!store.set("ls-photos", list)) { toast("This browser isn’t allowing saved stories. Try a normal (non-private) window."); return; } toast("Saved without the photo: it was too large for browser storage."); }
    else toast("Story published to your gallery");
    closeModal(); photoCat = "All"; renderPhotos();
  });
}

/* CONTACT SUBMIT */
document.addEventListener("submit", e => {
  if (e.target.id !== "contactForm") return; e.preventDefault();
  const f = e.target; const v = {name:f.name.value.trim(), email:f.email.value.trim(), org:f.org.value.trim(), msg:f.msg.value.trim(), topic:(f.querySelector("[name=topic]:checked")||{}).value};
  const checks = [["name", v.name.length > 0], ["email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)], ["msg", v.msg.length >= 10]];
  let first = null; checks.forEach(([n, ok]) => { f[n].closest(".field").classList.toggle("invalid", !ok); if (!ok && !first) first = f[n]; });
  if (first){ first.focus(); return; }
  const subject = `${v.topic} — from ${v.name}${v.org ? " (" + v.org + ")" : ""}`;
  const body = `Hello Lalit,\n\n${v.msg}\n\n— ${v.name}${v.org ? ", " + v.org : ""}\n${v.email}`;
  $("#composed").innerHTML = `<div class="composed" data-copy-target="#composedText"><div><span class="eyebrow">Ready to send</span><p style="margin-top:8px;font-size:15px">Copy this and send it to <b>${esc(P.email)}</b>, or open it in your email app.</p></div>
    <pre id="composedText">To: ${esc(P.email)}\nSubject: ${esc(subject)}\n\n${esc(body)}</pre>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-primary btn-sm" data-copy="${esc("Subject: " + subject + "\n\n" + body)}">${I.copy.replace('<svg','<svg width="16" height="16"')} Copy message</button>
    <a class="btn btn-ghost btn-sm" href="mailto:${esc(P.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Open in email app</a></div></div>`;
  $("#composed").scrollIntoView({behavior:"smooth", block:"nearest"});
});

/* ---------------- CLOCK ---------------- */
function tick(){
  let t; try{ t = new Intl.DateTimeFormat("en-IN",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Kolkata"}).format(new Date()) + " IST"; }catch(e){ t = "IST"; }
  $("#clock").textContent = t; const c2 = $("#clock2"); if (c2) c2.textContent = t + " local time";
}
const fb = $("#footBlurb"); if (fb) fb.textContent = fill(S.footer.blurb);
$("#yr").textContent = new Date().getFullYear(); tick(); setInterval(tick, 30000);
route();
})();
