// Amounts are stored as integer cents; game events pass dollar amounts.
const INITIAL_MONEY_CENTS=10000;
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
function createMoneyAccount(savedCents,onChange=()=>{}){
 let cents=validMoneyCents(savedCents)?savedCents:INITIAL_MONEY_CENTS;
 return Object.freeze({
  get balanceCents(){return cents},
  canAfford(amount){return dollarsToCents(amount)<=cents},
  credit(amount){
   const addition=dollarsToCents(amount);
   if(!Number.isSafeInteger(cents+addition))throw new RangeError('Money balance is too large.');
   if(addition){cents+=addition;onChange(cents)}
   return cents;
  },
  debit(amount){
   const cost=dollarsToCents(amount);
   if(cost>cents)return false;
   if(cost){cents-=cost;onChange(cents)}
   return true;
  }
 });
}
function renderMoney(){
 const text=formatMoney(playerMoney.balanceCents);
 $('money-balance').textContent=text;
 $('money-panel').classList.toggle('money-long',text.length>13);
}
