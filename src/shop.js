// Shared basket: one-of-each by default; groceries opt into quantities.
// Prices and totals are always integer cents.
function createShopOrder(products,account,options={}){
 const catalog=new Map();
 for(const product of products){
  if(!product.id||catalog.has(product.id)||!Number.isSafeInteger(product.priceCents)||product.priceCents<=0)throw new RangeError('Invalid shop catalog.');
  catalog.set(product.id,Object.freeze({...product}));
 }
 const cart=new Map(),limit=options.quantities?99:1;let checkingOut=false;
 const items=()=>[...cart].map(([id,quantity])=>options.quantities?{...catalog.get(id),quantity}:catalog.get(id));
 const total=()=>items().reduce((sum,item)=>sum+item.priceCents*(item.quantity||1),0);
 return Object.freeze({
  get items(){return items()},get totalCents(){return total()},
  has(id){return cart.has(id)},
  quantity(id){return cart.get(id)||0},
  add(id){
   if(checkingOut||!catalog.has(id)||(cart.get(id)||0)>=limit)return false;
   if(!Number.isSafeInteger(total()+catalog.get(id).priceCents))throw new RangeError('Order total is too large.');
   cart.set(id,(cart.get(id)||0)+1);return true;
  },
  remove(id){return !checkingOut&&cart.delete(id)},
  decrease(id){
   if(checkingOut||!cart.has(id))return false;
   const quantity=cart.get(id);if(quantity===1)cart.delete(id);else cart.set(id,quantity-1);return true;
  },
  checkout(){
   if(checkingOut)return {ok:false,reason:'busy'};
   if(!cart.size)return {ok:false,reason:'empty'};
   const receipt={items:items(),totalCents:total()};checkingOut=true;
   try{
    if(!account.debit(receipt.totalCents/100))return {ok:false,reason:'funds'};
    cart.clear();return {ok:true,receipt};
   }finally{checkingOut=false}
  }
 });
}
