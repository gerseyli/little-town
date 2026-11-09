let speechLibraryPromise=null,warmSpeechModel=null;
function voiceAbort(){const error=new Error('Voice input cancelled.');error.name='AbortError';return error}
function loadSpeechLibrary(){
 if(globalThis.Vosk)return Promise.resolve(globalThis.Vosk);
 if(!speechLibraryPromise)speechLibraryPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script'),timer=setTimeout(()=>finish(Error('The voice engine could not load. Please try again.')),45000);
  function finish(error){clearTimeout(timer);script.onload=script.onerror=null;if(error){script.remove();speechLibraryPromise=null;reject(error)}else resolve(globalThis.Vosk)}
  script.onload=()=>finish(globalThis.Vosk?null:Error('The voice engine is unavailable.'));
  script.onerror=()=>finish(Error('The voice engine could not load. Please try again.'));
  script.src=SPEECH_ASSETS.engine;document.head.append(script);
 });return speechLibraryPromise;
}
async function loadLocalSpeechModel(signal){
 if(signal.aborted)throw voiceAbort();
 if(warmSpeechModel?.ready)return warmSpeechModel;
 const library=await loadSpeechLibrary();if(signal.aborted)throw voiceAbort();
 // Use a Blob URL for the embedded archive: data URLs exceed filesystem path
 // limits in the engine. The derived worker keeps its files in memory only.
 let url=SPEECH_ASSETS.model,temporary=false;
 if(url.startsWith('data:')){const response=await fetch(url,{signal});url=URL.createObjectURL(await response.blob());temporary=true}
 if(signal.aborted){if(temporary)URL.revokeObjectURL(url);throw voiceAbort()}
 else if(!temporary)url=new URL(url,location.href).href;
 return new Promise((resolve,reject)=>{
  let model,settled=false;
  const timer=setTimeout(()=>finish(Error('The English voice model took too long to load. Please try again.')),90000);
  function finish(error){
   if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener('abort',abort);
   if(temporary)URL.revokeObjectURL(url);
   if(error){try{model?.worker?.terminate()}catch{}reject(error)}else{warmSpeechModel=model;resolve(model)}
  }
  const abort=()=>finish(voiceAbort());signal.addEventListener('abort',abort,{once:true});
  try{
   model=new library.Model(url,-1);
   model.on('load',message=>finish(message.result?null:Error('The English voice model could not load.')));
   model.on('error',()=>{if(warmSpeechModel===model)warmSpeechModel=null;model._ready=false;try{model.worker?.terminate()}catch{}finish(Error('The English voice model could not load. Please try again.'))});
   model.worker?.addEventListener('error',()=>{
    const wasReady=settled;model._ready=false;if(warmSpeechModel===model)warmSpeechModel=null;
    finish(Error('The voice engine stopped. Please try again.'));
    if(wasReady)model.dispatchEvent(new CustomEvent('error',{detail:{event:'error',error:'Voice worker stopped.'}}));
   });
  }catch(error){finish(error)}
 });
}
function voiceSupported(){return !!(globalThis.navigator?.mediaDevices?.getUserMedia&&(globalThis.AudioContext||globalThis.webkitAudioContext)&&globalThis.Worker&&globalThis.WebAssembly)}
function createVoiceAudioContext(){
 if(!voiceSupported()){const error=Error();error.name='NotSupportedError';throw error}
 const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
 try{return new Audio({sampleRate:16000})}catch{return new Audio()}
}
async function connectVoiceAudio(context,stream,send){
 let processor,source,gain;
 if(context.audioWorklet&&globalThis.AudioWorkletNode){
  try{
   await context.audioWorklet.addModule(SPEECH_ASSETS.worklet);
   processor=new AudioWorkletNode(context,'little-town-voice-capture');
   processor.port.onmessage=event=>send(event.data,context.sampleRate);
  }catch{processor=null}
 }
 // Compatibility for browsers/file contexts without AudioWorklet support.
 if(!processor){processor=context.createScriptProcessor(4096,1,1);processor.onaudioprocess=event=>send(event.inputBuffer.getChannelData(0),context.sampleRate)}
 source=context.createMediaStreamSource(stream);gain=context.createGain();gain.gain.value=0;
 source.connect(processor);processor.connect(gain);gain.connect(context.destination);
 return {close(){
  if(processor.port){processor.port.onmessage=null;processor.port.close()}
  processor.onaudioprocess=null;source.disconnect();processor.disconnect();gain.disconnect();
 }};
}
