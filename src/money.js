// Amounts are stored as integer cents; game events pass dollar amounts.
const INITIAL_MONEY_CENTS=10000;
const moneyAccounts=new WeakMap(),moneyNotifications=new Set();
let moneyBatchDepth=0;
function notifyMoney(callback){if(moneyBatchDepth)moneyNotifications.add(callback);else callback()}
function batchMoneyChanges(action){
 moneyBatchDepth++;
 try{return action()}finally{if(!--moneyBatchDepth){const callbacks=[...moneyNotifications];moneyNotifications.clear();callbacks.forEach(callback=>callback())}}
}
function validMoneyCents(value){return Number.isSafeInteger(value)&&value>=0}
function dollarsToCents(amount){
 if(typeof amount!=='number'||!Number.isFinite(amount)||amount<0)throw new RangeError('Money must be a non-negative dollar amount.');
 const cents=Math.round(amount*100);
 if(!validMoneyCents(cents)||Math.abs(amount*100-cents)>.000001)throw new RangeError('Money must have at most two decimal places.');
 return cents;
}
function formatMoney(cents){
 return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:cents%100?2:0,maximumFractionDigits:2}).format(cents/100);
}
function createMoneyAccount(savedCents,onChange=()=>{},options={}){
 const signed=options.allowDebt===true,valid=value=>Number.isSafeInteger(value)&&(signed||value>=0);
 const state={cents:valid(savedCents)?savedCents:(options.initialCents??INITIAL_MONEY_CENTS),onChange,signed};
 const changed=()=>notifyMoney(()=>onChange(state.cents));
 const account=Object.freeze({
  get balanceCents(){return state.cents},
  canAfford(amount){return dollarsToCents(amount)<=state.cents},
  credit(amount){
   const addition=dollarsToCents(amount);
   if(!Number.isSafeInteger(state.cents+addition))throw new RangeError('Money balance is too large.');
   if(addition){state.cents+=addition;changed()}
   return state.cents;
  },
  debit(amount){
   const cost=dollarsToCents(amount);
   if(cost>state.cents)return false;
   if(cost){state.cents-=cost;changed()}
   return true;
  }
 });
 moneyAccounts.set(account,state);return account;
}
function transferMoney(from,to,amount){
 const cents=dollarsToCents(amount),source=moneyAccounts.get(from),target=moneyAccounts.get(to);
 if(!source||!target||from===to||!cents)throw new RangeError('Choose two accounts and a positive amount.');
 if(source.cents<cents)return false;
 if(!Number.isSafeInteger(target.cents+cents))throw new RangeError('Money balance is too large.');
 // Both balances change before any observer can save or render them.
 source.cents-=cents;target.cents+=cents;
 batchMoneyChanges(()=>{notifyMoney(()=>source.onChange(source.cents));notifyMoney(()=>target.onChange(target.cents))});
 return true;
}
function collectScheduledPayment(account,cents){
 const state=moneyAccounts.get(account);
 if(!state?.signed||!validMoneyCents(cents)||!Number.isSafeInteger(state.cents-cents))throw new RangeError('Invalid scheduled payment.');
 state.cents-=cents;notifyMoney(()=>state.onChange(state.cents));
}
function renderMoney(){
 const text=formatMoney(playerMoney.balanceCents);
 $('money-balance').textContent=text;
 $('interior-money').textContent=text;
 $('money-panel').classList.toggle('money-long',text.length>13);
}
