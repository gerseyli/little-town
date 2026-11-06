from playwright.sync_api import sync_playwright
import json, http.server, threading
from pathlib import Path
from functools import partial
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parents[1]/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html')
 page.wait_for_timeout(800)
 print('initial',page.evaluate('({people:worldLife().people.length,traffic:worldLife().traffic.length,position:[x,y],size:[innerWidth,innerHeight]})'))
 # Verify the real animation loop advances traffic and pedestrians on both maps.
 for key in ['town','suburbs']:
  page.evaluate("key=>{mapKey=key;renderMap();frameMap(false)}",key)
  before=page.evaluate("({cars:worldLife().traffic.map(v=>v.x),people:worldLife().people.map(p=>[p.x,p.y])})")
  page.wait_for_timeout(600)
  after=page.evaluate("({cars:worldLife().traffic.map(v=>v.x),people:worldLife().people.map(p=>[p.x,p.y])})")
  assert any(abs(a-b)>1 for a,b in zip(before['cars'],after['cars'])),key+' traffic must actually move'
  assert any(abs(a[0]-b[0])+abs(a[1]-b[1])>1 for a,b in zip(before['people'],after['people'])),key+' pedestrians must actually walk'
  assert page.locator('#traffic image').count()==6
  assert page.locator('#pedestrians image').count()==6
  print('PASS:',key,'six vehicles and six pedestrians animate in the browser')
 page.evaluate("mapKey='town';x=1090;y=1150;renderMap();frameMap(false)")
 page.screenshot(path='/tmp/little-town-town.png')
 page.evaluate("mapKey='suburbs';x=2134.375;y=1230;renderMap();frameMap(false)")
 page.screenshot(path='/tmp/little-town-suburbs.png')
 page.evaluate("mapKey='town';renderMap();x=worldLife().people[0].x+10;y=worldLife().people[0].y;update();followPlayer(true);updatePersonPrompt()")
 page.wait_for_timeout(100)
 assert page.locator('#ask-directions').is_visible()
 page.keyboard.press('Space')
 assert page.locator('#directions-dialog').evaluate('(d)=>d.open')
 page.locator('[data-destination-map="suburbs"][data-destination="themepark"]').click()
 print('directions',page.locator('#directions-answer').inner_text())
 page.screenshot(path='/tmp/little-town-directions.png')
 page.keyboard.press('Escape')
 assert not page.locator('#directions-dialog').evaluate('(d)=>d.open')
 page.evaluate("mapKey='suburbs';renderMap();x=worldLife().people[1].x;y=worldLife().people[1].y+15;followPlayer(true);update();updatePersonPrompt()")
 page.locator('#ask-directions').click()
 page.locator('[data-destination-map="town"][data-destination="pharmacy"]').click()
 assert 'train' in page.locator('#directions-answer').inner_text().lower()
 print('errors',errors)
 assert not errors
 browser.close()
