#!/usr/bin/env python3
"""Import one ORIGINAL, teacher-reviewed photo contact sheet into an exact-word lesson pack.

Usage:
  python3 -m pip install pillow
  python3 scripts/import-photo-sheet.py --lesson hello-english --image /path/to/hello-english.png --grid 4x3 --approved

The image must contain vocabulary scenes in row-major order with NO labels or framing.
Review all 12 resulting pictures before committing. This tool does not call AI APIs.
"""
import argparse, json, pathlib, re, sys, hashlib
from PIL import Image, ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
def slug(s):
    out=re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
    return out or 'item'
def main():
    p=argparse.ArgumentParser()
    p.add_argument('--lesson',required=True,help='Lesson slug, e.g. hello-english')
    p.add_argument('--image',required=True,type=pathlib.Path)
    p.add_argument('--grid',default='4x3',help='Columns x rows, e.g. 4x3 for 12 words')
    p.add_argument('--approved',action='store_true',help='Required: operator has visually inspected the contact sheet. Teacher classroom review remains necessary.')
    p.add_argument('--teacher-approved',action='store_true',help='Optional: a teacher has separately approved every photo-word pairing')
    p.add_argument('--output',type=pathlib.Path,default=None,help='Optional output directory')
    args=p.parse_args()
    if not args.approved:p.error('Teacher review required: inspect contact sheet, then add --approved.')
    try:cols,rows=(int(v) for v in args.grid.lower().split('x'))
    except ValueError:p.error('--grid must be CxR, for example 4x3')
    if not 1<=cols<=8 or not 1<=rows<=8:p.error('Grid must be 1–8 columns and rows')
    raw=(ROOT/'data.js').read_text(encoding='utf-8')
    prefix='window.LESSONS = '
    if prefix not in raw:raise SystemExit('Cannot locate window.LESSONS in data.js')
    lessons=json.loads(raw.split(prefix,1)[1].strip().rstrip(';'))
    lesson=next((x for x in lessons if x['id']==args.lesson),None)
    if not lesson:raise SystemExit('Lesson not found in data.js: '+args.lesson)
    word_count=len(lesson['words'])
    if cols*rows!=word_count:raise SystemExit(f'Grid {cols}x{rows} has {cols*rows} cells, but lesson has {word_count} words.')
    source=ImageOps.exif_transpose(Image.open(args.image).convert('RGB'))
    w,h=source.size
    if w//cols<220 or h//rows<220:raise SystemExit(f'Resolution too low ({w}x{h}); require >=220 px per cell. Refusing low-quality thumbnails.')
    out=(args.output or (ROOT/'assets'/'photos'/args.lesson)).resolve()
    out.mkdir(parents=True,exist_ok=True)
    names=[]
    for i,word in enumerate(lesson['words']):
        x,y=i%cols,i//cols
        left=round(x*w/cols)+2;top=round(y*h/rows)+2
        right=round((x+1)*w/cols)-2;bottom=round((y+1)*h/rows)-2
        pic=source.crop((left,top,right,bottom))
        name=slug(word['en'])
        if name in names:name=f'{name}-{i+1}'
        names.append(name)
        target=out/(name+'.webp')
        pic.save(target,'WEBP',quality=87,method=6)
        print(f"{i+1:02d}/{word_count}: {word['en']} -> {target.relative_to(ROOT) if target.is_relative_to(ROOT) else target}, {pic.width}x{pic.height}")
    lesson['photoPack']=names
    (ROOT/'data.js').write_text("/* Original Teaching Assets curriculum. Edit lesson records here. */\nwindow.LESSONS = "+json.dumps(lessons,ensure_ascii=False,indent=2)+";\n",encoding='utf-8')
    checksum=hashlib.sha256(args.image.read_bytes()).hexdigest()
    manifest={"lesson_id":args.lesson,"source":args.image.name,"source_sha256":checksum,"grid":[cols,rows],"status":("teacher-approved" if args.teacher_approved else "curated-draft-needs-teacher-review"),"items":[{"word":w['en'],"file":n+'.webp'} for w,n in zip(lesson['words'],names)]}
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f"✓ {len(names)} exact vocabulary photos; updated {ROOT/'data.js'}")
    print("Review output photos again before committing or publishing.")
if __name__=='__main__':main()
