"""Actual Vosk model/ASR in an opaque-origin Blob worker, as with local-file URLs."""
from pathlib import Path
from functools import partial
from playwright.sync_api import sync_playwright
import http.server,threading,subprocess,tempfile,json
root=Path(__file__).resolve().parents[1];site=root/'dist/preview-site'
model=next((site/'assets').glob('speech-model-*.tar.gz')).name
engine=next((site/'assets').glob('speech-engine-*.js')).name
wav=Path(tempfile.gettempdir())/'little-town-opaque-voice.wav'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-f','lavfi','-i',"flite=text='I has a headache':voice=slt",'-ar','16000','-ac','1','-y',str(wav)],check=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def end_headers(self):self.send_header('Access-Control-Allow-Origin','*');super().end_headers()
 def do_GET(self):
  if self.path=='/fixture.wav':
   data=wav.read_bytes();self.send_response(200);self.send_header('Content-Type','audio/wav');self.send_header('Content-Length',len(data));self.end_headers();self.wfile.write(data)
  else:super().do_GET()
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(site)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page();origin='http://127.0.0.1:'+str(server.server_port)
  page.goto(origin+'/');page.evaluate('()=>{const iframe=document.createElement("iframe");iframe.id="opaque-voice";iframe.sandbox="allow-scripts";iframe.srcdoc="<!doctype html><html><head></head><body>Opaque speech fixture</body></html>";document.body.append(iframe)}')
  page.locator('#opaque-voice').wait_for(state='attached');frame=page.locator('#opaque-voice').element_handle().content_frame()
  frame.add_script_tag(url=origin+'/assets/'+engine)
  result=frame.evaluate('''async({modelURL,audioURL})=>{
   const url=URL.createObjectURL(await(await fetch(modelURL)).blob());
   if(!url.startsWith('blob:null/'))throw Error('Test did not establish an opaque origin: '+url);
   const model=new Vosk.Model(url,-1);
   await new Promise((resolve,reject)=>{model.on('load',message=>message.result?resolve():reject(Error('Model failed')));model.on('error',message=>reject(Error(message.error)));setTimeout(()=>reject(Error('Opaque model timeout')),60000)});
   URL.revokeObjectURL(url);
   const audio=new OfflineAudioContext(1,1,16000),buffer=await audio.decodeAudioData(await(await fetch(audioURL)).arrayBuffer());
   const rec=new model.KaldiRecognizer(16000);let text='';
   const done=new Promise((resolve,reject)=>{rec.on('result',message=>{if(message.result.text){text=message.result.text;resolve()}});rec.on('error',message=>reject(Error(message.error)));setTimeout(()=>reject(Error('Opaque ASR timeout')),15000)});
   const data=buffer.getChannelData(0);for(let i=0;i<data.length;i+=4096)rec.acceptWaveformFloat(data.slice(i,i+4096),16000);rec.retrieveFinalResult();await done;rec.remove();model.terminate();return {url,text};
  }''',dict(modelURL=origin+'/assets/'+model,audioURL=origin+'/fixture.wav'))
  assert 'headache' in result['text'],result
  print('PASS: real Vosk model and ASR load in an opaque blob:null worker, with no IndexedDB; learner phrase:',result['text'])
  browser.close()
finally:server.shutdown();server.server_close()
