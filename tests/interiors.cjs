const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const root=path.join(__dirname,'..'),elements=new Map,events=new Map;
let focused=null;
function element(id=''){
 const classes=new Set,handlers=new Map;
 return {id,style:{setProperty(){}},open:false,textContent:'',innerHTML:'',
  classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,value){if(value===undefined)value=!classes.has(c);value?classes.add(c):classes.delete(c)}},
  setAttribute(){},addEventListener(type,fn){handlers.set(type,fn)},focus(){focused=id},
  showModal(){this.open=true},close(){this.open=false;handlers.get('close')?.({})},
  dispatchEvent(event){events.set(event.type,event.detail)},fire(type,event={}){handlers.get(type)?.(event)}
 };
}
const documentHandlers=new Map;
const ctx=vm.createContext({assert,console,performance:{now:()=>7000},setTimeout,clearTimeout,requestAnimationFrame(){},innerWidth:1360,innerHeight:920,
 localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},
 document:{documentElement:element(),body:element(),getElementById(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id)},querySelectorAll:()=>[],addEventListener(type,fn,capture=false){if(!documentHandlers.has(type))documentHandlers.set(type,[]);documentHandlers.get(type).push({fn,capture})}}});
vm.runInContext(fs.readFileSync(path.join(root,'dist/Little-Town.html'),'utf8').split('<script>')[1].split('</script>')[0],ctx);
ctx.fireKey=(key,repeat=false)=>{let stopped=false;const event={key:key==='Space'?' ':key,code:key,repeat,preventDefault(){},stopImmediatePropagation(){stopped=true},target:{closest:()=>null}};for(const handler of [...documentHandlers.get('keydown')].sort((a,b)=>Number(b.capture)-Number(a.capture))){handler.fn(event);if(stopped)break}};
vm.runInContext(`
assert(PLACE_INTERIORS.every(interiorReady),'registered pilot assets are embedded');
for(const [px,py] of [[900,990],[900,1000],[900,1020],[860,1020],[940,1020],[900,1040]])assert.equal(entranceAt('town',px,py)?.place,'pharmacy','loose entrance '+px+','+py);
for(const [key,px,py] of [['town',943,1020],['town',900,1060],['town',925,980],['town',1230,600],['suburbs',900,1020]])assert.equal(entranceAt(key,px,py),null,'non-entrance '+key+','+px+','+py);
mapKey='town';x=900;y=1020;facing='east';angle=90;renderMap();
const original=worldLife().people[0];original.x=902;original.y=1020;
nearbyPerson=original;updatePersonPrompt();assert.equal(nearbyPerson,null,'entrance suppresses pedestrian');
nearbyPerson=original;openDirections();assert(!$('directions-dialog').open,'stale pedestrian click cannot win');
updateEntrancePrompt();assert($('enter-place').innerHTML.includes('Enter the pharmacy'));
fireKey('Space',true);assert.equal(activeInterior,null,'repeat cannot open');
playerMoney.credit(25);held.add('ArrowRight');motion.vx=80;
fireKey('Space');assert(activeInterior&&busy&&$('interior-dialog').open,'Space enters pharmacy');
assert(!$('directions-dialog').open&&!$('book').open);assert.equal(held.size,0);assert.equal(motion.vx,0);
assert.equal($('chemist-greeting').textContent,'Hello, how can I help you today?');
assert.equal($('interior-money').textContent,'$125');
assert.equal($('chemist-art').src,ASSETS['chemist-neutral']);
assert.equal(enterPlace(),false,'no nested entry');
fireKey('ArrowRight');advancePlayer(.12);assert.equal(x,900);assert.equal(y,1020);assert.equal(held.size,0);
openBook();assert(!$('book').open,'no phrase book over interior');
$('chemist').fire('click');assert.equal(playerMoney.balanceCents,12500,'pilot click makes no purchase');
leavePlace();assert.equal(activeInterior,null);assert(!busy&&!$('interior-dialog').open);
assert.deepEqual([mapKey,x,y,facing,angle],['town',900,1020,'east',90]);assert.equal(playerMoney.balanceCents,12500);
assert.equal(held.size,0);assert.equal(motion.vx,0);
assert(enterPlace());$('interior-dialog').fire('cancel',{preventDefault(){}});assert(!activeInterior&&!busy);
assert(enterPlace());$('interior-dialog').close();assert(!activeInterior&&!busy,'native close clears state');
assert(enterPlace());reset();assert(!activeInterior&&!busy);assert.equal(x,current().start[0]);
x=900;y=1020;updateEntrancePrompt();x=1000;assert.equal(enterPlace(),false,'stale entrance click cannot teleport');
`,ctx);
assert.deepEqual(events.get('little-town:chemist-interact'),{map:'town',place:'pharmacy'});
assert.equal(focused,'camera');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/interiors/source-manifest.json')));
for(const record of manifest.images)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/interiors',record.file))).digest('hex'),record.sha256,'unchanged supplied image '+record.file);
console.log('PASS: pharmacy proximity/blocked geometry, entrance priority over pedestrians, stale targets, repeated Space, interior movement isolation, neutral greeting/click hook, money/position/focus preservation, cancel/native close/reset, and unchanged original assets');
