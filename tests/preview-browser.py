"""Play the static web build below a Pages-style path; verify update/save behaviour."""
from playwright.sync_api import sync_playwright
from pathlib import Path
from functools import partial
import http.server,threading,tempfile,json,hashlib
root=Path(__file__).resolve().parents[1];site=root/'dist/preview-site'
original_version=(site/'version.json').read_bytes();replacement=None
with tempfile.TemporaryDirectory() as directory:
 (Path(directory)/'little-town').symlink_to(site,target_is_directory=True)
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=directory))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
   page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];failures=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('response',lambda r:failures.append((r.status,r.url)) if r.status>=400 and '/little-town/' in r.url else None)
   page.add_init_script('window.requestAnimationFrame=()=>0')
   url='http://127.0.0.1:'+str(server.server_port)+'/little-town/'
   def game_frame():
    page.locator('#game').wait_for(state='visible')
    return page.locator('#game').element_handle().content_frame()
   page.goto(url);game=game_frame()
   assert page.url==url and '/game-' in game.url
   assert game.locator('#zoomvalue').inner_text()=='100%'
   assert game.locator('#money-balance').inner_text()=='$100'
   assert game.evaluate("$('mapart').naturalWidth>1000")
   page.screenshot(path='/tmp/little-town-web-preview.png')
   game.evaluate("mapKey='town';x=820;y=1020;renderMap();last=1000")
   game.locator('#zoomin').click();page.keyboard.down('ArrowRight')
   game.evaluate('for(let i=1;i<=24;i++)tick(1000+i*1000/60)');page.keyboard.up('ArrowRight');page.keyboard.press('Space')
   assert game.locator('#interior-dialog').is_visible()
   game.locator('#chemist').click()
   for symptom in ['headache','food-poisoning']:game.locator('#symptom-'+symptom).click()
   game.locator('#pharmacy-recommend').click()
   for product in ['paracetamol','rehydration']:game.locator('#medicine-'+product).click()
   game.locator('#pharmacy-checkout').click()
   assert game.locator('#interior-money').inner_text()=='$89'
   assert game.locator('#chemist-art').evaluate('async img=>{await img.decode();return img.naturalWidth===1129}')
   # Simulate a later deployment. Same launcher, a new content-hashed game file.
   version=json.loads(original_version)
   updated=(site/version['game']).read_bytes()+b'\n<!-- preview update fixture -->\n'
   replacement=site/('game-'+hashlib.sha256(updated).hexdigest()[:20]+'.html');replacement.write_bytes(updated)
   version['game']=replacement.name;(site/'version.json').write_text(json.dumps(version))
   page.reload();game=game_frame()
   assert game.url.endswith(replacement.name),'refresh must load the newest version'
   assert game.locator('#money-balance').inner_text()=='$89','save survives game filename changes'
   assert game.locator('#zoomvalue').inner_text()=='120%'
   assert not failures,failures
   assert not errors,errors
   print('PASS: Pages-style subpath/launcher, external HD art, iframe keyboard entry and paid shop checkout, refreshed deployment and shared saved balance/zoom')
   browser.close()
 finally:
  (site/'version.json').write_bytes(original_version)
  if replacement:replacement.unlink(missing_ok=True)
  server.shutdown();server.server_close()
