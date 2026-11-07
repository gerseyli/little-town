const VEHICLE_KINDS=['car','truck','bus','taxi','ambulance','police'];
const PEOPLE_NAMES=['Maya','Arthur','Lin','Sam','Rosie','Nora'];
const worlds=new Map();let nearbyPerson=null,conversationPerson=null;
function worldLife(key=mapKey){
 if(worlds.has(key))return worlds.get(key);
 const m=MAPS[key],traffic=VEHICLE_KINDS.map((kind,i)=>({kind,x:90+Math.floor(i/2)*(m.w/3),direction:i%2?1:-1,speed:110+(i%3)*7,width:kind==='bus'?108:kind==='truck'?100:78}));
 const paths=key==='town'?['Station Road','Garden Street','North Street','Oak Street','Woodland Trail','Main Road · south pavement']:['Station Walk','Willow Drive','Maple Drive','Lakeside Walk','Theme Park Walk','Mall Walk'];
 const people=paths.map((name,i)=>{const p=m.paths.find(p=>p.name===name),a=p.p[0],b=p.p[1],fraction=.15+i*.11;return {id:i,name:PEOPLE_NAMES[i],path:p,index:1,direction:1,x:a[0]+(b[0]-a[0])*fraction,y:a[1]+(b[1]-a[1])*fraction,speed:(115+i*4)/2,distance:0,velocity:0,moving:false,facing:travelFacing(b[0]-a[0],b[1]-a[1])}});
 // A saved game may resume in the carriageway. Start vehicles off-map in
 // that case rather than spawning an actor on top of the restored walker.
 if(key===mapKey&&inRoad(y,key))traffic.forEach((v,i)=>{v.x=v.direction===1?-120-Math.floor(i/2)*180:m.w+120+Math.floor(i/2)*180});
 const life={traffic,people};worlds.set(key,life);return life;
}
function walkingPhase(now=performance.now()){return (now-signalEpoch)%14000>=6500}
function crossingZones(key=mapKey){
 const r=MAPS[key].road;
 return r.crossings.map(x=>({x,halfWidth:24})).concat(r.gap?[{x:(r.gap[0]+r.gap[1])/2,halfWidth:(r.gap[1]-r.gap[0])/2}]:[]);
}
function crossingCenters(key=mapKey){return crossingZones(key).map(zone=>zone.x)}
function crossingOccupied(cx,key=mapKey){return (key===mapKey&&inRoad(y,key)&&Math.abs(x-cx)<42)||worldLife(key).people.some(p=>inRoad(p.y,key)&&Math.abs(p.x-cx)<42)}
function gapRequested(key=mapKey){
 const r=MAPS[key].road;if(!r.gap)return false;
 const approaching=p=>p.x>=r.gap[0]-12&&p.x<=r.gap[1]+12&&p.y>=r.y1-26&&p.y<=r.y2+26;
 return (key===mapKey&&approaching({x,y}))||worldLife(key).people.some(approaching);
}
function zoneClear(zone,key=mapKey,margin=0){return worldLife(key).traffic.every(v=>Math.abs(v.x-zone.x)>=v.width/2+zone.halfWidth+margin-1e-7)}
// Static walkability is also used by the route planner. Live traffic admission
// belongs at movement time, so a temporary queue never makes a route disappear.
function roadEntryClear(nx,ny,fromY=y,key=mapKey){
 const r=MAPS[key].road;
 if(!inRoad(ny,key)||inRoad(fromY,key)||!r.gap||nx<r.gap[0]||nx>r.gap[1])return true;
 return zoneClear(crossingZones(key).at(-1),key,8);
}
function vehicleGreen(now=performance.now()){return !walkingPhase(now)&&!crossingCenters().some(cx=>crossingOccupied(cx))}
function crossingClear(key=mapKey){return crossingZones(key).every(zone=>zoneClear(zone,key))}
function renderRoad(){
 const m=current(),r=m.road,cy=(r.y1+r.y2)/2;
 // Replace only the carriageway at render time. Original raster scenery and parked cars stay intact.
 $('roadbed').innerHTML=`<defs><linearGradient id="asphalt" x2="0" y2="1"><stop stop-color="#4b5055"/><stop offset=".5" stop-color="#626369"/><stop offset="1" stop-color="#454d52"/></linearGradient><pattern id="road-grain" width="37" height="19" patternUnits="userSpaceOnUse"><path d="M3 4h2m13 7h1m12-8h2m-25 12h1" stroke="#d1c9b8" stroke-opacity=".12" stroke-width="1"/></pattern></defs><rect x="0" y="${r.y1}" width="${m.w}" height="${r.y2-r.y1}" fill="url(#asphalt)"/><rect y="${r.y1}" width="${m.w}" height="${r.y2-r.y1}" fill="url(#road-grain)"/><path d="M0 ${r.y1+1}H${m.w}M0 ${r.y2-1}H${m.w}" stroke="#e7dac6" stroke-width="3"/><path d="M0 ${cy}H${m.w}" stroke="#edcb55" stroke-width="3" stroke-dasharray="24 20"/>`+r.crossings.map(cx=>Array.from({length:9},(_,i)=>`<rect x="${cx-22}" y="${r.y1+i*(r.y2-r.y1)/9}" width="44" height="6" fill="#fff6df"/>`).join('')).join('')+(r.gap?`<rect x="${r.gap[0]}" y="${r.y1}" width="${r.gap[1]-r.gap[0]}" height="${r.y2-r.y1}" fill="#d8bea0"/><path d="M${r.gap[0]} ${r.y1}V${r.y2}M${r.gap[1]} ${r.y1}V${r.y2}" stroke="#efe0c4" stroke-width="3"/>`:'');
}
function advanceTraffic(dt,now=performance.now()){
 const life=worldLife(),m=current(),zones=crossingZones(),red=walkingPhase(now)||zones.some(zone=>crossingOccupied(zone.x));
 // Front vehicles advance first, so a queue can safely follow its leader.
 for(const dir of [-1,1])for(const v of life.traffic.filter(v=>v.direction===dir).sort((a,b)=>dir*(b.x-a.x))){
  let limitDistance=Infinity;
  for(const zone of zones){const ahead=(zone.x-v.x)*dir,limit=ahead-zone.halfWidth-v.width/2-8;
   const yielding=zone===zones.at(-1)&&m.road.gap&&gapRequested();
   // Vehicles already over the stop line clear the crossing before walkers enter.
   if((red||yielding)&&ahead>v.width/2+zone.halfWidth)limitDistance=Math.min(limitDistance,Math.max(0,limit));
  }
  for(const other of life.traffic){const gap=(other.x-v.x)*dir-(v.width+other.width)/2-18;if(other!==v&&other.direction===dir&&(other.x-v.x)*dir>0)limitDistance=Math.min(limitDistance,Math.max(0,gap))}
  const desired=Math.min(v.speed,Math.sqrt(2*170*limitDistance));
  v.velocity=approachSpeed(v.velocity||0,desired,(desired<(v.velocity||0)?300:115)*dt);
  const distance=Math.min(v.velocity*dt,limitDistance);
  if(distance<v.velocity*dt)v.velocity=distance/dt;
  v.x+=dir*distance;
  if((dir===1&&v.x>m.w+v.width)||(dir===-1&&v.x<-v.width)){const entry=dir===1?-v.width:m.w+v.width;if(life.traffic.every(o=>o===v||o.direction!==dir||Math.abs(o.x-entry)>(o.width+v.width)/2+24))v.x=entry;else v.x=dir===1?m.w+v.width:-v.width}
 }
}
function advancePeople(dt){
 for(const p of worldLife().people){p.moving=false;if(p===nearbyPerson||p===conversationPerson){p.velocity=0;continue}p.velocity=approachSpeed(p.velocity||0,p.speed,350*dt);let remaining=p.velocity*dt;
  while(remaining>0){const target=p.path.p[p.index],dx=target[0]-p.x,dy=target[1]-p.y,d=Math.hypot(dx,dy),step=Math.min(d,remaining,2);
   if(d<.01){if(p.index===p.path.p.length-1)p.direction=-1;else if(p.index===0)p.direction=1;p.index+=p.direction;continue}
   const nx=p.x+dx/d*step,ny=p.y+dy/d*step;if(!walkable(nx,ny,green(),p.y)||!roadEntryClear(nx,ny,p.y))break;p.facing=travelFacing(dx,dy);p.x=nx;p.y=ny;p.distance+=step;p.moving=true;remaining-=step;
  }
 }
}
function mountLife(){
 const r=current().road,life=worldLife();
 $('traffic').innerHTML=life.traffic.map((v,i)=>`<g id="vehicle-${i}"><image href="${ASSETS['vehicle-'+v.kind]}" x="${-v.width/2}" y="-45" width="${v.width}" height="52" preserveAspectRatio="xMidYMax meet"/></g>`).join('');
 $('pedestrians').innerHTML=[...life.people].sort((a,b)=>a.y-b.y).map(p=>`<g id="person-${p.id}"><ellipse rx="14" ry="5" fill="#183a3544"/>${actorSprite('person-sprite-'+p.id,'walk-person-'+p.id,PEDESTRIAN_SIZE,PEDESTRIAN_SIZE)}</g>`).join('');
 renderLife();
}
function renderLife(){
 if($('directions-dialog').open||$('book').open)worldLife().people.forEach(p=>{p.moving=false;p.velocity=0});
 const r=current().road,life=worldLife();
 life.traffic.forEach((v,i)=>$('vehicle-'+i).setAttribute('transform',`translate(${v.x} ${v.direction===1?r.y2-15:r.y1+36}) scale(${v.direction} 1)`));
 life.people.forEach(p=>{$('person-'+p.id).setAttribute('transform',`translate(${p.x} ${p.y})`);renderActor('person-sprite-'+p.id,p,p.facing,64)});
}
function updatePersonPrompt(){
 const allowed=!busy&&!activeInterior&&!entranceAt()&&!$('book').open&&!$('directions-dialog').open&&!context;
 const closest=allowed?[...worldLife().people].filter(p=>Math.hypot(p.x-x,p.y-y)<70&&clearSegment(mapKey,{x,y},p)).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0]:null;
 nearbyPerson=closest||null;const prompt=$('ask-directions');prompt.classList.toggle('hidden',!nearbyPerson);
 if(nearbyPerson){const px=(x+nearbyPerson.x)/2*scale+camX,py=Math.min(y,nearbyPerson.y)*scale+camY-85*scale;prompt.style.left=Math.max(115,Math.min(innerWidth-115,px))+'px';prompt.style.top=Math.max(70,Math.min(innerHeight-70,py))+'px';prompt.setAttribute('aria-label','Ask '+nearbyPerson.name+' for directions. Press Space.')}
}
function openDirections(){if(!nearbyPerson||busy||activeInterior||entranceAt())return;conversationPerson=nearbyPerson;clearKeys();const dialog=$('directions-dialog');dialog.innerHTML=`<div class="directions-head"><h2>Ask ${conversationPerson.name} for directions</h2><button data-close-directions aria-label="Close directions">×</button></div><p>Excuse me, how can I get to …?</p><div class="destination-choices">${Object.entries(MAPS).map(([key,m])=>`<fieldset><legend>${m.name}</legend>${m.places.map(p=>`<button data-destination-map="${key}" data-destination="${p.id}">${p.name}</button>`).join('')}</fieldset>`).join('')}</div><section id="directions-answer" aria-live="polite"><p>Choose a place to ask for directions.</p></section>`;dialog.showModal();updatePersonPrompt()}
function closeDirections(){conversationPerson=null;$('directions-dialog').close();clearKeys();$('camera').focus()}
$('ask-directions').addEventListener('click',openDirections);
$('directions-dialog').addEventListener('close',()=>{conversationPerson=null;clearKeys();$('camera').focus()});
$('directions-dialog').addEventListener('click',e=>{
 if(e.target.closest('[data-close-directions]'))closeDirections();
 const choice=e.target.closest('[data-destination]');if(!choice)return;
 const route=routeTo(choice.dataset.destinationMap,choice.dataset.destination),instructions=routeDirections(route);
 $('directions-dialog').querySelectorAll('[data-destination]').forEach(b=>b.setAttribute('aria-pressed',String(b===choice)));
 $('directions-answer').innerHTML=`<h3>Excuse me, how can I get to ${choice.textContent}?</h3><ol>${instructions.map(t=>`<li>${t}</li>`).join('')}</ol><p class="directions-note">Directions start where you asked. North is up. Use the named streets and wait for green at crossings.</p>`;
 $('directions-answer').scrollIntoView({block:'nearest'});
});
