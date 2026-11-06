"""Measure foot anchors without altering artwork (authoring only; requires Pillow)."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]/'assets/walking'
anchors={}
for path in sorted(root.glob('*.webp')):
 image=Image.open(path).convert('RGBA')
 width,height=image.size
 assert width==height,path
 alpha=image.getchannel('A')
 frames=[]
 for row in range(4):
  for column in range(4):
   left,top=round(column*width/4),round(row*height/4)
   right,bottom=round((column+1)*width/4),round((row+1)*height/4)
   # Ignore nearly transparent edge pixels; do not change the image.
   bounds=alpha.crop((left,top,right,bottom)).point(lambda a:255 if a>=32 else 0).getbbox()
   assert bounds is not None,(path,row,column)
   frames.append(round(((row+1)*height/4-top-bounds[3])/(height/4),6))
 anchors[path.stem]=frames
assert len(anchors)==7
(root/'foot-anchors.json').write_text(json.dumps(anchors,indent=2)+'\n')
