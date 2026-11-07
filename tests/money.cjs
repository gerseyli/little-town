const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx=vm.createContext({assert});
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../src/money.js'),'utf8'),ctx);
vm.runInContext(`
for(const saved of [undefined,null,-1,1.5,NaN,Infinity,'10000',{},Number.MAX_SAFE_INTEGER+1])assert.equal(createMoneyAccount(saved).balanceCents,10000);
assert.equal(createMoneyAccount(0).balanceCents,0);
assert.equal(createMoneyAccount(12345).balanceCents,12345);
let changes=[];
const account=createMoneyAccount(undefined,value=>changes.push(value));
assert.equal(account.balanceCents,10000);
assert.equal(account.credit(25),12500);
assert(account.debit(12.50));assert.equal(account.balanceCents,11250);
assert(!account.canAfford(113));assert(account.canAfford(112.50));
assert(!account.debit(113));assert.equal(account.balanceCents,11250);
assert.deepEqual(changes,[12500,11250]);
assert(account.debit(112.50));assert.equal(account.balanceCents,0);
assert(account.debit(0));assert.equal(account.credit(0),0);assert.equal(changes.length,3);
for(let i=0;i<100;i++)account.credit(.01);
assert.equal(account.balanceCents,100);
for(const invalid of [-1,NaN,Infinity,'5',null,{},.001,1.234,Number.MAX_VALUE]){
 for(const method of ['credit','debit','canAfford'])assert.throws(()=>account[method](invalid),RangeError);
 assert.equal(account.balanceCents,100);
}
const full=createMoneyAccount(Number.MAX_SAFE_INTEGER);
assert.throws(()=>full.credit(.01),RangeError);assert.equal(full.balanceCents,Number.MAX_SAFE_INTEGER);
assert(Object.isFrozen(account));
assert.equal(formatMoney(10000),'$100');assert.equal(formatMoney(0),'$0');
assert.equal(formatMoney(12345),'$123.45');assert.equal(formatMoney(123450000),'$1,234,500');
`,ctx);
console.log('PASS: $100 default, validated cents, atomic earnings/spending, zero balance, insufficient funds, exact cents, overflow and dollar formatting');
