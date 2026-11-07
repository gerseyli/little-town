"""Entrance Space after real map-control focus; Whole map and saved cross-map zoom."""
from playwright.sync_api import sync_playwright
import http.server,threading,json
from pathlib import Path
from functools import partial
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parents[1]/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  errors=[]
  context=browser.new_context(viewport={'width':1440,'height':1000})
  context.add_init_script('window.requestAnimationFrame=()=>0')
  page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  url='http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html';page.goto(url)
  # Normal arrow-key walking retains focus on the last clicked map button.
  for selector in ['#zoomin','#zoomout','#labels','#fit','[data-dir="ArrowRight"]']:
   page.evaluate("mapKey='town';x=820;y=1020;facing='east';angle=90;clearKeys();renderMap();last=1000")
   button=page.locator(selector)
   if selector.startswith('[data-dir'):button.focus()
   else:button.click()
   page.keyboard.down('ArrowRight');page.evaluate('for(let i=1;i<=24;i++)tick(1000+i*1000/60)');page.keyboard.up('ArrowRight')
   assert page.locator('#enter-place').is_visible()
   before=page.evaluate('({focus:document.activeElement.id||document.activeElement.getAttribute("data-dir"),x,y,facing,angle})')
   page.keyboard.down('Space')
   entered=page.locator('#interior-dialog').is_visible()
   print('entrance Space after',selector,'focus',before['focus'],'entered',entered,flush=True)
   assert entered,('Visible entrance prompt ignored Space after focused map control',selector,before)
   page.keyboard.down('Space');page.keyboard.up('Space')
   assert page.locator('#interior-dialog').is_visible(),'Space release/repeat must not close the interior'
   page.keyboard.press('Escape')
   after=page.evaluate('({x,y,facing,angle})')
   assert all(after[key]==before[key] for key in after),('Space must not take a walking-button step',before,after)
   assert page.evaluate('!busy&&!activeInterior&&held.size===0')
  context.close()
  # Fresh saves default to a completely visible map. Restore fixtures after unload-save.
  context=browser.new_context(viewport={'width':1440,'height':1000})
  context.add_init_script('''window.requestAnimationFrame=()=>0;
   {const raw=sessionStorage.getItem('view-test-save');if(raw){localStorage.clear();localStorage.setItem('little-town-worlds-v3',raw);sessionStorage.removeItem('view-test-save');}}
  ''')
  page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url)
  def check_zoom(expected):
   assert abs(page.evaluate('zoom')-expected)<1e-9,(expected,page.evaluate('zoom'))
   assert abs(page.evaluate('scale/fitScale()')-expected)<1e-9
   assert page.locator('#zoomvalue').inner_text()==str(round(expected*100))+'%'
  def check_whole_map():
   check_zoom(1)
   assert page.locator('#mapart').evaluate('''e=>{const r=e.getBoundingClientRect();return r.x>=-.1&&r.y>=-.1&&r.right<=innerWidth+.1&&r.bottom<=innerHeight+.1}''')
  check_whole_map();page.screenshot(path='/tmp/little-town-default-whole-map.png')
  for _ in range(3):page.locator('#zoomin').click()
  check_zoom(1.6)
  assert abs(page.evaluate('JSON.parse(localStorage.getItem("little-town-worlds-v3")).zoom')-1.6)<1e-9
  def train_to(target):
   page.evaluate("x=current().train.x;y=current().train.y;travelCooldown=0;context=null;update();$('camera').focus()")
   page.keyboard.press('Space')
   page.wait_for_function("target=>mapKey===target&&!busy",arg=target,polling=100)
  train_to('suburbs');check_zoom(1.6)
  page.reload();assert page.evaluate('mapKey')=='suburbs';check_zoom(1.6)
  train_to('town');check_zoom(1.6)
  page.locator('#fit').click();check_whole_map()
  train_to('suburbs');check_whole_map()
  page.locator('#zoomin').click();check_zoom(1.2)
  page.set_viewport_size({'width':375,'height':812});check_zoom(1.2)
  page.set_viewport_size({'width':1600,'height':1000});check_zoom(1.2)
  page.locator('#reset').click();check_zoom(1.2)
  page.reload();check_zoom(1.2)
  # Existing/malformed view preferences use Whole map without losing the old balance/map.
  for value in [None,0,4,'1.6']:
   fixture={'map':'suburbs','moneyCents':12345}
   if value is not None:fixture['zoom']=value
   page.evaluate("raw=>sessionStorage.setItem('view-test-save',raw)",json.dumps(fixture));page.reload()
   assert page.evaluate('mapKey')=='suburbs';assert page.locator('#money-balance').inner_text()=='$123.45'
   check_whole_map()
  assert not errors,errors
  print('PASS: Space entry after focused zoom/labels/fit/walking buttons, no native button side effects or repeats; default Whole map; chosen zoom across train round trips, reload, resize/reset; old/invalid view preferences')
  browser.close()
finally:
 server.shutdown();server.server_close()
