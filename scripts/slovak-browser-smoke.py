#!/usr/bin/env python3
"""Headless smoke test for the bilingual catalogue and Slovak classroom routes."""
from __future__ import annotations
import pathlib, shutil, subprocess, sys, time, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
CHROME = next((shutil.which(b) for b in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser") if shutil.which(b)), None)
if not CHROME:
    raise SystemExit("Chromium required for Slovak browser smoke tests")
PORT = 8768
HTML = r"""<!doctype html><html lang="ru"><meta charset="utf-8"><title>Slovak QA</title>
<iframe id="lesson" src="/lessons/sk-first-words/index.html" style="width:1000px;height:720px"></iframe>
<iframe id="catalog" src="/index.html?lang=sk#catalog" style="width:1000px;height:740px"></iframe>
<pre id="result">LOADING</pre>
<script>
let tries=0;
function check(){
 const lesson=document.querySelector('#lesson').contentDocument;
 const cat=document.querySelector('#catalog').contentDocument;
 if(!lesson||!cat||!lesson.querySelector('[data-tab="workshop"]')||!lesson.querySelector('[data-tab="listening"]')||!cat.querySelector('#catalog-grid')){
  if(++tries<75){setTimeout(check,160);return;}
  document.querySelector('#result').textContent='TA_SK_FAIL: not ready';return;
 }
 try{
  const data=lesson.defaultView.LESSONS;
  if(data.length!==35||data.filter(x=>x.language==='sk').length!==15)throw Error('Curriculum count wrong');
  if(!lesson.querySelector('.site-brand-logo')?.naturalWidth)throw Error('Original LangiaFlow logo not loaded');
  if(!cat.querySelector('[data-language="sk"].active'))throw Error('Slovak filter not active');
  if(cat.querySelectorAll('.lesson-card').length!==15)throw Error('Expected 15 Slovak cards');
  const a2=cat.querySelector('[data-filter="A2"]');a2.click();
  if(cat.querySelectorAll('.lesson-card').length!==3)throw Error('Expected 3 Slovak A2 cards');
  lesson.querySelector('[data-tab="studio"]').click();
  const artwork=lesson.querySelectorAll('.ta-scene img');
  if(artwork.length!==3||![...artwork].every(img=>img.getAttribute('src').endsWith('.svg')))throw Error('Slovak scenes must be genuine SVGs');
  lesson.querySelector('[data-tab="listening"]').click();
  if(!lesson.querySelector('#ta-locale option[value="sk-SK"]'))throw Error('Missing Slovak speech locale');
  lesson.querySelector('[data-tab="workshop"]').click();
  const panel=lesson.querySelector('#workshop');
  if(panel.hidden||panel.querySelectorAll('[data-ws-open]').length!==6)throw Error('Slovak workshop not integrated');
  panel.querySelector('[data-ws-open="sk-first-words-vocabulary-quiz"]').click();
  const q=panel.querySelector('.ws-quiz');
  if(!q||q.querySelectorAll('.ws-answer').length!==4)throw Error('Slovak quiz not rendered');
  q.querySelector('.ws-answer').click();
  if(panel.querySelector('[data-ws-action="next"]').disabled)throw Error('Slovak quiz not scored');
  document.querySelector('#result').textContent='TA_SK_PASS: 15 Slovak lessons, 3 A2, logo, SVG art, sk-SK voice and Workshop';
 }catch(e){document.querySelector('#result').textContent='TA_SK_FAIL: '+e.message;}
}
setTimeout(check,750);
</script></html>"""
(DIST / "slovak-qa.html").write_text(HTML, encoding="utf8")
server = subprocess.Popen(
    [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1", "--directory", str(DIST)],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
)
try:
    url = f"http://127.0.0.1:{PORT}/slovak-qa.html"
    for _ in range(45):
        try:
            urllib.request.urlopen(url, timeout=1).read(10)
            break
        except Exception:
            time.sleep(.2)
    else:
        raise RuntimeError("HTTP server unavailable")
    result = subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
         "--no-first-run", "--virtual-time-budget=18000", "--dump-dom", url],
        capture_output=True, text=True, timeout=95
    )
    if result.returncode:
        raise RuntimeError("Chrome returned error: "+result.stderr[-1000:])
    if "TA_SK_PASS:" not in result.stdout:
        output=result.stdout.split('<pre id="result">')[-1].split("</pre>")[0][:450]
        raise AssertionError("Slovak UI smoke: "+output)
    print("✓ Bilingual catalog, 3 Slovak A2 lessons, SVG scenes, logo, speech locale and workshop passed")
finally:
    server.terminate()
    try:
        server.wait(timeout=5)
    except subprocess.TimeoutExpired:
        server.kill()
