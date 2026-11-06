import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=p=>readFile(path.join(root,p),'utf8');
const assets={};
const art=JSON.parse(await read('src/art.json'));
for(const name of ['walker','shelter','buttonSkin','dialogSkin','bookIcon']){
 const bytes=await readFile(path.join(root,'assets',name+'.webp'));
 assets[name]='data:image/webp;base64,'+bytes.toString('base64');
}
for(const [key,map] of Object.entries(art.maps)){
 assets[key]='data:image/webp;base64,'+(await readFile(path.join(root,map.background))).toString('base64');
 for(const place of map.places){
  assets[place.asset]='data:image/webp;base64,'+(await readFile(path.join(root,place.file))).toString('base64');
 }
}
for(const [key,file] of Object.entries(art.shared||{})){
 assets[key]='data:image/webp;base64,'+(await readFile(path.join(root,file))).toString('base64');
}
const assetJSON='{'+Object.entries(assets).map(([k,v])=>JSON.stringify(k)+': '+JSON.stringify(v)).join(', ')+'}';
const maps=await read('src/maps.json');
const phrases=await read('src/phrasebook.js');
const styles=await read('src/styles.css');
const game=(await read('src/game.js'))
 .replace('/* ASSETS */',()=> 'const ASSETS='+assetJSON+';')
 .replace('/* MAP DATA */',()=> 'const MAPS='+maps+';')
 .replace('/* ART DATA */',()=> 'const ART='+JSON.stringify(art)+';')
 .replace('/* PHRASEBOOK */\n',()=>phrases);
const html=(await read('src/index.html'))
 .replace('/* STYLES */',()=>styles)
 .replace('/* GAME */',()=>game);
await mkdir(path.join(root,'dist'),{recursive:true});
await writeFile(path.join(root,'dist/Little-Town.html'),html);
await writeFile(path.join(root,'dist/index.html'),html);
console.log('Built dist/Little-Town.html — fully offline, modular artwork embedded.');
