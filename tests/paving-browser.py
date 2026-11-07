"""Pixel-traced paving edges, real keyboard input, labels and concise dialogue."""
from playwright.sync_api import sync_playwright
import http.server,threading
from pathlib import Path
from functools import partial
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parents[1]/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1800,'height':1200})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script('window.requestAnimationFrame=()=>0')
  page.goto('http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html')
  for py in [753,758,765,772,777]:
   page.evaluate("py=>{mapKey='town';x=180;y=py*1400/1049;held.clear();stopPlayerMotion();renderMap();last=1000}",py)
   page.keyboard.down('ArrowRight')
   result=page.evaluate("()=>{for(let i=1;i<=350;i++)tick(1000+i*1000/60);return {x,y}}")
   page.keyboard.up('ArrowRight')
   assert result['x']>1320,('Garden width blocked',py,result)
  for px in [1221,1228,1235,1242,1249]:
   page.evaluate("px=>{mapKey='suburbs';x=px/.64;y=779/.64;held.clear();stopPlayerMotion();renderMap();last=1000}",px)
   page.keyboard.down('ArrowDown')
   result=page.evaluate("()=>{for(let i=1;i<=50;i++)tick(1000+i*1000/60);return {x,y}}")
   page.keyboard.up('ArrowDown')
   assert result['y']>=1278 and result['y']<1305,('Harbor width blocked or water admitted',px,result)
  for key in ['town','suburbs']:
   page.evaluate("key=>{mapKey=key;held.clear();stopPlayerMotion();x=current().start[0];y=current().start[1];renderMap();frameMap(false)}",key)
   labels=page.evaluate("pathLabelData(mapKey)")
   assert page.locator('[data-path-label]').count()==len(labels)
   for label in labels:
    item=page.locator('[data-path-label="'+label['id']+'"]')
    assert item.text_content()==label['name']
    assert item.get_attribute('dominant-baseline')=='central'
   page.evaluate('dismissContext()');page.screenshot(path='/tmp/little-town-named-paths-'+key+'.png')
  page.locator('#labels').click()
  assert page.locator('[data-path-label]').first.evaluate("e=>getComputedStyle(e).display")=='none'
  page.locator('#labels').click()
  assert page.locator('[data-path-label]').first.evaluate("e=>getComputedStyle(e).display")!='none'
  page.evaluate("mapKey='town';renderMap();const person=worldLife().people[2];x=person.x;y=person.y;update();followPlayer(true);updatePersonPrompt()")
  assert page.locator('#ask-directions').is_visible()
  page.keyboard.press('Space')
  for key,destination in [('suburbs','mountain'),('suburbs','themepark'),('town','bakery')]:
   page.locator('[data-destination-map="'+key+'"][data-destination="'+destination+'"]').click()
   items=page.locator('#directions-answer li').all_inner_texts()
   assert 1<=len(items)<=6,items
   assert all(len(t)<=160 and len(t.split())<=28 for t in items),items
   if key=='suburbs':assert any('train' in t.lower() for t in items)
   print('directions',key,destination,items)
  page.screenshot(path='/tmp/little-town-concise-directions.png')
  assert not errors,errors
  print('PASS: keyboard traversal across both painted widths, named centred labels/toggle, and concise directions dialogue')
  browser.close()
finally:
 server.shutdown();server.server_close()
