const fs=require('fs'),vm=require('vm');
const elements=new Map;function el(){return {style:{setProperty(){}},value:'',textContent:'',innerHTML:'',open:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}}}
const ctx={console,Math,Date,performance:{now:()=>1000},setTimeout,clearTimeout,requestAnimationFrame(){},innerWidth:1360,innerHeight:920,localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){}},document:{documentElement:el(),body:el(),getElementById:id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)},querySelectorAll:()=>[],addEventListener(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/Little-Town.html'),'utf8').split('<script>')[1].split('</script>')[0],ctx);
vm.runInContext(`
function check(value,message){if(!value)throw Error(message)}
function corridor(key,points,label){for(let i=1;i<points.length;i++){const a={x:points[i-1][0],y:points[i-1][1]},b={x:points[i][0],y:points[i][1]};check(clearSegment(key,a,b),label+' forward');check(clearSegment(key,b,a),label+' reverse')}}
// These probes were traced from the artwork, independently of the path definitions.
corridor('town',[[1360,200],[1360,360],[1360,600]],'hospital/museum riverbank');
corridor('town',[[1365,900],[1365,1000],[1365,1120],[1365,1290]],'southern riverbank');
corridor('town',[[1700,1120],[1920,1120],[1960,1120]],'full meadow path');
corridor('town',[[1090,870],[1090,1000],[1090,1290]],'hotel/cinema path');
corridor('suburbs',[[1382.8,448.4],[1382.8,640.6],[1382.8,804.6]],'missing western field lane');
corridor('suburbs',[[2134.375,1209.375],[2134.375,1278.125],[2134.375,1440]],'harbor/theme park and pier');
corridor('suburbs',[[1710.938,1476.562],[1750,1437.5],[1750,1312.5],[1784.375,1278.125]],'curved bay promenade');
corridor('suburbs',[[1718.75,626],[1758,626]],'lake promenade access');
for(const [key,point] of [['town',[270,235]],['town',[990,1190]],['town',[1230,230]],['town',[840,430]],['suburbs',[2015,625]],['suburbs',[1850,1380]],['suburbs',[289,390]]])check(!walkable(point[0],point[1],true,point[1],key),'terrain/building stays blocked '+key+' '+point);
for(let i=0;i<20;i++){const angle=i*Math.PI/10,px=2008+225*Math.cos(angle),py=626+120*Math.sin(angle);check(!walkable(px,py,true,py,'suburbs'),'inner lake water stays blocked')}
let samples=0;
for(const [key,m]of Object.entries(MAPS))for(const path of m.paths)for(let j=1;j<path.p.length;j++){
 const a=path.p[j-1],b=path.p[j],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));
 for(let i=0;i<=n;i++){const px=a[0]+(b[0]-a[0])*i/n,py=a[1]+(b[1]-a[1])*i/n;check(walkable(px,py,true,py,key),'path obstruction '+key+' '+path.name+' '+px+','+py);samples++}
}
console.log('PASS:',samples,'path-center samples, independently traced connectors, and blocked water/buildings');
function resetMotion(){mapKey='town';x=200;y=1300;busy=false;held.clear();stopPlayerMotion();touristGait.distance=0;worlds.clear();nearbyPerson=conversationPerson=null;signalEpoch=0}
function walkAt(fps){resetMotion();held.add('ArrowRight');for(let i=0;i<fps;i++)simulationFrame(1/fps,1000+i*1000/fps);return x}
const positions=[30,60,120,144].map(walkAt);
check(Math.max(...positions)-Math.min(...positions)<.6,'same distance at 30/60/120/144 Hz');
check(positions[1]>380&&positions[1]<410,'brisk eased walking pace');
held.clear();const beforeStop=x;for(let i=0;i<30;i++)simulationFrame(1/120,2100+i*1000/120);
check(x-beforeStop<12&&!motion.moving&&!touristGait.moving,'short smooth stop without idle stepping');
resetMotion();x=910;y=1250;held.add('ArrowUp');for(let i=0;i<120;i++)simulationFrame(1/120,1000+i*1000/120);
check(y>=1245.99&&!motion.moving,'hotel wall blocks movement');const gait=touristGait.distance;simulationFrame(.1,2200);check(touristGait.distance===gait,'blocked player gait is frozen');
resetMotion();tapWalk('ArrowRight');for(let i=0;i<30;i++)simulationFrame(1/120,1000+i*1000/120);check(x>200&&x<214,'quick tap gives a small smooth nudge');
held.add('ArrowRight');simulationFrame(.1,1400);clearKeys();check(motion.vx===0&&motion.vy===0&&!touristGait.moving,'dialogue/reset input cancellation stops motion');
console.log('PASS: frame-rate-independent movement, eased starts/stops, collision-frozen gait and responsive taps');
`,ctx);
