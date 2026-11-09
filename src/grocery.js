/* GROCERY DATA */
let grocerySession=null;
function groceryShopVisible(){return !!grocerySession?.visible}
function resetGroceryShop(){
 grocerySession=null;$('grocery-shop').classList.add('hidden');$('interior-dialog').classList.remove('grocery-open');
}
function openGroceryShop(){
 if(activeInterior?.entry.place!=='supermarket')return;
 if(!grocerySession)grocerySession={visible:true,phase:'shopping',group:'all',names:true,order:createShopOrder(GROCERY_DATA.products,playerMoney,{quantities:true}),receipt:null,message:'',speech:'Hello! What would you like?'};
 grocerySession.visible=true;clearKeys();$('grocery-shop').classList.remove('hidden');$('interior-dialog').classList.add('grocery-open');
 $('interior-dialog').setAttribute('aria-describedby','grocery-heading');$('grocer-portrait').src=ASSETS['grocery-assistant'];
 for(const name of ['pantry1','pantry2','fresh']){const image=$('grocery-atlas-'+name),sheet=GROCERY_DATA.sheets[name];image.setAttribute('href',ASSETS['grocery-'+name]);image.setAttribute('width',sheet.width);image.setAttribute('height',sheet.height)}
 renderGrocery();$('grocery-heading').focus();
}
function closeGroceryShop(){
 if(!grocerySession)return;
 grocerySession.visible=false;$('grocery-shop').classList.add('hidden');$('interior-dialog').classList.remove('grocery-open');
 $('interior-dialog').setAttribute('aria-describedby','chemist-greeting');clearKeys();$('chemist').focus();
}
function groceryPicture(product){
 const sheet=GROCERY_DATA.sheets[product.sheet],w=sheet.width/4,h=sheet.height/2;
 return '<svg class="food-picture" viewBox="'+[(product.frame%4)*w,Math.floor(product.frame/4)*h,w,h].join(' ')+'" aria-hidden="true"><use href="#grocery-atlas-'+product.sheet+'"/></svg>';
}
function groceryPhrase(product,quantity=1){return quantity===1?product.phrase:quantity+' '+product.plural}
function foodLabel(product){return product.container?'<b class="food-container">'+product.container+'</b> '+product.food:product.phrase}
function renderGrocery(){
 const session=grocerySession;if(!session)return;
 $('grocery-category').value=session.group;
 $('grocer-speech').textContent=session.speech;
 $('grocery-names').textContent='Names: '+(session.names?'on':'off');$('grocery-names').setAttribute('aria-pressed',String(session.names));
 $('grocery-names').classList.toggle('hidden',session.phase==='receipt');$('grocery-category-label').classList.toggle('hidden',session.phase==='receipt');
 $('grocery-heading').textContent=session.phase==='receipt'?'Thank you for shopping!':'I’d like …, please.';
 $('grocery-scroll').classList.toggle('food-names-hidden',!session.names);
 if(session.phase==='receipt'){
  $('grocery-scroll').innerHTML='<div class="grocery-receipt"><div class="purchase-check" aria-hidden="true">✓</div><h3>Purchase complete</h3><ul>'+session.receipt.items.map(item=>'<li><span>'+groceryPhrase(item,item.quantity)+'</span><strong>'+formatMoney(item.priceCents*item.quantity)+'</strong></li>').join('')+'</ul><p class="receipt-total">Paid <strong>'+formatMoney(session.receipt.totalCents)+'</strong></p><p>Wallet money left: <strong>'+formatMoney(playerMoney.balanceCents)+'</strong></p><button class="grocery-action" data-grocery-action="new-order">Start a new order</button></div>';
 }else{
  const products=GROCERY_DATA.products.filter(product=>session.group==='all'||product.group===session.group);
  $('grocery-scroll').innerHTML='<p class="grocery-hint">Choose your food. Practise the words in green: a can of, a packet of, a bag of, a tub of …</p><div class="food-grid">'+products.map(product=>'<button class="food-card" data-grocery-product="'+product.id+'" aria-label="I would like '+product.phrase+', please. '+formatMoney(product.priceCents)+' each.">'+groceryPicture(product)+'<span class="food-name">'+foodLabel(product)+'</span><strong class="food-price">'+formatMoney(product.priceCents)+'</strong><span class="food-add-label">Add to basket</span></button>').join('')+'</div>';
 }
 renderGroceryBasket();
}
function renderGroceryBasket(){
 const session=grocerySession;if(!session)return;
 const items=session.order.items,total=session.order.totalCents,count=items.reduce((sum,item)=>sum+item.quantity,0);
 $('grocery-basket-items').innerHTML=items.length?items.map(item=>'<li><div><strong>'+groceryPhrase(item,item.quantity)+'</strong><span>'+formatMoney(item.priceCents*item.quantity)+'</span></div><div class="grocery-quantity"><button data-grocery-decrease="'+item.id+'" aria-label="Remove one '+item.phrase+'">−</button><output aria-label="Quantity">'+item.quantity+'</output><button data-grocery-increase="'+item.id+'" aria-label="Add one '+item.phrase+'" '+(item.quantity>=99?'disabled':'')+'>+</button><button class="grocery-remove" data-grocery-remove="'+item.id+'" aria-label="Remove all '+item.plural+'">Remove</button></div></li>').join(''):'<li class="empty-grocery-basket">Your basket is empty.</li>';
 $('grocery-total').textContent=formatMoney(total);$('grocery-count').textContent=count+' item'+(count===1?'':'s');
 $('grocery-wallet').textContent=formatMoney(playerMoney.balanceCents);$('grocery-checkout').disabled=!items.length||session.phase==='receipt';
 $('grocery-checkout').setAttribute('aria-label','Check out for '+formatMoney(total));$('grocery-message').textContent=session.message;
 for(const product of GROCERY_DATA.products){
  const button=$('grocery-scroll').querySelector?.('[data-grocery-product="'+product.id+'"]');if(!button)continue;
  const quantity=session.order.quantity(product.id);button.classList.toggle('food-in-basket',!!quantity);
  const label=button.querySelector('.food-add-label');if(label)label.textContent=quantity?quantity+' in basket · Add another':'Add to basket';
  button.disabled=quantity>=99;
 }
}
function addGroceryProduct(id){
 const session=grocerySession;if(!groceryShopVisible()||session.phase!=='shopping')return;
 const product=GROCERY_DATA.products.find(product=>product.id===id);if(!product||!session.order.add(id))return;
 session.message='';session.speech='“I’d like '+product.phrase+', please.” — Of course! Here you are.';
 $('grocer-speech').textContent=session.speech;$('grocery-live').textContent=product.phrase+' added to your basket.';renderGroceryBasket();
}
function checkoutGrocery(){
 const session=grocerySession;if(!groceryShopVisible()||session.phase!=='shopping')return;
 const result=session.order.checkout();
 if(!result.ok){session.message=result.reason==='funds'?'Not enough wallet money. Remove an item or withdraw money at the bank.':'Choose some food first.';renderGroceryBasket();return}
 recordInteraction('purchase');session.receipt=result.receipt;session.phase='receipt';session.message='';session.speech='Thank you! Enjoy your groceries.';
 renderGrocery();$('grocery-live').textContent='Purchase complete. Paid '+formatMoney(result.receipt.totalCents)+'.';$('grocery-heading').focus();
}
function groceryClick(event){
 if(!groceryShopVisible())return;
 const session=grocerySession,action=event.target.closest('[data-grocery-action]')?.dataset.groceryAction;
 if(action==='back-counter'){closeGroceryShop();return}
 if(action==='new-order'&&session.phase==='receipt'){
  session.phase='shopping';session.receipt=null;session.speech='What else would you like?';session.message='';renderGrocery();$('grocery-heading').focus();return;
 }
 if(session.phase!=='shopping')return;
 const product=event.target.closest('[data-grocery-product]')?.dataset.groceryProduct,increase=event.target.closest('[data-grocery-increase]')?.dataset.groceryIncrease;
 if(product||increase){addGroceryProduct(product||increase);if(increase)$('grocery-basket-items').querySelector('[data-grocery-increase="'+increase+'"]').focus();return}
 const decrease=event.target.closest('[data-grocery-decrease]')?.dataset.groceryDecrease,remove=event.target.closest('[data-grocery-remove]')?.dataset.groceryRemove;
 if(decrease||remove){decrease?session.order.decrease(decrease):session.order.remove(remove);session.message='';renderGroceryBasket();$('grocery-checkout').disabled?$('grocery-heading').focus():$('grocery-checkout').focus()}
}
$('grocery-shop').addEventListener('click',groceryClick);
$('grocery-checkout').addEventListener('click',checkoutGrocery);
$('grocery-category').addEventListener('change',()=>{
 if(!groceryShopVisible()||grocerySession.phase!=='shopping')return;
 const group=$('grocery-category').value;if(!['all','cans-jars','packets-bags','dairy-drinks','bakery','produce'].includes(group))return;
 grocerySession.group=group;renderGrocery();$('grocery-scroll').scrollTop=0;
});
$('grocery-names').addEventListener('click',()=>{if(groceryShopVisible()&&grocerySession.phase==='shopping'){grocerySession.names=!grocerySession.names;renderGrocery()}});
