(function TeachingWorkshop(){
"use strict";
const root=document.body.dataset.root||"";
const lessons=window.LESSONS||[],sets=window.TA_WORKSHOP_SETS||[];
const lesson=lessons.find(l=>l.id===document.body.dataset.id);
const standalone=document.body.dataset.view==="workshop";
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const kindLabels={board:"Доска",sheet:"Таблица",quiz:"Тест"};
const safeId=s=>String(s).replace(/[^a-z0-9-]/gi,"-");
let active=null,board=[],rows=[],step=0,score=0,answered=false,selected="",filter="all",lessonFilter="all",languageFilter="all",levelFilter="all";
const storeKey=id=>"ta:workshop:v1:"+id;
function readState(s){try{const x=JSON.parse(localStorage.getItem(storeKey(s.id))||"null");return x&&x.version===1&&x.kind===s.kind?x:null;}catch(_){return null;}}
function save(){if(!active)return;try{localStorage.setItem(storeKey(active.id),JSON.stringify({version:1,kind:active.kind,board,rows,step,score,answered,selected}));}catch(_){showStatus("Недостаточно места для сохранения — экспортируйте результат.");}}
function showStatus(msg){const e=$("#ws-status");if(e)e.textContent=msg;}
function download(name,content,mime="text/plain;charset=utf-8"){
 const blob=content instanceof Blob?content:new Blob([content],{type:mime}),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function urlFor(s){return root+"workshop/index.html?lesson="+encodeURIComponent(s.lessonId)+"&set="+encodeURIComponent(s.id);}
function cardsFor(list){return list.map(s=>`<button type="button" class="ws-set ${active?.id===s.id?"active":""}" data-ws-open="${esc(s.id)}" aria-pressed="${active?.id===s.id}"><span class="ws-badge">${s.language==="sk"?"🇸🇰":"🇬🇧"} ${kindLabels[s.kind]} · ${esc(s.level)}</span><strong>${esc(s.title)}</strong><small>${esc(s.summary)}</small><span class="ws-minutes">◷ ${s.minutes} мин · ${esc(lessons.find(l=>l.id===s.lessonId)?.title||"")}</span></button>`).join("");}
function renderPicker(){
 const picker=$("#ws-picker");if(!picker)return;
 const list=sets.filter(s=>(lesson?s.lessonId===lesson.id:lessonFilter==="all"||s.lessonId===lessonFilter)&&(filter==="all"||s.kind===filter)&&(lesson||languageFilter==="all"||s.language===languageFilter)&&(lesson||levelFilter==="all"||s.level===levelFilter));
 picker.innerHTML=cardsFor(list)||'<p>Для выбранных фильтров нет наборов.</p>';
 const count=$("#ws-count");if(count)count.textContent=`${list.length} наборов`;
}
function choose(id){
 const item=sets.find(s=>s.id===id);if(!item)return;
 active=item;
 const state=readState(item);
 board=(state?.board||item.columns?.map((c,i)=>({title:c.title,notes:c.notes.map((text,j)=>({id:`${i}-${j}`,text}))}))||[]).map(c=>({title:String(c.title),notes:Array.isArray(c.notes)?c.notes.map(n=>({id:String(n.id),text:String(n.text)})):[]}));
 rows=(state?.rows||item.rows||[]).map(r=>Array.isArray(r)?r.map(v=>String(v??"")):[]);
 step=Number.isInteger(state?.step)?Math.max(0,Math.min(item.items?.length||0,state.step)):0;
 score=Number.isInteger(state?.score)?Math.max(0,Math.min(item.items?.length||0,state.score)):0;
 answered=!!state?.answered;selected=String(state?.selected||"");
 if(standalone){const u=new URL(location.href);u.searchParams.set("lesson",item.lessonId);u.searchParams.set("set",item.id);history.replaceState(null,"",u);}
 renderPicker();renderStage();
}
function stageHeader(){
 const l=lessons.find(x=>x.id===active.lessonId);
 return `<div class="ws-stage-head"><div><div class="eyebrow">${l?.language==="sk"?"🇸🇰 Словацкий":"🇬🇧 Английский"} · ${esc(l?.level||"")} · ${kindLabels[active.kind]} · ${active.minutes} мин</div><h2>${esc(active.title)}</h2><p>${esc(active.summary)}</p><div class="ws-task"><b>Задание преподавателя:</b> ${esc(active.task)}</div></div><div class="ws-actions"><button class="btn small" data-ws-action="reset">↺ Сбросить</button><button class="btn small" data-ws-action="print">⎙ Печать</button><button class="btn primary small" data-ws-action="export">↓ Скачать ${active.kind==="sheet"?"XLSX":active.kind==="board"?"HTML":"JSON"}</button></div></div>`;
}
function renderStage(){
 const host=$("#ws-stage");if(!host||!active)return;
 host.innerHTML=`<article class="ws-stage">${stageHeader()}<div id="ws-workarea">${active.kind==="board"?boardHTML():active.kind==="sheet"?sheetHTML():quizHTML()}</div><p class="ws-status" id="ws-status" role="status" aria-live="polite">Изменения автоматически сохраняются в этом браузере. Для передачи материалов используйте экспорт.</p></article>`;
 if(active.kind==="sheet")recalc();
}
function boardHTML(){
 return `<div class="ws-board" aria-label="Интерактивная доска">${board.map((column,idx)=>`<section class="ws-lane" data-ws-lane="${idx}" aria-label="${esc(column.title)}"><div class="ws-lane-title"><h3>${esc(column.title)}</h3><span>${column.notes.length}</span></div><div class="ws-notes">${column.notes.map(note=>`<article class="ws-note" draggable="true" data-ws-note="${esc(note.id)}"><label class="ws-sr" for="note-${safeId(note.id)}">Содержание заметки</label><textarea id="note-${safeId(note.id)}" data-ws-edit="${esc(note.id)}" maxlength="1200" rows="3">${esc(note.text)}</textarea><div class="ws-note-tools"><label>Переместить <select aria-label="Переместить заметку" data-ws-move="${esc(note.id)}">${board.map((target,j)=>`<option value="${j}" ${j===idx?"selected":""}>${esc(target.title)}</option>`).join("")}</select></label><button type="button" data-ws-delete="${esc(note.id)}" aria-label="Удалить заметку">×</button></div></article>`).join("")}</div><div class="ws-add"><label class="ws-sr" for="ws-new-${idx}">Новая заметка</label><textarea id="ws-new-${idx}" maxlength="1200" rows="2" placeholder="Своя идея, вопрос или ответ…"></textarea><button class="btn small" data-ws-add="${idx}">+ Добавить заметку</button></div></section>`).join("")}</div><p class="ws-help">Перетаскивайте заметки между колонками мышью или используйте меню «Переместить». Содержание можно редактировать.</p>`;
}
function sheetHTML(){
 const alphabet=active.headers.map((_,i)=>String.fromCharCode(65+i));
 return `<div class="ws-sheet-wrap"><table class="ws-sheet" aria-label="${esc(active.title)}"><thead><tr><th scope="col">#</th>${active.headers.map((h,i)=>`<th scope="col"><span>${alphabet[i]}</span>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row,i)=>`<tr><th scope="row">${i+2}</th>${row.map((value,j)=>`<td><label class="ws-sr" for="ws-cell-${i}-${j}">${esc(active.headers[j])}, строка ${i+2}</label><input id="ws-cell-${i}-${j}" data-ws-cell="${i},${j}" value="${esc(value)}" autocomplete="off" spellcheck="false"><output data-ws-value="${i},${j}" aria-live="off"></output></td>`).join("")}</tr>`).join("")}</tbody></table></div><div class="ws-sheet-foot"><span>Формулы: <code>=SUM(B2:D2)</code>, <code>=AVERAGE(B2:D2)</code>, <code>=COUNT(B2:D2)</code>, <code>=C2-B2</code>.</span><div class="button-row"><button class="btn small" data-ws-action="csv">↓ CSV (Excel)</button><button class="btn small" data-ws-action="add-row">+ Строка</button></div></div>`;
}
function cellValue(row,col,visited=new Set()){
 const key=row+","+col;
 if(row<0||row>=rows.length||col<0||col>=active.headers.length)return NaN;
 if(visited.has(key))return NaN;
 const next=new Set(visited);next.add(key);const raw=rows[row][col]||"";
 if(!raw.startsWith("="))return raw.trim()===""?NaN:Number(raw.replace(",","."));
 const ref=r=>{const m=/^([A-Z])([1-9]\d*)$/i.exec(r);return m?cellValue(Number(m[2])-2,m[1].toUpperCase().charCodeAt(0)-65,next):NaN;};
 const formula=raw.slice(1).trim().toUpperCase().replace(/\s+/g,"");
 const fn=/^(SUM|AVERAGE|COUNT)\(([A-Z][1-9]\d*):([A-Z][1-9]\d*)\)$/.exec(formula);
 if(fn){
  const m1=/^([A-Z])(\d+)$/.exec(fn[2]),m2=/^([A-Z])(\d+)$/.exec(fn[3]);
  let c1=m1[1].charCodeAt(0)-65,c2=m2[1].charCodeAt(0)-65,r1=+m1[2]-2,r2=+m2[2]-2;
  if(c1>c2||r1>r2||c2>=active.headers.length||r2>=rows.length||r1<0||(r2-r1+1)*(c2-c1+1)>500)return NaN;
  const values=[];for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){const v=cellValue(r,c,next);if(Number.isFinite(v))values.push(v);}
  return fn[1]==="COUNT"?values.length:fn[1]==="AVERAGE"?(values.length?values.reduce((a,b)=>a+b,0)/values.length:NaN):values.reduce((a,b)=>a+b,0);
 }
 const binary=/^([A-Z][1-9]\d*)([+-])([A-Z][1-9]\d*)$/.exec(formula);
 if(binary){const a=ref(binary[1]),b=ref(binary[3]);return Number.isFinite(a)&&Number.isFinite(b)?(binary[2]==="+"?a+b:a-b):NaN;}
 return /^([A-Z][1-9]\d*)$/.test(formula)?ref(formula):NaN;
}
function recalc(){
 $$("[data-ws-value]").forEach(o=>{const [i,j]=o.dataset.wsValue.split(",").map(Number),v=rows[i]?.[j]||"";if(v.startsWith("=")){const n=cellValue(i,j);o.textContent=Number.isFinite(n)?("= "+Number(n.toFixed(3))):"#ERR";o.classList.toggle("ws-error",!Number.isFinite(n));}else{o.textContent="";o.classList.remove("ws-error");}});
}
function quizHTML(){
 const count=active.items.length;
 if(step>=count)return `<div class="ws-complete"><div class="ws-complete-icon">✓</div><h3>Тест завершён</h3><p>Верных ответов: <strong>${score} из ${count}</strong> (${Math.round(score/count*100)}%).</p><button class="btn primary" data-ws-action="reset">Пройти ещё раз ↺</button></div>`;
 const q=active.items[step];
 const controls=q.type==="choice"?`<div class="ws-answers">${q.options.map((o,i)=>`<button class="ws-answer ${answered&&o===q.answer?"correct":answered&&selected===o?"incorrect":""}" data-ws-choice="${esc(o)}" ${answered?"disabled":""}>${String.fromCharCode(65+i)} · ${esc(o)}</button>`).join("")}</div>`:
 q.type==="boolean"?`<div class="ws-answers">${["True","False"].map(o=>`<button class="ws-answer ${answered&&o===q.answer?"correct":answered&&selected===o?"incorrect":""}" data-ws-choice="${o}" ${answered?"disabled":""}>${o}</button>`).join("")}</div>`:
 `<label class="ws-input-label" for="ws-typed">Введите английское выражение:</label><input id="ws-typed" class="ws-typed" placeholder="Your answer…" value="${esc(selected)}" ${answered?"disabled":""} autocomplete="off"><button class="btn primary" data-ws-action="check" ${answered?"disabled":""}>Проверить</button>`;
 return `<div class="ws-quiz"><div class="ws-quiz-progress"><b>Вопрос ${step+1} из ${count}</b><span>Верно: ${score}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.round((step+(answered?1:0))/count*100)}%"></div></div><h3>${esc(q.question)}</h3>${controls}<div class="ws-feedback ${answered?(normal(selected)===normal(q.answer)?"correct":"wrong"):""}" role="status">${answered?(normal(selected)===normal(q.answer)?"✓ Верно. ":"Правильный ответ: "+esc(q.answer)+". ")+esc(q.explanation||""):"Выберите или введите ответ для проверки."}</div><button class="btn primary" data-ws-action="next" ${answered?"":"disabled"}>${step===count-1?"Результаты":"Следующий вопрос"} →</button></div>`;
}
function normal(s){return String(s??"").normalize("NFKC").toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?]+$/g,"").replace(/\s+/g," ").trim();}
function mark(value){
 if(answered||!active||active.kind!=="quiz")return;
 selected=String(value).trim();if(!selected)return;
 answered=true;if(normal(selected)===normal(active.items[step].answer))score++;
 save();renderStage();
}
function findNote(id){for(let i=0;i<board.length;i++){const j=board[i].notes.findIndex(n=>n.id===id);if(j>=0)return {column:i,index:j,note:board[i].notes[j]};}return null;}
function moveNote(id,to){const found=findNote(id);if(!found||!board[to]||found.column===to)return;board[found.column].notes.splice(found.index,1);board[to].notes.push(found.note);save();renderStage();}
function exportHTML(){
 const sections=board.map(c=>`<section><h2>${esc(c.title)}</h2>${c.notes.map(n=>`<article>${esc(n.text)}</article>`).join("")}</section>`).join("");
 const html=`<!doctype html><html lang="ru"><meta charset="utf-8"><title>${esc(active.title)}</title><style>body{font:16px/1.5 Arial;color:#273c32;margin:35px}main{display:grid;grid-template-columns:repeat(${board.length},minmax(0,1fr));gap:18px}section{background:#f4f7f2;border-radius:15px;padding:15px;min-width:0}article{white-space:pre-wrap;overflow-wrap:anywhere;background:#fff;border:1px solid #dce6de;border-radius:9px;margin:12px 0;padding:12px}h1{font-size:30px}h2{font-size:17px}@media print{@page{size:A4 landscape;margin:10mm}body{margin:0}article{break-inside:avoid}}</style><h1>${esc(active.title)}</h1><p>${esc(active.task)}</p><main>${sections}</main><footer>Teaching Assets · Exported classroom board</footer></html>`;
 download(active.id+".html",html,"text/html;charset=utf-8");
}
function exportTableCSV(){
 const safe=v=>{const t=String(v??"");const guarded=/^[\s]*[=+\-@\t\r]/.test(t)?"'"+t:t;return '"'+guarded.replace(/"/g,'""')+'"';};
 const vals=rows.map((row,i)=>row.map((v,j)=>v.startsWith("=")?(Number.isFinite(cellValue(i,j))?String(cellValue(i,j)):"#ERR"):v));
 download(active.id+".csv","\ufeff"+[active.headers,...vals].map(r=>r.map(safe).join(",")).join("\r\n"),"text/csv;charset=utf-8");
}
function printPreview(){
 const title=esc(active.title);
 let content="";
 if(active.kind==="board")content=`<div class="columns">${board.map(c=>`<section><h2>${esc(c.title)}</h2>${c.notes.map(n=>`<article>${esc(n.text)}</article>`).join("")}</section>`).join("")}</div>`;
 else if(active.kind==="sheet")content=`<table><thead><tr>${active.headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r,i)=>`<tr>${r.map((v,j)=>`<td>${esc(v.startsWith("=")?(Number.isFinite(cellValue(i,j))?String(Number(cellValue(i,j).toFixed(3))):"#ERR"):v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
 else content=`<ol>${active.items.map(q=>`<li><strong>${esc(q.question)}</strong><div class="write"></div></li>`).join("")}</ol><h2>Ответы (для преподавателя)</h2><ol>${active.items.map(q=>`<li>${esc(q.answer)}</li>`).join("")}</ol>`;
 const html=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${title} · Print</title><style>@page{size:A4 landscape;margin:12mm}body{font:14px/1.5 Arial;color:#294030;margin:24px}h1{font-size:27px}.columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}section{background:#f2f7f2;padding:12px;border-radius:10px}article{background:#fff;border:1px solid #dce8dc;margin:8px 0;padding:10px;white-space:pre-wrap;overflow-wrap:anywhere;break-inside:avoid}h2{font-size:16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #dde7de;padding:8px;text-align:left;overflow-wrap:anywhere}th{background:#eaf3ea}li{margin:12px 0;break-inside:avoid}.write{border-bottom:1px solid #b6c5b8;height:25px;margin-top:6px}button{border:0;border-radius:9px;background:#386c50;color:white;padding:10px 14px;cursor:pointer}@media print{button{display:none}body{margin:0}}</style></head><body><button onclick="window.print()">⎙ Печать / PDF</button><h1>${title}</h1><p>${esc(active.task)}</p>${content}<footer>Teaching Assets · Original classroom materials</footer></body></html>`;
 const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));
 const popup=window.open(url,"_blank");
 if(!popup){URL.revokeObjectURL(url);download(active.id+"-print.html",html,"text/html;charset=utf-8");showStatus("Браузер запретил новое окно — скачан файл для печати.");return;}
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function exportSet(){
 if(active.kind==="board"){exportHTML();return;}
 if(active.kind==="sheet"){
  if(window.TAExports?.xlsxTable)window.TAExports.xlsxTable({id:active.id,title:active.title,headers:active.headers,rows,calculate:cellValue},download);
  else exportTableCSV();
  return;
 }
 const payload={title:active.title,lesson:active.lessonId,questions:active.items,score,completed:step>=active.items.length};
 download(active.id+".json",JSON.stringify(payload,null,2),"application/json;charset=utf-8");
}
function onClick(e){
 if(!$("#ws-picker"))return;
 let b=e.target.closest("[data-ws-open]");if(b){choose(b.dataset.wsOpen);return;}
 b=e.target.closest("[data-ws-add]");if(b&&active?.kind==="board"){
  const i=Number(b.dataset.wsAdd),v=$("#ws-new-"+i)?.value.trim();if(!v)return;
  board[i].notes.push({id:"note-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),text:v});save();renderStage();return;
 }
 b=e.target.closest("[data-ws-delete]");if(b&&active?.kind==="board"){const n=findNote(b.dataset.wsDelete);if(n){board[n.column].notes.splice(n.index,1);save();renderStage();}return;}
 b=e.target.closest("[data-ws-choice]");if(b){mark(b.dataset.wsChoice);return;}
 b=e.target.closest("[data-ws-action]");if(!b||!active)return;
 switch(b.dataset.wsAction){
 case "reset":{try{localStorage.removeItem(storeKey(active.id));}catch(_){}choose(active.id);showStatus("Исходный шаблон восстановлен.");break;}
 case "print":printPreview();break;
 case "export":exportSet();break;
 case "csv":if(active.kind==="sheet")exportTableCSV();break;
 case "add-row":if(active.kind==="sheet"&&rows.length<100){rows.push(active.headers.map(()=>""));save();renderStage();}break;
 case "check":mark($("#ws-typed")?.value||"");break;
 case "next":if(answered){step++;answered=false;selected="";save();renderStage();}break;
 }
}
function onInput(e){
 const input=e.target.closest("[data-ws-edit]");if(input&&active?.kind==="board"){const n=findNote(input.dataset.wsEdit);if(n){n.note.text=input.value;save();}return;}
 const cell=e.target.closest("[data-ws-cell]");if(cell&&active?.kind==="sheet"){const [i,j]=cell.dataset.wsCell.split(",").map(Number);if(rows[i]){rows[i][j]=cell.value;save();recalc();}return;}
}
function onChange(e){
 const move=e.target.closest("[data-ws-move]");if(move){moveNote(move.dataset.wsMove,Number(move.value));return;}
 if(!standalone)return;
 if(e.target.id==="ws-lesson-filter")lessonFilter=e.target.value;
 else if(e.target.id==="ws-lang-filter")languageFilter=e.target.value;
 else if(e.target.id==="ws-level-filter")levelFilter=e.target.value;
 else return;
 renderPicker();
}
function directory(){
 const host=$("#ws-app");if(!host)return;
 const params=new URLSearchParams(location.search);
 lessonFilter=lessons.some(l=>l.id===params.get("lesson"))?params.get("lesson"):"all";
 languageFilter=["sk","en"].includes(params.get("lang"))?params.get("lang"):"all";
 host.innerHTML=`<div class="ws-directory-head"><div class="eyebrow">${sets.length} ГОТОВЫХ АКТИВНОСТЕЙ · A0–B2</div><h1>Teaching Workshop<span>.</span></h1><p>Готовые интерактивные доски, Excel-таблицы и самопроверяемые тесты по вашим урокам. Работают без регистрации и сервера.</p><a class="btn soft" href="${root}index.html#catalog">← Все уроки</a></div><div class="ws-directory-toolbar"><label>Язык <select id="ws-lang-filter"><option value="all" ${languageFilter==="all"?"selected":""}>Все языки</option><option value="en" ${languageFilter==="en"?"selected":""}>🇬🇧 English</option><option value="sk" ${languageFilter==="sk"?"selected":""}>🇸🇰 Slovenčina</option></select></label><label>Уровень <select id="ws-level-filter"><option value="all">Все уровни</option>${["A0","A1","A2","B1","B2"].map(v=>`<option value="${v}">${v}</option>`).join("")}</select></label><label>Урок <select id="ws-lesson-filter"><option value="all">Все ${lessons.length} уроков</option>${lessons.map(l=>`<option value="${esc(l.id)}" ${l.id===lessonFilter?"selected":""}>${esc(l.level)} · ${esc(l.title)}</option>`).join("")}</select></label><div class="ws-filter">${["all","board","sheet","quiz"].map(k=>`<button class="chip ${k==="all"?"active":""}" data-ws-filter="${k}">${k==="all"?"Все форматы":kindLabels[k]}</button>`).join("")}</div><span class="pill" id="ws-count"></span></div><div class="ws-layout"><div class="ws-directory-list"><h2>Библиотека наборов</h2><div class="ws-picker" id="ws-picker"></div></div><div class="ws-play-area" id="ws-stage"></div></div>`;
 const requested=sets.find(s=>s.id===params.get("set"));choose(requested?.id||(sets.find(s=>lessonFilter==="all"||s.lessonId===lessonFilter)?.id));
}
function installLessonTab(){
 const tabs=$(".tabs"),sidebar=$(".sidebar"),main=$(".lesson-main");if(!tabs||!main)return;
 tabs.insertAdjacentHTML("beforeend",'<button class="tab" role="tab" aria-selected="false" data-tab="workshop">▦ Workshop</button>');
 if(sidebar){const a=document.createElement("a");a.className="side-link";a.href="#workshop";a.dataset.tab="workshop";a.textContent="▦ Workshop";sidebar.insertBefore(a,sidebar.querySelector(".sidebar-tip"));}
 main.insertAdjacentHTML("beforeend",`<section id="workshop" class="tab-panel" hidden><div class="ws-lesson-heading"><div class="eyebrow">${lesson.language==="sk"?"🇸🇰 SLOVENČINA":"🇬🇧 ENGLISH"} · 6 SETS FOR THIS LESSON</div><h2>Interactive workshop<span>.</span></h2><p>Две доски, две Excel-совместимые таблицы и два теста по теме «${esc(lesson.title)}». Выбирайте, редактируйте и экспортируйте.</p><a class="btn small" href="${root}workshop/index.html?lesson=${encodeURIComponent(lesson.id)}">Открыть всю мастерскую ↗</a></div><div class="ws-picker ws-lesson-picker" id="ws-picker"></div><span class="ws-picker-count" id="ws-count"></span><div id="ws-stage"></div></section>`);
 choose(sets.find(s=>s.lessonId===lesson.id)?.id);
 if(location.hash==="#workshop")setTimeout(()=>$('.tabs [data-tab="workshop"]')?.click(),0);
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ws-filter]");if(b&&standalone){filter=b.dataset.wsFilter;$$("[data-ws-filter]").forEach(x=>x.classList.toggle("active",x===b));renderPicker();return;}onClick(e);});
document.addEventListener("input",onInput);
document.addEventListener("change",onChange);
document.addEventListener("dragstart",e=>{const n=e.target.closest("[data-ws-note]");if(n&&active?.kind==="board"&&e.dataTransfer){e.dataTransfer.setData("text/plain",n.dataset.wsNote);e.dataTransfer.effectAllowed="move";}});
document.addEventListener("dragover",e=>{if(e.target.closest("[data-ws-lane]")&&active?.kind==="board")e.preventDefault();});
document.addEventListener("drop",e=>{const lane=e.target.closest("[data-ws-lane]");if(lane&&active?.kind==="board"){e.preventDefault();const id=e.dataTransfer?.getData("text/plain");if(id)moveNote(id,Number(lane.dataset.wsLane));}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="ws-typed"&&!answered){e.preventDefault();mark(e.target.value);}});
if(standalone)directory();else if(lesson)installLessonTab();
})();
