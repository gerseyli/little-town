// Reusable single-take voice controller. Screens supply their own result adapter.
function createVoiceInput(deps){
 let current=null,phase='idle';
 const state=(next,message='')=>{phase=next;deps.onState?.({phase,message})};
 const valid=run=>current===run&&!run.cancelled&&deps.isActive();
 function releaseAudio(run){
  clearTimeout(run.quietTimer);clearTimeout(run.maxTimer);
  try{run.graph?.close()}catch{}
  for(const track of run.stream?.getTracks()||[]){track.removeEventListener?.('ended',run.trackEnded);track.stop()}
  run.stream=null;run.graph=null;
  try{const closed=run.context?.close();closed?.catch?.(()=>{})}catch{}
  run.context=null;
 }
 function dispose(run){
  run.cancelled=true;clearTimeout(run.finalTimer);releaseAudio(run);run.abort.abort();
  run.model?.removeEventListener?.('error',run.modelError);
  try{run.recognizer?.remove()}catch{}
  run.recognizer=null;
 }
 function cancel(message=''){
  const run=current;current=null;if(run)dispose(run);state('idle',message);
 }
 function fail(run,error){
  if(!valid(run)){if(current===run)cancel();return}
  current=null;dispose(run);state('error',voiceInputError(error));
 }
 function final(run,message){
  if(!valid(run)){if(current===run)cancel();return}
  if(!['listening','processing'].includes(phase))return;
  const result=message?.result||{};current=null;dispose(run);state('idle');
  if(deps.isActive())deps.onResult({text:typeof result.text==='string'?result.text:'',words:Array.isArray(result.result)?result.result:[]});
 }
 function finish(){
  const run=current;if(!run||!valid(run)||phase!=='listening')return;
  releaseAudio(run);state('processing','Recognizing your words …');
  run.finalTimer=setTimeout(()=>fail(run,new Error('The words took too long to recognize. Please try again.')),6000);
  try{run.recognizer.retrieveFinalResult()}catch(error){fail(run,error)}
 }
 function samples(run,data,sampleRate){
  if(!valid(run)){if(current===run)cancel();return}
  if(phase!=='listening'||!(data instanceof Float32Array))return;
  let energy=0;for(const value of data)energy+=value*value;
  if(Math.sqrt(energy/Math.max(1,data.length))>.008){
   run.heardSound=true;clearTimeout(run.quietTimer);run.quietTimer=setTimeout(finish,1400);
  }
  try{run.recognizer.acceptWaveformFloat(data,sampleRate)}catch(error){fail(run,error)}
 }
 async function start(){
  if(current||!deps.isActive())return false;
  const run={abort:new AbortController(),cancelled:false};current=run;
  try{
   state('loading','Loading the English voice engine …');
   // Create/resume the context within the user's click, before asynchronous work.
   run.context=deps.createContext();
   const [model]=await Promise.all([deps.loadModel(run.abort.signal),run.context.resume()]);
   if(!valid(run)){if(current===run)cancel();return false}
   run.model=model;run.modelError=event=>{
    if(event?.detail?.recognizerId&&event.detail.recognizerId!==run.recognizer?.id)return;
    fail(run,new Error('The voice engine stopped. Press Speak to try again.'));
   };
   model.addEventListener?.('error',run.modelError);
   state('permission','Allow microphone access to describe your symptoms.');
   const stream=await deps.openMicrophone();
   if(!valid(run)){for(const track of stream.getTracks())track.stop();if(current===run)cancel();return false}
   run.stream=stream;run.trackEnded=()=>fail(run,new Error('The microphone stopped. Reconnect it and press Speak to try again.'));
   for(const track of stream.getTracks())track.addEventListener?.('ended',run.trackEnded,{once:true});
   run.recognizer=new model.KaldiRecognizer(run.context.sampleRate);run.recognizer.setWords(true);
   run.recognizer.on('result',message=>final(run,message));
   run.recognizer.on('partialresult',message=>{if(valid(run)&&phase==='listening')deps.onPartial?.(String(message.result?.partial||'').slice(0,500))});
   run.recognizer.on('error',message=>fail(run,new Error(message.error||'Voice recognition stopped. Please try again.')));
   const graph=await deps.connectAudio(run.context,stream,(data,rate)=>samples(run,data,rate));
   if(!valid(run)){graph.close();if(current===run)cancel();return false}
   run.graph=graph;state('listening','Listening … Say one or more symptoms, then pause.');
   run.quietTimer=setTimeout(finish,12000);run.maxTimer=setTimeout(finish,30000);return true;
  }catch(error){fail(run,error);return false}
 }
 return Object.freeze({start,finish,cancel,get phase(){return phase},get active(){return !!current}});
}
function voiceInputError(error){
 if(['NotAllowedError','SecurityError'].includes(error?.name))return 'Microphone access is blocked. Allow it in your browser settings, or click the symptom pictures.';
 if(['NotFoundError','DevicesNotFoundError'].includes(error?.name))return 'No microphone was found. Connect one, or click the symptom pictures.';
 if(['NotReadableError','TrackStartError'].includes(error?.name))return 'The microphone is busy or unavailable. Close other recording apps and try again.';
 if(error?.name==='NotSupportedError')return 'Voice input is unavailable here. Try a recent Chrome or Edge browser, or click the symptom pictures.';
 return error?.message||'Voice input stopped. Please try again, or click the symptom pictures.';
}
