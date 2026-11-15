#!/usr/bin/env python3
"""Create editable, photo-rich PPTX decks and print-ready A4 worksheets.
Builds every exact-word photoPack found in data.js. No external media or APIs.
Usage: python scripts/build-photo-packs.py [--lesson picture-me] [--out assets/packs]
"""
import argparse
import io
import json
import math
import re
import sys
from pathlib import Path
from PIL import Image, ImageOps
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parents[1]
C_BG=(248,250,247)
C_INK=(35,57,43)
C_MUTED=(96,122,105)
C_GREEN=(55,115,78)
C_PALE=(231,242,232)
C_LINE=(220,231,221)
PAGE_W,PAGE_H=landscape(A4)
def load_lessons():
    raw=(ROOT/"data.js").read_text(encoding="utf-8")
    return json.loads(raw.split("window.LESSONS = ",1)[1].strip().rstrip(";"))
def rgb(v):return RGBColor(*v)
def background(slide,color=C_BG):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb=rgb(color)
def rect(slide,x,y,w,h,color,radius=False):
    kind=MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shape=slide.shapes.add_shape(kind,Inches(x),Inches(y),Inches(w),Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb=rgb(color)
    shape.line.fill.background()
    return shape
def txt(slide,text,x,y,w,h,size=18,bold=False,color=C_INK,align=PP_ALIGN.LEFT):
    box=slide.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h))
    tf=box.text_frame;tf.clear();tf.word_wrap=True
    tf.margin_left=Inches(.01);tf.margin_right=Inches(.01)
    tf.margin_top=Inches(.005);tf.margin_bottom=Inches(.005)
    para=tf.paragraphs[0];para.alignment=align
    run=para.add_run();run.text=str(text)
    run.font.name="Aptos"
    run.font.size=Pt(size);run.font.bold=bold;run.font.color.rgb=rgb(color)
    return box
def photo_jpeg(path,max_dim=1800):
    im=Image.open(path).convert("RGB")
    if max(im.size)>max_dim:im.thumbnail((max_dim,max_dim),Image.Resampling.LANCZOS)
    buf=io.BytesIO();im.save(buf,"JPEG",quality=83,optimize=True,progressive=True)
    buf.seek(0);return buf,im.size
def cover_image(slide,path,x,y,w,h):
    data,(iw,ih)=photo_jpeg(path)
    pic=slide.shapes.add_picture(data,Inches(x),Inches(y),width=Inches(w),height=Inches(h))
    # python-pptx default resizes uniformly to box and applies crops when ratio differs.
    source=iw/ih;target=w/h
    if source>target:
        crop=(1-target/source)/2;pic.crop_left=crop;pic.crop_right=crop
    elif source<target:
        crop=(1-source/target)/2;pic.crop_top=crop;pic.crop_bottom=crop
    return pic
def use(slide,course,index,total):
    txt(slide,"teaching assets",.53,7.16,4,.24,10,True,C_GREEN)
    txt(slide,f"{course['level']}  ·  {index} / {total}",10.8,7.16,2,.24,10,False,C_MUTED,PP_ALIGN.RIGHT)
def title_slide(prs,l,photos):
    s=prs.slides.add_slide(prs.slide_layouts[6]);background(s)
    cover_image(s,photos[0],6.0,0,7.33,7.5)
    rect(s,0,0,6.25,7.5,C_BG)
    txt(s,"PHOTO-BASED ENGLISH LESSON",.7,.87,5.0,.3,13,True,C_GREEN)
    title=l["title"]
    txt(s,title,.66,1.8,5.0,2.3,43 if len(title)<26 else 36,True,C_INK)
    txt(s,l["outcome"],.7,4.23,4.95,1.12,19,False,C_MUTED)
    rect(s,.69,5.95,2.92,.65,C_PALE,True)
    txt(s,f"{l['level']}  ·  {l['duration']} minutes  ·  {len(photos)} images",.93,6.13,2.7,.3,12,True,C_GREEN)
def word_slide(prs,l,p,i,n):
    w=l["words"][i]
    s=prs.slides.add_slide(prs.slide_layouts[6]);background(s)
    cover_image(s,p,0,0,7.2,7.05)
    rect(s,7.35,.65,5.4,.37,C_PALE,True)
    txt(s,f"PICTURE WORD {i+1:02d}  /  {n}",7.65,.75,4.7,.25,12,True,C_GREEN)
    word=w["en"].strip()
    txt(s,word,7.5,1.47,5.18,1.5,40 if len(word)<18 else 31,True,C_INK)
    txt(s,"LOOK · SAY · ASK",7.52,3.05,4.5,.4,13,True,C_GREEN)
    txt(s,w["example"],7.52,3.58,5.08,1.25,21 if len(w["example"])<64 else 18,False,C_INK)
    rect(s,7.48,5.17,5.13,1.35,C_PALE,True)
    txt(s,"SPEAKING PROMPT",7.78,5.39,4.6,.29,11,True,C_GREEN)
    txt(s,"Describe the scene. Make a new sentence.",7.76,5.79,4.45,.65,17,False,C_INK)
    use(s,l,i+2,n+3)
def full_bleed(prs,l,p,i,total):
    s=prs.slides.add_slide(prs.slide_layouts[6])
    cover_image(s,p,0,0,13.333,7.5)
    rect(s,.45,6.13,6.8,.89,C_BG,True)
    txt(s,f"PHOTO ONLY  ·  Describe what you see  ·  {i+1}/{len(l['words'])}",.73,6.39,6.2,.33,17,True,C_INK)
def talk_slide(prs,l,photos):
    s=prs.slides.add_slide(prs.slide_layouts[6]);background(s)
    txt(s,"PHOTO TALK",.65,.42,5,.3,13,True,C_GREEN)
    txt(s,"Let's make a story.",.65,.98,10.5,.8,38,True,C_INK)
    for i,p in enumerate(photos[:3]):
        x=.64+i*4.27
        cover_image(s,p,x,2.05,4.04,3.05)
        txt(s,f"SCENE {i+1:02d}",x,5.23,4.0,.3,12,True,C_GREEN)
    txt(s,"Choose three pictures. Tell a story using First / Then / Finally.",.66,6.13,11.9,.65,21,False,C_INK)
    use(s,l,len(l["words"])+3,len(l["words"])+3)
def finish_slide(prs,l):
    s=prs.slides.add_slide(prs.slide_layouts[6]);background(s)
    txt(s,"YOUR EXIT TICKET",.76,.75,9,.4,14,True,C_GREEN)
    txt(s,"Your next conversation\nstarts here.",.73,1.64,11.9,1.55,44,True,C_INK)
    for i,t in enumerate(["Name five things from today's photos.","Ask your partner one follow-up question.","Create a three-photo story in English."]):
        y=3.85+i*.72
        rect(s,.78,y,11.7,.59,C_PALE,True)
        txt(s,f"{i+1:02d}   {t}",1.05,y+.16,11.1,.28,17,False,C_INK)
def make_pptx(l,photos,out):
    prs=Presentation()
    prs.slide_width=Inches(13.333)
    prs.slide_height=Inches(7.5)
    title_slide(prs,l,photos)
    for i,p in enumerate(photos):
        word_slide(prs,l,p,i,len(photos))
        if i in (3,7,11):full_bleed(prs,l,p,i,len(photos)+6)
    talk_slide(prs,l,photos)
    finish_slide(prs,l)
    prs.save(out)
    return len(prs.slides)
def worksheet(l,photos,out):
    c=canvas.Canvas(str(out),pagesize=(PAGE_W,PAGE_H),pageCompression=1)
    c.setTitle(f"{l['title']} - photo worksheet")
    def fill(color):c.setFillColor(HexColor(color))
    def line(x1,y1,x2,y2):c.setStrokeColor(HexColor("#C7D8CC"));c.setLineWidth(.65);c.line(x1,y1,x2,y2)
    def header(sub):
        fill("#FAFBF7");c.rect(0,0,PAGE_W,PAGE_H,fill=1,stroke=0)
        fill("#34724D");c.setFont("Helvetica-Bold",10);c.drawString(38,PAGE_H-36,"TEACHING ASSETS  /  "+l["level"])
        fill("#243F30");c.setFont("Helvetica-Bold",24);c.drawString(38,PAGE_H-72,l["title"][:48])
        fill("#658371");c.setFont("Helvetica",11);c.drawString(38,PAGE_H-91,sub)
        line(38,PAGE_H-105,PAGE_W-38,PAGE_H-105)
    def footer(page):
        line(38,29,PAGE_W-38,29)
        fill("#688B74");c.setFont("Helvetica",9);c.drawString(38,17,"Student worksheet  ·  Original teaching photographs")
        c.drawRightString(PAGE_W-38,17,f"Page {page} / 2")
    header("01  Look at each photo. Say the English word, then write it.")
    top=PAGE_H-123
    tileW=(PAGE_W-76-3*12)/4
    tileH=(top-47-2*11)/3
    for i,p in enumerate(photos):
        col,row=i%4,i//4
        x=38+col*(tileW+12)
        y=top-(row+1)*tileH-row*11
        fill("#FFFFFF");c.roundRect(x,y,tileW,tileH,7,stroke=0,fill=1)
        picH=tileH-25
        im=Image.open(p).convert("RGB")
        im=ImageOps.fit(im,(420,round(420*picH/(tileW-12))),method=Image.Resampling.LANCZOS)
        c.drawImage(ImageReader(im),x+6,y+19,width=tileW-12,height=picH,mask='auto')
        fill("#375C43");c.setFont("Helvetica-Bold",9);c.drawString(x+7,y+5,f"{i+1:02d}")
        line(x+32,y+10,x+tileW-8,y+10)
    footer(1);c.showPage()
    header("02  Speak, compare and create your own story.")
    fill("#3F7854");c.setFont("Helvetica-Bold",13);c.drawString(40,PAGE_H-136,"WORD BANK  ·  Choose any 8 words from the photos")
    bank="   ·   ".join(w["en"] for w in l["words"])
    parts=[bank[i:i+105] for i in range(0,len(bank),105)]
    c.setFont("Helvetica",11);fill("#3E614C")
    for i,text in enumerate(parts[:3]):c.drawString(42,PAGE_H-159-i*17,text)
    y=PAGE_H-223
    prompts=["Which three photos do you like the most? Why?",
             "Tell a story using three photos: First ... Then ... Finally ...",
             "Choose two photos. What is similar or different?",
             "Ask your partner two questions about the photos."]
    for i,prompt in enumerate(prompts):
        fill("#E8F3E9");c.roundRect(39,y-35,760,52,7,stroke=0,fill=1)
        fill("#31694B");c.setFont("Helvetica-Bold",11);c.drawString(53,y,prompt)
        line(53,y-18,784,y-18)
        y-=81
    fill("#456F53");c.setFont("Helvetica-Bold",13);c.drawString(42,y-1,"HOMEWORK  ·  Pick four photos and write one English sentence per photo.")
    for j in range(2):line(40,y-34-j*24,800,y-34-j*24)
    footer(2);c.save()
def main():
    a=argparse.ArgumentParser()
    a.add_argument("--lesson")
    a.add_argument("--out",type=Path,default=ROOT/"assets"/"packs")
    args=a.parse_args()
    lessons=load_lessons()
    chosen=[l for l in lessons if isinstance(l.get("photoPack"),list) and len(l["photoPack"])==len(l["words"])]
    if args.lesson:chosen=[l for l in chosen if l["id"]==args.lesson]
    if not chosen:raise SystemExit("No exact-word photo packs found")
    for l in chosen:
        photos=[ROOT/"assets"/"photos"/l["id"]/(name+".webp") for name in l["photoPack"]]
        absent=[p for p in photos if not p.exists()]
        if absent:raise FileNotFoundError(f"{l['id']}: {absent}")
        dest=args.out/l["id"];dest.mkdir(parents=True,exist_ok=True)
        ppt=dest/(l["id"]+"-photo-lesson.pptx")
        pdf=dest/(l["id"]+"-worksheet.pdf")
        n=make_pptx(l,photos,ppt)
        worksheet(l,photos,pdf)
        print(f"✓ {l['id']}: {n} editable PPTX slides and 2-page A4 worksheet ({ppt.stat().st_size} + {pdf.stat().st_size} bytes)")
if __name__=="__main__":main()
