// Shared one-of-each-product basket. Prices and totals are always integer cents.
function createShopOrder(products,account){
 const catalog=new Map();
 for(const product of products){
  if(!product.id||catalog.has(product.id)||!Number.isSafeInteger(product.priceCents)||product.priceCents<=0)throw new RangeError('Invalid shop catalog.');
  catalog.set(product.id,Object.freeze({...product}));
 }
 const cart=new Set();let checkingOut=false;
 const items=()=>[...cart].map(id=>catalog.get(id));
 const total=()=>items().reduce((sum,item)=>sum+item.priceCents,0);
 return Object.freeze({
  get items(){return items()},get totalCents(){return total()},
  has(id){return cart.has(id)},
  add(id){
   if(checkingOut||!catalog.has(id)||cart.has(id))return false;
   if(!Number.isSafeInteger(total()+catalog.get(id).priceCents))throw new RangeError('Order total is too large.');
   cart.add(id);return true;
  },
  remove(id){return !checkingOut&&cart.delete(id)},
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
