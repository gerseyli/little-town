// Register a place here when its interior is ready. Unfinished venues offer no dead-end prompts.
const PLACE_INTERIORS=[{
 map:'town',place:'pharmacy',approach:'pharmacy-entrance',radius:42,
 background:'pharmacy-background',character:'chemist-neutral',
 backgroundAlt:'Inside the pharmacy, with medicine shelves and a wooden counter.',
 greeting:'Hello, how can I help you today?'
},{
 map:'town',place:'bank',approach:'bank-entrance',radius:42,
 background:'bank-background',
 backgroundAlt:'Inside City Bank, with an ATM and desks for mortgages, loans, savings accounts and investments.'
},{
 map:'town',place:'supermarket',approach:'supermarket-entrance',radius:42,
 background:'grocery-background',character:'grocery-assistant',actionLabel:'Talk to the shop assistant',
 backgroundAlt:'Inside the grocery store, with fresh produce, bread, packaged food and a wooden counter.',
 greeting:'Hello! What would you like today?'
}];
let activeInterior=null;
function interiorReady(entry){return !!ASSETS[entry.background]&&(!entry.character||!!ASSETS[entry.character])}
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
 activeInterior={entry,outside:{map:mapKey,x,y,facing,angle}};resetPharmacyShop();resetBank();resetGroceryShop();
 nearbyPerson=conversationPerson=null;busy=true;context=null;renderContext();
 $('interior-title').textContent=entry.name;
 $('interior-dialog').classList.toggle('grocery-room',entry.place==='supermarket');
 $('chemist').setAttribute('aria-label',entry.actionLabel||'Talk to the chemist');
 $('interior-background').src=ASSETS[entry.background];
 $('interior-backdrop').src=ASSETS[entry.background];
 $('interior-background').alt=entry.backgroundAlt;
 $('interior-character').classList.toggle('hidden',!entry.character);
 $('chemist-greeting').classList.toggle('hidden',!entry.greeting);
 if(entry.character)$('chemist-art').src=ASSETS[entry.character];
 $('chemist-greeting').textContent=entry.greeting||'';
 $('interior-dialog').setAttribute('aria-describedby',entry.greeting?'chemist-greeting':'interior-title');
 $('interior-wallet').src=ASSETS.walletIcon;
 $('interior-money').textContent=formatMoney(playerMoney.balanceCents);
 showBankLobby();recordInteraction('entrance');
 const dialog=$('interior-dialog');dialog.showModal();dialog.focus();
 updateEntrancePrompt();updatePersonPrompt();save();
 return true;
}
function finishInteriorExit(){
 if(!activeInterior)return;
 const outside=activeInterior.outside;activeInterior=null;resetPharmacyShop();resetBank();resetGroceryShop();
 mapKey=outside.map;x=outside.x;y=outside.y;facing=outside.facing;angle=outside.angle;
 busy=false;clearKeys();last=0;update();followPlayer(true);updatePersonPrompt();save();
 $('camera').focus();
}
function leavePlace(){
 if(!activeInterior)return;
 $('interior-dialog').close();finishInteriorExit();
}
function handleEntranceKeydown(event){
 if(event.code!=='Space'||!availableEntrance())return;
 if(event.target.closest?.('input,select,textarea,[contenteditable]:not([contenteditable="false"])'))return;
 // Walking leaves the last clicked control focused. Claim Space before that
 // control can zoom, toggle a label or take another walking step.
 event.preventDefault();event.stopImmediatePropagation();
 if(!event.repeat)enterPlace();
}
document.addEventListener('keydown',handleEntranceKeydown,true);
$('enter-place').addEventListener('click',enterPlace);
$('interior-exit').addEventListener('click',leavePlace);
$('interior-dialog').addEventListener('cancel',event=>{event.preventDefault();if(bankViewVisible())closeBankView();else if(pharmacyShopVisible())closePharmacyShop();else if(groceryShopVisible())closeGroceryShop();else leavePlace()});
$('interior-dialog').addEventListener('close',()=>{
 // A queued close event from a previous visit must not end a newly opened visit.
 if(!$('interior-dialog').open)finishInteriorExit();
});
$('interior-dialog').addEventListener('keydown',event=>{
 // Handle Escape before the browser's close watcher. Repeated native cancel
 // requests can become non-cancelable, bypassing the service → lobby step.
 if(event.key==='Escape'&&activeInterior){
  event.preventDefault();event.stopPropagation();
  if(!event.repeat){if(bankViewVisible())closeBankView();else if(pharmacyShopVisible())closePharmacyShop();else if(groceryShopVisible())closeGroceryShop();else leavePlace()}
  return;
 }
 if(event.key!=='Tab'||!activeInterior)return;
 const controls=[...$('interior-dialog').querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);
 if(!controls.length)return;
 const first=controls[0],last=controls.at(-1),focused=document.activeElement;
 if(focused===$('interior-dialog')||(!event.shiftKey&&focused===last)||(event.shiftKey&&focused===first)){
  event.preventDefault();(event.shiftKey?last:first).focus();
 }
});
$('chemist').addEventListener('click',()=>{
 if(activeInterior?.entry.place==='supermarket'){openGroceryShop();return}
 if(!activeInterior||activeInterior.entry.place!=='pharmacy')return;
 // Open the consultation while preserving the extension event for later features.
 openPharmacyShop();
 $('interior-dialog').dispatchEvent(new CustomEvent('little-town:chemist-interact',{
  bubbles:true,detail:{map:activeInterior.entry.map,place:activeInterior.entry.place}
 }));
});
