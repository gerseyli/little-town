"""Real Vosk/WASM + synthetic speech through Chromium's capture pipeline.
No claims of testing a student's accent or a physical microphone.
"""
from playwright.sync_api import sync_playwright
import http.server,threading,json,subprocess,tempfile
from pathlib import Path
from functools import partial
root=Path(__file__).resolve().parents[1]
wav=Path(tempfile.gettempdir())/'little-town-voice-fixture.wav'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-f','lavfi','-i',"flite=text='I have a headache and a sore throat':voice=slt",'-af','apad=pad_dur=2','-ar','48000','-ac','1','-c:a','pcm_s16le','-y',str(wav)],check=True)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(http.server.SimpleHTTPRequestHandler,directory=str(root/'dist/preview-site')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+str(wav)])
  context=browser.new_context(viewport={'width':1920,'height':1080});page=context.new_page();errors=[];requests=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
  page.add_init_script('window.requestAnimationFrame=()=>0')
  url='http://127.0.0.1:'+str(server.server_port)+'/'
  page.goto(url);page.locator('#game').wait_for(state='visible');game=page.locator('#game').element_handle().content_frame()
  def voice_wait(expression,**options):
   try:return game.wait_for_function(expression,polling=100,**options)
   except Exception:
    print('WAIT DIAGNOSTIC',expression,game.evaluate('({state:pharmacyVoiceState,result:pharmacyVoiceResult,partial:pharmacyVoicePartial,phase:pharmacyVoiceInput.phase,audio:window.voiceTestContext?.state,time:window.voiceTestContext?.currentTime,packets:window.voiceTestContext?._voicePackets,peak:window.voiceTestContext?._voicePeak,tracks:window.voiceTestTracks?.map(track=>track.readyState)})'),errors,flush=True);raise
  game.evaluate('x=900;y=1020;renderMap();enterPlace()');game.locator('#chemist').click()
  assert game.locator('#voice-label').inner_text()=='Voice: off'
  assert not [r for r in requests if '/speech-' in r],'engine/model must be lazy'
  game.evaluate('''()=>{window.voiceTestTracks=[];window.realVoiceMicrophone=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
   const resume=AudioContext.prototype.resume;AudioContext.prototype.resume=function(){window.voiceTestContext=this;return resume.call(this)};
   window.voicePackets=0;window.voicePeak=0;const Worklet=AudioWorkletNode;window.AudioWorkletNode=class extends Worklet{constructor(...args){super(...args);const context=args[0];context._voicePackets=0;context._voicePeak=0;this.port.addEventListener('message',event=>{voicePackets++;context._voicePackets++;for(const value of event.data){voicePeak=Math.max(voicePeak,Math.abs(value));context._voicePeak=Math.max(context._voicePeak,Math.abs(value))}})}};
   navigator.mediaDevices.getUserMedia=async options=>{const stream=await realVoiceMicrophone(options);voiceTestTracks.push(...stream.getTracks());return stream}}''')
  game.locator('#symptom-fever').click()
  before=game.evaluate('({wallet:playerMoney.balanceCents,banking:banking.snapshot()})')
  game.locator('#voice-toggle').click()
  try:voice_wait('pharmacyVoiceResult?.heard&&pharmacyVoiceInput.phase==="idle"',timeout=40000)
  except Exception:
   print('VOICE DIAGNOSTIC',game.evaluate('({state:pharmacyVoiceState,result:pharmacyVoiceResult,partial:pharmacyVoicePartial,active:pharmacyVoiceActive(),phase:pharmacyVoiceInput.phase,audio:voiceTestContext?.state,time:voiceTestContext?.currentTime,rate:voiceTestContext?.sampleRate,tracks:voiceTestTracks.map(track=>({state:track.readyState,muted:track.muted})),packets:voicePackets,peak:voicePeak,errors:window.voiceErrors})'),errors,flush=True);page.screenshot(path='/tmp/voice-failure.png');raise
  heard=game.evaluate('pharmacyVoiceResult');print('REAL ASR:',heard,flush=True)
  assert set(heard['matched'])=={'headache','sore-throat'}
  assert game.evaluate('[...pharmacySession.selected].sort()')==['fever','headache','sore-throat']
  for id in ['fever','headache','sore-throat']:assert game.locator('#symptom-'+id).get_attribute('aria-pressed')=='true'
  assert game.evaluate('voiceTestTracks.every(track=>track.readyState==="ended")')
  assert game.evaluate('({wallet:playerMoney.balanceCents,banking:banking.snapshot()})')==before
  assert game.locator('#voice-toggle').get_attribute('aria-pressed')=='true'
  assert game.locator('#voice-status').inner_text()=='Ready'
  assert game.locator('#voice-heard').inner_text().startswith('Heard:')
  page.screenshot(path='/tmp/little-town-voice-1920.png')
  # A new take never toggles already selected symptoms off.
  game.locator('#voice-speak').click();voice_wait('pharmacyVoiceResult?.heard&&pharmacyVoiceInput.phase==="idle"',timeout=30000)
  assert game.evaluate('[...pharmacySession.selected].sort()')==['fever','headache','sore-throat']
  # Manual correction takes control, cancelling in-flight final results.
  game.locator('#voice-speak').click();voice_wait('pharmacyVoiceInput.phase==="listening"')
  game.evaluate('window.oldVoiceRecognizer=[...warmSpeechModel.recognizers.values()][0]')
  game.locator('#symptom-headache').click();assert game.locator('#symptom-headache').get_attribute('aria-pressed')=='false'
  game.evaluate("oldVoiceRecognizer.dispatchEvent(new CustomEvent('result',{detail:{result:{text:'headache',result:[{word:'headache',conf:1}]}}}))")
  assert game.locator('#symptom-headache').get_attribute('aria-pressed')=='false'
  assert game.evaluate('voiceTestTracks.every(track=>track.readyState==="ended")')
  # Confirmations/suggestions and negations are adapter logic, not forced ASR guesses.
  game.locator('#voice-speak').click();voice_wait('pharmacyVoiceInput.phase==="listening"')
  game.evaluate("[...warmSpeechModel.recognizers.values()][0].dispatchEvent(new CustomEvent('result',{detail:{result:{text:'no toothache but I has backache',result:[{word:'toothache',conf:1},{word:'backache',conf:.2}]}}}))")
  assert game.locator('#symptom-toothache').get_attribute('aria-pressed')=='false'
  assert game.locator('#symptom-backache').get_attribute('aria-pressed')=='false'
  assert 'backache' in game.locator('#voice-suggestions').inner_text()
  game.locator('[data-voice-symptom="backache"]').click();assert game.locator('#symptom-backache').get_attribute('aria-pressed')=='true'
  # Permission denial and permission granted after cancellation cannot leak audio.
  game.evaluate("()=>{navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('denied','NotAllowedError'))}")
  game.locator('#voice-speak').click();voice_wait('pharmacyVoiceInput.phase==="error"')
  assert 'blocked' in game.locator('#voice-hint').inner_text()
  game.evaluate('()=>{navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>window.grantVoiceLater=resolve)}')
  game.locator('#voice-speak').click();voice_wait('pharmacyVoiceInput.phase==="permission"');game.locator('#voice-toggle').click()
  game.evaluate('''async()=>{const stream=await realVoiceMicrophone({audio:true});voiceTestTracks.push(...stream.getTracks());grantVoiceLater(stream)}''')
  voice_wait('voiceTestTracks.every(track=>track.readyState==="ended")')
  assert not game.evaluate('voiceModeEnabled||pharmacyVoiceInput.active')
  game.evaluate('()=>{navigator.mediaDevices.getUserMedia=async options=>{const stream=await realVoiceMicrophone(options);voiceTestTracks.push(...stream.getTracks());return stream}}')
  game.locator('#voice-toggle').click();voice_wait('pharmacyVoiceInput.phase==="listening"');page.keyboard.press('Escape')
  assert not game.locator('#pharmacy-shop').is_visible()
  assert game.evaluate('voiceTestTracks.every(track=>track.readyState==="ended")&&!pharmacyVoiceInput.active')
  game.locator('#chemist').click();assert game.locator('#voice-label').inner_text()=='Voice: on'
  assert game.evaluate('!pharmacyVoiceInput.active'),'returning to a screen must not activate the mic'
  # Readable/scrollable controls coexist with all twelve manual pictures.
  for width,height in [(1920,1080),(1440,1000),(1024,768),(375,812),(812,375),(320,640)]:
   page.set_viewport_size({'width':width,'height':height})
   game.locator('#pharmacy-voice').scroll_into_view_if_needed()
   assert game.locator('#pharmacy-voice').evaluate('el=>el.scrollWidth<=el.clientWidth+1')
   assert game.locator('#shop-scroll').evaluate('el=>el.clientHeight>30')
   assert game.locator('#voice-toggle').is_visible()
   if width in [375,320]:page.screenshot(path='/tmp/little-town-voice-'+str(width)+'.png')
  page.set_viewport_size({'width':1440,'height':1000})
  # Real recognition also runs after networking is disabled with the loaded model.
  context.set_offline(True)
  game.locator('#voice-speak').click();voice_wait('pharmacyVoiceResult?.heard&&pharmacyVoiceInput.phase==="idle"',timeout=30000)
  assert 'headache' in game.evaluate('pharmacyVoiceResult.matched')
  assert game.evaluate('voiceTestTracks.every(track=>track.readyState==="ended")')
  game.locator('#pharmacy-recommend').click();assert not game.locator('#pharmacy-voice').is_visible()
  assert not game.evaluate('pharmacyVoiceInput.active')
  context.set_offline(False);page.reload();page.locator('#game').wait_for(state='visible');game=page.locator('#game').element_handle().content_frame()
  game.evaluate('x=900;y=1020;renderMap();enterPlace()');game.locator('#chemist').click()
  assert game.locator('#voice-label').inner_text()=='Voice: on'
  assert game.evaluate('!pharmacyVoiceInput.active&&typeof Vosk==="undefined"'),'preference survives reload without starting microphone/model'
  # Cancel a cold model load immediately: a later script/model callback cannot record.
  game.locator('#voice-toggle').click();game.locator('#voice-toggle').click();game.locator('#voice-toggle').click()
  voice_wait('!pharmacyVoiceInput.active&&!voiceModeEnabled')
  assert game.evaluate('!warmSpeechModel')
  # Unsupported APIs leave the entire manual selection flow available.
  game.evaluate('()=>{Object.defineProperty(navigator,"mediaDevices",{value:undefined,configurable:true});renderPharmacyVoice()}')
  assert game.locator('#voice-toggle').is_disabled()
  game.locator('#symptom-headache').click();assert game.locator('#symptom-headache').get_attribute('aria-pressed')=='true'
  assert not errors,errors
  print('PASS: real offline Vosk/WASM audio capture, keyword multi-selection/manual preservation, generated controls, lazy model, duplicate/stale/uncertain/negative results, permission/cancel/re-entry, stopped tracks, responsive UI and unchanged money/calendar')
  browser.close()
finally:
 server.shutdown();server.server_close()
