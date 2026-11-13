(function TeachingAssetsApp() {
  "use strict";
  const LESSONS=window.LESSONS||[];
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const palette={mint:["#f2faf2","#c7e5d4","#4e8a68"],peach:["#fff6f0","#f1d1c4","#b87959"],lavender:["#f8f7ff","#d5d0ed","#827baa"],sky:["#f3fbff","#c9e4f0","#6590a6"],amber:["#fffbf3","#edd8b1","#a68b4f"]};
  const root=document.body.dataset.root||"";
  const home=root+"index.html";
  const href=l=>root+"lessons/"+l.id+"/index.html";
  const tag=(t,strong=false)=>`<span class="tag ${strong?"strong":""}">${esc(t)}</span>`;
  const brand=()=>`<a href="${home}" class="brand" aria-label="Teaching Assets home"><span class="brand-mark">t.</span>teaching<span style="color:#629578">assets</span></a>`;
  const header=()=>`<header class="site-header"><div class="container header-inner">${brand()}<nav class="navlinks"><a href="${home}#catalog">Lessons</a><a href="${home}#formats">Formats</a><a href="${home}#about">About</a></nav><div class="header-right"><span class="pill hide-mobile">✦ For curious teachers</span><a class="btn small primary" href="${home}#catalog">Explore ↗</a></div></div></header>`;
  const footer=()=>`<footer class="site-footer"><div class="container footer-grid"><div>${brand()}<p style="margin:12px 0 0">Original materials · Experimental library · Teacher review recommended</p></div><p>15 lessons · Pre-A1–B2 · Independent teaching resources</p></div></footer>`;
  let lesson=null, slides=[];
  const st={filter:"All",query:"",tab:"slides",slide:0,card:0,flipped:false,picture:false,quiz:0,answered:false,score:0,prompt:0,first:null,matched:new Set(),attempts:0};
  function cover(l) {
    const p=palette[l.style]||palette.mint, w=l.words;
    return `<svg viewBox="0 0 740 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(l.title)} illustration"><rect width="740" height="440" fill="${p[0]}"/><circle cx="580" cy="70" r="195" fill="${p[1]}" opacity=".65"/><circle cx="140" cy="420" r="160" fill="${p[1]}" opacity=".48"/><g transform="translate(268 55) rotate(-7 115 160)"><rect width="226" height="326" rx="28" fill="#fff"/><rect x="16" y="16" width="194" height="234" rx="19" fill="${p[1]}"/><circle cx="112" cy="138" r="91" fill="${p[0]}"/><text x="113" y="183" font-size="116" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${esc(l.icon)}</text><rect x="32" y="275" width="153" height="9" rx="5" fill="${p[2]}" opacity=".27"/><rect x="32" y="295" width="97" height="7" rx="4" fill="${p[2]}" opacity=".14"/></g><g transform="translate(92 110) rotate(11 78 91)"><rect width="155" height="187" rx="24" fill="#fff"/><rect x="12" y="13" width="131" height="136" rx="16" fill="${p[1]}"/><text x="77" y="113" font-size="80" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${esc(w[0].icon)}</text><rect x="20" y="164" width="97" height="7" rx="4" fill="${p[2]}" opacity=".25"/></g><g transform="translate(520 211) rotate(8 72 85)"><rect width="145" height="178" rx="23" fill="#fff"/><rect x="12" y="13" width="121" height="127" rx="16" fill="${p[1]}"/><text x="71" y="104" font-size="70" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${esc(w[1].icon)}</text><rect x="22" y="154" width="86" height="7" rx="4" fill="${p[2]}" opacity=".25"/></g></svg>`;
  }
  function cardSvg(l,w,label=false) {
    const p=palette[l.style]||palette.mint;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 480" width="700" height="480" role="img" aria-label="${esc(w.en)} illustration"><rect width="700" height="480" fill="${p[0]}"/><circle cx="598" cy="75" r="176" fill="${p[1]}" opacity=".7"/><circle cx="95" cy="417" r="146" fill="${p[1]}" opacity=".6"/><rect x="127" y="38" width="446" height="405" rx="45" fill="#fff"/><rect x="148" y="59" width="404" height="${label?299:362}" rx="34" fill="${p[1]}"/><circle cx="352" cy="239" r="150" fill="${p[0]}"/><text x="350" y="323" font-size="194" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${esc(w.icon)}</text>${label?`<text x="350" y="397" font-size="29" font-family="Arial,sans-serif" font-weight="700" text-anchor="middle" fill="${p[2]}">${esc(w.en)}</text>`:""}</svg>`;
  }
  function download(name,content,mime="text/plain;charset=utf-8"){
    const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type:mime}));
    const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function toast(msg){let el=$("#toast");if(!el){el=document.createElement("div");el.id="toast";el.style.cssText="position:fixed;bottom:22px;right:22px;background:#275741;color:white;padding:13px 18px;border-radius:12px;font-weight:700;z-index:100";el.setAttribute("role","status");document.body.append(el);}el.textContent=msg;clearTimeout(window.__taToast);window.__taToast=setTimeout(()=>el.remove(),2600);}
  function card(l) {return `<a class="lesson-card" href="${href(l)}"><div class="lesson-cover">${cover(l)}<div class="cover-overlay">${tag(l.level)}${tag(l.type)}</div></div><div class="lesson-body"><h3>${esc(l.title)}</h3><p>${esc(l.description)}</p><div class="card-meta"><span>◷ ${l.duration} min</span><span>▣ ${l.words.length} cards</span><span>◫ 14 slides</span></div></div></a>`;}
  function catalog(){
    document.title="Teaching Assets — English teaching library";
    $("#app").innerHTML=header()+`<main><div class="container"><section class="hero"><div class="hero-grid"><div><div class="eyebrow">THE VISUAL ENGLISH LESSON LIBRARY · BETA</div><h1>Less prep.<br/>More <span style="color:#528768">teaching.</span></h1><p class="lead">Beautiful, ready-to-teach English lessons. Present, practise, speak, print and make every session your own.</p><div class="button-row"><a class="btn primary" href="#catalog">Explore lessons ↗</a><a class="btn" href="${href(LESSONS[0])}">Try a first lesson →</a></div><div class="metric-row"><div class="metric"><b>${LESSONS.length}</b><span>Complete lessons</span></div><div class="metric"><b>${LESSONS.reduce((n,l)=>n+l.words.length,0)}</b><span>Visual flashcards</span></div><div class="metric"><b>5</b><span>English levels</span></div></div></div><div class="hero-art">${cover(LESSONS[2])}</div></div></section></div><section id="catalog" class="section"><div class="container"><div class="section-header"><div><div class="eyebrow">PICK A TOPIC. START TEACHING.</div><h2>Explore the library<span style="color:#609475">.</span></h2><p>Each lesson combines conversation, pictures, new vocabulary and a ready-made presentation.</p></div><span class="pill" id="result-count">15 lessons</span></div><div class="filter-panel"><label class="search-wrap">⌕ <input id="search-input" type="search" placeholder="Search lessons, words, topics..." aria-label="Search lessons"></label><div id="filter-bar" class="chips">${["All","A0","A1","A2","B1","B2"].map(level=>`<button class="chip ${level==="All"?"active":""}" data-filter="${level}">${level}</button>`).join("")}</div></div><div class="catalog-grid" id="catalog-grid"></div></div></section><div class="container"><section id="formats" class="banner"><div><div class="eyebrow">ONE LESSON · MANY FORMATS</div><h2>A flexible studio for teaching.</h2><p>Interactive HTML, visual SVG cards, speaking games, printable PDF, XLSX, CSV and Marp presentations.</p></div><a href="${href(LESSONS[1])}" class="btn primary">Try visual mode ↗</a></section><section id="about" style="max-width:820px;padding:50px 0"><div class="eyebrow">MADE TO BE REMIXED</div><h2>Take the whole lesson, or one beautiful idea.</h2><p class="muted">Materials and illustrations are original prototypes. This is an early library: images are programmatically designed SVG compositions, not AI-generated photography. Review language and age suitability before teaching.</p></section></div></main>`+footer();
    updateCatalog();
    $("#search-input").addEventListener("input",e=>{st.query=e.target.value.toLowerCase().trim();updateCatalog();});
    $("#filter-bar").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;st.filter=b.dataset.filter;$$("[data-filter]").forEach(x=>x.classList.toggle("active",x===b));updateCatalog();});
  }
  function updateCatalog(){
    const list=LESSONS.filter(l=>(st.filter==="All"||l.level===st.filter)&&[l.title,l.description,l.subtitle,l.level,l.type,...l.words.map(w=>w.en)].join(" ").toLowerCase().includes(st.query));
    $("#catalog-grid").innerHTML=list.map(card).join("")||`<div class="empty" style="grid-column:1/-1"><h3>Nothing found</h3><p>Try another search or level.</p></div>`;
    $("#result-count").textContent=list.length+" lessons";
  }
  function getSlides(l){
    return [
      {kind:"cover",k:"WELCOME",title:l.title,text:l.subtitle},
      {kind:"list",k:"01 · GET TO KNOW YOU",title:"A quick warm-up",items:l.warmup},
      {kind:"art",k:"02 · LOOK & NOTICE",title:"What can you see?",text:"Describe the pictures before reading the words."},
      {kind:"list",k:"03 · OUR GOAL",title:"Today you will…",items:[l.outcome,"Use at least five new expressions.","Ask thoughtful follow-up questions."]},
      {kind:"words",k:"04 · WORD BANK",title:"Ten new expressions",items:l.words.slice(0,10)},
      {kind:"list",k:"05 · LANGUAGE MODEL",title:l.grammar.title,items:l.grammar.models},
      {kind:"quote",k:"06 · READ & NOTICE",title:"A little story",text:l.story},
      {kind:"list",k:"07 · HOW IT WORKS",title:"Language focus",text:l.grammar.rule,items:l.grammar.models},
      {kind:"list",k:"08 · TALK TOGETHER",title:"Conversation starters",items:l.questions.slice(0,4)},
      {kind:"words",k:"09 · PICTURE TALK",title:"Say it with pictures",items:l.words.slice(2,12)},
      {kind:"list",k:"10 · ROLE-PLAY",title:"Try a real situation",items:l.situations},
      {kind:"list",k:"11 · GO DEEPER",title:"More to discuss",items:l.questions.slice(3)},
      {kind:"list",k:"12 · EXIT TICKET",title:"What can you do now?",items:["Use one new word in a sentence.","Share one idea from today.","Choose one thing to practise next time."]},
      {kind:"quote",k:"13 · HOMEWORK",title:"Your mini challenge",text:l.homework}
    ];
  }
  function stage(s){
    const html=s.kind==="cover"||s.kind==="art"?`<div class="slide-art">${cover(lesson)}</div>`:s.kind==="words"?`<div class="slide-art-grid">${s.items.map(w=>`<div class="mini-art"><span class="picture">${esc(w.icon)}</span><span>${esc(w.en)}</span></div>`).join("")}</div>`:s.kind==="list"?`<div class="slide-list">${s.items.map((item,i)=>`<div class="slide-pill"><span class="emoji">${["✦","→","◉"][i%3]}</span>${esc(item)}</div>`).join("")}</div>`:`<div class="slide-quote">${esc(s.text)}</div>`;
    return `<div class="eyebrow" style="position:relative;color:#7c9a84">${esc(s.k)}</div><h2>${esc(s.title)}</h2>${html}${s.kind==="art"?`<p class="muted">${esc(s.text)}</p>`:""}${s.kind==="cover"?`<p class="big-text">${esc(lesson.outcome)}</p>`:""}${s.kind==="list"&&s.text?`<p class="muted">${esc(s.text)}</p>`:""}`;
  }
  function plan(l){
    const parts=["Warm-up","Visual discovery","Vocabulary","Language practice","Reading","Guided speaking","Role-play","Review","Homework"],weights=[.08,.09,.15,.14,.10,.16,.15,.09,.04];let used=0;
    return parts.map((n,i)=>{const min=i===8?l.duration-used:Math.round(l.duration*weights[i]);used+=min;return `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #e8efe8;padding:5px 0"><span>${n}</span><b>${min}m</b></div>`;}).join("");
  }
  function lessonPage(l){
    lesson=l;slides=getSlides(l);document.title=l.title+" | Teaching Assets";
    document.documentElement.style.setProperty("--accent-soft",(palette[l.style]||palette.mint)[1]);
    const tabs=[["slides","▶ Presentation"],["cards","▣ Flashcards"],["practice","✓ Practice"],["speaking","◎ Speaking"],["assets","↓ Resources"]];
    $("#app").innerHTML=header()+`<div class="container lesson-layout"><aside class="sidebar"><div class="sidebar-head">Teaching workspace</div>${tabs.map(([id,t])=>`<a class="side-link ${id==="slides"?"active":""}" data-tab="${id}" href="#${id}">${t}</a>`).join("")}<div class="sidebar-tip"><strong>✦ Teacher tip</strong>${esc(l.teacherTip)}</div><div class="sidebar-tip" style="background:white"><strong>Teaching plan</strong>${plan(l)}</div></aside><main class="lesson-main"><a href="${home}#catalog" class="muted" style="font-size:12px;font-weight:800">← Back to library</a><div class="lesson-head"><div><div class="lesson-meta">${tag(l.level,true)}${tag(l.type)}${tag(l.duration+" minutes")}${tag(l.words.length+" cards")}</div><h1>${esc(l.title)}</h1><p>${esc(l.description)}</p></div><div class="lesson-actions"><button class="icon-btn" data-action="save" title="Save lesson" aria-label="Save lesson">♡</button><button class="icon-btn" data-action="share" title="Copy lesson URL" aria-label="Copy lesson URL">↗</button></div></div><div class="tabs" role="tablist">${tabs.map(([id,label])=>`<button class="tab ${id==="slides"?"active":""}" role="tab" aria-selected="${id==="slides"}" data-tab="${id}">${label}</button>`).join("")}</div>
    <div class="tab-panel" id="slides"><div class="lesson-stage"><div class="stage-head"><small>TEACHING DECK · <span id="slide-title"></span></small><div class="button-row"><button class="btn small" data-action="focus">⛶ Focus</button><button class="btn small" data-action="print">⇩ Print / PDF</button></div></div><div class="stage-card" id="stage-card" aria-live="polite"></div><div class="stage-foot"><span class="subtle" id="slide-count"></span><div class="progress-track"><div class="progress-fill" id="slide-progress"></div></div><div class="control"><button class="icon-btn" data-action="slide-prev" aria-label="Previous slide">←</button><button class="icon-btn" data-action="slide-next" aria-label="Next slide">→</button></div></div></div><div class="teacher-notes"><strong>Teacher guidance</strong><p>${esc(l.teacherTip)} · Use ← → arrow keys. Press F for focus, Esc to exit.</p></div></div>
    <div class="tab-panel" id="cards" hidden><div class="content-panel"><div class="section-header"><div><h3>Picture flashcards</h3><p class="intro">Click to flip. Show illustrations without labels or export original SVG.</p></div><button class="btn small" data-action="picture" id="picture-toggle"></button></div><div class="flash-layout"><div id="flash-card"></div><div class="flash-notes"><div id="flash-position" class="eyebrow"></div><div id="flash-sentence" class="sentence"></div><p class="muted">Ask the student to describe the image before revealing the word.</p><div class="flash-nav"><button class="btn" data-action="card-prev">← Prev</button><button class="btn primary" data-action="card-flip">Flip ↺</button><button class="btn" data-action="card-next">Next →</button></div><div class="button-row"><button class="btn small" data-action="say">🔈 Hear word</button><button class="btn small" data-action="svg">⇩ Download SVG</button></div></div></div><div class="flash-grid" id="flash-grid"></div></div></div>
    <div class="tab-panel" id="practice" hidden><div class="content-panel"><div class="section-header"><div><h3>Practice & check</h3><p class="intro">Ten or more interactive translation questions.</p></div><button class="btn small" data-action="quiz-reset">↺ Restart</button></div><div class="quiz-shell"><div id="quiz-area"></div><div class="quiz-info"><div class="eyebrow">SCORE</div><b id="quiz-score"></b><p>Review words with flashcards whenever you like.</p><div class="progress-track"><div class="progress-fill" id="quiz-progress"></div></div></div></div></div><div class="content-panel"><div class="section-header"><div><h3>Match the pairs</h3><p class="intro">Pair six English words with their Russian translations.</p></div><button class="btn small" data-action="match-reset">↺ Restart</button></div><div id="match-game"></div></div></div>
    <div class="tab-panel" id="speaking" hidden><div class="content-panel"><div class="section-header"><div><h3>Conversation deck</h3><p class="intro">Six speaking prompts, plus two realistic role-plays.</p></div><button class="btn small" data-action="random">⚄ Surprise me</button></div><div class="speaking-layout"><div class="prompt-hero"><div id="prompt-number" class="prompt-number"></div><h2 id="prompt-question"></h2><div class="button-row"><button class="btn" data-action="speak-prev">← Prev</button><button class="btn primary" data-action="speak-next">Next →</button></div></div><div class="speaking-list" id="speaking-list"></div></div><div class="role-card"><h4>🎭 Role-play situations</h4>${l.situations.map((s,i)=>`<p style="margin:8px 0"><b>Scenario ${i+1}.</b> ${esc(s)}</p>`).join("")}</div></div></div>
    <div class="tab-panel" id="assets" hidden><div class="content-panel"><h3>Download resources</h3><p class="intro">Editable lesson data, printable material and label-free original SVG picture cards.</p><div class="export-grid">${[["print","🖨️","Print / PDF","Browser print with slide pages."],["csv","▦","CSV vocabulary","Excel-ready, UTF-8."],["xlsx","▤","Excel workbook","Real .xlsx file."],["pptx","📊","PowerPoint (.pptx)","Editable slides, shapes and text."],["marp","▣","Presentation (Marp)","Convert to PPTX or PDF."],["json","{ }","Lesson JSON","For a future lesson builder."],["html","🌐","HTML handout","Standalone printable file."]].map(([a,ic,n,d])=>`<button class="export-card" data-action="${a}"><span class="export-icon">${ic}</span><strong>${n}</strong><small>${d}</small></button>`).join("")}</div></div><div class="content-panel"><div class="section-header"><div><h3>Download illustrations</h3><p class="intro">Original scalable SVG cards for presentations and worksheets.</p></div><button class="btn small" data-action="zip">⇩ Download all (.zip)</button></div><div class="asset-grid" id="asset-gallery"></div></div></div>
    </main></div>`+footer()+`<div class="print-root" id="print-root"></div>`;
    slideRender();cardRender();quizRender();matchRender();speakRender();assetsRender();printRender();
    const hash=location.hash.slice(1);if(tabs.some(x=>x[0]===hash))switchTab(hash);
  }
  function switchTab(t){
    st.tab=t;
    $$(".tab-panel").forEach(p=>p.hidden=p.id!==t);
    $$("[data-tab]").forEach(b=>{b.classList.toggle("active",b.dataset.tab===t);if(b.getAttribute("role")==="tab")b.setAttribute("aria-selected",String(b.dataset.tab===t));});
    if(history.replaceState)history.replaceState(null,"","#"+t);
    if(t!=="slides")document.body.classList.remove("presenter");
  }
  function slideRender(){
    if(!lesson)return;st.slide=Math.max(0,Math.min(slides.length-1,st.slide));
    $("#stage-card").innerHTML=stage(slides[st.slide]);
    $("#slide-title").textContent=String(st.slide+1).padStart(2,"0")+" / "+slides.length;
    $("#slide-count").textContent="Slide "+(st.slide+1)+" of "+slides.length;
    $("#slide-progress").style.width=((st.slide+1)/slides.length*100)+"%";
  }
  function cardRender(){
    const words=lesson.words;st.card=(st.card+words.length)%words.length;const w=words[st.card];
    $("#flash-position").textContent="CARD "+(st.card+1)+" / "+words.length;
    $("#flash-card").innerHTML=`<button class="flash-card ${st.flipped?"revealed":""}" data-action="card-flip" aria-label="Flip card"><div class="flash-symbol">${esc(w.icon)}</div>${st.flipped?`<h2>${esc(w.ru)}</h2><div class="translation">${esc(w.en)}</div>`:st.picture?"":`<h2>${esc(w.en)}</h2>`}<span class="hint">Click to flip ↺</span></button>`;
    $("#flash-sentence").textContent=st.flipped?w.example:"Describe what you see. Guess the word, then flip to check.";
    $("#picture-toggle").textContent="◐ Pictures only: "+(st.picture?"on":"off");
    $("#flash-grid").innerHTML=words.map((x,i)=>`<button class="flash-tile ${i===st.card?"active":""}" data-card="${i}"><span class="pic">${esc(x.icon)}</span>${st.picture?"Picture "+(i+1):esc(x.en)}</button>`).join("");
  }
  function quizOptions(i){
    const w=lesson.words[i],rest=lesson.words.filter(x=>x!==w);
    return [w.ru,...[2,5,8].map(j=>rest[(i*3+j)%rest.length].ru)].sort((a,b)=>hash(a+i)-hash(b+i));
  }
  function hash(s){let n=0;for(const c of s)n=(31*n+c.charCodeAt(0))|0;return n;}
  function quizRender(){
    $("#quiz-score").textContent=st.score+" / "+lesson.words.length;$("#quiz-progress").style.width=Math.round(st.quiz/lesson.words.length*100)+"%";
    if(st.quiz>=lesson.words.length){$("#quiz-area").innerHTML=`<div class="eyebrow">COMPLETED</div><h2>Lovely work!</h2><p>You got ${st.score} of ${lesson.words.length} correct.</p><button class="btn primary" data-action="quiz-reset">Try again ↺</button>`;return;}
    const w=lesson.words[st.quiz];
    $("#quiz-area").innerHTML=`<div class="eyebrow">QUESTION ${st.quiz+1} / ${lesson.words.length}</div><div class="quiz-question">What does <span style="color:#4e8161">${esc(w.en)}</span> mean?</div><div class="quiz-answers">${quizOptions(st.quiz).map(ans=>`<button class="answer" data-answer="${esc(ans)}">${esc(ans)}</button>`).join("")}</div><div class="feedback" id="quiz-feedback" role="status">Choose an answer to check yourself.</div><button class="btn primary" data-action="quiz-next" disabled>${st.quiz===lesson.words.length-1?"See results":"Next question"} →</button>`;
  }
  function answer(b){
    if(st.answered)return;st.answered=true;const correct=lesson.words[st.quiz].ru;const ok=b.dataset.answer===correct;if(ok)st.score++;
    $$("[data-answer]").forEach(x=>{x.disabled=true;if(x.dataset.answer===correct)x.classList.add("correct");else if(x===b)x.classList.add("wrong");});
    $("#quiz-feedback").textContent=ok?"Correct!":"The correct answer is: "+correct;
    $('[data-action="quiz-next"]').disabled=false;$("#quiz-score").textContent=st.score+" / "+lesson.words.length;
  }
  function matchRender(){
    const pairs=lesson.words.slice(0,6).map((w,i)=>({...w,i}));
    const shuffled=pairs.slice().sort((a,b)=>hash(a.ru+lesson.id)-hash(b.ru+lesson.id));
    $("#match-game").innerHTML=`<p class="muted">Matched ${st.matched.size} / 6 · Attempts ${st.attempts}</p><div class="match-grid"><div class="match-column">${pairs.map(w=>`<button class="match-option ${st.matched.has(w.i)?"matched":""}" data-match="en" data-i="${w.i}" ${st.matched.has(w.i)?"disabled":""}>${esc(w.en)}</button>`).join("")}</div><div class="match-column">${shuffled.map(w=>`<button class="match-option ${st.matched.has(w.i)?"matched":""}" data-match="ru" data-i="${w.i}" ${st.matched.has(w.i)?"disabled":""}>${esc(w.ru)}</button>`).join("")}</div></div>${st.matched.size===6?'<p style="color:#318456;font-weight:800">✓ All pairs matched!</p>':""}`;
  }
  function match(b){
    if(b.disabled)return;const x={i:+b.dataset.i,col:b.dataset.match};
    if(!st.first||st.first.col===x.col){st.first=x;$$("[data-match]").forEach(t=>t.classList.toggle("selected",t===b));return;}
    st.attempts++;if(st.first.i===x.i){st.matched.add(x.i);toast("✓ Pair found!");}else toast("Not a match — try again.");
    st.first=null;matchRender();
  }
  function speakRender(){
    st.prompt=(st.prompt+lesson.questions.length)%lesson.questions.length;
    $("#prompt-number").textContent="PROMPT "+String(st.prompt+1).padStart(2,"0")+" / "+lesson.questions.length;
    $("#prompt-question").textContent=lesson.questions[st.prompt];
    $("#speaking-list").innerHTML=lesson.questions.map((q,i)=>`<button class="speaking-item ${i===st.prompt?"active":""}" data-prompt="${i}" style="text-align:left"><span>${String(i+1).padStart(2,"0")}</span>${esc(q)}</button>`).join("");
  }
  function assetsRender(){
    $("#asset-gallery").innerHTML=lesson.words.map((w,i)=>`<div class="asset-card"><div class="asset-visual">${cardSvg(lesson,w,false)}</div><div class="asset-bottom"><b>${esc(w.en)}</b><button data-svg="${i}">↓ SVG</button></div></div>`).join("");
  }
  function printRender(){
    $("#print-root").innerHTML=slides.map((s,i)=>`<section class="print-slide"><div class="eyebrow">${esc(s.k)}</div><h2>${esc(s.title)}</h2>${s.kind==="cover"||s.kind==="art"?`<div style="height:110mm;max-width:180mm;margin:auto">${cover(lesson)}</div>`:s.kind==="list"?`<div class="columns">${s.items.map(x=>`<div>${esc(x)}</div>`).join("")}</div>`:s.kind==="words"?`<div class="columns">${s.items.map(w=>`<div>${esc(w.icon)} ${esc(w.en)}</div>`).join("")}</div>`:`<p>${esc(s.text)}</p>`}<div class="number">${i+1} / ${slides.length} · Teaching Assets</div></section>`).join("");
  }
  function csv(){
    const e=s=>'"'+String(s).replace(/"/g,'""')+'"';
    return "\ufeff"+[["English","Russian","Example","Level","Topic"],...lesson.words.map(w=>[w.en,w.ru,w.example,lesson.level,lesson.title])].map(row=>row.map(e).join(",")).join("\r\n");
  }
  function marp(){
    return ["---","marp: true","theme: default","paginate: true","size: 16:9","---\n"].join("\n")+slides.map(s=>`# ${s.title}\n\n${s.kind==="list"?s.items.map(x=>"- "+x).join("\n"):s.kind==="words"?s.items.map(w=>"- "+w.en+" — "+w.ru).join("\n"):s.text||""}`).join("\n\n---\n\n");
  }
  function handout(){
    return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(lesson.title)} - Handout</title><style>body{font:17px/1.6 Arial;color:#263b2c;max-width:880px;margin:50px auto;padding:20px}h1{font-size:46px}.words{display:grid;grid-template-columns:1fr 1fr;gap:12px}.word{padding:12px;border:1px solid #dbe4de;border-radius:10px}h2{margin-top:40px}@media print{body{margin:0}.word{break-inside:avoid}}</style><h1>${esc(lesson.title)}</h1><p>${esc(lesson.description)}</p><h2>Warm-up</h2><ul>${lesson.warmup.map(s=>`<li>${esc(s)}</li>`).join("")}</ul><h2>Words</h2><div class="words">${lesson.words.map(w=>`<div class="word"><b>${esc(w.icon)} ${esc(w.en)}</b> — ${esc(w.ru)}<br><small>${esc(w.example)}</small></div>`).join("")}</div><h2>Grammar</h2><p>${esc(lesson.grammar.rule)}</p><ul>${lesson.grammar.models.map(s=>`<li>${esc(s)}</li>`).join("")}</ul><h2>Read</h2><p>${esc(lesson.story)}</p><h2>Speak</h2><ol>${lesson.questions.map(s=>`<li>${esc(s)}</li>`).join("")}</ol><h2>Role-play</h2><ol>${lesson.situations.map(s=>`<li>${esc(s)}</li>`).join("")}</ol><h2>Homework</h2>${esc(lesson.homework)}<hr><small>Teaching Assets · Original lesson draft · Teacher review required</small></html>`;
  }
  function exportAsset(act){
    if(act==="print"){window.print();return;}
    if(act==="csv"){download(lesson.id+".csv",csv(),"text/csv;charset=utf-8");return;}
    if(act==="json"){download(lesson.id+".json",JSON.stringify(lesson,null,2),"application/json");return;}
    if(act==="pptx"){window.TAExports?.pptx(lesson,download);return;}
    if(act==="marp"){download(lesson.id+"-presentation.md",marp(),"text/markdown");return;}
    if(act==="html"){download(lesson.id+"-handout.html",handout(),"text/html");return;}
    if(act==="xlsx"){window.TAExports?.xlsx(lesson,download);return;}
    if(act==="zip"){window.TAExports?.zipCards(lesson,cardSvg,download);return;}
    if(act==="svg"){const w=lesson.words[st.card];download(lesson.id+"-"+st.card+".svg",cardSvg(lesson,w,false),"image/svg+xml");}
  }
  function click(e){
    let b=e.target.closest("[data-tab]");if(b){e.preventDefault();switchTab(b.dataset.tab);return;}
    b=e.target.closest("[data-card]");if(b){st.card=+b.dataset.card;st.flipped=false;cardRender();return;}
    b=e.target.closest("[data-prompt]");if(b){st.prompt=+b.dataset.prompt;speakRender();return;}
    b=e.target.closest("[data-svg]");if(b){const i=+b.dataset.svg;download(lesson.id+"-"+i+".svg",cardSvg(lesson,lesson.words[i],false),"image/svg+xml");return;}
    b=e.target.closest("[data-answer]");if(b){answer(b);return;}
    b=e.target.closest("[data-match]");if(b){match(b);return;}
    b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
    if(a==="slide-prev"||a==="slide-next"){st.slide+=a==="slide-next"?1:-1;slideRender();}
    else if(a==="focus"){document.body.classList.toggle("presenter");}
    else if(a==="card-prev"||a==="card-next"){st.card+=a==="card-next"?1:-1;st.flipped=false;cardRender();}
    else if(a==="card-flip"){st.flipped=!st.flipped;cardRender();}
    else if(a==="picture"){st.picture=!st.picture;st.flipped=false;cardRender();}
    else if(a==="say"){if(window.speechSynthesis){speechSynthesis.cancel();const msg=new SpeechSynthesisUtterance(lesson.words[st.card].en);msg.lang="en-US";speechSynthesis.speak(msg);}else toast("Speech unavailable");}
    else if(a==="quiz-next"){if(st.answered){st.quiz++;st.answered=false;quizRender();}}
    else if(a==="quiz-reset"){st.quiz=0;st.score=0;st.answered=false;quizRender();}
    else if(a==="match-reset"){st.first=null;st.matched=new Set();st.attempts=0;matchRender();}
    else if(a==="speak-prev"||a==="speak-next"){st.prompt+=a==="speak-next"?1:-1;speakRender();}
    else if(a==="random"){st.prompt=(st.prompt+1+Math.floor(Math.random()*(lesson.questions.length-1)))%lesson.questions.length;speakRender();}
    else if(a==="share"){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(location.href).then(()=>toast("Link copied")).catch(()=>toast("Copy URL from address bar"));else toast("Copy URL from address bar");}
    else if(a==="save"){let saved=false;try{saved=localStorage.getItem("ta:"+lesson.id)==="1";localStorage.setItem("ta:"+lesson.id,saved?"0":"1");}catch(_){}b.textContent=saved?"♡":"♥";toast(saved?"Removed from saved":"Saved in this browser");}
    else exportAsset(a);
  }
  document.addEventListener("click",click);
  document.addEventListener("keydown",e=>{
    if(!lesson)return;
    if(e.key==="Escape"){document.body.classList.remove("presenter");return;}
    if(e.target.closest("input,textarea,select,[contenteditable]"))return;
    if(e.key.toLowerCase()==="f"&&st.tab==="slides"){document.body.classList.toggle("presenter");e.preventDefault();}
    if(["ArrowLeft","ArrowRight"].includes(e.key)&&st.tab==="slides"){st.slide+=e.key==="ArrowRight"?1:-1;slideRender();e.preventDefault();}
    if(["ArrowLeft","ArrowRight"].includes(e.key)&&st.tab==="cards"){st.card+=e.key==="ArrowRight"?1:-1;st.flipped=false;cardRender();e.preventDefault();}
  });
  if(document.body.dataset.view==="lesson"){
    const l=LESSONS.find(x=>x.id===document.body.dataset.id);
    if(l)lessonPage(l);else $("#app").innerHTML=header()+`<main class="container" style="padding:85px 0"><h1>Lesson not found</h1><a class="btn" href="${home}">Return to library</a></main>`+footer();
  }else catalog();
  // Extend the dependency-free catalog with the optional photo-first lesson studio.
  const studio=document.createElement("script");
  studio.src=root+"studio.js";
  document.head.appendChild(studio);
})();

