const fs=require('fs'),vm=require('vm');
const elements=new Map;function el(){return {style:{setProperty(){}},value:'',textContent:'',innerHTML:'',open:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}}};
const ctx={console,Math,Date,performance:{now:()=>7000},setTimeout,clearTimeout,requestAnimationFrame(){},innerWidth:1360,innerHeight:920,localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){}},document:{documentElement:el(),body:el(),getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},querySelectorAll:()=>[],addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/Little-Town.html'),'utf8').split('<script>')[1].split('</script>')[0],ctx);
vm.runInContext(`
function check(value,message){if(!value)throw Error(message)}
function fresh(key){mapKey=key;x=40;y=40;signalEpoch=0;worlds.delete(key);return worldLife()}
function safeQueues(life,label){
 for(const dir of [-1,1]){
  const lane=life.traffic.filter(v=>v.direction===dir).sort((a,b)=>a.x-b.x);
  for(let i=1;i<lane.length;i++)check(lane[i].x-lane[i-1].x>=(lane[i].width+lane[i-1].width)/2+17.99,label+' vehicle overlap');
 }
}
for(const key of ['town','suburbs']){
 for(const dir of [-1,1]){
  const life=fresh(key),zone=crossingZones()[1];
  life.traffic=Array.from({length:10},(_,i)=>({kind:'car',x:zone.x-dir*(150+i*140),direction:dir,speed:110+i*3,width:i%2?108:78}));
  for(let frame=0;frame<600;frame++){
   advanceTraffic(.04,7000);safeQueues(life,key+' red queue');
   for(const v of life.traffic)check((zone.x-v.x)*dir>=zone.halfWidth+v.width/2+7.99,'red stop line '+key+' '+dir);
  }
 }
 const life=fresh(key);
 // Several minutes of both lanes: variable frames, red changes and repeated wrapping.
 let wraps=0,moved=0;
 for(let frame=0;frame<12000;frame++){
  const dt=[.016,.025,.04][frame%3],before=life.traffic.map(v=>v.x);
  advanceTraffic(dt,frame*25);safeQueues(life,key+' phase/wrap');
  life.traffic.forEach((v,i)=>{if(Math.abs(v.x-before[i])>current().w/2)wraps++;else moved+=Math.abs(v.x-before[i]);check(Number.isFinite(v.x),'finite position')});
  if(green(frame*25))check(crossingClear(),'walking green waits for clearance');
 }
 check(wraps>=12&&moved>10000,'traffic keeps circulating '+key);
 // On red onset, a vehicle already committed clears before walking green appears.
 const zone=crossingZones()[0];life.traffic=[{kind:'bus',x:zone.x,direction:1,speed:110,width:108}];
 check(!green(7000),'occupied crossing stays red for walkers');
 for(let frame=0;frame<60;frame++)advanceTraffic(.04,7000);
 check(green(7000),'committed bus clears during walking phase');
 console.log('PASS:',key,'both queue directions, phase transitions and',wraps,'wraps');
 // Saved-position initialization cannot overlap a walker, even during vehicle green.
 x=current().road.crossings[0];y=(current().road.y1+current().road.y2)/2;worlds.delete(key);
 check(crossingZones().every(z=>zoneClear(z,key)),'restored walker starts with clear road');
 for(let frame=0;frame<100;frame++)advanceTraffic(.04,1000);
 check(worldLife().traffic.every(v=>Math.abs(v.x-x)>v.width/2+24),'restored walker remains protected');
}
for(const dir of [-1,1])for(const edge of ['north','south']){
 const life=fresh('suburbs'),r=current().road,zone=crossingZones().at(-1),cx=zone.x;
 life.traffic=[{kind:'bus',x:cx,direction:dir,speed:110,width:108}];
 x=cx;y=edge==='north'?r.y1-1:r.y2+1;
 const dy=edge==='north'?1:-1;
 check(walkable(x,y+dy*2,true,y),'gap stays in static path graph');
 check(!roadEntryClear(x,y+dy*2,y),'gap blocks entry while bus traverses '+dir+' '+edge);
 const startY=y;move(0,dy,8/SPEED);check(y===startY,'actual movement waits at gap');
 for(let frame=0;frame<40;frame++)advanceTraffic(.04,1000);
 check(roadEntryClear(x,y+dy*2,y),'gap admits walker after bus clears');
 life.traffic=[{kind:'car',x:cx-dir*160,direction:dir,speed:110,width:78}];
 for(let frame=0;frame<100;frame++)advanceTraffic(.04,1000);
 const v=life.traffic[0],stop=v.x;
 check((cx-v.x)*dir>=zone.halfWidth+v.width/2+7.99,'approaching walker gets yield');
 move(0,dy,8/SPEED);check(inRoad(y),'walker enters yielded gap');
 // Simulate stopping on the road until a whole signal cycle has elapsed.
 for(let frame=0;frame<700;frame++)advanceTraffic(.04,frame*40);
 check(v.x===stop,'gap walker retains right of way across phase changes');
 y=dy===1?r.y2+40:r.y1-40;
 advanceTraffic(.04,1000);check((v.x-stop)*dir>0,'traffic resumes after walker leaves');
}
console.log('PASS: Coast Road entry, approach yielding, clearance and restart from both sides/directions');
`,ctx);
