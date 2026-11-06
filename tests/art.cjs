const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const maps=JSON.parse(fs.readFileSync(path.join(root,'src/maps.json')));
const art=JSON.parse(fs.readFileSync(path.join(root,'src/art.json')));
const html=fs.readFileSync(path.join(root,'dist/Little-Town.html'),'utf8');
let count=0;
for(const [key,map]of Object.entries(maps)){
 const layer=art.maps[key];
 assert.deepEqual(layer.places.map(p=>p.id).sort(),map.places.map(p=>p.id).sort(),key+' art must cover every stable place ID exactly once');
 for(const p of layer.places){
  assert.equal(p.rect.length,4);
  assert(p.rect.every(Number.isFinite));
  const [x,y,w,h]=p.rect;
  assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=map.w&&y+h<=map.h,p.id+' invalid art bounds');
  const bytes=fs.readFileSync(path.join(root,p.file));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert(html.includes('data:image/webp;base64,'+bytes.toString('base64')),p.id+' must be embedded for offline play');
  count++;
 }
}
assert(!html.includes('/* ART DATA */'),'builder must inject the art manifest');
assert(html.includes('id="placeart"'),'independent art layer must exist');
console.log('PASS:',count,'replaceable place assets, complete ID coverage, valid placement bounds and offline embedding');
