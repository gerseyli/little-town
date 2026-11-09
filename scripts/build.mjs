import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=p=>readFile(path.join(root,p),'utf8');
const assets={};
for(const name of ['town','suburbs','shelter','buttonSkin','dialogSkin','bookIcon']){
 const bytes=await readFile(path.join(root,'assets',name+'.webp'));
 assets[name]='data:image/webp;base64,'+bytes.toString('base64');
}
for(const [key,file] of [['walletIcon','wallet'],['moneyPanel','money-panel']]){
 const bytes=await readFile(path.join(root,'assets/ui',file+'.png'));
 assets[key]='data:image/png;base64,'+bytes.toString('base64');
}
for(const name of ['car','truck','bus','taxi','ambulance','police']){
 const bytes=await readFile(path.join(root,'assets/vehicles',name+'.webp'));
 assets['vehicle-'+name]='data:image/webp;base64,'+bytes.toString('base64');
}
for(const name of ['tourist',...Array.from({length:6},(_,i)=>'person-'+i)]){
 const bytes=await readFile(path.join(root,'assets/walking',name+'.webp'));
 assets['walk-'+name]='data:image/webp;base64,'+bytes.toString('base64');
}
// Embed supplied interiors; keep unused character expressions as source assets.
for(const [key,file] of [['pharmacy-background','pharmacy/background'],['chemist-neutral','pharmacy/chemist-neutral'],['bank-background','bank/background']]){
 const bytes=await readFile(path.join(root,'assets/interiors',file+'.png'));
 assets[key]='data:image/png;base64,'+bytes.toString('base64');
}
for(const [key,file] of [['pharmacyConsultation','consultation'],['pharmacyBasket','basket'],['pharmacyAction','action']]){
 const bytes=await readFile(path.join(root,'assets/ui/pharmacy',file+'.webp'));
 assets[key]='data:image/webp;base64,'+bytes.toString('base64');
}
for(const [key,file] of [['bankATM','atm'],['bankSlot','slot'],['bankCash','cash'],['bankComputer','computer']]){
 assets[key]='data:image/webp;base64,'+(await readFile(path.join(root,'assets/ui/bank',file+'.webp'))).toString('base64');
}
for(const id of ['bakers','johnsons','millers','wilsons'])assets['house-'+id]='data:image/webp;base64,'+(await readFile(path.join(root,'assets/interiors/bank/houses',id+'.webp'))).toString('base64');
assets.pharmacySymptoms='data:image/png;base64,'+(await readFile(path.join(root,'assets/interiors/pharmacy/symptoms/atlas.png'))).toString('base64');
// Embed every map, control and actor image for a standalone offline export.
const assetJSON='{'+Object.entries(assets).map(([k,v])=>JSON.stringify(k)+': '+JSON.stringify(v)).join(', ')+'}';
const maps=await read('src/maps.json');
const phrases=await read('src/phrasebook.js');
const styles=(await read('src/styles.css'))+'\n'+(await read('src/pharmacy.css'))+'\n'+(await read('src/bank.css'));
const walkingAnchors=await read('assets/walking/foot-anchors.json');
const pharmacyData=await read('src/pharmacy-data.json'),symptomAtlas=await read('assets/interiors/pharmacy/symptoms/atlas.json');
const money=await read('src/money.js'),interiors=await read('src/interiors.js'),shop=await read('src/shop.js');
const pharmacy=(await read('src/pharmacy.js')).replace('/* PHARMACY DATA */',()=> 'const PHARMACY_DATA='+pharmacyData+';').replace('/* SYMPTOM ATLAS */',()=> 'const SYMPTOM_ATLAS='+symptomAtlas+';');
const banking=await read('src/banking.js'),bank=await read('src/bank.js');
const motion=await read('src/motion.js'),paths=await read('src/paths.js');
const navigation=await read('src/navigation.js'),worldLife=await read('src/world-life.js'),actors=await read('src/actors.js');
const game=(await read('src/game.js'))
 .replace('/* ASSETS */',()=> 'const ASSETS='+assetJSON+';')
 .replace('/* MAP DATA */',()=> 'const MAPS='+maps+';')
 .replace('/* PHRASEBOOK */\n',()=>phrases)
 .replace('/* MONEY */',()=>money)
 .replace('/* BANKING */',()=>banking)
 .replace('/* BANK */',()=>bank)
 .replace('/* INTERIORS */',()=>interiors)
 .replace('/* SHOP */',()=>shop)
 .replace('/* PHARMACY */',()=>pharmacy)
 .replace('/* MOTION */',()=>motion)
 .replace('/* PATHS */',()=>paths)
 .replace('/* NAVIGATION */',()=>navigation)
 .replace('/* ACTORS */',()=> 'const WALK_FOOT_ANCHORS='+walkingAnchors+';\n'+actors)
 .replace('/* WORLD LIFE */',()=>worldLife);
const html=(await read('src/index.html'))
 .replace('/* STYLES */',()=>styles)
 .replace('/* GAME */',()=>game);
await mkdir(path.join(root,'dist'),{recursive:true});
await writeFile(path.join(root,'dist/Little-Town.html'),html);
await writeFile(path.join(root,'dist/index.html'),html);
console.log('Built dist/Little-Town.html — fully offline, all map, control and actor images embedded.');
