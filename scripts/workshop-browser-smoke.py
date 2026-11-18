#!/usr/bin/env python3
"""Smoke-test the integrated Teaching Workshop inside the static lesson UI."""
import pathlib, shutil, subprocess, sys, time, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
DIST=ROOT/"dist"
CHROME=next((shutil.which(s) for s in ("google-chrome","google-chrome-stable","chromium","chromium-browser") if shutil.which(s)),None)
if not CHROME:
    raise SystemExit("Chromium required for workshop smoke test")
PORT=8766
PROBE=r"""<!doctype html><meta charset="utf-8"><title>Workshop QA</title>
<iframe id="f" src="/lessons/hello-english/index.html" style="width:1200px;height:800px"></iframe>
<pre id="result">LOADING</pre>
<script>
let tries=0;
function check(){
 const d=document.querySelector('#f').contentDocument;
 const tab=d&&d.querySelector('.tabs [data-tab="workshop"]');
 if(!tab){if(++tries<60){setTimeout(check,200);return;}document.querySelector('#result').textContent='TA_WORKSHOP_FAIL: tab missing';return;}
 try{
  const sets=d.defaultView.TA_WORKSHOP_SETS;
  if(!sets||sets.length!==90)throw Error('Expected 90 sets');
  tab.click();
  const panel=d.querySelector('#workshop');
  if(panel.hidden)throw Error('Workshop tab is hidden');
  if(panel.querySelectorAll('[data-ws-open]').length!==6)throw Error('Lesson needs 6 sets');
  const board=panel.querySelector('.ws-board');
  if(!board||board.querySelectorAll('.ws-lane').length!==3)throw Error('Board not rendered');
  const select=board.querySelector('[data-ws-move]');
  const original=board.querySelectorAll('.ws-lane')[0].querySelectorAll('.ws-note').length;
  select.value='1';
  select.dispatchEvent(new Event('change',{bubbles:true}));
  if(d.querySelector('.ws-board .ws-lane').querySelectorAll('.ws-note').length!==original-1)throw Error('Moving note failed');
  d.querySelector('[data-ws-open="hello-english-class-survey"]').click();
  const result=d.querySelector('[data-ws-value="0,4"]');
  if(!result||result.textContent.trim()!=='= 6')throw Error('Initial SUM calculation incorrect: '+result?.textContent);
  const cell=d.querySelector('[data-ws-cell="0,1"]');
  cell.value='4';cell.dispatchEvent(new Event('input',{bubbles:true}));
  if(result.textContent.trim()!=='= 8')throw Error('SUM recalculation incorrect: '+result.textContent);
  d.querySelector('[data-ws-open="hello-english-vocabulary-quiz"]').click();
  const answers=d.querySelectorAll('.ws-answer');
  if(answers.length!==4)throw Error('Quiz choices missing');
  answers[0].click();
  if(!d.querySelector('[data-ws-action="next"]')||d.querySelector('[data-ws-action="next"]').disabled)throw Error('Quiz feedback missing');
  document.querySelector('#result').textContent='TA_WORKSHOP_PASS: 90 sets; board drag alternative; workbook formula; interactive quiz';
 }catch(e){document.querySelector('#result').textContent='TA_WORKSHOP_FAIL: '+String(e.message||e);}
}
setTimeout(check,800);
</script>"""
(DIST/"workshop-probe.html").write_text(PROBE,encoding="utf-8")
server=subprocess.Popen([sys.executable,"-m","http.server",str(PORT),"--bind","127.0.0.1","--directory",str(DIST)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    url="http://127.0.0.1:"+str(PORT)+"/workshop-probe.html"
    for _ in range(40):
        try: urllib.request.urlopen(url,timeout=1).read(10);break
        except Exception: time.sleep(.2)
    else: raise RuntimeError("Local web server did not start")
    args=[CHROME,"--headless=new","--disable-gpu","--no-sandbox","--disable-dev-shm-usage","--no-first-run","--virtual-time-budget=14000","--dump-dom",url]
    result=subprocess.run(args,capture_output=True,text=True,timeout=90)
    if result.returncode!=0:raise RuntimeError("Chromium failed: "+result.stderr[-1000:])
    if "TA_WORKSHOP_PASS:" not in result.stdout:
        snippet=result.stdout.split('<pre id="result">')[-1].split('</pre>')[0][:600]
        raise AssertionError("Workshop UI smoke failure: "+snippet)
    print("✓ Integrated Workshop browser QA passed: board, table calculations, quiz and 90 sets")
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
