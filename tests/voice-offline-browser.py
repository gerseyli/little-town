"""First-use ASR from the complete standalone HTML with networking disabled.
Synthetic learner-grammar audio; no physical-microphone/student-accent claim.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
from functools import partial
import subprocess,http.server,threading
root=Path(__file__).resolve().parents[1];wav=Path('/tmp/little-town-offline-voice.wav')
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-f','lavfi','-i',"flite=text='I has a headache':voice=slt",'-af','apad=pad_dur=3','-ar','48000','-ac','1','-c:a','pcm_s16le','-y',str(wav)],check=True)
s=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(root/'dist')));threading.Thread(target=s.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+str(wav)])
  context=b.new_context();page=context.new_page();errors=[];requests=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url) if r.url.startswith('http') else None)
  page.goto('http://127.0.0.1:'+str(s.server_port)+'/Little-Town.html',timeout=60000)
  context.set_offline(True);requests.clear()
  page.evaluate('x=900;y=1020;renderMap();enterPlace()');page.locator('#chemist').click();page.locator('#voice-toggle').click()
  try:page.wait_for_function('pharmacyVoiceResult?.heard&&pharmacyVoiceInput.phase==="idle"',polling=100,timeout=60000)
  except Exception:print('DIAGNOSTIC',page.evaluate('({state:pharmacyVoiceState,result:pharmacyVoiceResult,partial:pharmacyVoicePartial})'),errors,flush=True);raise
  result=page.evaluate('pharmacyVoiceResult');print('OFFLINE REAL ASR',result,flush=True)
  assert 'headache' in result['matched']
  assert page.locator('#symptom-headache').get_attribute('aria-pressed')=='true'
  assert not errors,errors
  assert not [r for r in requests if not r.endswith('/favicon.ico')],requests
  b.close();print('PASS: complete standalone HTML initializes real bundled engine/model and recognizes learner-grammar audio with networking disabled')
finally:s.shutdown()
