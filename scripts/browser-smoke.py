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
   const photoVisible=getComputedStyle(pic).zIndex!=='auto'&&Number(getComputedStyle(pic).zIndex)>=2;
   const rootOutsideApp=d.querySelector('#print-root')?.parentElement===d.body;
   const sceneCount=d.querySelectorAll('.ta-scene').length;
   d.body.classList.remove('presenter');
   d.querySelector('.tabs [data-tab="studio"]')?.click();
   d.querySelector('[data-ta="open-deck"]')?.click();
   const deck=d.querySelector('#ta-photo-deck');
   const deckVisible=!!deck&&!deck.hidden&&!!d.querySelector('.ta-live-cover');
   const deckFrame=d.querySelector('.ta-deck-slide')?.getBoundingClientRect();
   const deckRatio=deckFrame&&deckFrame.height>0?deckFrame.width/deckFrame.height:0;
   const ok=fit&&fullscreen&&pictureLoaded&&photoVisible&&rootOutsideApp&&sceneCount>=5&&deckVisible&&deckRatio>1.72&&deckRatio<1.83&&printCount===14&&normalRatio>1.7&&normalRatio<1.9;
   output.textContent=(ok?'TA_QA_PASS':'TA_QA_FAIL')+' '+JSON.stringify({fit,fullscreen,pictureLoaded,photoVisible,rootOutsideApp,sceneCount,deckVisible,deckRatio,printCount,normalRatio});
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
    else:
        count=len(re.findall(rb"/Type\s*/Page\b",pdf.read_bytes()))
    if count!=14:raise RuntimeError("PDF must have 14 pages, got "+str(count))
    print("✓ PDF: 14 printable pages")
    print("✓ Screenshot and PDF artifacts saved under dist/qa/")
    # Integration smoke: standalone Photo Library has working static cards, select/deck actions
    LIB_PROBE = """<!doctype html><meta charset="utf-8"><title>Visual Gallery QA</title>
<iframe id="f" src="/visual-library/index.html" style="width:1300px;height:760px;border:0"></iframe><pre id="result">LOADING</pre>
<script>
const frame=document.getElementById('f');
let tries=0;
function test(){
 const d=frame.contentDocument;
 if(!d?.querySelector('#vl-grid') || d.querySelectorAll('.vl-card').length<30){
   if(++tries<40){setTimeout(test,200);return;}
   document.getElementById('result').textContent='VL_QA_FAIL not_ready '+(d?.querySelectorAll('.vl-card').length||0);return;
 }
 const before=d.querySelectorAll('.vl-card').length;
 const loaded=[...d.querySelectorAll('.vl-card-image img')].filter(img=>img.complete&&img.naturalWidth>0).length;
 d.querySelectorAll('[data-select]')[0]?.click();
 d.querySelectorAll('[data-select]')[1]?.click();
 const count=d.getElementById('vl-count').textContent;
 d.querySelector('[data-action="present"]')?.click();
 const presenter=d.getElementById('vl-presenter');
 const deck=presenter?.querySelector('.vl-presenter-slide');
 const rect=deck?.getBoundingClientRect();
 const ratio=rect&&rect.height>0?rect.width/rect.height:0;
 const good=before>=46&&loaded>=40&&count==='2'&&presenter&&!presenter.hidden&&ratio>1.72&&ratio<1.83;
 document.getElementById('result').textContent=(good?'VL_QA_PASS':'VL_QA_FAIL')+' '+JSON.stringify({before,loaded,count,ratio,open:!presenter?.hidden});
}
setTimeout(test,1150);
</script>"""
    (DIST / "gallery-probe.html").write_text(LIB_PROBE,encoding="utf-8")
    gallery_dom=run(["--dump-dom",HOST+"/gallery-probe.html"]).stdout
    gallery_status=re.search(r"VL_QA_(PASS|FAIL)[^<]*",gallery_dom)
    if not gallery_status or gallery_status.group(1)!="PASS":
        raise RuntimeError("Visual Gallery QA failed: "+(gallery_status.group(0) if gallery_status else gallery_dom[-700:]))
    print("✓ Photo Library browser: "+gallery_status.group(0))
    lib_screenshot=QA/"photo-library.png"
    run(["--window-size=1440,1000","--screenshot="+str(lib_screenshot),HOST+"/visual-library/index.html"])
    if lib_screenshot.stat().st_size<15000:raise RuntimeError("Photo library screenshot unexpectedly small")
    (DIST/"gallery-probe.html").unlink(missing_ok=True)
    # Ensure the newly imported A0 photographs really appear inside flashcards.
    hello_probe = """<!doctype html><meta charset="utf-8"><title>Hello A0 Photo QA</title>
    <iframe id="f" src="/lessons/hello-english/index.html" style="width:1270px;height:760px"></iframe><pre id="result">LOADING</pre>
    <script>
    const frame=document.getElementById('f');let attempts=0;
    function check(){
      const d=frame.contentDocument;
      if(!d?.querySelector('.tabs [data-tab="cards"]')||!d?.querySelector('.ta-flash-photo')){
        if(++attempts<40){setTimeout(check,250);return;}
        document.querySelector('#result').textContent='HELLO_QA_FAIL not_ready';return;
      }
      d.querySelector('.tabs [data-tab="cards"]').click();
      setTimeout(()=>{
        const photo=d.querySelector('#flash-card .ta-flash-photo');
        const sceneCount=d.querySelectorAll('.ta-scene').length;
        const ok=photo?.naturalWidth>=300&&photo?.src.includes('/hello-english/hello.webp')&&sceneCount===12;
        document.querySelector('#result').textContent=(ok?'HELLO_QA_PASS':'HELLO_QA_FAIL')+
          ' '+JSON.stringify({photoWidth:photo?.naturalWidth,url:photo?.src,sceneCount});
      },550);
    }
    setTimeout(check,1000);
    </script>"""
    (DIST/"hello-probe.html").write_text(hello_probe,encoding="utf-8")
    hello_dom=run(["--dump-dom",HOST+"/hello-probe.html"]).stdout
    hello_result=re.search(r"HELLO_QA_(PASS|FAIL)[^<]*",hello_dom)
    if not hello_result or hello_result.group(1)!="PASS":
        raise RuntimeError("A0 photo flashcards not integrated: "+(hello_result.group(0) if hello_result else hello_dom[-750:]))
    print("✓ A0 Hello English exact-photo flashcards: "+hello_result.group(0))
    (DIST/"hello-probe.html").unlink(missing_ok=True)
    # Verify My World in Pictures has a complete exact-word photo pack,
    # a functional 4-picture exercise, and downloadable photo teaching materials.
    picture_probe = """<!doctype html><meta charset="utf-8"><title>Picture A0 Photo QA</title>
    <iframe id="f" src="/lessons/picture-me/index.html" style="width:1300px;height:760px"></iframe>
    <pre id="result">LOADING</pre>
    <script>
    const frame=document.getElementById('f');let attempts=0;
    function verify(){
      const d=frame.contentDocument;
      if(!d?.querySelector('.ta-photo-check') || !d?.querySelector('#flash-card .ta-flash-photo')){
        if(++attempts<40){setTimeout(verify,250);return;}
        document.querySelector('#result').textContent='PICTURE_QA_FAIL not_ready';
        return;
      }
      d.querySelector('.tabs [data-tab="cards"]').click();
      setTimeout(()=>{
        const firstPhoto=d.querySelector('#flash-card .ta-flash-photo');
        const photoLoaded=firstPhoto?.complete&&firstPhoto.naturalWidth>=220;
        d.querySelector('.tabs [data-tab="studio"]').click();
        const options=d.querySelectorAll('[data-ta="photo-quiz-guess"]');
        const correct=d.querySelector('[data-ta="photo-quiz-guess"][data-i="0"]');
        const links=[...d.querySelectorAll('a[download]')].map(x=>x.getAttribute('href'));
        const pptxLink=links.some(x=>x.endsWith('/picture-me-photo-lesson.pptx'));
        const pdfLink=links.some(x=>x.endsWith('/picture-me-worksheet.pdf'));
        correct?.click();
        const feedback=d.querySelector('#ta-photo-quiz-feedback')?.textContent||'';
        const next=d.querySelector('[data-ta="photo-quiz-next"]');
        const accepted=feedback.includes('Correct')&&!next?.disabled;
        next?.click();
        const progress=d.querySelector('#ta-photo-quiz-progress')?.textContent||'';
        const advanced=progress.startsWith('2 / 12');
        const scenes=d.querySelectorAll('.ta-scene').length;
        const ok=photoLoaded&&pptxLink&&pdfLink&&options.length===4&&accepted&&advanced&&scenes===12;
        document.querySelector('#result').textContent=(ok?'PICTURE_QA_PASS':'PICTURE_QA_FAIL')+
          ' '+JSON.stringify({photoWidth:firstPhoto?.naturalWidth,pptxLink,pdfLink,optionCount:options.length,accepted,advanced,scenes});
      },650);
    }
    setTimeout(verify,850);
    </script>"""
    (DIST/"picture-probe.html").write_text(picture_probe,encoding="utf-8")
    picture_dom=run(["--dump-dom",HOST+"/picture-probe.html"]).stdout
    picture_result=re.search(r"PICTURE_QA_(PASS|FAIL)[^<]*",picture_dom)
    if not picture_result or picture_result.group(1)!="PASS":
        raise RuntimeError("A0 picture lesson test failed: "+(picture_result.group(0) if picture_result else picture_dom[-800:]))
    print("✓ Photo cards, interactive picture identification, PPTX/PDF links: "+picture_result.group(0))
    (DIST/"picture-probe.html").unlink(missing_ok=True)
    # Catalogue navigation should surface only the three picture-complete lessons
    # when the teacher applies the new real-photo filter.
    catalog_probe = """<!doctype html><meta charset="utf-8"><title>Catalogue QA</title>
    <iframe id="f" style="border:0;width:1280px;height:740px" src="/index.html"></iframe><pre id="result">LOADING</pre>
    <script>
    const frame=document.getElementById('f');let tries=0;
    function test(){
      const d=frame.contentDocument;
      if(!d?.querySelector('#photos-only')||d.querySelectorAll('.photo-pack').length<3){
        if(++tries<35){setTimeout(test,250);return;}
        document.querySelector('#result').textContent='CATALOG_QA_FAIL not_ready';return;
      }
      const featured=d.querySelectorAll('.photo-pack').length;
      d.getElementById('photos-only').click();
      const count=d.querySelectorAll('.lesson-card').length;
      const selected=d.getElementById('photos-only').getAttribute('aria-pressed');
      const visibleTitles=[...d.querySelectorAll('.lesson-card h3')].map(el=>el.textContent);
      const correct=['Hello, English!','My World in Pictures','A Day in My Life'];
      const ok=featured===3&&count===3&&selected==='true'&&correct.every(t=>visibleTitles.includes(t));
      document.querySelector('#result').textContent=(ok?'CATALOG_QA_PASS':'CATALOG_QA_FAIL')+
       ' '+JSON.stringify({featured,count,selected,visibleTitles});
    }
    setTimeout(test,1000);
    </script>"""
    (DIST/"catalog-probe.html").write_text(catalog_probe,encoding="utf-8")
    catalog_dom=run(["--dump-dom",HOST+"/catalog-probe.html"]).stdout
    catalog_found=re.search(r"CATALOG_QA_(PASS|FAIL)[^<]*",catalog_dom)
    if not catalog_found or catalog_found.group(1)!="PASS":
        raise RuntimeError("Photo catalogue filter failed: "+(catalog_found.group(0) if catalog_found else catalog_dom[-700:]))
    print("✓ Homepage photo pack showcase and filter: "+catalog_found.group(0))
    (DIST/"catalog-probe.html").unlink(missing_ok=True)

    # Print the new photo-word pack as a 14-page PDF. This catches missing image URLs.
    picture_pdf=QA/"picture-me-print.pdf"
    run(["--print-to-pdf="+str(picture_pdf),"--no-pdf-header-footer",HOST+"/lessons/picture-me/index.html"])
    if not picture_pdf.exists() or picture_pdf.stat().st_size<10000:
        raise RuntimeError("My World in Pictures PDF missing or blank")
    if pdfinfo:
        info=subprocess.run([pdfinfo,str(picture_pdf)],capture_output=True,text=True,check=True).stdout
        match=re.search(r"^Pages:\s+(\d+)",info,re.MULTILINE)
        assert match and int(match.group(1))==14, "My World in Pictures should print to 14 pages"
    print("✓ My World in Pictures PDF: 14 printable photo slides")
    # Print the selected photo deck as a real two-page A4 PDF, not a blank shell.
    print_html = """<!doctype html><html><head><meta charset="utf-8">
    <link rel="stylesheet" href="/visual-library.css">
    <script src="/data.js"></script><script src="/visual-library.js"></script>
    <script>document.addEventListener('DOMContentLoaded',()=>{
      document.querySelectorAll('[data-select]')[0]?.click();
      document.querySelectorAll('[data-select]')[1]?.click();
      document.getElementById('vl-selection')?.classList.add('vl-collapsed');
    });</script>
    </head><body><div id="app"></div></body></html>"""
    (DIST/"gallery-print-probe.html").write_text(print_html,encoding="utf-8")
    gallery_pdf=QA/"photo-library-selection.pdf"
    run(["--print-to-pdf="+str(gallery_pdf),"--no-pdf-header-footer",HOST+"/gallery-print-probe.html"])
    if not gallery_pdf.exists() or gallery_pdf.stat().st_size<10000:
        raise RuntimeError("Photo Library PDF missing/too small")
    if pdfinfo:
        report=subprocess.run([pdfinfo,str(gallery_pdf)],capture_output=True,text=True,check=True).stdout
        page_match=re.search(r"^Pages:\s+(\d+)",report,re.MULTILINE)
        if not page_match or int(page_match.group(1))!=2:
            raise RuntimeError("Photo Library PDF must have exactly 2 pages: "+str(page_match.group(0) if page_match else 'missing'))
    print("✓ Photo Library print: two real landscape A4 pages")
    (DIST/"gallery-print-probe.html").unlink(missing_ok=True)

finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
    (DIST/"qa-probe.html").unlink(missing_ok=True)
