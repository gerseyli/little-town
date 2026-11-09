const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'src/grocery-data.json')));
assert.equal(data.products.length,24);assert.equal(new Set(data.products.map(item=>item.id)).size,24);
for(const sheet of ['pantry1','pantry2','fresh']){
 const items=data.products.filter(item=>item.sheet===sheet);assert.equal(items.length,8);
 assert.deepEqual(items.map(item=>item.frame).sort(),[0,1,2,3,4,5,6,7]);assert(data.sheets[sheet].width>1500);
}
for(const item of data.products){assert(item.phrase&&item.plural&&Number.isSafeInteger(item.priceCents)&&item.priceCents>0);assert(!/\b(this|that|these|those)\b/i.test(item.phrase))}
for(const type of ['a can of','a packet of','a bag of','a tub of','a jar of','a bottle of','a carton of','a box of'])assert(data.products.some(item=>item.container===type));
assert.equal(data.products.filter(item=>!item.container).length,4);
const ctx=vm.createContext({assert,products:data.products});
for(const file of ['money','shop','banking'])vm.runInContext(fs.readFileSync(path.join(root,'src/'+file+'.js'),'utf8'),ctx);
vm.runInContext(`
const wallet=createMoneyAccount(),banking=createBanking(null,wallet),cart=createShopOrder(products,wallet,{quantities:true});
assert(cart.add('beans'));assert(cart.add('beans'));assert(cart.add('apple'));assert.equal(cart.quantity('beans'),2);assert.equal(cart.totalCents,585);
const copy=cart.items;copy[0].quantity=90;copy[0].priceCents=1;assert.equal(cart.totalCents,585);
assert(cart.decrease('beans'));assert.equal(cart.quantity('beans'),1);assert(cart.remove('apple'));assert.equal(cart.totalCents,250);
const receipt=cart.checkout();assert(receipt.ok);assert.equal(receipt.receipt.items[0].quantity,1);assert.equal(receipt.receipt.totalCents,250);assert.equal(wallet.balanceCents,9750);assert.equal(banking.bank.balanceCents,50000);
assert(!cart.checkout().ok);assert.equal(wallet.balanceCents,9750);assert(!cart.decrease('missing'));
for(let i=0;i<99;i++)assert(cart.add('honey'));assert(!cart.add('honey'));assert.equal(cart.quantity('honey'),99);
const before=wallet.balanceCents;assert.equal(cart.checkout().reason,'funds');assert.equal(wallet.balanceCents,before);assert.equal(cart.quantity('honey'),99);
assert(cart.remove('honey'));assert(!cart.add('unknown'));assert(!cart.has('honey'));
cart.add('carrot');assert(cart.decrease('carrot'));assert.equal(cart.quantity('carrot'),0);
// Pharmacy remains one-of-each, while groceries explicitly permit quantities.
const pharmacy=createShopOrder(products,wallet);assert(pharmacy.add('beans'));assert(!pharmacy.add('beans'));assert(!('quantity' in pharmacy.items[0]));
`,ctx);
const maps=JSON.parse(fs.readFileSync(path.join(root,'src/maps.json')));
assert.equal(maps.town.places.find(place=>place.id==='supermarket').name,'Grocery store');
assert.equal(maps.town.paths.find(item=>item.id==='supermarket-entrance').name,'Grocery store entrance');
console.log('PASS: 24 food/sprite/vocabulary mappings, renamed store, quantity cart totals/snapshots, funds/removal/repeat guards, shared wallet and unchanged pharmacy deduplication');
