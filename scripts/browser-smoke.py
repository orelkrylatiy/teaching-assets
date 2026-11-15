#!/usr/bin/env python3
"""Headless-browser regression check for the static photo lesson UI and A4 PDF."""
import os, re, sys, time, pathlib, shutil, subprocess, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
QA = DIST / "qa"
QA.mkdir(exist_ok=True)
HOST = "http://127.0.0.1:8765"
CHROME = next((shutil.which(x) for x in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser") if shutil.which(x)), None)
if not CHROME:
    print("Chrome/Chromium not installed: browser QA unavailable", file=sys.stderr)
    sys.exit(1)
PROBE = """<!doctype html><meta charset="utf-8"><title>Teaching Assets QA</title>
<iframe id="f" style="border:0;width:1320px;height:760px" src="/lessons/daily-routines/index.html"></iframe><pre id="result">LOADING</pre>
<script>
const frame=document.querySelector('#f');
const output=document.querySelector('#result');
let attempts=0;
function check(){
 const d=frame.contentDocument;
 const stage=d&&d.querySelector('.stage-card');
 const canvas=d&&d.querySelector('.ta-canvas');
 const pic=d&&d.querySelector('.ta-deck-photo');
 const pages=d&&d.querySelectorAll('.ta-print-page');
 if(!stage||!canvas||!pic||pages.length!==14){
   if(++attempts<32){setTimeout(check,250);return;}
   output.textContent='TA_QA_FAIL not_ready '+JSON.stringify({stage:!!stage,canvas:!!canvas,pic:!!pic,pages:pages?.length});
   return;
 }
 const normalRatio=stage.clientWidth/stage.clientHeight;
 const pictureLoaded=pic.complete && pic.naturalWidth>0;
 d.body.classList.add('presenter');
 frame.contentWindow.dispatchEvent(new Event('resize'));
 setTimeout(()=>{
   const box=d.querySelector('.lesson-stage');
   const stage2=d.querySelector('.stage-card');
   const fit=stage2.scrollHeight<=stage2.clientHeight+2 && stage2.scrollWidth<=stage2.clientWidth+2;
   const fullscreen=box.getBoundingClientRect().width>=frame.contentWindow.innerWidth-3;
   const printCount=d.querySelectorAll('.ta-print-page').length;
   const ok=fit&&fullscreen&&pictureLoaded&&printCount===14&&normalRatio>1.7&&normalRatio<1.9;
   output.textContent=(ok?'TA_QA_PASS':'TA_QA_FAIL')+' '+JSON.stringify({fit,fullscreen,pictureLoaded,printCount,normalRatio});
 },500);
}
setTimeout(check,650);
</script>"""
(DIST / "qa-probe.html").write_text(PROBE, encoding="utf-8")
server=subprocess.Popen([sys.executable,"-m","http.server","8765","--bind","127.0.0.1","--directory",str(DIST)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    for _ in range(40):
        try:
            urllib.request.urlopen(HOST,timeout=1).read(10);break
        except Exception: time.sleep(.25)
    else: raise RuntimeError("Local static server did not start")
    args=[CHROME,"--headless=new","--disable-gpu","--no-sandbox","--disable-dev-shm-usage","--hide-scrollbars","--no-first-run","--disable-extensions","--virtual-time-budget=9000"]
    def run(extra,timeout=95):
        result=subprocess.run(args+extra,capture_output=True,text=True,timeout=timeout)
        if result.returncode!=0:
            raise RuntimeError("Chrome exit %d: %s"%(result.returncode,result.stderr[-1600:]))
        return result
    dom=run(["--dump-dom",HOST+"/qa-probe.html"]).stdout
    found=re.search(r"TA_QA_(PASS|FAIL)[^<]*",dom)
    if not found or found.group(1)!="PASS":
        raise RuntimeError("DOM/fullscreen smoke failed: "+(found.group(0) if found else dom[-500:]))
    print("✓ Browser: "+found.group(0))
    screenshot=QA/"daily-routines-lesson.png"
    run(["--window-size=1440,900","--screenshot="+str(screenshot),HOST+"/lessons/daily-routines/index.html"])
    if screenshot.stat().st_size<20000:raise RuntimeError("Screenshot unexpectedly small")
    pdf=QA/"daily-routines-print.pdf"
    printed=run(["--print-to-pdf="+str(pdf),"--no-pdf-header-footer",HOST+"/lessons/daily-routines/index.html"])
    print("PDF diagnostic:",printed.stderr[-600:].replace("\\n"," | "),"exists=",pdf.exists(),"size=",pdf.stat().st_size if pdf.exists() else 0)
    if not pdf.exists() or pdf.stat().st_size<10000:raise RuntimeError("PDF missing/too small")
    pdfinfo=shutil.which("pdfinfo")
    if pdfinfo:
        info=subprocess.run([pdfinfo,str(pdf)],capture_output=True,text=True,check=True).stdout
        match=re.search(r"^Pages:\s+(\d+)",info,re.MULTILINE)
        if not match:raise RuntimeError("Cannot read PDF page count")
        count=int(match.group(1))
        if count!=14:raise RuntimeError("PDF must have 14 pages, got "+str(count))
        print("✓ PDF: 14 printable pages")
    print("✓ Screenshot and PDF artifacts saved under dist/qa/")
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
    (DIST/"qa-probe.html").unlink(missing_ok=True)
