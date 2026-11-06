const fs=require('fs'),vm=require('vm');
const elements=new Map;function el(){return {style:{setProperty(){}},value:'',textContent:'',innerHTML:'',open:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}}};
const ctx={console,Math,Date,performance:{now:()=>7000},setTimeout,clearTimeout,requestAnimationFrame(){},innerWidth:1360,innerHeight:920,localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){}},document:{documentElement:el(),body:el(),getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},querySelectorAll:()=>[],addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/Little-Town.html'),'utf8').split('<script>')[1].split('</script>')[0],ctx);
vm.runInContext(`
function check(value,message){if(!value)throw Error(message)}
function connection(key,points,label){
 for(let i=1;i<points.length;i++){
  const a={x:points[i-1][0],y:points[i-1][1]},b={x:points[i][0],y:points[i][1]};
  check(clearSegment(key,a,b),label+' segment '+i);
  check(clearSegment(key,b,a),label+' reverse segment '+i);
 }
 console.log('PASS:',label,'both directions');
}
connection('town',[[1090,860],[1090,1000],[1090,1300]],'LT-001 hotel–cinema lane');
connection('suburbs',[[2134.375,1209.375],[2134.375,1278.125]],'LT-002 harbor–theme park connector');
connection('suburbs',[[1710.938,1476.562],[1750,1437.5],[1750,1312.5],[1784.375,1278.125]],'LT-003 curved bay-edge path');
check(!walkable(1850,1380,true,1380,'suburbs'),'bay water blocked');
check(!walkable(2015,625,true,625,'suburbs'),'lake remains blocked');
check(!walkable(1130,1190,true,1190,'town'),'old misaligned lane no longer crosses cinema');
check(!walkable(990,1190,true,1190,'town'),'hotel remains blocked');
for(const key of ['town','suburbs']){
 mapKey=key;const life=worldLife();
 check(life.people.length===6,'six people '+key);
 for(const person of life.people){
  check(person.speed<SPEED*.65&&person.speed>=SPEED*.4,'catchable person');
  for(let i=1;i<person.path.p.length;i++)check(clearSegment(key,{x:person.path.p[i-1][0],y:person.path.p[i-1][1]},{x:person.path.p[i][0],y:person.path.p[i][1]}),'pedestrian path valid '+person.path.name);
 }
 // Traffic stop, queue, clear, restart and finish-crossing safety on both maps.
 const saved=life.traffic.map(v=>({...v})),cx=current().road.crossings[0];
 life.traffic=life.traffic.slice(0,2);const a=life.traffic[0],b=life.traffic[1];
 a.direction=b.direction=1;a.x=cx-180;b.x=cx-330;x=40;y=40;
 signalEpoch=0;
 for(let i=0;i<200;i++)advanceTraffic(.04,7000);
 check(a.x+a.width/2<=cx-24,'stops before red crossing '+key);
 check(a.x-b.x>=(a.width+b.width)/2+17.9,'queue spacing '+key);
 const redPosition=a.x;
 // A walker still in the carriageway retains protection after their green ends.
 x=cx;y=(current().road.y1+current().road.y2)/2;
 advanceTraffic(.04,1000);check(a.x===redPosition,'finishing pedestrian protected');
 x=40;y=40;
 for(let i=0;i<100;i++)advanceTraffic(.04,1000);
 check(a.x>cx+100,'continues on green '+key);
 life.traffic=saved;
 // People remain on valid paths through extended movement, can be walked through.
 nearbyPerson=null;conversationPerson=null;
 for(let i=0;i<300;i++)advancePeople(.04);
 for(const person of life.people)check(walkable(person.x,person.y,true,person.y,key),'pedestrian stays on path');
 const person=life.people[0];check(walkable(person.x,person.y,true,person.y,key),'person is not collision');
 nearbyPerson=person;const before=[person.x,person.y];advancePeople(1);check(person.x===before[0]&&person.y===before[1],'nearby person pauses');nearbyPerson=null;
 console.log('PASS:',key,'traffic signals, queues, clearance and six slower pedestrians');
}
// Every destination from the other map must be safely routable using a train.
for(const [key,m]of Object.entries(MAPS))for(const destination of m.places){
 const from=key==='town'?'suburbs':'town',start=MAPS[from].start;
 const route=routeTo(key,destination.id,{map:from,x:start[0],y:start[1]});
 check(route,'route exists '+key+' '+destination.id);
 check(route.legs.some(e=>e.mode==='train'),'cross-map route uses train');
 for(const leg of route.legs)if(leg.mode==='walk')check(clearSegment(leg.from.map,leg.from,leg.to),'route never crosses blocked terrain');
 const directions=routeDirections(route,'north');check(directions.some(t=>t.includes('Take the train.')),'train phrase in directions');
 check(directions.at(-1).includes(destination.name),'names correct destination');
}
const busRoute=routeTo('town','field',{map:'town',x:300,y:860});
check(busRoute.legs.some(e=>e.mode==='bus'&&e.number===6&&e.toStop.id==='meadow'),'useful bus route suggested');
check(routeDirections(busRoute).some(t=>t.includes('bus number 6')),'bus phrase gives correct number');
const shortRoute=routeTo('town','hotel',{map:'town',x:900,y:1300});
check(!shortRoute.legs.some(e=>e.mode!=='walk'),'short local journey stays on foot');
check(routeTo('town','missing')===null,'invalid destination handled');
console.log('PASS: all 34 cross-map destinations, safe walking segments, train and useful bus directions');
`,ctx);
