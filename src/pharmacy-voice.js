let voiceModeEnabled=false,pharmacyVoiceOwner=null,pharmacyVoiceResult=null,pharmacyVoicePartial='',voiceSuggestionKey='';
let pharmacyVoiceState={phase:'idle',message:''};
try{voiceModeEnabled=localStorage.getItem('little-town-voice-enabled-v1')==='true'}catch{}
function pharmacyVoiceActive(){return voiceModeEnabled&&pharmacyVoiceOwner===pharmacySession&&pharmacyShopVisible()&&pharmacySession.phase==='symptoms'&&!document.hidden}
const pharmacyVoiceInput=createVoiceInput({
 isActive:pharmacyVoiceActive,
 loadModel:loadLocalSpeechModel,createContext:createVoiceAudioContext,connectAudio:connectVoiceAudio,
 openMicrophone:()=>navigator.mediaDevices.getUserMedia({video:false,audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}}),
 onState:state=>{pharmacyVoiceState=state;renderPharmacyVoice()},
 onPartial:text=>{pharmacyVoicePartial=text;renderPharmacyVoice()},
 onResult:result=>{
  if(!pharmacyVoiceActive())return;
  pharmacyVoiceResult=analyzePharmacySpeech(result.text,result.words);pharmacyVoicePartial='';
  for(const id of pharmacyVoiceResult.matched)if(PHARMACY_DATA.symptoms.some(item=>item.id===id))pharmacySession.selected.add(id);
  refreshSymptomSelection();renderPharmacyVoice();
 }
});
function stopPharmacyVoice(clear=false){
 pharmacyVoiceInput.cancel();pharmacyVoicePartial='';
 if(clear){pharmacyVoiceOwner=null;pharmacyVoiceResult=null}
}
function syncPharmacyVoice(){
 const choosing=pharmacyShopVisible()&&pharmacySession.phase==='symptoms';
 if(!choosing)stopPharmacyVoice();
 if(choosing&&pharmacyVoiceOwner!==pharmacySession){stopPharmacyVoice(true);pharmacyVoiceOwner=pharmacySession}
 $('pharmacy-voice').classList.toggle('hidden',!choosing);renderPharmacyVoice();
}
function voiceSymptomName(id){return PHARMACY_DATA.symptoms.find(item=>item.id===id)?.statement.replace(/^I have (?:a |an |the )?/,'').replace(/\.$/,'')||id}
function renderPharmacyVoice(){
 const supported=voiceSupported(),enabled=voiceModeEnabled&&supported,phase=pharmacyVoiceState.phase;
 $('voice-toggle').disabled=!supported;$('voice-toggle').setAttribute('aria-pressed',String(enabled));
 $('voice-toggle').setAttribute('aria-label',!supported?'Voice mode unavailable':enabled?'Turn voice mode off':'Turn voice mode on and describe your symptoms');
 $('voice-icon').src=ASSETS[enabled?'voiceOn':'voiceOff'];$('voice-label').textContent=!supported?'Voice unavailable':'Voice: '+(enabled?'on':'off');
 $('voice-speak').classList.toggle('hidden',!enabled);$('voice-speak').disabled=['loading','permission','processing'].includes(phase);
 $('voice-speak').textContent=phase==='listening'?'Finish speaking':phase==='error'?'Try again':'Speak';
 $('pharmacy-voice').setAttribute('data-state',phase);
 $('voice-status').textContent=enabled?({idle:'Ready',loading:'Loading',permission:'Microphone permission',listening:'Listening',processing:'Recognizing',error:'Microphone paused'}[phase]||'Ready'):'Microphone off';
 let hint=!supported?'Voice input needs microphone support in a recent Chrome or Edge browser. You can still click every picture.':!enabled?'Use your voice to select symptoms. Audio is recognized on this device.':'Say a symptom name or a sentence, then pause. “Headache” and “I has a headache” both work. Press Speak when you are ready.';
 if(enabled&&pharmacyVoiceState.message)hint=pharmacyVoiceState.message;
 if(enabled&&phase==='idle'&&pharmacyVoiceResult){
  const result=pharmacyVoiceResult,parts=[];
  if(result.matched.length)parts.push('Selected: '+result.matched.map(voiceSymptomName).join(', ')+'. You can tap any picture to change it.');
  if(result.negated.length)parts.push('Not added because you said no: '+result.negated.map(voiceSymptomName).join(', ')+'.');
  if(result.uncertain.length)parts.push('Please check the suggestions below.');
  if(!parts.length)parts.push(result.heard?'I did not catch a symptom name. Try “headache” or “sore throat”, or choose a picture.':'I did not hear any words. Press Speak to try again, or choose a picture.');
  hint=parts.join(' ');
 }
 $('voice-hint').textContent=hint;
 const heard=pharmacyVoicePartial||pharmacyVoiceResult?.heard||'';
 $('voice-heard').classList.toggle('hidden',!enabled||!heard);$('voice-heard').textContent=(phase==='listening'?'Hearing: ':'Heard: ')+heard;
 const suggestions=enabled&&phase==='idle'?(pharmacyVoiceResult?.uncertain||[]):[],key=suggestions.join(',');
 if(key!==voiceSuggestionKey){
  voiceSuggestionKey=key;
  $('voice-suggestions').innerHTML=suggestions.length?'<span>Did you mean …?</span>'+suggestions.map(id=>'<button class="voice-suggestion" data-voice-symptom="'+id+'">'+voiceSymptomName(id)+'</button>').join(''):'';
 }
 $('voice-suggestions').classList.toggle('hidden',!suggestions.length);
}
function startPharmacyVoice(){
 if(!pharmacyVoiceActive()||!voiceSupported())return;
 pharmacyVoiceResult=null;pharmacyVoicePartial='';void pharmacyVoiceInput.start();
}
$('voice-toggle').addEventListener('click',()=>{
 if(!pharmacyShopVisible()||pharmacySession.phase!=='symptoms'||!voiceSupported())return;
 voiceModeEnabled=!voiceModeEnabled;try{localStorage.setItem('little-town-voice-enabled-v1',String(voiceModeEnabled))}catch{}
 if(voiceModeEnabled)startPharmacyVoice();else{stopPharmacyVoice(true);pharmacyVoiceOwner=pharmacySession}
 renderPharmacyVoice();
});
$('voice-speak').addEventListener('click',()=>{if(!pharmacyVoiceActive())return;if(pharmacyVoiceInput.phase==='listening')pharmacyVoiceInput.finish();else startPharmacyVoice()});
$('voice-suggestions').addEventListener('click',event=>{
 if(!pharmacyVoiceActive()||pharmacyVoiceInput.active)return;
 const id=event.target.closest('[data-voice-symptom]')?.dataset.voiceSymptom;
 if(!id||!pharmacyVoiceResult?.uncertain.includes(id))return;
 pharmacySession.selected.add(id);pharmacyVoiceResult.uncertain=pharmacyVoiceResult.uncertain.filter(item=>item!==id);pharmacyVoiceResult.matched.push(id);
 refreshSymptomSelection();renderPharmacyVoice();$('symptom-'+id).focus();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPharmacyVoice()});
window.addEventListener('pagehide',()=>{stopPharmacyVoice();try{warmSpeechModel?.worker?.terminate()}catch{}warmSpeechModel=null});
window.addEventListener('blur',()=>{if(pharmacyVoiceInput.phase==='listening')stopPharmacyVoice()});
