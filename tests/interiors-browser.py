"""Real pharmacy originals, entry priority, keyboard/focus isolation and screen layout."""
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
  page.goto('http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html')
  page.evaluate("mapKey='town';x=820;y=1020;facing='east';angle=90;renderMap();last=1000;$('camera').focus()")
  assert not page.locator('#enter-place').is_visible()
  page.keyboard.down('ArrowRight')
  page.evaluate('for(let i=1;i<=24;i++)tick(1000+i*1000/60)')
  assert page.locator('#enter-place').is_visible()
  assert page.locator('#enter-place').inner_text()=='Enter the pharmacy · Space'
  # A pedestrian at the entrance must not steal Space, including a stale click target.
  page.evaluate("const p=worldLife().people[0];p.x=x+2;p.y=y;nearbyPerson=p;updatePersonPrompt();openDirections()")
  assert not page.locator('#ask-directions').is_visible()
  assert not page.locator('#directions-dialog').is_visible()
  outside=page.evaluate('({map:mapKey,x,y,facing,angle,money:playerMoney.balanceCents})')
  page.keyboard.down('Space')
  assert page.locator('#interior-dialog').is_visible()
  page.keyboard.up('Space');page.keyboard.up('ArrowRight')
  assert page.locator('#interior-dialog').is_visible(),'opening Space keyup must not click Back outside'
  assert page.locator('#chemist-greeting').inner_text()=='Hello, how can I help you today?'
  assert page.locator('#interior-title').inner_text()=='Pharmacy'
  assert page.locator('#interior-money').inner_text()=='$100'
  assert page.evaluate('busy&&held.size===0&&!nearbyPerson&&!conversationPerson')
  assert page.evaluate('''async()=>{
   await Promise.all(['interior-background','chemist-art'].map(id=>$(id).decode()));
   return $('interior-background').naturalWidth===1672&&$('interior-background').naturalHeight===941&&$('chemist-art').naturalWidth===1129&&$('chemist-art').src===ASSETS['chemist-neutral'];
  }''')
  page.evaluate("window.chemistClicks=0;document.addEventListener('little-town:chemist-interact',()=>window.chemistClicks++)")
  page.locator('#chemist').click()
  page.locator('#chemist').focus();page.keyboard.press('Space');page.keyboard.press('Enter')
  assert page.evaluate('window.chemistClicks')==3
  assert page.evaluate("$('chemist-art').src===ASSETS['chemist-neutral']&&playerMoney.balanceCents===10000")
  # Arrow keys and repeated Space cannot start outdoor movement or open other interfaces.
  page.keyboard.down('ArrowDown');page.keyboard.down('Space');page.keyboard.down('Space')
  page.evaluate('for(let i=1;i<=10;i++)tick(2000+i*1000/60)')
  assert page.evaluate('({map:mapKey,x,y,facing,angle,money:playerMoney.balanceCents})')==outside
  assert page.evaluate('held.size')==0
  page.keyboard.up('Space');page.keyboard.up('ArrowDown')
  for _ in range(7):
   page.keyboard.press('Tab')
   assert page.evaluate("$('interior-dialog').contains(document.activeElement)")
  # Layout is measured from the real room image, without cropping the supplied art.
  for width,height in [(1920,1080),(1440,1000),(375,812),(812,375),(320,640)]:
   page.set_viewport_size({'width':width,'height':height})
   layout=page.evaluate('''()=>{
    const r=id=>{const b=$(id).getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom}};
    return {stage:r('interior-background'),chemist:r('chemist-art'),bubble:r('chemist-greeting'),exit:r('interior-exit'),clip:getComputedStyle(document.querySelector('.chemist-layer')).clipPath};
   }''')
   s=layout['stage'];assert abs(s['width']/s['height']-1672/941)<.01,layout
   assert s['x']>=-.1 and s['y']>=-.1 and s['right']<=width+.1 and s['bottom']<=height+.1,layout
   for name in ['bubble','exit']:
    r=layout[name];assert r['x']>=0 and r['y']>=0 and r['right']<=width+.1 and r['bottom']<=height+.1,(width,name,layout)
   assert layout['clip']=='inset(0px 0px 33.2%)'
   page.screenshot(path='/tmp/little-town-pharmacy-'+str(width)+'.png')
  page.locator('#interior-exit').click()
  assert not page.locator('#interior-dialog').is_visible()
  assert page.evaluate('({map:mapKey,x,y,facing,angle,money:playerMoney.balanceCents})')==outside
  assert page.evaluate("document.activeElement===$('camera')&&!busy&&held.size===0")
  page.evaluate('for(let i=1;i<=10;i++)tick(3000+i*1000/60)')
  assert page.evaluate('({map:mapKey,x,y,facing,angle,money:playerMoney.balanceCents})')==outside
  page.locator('#enter-place').click();page.keyboard.press('Escape')
  assert not page.locator('#interior-dialog').is_visible()
  # Focused entry button retains native Space activation and only opens once.
  page.locator('#enter-place').focus();page.keyboard.press('Space')
  assert page.locator('#interior-dialog').is_visible()
  page.keyboard.press('Escape')
  assert page.evaluate('!activeInterior&&!busy')
  # A queued close event from an earlier visit must not close a same-turn re-entry.
  page.evaluate('enterPlace();leavePlace();enterPlace()')
  page.wait_for_timeout(60)
  assert page.evaluate("!!activeInterior&&busy&&$('interior-dialog').open")
  page.keyboard.press('Escape')
  page.set_viewport_size({'width':1440,'height':1000})
  page.evaluate('update();followPlayer(true)');page.screenshot(path='/tmp/little-town-pharmacy-entrance.png')
  # Away from the entrance, the existing pedestrian interaction still works.
  page.evaluate("x=worldLife().people[2].x;y=worldLife().people[2].y;update();followPlayer(true);updatePersonPrompt();$('camera').focus()")
  assert page.locator('#ask-directions').is_visible()
  page.keyboard.press('Space');assert page.locator('#directions-dialog').is_visible()
  assert not errors,errors
  print('PASS: actual originals decode; keyboard walk-to-entry and entrance/pedestrian priority; neutral chemist click/keyboard hook; no held-key leakage; focus trap; exit/Escape/re-entry; money/exterior preservation; room/bubble/exit layout on desktop, portrait and landscape; directions elsewhere')
  browser.close()
finally:
 server.shutdown();server.server_close()
