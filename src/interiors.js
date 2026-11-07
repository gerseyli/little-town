// Register a place here when its interior is ready. Unfinished venues offer no dead-end prompts.
const PLACE_INTERIORS=[{
 map:'town',place:'pharmacy',approach:'pharmacy-entrance',radius:42,
 background:'pharmacy-background',character:'chemist-neutral',
 greeting:'Hello, how can I help you today?'
}];
let activeInterior=null;
function interiorReady(entry){return !!(ASSETS[entry.background]&&ASSETS[entry.character])}
function entranceAt(key=mapKey,px=x,py=y){
 if(!walkable(px,py,true,py,key))return null;
 return PLACE_INTERIORS.filter(entry=>entry.map===key&&interiorReady(entry)).map(entry=>{
  const approach=MAPS[key].paths.find(path=>path.id===entry.approach);
  const place=MAPS[key].places.find(place=>place.id===entry.place);
  return approach&&place?{...entry,name:place.name,distance:pathDistance(px,py,approach)}:null;
 }).filter(entry=>entry&&entry.distance<=entry.radius).sort((a,b)=>a.distance-b.distance)[0]||null;
}
function availableEntrance(){
 return !busy&&!activeInterior&&!$('book').open&&!$('directions-dialog').open?entranceAt():null;
}
function updateEntrancePrompt(){
 const entry=availableEntrance(),prompt=$('enter-place');
 prompt.classList.toggle('hidden',!entry);
 if(!entry)return;
 prompt.innerHTML='Enter the '+entry.name.toLowerCase()+' · <kbd>Space</kbd>';
 prompt.setAttribute('aria-label','Enter the '+entry.name.toLowerCase()+'. Press Space.');
 const px=x*scale+camX,py=y*scale+camY-85*scale;
 prompt.style.left=Math.max(120,Math.min(innerWidth-120,px))+'px';
 prompt.style.top=Math.max(155,Math.min(innerHeight-70,py))+'px';
 // Immediately remove the other prompt, even before the next animation frame.
 nearbyPerson=null;$('ask-directions').classList.add('hidden');
}
function enterPlace(){
 // Always recheck position/availability rather than trusting a previously visible prompt.
 const entry=availableEntrance();if(!entry)return false;
 clearKeys();releasePan();
 activeInterior={entry,outside:{map:mapKey,x,y,facing,angle}};resetPharmacyShop();
 nearbyPerson=conversationPerson=null;busy=true;context=null;renderContext();
 $('interior-title').textContent=entry.name;
 $('interior-background').src=ASSETS[entry.background];
 $('interior-backdrop').src=ASSETS[entry.background];
 $('interior-background').alt='Inside the pharmacy, with medicine shelves and a wooden counter.';
 $('chemist-art').src=ASSETS[entry.character];
 $('chemist-greeting').textContent=entry.greeting;
 $('interior-wallet').src=ASSETS.walletIcon;
 $('interior-money').textContent=formatMoney(playerMoney.balanceCents);
 const dialog=$('interior-dialog');dialog.showModal();dialog.focus();
 updateEntrancePrompt();updatePersonPrompt();save();
 return true;
}
function finishInteriorExit(){
 if(!activeInterior)return;
 const outside=activeInterior.outside;activeInterior=null;resetPharmacyShop();
 mapKey=outside.map;x=outside.x;y=outside.y;facing=outside.facing;angle=outside.angle;
 busy=false;clearKeys();last=0;update();followPlayer(true);updatePersonPrompt();save();
 $('camera').focus();
}
function leavePlace(){
 if(!activeInterior)return;
 $('interior-dialog').close();finishInteriorExit();
}
$('enter-place').addEventListener('click',enterPlace);
$('interior-exit').addEventListener('click',leavePlace);
$('interior-dialog').addEventListener('cancel',event=>{event.preventDefault();if(pharmacyShopVisible())closePharmacyShop();else leavePlace()});
$('interior-dialog').addEventListener('close',()=>{
 // A queued close event from a previous visit must not end a newly opened visit.
 if(!$('interior-dialog').open)finishInteriorExit();
});
$('interior-dialog').addEventListener('keydown',event=>{
 if(event.key!=='Tab'||!activeInterior)return;
 const controls=pharmacyShopVisible()?[...$('interior-dialog').querySelectorAll('button:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length):[$('interior-exit'),$('chemist')];
 const first=controls[0],last=controls.at(-1),focused=document.activeElement;
 if(focused===$('interior-dialog')||(!event.shiftKey&&focused===last)||(event.shiftKey&&focused===first)){
  event.preventDefault();(event.shiftKey?last:first).focus();
 }
});
$('chemist').addEventListener('click',()=>{
 if(!activeInterior)return;
 // Open the consultation while preserving the extension event for later features.
 openPharmacyShop();
 $('interior-dialog').dispatchEvent(new CustomEvent('little-town:chemist-interact',{
  bubbles:true,detail:{map:activeInterior.entry.map,place:activeInterior.entry.place}
 }));
});
