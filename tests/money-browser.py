"""Money persistence, game integration, accessibility and responsive HUD geometry."""
from playwright.sync_api import sync_playwright
import http.server,threading,json
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
  url='http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html'
  page.goto(url)
  def balance(text):assert page.locator('#money-balance').inner_text()==text
  def reload_save(value,key='little-town-worlds-v3'):
   page.evaluate('([key,value])=>{localStorage.clear();localStorage.setItem(key,value)}',[key,json.dumps(value)])
   page.reload()
  balance('$100')
  assert page.locator('#money-balance').get_attribute('aria-live')=='polite'
  assert page.evaluate('''async()=>{for(const key of ['walletIcon','moneyPanel']){const img=new Image();img.src=ASSETS[key];await img.decode();if(img.naturalWidth<1000)throw Error('Low resolution art');}return true}''')
  page.evaluate('playerMoney.credit(25);playerMoney.debit(12.50)');balance('$112.50')
  assert page.evaluate('JSON.parse(localStorage.getItem("little-town-worlds-v3")).moneyCents')==11250
  page.reload();balance('$112.50')
  assert page.evaluate('playerMoney.debit(113)') is False;balance('$112.50')
  page.locator('#reset').click();balance('$112.50')
  page.evaluate("mapKey='town';x=current().train.x;y=current().train.y;travelCooldown=0;update();boardTrain()")
  page.wait_for_function("mapKey==='suburbs'&&!busy")
  balance('$112.50');page.reload();balance('$112.50')
  assert page.evaluate('mapKey')=='suburbs'
  page.evaluate('playerMoney.debit(112.50)');page.reload();balance('$0')
  # Existing saves retain their other fields while the money field defaults.
  for key in ['little-town-worlds-v3','little-town-scenic-v2']:
   reload_save({'map':'suburbs','x':210,'y':1250,'facing':'west','labels':False},key)
   balance('$100');assert page.evaluate('mapKey')=='suburbs'
   assert page.evaluate('labels') is False
  for invalid in [-1,1.5,'10000',None,9007199254740992]:
   reload_save({'moneyCents':invalid});balance('$100')
  page.evaluate("localStorage.setItem('little-town-worlds-v3','{broken')");page.reload();balance('$100')
  reload_save({'moneyCents':12345});balance('$123.45')
  for width,height in [(1920,1080),(701,800),(700,800),(375,812),(320,640)]:
   page.set_viewport_size({'width':width,'height':height})
   for flip in [False,True]:
    page.evaluate("flip=>{mapKey='town';renderMap();if(flip){x=1900;y=35;camX=innerWidth-80-x*scale;camY=30-y*scale;}placeHUD()}",flip)
    bounds=page.evaluate('''()=>{
     const rect=id=>{const r=$(id).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
     return {money:rect('money-hud'),tools:rect('hud'),badge:rect('badge')};
    }''')
    m=bounds['money'];assert m['left']>=0 and m['right']<=width and m['top']>=0 and m['bottom']<=height,bounds
    for key in ['tools','badge']:
     r=bounds[key];assert m['right']<=r['left'] or m['left']>=r['right'] or m['bottom']<=r['top'] or m['top']>=r['bottom'],(width,flip,bounds)
   page.evaluate("mapKey='town';x=120;y=1300;renderMap()")
   if width in [1920,375]:page.screenshot(path='/tmp/little-town-money-'+str(width)+'.png')
  page.keyboard.press('h');assert not page.locator('#money-hud').is_visible()
  page.keyboard.press('h');assert page.locator('#money-hud').is_visible()
  # Extremely large valid saves still fit within the smallest supported viewport.
  reload_save({'moneyCents':9007199254740991})
  assert page.locator('#money-hud').bounding_box()['x']+page.locator('#money-hud').bounding_box()['width']<=320
  # In-memory gameplay also works with browser storage denied.
  isolated=browser.new_context()
  isolated.add_init_script("window.requestAnimationFrame=()=>0;Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}})")
  other=isolated.new_page();other.on('pageerror',lambda e:errors.append(str(e)));other.goto(url)
  assert other.locator('#money-balance').inner_text()=='$100'
  other.evaluate('playerMoney.credit(5);playerMoney.debit(2.25)')
  assert other.locator('#money-balance').inner_text()=='$102.75'
  assert not errors,errors
  print('PASS: money HUD assets, $100/old/invalid saves, earn/spend/reload/zero, reset and train travel, blocked storage, accessible updates, responsive non-overlap and H visibility')
  browser.close()
finally:
 server.shutdown();server.server_close()
