const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const ctx=vm.createContext({assert});
for(const file of ['money','banking'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/'+file+'.js'),'utf8'),ctx);
vm.runInContext(`
const wallet=createMoneyAccount();let observations=[];
const finance=createBanking(null,wallet,()=>observations.push(finance.snapshot()));
assert.equal(finance.bank.balanceCents,50000);assert.equal(wallet.balanceCents,10000);
assert(finance.transfer('withdraw',50.25));assert.equal(finance.bank.balanceCents,44975);assert.equal(wallet.balanceCents,15025);
assert(finance.transfer('deposit',25.10));assert.equal(finance.bank.balanceCents,47485);assert.equal(wallet.balanceCents,12515);
assert.equal(finance.bank.balanceCents+wallet.balanceCents,60000);
assert(!finance.transfer('withdraw',500));assert(!finance.transfer('deposit',126));assert.equal(finance.interactions,2);
for(const invalid of [0,-1,NaN,Infinity,.001,'10'])assert.throws(()=>finance.transfer('deposit',invalid),RangeError);
assert.equal(finance.interactions,2);
assert.equal(createBanking({bankCents:0},wallet).bank.balanceCents,0);
assert.equal(createBanking({bankCents:-12345},wallet).bank.balanceCents,-12345);
for(const invalid of [null,'500',1.5,Infinity,NaN,Number.MAX_SAFE_INTEGER+1])assert.equal(createBanking({bankCents:invalid},wallet).bank.balanceCents,50000);
assert.equal(mortgagePayment(10000000,600,360),59955);
assert.equal(mortgagePayment(12000,0,12),1000);
assert.equal(finance.sign('not-a-house','15-year'),false);assert.equal(finance.sign('millers','bad-plan'),false);
assert(finance.sign('millers','30-year'));assert(!finance.sign('millers','15-year'));assert.equal(finance.interactions,3);
const loan=finance.mortgages[0],payment=loan.paymentCents;
assert.equal(loan.originalCents,34500000);assert.equal(loan.nextDueMonth,1);assert.equal(finance.month,0);
assert.deepEqual(finance.pay('millers'),{ok:false,reason:'funds'});assert.equal(finance.interactions,3);
while(finance.interactions<10)finance.interact('directions');
assert.equal(finance.month,1);assert.equal(finance.bank.balanceCents,47485-payment);assert(finance.bank.balanceCents<0);
assert.equal(finance.mortgages[0].paymentsMade,1);assert.equal(finance.mortgages[0].history[0].kind,'automatic');assert.equal(wallet.balanceCents,12515);
const snap=finance.snapshot(),restored=createBanking(JSON.parse(JSON.stringify(snap)),wallet);
assert.deepEqual(restored.snapshot(),snap);
assert(!finance.transfer('withdraw',1));assert(finance.transfer('deposit',100));assert.equal(finance.bank.balanceCents,57485-payment);
// Manual payment before rollover covers exactly the upcoming installment.
const funded=createBanking({bankCents:10000000},createMoneyAccount());funded.sign('bakers','15-year');
const installment=funded.mortgages[0].paymentCents;
assert(funded.pay('bakers').ok);assert.equal(funded.bank.balanceCents,10000000-installment);
assert.equal(funded.pay('bakers').reason,'paid');assert.equal(funded.interactions,2);
while(funded.interactions<10)funded.interact('entrance');
assert.equal(funded.bank.balanceCents,10000000-installment);assert.equal(funded.mortgages[0].paymentsMade,1);
assert(funded.pay('bakers').ok);assert.equal(funded.mortgages[0].paymentsMade,2);
while(funded.interactions<20)funded.interact('purchase');
assert.equal(funded.bank.balanceCents,10000000-installment*2);
// Manual payment as interaction #10 must not also auto-charge that mortgage.
const boundary=createBanking({bankCents:10000000},createMoneyAccount());boundary.sign('wilsons','20-year');
while(boundary.interactions<9)boundary.interact('directions');
const before=boundary.bank.balanceCents;assert(boundary.pay('wilsons').ok);
assert.equal(boundary.month,1);assert.equal(boundary.mortgages[0].paymentsMade,1);assert.equal(boundary.bank.balanceCents,before-boundary.mortgages[0].paymentCents);
// Multiple loans and full amortization, with rounded final installment.
const portfolio=createBanking(null,createMoneyAccount());
for(let i=0;i<HOUSE_CATALOG.length;i++)assert(portfolio.sign(HOUSE_CATALOG[i].id,MORTGAGE_PLANS[i%3].id));
let expected=50000;
while(portfolio.month<361){
 const at=portfolio.month;
 for(let i=0;i<10;i++)portfolio.interact('travel');
 for(const row of portfolio.mortgages)for(const item of row.history)if(item.kind==='automatic'&&item.month>at&&item.month<=portfolio.month)expected-=item.amountCents;
}
assert.equal(portfolio.bank.balanceCents,expected);
assert(portfolio.mortgages.every(row=>row.principalCents===0&&row.paymentsMade===row.termMonths));
const paidReload=createBanking(JSON.parse(JSON.stringify(portfolio.snapshot())),createMoneyAccount());
assert.equal(paidReload.mortgages.length,4);assert(paidReload.mortgages.every(row=>row.principalCents===0));assert(!paidReload.sign('millers','15-year'));
const frozen=portfolio.snapshot();for(let i=0;i<10;i++)portfolio.interact('entrance');assert.equal(portfolio.bank.balanceCents,frozen.bankCents);
// Returned records are snapshots; outsiders cannot modify saved debt.
const copy=funded.mortgages;copy[0].principalCents=0;copy[0].history[0].amountCents=0;
assert(funded.mortgages[0].principalCents>0);assert(funded.mortgages[0].history[0].amountCents>0);
const count=finance.interactions;assert(!finance.interact('menu'));assert.equal(finance.interactions,count);
// Notifications see BOTH the transferred wallet and final calendar/bank state.
let check;const observedWallet=createMoneyAccount(10000,()=>check());const coherent=createBanking(null,observedWallet,()=>check());
check=()=>{assert.equal(observedWallet.balanceCents+coherent.bank.balanceCents,60000);assert.equal(coherent.interactions,1)};
coherent.transfer('deposit',10);
const full=createMoneyAccount(Number.MAX_SAFE_INTEGER),safeBank=createBanking(null,full);
assert.throws(()=>safeBank.transfer('withdraw',1),RangeError);assert.equal(safeBank.bank.balanceCents,50000);assert.equal(safeBank.interactions,0);
`,ctx);
console.log('PASS: separate saved bank/wallet, exact atomic transfers, migration/debt, mortgage quotes/ownership, manual and automatic monthly timing, multiple full amortizations, no repeat charges, payoff reload and coherent observations');
