const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),ctx=vm.createContext({assert,AbortController,setTimeout,clearTimeout,Float32Array});
for(const file of ['voice-matching','voice-input'])vm.runInContext(fs.readFileSync(path.join(root,'src/'+file+'.js'),'utf8'),ctx);
const match=(text,words=[])=>JSON.parse(vm.runInContext('JSON.stringify(analyzePharmacySpeech('+JSON.stringify(text)+','+JSON.stringify(words)+'))',ctx));
for(const text of ['headache','I have a headache.','I has a headache','I got headache','HEADACHE!','head ache','headaches'])assert.deepEqual(match(text).matched,['headache'],text);
const cases={
 'my stomach hurts':['stomachache'],'food poisoning':['food-poisoning'],'I has back pain':['backache'],'tooth ache':['toothache'],
 'I have a high temperature':['fever'],'I keep coughing':['cough'],'I have influenza':['flu'],'my nose is running':['runny-nose'],
 'my throat is sore':['sore-throat'],'I am sun burnt':['sunburn'],'mosquito bites':['insect-bite'],
 'headache and sore throat':['headache','sore-throat'],'I has a headache and back ache and a fever':['headache','backache','fever'],
 'I do not have a headache, but I have a sore throat':['sore-throat'],
 "I don't have a fever or cough but I have toothache":['toothache'],
 'I have no headache and I have a fever':['fever'],
 'not only a headache but also a fever':['headache','fever'],
 "I can't stop coughing":['cough'],
 'headache not anymore':[], 'no fever':[], 'without a cough':[], 'remove headache':[],
 'I would like some coffee':[], 'I feel sick':[], 'hello how are you':[]
};
for(const [text,expected] of Object.entries(cases))assert.deepEqual(match(text).matched.sort(),expected.sort(),text);
assert.deepEqual(match('no fever and no cough').negated.sort(),['cough','fever']);
assert.deepEqual(match('I has a headache',[{word:'headache',conf:.2}]).matched,[]);
assert.deepEqual(match('I has a headache',[{word:'headache',conf:.2}]).uncertain,['headache']);
assert.deepEqual(match('headake').matched,[]);assert(match('headake').uncertain.includes('headache'));
assert(!match('coffee').uncertain.includes('cough'));assert.deepEqual(match('headache headache').matched,['headache']);
assert.deepEqual(match('').matched,[]);
const data=JSON.parse(fs.readFileSync(path.join(root,'src/pharmacy-data.json')));
for(const item of data.symptoms)assert(match(item.statement).matched.includes(item.id),'every supplied symptom has a voice match '+item.id);
// Vendor provenance and integrity: no network needed in CI or gameplay.
const manifest=JSON.parse(fs.readFileSync(path.join(root,'vendor/speech/manifest.json')));
for(const [file,record] of Object.entries(manifest)){
 const bytes=fs.readFileSync(path.join(root,'vendor/speech',file));assert.equal(bytes.length,record.bytes);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256,file);
}
assert.equal(manifest['vosk-model-small-en-us-0.15.tar.gz'].sha256,'f0b24bb92a48ca575b6a96500d6b543f0f079c573dfe85bbe16001fc0404e1d8');
function harness(options={}){
 let onResult=[],states=[],partial=[],records=[],streams=[],contexts=[],send,active=true;
 class Recognizer{
  constructor(){this.events={};this.removed=0;records.push(this)}setWords(){}on(name,fn){this.events[name]=fn}
  acceptWaveformFloat(){}retrieveFinalResult(){this.flushed=true}remove(){this.removed++}
  emit(name,text='headache'){this.events[name]?.({result:{text,result:[{word:text,conf:1}],partial:text}})}
 }
 const makeStream=()=>{const track={stopped:0,stop(){this.stopped++}};const stream={track,getTracks:()=>[track]};streams.push(stream);return stream};
 const deps={
  isActive:()=>active,loadModel:options.loadModel||(()=>Promise.resolve({KaldiRecognizer:Recognizer})),
  createContext:()=>{const context={sampleRate:16000,closed:0,resume:()=>Promise.resolve(),close(){this.closed++;return Promise.resolve()}};contexts.push(context);return context},
  openMicrophone:options.openMicrophone||(()=>Promise.resolve(makeStream())),
  connectAudio:async(context,stream,fn)=>{send=fn;return {close(){}}},onResult:value=>onResult.push(value),onState:value=>states.push(value),onPartial:value=>partial.push(value)
 };
 ctx.deps=deps;const input=vm.runInContext('createVoiceInput(deps)',ctx);
 return {input,records,streams,contexts,onResult,states,partial,makeStream,setActive(value){active=value}};
}
(async()=>{
 const h=harness();assert(await h.input.start());assert.equal(h.input.phase,'listening');assert(!await h.input.start(),'no duplicate take');
 h.records[0].emit('partialresult');assert.equal(h.onResult.length,0,'interim speech never applies');assert.equal(h.partial.length,1);
 h.records[0].emit('result');assert.equal(h.onResult.length,1);assert.equal(h.streams[0].track.stopped,1);assert.equal(h.contexts[0].closed,1);assert.equal(h.records[0].removed,1);
 h.records[0].emit('result');assert.equal(h.onResult.length,1,'duplicate/stale result ignored');
 assert(await h.input.start());h.input.finish();assert.equal(h.input.phase,'processing');assert.equal(h.streams[1].track.stopped,1,'stop mic before final recognition');
 h.input.cancel();h.records[1].emit('result');assert.equal(h.onResult.length,1,'cancel during processing ignores final');
 const loading=harness({loadModel:signal=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(Error(),{name:'AbortError'}))))});
 const pendingLoad=loading.input.start();loading.input.cancel();assert(!await pendingLoad);assert.equal(loading.contexts[0].closed,1);assert.equal(loading.streams.length,0);
 let grant;const pendingMic=harness({openMicrophone:()=>new Promise(resolve=>grant=resolve)});
 const started=pendingMic.input.start();await new Promise(resolve=>setImmediate(resolve));assert.equal(pendingMic.input.phase,'permission');pendingMic.input.cancel();
 const lateStream=pendingMic.makeStream();grant(lateStream);assert(!await started);assert.equal(lateStream.track.stopped,1,'late permission grant cannot keep recording');
 const denied=harness({openMicrophone:()=>Promise.reject(Object.assign(Error(),{name:'NotAllowedError'}))});
 assert(!await denied.input.start());assert.equal(denied.input.phase,'error');assert(denied.states.at(-1).message.includes('blocked'));assert.equal(denied.contexts[0].closed,1);
 const empty=harness();await empty.input.start();empty.input.finish();empty.records[0].emit('result','');assert.equal(empty.onResult[0].text,'');assert.equal(empty.streams[0].track.stopped,1);
 const broken=harness({loadModel:()=>Promise.reject(Error('Voice model unavailable'))});assert(!await broken.input.start());assert.equal(broken.input.phase,'error');assert.equal(broken.contexts[0].closed,1);assert.equal(broken.streams.length,0);
 const left=harness();await left.input.start();left.setActive(false);left.records[0].emit('result');assert.equal(left.onResult.length,0);assert.equal(left.streams[0].track.stopped,1,'leaving a context releases audio');
 console.log('PASS: all 12 symptom keywords/grammar aliases, multiple/negative/uncertain speech, no short-word fuzzy guesses, vendor hashes, capture/final/cancel/permission/late-result lifecycle and resource cleanup');
})().catch(error=>{console.error(error);process.exitCode=1});
