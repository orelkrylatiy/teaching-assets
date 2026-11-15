#!/usr/bin/env python3
"""Validate all ready-made photo PPTX and PDF resource packs."""
import json
import re
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
DATA=(ROOT/"data.js").read_text(encoding="utf-8")
LESSONS=json.loads(DATA.split("window.LESSONS = ",1)[1].strip().rstrip(";"))
packs=[l for l in LESSONS if isinstance(l.get("photoPack"),list) and len(l["photoPack"])==len(l["words"])]
assert len(packs)>=3,"Expected at least 3 photo-complete English lesson packs"
for lesson in packs:
    slug=lesson["id"];folder=ROOT/"assets"/"packs"/slug
    ppt=folder/(slug+"-photo-lesson.pptx")
    pdf=folder/(slug+"-worksheet.pdf")
    assert ppt.exists() and ppt.stat().st_size>100000,f"Missing/broken PPTX: {ppt}"
    assert pdf.exists() and pdf.stat().st_size>30000,f"Missing/broken PDF: {pdf}"
    with ZipFile(ppt) as z:
        assert z.testzip() is None,f"Damaged PowerPoint ZIP: {slug}"
        names=z.namelist()
        slides=[n for n in names if re.fullmatch(r"ppt/slides/slide\d+\.xml",n)]
        media=[n for n in names if n.startswith("ppt/media/")]
        assert len(slides)>=len(lesson["words"])+4,(slug,len(slides))
        assert len(media)>=len(lesson["words"]),(slug,len(media))
        for name in names:
            if name.endswith((".xml",".rels")):ET.fromstring(z.read(name))
    pages=PdfReader(str(pdf)).pages
    assert len(pages)==2,(slug,len(pages))
    assert "Look at each photo" in (pages[0].extract_text() or ""),slug
    print(f"✓ {slug}: {len(slides)} editable PPTX slides, {len(media)} embedded images, {len(pages)} PDF pages")
