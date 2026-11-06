const fs=require('fs'),vm=require('vm');
const elements=new Map;function el(){return {style:{setProperty(){}},value:'',textContent:'',innerHTML:'',open:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}}};
const ctx={console,Math,Date,performance:{now:()=>7000},setTimeout,clearTimeout,requestAnimationFrame(){},innerWidth:1360,innerHeight:920,localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){}},document:{documentElement:el(),body:el(),getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},querySelectorAll:()=>[],addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/Little-Town.html'),'utf8').split('<script>')[1].split('</script>')[0],ctx);
vm.runInContext(`
function check(value,message){if(!value)throw Error(message)}
for(const [dx,dy,facing,row] of [[1,0,'east',2],[-1,0,'west',1],[0,1,'south',0],[0,-1,'north',3]]){
 check(travelFacing(dx,dy)===facing,'movement direction '+facing);
 const attrs={};$('atlas-test').setAttribute=(k,v)=>attrs[k]=v;
 const actor={distance:0,moving:true},seen=new Set;
 for(let i=0;i<4;i++){actor.distance=i*16;renderActor('atlas-test',actor,facing,64);seen.add(attrs.viewBox);check(attrs.viewBox===i+' '+row+' 1 1','correct frame/row '+facing)}
 check(seen.size===4,'four distinct frames '+facing);
 actor.moving=false;renderActor('atlas-test',actor,facing,64);check(attrs.viewBox==='1 '+row+' 1 1','standing frame '+facing);
}
mapKey='town';x=300;y=1150;touristGait.distance=0;
move(1,0,.04);check(Math.abs(touristGait.distance-SPEED*.04)<1e-6,'tourist gait follows actual travel');
x=24;y=24;touristGait.distance=0;move(-1,0,.04);
check(!touristGait.moving&&touristGait.distance===0,'blocked tourist does not walk in place');
for(const key of ['town','suburbs']){
 mapKey=key;const life=worldLife();nearbyPerson=null;conversationPerson=null;
 const person=life.people[0],before={x:person.x,y:person.y,distance:person.distance};
 advancePeople(.1);
 check(Math.hypot(person.x-before.x,person.y-before.y)>0&&Math.hypot(person.x-before.x,person.y-before.y)<=person.speed*.1,'half-speed eased displacement '+key);
 check(person.speed===(115+person.id*4)/2,'half original speed');
 check(person.moving&&person.distance>before.distance,'walking advances frames');
 nearbyPerson=person;const distance=person.distance;advancePeople(.1);
 check(!person.moving&&person.distance===distance,'nearby pedestrian rests');
 nearbyPerson=null;conversationPerson=person;advancePeople(.1);
 check(!person.moving&&person.distance===distance,'talking pedestrian rests');conversationPerson=null;
}
mapKey='town';const person=worldLife().people[0];
person.path={p:[[120,1000],[300,1000],[300,1150],[120,1150],[120,1000]]};
person.x=120;person.y=1000;person.index=1;person.direction=1;
const directions=new Set;
for(let i=0;i<400;i++){advancePeople(.04);directions.add(person.facing)}
check(directions.size===4,'pedestrian turns to all four views on a valid patrol');
console.log('PASS: all four directional rows and gait frames, half-speed movement, blocked/idle/conversation rest and patrol turns');
`,ctx);
