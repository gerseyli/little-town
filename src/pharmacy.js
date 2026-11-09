/* PHARMACY DATA */
/* SYMPTOM ATLAS */
let pharmacySession=null;
function pharmacyShopVisible(){return !!pharmacySession?.visible}
function resetPharmacyShop(){
 pharmacySession=null;$('pharmacy-shop').classList.add('hidden');$('interior-dialog').classList.remove('shop-open');$('interior-dialog').setAttribute('aria-describedby','chemist-greeting');
}
function shopActionArt(){return '<img class="shop-action-art" src="'+ASSETS.pharmacyAction+'" alt="" aria-hidden="true">'}
function openPharmacyShop(){
 if(!activeInterior||activeInterior.entry.place!=='pharmacy')return;
 if(!pharmacySession)pharmacySession={phase:'symptoms',selected:new Set(),names:true,order:createShopOrder(PHARMACY_DATA.products,playerMoney),receipt:null,error:''};
 pharmacySession.visible=true;clearKeys();
 $('pharmacy-shop').classList.remove('hidden');$('interior-dialog').classList.add('shop-open');$('interior-dialog').setAttribute('aria-describedby','shop-heading');
 $('shop-chemist-art').src=ASSETS['chemist-neutral'];
 $('consultation-art').src=ASSETS.pharmacyConsultation;$('basket-art').src=ASSETS.pharmacyBasket;
 $('symptom-atlas-image').setAttribute('href',ASSETS.pharmacySymptoms);
 $('pharmacy-checkout').innerHTML=shopActionArt()+'<span>Check out</span>';
 renderPharmacyShop();$('shop-heading').focus();
}
function closePharmacyShop(){
 if(!pharmacySession)return;
 pharmacySession.visible=false;$('pharmacy-shop').classList.add('hidden');$('interior-dialog').classList.remove('shop-open');$('interior-dialog').setAttribute('aria-describedby','chemist-greeting');
 clearKeys();$('chemist').focus();
}
function selectedPharmacySymptoms(){return PHARMACY_DATA.symptoms.filter(item=>pharmacySession.selected.has(item.id))}
function recommendedPharmacyProducts(){
 const ids=new Set(selectedPharmacySymptoms().map(item=>item.product));
 return PHARMACY_DATA.products.filter(product=>ids.has(product.id));
}
function symptomPicture(symptom){
 const frame=SYMPTOM_ATLAS.sprites.find(frame=>frame.id===symptom.sprite);
 return '<svg class="symptom-picture" viewBox="'+[frame.x,frame.y,frame.width,frame.height].join(' ')+'" aria-hidden="true"><use href="#symptom-atlas-image"/></svg>';
}
function productPicture(product){
 let shape;
 if(product.kind==='bottle')shape='<rect x="36" y="15" width="28" height="13" rx="3" fill="#e8d5aa"/><rect x="27" y="27" width="46" height="62" rx="10" fill="'+product.color+'"/><rect x="30" y="43" width="40" height="30" rx="3" fill="#fff4d9"/>';
 else if(product.kind==='tube')shape='<path d="M27 17H73L67 76H33Z" fill="'+product.color+'"/><rect x="34" y="76" width="32" height="13" rx="3" fill="#e8d5aa"/><path d="M30 37H70L68 61H32Z" fill="#fff4d9"/>';
 else shape='<rect x="17" y="22" width="66" height="61" rx="5" fill="#fff4d9"/><path d="M17 30Q17 22 25 22H75Q83 22 83 30V43H17Z" fill="'+product.color+'"/><path d="M25 70H75" stroke="'+product.color+'" stroke-width="4"/>';
 return '<svg class="product-picture" viewBox="0 0 100 100" aria-hidden="true"><g stroke="#506b58" stroke-width="2">'+shape+'</g><path d="M45 47H55V53H61V63H55V69H45V63H39V53H45Z" fill="#64866e"/></svg>';
}
function renderPharmacyShop(){
 const session=pharmacySession;if(!session)return;
 const choosing=session.phase==='symptoms',receipt=session.phase==='receipt';
 $('shop-heading').textContent=choosing?'I think I have …':receipt?'Thank you!':'What I would recommend';
 $('shop-names').classList.toggle('hidden',!choosing);
 $('shop-names').textContent='Names: '+(session.names?'on':'off');$('shop-names').setAttribute('aria-pressed',String(session.names));
 $('shop-scroll').classList.toggle('names-hidden',!session.names);
 $('shop-workspace').classList.toggle('has-basket',!choosing);
 $('shop-basket').classList.toggle('hidden',choosing);
 $('shop-chemist-speech').innerHTML=choosing?'<p>How are you feeling?</p><p class="shop-speech-hint">Choose one or more pictures.</p>':receipt?'<p>Thank you! Here is your order.</p>':selectedPharmacySymptoms().map(item=>'<p>'+item.recommendation+'</p>').join('');
 if(choosing){
  $('shop-scroll').innerHTML='<div class="symptom-grid">'+PHARMACY_DATA.symptoms.map(item=>'<button type="button" id="symptom-'+item.id+'" class="symptom-card" data-symptom="'+item.id+'" aria-label="'+item.statement+'" aria-pressed="false">'+symptomPicture(item)+'<span class="symptom-caption">'+item.statement+'</span><span class="symptom-check" aria-hidden="true">✓</span></button>').join('')+'</div>';
  $('shop-footer').innerHTML='<span id="symptom-selection-count" role="status" aria-live="polite"></span><button id="pharmacy-recommend" class="shop-action" data-shop-action="recommend">'+shopActionArt()+'<span>What would you recommend?</span></button>';
  refreshSymptomSelection();
 }else if(receipt){
  $('shop-scroll').innerHTML='<div class="shop-receipt"><div class="purchase-check" aria-hidden="true">✓</div><h3>Purchase complete</h3><ul>'+session.receipt.items.map(item=>'<li><span>'+item.name+'</span><strong>'+formatMoney(item.priceCents)+'</strong></li>').join('')+'</ul><p class="receipt-total">Paid <strong>'+formatMoney(session.receipt.totalCents)+'</strong></p><p>Money left: <strong>'+formatMoney(playerMoney.balanceCents)+'</strong></p></div>';
  $('shop-footer').innerHTML='<button class="shop-action" data-shop-action="new-order">'+shopActionArt()+'<span>Start a new order</span></button>';
 }else{
  $('shop-scroll').innerHTML='<p class="shop-instruction">Choose a product to add it to your basket.</p><div class="product-grid">'+recommendedPharmacyProducts().map(product=>'<button class="medicine-card" id="medicine-'+product.id+'" data-product="'+product.id+'" aria-label="Add '+product.name+' to basket, '+formatMoney(product.priceCents)+'">'+productPicture(product)+'<strong>'+product.name+'</strong><span class="product-description">'+product.description+'</span><b class="medicine-price">'+formatMoney(product.priceCents)+'</b><span class="product-add-state">Add to basket</span></button>').join('')+'</div>';
  $('shop-footer').innerHTML='<button class="shop-text-button" data-shop-action="change-symptoms">← Change symptoms</button>';
 }
 $('shop-scroll').scrollTop=0;
 renderPharmacyBasket();
}
function refreshSymptomSelection(){
 const session=pharmacySession;
 for(const item of PHARMACY_DATA.symptoms){const button=$('symptom-'+item.id),selected=session.selected.has(item.id);button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected))}
 const count=session.selected.size;
 $('symptom-selection-count').textContent=count?count+' symptom'+(count===1?'':'s')+' selected':'Choose at least one symptom';
 $('pharmacy-recommend').disabled=!count;
}
function renderPharmacyBasket(){
 const session=pharmacySession;if(!session)return;
 const order=session.order,items=order.items,total=order.totalCents;
 $('basket-items').innerHTML=items.length?items.map(item=>'<li><span><strong>'+item.name+'</strong><span>'+formatMoney(item.priceCents)+'</span></span><button class="remove-medicine" data-remove-product="'+item.id+'" aria-label="Remove '+item.name+' from basket">×</button></li>').join(''):'<li class="empty-basket">Your basket is empty.</li>';
 $('basket-total').textContent=formatMoney(total);
 $('basket-count').textContent=items.length+' item'+(items.length===1?'':'s');
 $('pharmacy-checkout').disabled=!items.length||session.phase==='receipt';
 $('pharmacy-checkout').setAttribute('aria-label','Check out for '+formatMoney(total));
 $('basket-message').textContent=session.error||'';
 $('basket-message').classList.toggle('shop-error',!!session.error);
 for(const product of recommendedPharmacyProducts()){
  const button=$('medicine-'+product.id);if(!button)continue;
  button.classList.toggle('in-basket',order.has(product.id));button.setAttribute('aria-pressed',String(order.has(product.id)));
  const state=button.querySelector?.('.product-add-state');if(state)state.textContent=order.has(product.id)?'In basket ✓':'Add to basket';
 }
}
function requestPharmacyRecommendations(){
 if(!pharmacyShopVisible()||pharmacySession.phase!=='symptoms'||!pharmacySession.selected.size)return;
 // Remove products no longer recommended after a change of symptoms.
 const allowed=new Set(recommendedPharmacyProducts().map(item=>item.id));
 for(const item of pharmacySession.order.items)if(!allowed.has(item.id))pharmacySession.order.remove(item.id);
 pharmacySession.phase='recommendations';pharmacySession.error='';renderPharmacyShop();$('shop-heading').focus();
}
function addPharmacyProduct(id){
 if(!pharmacyShopVisible()||pharmacySession.phase!=='recommendations'||!recommendedPharmacyProducts().some(product=>product.id===id))return;
 const added=pharmacySession.order.add(id);pharmacySession.error='';renderPharmacyBasket();
 if(added)$('shop-live').textContent=PHARMACY_DATA.products.find(product=>product.id===id).name+' added to your basket. Total '+formatMoney(pharmacySession.order.totalCents)+'.';
}
function checkoutPharmacy(){
 if(!pharmacyShopVisible()||pharmacySession.phase!=='recommendations')return;
 const result=pharmacySession.order.checkout();
 if(!result.ok){
  pharmacySession.error=result.reason==='funds'?'Not enough money. You need '+formatMoney(pharmacySession.order.totalCents)+', but you have '+formatMoney(playerMoney.balanceCents)+'. Remove an item to reduce the total.':'Add a product to your basket first.';
  renderPharmacyBasket();return;
 }
 recordInteraction('purchase');
 pharmacySession.receipt=result.receipt;pharmacySession.phase='receipt';pharmacySession.error='';renderPharmacyShop();
 $('shop-live').textContent='Purchase complete. Paid '+formatMoney(result.receipt.totalCents)+'. Money left '+formatMoney(playerMoney.balanceCents)+'.';$('shop-heading').focus();
}
function pharmacyShopClick(event){
 if(!pharmacyShopVisible())return;
 const symptom=event.target.closest('[data-symptom]');
 if(symptom&&pharmacySession.phase==='symptoms'){
  const id=symptom.dataset.symptom;if(!PHARMACY_DATA.symptoms.some(item=>item.id===id))return;
  pharmacySession.selected.has(id)?pharmacySession.selected.delete(id):pharmacySession.selected.add(id);refreshSymptomSelection();return;
 }
 const product=event.target.closest('[data-product]');if(product){addPharmacyProduct(product.dataset.product);return}
 const remove=event.target.closest('[data-remove-product]');
 if(remove){pharmacySession.order.remove(remove.dataset.removeProduct);pharmacySession.error='';renderPharmacyBasket();$('pharmacy-checkout').focus();return}
 const action=event.target.closest('[data-shop-action]')?.dataset.shopAction;
 if(action==='recommend')requestPharmacyRecommendations();
 if(action==='change-symptoms'){pharmacySession.phase='symptoms';renderPharmacyShop();$('shop-heading').focus()}
 if(action==='new-order'){
  pharmacySession.phase='symptoms';pharmacySession.selected.clear();pharmacySession.receipt=null;pharmacySession.error='';renderPharmacyShop();$('shop-heading').focus();
 }
 if(action==='back-counter')closePharmacyShop();
}
$('pharmacy-shop').addEventListener('click',pharmacyShopClick);
$('shop-names').addEventListener('click',()=>{
 if(!pharmacyShopVisible()||pharmacySession.phase!=='symptoms')return;
 pharmacySession.names=!pharmacySession.names;$('shop-scroll').classList.toggle('names-hidden',!pharmacySession.names);
 $('shop-names').textContent='Names: '+(pharmacySession.names?'on':'off');$('shop-names').setAttribute('aria-pressed',String(pharmacySession.names));
});
$('pharmacy-checkout').addEventListener('click',checkoutPharmacy);
