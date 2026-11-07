const fs=require('fs'),vm=require('vm');
const elements=new Map;function el(){return {style:{setProperty(){}},value:'',textContent:'',innerHTML:'',open:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}}};
const ctx={console,Math,Date,performance:{now:()=>7000},setTimeout,clearTimeout,requestAnimationFrame(){},innerWidth:1360,innerHeight:920,localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){}},document:{documentElement:el(),body:el(),getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},querySelectorAll:()=>[],addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/Little-Town.html'),'utf8').split('<script>')[1].split('</script>')[0],ctx);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
let paving=0;
// Native image coordinates, sampled across the painted width (not model centrelines).
for(let px=95;px<=1010;px+=13)for(const py of [753,758,765,772,777]){check(walkable(px*2000/1500,py*1400/1049,true,py*1400/1049,'town'),'Garden Street paving '+px+','+py);paving++}
for(const px of [1221,1228,1235,1242,1249])for(let py=779;py<=813;py+=3){check(walkable(px/.64,py/.64,true,py/.64,'suburbs'),'painted harbor link '+px+','+py);paving++}
for(const [key,px,py]of [['town',1450,500],['town',990,1190],['town',300,930],['suburbs',2015,625],['suburbs',1850,1380],['suburbs',2134.375,1245]])check(!walkable(px,py,true,py,key),'terrain/old false connector stays blocked '+key+' '+px+','+py);
for(const [key,m]of Object.entries(MAPS)){
 const labels=pathLabelData(key),ids=new Set();check(labels.length>=m.paths.length,'all named paths have labels');
 for(const label of labels){const path=m.paths.find(p=>p.id===label.pathId);check(path&&pathDistance(label.x,label.y,path)<1e-6,'secondary label centred on its own path')}
 for(const p of m.paths){check(p.name.trim()&&p.id&&!ids.has(p.id),'stable named unique path '+key);ids.add(p.id);const label=labels.find(l=>l.id===p.id);check(label.name===p.name&&pathDistance(label.x,label.y,p)<1e-6,'label centred on its own path '+p.name);check(walkable(label.x,label.y,true,label.y,key),'label lies on accessible paving '+p.name)}
}
console.log('PASS:',paving,'independent paving-width probes, complete centred path labels, and blocked water/buildings');
const origins=new Map();
for(const [key,m]of Object.entries(MAPS)){
 const add=(x,y,label)=>origins.set(key+':'+x+':'+y,{map:key,x,y,label:key+' '+label});add(...m.start,'start');
 for(const person of worldLife(key).people){add(person.x,person.y,person.name);for(const point of [person.path.p[0],person.path.p.at(-1)])add(...point,person.name+' patrol end')}
}
let cases=0,max=0;const counts={};
for(const origin of origins.values())for(const [key,m]of Object.entries(MAPS))for(const place of m.places){
 const route=routeTo(key,place.id,origin);check(route,'route exists '+origin.label+' '+place.id);
 const steps=routeDirections(route,'north');check(steps.length>0&&steps.length<=6,'six-item cap '+origin.label+' -> '+key+' '+place.id+' '+JSON.stringify(steps));
 for(const text of steps)check(text.length<=160&&text.split(/\s+/).length<=28&&!text.includes('…'),'concise complete instruction '+text);
 check(steps.at(-1).includes(place.name),'correct final destination');
 if(origin.map!==key)check(steps.some(t=>t.toLowerCase().includes('take the train')),'cross-map train retained');
 for(const leg of route.legs)if(leg.mode==='walk')check(clearSegment(leg.from.map,leg.from,leg.to),'safe reconstructed walking leg');
 max=Math.max(max,steps.length);counts[steps.length]=(counts[steps.length]||0)+1;cases++;
}
const local=routeTo('town','hotel',{map:'town',x:900,y:1310});check(routeDirections(local).length===1,'short local directions are not padded');
console.log('PASS:',cases,'NPC/start/patrol-end routes, maximum',max,'items, distribution',JSON.stringify(counts));
`,ctx);
