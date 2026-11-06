"""Exercise real controls with deterministic frames, including eased camera motion."""
from playwright.sync_api import sync_playwright
import http.server,threading
from pathlib import Path
from functools import partial
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parents[1]/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script('window.requestAnimationFrame=()=>0')
  page.goto('http://127.0.0.1:'+str(server.server_port)+'/Little-Town.html')
  page.evaluate("mapKey='town';x=700;y=1300;stopPlayerMotion();held.clear();renderMap();setZoom(3);followPlayer(true);last=1000;signalEpoch=0")
  page.keyboard.down('ArrowRight')
  result=page.evaluate('''()=>{const frames=[],positions=[],camera=[];for(let i=1;i<=90;i++){tick(1000+i*1000/60);frames.push($('walkerart').getAttribute('viewBox'));positions.push(x);camera.push(camX)}return {frames,positions,camera}}''')
  assert len(set(result['frames']))>=4
  assert result['positions'][-1]>980
  assert 0<result['positions'][1]-result['positions'][0]<result['positions'][-1]-result['positions'][-2]
  assert max(abs(b-a) for a,b in zip(result['camera'],result['camera'][1:]))<25
  page.keyboard.up('ArrowRight')
  result=page.evaluate('''()=>{const before=x;for(let i=1;i<=30;i++)tick(2500+i*1000/120);const end=x;for(let i=1;i<=20;i++)tick(2750+i*1000/120);return {coast:end-before,end,after:x,idle:$('walkerart').getAttribute('viewBox'),moving:touristGait.moving}}''')
  assert result['coast']<12 and result['end']==result['after'] and not result['moving']
  assert result['idle']=='1 2 1 1'
  # Holding a key at the hotel wall must not keep cycling the legs.
  page.evaluate("x=910;y=1250;stopPlayerMotion();held.clear();followPlayer(true);last=3000")
  page.keyboard.down('ArrowUp')
  result=page.evaluate("()=>{for(let i=1;i<=90;i++)tick(3000+i*1000/60);return {y,moving:touristGait.moving,frame:$('walkerart').getAttribute('viewBox')}}")
  assert result['y']>=1245.99 and not result['moving'] and result['frame']=='1 3 1 1'
  page.keyboard.up('ArrowUp')
  page.screenshot(path='/tmp/little-town-smooth-walking.png')
  assert not errors,errors
  print('PASS: actual keyboard controls, four walking frames, smooth acceleration/camera/stop, blocked idle pose, no page errors')
  browser.close()
finally:
 server.shutdown();server.server_close()
