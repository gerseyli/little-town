"""Bank entry with supplied artwork, no pharmacy overlay, safe return and scene switching."""
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
  page.goto('http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html')
  page.evaluate("mapKey='town';x=190;y=610;facing='east';angle=90;renderMap();last=1000;playerMoney.credit(12.50)")
  for _ in range(3):page.locator('#zoomin').click()
  assert not page.locator('#enter-place').is_visible()
  page.keyboard.down('ArrowRight');page.evaluate('for(let i=1;i<=24;i++)tick(1000+i*1000/60)');page.keyboard.up('ArrowRight')
  assert page.locator('#enter-place').inner_text()=='Enter the bank · Space'
  page.evaluate('const person=worldLife().people[0];person.x=x+2;person.y=y;nearbyPerson=person;updatePersonPrompt();openDirections()')
  assert not page.locator('#ask-directions').is_visible()
  assert not page.locator('#directions-dialog').is_visible()
  outside=page.evaluate('({map:mapKey,x,y,facing,angle,zoom,money:playerMoney.balanceCents})')
  page.keyboard.down('Space');page.keyboard.down('Space');page.keyboard.up('Space')
  assert page.locator('#interior-dialog').is_visible()
  assert page.evaluate('activeInterior.entry.place')=='bank'
  assert page.locator('#interior-title').inner_text()=='Bank'
  assert page.locator('#interior-money').inner_text()=='$112.50'
  assert page.evaluate("$('interior-background').src===ASSETS['bank-background']")
  assert page.locator('#interior-background').evaluate('async image=>{await image.decode();return image.naturalWidth===1672&&image.naturalHeight===941}')
  assert not page.locator('#chemist').is_visible()
  assert not page.locator('#chemist-greeting').is_visible()
  assert not page.locator('#pharmacy-shop').is_visible()
  assert page.locator('#interior-dialog').get_attribute('aria-describedby')=='interior-title'
  for expected in ['interior-exit','bank-atm','bank-mortgages','bank-loans','bank-savings','bank-investments','interior-exit']:
   page.keyboard.press('Tab');assert page.evaluate('document.activeElement.id')==expected
  page.keyboard.press('Shift+Tab');assert page.evaluate('document.activeElement.id')=='bank-investments'
  page.evaluate("$('interior-dialog').focus()")
  page.keyboard.down('ArrowDown');page.evaluate('for(let i=1;i<=10;i++)tick(2000+i*1000/60)');page.keyboard.up('ArrowDown')
  assert page.evaluate('({map:mapKey,x,y,facing,angle,zoom,money:playerMoney.balanceCents})')==outside
  for width,height in [(1920,1080),(1440,1000),(375,812),(812,375),(320,640)]:
   page.set_viewport_size({'width':width,'height':height})
   assert page.locator('#interior-background').evaluate('''image=>{const r=image.getBoundingClientRect();return Math.abs(r.width/r.height-1672/941)<.01&&r.x>=-.1&&r.y>=-.1&&r.right<=innerWidth+.1&&r.bottom<=innerHeight+.1}''')
   assert page.locator('#interior-exit').is_visible()
   if width in [1920,375]:page.screenshot(path='/tmp/little-town-bank-'+str(width)+'.png')
  page.locator('#interior-exit').focus();page.keyboard.press('Space')
  assert not page.locator('#interior-dialog').is_visible()
  assert page.evaluate('({map:mapKey,x,y,facing,angle,zoom,money:playerMoney.balanceCents})')==outside
  assert page.evaluate("document.activeElement===$('camera')&&!busy&&held.size===0")
  page.locator('#enter-place').click();page.keyboard.press('Escape')
  assert not page.locator('#interior-dialog').is_visible()
  # Pharmacy still has its chemist/shop, and visiting it cannot leak them into the bank.
  page.evaluate("x=900;y=1020;renderMap();enterPlace()")
  assert page.locator('#chemist').is_visible()
  assert page.locator('#chemist-greeting').inner_text()=='Hello, how can I help you today?'
  page.locator('#chemist').click();assert page.locator('#pharmacy-shop').is_visible()
  page.locator('#interior-exit').click()
  page.evaluate("x=270;y=610;renderMap();enterPlace();$('chemist').click();openPharmacyShop()")
  assert page.locator('#interior-title').inner_text()=='Bank'
  assert not page.locator('#chemist').is_visible()
  assert not page.locator('#chemist-greeting').is_visible()
  assert not page.locator('#pharmacy-shop').is_visible()
  assert page.locator('#interior-money').inner_text()=='$112.50'
  page.keyboard.press('Escape');assert page.evaluate('!busy&&!activeInterior')
  assert not errors,errors
  print('PASS: keyboard/button bank entry, entrance priority/focus, exact HD lobby, no pharmacy overlays, responsive full image, focus/exit/Escape, preserved outdoor state/zoom/money and scene switching')
  browser.close()
finally:
 server.shutdown();server.server_close()
