"""Pharmacy consultation, symptom atlas, cart/checkout and accessible responsive UI."""
from playwright.sync_api import sync_playwright
import http.server,threading
from pathlib import Path
from functools import partial
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parents[1]/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1920,'height':1080})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script('window.requestAnimationFrame=()=>0')
  url='http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html';page.goto(url)
  page.evaluate("mapKey='town';x=900;y=1020;facing='east';angle=90;renderMap();enterPlace()")
  outside=page.evaluate('({map:mapKey,x,y,facing,angle})')
  page.locator('#chemist').click()
  assert page.locator('#pharmacy-shop').is_visible()
  assert page.locator('#shop-heading').inner_text()=='I think I have …'
  assert page.locator('[data-symptom]').count()==12
  assert page.locator('#pharmacy-recommend').is_disabled()
  assert page.locator('#symptom-food-poisoning').get_attribute('aria-label')=='I have food poisoning.'
  decoded=page.evaluate('''async()=>{
   return Promise.all(['pharmacyConsultation','pharmacyBasket','pharmacyAction','pharmacySymptoms'].map(async key=>{const image=new Image();image.src=ASSETS[key];await image.decode();return image.naturalWidth}));
  }''');assert all(width>=1000 for width in decoded)
  page.locator('#symptom-headache').click()
  assert page.locator('#symptom-headache').get_attribute('aria-pressed')=='true'
  assert page.locator('#symptom-headache').evaluate("e=>e.classList.contains('selected')")
  page.locator('#symptom-headache').click()
  assert page.locator('#symptom-headache').get_attribute('aria-pressed')=='false'
  assert page.locator('#pharmacy-recommend').is_disabled()
  page.locator('#shop-names').click()
  assert page.locator('#shop-names').inner_text()=='Names: off'
  assert page.locator('.symptom-caption').first.evaluate("e=>getComputedStyle(e).visibility")=='hidden'
  assert page.locator('#symptom-headache').get_attribute('aria-label')=='I have a headache.'
  page.locator('#shop-names').click()
  for symptom in ['headache','fever','food-poisoning','sore-throat']:
   page.locator('#symptom-'+symptom).click()
  assert page.locator('#symptom-selection-count').inner_text()=='4 symptoms selected'
  page.evaluate("$('shop-scroll').scrollTop=0")
  page.screenshot(path='/tmp/little-town-pharmacy-symptoms-1920.png')
  page.locator('#pharmacy-recommend').click()
  assert page.locator('[data-product]').count()==3,'paracetamol recommendations must be deduplicated'
  assert 'For food poisoning, I would recommend oral rehydration salts' in page.locator('#shop-chemist-speech').inner_text()
  page.locator('#medicine-paracetamol').click();page.locator('#medicine-paracetamol').click()
  assert page.locator('#basket-count').inner_text()=='1 item'
  page.locator('#medicine-rehydration').click();page.locator('#medicine-lozenges').click()
  assert page.locator('#basket-count').inner_text()=='3 items';assert page.locator('#basket-total').inner_text()=='$15'
  page.locator('[data-remove-product="rehydration"]').click()
  assert page.locator('#basket-total').inner_text()=='$9'
  page.locator('#medicine-rehydration').click()
  assert page.locator('#basket-total').inner_text()=='$15'
  page.screenshot(path='/tmp/little-town-pharmacy-basket-1920.png')
  # The same basket survives an insufficient-funds attempt, then a successful purchase.
  page.evaluate('playerMoney.debit(90)')
  page.locator('#pharmacy-checkout').click()
  assert 'Not enough money' in page.locator('#basket-message').inner_text()
  assert page.locator('#basket-count').inner_text()=='3 items';assert page.locator('#interior-money').inner_text()=='$10'
  page.evaluate('playerMoney.credit(90)')
  page.locator('#pharmacy-checkout').dblclick()
  assert page.locator('.shop-receipt h3').inner_text()=='Purchase complete'
  assert page.locator('#interior-money').inner_text()=='$85'
  assert page.evaluate('JSON.parse(localStorage.getItem("little-town-worlds-v3")).moneyCents')==8500
  assert page.locator('#basket-count').inner_text()=='0 items'
  assert page.locator('#pharmacy-checkout').is_disabled()
  page.evaluate('checkoutPharmacy();addPharmacyProduct("paracetamol")')
  assert page.locator('#interior-money').inner_text()=='$85'
  page.screenshot(path='/tmp/little-town-pharmacy-receipt-1920.png')
  page.locator('[data-shop-action="new-order"]').click()
  assert page.locator('#pharmacy-recommend').is_disabled()
  # Changing symptoms removes products that are no longer recommended.
  page.locator('#symptom-headache').click();page.locator('#pharmacy-recommend').click();page.locator('#medicine-paracetamol').click()
  page.locator('[data-shop-action="change-symptoms"]').click();page.locator('#symptom-headache').click();page.locator('#symptom-insect-bite').click();page.locator('#pharmacy-recommend').click()
  assert page.locator('#basket-count').inner_text()=='0 items'
  page.evaluate('addPharmacyProduct("paracetamol")');assert page.locator('#basket-count').inner_text()=='0 items'
  # Escape returns to the counter, then leaves; no outdoor keys or money are changed.
  page.keyboard.press('Escape');assert not page.locator('#pharmacy-shop').is_visible()
  assert page.locator('#interior-dialog').is_visible()
  page.locator('#chemist').click();assert page.locator('#medicine-anti-itch').is_visible()
  page.locator('#interior-exit').click()
  assert page.evaluate('({map:mapKey,x,y,facing,angle})')==outside
  page.reload();assert page.locator('#money-balance').inner_text()=='$85'
  # All source pictures and basket controls remain reachable at smaller viewports.
  for width,height in [(1440,1000),(1024,768),(375,812),(812,375),(320,640)]:
   page.set_viewport_size({'width':width,'height':height})
   page.evaluate("mapKey='town';x=900;y=1020;renderMap();enterPlace();openPharmacyShop()")
   for symptom in ['headache','food-poisoning','insect-bite']:
    button=page.locator('#symptom-'+symptom);button.click();assert button.get_attribute('aria-pressed')=='true'
   page.screenshot(path='/tmp/little-town-pharmacy-symptoms-'+str(width)+'.png')
   page.locator('#pharmacy-recommend').click()
   for product in ['paracetamol','rehydration','anti-itch']:page.locator('#medicine-'+product).click()
   assert page.locator('#basket-total').inner_text()=='$16.50'
   page.locator('#pharmacy-checkout').scroll_into_view_if_needed()
   page.screenshot(path='/tmp/little-town-pharmacy-basket-'+str(width)+'.png')
   assert page.evaluate("$('pharmacy-shop').scrollWidth<=$('pharmacy-shop').clientWidth+1"),('horizontal overflow',width)
   assert page.evaluate("$('shop-scroll').scrollWidth<=$('shop-scroll').clientWidth+1"),('panel overflow',width)
   page.locator('#shop-heading').focus()
   for _ in range(25):
    page.keyboard.press('Tab')
    assert page.evaluate("$('interior-dialog').contains(document.activeElement)")
   page.locator('#interior-exit').click()
   assert page.evaluate('!activeInterior&&!busy&&held.size===0')
  # Keyboard activation works without a pointer and preserves the multi-selection focus.
  page.set_viewport_size({'width':1440,'height':1000})
  page.evaluate("enterPlace();$('chemist').focus()")
  page.keyboard.press('Enter');page.locator('#symptom-headache').focus();page.keyboard.press('Space')
  assert page.locator('#symptom-headache').get_attribute('aria-pressed')=='true'
  assert page.evaluate("document.activeElement===$('symptom-headache')")
  page.keyboard.press('Space');assert page.locator('#pharmacy-recommend').is_disabled()
  assert not errors,errors
  print('PASS: HD art and all 12 sprites, multi-selection/green state, names toggle, recommendations/deduplication, cart/remove/totals, insufficient funds, atomic/repeated checkout, saved balance, stale-product rejection, new order, Escape/reopen/exit, mobile scroll/focus and keyboard selection')
  browser.close()
finally:
 server.shutdown();server.server_close()
