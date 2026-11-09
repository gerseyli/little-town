"""Bank/ATM/mortgage pilot: real controls, persisted cents/calendar and responsive UI."""
from playwright.sync_api import sync_playwright
import http.server,threading,json
from pathlib import Path
from functools import partial
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parents[1]/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1920,'height':1080});errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script('window.requestAnimationFrame=()=>0')
  url='http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html'
  page.goto(url)
  def state():return page.evaluate('({wallet:playerMoney.balanceCents,bank:banking.bank.balanceCents,count:banking.interactions,month:banking.month})')
  def entrance():
   page.evaluate("mapKey='town';x=270;y=610;renderMap()")
   page.locator('#enter-place').click()
  def action(name):page.locator('[data-bank-action="'+name+'"]').first.click()
  def atm(mode,amount):
   action(mode);page.locator('#atm-amount').fill(amount);page.locator('#atm-confirm').click()
  assert state()==dict(wallet=10000,bank=50000,count=0,month=0)
  entrance();assert state()['count']==1
  for name in ['atm','mortgages','loans','savings','investments']:
   page.locator('#bank-'+name).click();assert page.locator('#bank-workspace').is_visible()
   assert page.locator('#bank-heading').inner_text()=={'atm':'ATM','mortgages':'Mortgages','loans':'Loans','savings':'Savings accounts','investments':'Investments'}[name]
   page.keyboard.press('Escape');page.locator('#bank-services').wait_for(state='visible')
   assert page.evaluate("document.activeElement.id")=='bank-'+name
  assert state()['count']==1,'browsing does not advance time'
  page.locator('#bank-atm').click();action('balance');assert page.locator('.atm-balance').inner_text()=='$500';action('menu')
  atm('withdraw','50.25');assert state()==dict(wallet=15025,bank=44975,count=2,month=0)
  assert page.locator('#bank-cash-area').evaluate("el=>el.classList.contains('cash-withdraw')")
  assert page.locator('.bank-cash-clip').evaluate("el=>getComputedStyle(el).overflow")=='hidden'
  page.wait_for_timeout(500)
  assert page.locator('#bank-cash').evaluate("el=>getComputedStyle(el).opacity")!='0'
  page.screenshot(path='/tmp/little-town-atm-cash.png')
  # Commit precedes cosmetic animation: repeated confirmation cannot charge twice.
  page.evaluate("confirmATM({preventDefault(){}})");assert state()['count']==2
  page.reload();assert state()==dict(wallet=15025,bank=44975,count=2,month=0)
  entrance();page.locator('#bank-atm').click()
  atm('deposit','25.10');assert state()==dict(wallet=12515,bank=47485,count=4,month=0)
  assert page.locator('#bank-cash-area').evaluate("el=>el.classList.contains('cash-deposit')")
  page.keyboard.press('Escape');page.locator('#bank-services').wait_for(state='visible')
  page.locator('#bank-atm').click();action('withdraw')
  for invalid in ['0','-5','1.001','abc','500']:
   page.locator('#atm-amount').fill(invalid);page.locator('#atm-confirm').click()
   assert page.locator('#atm-error').inner_text();assert state()['count']==4
  # Native Enter submits the input; Escape can leave during the animation safely.
  page.locator('#atm-amount').fill('0.01');page.locator('#atm-amount').press('Enter')
  assert state()['wallet']==12516 and state()['bank']==47484
  page.keyboard.press('Escape');page.locator('#bank-mortgages').click();action('active')
  assert 'None' in page.locator('#bank-content').inner_text()
  action('catalog');assert page.locator('.house-card').count()==4
  assert page.locator('[data-house="millers"]').inner_text().startswith('The Millers’ house')
  page.locator('[data-house="millers"]').click();assert page.locator('.plan-card').count()==3
  page.locator('[data-plan="30-year"]').click();assert '6% per year' in page.locator('.mortgage-review').inner_text()
  assert '$2,068.45' in page.locator('.mortgage-review').inner_text()
  page.locator('#mortgage-confirm').click();assert 'Congratulations!' in page.locator('#bank-content').inner_text()
  assert state()['count']==6 and len(page.evaluate('banking.mortgages'))==1
  page.evaluate("banking.sign('millers','30-year')");assert state()['count']==6
  page.locator('[data-pay-mortgage="millers"]').click();assert 'Not enough money' in page.locator('.bank-message').inner_text();assert state()['count']==6
  page.screenshot(path='/tmp/little-town-mortgage-active.png')
  # Complete four actual entrances to roll the month; no elapsed wall clock is used.
  for _ in range(4):
   page.locator('#interior-exit').click();page.locator('#enter-place').click()
  assert state()==dict(wallet=12516,bank=47484-206845,count=10,month=1)
  page.locator('#bank-atm').click();action('balance')
  assert page.locator('.atm-balance').inner_text()=='-$1,593.61'
  assert page.locator('.atm-balance').evaluate("el=>el.classList.contains('in-the-red')")
  action('menu');atm('withdraw','1');assert 'Not enough money' in page.locator('#atm-error').inner_text()
  action('menu');atm('deposit','10');assert state()['bank']==-158361 and state()['wallet']==11516
  page.keyboard.press('Escape');page.locator('#bank-mortgages').click();action('active')
  page.locator('.mortgage-card summary').click();assert 'Month 2 · automatic · $2,068.45' in page.locator('#bank-content').inner_text()
  # Manual funded payment on the last interaction must cover this rollover once.
  page.evaluate("banking.bank.credit(10000);while(banking.interactions<19)recordInteraction('directions')")
  before=state()['bank'];page.locator('[data-pay-mortgage="millers"]').click()
  assert state()['count']==20 and state()['month']==2
  assert state()['bank']==before-206845
  assert page.evaluate('banking.mortgages[0].paymentsMade')==2
  snap=page.evaluate('banking.snapshot()');page.reload();assert page.evaluate('banking.snapshot()')==snap
  entrance();page.locator('#bank-mortgages').click();action('catalog')
  assert page.locator('[data-house="millers"]').is_disabled()
  # Tab stays in the currently visible bank screen, including amount inputs.
  page.keyboard.press('Escape');page.locator('#bank-atm').click();action('deposit')
  for _ in range(9):
   page.keyboard.press('Tab')
   assert page.evaluate("document.activeElement.closest('#interior-dialog')!==null")
   assert page.evaluate('document.activeElement.getClientRects().length>0')
  page.keyboard.press('Escape');page.locator('#bank-mortgages').click();action('catalog')
  for width,height in [(1920,1080),(1440,1000),(1024,768),(375,812),(812,375),(320,640)]:
   page.set_viewport_size({'width':width,'height':height})
   assert page.locator('#bank-screen').evaluate('''el=>{const r=el.getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}''')
   assert page.locator('#bank-screen').evaluate('el=>el.scrollWidth<=el.clientWidth+1'),'horizontal overflow'
   if width in [1920,375]:page.screenshot(path='/tmp/little-town-mortgage-'+str(width)+'.png')
   assert page.locator('#interior-exit').is_visible()
  page.set_viewport_size({'width':375,'height':812})
  page.keyboard.press('Escape');page.locator('#bank-atm').click();action('deposit')
  page.locator('#atm-amount').fill('1');page.emulate_media(reduced_motion='reduce');page.locator('#atm-confirm').click();page.wait_for_timeout(250)
  assert not page.evaluate('bankSession.animating');page.screenshot(path='/tmp/little-town-atm-mobile.png')
  page.keyboard.press('Escape');page.keyboard.press('Escape');assert not page.locator('#interior-dialog').is_visible()
  # A directions conversation advances once, regardless of destination browsing.
  count=state()['count'];page.evaluate("x=600;y=610;update();nearbyPerson=worldLife().people[0];openDirections();openDirections()")
  assert state()['count']==count+1
  page.locator('[data-destination]').first.click();assert state()['count']==count+1
  page.keyboard.press('Escape')
  # Existing pharmacy still charges wallet, without bank assets leaking in.
  page.evaluate("x=900;y=1020;renderMap();enterPlace()")
  assert not page.locator('#bank-services').is_visible() and not page.locator('#bank-workspace').is_visible()
  assert page.locator('#chemist').is_visible()
  assert not errors,errors
  print('PASS: five bank desks, generated ATM cash-in/out and clipping, exact saved transfers, failed/repeated/reload cases, house catalog/plans/signing, monthly overdraft, manual no-double-charge, calendar, focus, responsive/reduced-motion and pharmacy isolation')
  browser.close()
finally:
 server.shutdown();server.server_close()
