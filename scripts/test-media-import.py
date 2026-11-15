#!/usr/bin/env python3
"""Test the exact-word photo-sheet importer without modifying the working tree."""
import tempfile, pathlib, shutil, subprocess, json, sys
from PIL import Image, ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as tmp:
    dest=pathlib.Path(tmp)
    (dest/'scripts').mkdir()
    shutil.copy2(ROOT/'scripts/import-photo-sheet.py',dest/'scripts/import-photo-sheet.py')
    shutil.copy2(ROOT/'data.js',dest/'data.js')
    source=dest/'sample.png'
    img=Image.new('RGB',(960,900),'#f8f4e9')
    d=ImageDraw.Draw(img)
    for i in range(12):
        col,row=i%4,i//4
        d.rectangle((col*240,row*300,(col+1)*240-1,(row+1)*300-1),fill=(95+10*row,120+9*col,145+5*(i%5)))
    img.save(source)
    argv=[sys.executable,str(dest/'scripts/import-photo-sheet.py'),'--lesson','hello-english','--image',str(source),'--grid','4x3','--approved']
    subprocess.run(argv,check=True,capture_output=True,text=True)
    pack=dest/'assets/photos/hello-english'
    photos=list(pack.glob('*.webp'))
    assert len(photos)==12,photos
    for p in photos:
        with Image.open(p) as pic:
            assert pic.width>=230 and pic.height>=290,p.name
    manifest=json.loads((pack/'manifest.json').read_text())
    assert len(manifest['items'])==12
    contents=(dest/'data.js').read_text()
    assert '"photoPack"' in contents
    print("✓ 4×3 high-resolution word photo import → 12 real WebP assets + metadata")
    # Fail closed for a thumbnail-sized sheet and without teacher review.
    small=dest/'tiny.png';Image.new('RGB',(200,200),'white').save(small)
    for params in [
        [sys.executable,str(dest/'scripts/import-photo-sheet.py'),'--lesson','hello-english','--image',str(small),'--grid','4x3','--approved'],
        [sys.executable,str(dest/'scripts/import-photo-sheet.py'),'--lesson','hello-english','--image',str(source),'--grid','4x3']
    ]:
        test=subprocess.run(params,capture_output=True,text=True)
        assert test.returncode!=0,'Low-quality or unreviewed import must be rejected'
    print("✓ Reject insufficient resolution and unreviewed imports")
