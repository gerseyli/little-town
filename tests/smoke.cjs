const fs=require('fs'),vm=require('vm');
const elements=new Map;function el(){return {style:{setProperty(){}},value:'',textContent:'',innerHTML:'',open:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}}};
const ctx={console,Math,Date,performance:{now:()=>7000},setTimeout,clearTimeout,requestAnimationFrame(){},innerWidth:1360,innerHeight:920,localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){}},document:{documentElement:el(),body:el(),getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},querySelectorAll:()=>[],addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/Little-Town.html'),'utf8').split('<script>')[1].split('</script>')[0],ctx);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
check(walkable(1230,360,true,360,'town'),'hospital-museum passage');
for(let xx=1130;xx<=1340;xx+=5)check(walkable(xx,360,true,360,'town'),'whole hospital passage '+xx);
for(const key of ['town','suburbs']){
 mapKey=key;const m=current(),sx=Math.round(m.start[0]/10)*10,sy=Math.round(m.start[1]/10)*10;const seen=new Set([sx+','+sy]),q=[[sx,sy]];
 for(let k=0;k<q.length;k++){const [a,b]=q[k];for(const [dx,dy] of [[10,0],[-10,0],[0,10],[0,-10]]){const nx=a+dx,ny=b+dy,s=nx+','+ny;if(!seen.has(s)&&walkable(nx,ny,true,b,key)){seen.add(s);q.push([nx,ny])}}}
 for(const p of [...m.places.map(p=>({name:p.name,x:p.access[0],y:p.access[1]})),...m.stops,{name:'train station',...m.train}])check(q.some(([a,b])=>Math.hypot(a-p.x,b-p.y)<18),'unreachable '+key+' '+p.name);
 check(!walkable(m.train.x,m.h-30,true,m.h-30,key),'railway is not walkable');
 const r=m.road,cross=r.crossings[0];check(!walkable(cross,r.y1+1,false,r.y1-1,key),'red signal '+key);check(walkable(cross,(r.y1+r.y2)/2,true,r.y1-1,key),'green signal '+key);check(walkable(cross,(r.y1+r.y2)/2,false,(r.y1+r.y2)/2,key),'finish crossing '+key);
 console.log('PASS:',key, m.places.length,'places and station reachable');
}
mapKey='suburbs';check(MAPS.suburbs.places.filter(p=>p.id.endsWith('s')&&p.name.includes('’ house')).length===4,'four plural possessives');
check(walkable(1500,650,true,650,'suburbs'),'field crossing');check(!walkable(2015,625,true,625,'suburbs'),'lake water blocked');
check(BOOK_ENTRIES.directions.length>=20&&BOOK_ENTRIES.places.length>=15,'picture glossary coverage');
for(const tab of ['directions','places','transport'])for(const [n,e]of BOOK_ENTRIES[tab].entries())check(picture(e,tab+n).startsWith('<svg'),'pictogram '+e[0]);
console.log('PASS: family possessives, field path, water collision, and illustrated glossary');
`,ctx);
(async()=>{await vm.runInContext(`(async()=>{
mapKey='town';x=595;y=1300;travelCooldown=0;update();check(context.kind==='train','station offers ticket');boardTrain();await new Promise(r=>setTimeout(r,1050));check(mapKey==='suburbs'&&x===current().train.x,'train to suburbs');travelCooldown=0;update();check(context.kind==='train','return train offered');boardTrain();await new Promise(r=>setTimeout(r,1050));check(mapKey==='town'&&x===595&&y===1300,'return to town');travelCooldown=0;x=300;y=860;context=null;update();routeIndex=1;boardBus();await new Promise(r=>setTimeout(r,1050));check(x===1700&&y===860,'bus route retained');travelCooldown=0;mapKey='town';x=595;y=1300;context=null;update();boardTrain();reset();await new Promise(r=>setTimeout(r,1050));check(mapKey==='town'&&!busy&&x===120&&y===1300,'reset cancels train');console.log('PASS: train round trip, original bus, and travel cancellation')})()`,ctx)})().catch(e=>{console.error(e);process.exitCode=1});
