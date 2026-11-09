"""Grocery entrance, 24 container/produce pictures, shared-wallet basket and calendar."""
from playwright.sync_api import sync_playwright
import http.server,threading
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
  url='http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html';page.goto(url)
  page.evaluate("mapKey='town';x=1150;y=1020;facing='east';angle=90;renderMap();last=1000")
  page.locator('#zoomin').click();page.keyboard.down('ArrowRight');page.evaluate('for(let i=1;i<=24;i++)tick(1000+i*1000/60)');page.keyboard.up('ArrowRight')
  assert page.locator('#enter-place').inner_text()=='Enter the grocery store · Space'
  page.evaluate('const person=worldLife().people[0];person.x=x+2;person.y=y;nearbyPerson=person;updatePersonPrompt();openDirections()')
  assert not page.locator('#directions-dialog').is_visible()
  outside=page.evaluate('({x,y,facing,zoom})');page.keyboard.press('Space')
  assert page.locator('#interior-title').inner_text()=='Grocery store'
  assert page.evaluate("$('interior-background').src===ASSETS['grocery-background']")
  assert page.locator('#chemist').get_attribute('aria-label')=='Talk to the shop assistant'
  assert page.locator('#chemist-greeting').inner_text()=='Hello! What would you like today?'
  assert not page.locator('#bank-services').is_visible()
  page.screenshot(path='/tmp/little-town-grocery-room.png')
  page.locator('#chemist').focus();page.keyboard.press('Enter');assert page.locator('#grocery-shop').is_visible()
  assert page.locator('.food-card').count()==24
  assert page.evaluate('banking.interactions')==1
  for item in page.evaluate('GROCERY_DATA.products'):
   card=page.locator('[data-grocery-product="'+item['id']+'"]')
   assert card.locator('.food-name').inner_text()==item['phrase']
   assert card.locator('svg use').get_attribute('href')=='#grocery-atlas-'+item['sheet']
  page.locator('#grocery-names').click()
  assert page.locator('.food-name').first.evaluate('el=>getComputedStyle(el).visibility')=='hidden'
  page.locator('#grocery-names').click()
  page.locator('[data-grocery-product="beans"]').click();page.locator('[data-grocery-product="beans"]').click();page.locator('[data-grocery-product="apple"]').click()
  assert page.locator('#grocery-total').inner_text()=='$5.85'
  assert '2 cans of beans' in page.locator('#grocery-basket-items').inner_text()
  assert 'I’d like an apple, please.' in page.locator('#grocer-speech').inner_text()
  page.locator('[data-grocery-decrease="beans"]').click();assert page.locator('#grocery-total').inner_text()=='$3.35'
  page.locator('[data-grocery-increase="beans"]').click();assert page.locator('#grocery-total').inner_text()=='$5.85'
  assert page.evaluate("document.activeElement.dataset.groceryIncrease")=='beans'
  page.locator('[data-grocery-remove="apple"]').click();assert page.locator('#grocery-total').inner_text()=='$5'
  page.locator('#grocery-category').select_option('packets-bags');assert page.locator('.food-card').count()==6
  page.locator('[data-grocery-product="pasta"]').click();assert page.locator('#grocery-total').inner_text()=='$7.25'
  page.locator('#grocery-category').select_option('all');assert page.locator('.food-card').count()==24
  assert page.evaluate('banking.interactions')==1,'browsing/items do not advance month'
  page.screenshot(path='/tmp/little-town-grocery-1920.png')
  page.locator('#grocery-checkout').click()
  assert 'Purchase complete' in page.locator('#grocery-scroll').inner_text()
  assert page.evaluate('playerMoney.balanceCents')==9275
  assert page.evaluate('banking.bank.balanceCents')==50000
  assert page.evaluate('banking.interactions')==2
  page.evaluate('checkoutGrocery();checkoutGrocery()');assert page.evaluate('playerMoney.balanceCents')==9275 and page.evaluate('banking.interactions')==2
  page.reload();assert page.evaluate('playerMoney.balanceCents')==9275 and page.evaluate('banking.interactions')==2
  page.locator('#enter-place').click();page.locator('#chemist').click()
  # Insufficient wallet balance preserves quantity/order; bank money is not spent.
  page.evaluate("playerMoney.debit(92);renderGroceryBasket()")
  page.locator('[data-grocery-product="honey"]').click();page.locator('#grocery-checkout').click()
  assert 'Not enough wallet money' in page.locator('#grocery-message').inner_text()
  assert page.locator('#grocery-total').inner_text()=='$6.50'
  assert page.evaluate('playerMoney.balanceCents')==75 and page.evaluate('banking.bank.balanceCents')==50000 and page.evaluate('banking.interactions')==3
  page.locator('[data-grocery-remove="honey"]').click();assert page.locator('#grocery-checkout').is_disabled()
  page.evaluate('playerMoney.credit(100);renderGroceryBasket()')
  # Checkout as interaction #10 triggers one mortgage collection from BANK only.
  page.evaluate("banking.sign('bakers','15-year');while(banking.interactions<9)recordInteraction('directions')")
  page.locator('[data-grocery-product="carrot"]').click();page.locator('#grocery-checkout').click()
  assert page.evaluate('banking.interactions')==10 and page.evaluate('banking.month')==1
  assert page.evaluate('playerMoney.balanceCents')==10010
  assert page.evaluate('banking.bank.balanceCents')==50000-page.evaluate('banking.mortgages[0].paymentCents')
  page.locator('[data-grocery-action="new-order"]').click()
  # Scroll the catalog independently of the basket and visible navigation.
  for width,height in [(1920,1080),(1440,1000),(1024,768),(768,1024),(375,812),(812,375),(320,640)]:
   page.set_viewport_size({'width':width,'height':height})
   for selector in ['#grocery-shop','.grocery-catalog','.grocery-basket']:
    assert page.locator(selector).evaluate('''el=>{const r=el.getBoundingClientRect();return r.x>=-.1&&r.y>=-.1&&r.right<=innerWidth+.1&&r.bottom<=innerHeight+.1}'''),(width,height,selector)
   assert page.locator('.grocery-catalog').evaluate('el=>el.scrollWidth<=el.clientWidth+1')
   assert page.locator('#grocery-scroll').evaluate('el=>el.clientHeight>30')
   page.locator('#grocery-scroll').evaluate('el=>el.scrollTop=el.scrollHeight')
   assert page.locator('[data-grocery-product="tomato"]').is_visible()
   page.locator('[data-grocery-product="tomato"]').click();assert not page.locator('#grocery-checkout').is_disabled()
   if width in [1920,375,320]:page.screenshot(path='/tmp/little-town-grocery-'+str(width)+'.png')
   page.locator('[data-grocery-remove="tomato"]').click()
   page.locator('#grocery-scroll').evaluate('el=>el.scrollTop=0')
  page.set_viewport_size({'width':1920,'height':1080})
  for _ in range(12):
   page.keyboard.press('Tab');assert page.evaluate("document.activeElement.closest('#interior-dialog')!==null")
  page.keyboard.press('Escape');assert page.locator('#chemist').is_visible()
  page.locator('#chemist').click();assert page.locator('#grocery-shop').is_visible()
  page.keyboard.press('Escape');page.keyboard.press('Escape');assert not page.locator('#interior-dialog').is_visible()
  assert page.evaluate('({x,y,facing,zoom})')==outside
  page.evaluate('x=900;y=1020;renderMap();enterPlace()');page.locator('#chemist').click()
  assert page.locator('#pharmacy-shop').is_visible() and not page.locator('#grocery-shop').is_visible()
  page.locator('#interior-exit').click();page.evaluate('x=270;y=610;renderMap();enterPlace()');page.locator('#bank-atm').click()
  assert page.locator('#bank-workspace').is_visible() and not page.locator('#grocery-shop').is_visible()
  assert not errors,errors
  print('PASS: renamed store, retained-focus Space entry/priority, friendly assistant, 24 food images/phrases, names/categories, quantity basket/funds/receipt/repeat/reload, shared wallet/monthly banking, responsive scroll/focus and pharmacy/bank isolation')
  browser.close()
finally:
 server.shutdown();server.server_close()
