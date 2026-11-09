let bankSession=null,bankAnimationTimer;
function bankViewVisible(){return !!bankSession}
function bankHere(){return activeInterior?.entry.place==='bank'}
function houseName(id){return MAPS.suburbs.places.find(place=>place.id===id)?.name||'House'}
function bankButton(action,label,extra=''){return '<button type="button" class="bank-button" data-bank-action="'+action+'" '+extra+'>'+label+'</button>'}
function bankBalance(cents){return '<strong class="'+(cents<0?'in-the-red':'')+'">'+formatMoney(cents)+'</strong>'}
function renderCalendar(){
 const text='Month '+(banking.month+1)+' · '+banking.interactions%10+'/10';
 $('calendar-hud').textContent=text;$('bank-calendar').textContent=text;
 $('calendar-hud').setAttribute('aria-label',text+' completed interactions. Ten interactions advance one month.');
}
function recordInteraction(action){banking.interact(action)}
function resetBank(){
 clearTimeout(bankAnimationTimer);bankSession=null;
 $('bank-cash-area').classList.remove('cash-withdraw','cash-deposit');
 $('bank-workspace').classList.add('hidden');$('bank-services').classList.add('hidden');
 $('interior-dialog').classList.remove('bank-open');
}
function showBankLobby(){
 resetBank();$('bank-services').classList.toggle('hidden',!bankHere());
}
function closeBankView(){
 if(!bankSession)return;
 const service=bankSession.service;showBankLobby();
 $('interior-dialog').setAttribute('aria-describedby','interior-title');
 $('bank-'+service).focus();
}
function openBankService(service){
 if(!bankHere()||!['atm','mortgages','loans','savings','investments'].includes(service))return;
 clearTimeout(bankAnimationTimer);bankSession={service,phase:'menu',mode:null,house:null,plan:null,message:'',animating:false};
 $('bank-workspace').classList.remove('hidden');$('interior-dialog').classList.add('bank-open');
 $('interior-dialog').setAttribute('aria-describedby','bank-heading');
 clearKeys();renderBank();$('bank-heading').focus();
 $('interior-dialog').dispatchEvent(new CustomEvent('little-town:bank-service',{bubbles:true,detail:{service}}));
}
function refreshBankBalances(){
 renderCalendar();
 // Balance-only refresh preserves the amount field and its keyboard focus.
 if(!bankSession)return;
 for(const el of document.querySelectorAll('[data-bank-balance]')){el.textContent=formatMoney(banking.bank.balanceCents);el.classList.toggle('in-the-red',banking.bank.balanceCents<0)}
 for(const el of document.querySelectorAll('[data-wallet-balance]'))el.textContent=formatMoney(playerMoney.balanceCents);
}
function bankReadouts(){return '<div class="bank-readouts"><span>Bank account <strong data-bank-balance class="'+(banking.bank.balanceCents<0?'in-the-red':'')+'">'+formatMoney(banking.bank.balanceCents)+'</strong></span><span>Wallet <strong data-wallet-balance>'+formatMoney(playerMoney.balanceCents)+'</strong></span></div>'}
function renderBank(){
 if(!bankSession)return;
 const session=bankSession,isATM=session.service==='atm',isMortgage=session.service==='mortgages';
 $('bank-workspace').classList.toggle('atm-workspace',isATM);
 $('bank-workspace').classList.toggle('computer-workspace',!isATM);
 $('bank-frame').src=ASSETS[isATM?'bankATM':'bankComputer'];
 $('bank-screen').innerHTML='<header class="bank-screen-head"><div><span class="bank-eyebrow">City Bank</span><h2 id="bank-heading" tabindex="-1">'+(isATM?'ATM':isMortgage?'Mortgages':{loans:'Loans',savings:'Savings accounts',investments:'Investments'}[session.service])+'</h2></div>'+bankButton('lobby','← Bank lobby')+'</header>'+bankReadouts()+'<div id="bank-content" class="bank-content"></div>';
 $('bank-cash-area').classList.toggle('hidden',!isATM);
 if(isATM){renderATM();$('bank-slot').src=ASSETS.bankSlot;$('bank-slot-lip').src=ASSETS.bankSlot;$('bank-cash').src=ASSETS.bankCash}
 else if(isMortgage)renderMortgages();
 else $('bank-content').innerHTML='<div class="bank-empty"><h3>'+{loans:'Loans',savings:'Savings accounts',investments:'Investments'}[session.service]+'</h3><p>This desk will open in a future update.</p>'+bankButton('lobby','Back to the bank')+'</div>';
 $('bank-live').textContent=session.message;
}
function renderATM(){
 const session=bankSession,mode=session.mode,verb=mode==='withdraw'?'withdraw':'deposit';
 let html='';
 if(session.phase==='menu')html='<p class="bank-intro">What would you like to do?</p><div class="atm-menu">'+bankButton('balance','Account balance')+bankButton('withdraw','Withdraw money')+bankButton('deposit','Deposit money')+'</div>';
 if(session.phase==='balance')html='<div class="atm-account"><h3>Account balance</h3><p data-bank-balance class="atm-balance '+(banking.bank.balanceCents<0?'in-the-red':'')+'">'+formatMoney(banking.bank.balanceCents)+'</p><p>'+ (banking.bank.balanceCents<0?'Your bank account is overdrawn. Deposit money to reduce what you owe.':'This money is in your bank account. Withdraw it to spend it from your wallet.')+'</p>'+bankButton('menu','← ATM menu')+'</div>';
 if(session.phase==='amount')html='<form id="atm-form" novalidate><label for="atm-amount">Please enter the amount you would like to '+verb+'.</label><div class="atm-input"><span aria-hidden="true">$</span><input id="atm-amount" name="amount" type="text" inputmode="decimal" autocomplete="off" placeholder="0.00" aria-describedby="atm-error" maxlength="14"></div><p id="atm-error" class="bank-error" role="alert"></p><div class="bank-actions">'+bankButton('menu','Cancel')+'<button class="bank-button primary" id="atm-confirm" type="submit">'+(mode==='withdraw'?'Withdraw money':'Deposit money')+'</button></div></form>';
 if(session.phase==='receipt')html='<div class="atm-receipt"><h3>'+(session.animating?(mode==='withdraw'?'Dispensing cash …':'Accepting cash …'):'Transaction complete')+'</h3><p>'+formatMoney(session.amountCents)+' '+(mode==='withdraw'?'withdrawn to your wallet.':'deposited into your bank account.')+'</p><p class="atm-confirmed">✓ Balances saved</p>'+bankButton('menu','Done',session.animating?'disabled':'')+'</div>';
 $('bank-content').innerHTML=html;
}
function confirmATM(event){
 event.preventDefault();
 const session=bankSession;if(!bankHere()||session?.service!=='atm'||session.phase!=='amount'||session.animating)return;
 const raw=$('atm-amount').value.trim();
 if(!/^\d+(?:\.\d{1,2})?$/.test(raw)||!Number.isSafeInteger(Math.round(Number(raw)*100))||Number(raw)<=0){$('atm-error').textContent='Enter an amount greater than $0, with up to two decimal places.';return}
 session.animating=true;
 let ok;
 try{ok=banking.transfer(session.mode,Number(raw))}catch{session.animating=false;$('atm-error').textContent='That amount is too large. Please enter a smaller amount.';return}
 if(!ok){session.animating=false;$('atm-error').textContent=session.mode==='withdraw'?'Not enough money in your bank account.':'Not enough money in your wallet.';return}
 session.amountCents=dollarsToCents(Number(raw));session.phase='receipt';session.message='Transaction complete. '+formatMoney(session.amountCents)+(session.mode==='withdraw'?' withdrawn.':' deposited.');
 renderBank();$('bank-heading').focus();
 const area=$('bank-cash-area');area.classList.remove('cash-withdraw','cash-deposit');void area.offsetWidth;area.classList.add('cash-'+session.mode);
 const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?180:1700;
 bankAnimationTimer=setTimeout(()=>{
  if(bankSession!==session)return;
  session.animating=false;area.classList.remove('cash-withdraw','cash-deposit');renderATM();$('bank-live').textContent=session.message;
 },duration);
}
function renderMortgages(){
 const session=bankSession;
 let html='<nav class="mortgage-nav" aria-label="Mortgage options">'+bankButton('catalog','Choose a house')+bankButton('active','Active mortgages')+'</nav>';
 if(session.message)html+='<p class="bank-message" role="status">'+session.message+'</p>';
 if(session.phase==='menu')html+='<div class="bank-empty"><h3>A home of your own</h3><p>Choose a house, compare the interest rate and monthly payment, then review your mortgage.</p><p>Ten completed interactions advance one month. Monthly payments come from your bank account, not your wallet.</p>'+bankButton('catalog','Browse the house catalog')+'</div>';
 if(session.phase==='catalog')html+='<h3>Choose your house</h3><div class="house-catalog">'+HOUSE_CATALOG.map(house=>{
  const owned=banking.mortgages.some(loan=>loan.houseId===house.id);
  return '<button class="house-card" data-house="'+house.id+'" '+(owned?'disabled':'')+'><img src="'+ASSETS['house-'+house.id]+'" alt="'+houseName(house.id)+' from the suburbs map"><strong>'+houseName(house.id)+'</strong><span>'+formatMoney(house.priceCents)+'</span><small>'+(owned?'Already purchased':'View mortgage plans →')+'</small></button>';
 }).join('')+'</div>';
 if(session.phase==='plans'){
  const house=HOUSE_CATALOG.find(house=>house.id===session.house);
  html+='<div class="chosen-house"><img src="'+ASSETS['house-'+house.id]+'" alt=""><div><h3>'+houseName(house.id)+'</h3><strong>'+formatMoney(house.priceCents)+'</strong><p>Choose a fixed interest rate and payment plan.</p></div></div><div class="mortgage-plans">'+MORTGAGE_PLANS.map(plan=>'<button class="plan-card" data-plan="'+plan.id+'"><strong>'+plan.years+' years</strong><span>Interest rate <b>'+plan.annualBps/100+'% per year</b></span><span>Monthly payment <b>'+formatMoney(mortgagePayment(house.priceCents,plan.annualBps,plan.years*12))+'</b></span><small>Fixed rate · '+plan.years*12+' payments</small></button>').join('')+'</div><p class="bank-note">The house price is fully financed. No down payment or fees in this pilot.</p>';
 }
 if(session.phase==='review'){
  const house=HOUSE_CATALOG.find(house=>house.id===session.house),plan=MORTGAGE_PLANS.find(plan=>plan.id===session.plan),payment=mortgagePayment(house.priceCents,plan.annualBps,plan.years*12);
  html+='<h3>Review your mortgage</h3><div class="mortgage-review"><img src="'+ASSETS['house-'+house.id]+'" alt="'+houseName(house.id)+'"><dl><dt>House</dt><dd>'+houseName(house.id)+'</dd><dt>Price / amount borrowed</dt><dd>'+formatMoney(house.priceCents)+'</dd><dt>Interest rate</dt><dd>'+plan.annualBps/100+'% per year · fixed</dd><dt>Term</dt><dd>'+plan.years+' years</dd><dt>Monthly payment</dt><dd>'+formatMoney(payment)+'</dd><dt>First payment due</dt><dd>Month '+(banking.month+2)+'</dd></dl></div><p class="bank-note">Unpaid installments are collected automatically from your bank account. This can overdraw it; a negative balance appears in red. You can pay this month’s installment early if you have enough in the bank.</p><p class="bank-note">Buying this house counts as one interaction. '+(10-banking.interactions%10)+' interaction(s) until the next month.</p><div class="bank-actions">'+bankButton('plans','← Change plan')+bankButton('sign','Confirm mortgage & buy house','id="mortgage-confirm"')+'</div>';
 }
 if(session.phase==='active'){
  const loans=banking.mortgages.filter(loan=>loan.principalCents>0),paid=banking.mortgages.filter(loan=>!loan.principalCents);
  html+='<h3>Active mortgages</h3>'+(loans.length?'<div class="active-mortgages">'+loans.map(loan=>{
   const paidThisMonth=loan.nextDueMonth>banking.month+1;
   return '<article class="mortgage-card"><img src="'+ASSETS['house-'+loan.houseId]+'" alt=""><div><h4>'+houseName(loan.houseId)+'</h4><p>Interest rate '+loan.annualBps/100+'% · '+loan.termMonths/12+' years</p><dl><dt>Monthly payment</dt><dd>'+formatMoney(mortgageInstallment(loan).amountCents)+'</dd><dt>Principal remaining</dt><dd>'+formatMoney(loan.principalCents)+'</dd><dt>Payments made</dt><dd>'+loan.paymentsMade+' / '+loan.termMonths+'</dd><dt>Next due</dt><dd>Month '+(loan.nextDueMonth+1)+'</dd></dl><button class="bank-button" data-pay-mortgage="'+loan.houseId+'" '+(paidThisMonth?'disabled':'')+'>'+(paidThisMonth?'This month’s payment is covered':'Make a payment')+'</button>'+(loan.history.length?'<details><summary>Recent payments</summary><ul>'+loan.history.slice().reverse().map(row=>'<li>Month '+(row.month+1)+' · '+row.kind+' · '+formatMoney(row.amountCents)+'</li>').join('')+'</ul></details>':'')+'</div></article>';
  }).join('')+'</div>':'<p class="bank-empty">None. You have no active mortgages.</p>')+(paid.length?'<h3>Paid-off homes</h3><ul>'+paid.map(loan=>'<li>'+houseName(loan.houseId)+' · Paid in full</li>').join('')+'</ul>':'')+'<p class="bank-note">One month = 10 completed interactions. If you have not paid manually, the bank collects the installment automatically. Your bank account may go into the red.</p>';
 }
 $('bank-content').innerHTML=html;
}
function bankClick(event){
 if(!bankHere()||!bankSession)return;
 const session=bankSession,action=event.target.closest('[data-bank-action]')?.dataset.bankAction;
 if(action==='lobby'){closeBankView();return}
 if(session.animating)return;
 if(session.service==='atm'){
  if(['menu','balance','withdraw','deposit'].includes(action)){
   session.mode=['withdraw','deposit'].includes(action)?action:null;session.phase=session.mode?'amount':action;session.message='';renderBank();
   (session.phase==='amount'?$('atm-amount'):$('bank-heading')).focus();
  }return;
 }
 if(session.service!=='mortgages')return;
 if(['catalog','active','plans'].includes(action)){session.phase=action;session.message='';renderBank();$('bank-heading').focus();return}
 const house=event.target.closest('[data-house]')?.dataset.house,plan=event.target.closest('[data-plan]')?.dataset.plan,pay=event.target.closest('[data-pay-mortgage]')?.dataset.payMortgage;
 if(house&&session.phase==='catalog'&&HOUSE_CATALOG.some(item=>item.id===house)&&!banking.mortgages.some(loan=>loan.houseId===house)){session.house=house;session.phase='plans';renderBank();$('bank-heading').focus()}
 if(plan&&session.phase==='plans'&&MORTGAGE_PLANS.some(item=>item.id===plan)){session.plan=plan;session.phase='review';renderBank();$('bank-heading').focus()}
 if(action==='sign'&&session.phase==='review'&&banking.sign(session.house,session.plan)){
  session.phase='active';session.message='Congratulations! You bought '+houseName(session.house)+'. Your mortgage is now active.';renderBank();$('bank-heading').focus();
 }
 if(pay&&session.phase==='active'){
  const result=banking.pay(pay);
  session.message=result.ok?'Payment received: '+formatMoney(result.amountCents)+'.':result.reason==='funds'?'Not enough money in your bank account. Deposit money at the ATM to make a manual payment.':'This month’s payment is already covered.';
  renderBank();$('bank-heading').focus();
 }
}
$('bank-services').addEventListener('click',event=>{const service=event.target.closest('[data-bank-service]')?.dataset.bankService;if(service)openBankService(service)});
$('bank-workspace').addEventListener('click',bankClick);
$('bank-workspace').addEventListener('submit',event=>{if(event.target.id==='atm-form')confirmATM(event)});
