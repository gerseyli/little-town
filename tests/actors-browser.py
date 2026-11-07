"""Deterministic Chromium checks for atlas decoding, gait frames and idle views."""
from playwright.sync_api import sync_playwright
import http.server, threading
from pathlib import Path
from functools import partial
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parents[1]/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script('window.requestAnimationFrame=()=>0')
  page.goto('http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html')
  decoded=page.evaluate('''async()=>{
   const entries=Object.entries(ASSETS).filter(([key])=>key.startsWith('walk-'));
   return Promise.all(entries.map(async([key,src])=>{const image=new Image();image.src=src;await image.decode();
    if(image.width!==image.height)throw Error('Non-square atlas '+key);
    return key;
   }));
  }''')
  assert len(decoded)==7,decoded
  for facing,dx,dy,row in [('south',0,1,0),('west',-1,0,1),('east',1,0,2),('north',0,-1,3)]:
   page.evaluate('(value)=>{facing=value}',facing)
   frames=page.evaluate('''([facing,dx,dy])=>{
    mapKey='town';x=300;y=1150;touristGait.distance=0;renderMap();setZoom(3);followPlayer(true);
    const frames=[];
    for(let i=0;i<4;i++){move(dx,dy,24/SPEED);renderActor('walkerart',touristGait,facing,96);update();
     renderActor('walkerart',touristGait,facing,96);frames.push($('walkerart').getAttribute('viewBox'));
    }
    touristGait.moving=false;renderActor('walkerart',touristGait,facing,96);
    return frames;
   }''',[facing,dx,dy])
   assert {f'{i} {row} 1 1' for i in range(4)}==set(frames),(facing,frames)
   assert page.locator('#walkerart').get_attribute('viewBox')==f'1 {row} 1 1'
   page.screenshot(path=f'/tmp/little-town-walk-{facing}.png')
  page.evaluate("mapKey='town';x=300;y=1150;renderMap();frameMap(1);nearbyPerson=null;conversationPerson=null;advancePeople(.4);renderLife()")
  assert page.locator('#pedestrians svg').count()==6
  before=page.locator('#person-sprite-0').get_attribute('viewBox')
  page.evaluate('advancePeople(.4);renderLife()')
  after=page.locator('#person-sprite-0').get_attribute('viewBox')
  assert before!=after,(before,after)
  page.screenshot(path='/tmp/little-town-animated-pedestrians.png')
  assert not errors,errors
  print('PASS: seven atlases decode offline, all tourist directions/frames and idle views, pedestrian frame progression, no browser errors')
  browser.close()
finally:
 server.shutdown()
 server.server_close()
