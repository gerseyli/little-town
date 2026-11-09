"""Smoke-check the real deployed preview with the environment's normal HTTPS proxy."""
from playwright.sync_api import sync_playwright
import argparse,os
parser=argparse.ArgumentParser()
parser.add_argument('url');parser.add_argument('--commit');parser.add_argument('--bank',action='store_true')
parser.add_argument('--banking',action='store_true');parser.add_argument('--grocery',action='store_true')
args=parser.parse_args()
with sync_playwright() as p:
 options={'executable_path':'/usr/bin/chromium','headless':True,'args':['--no-sandbox']}
 proxy=os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
 if proxy:options['proxy']={'server':proxy}
 browser=p.chromium.launch(**options)
 page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];failures=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failures.append((r.status,r.url)) if r.status>=400 and '/little-town/' in r.url else None)
 page.add_init_script('window.requestAnimationFrame=()=>0')
 page.goto(args.url,wait_until='domcontentloaded',timeout=60000)
 page.locator('#game').wait_for(state='visible',timeout=60000)
 def frame():return page.locator('#game').element_handle().content_frame()
 game=frame()
 version=page.evaluate("async()=>{const r=await fetch('./version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Version request failed');return r.json()}")
 if args.commit:assert version['commit']==args.commit,version
 assert game.url.endswith(version['game'])
 assert game.locator('#zoomvalue').inner_text()=='100%'
 assert game.locator('#money-balance').inner_text()=='$100'
 assert game.locator('#mapart').evaluate('img=>img.naturalWidth>1000')
 game.evaluate("mapKey='town';x=820;y=1020;renderMap();last=1000")
 game.locator('#zoomin').click();page.keyboard.down('ArrowRight')
 game.evaluate('for(let i=1;i<=24;i++)tick(1000+i*1000/60)')
 page.keyboard.up('ArrowRight');page.keyboard.press('Space')
 assert game.locator('#interior-dialog').is_visible()
 game.locator('#chemist').click()
 for symptom in ['headache','sore-throat']:game.locator('#symptom-'+symptom).click()
 game.locator('#pharmacy-recommend').click()
 for product in ['paracetamol','lozenges']:game.locator('#medicine-'+product).click()
 assert game.locator('#basket-total').inner_text()=='$9'
 game.locator('#pharmacy-checkout').click()
 assert game.locator('#interior-money').inner_text()=='$91'
 page.screenshot(path='/tmp/little-town-public-preview.png')
 page.reload(wait_until='domcontentloaded');page.locator('#game').wait_for(state='visible',timeout=60000)
 game=frame();assert game.locator('#money-balance').inner_text()=='$91'
 assert game.locator('#zoomvalue').inner_text()=='120%'
 if args.bank or args.banking or args.grocery:
  game.evaluate("mapKey='town';x=190;y=610;facing='east';angle=90;renderMap();last=1000")
  game.locator('#labels').click();page.keyboard.down('ArrowRight')
  game.evaluate('for(let i=1;i<=24;i++)tick(1000+i*1000/60)');page.keyboard.up('ArrowRight')
  assert game.locator('#enter-place').inner_text()=='Enter the bank · Space'
  outside=game.evaluate('({x,y,facing,angle,zoom,money:playerMoney.balanceCents})')
  page.keyboard.press('Space');assert game.locator('#interior-title').inner_text()=='Bank'
  assert game.locator('#interior-background').evaluate('async image=>{await image.decode();return image.naturalWidth===1672&&image.naturalHeight===941}')
  assert game.evaluate("$('interior-background').src===new URL(ASSETS['bank-background'],location.href).href")
  assert not game.locator('#chemist').is_visible()
  assert not game.locator('#chemist-greeting').is_visible()
  assert not game.locator('#pharmacy-shop').is_visible()
  assert game.locator('#interior-money').inner_text()=='$91'
  page.screenshot(path='/tmp/little-town-public-bank.png')
  page.keyboard.press('Escape')
  assert game.evaluate('({x,y,facing,angle,zoom,money:playerMoney.balanceCents})')==outside
  assert game.evaluate('!activeInterior&&!busy&&held.size===0')
  print('PASS: live bank keyboard entry, original lobby, scene isolation and preserved state')
 if args.banking:
  game.locator('#enter-place').click();game.locator('#bank-atm').click()
  assert game.evaluate('banking.bank.balanceCents')==50000
  game.locator('[data-bank-action="withdraw"]').click();game.locator('#atm-amount').fill('10');game.locator('#atm-confirm').click()
  assert game.evaluate('({wallet:playerMoney.balanceCents,bank:banking.bank.balanceCents})')==dict(wallet=10100,bank=49000)
  page.keyboard.press('Escape');game.locator('#bank-atm').click()
  game.locator('[data-bank-action="deposit"]').click();game.locator('#atm-amount').fill('5');game.locator('#atm-confirm').click()
  assert game.evaluate('({wallet:playerMoney.balanceCents,bank:banking.bank.balanceCents})')==dict(wallet=9600,bank=49500)
  page.keyboard.press('Escape');game.locator('#bank-mortgages').click()
  game.locator('[data-bank-action="catalog"]').first.click();game.locator('[data-house="millers"]').click();game.locator('[data-plan="30-year"]').click();game.locator('#mortgage-confirm').click()
  assert 'Congratulations!' in game.locator('#bank-content').inner_text()
  while game.evaluate('banking.month')<1:
   game.locator('#interior-exit').click();game.locator('#enter-place').click()
  assert game.evaluate('banking.bank.balanceCents')==49500-206845
  game.locator('#bank-atm').click();game.locator('[data-bank-action="balance"]').click()
  assert game.locator('.atm-balance').evaluate("el=>el.classList.contains('in-the-red')")
  page.screenshot(path='/tmp/little-town-public-atm.png')
  saved=game.evaluate('banking.snapshot()');wallet=game.evaluate('playerMoney.balanceCents')
  page.reload(wait_until='domcontentloaded');page.locator('#game').wait_for(state='visible',timeout=60000);game=frame()
  assert game.evaluate('banking.snapshot()')==saved and game.evaluate('playerMoney.balanceCents')==wallet
  print('PASS: live ATM transfers, mortgage purchase/automatic monthly overdraft and coherent reload')
 if args.grocery:
  game.evaluate('x=1230;y=1020;renderMap()');game.locator('#enter-place').click();game.locator('#chemist').click()
  assert game.locator('.food-card').count()==24
  assert game.locator('#grocer-portrait').evaluate('async image=>{await image.decode();return image.naturalWidth>1000}')
  before=game.evaluate('({wallet:playerMoney.balanceCents,bank:banking.bank.balanceCents,count:banking.interactions})')
  game.locator('[data-grocery-product="beans"]').click();game.locator('[data-grocery-product="apple"]').click()
  assert game.locator('#grocery-total').inner_text()=='$3.35'
  page.screenshot(path='/tmp/little-town-public-grocery.png');game.locator('#grocery-checkout').click()
  assert game.evaluate('playerMoney.balanceCents')==before['wallet']-335
  assert game.evaluate('banking.bank.balanceCents')==before['bank']
  assert game.evaluate('banking.interactions')==before['count']+1
  game.evaluate('checkoutGrocery()');assert game.evaluate('playerMoney.balanceCents')==before['wallet']-335
  page.reload(wait_until='domcontentloaded');page.locator('#game').wait_for(state='visible',timeout=60000);game=frame()
  assert game.evaluate('playerMoney.balanceCents')==before['wallet']-335
  print('PASS: live Grocery store art, 24 food catalog, wallet checkout/repeat guard and reload')
 assert not failures,failures
 assert not errors,errors
 print('PASS: live HTTPS launcher/version',version['commit'],'HD assets, retained-focus Space entry, pharmacy checkout and saved money/zoom reload')
 browser.close()
