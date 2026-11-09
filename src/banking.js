// Game banking model. Wallet and bank are distinct; only scheduled bills allow debt.
const INITIAL_BANK_CENTS=50000,INTERACTIONS_PER_MONTH=10;
const HOUSE_CATALOG=[
 {id:'bakers',priceCents:28500000}, {id:'johnsons',priceCents:42500000},
 {id:'millers',priceCents:34500000}, {id:'wilsons',priceCents:51000000}
];
const MORTGAGE_PLANS=[
 {id:'15-year',years:15,annualBps:500},
 {id:'20-year',years:20,annualBps:550},
 {id:'30-year',years:30,annualBps:600}
];
const CALENDAR_ACTIONS=new Set(['entrance','directions','travel','purchase','atm','mortgage','mortgage-payment']);
function mortgagePayment(principalCents,annualBps,months){
 if(!Number.isSafeInteger(principalCents)||principalCents<=0||!Number.isSafeInteger(annualBps)||annualBps<0||!Number.isSafeInteger(months)||months<=0)throw new RangeError('Invalid mortgage terms.');
 const rate=annualBps/120000;
 return Math.round(rate?principalCents*rate/(1-Math.pow(1+rate,-months)):principalCents/months);
}
function mortgageInstallment(loan){
 const interestCents=Math.round(loan.principalCents*loan.annualBps/120000);
 const amountCents=loan.paymentsMade>=loan.termMonths-1?loan.principalCents+interestCents:Math.min(loan.paymentCents,loan.principalCents+interestCents);
 return {amountCents,interestCents,principalCents:amountCents-interestCents};
}
function validBankCents(value){return Number.isSafeInteger(value)}
function createBanking(saved,wallet,onChange=()=>{}){
 saved=saved&&typeof saved==='object'?saved:{};
 let interactions=Number.isSafeInteger(saved.interactions)&&saved.interactions>=0&&saved.interactions<=1000000?saved.interactions:0;
 const month=()=>Math.floor(interactions/INTERACTIONS_PER_MONTH),loans=[];
 const bank=createMoneyAccount(validBankCents(saved.bankCents)?saved.bankCents:INITIAL_BANK_CENTS,onChange,{allowDebt:true,initialCents:INITIAL_BANK_CENTS});
 for(const record of Array.isArray(saved.mortgages)?saved.mortgages:[]){
  if(!record||loans.some(loan=>loan.houseId===record.houseId))continue;
  const house=HOUSE_CATALOG.find(item=>item.id===record.houseId),plan=MORTGAGE_PLANS.find(item=>item.id===record.planId);
  if(!house||!plan)continue;
  const termMonths=plan.years*12,paymentCents=mortgagePayment(house.priceCents,plan.annualBps,termMonths);
  if(!validMoneyCents(record.principalCents)||record.principalCents>house.priceCents||!Number.isSafeInteger(record.paymentsMade)||record.paymentsMade<0||record.paymentsMade>termMonths||!Number.isSafeInteger(record.nextDueMonth)||record.nextDueMonth<(record.principalCents?month()+1:0)||record.nextDueMonth>month()+2||!validMoneyCents(record.interestPaidCents))continue;
  if((record.principalCents===0)!==(record.paymentsMade===termMonths))continue;
  loans.push({houseId:house.id,planId:plan.id,originalCents:house.priceCents,principalCents:record.principalCents,annualBps:plan.annualBps,termMonths,paymentCents,paymentsMade:record.paymentsMade,nextDueMonth:record.nextDueMonth,interestPaidCents:record.interestPaidCents,history:Array.isArray(record.history)?record.history.filter(row=>row&&Number.isSafeInteger(row.month)&&row.month>=0&&row.month<=month()&&validMoneyCents(row.amountCents)&&['manual','automatic'].includes(row.kind)).slice(-12).map(row=>({month:row.month,amountCents:row.amountCents,kind:row.kind})):[]});
 }
 function collect(loan,kind,atMonth){
  const installment=mortgageInstallment(loan);
  if(!Number.isSafeInteger(bank.balanceCents-installment.amountCents))throw new RangeError('Bank balance is too large.');
  loan.principalCents-=installment.principalCents;loan.interestPaidCents+=installment.interestCents;loan.paymentsMade++;loan.nextDueMonth++;
  if(!loan.principalCents)loan.paymentsMade=loan.termMonths;
  loan.history.push({month:atMonth,kind,amountCents:installment.amountCents});loan.history=loan.history.slice(-12);
  collectScheduledPayment(bank,installment.amountCents);
  return installment.amountCents;
 }
 function advance(action){
  if(!CALENDAR_ACTIONS.has(action))return false;
  interactions++;
  if(interactions%INTERACTIONS_PER_MONTH===0)for(const loan of loans)if(loan.principalCents>0&&loan.nextDueMonth<=month())collect(loan,'automatic',month());
  notifyMoney(onChange);return true;
 }
 return Object.freeze({
  bank,
  get month(){return month()},get interactions(){return interactions},
  get mortgages(){return loans.map(loan=>({...loan,history:loan.history.map(row=>({...row}))}))},
  snapshot(){return {bankCents:bank.balanceCents,interactions,mortgages:loans.map(loan=>({...loan,history:loan.history.map(row=>({...row}))}))}},
  interact(action){return batchMoneyChanges(()=>advance(action))},
  transfer(mode,amount){
   if(!['withdraw','deposit'].includes(mode))throw new RangeError('Choose withdrawal or deposit.');
   return batchMoneyChanges(()=>{
    const ok=transferMoney(mode==='withdraw'?bank:wallet,mode==='withdraw'?wallet:bank,amount);
    if(ok)advance('atm');return ok;
   });
  },
  sign(houseId,planId){
   const house=HOUSE_CATALOG.find(item=>item.id===houseId),plan=MORTGAGE_PLANS.find(item=>item.id===planId);
   if(!house||!plan||loans.some(loan=>loan.houseId===houseId))return false;
   return batchMoneyChanges(()=>{
    loans.push({houseId,planId,originalCents:house.priceCents,principalCents:house.priceCents,annualBps:plan.annualBps,termMonths:plan.years*12,paymentCents:mortgagePayment(house.priceCents,plan.annualBps,plan.years*12),paymentsMade:0,nextDueMonth:month()+1,interestPaidCents:0,history:[]});
    advance('mortgage');return true;
   });
  },
  pay(houseId){
   const loan=loans.find(item=>item.houseId===houseId);
   if(!loan||!loan.principalCents||loan.nextDueMonth>month()+1)return {ok:false,reason:'paid'};
   const cost=mortgageInstallment(loan).amountCents;
   if(cost>bank.balanceCents)return {ok:false,reason:'funds'};
   return batchMoneyChanges(()=>{collect(loan,'manual',month());advance('mortgage-payment');return {ok:true,amountCents:cost}});
  }
 });
}
