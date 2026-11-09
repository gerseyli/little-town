// Symptom keywords, not sentence/grammar grading. Uncertain matches need a click.
const PHARMACY_VOICE_WORDS={
 headache:['headache','headaches','head ache','head aches','head pain','head hurts','head hurt'],
 stomachache:['stomachache','stomachaches','stomach ache','stomach aches','stomach pain','tummy ache','belly ache','stomach hurts','stomach hurt','tummy hurts','belly hurts'],
 'food-poisoning':['food poisoning','food poison','food poisoned'],
 backache:['backache','backaches','back ache','back aches','back pain','back hurts'],
 toothache:['toothache','toothaches','tooth ache','tooth aches','tooth pain','tooth hurts','teeth hurt','teeth ache'],
 fever:['fever','fevers','feverish','high temperature'],
 cough:['cough','coughs','coughing'],
 flu:['flu','influenza'],
 'runny-nose':['runny nose','running nose','nose is running','nose running','runnynose'],
 'sore-throat':['sore throat','sore throats','throat is sore','throat sore','throat hurts'],
 sunburn:['sunburn','sunburnt','sunburned','sun burn','sun burnt','sun burned'],
 'insect-bite':['insect bite','insect bites','bug bite','bug bites','mosquito bite','mosquito bites']
};
function normalizeVoiceText(value){
 return String(value||'').slice(0,500).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'")
  .replace(/\b(?:can't|cannot|can not) stop\b/g,'keep')
  .replace(/\bnot (?:only|just)\b/g,'')
  .replace(/\b(?:don't|doesn't|didn't|haven't|hasn't|hadn't|isn't|aren't|wasn't|weren't|can't|cannot)\b/g,'not')
  .replace(/\bi've\b/g,'i have').replace(/\bi'm\b/g,'i am').replace(/[^a-z\s.,;!?]/g,' ').replace(/\s+/g,' ').trim();
}
function voiceEditDistance(a,b){
 let previous=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,previous[j]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));previous=next;
 }return previous[b.length];
}
function analyzePharmacySpeech(transcript,wordDetails=[]){
 const heard=String(transcript||'').slice(0,500).trim(),text=normalizeVoiceText(heard);
 const clauses=text.split(/[.,;!?]|\b(?:but|however|except|although)\b|\band (?=(?:i|my|a|an)\s+(?:have|has|got|feel|am|is|are)\b)/).map(clause=>clause.trim().split(/\s+/).filter(Boolean));
 const matched=new Set(),negated=new Set(),uncertain=new Set(),found=new Set(),scores=new Map();
 for(const item of Array.isArray(wordDetails)?wordDetails:[]){
  if(!item||typeof item.conf!=='number'||!Number.isFinite(item.conf))continue;
  for(const token of normalizeVoiceText(item.word).split(/\s+/))scores.set(token,Math.max(scores.get(token)||0,item.conf));
 }
 const negative=before=>before.some(token=>['no','not','never','without','neither','nor','remove','unselect','deselect'].includes(token));
 for(const [id,aliases] of Object.entries(PHARMACY_VOICE_WORDS)){
  for(const clause of clauses)for(const alias of aliases){
   const words=alias.split(' ');
   for(let at=0;at<=clause.length-words.length;at++){
    if(!words.every((word,index)=>clause[at+index]===word))continue;
    found.add(id);
    const after=clause.slice(at+words.length,at+words.length+3).join(' ');
    if(negative(clause.slice(0,at))||/^(?:no more|not now|not anymore|has gone|is gone)/.test(after)){negated.add(id);continue}
    const knownScores=words.filter(word=>scores.has(word)).map(word=>scores.get(word));
    if(knownScores.length&&Math.min(...knownScores)<.5)uncertain.add(id);else matched.add(id);
   }
  }
 }
 // Long, near-matching keywords are suggestions only. Never fuzz short words
 // such as flu/cough into an automatic selection from unrelated speech.
 for(const clause of clauses)for(let at=0;at<clause.length;at++){
  if(negative(clause.slice(0,at)))continue;
  const candidates=new Set();
  for(const [id,aliases] of Object.entries(PHARMACY_VOICE_WORDS)){
   if(found.has(id))continue;
   for(const alias of aliases){
    const length=alias.split(' ').length;if(length>2)continue;
    const a=clause.slice(at,at+length).join(''),b=alias.replace(/ /g,'');
    if(a.length<7||b.length<7||Math.abs(a.length-b.length)>2||a===b)continue;
    if(voiceEditDistance(a,b)<=(b.length>=8?2:1))candidates.add(id);
   }
  }
  if(candidates.size===1)uncertain.add([...candidates][0]);
 }
 for(const id of matched){uncertain.delete(id);negated.delete(id)}
 for(const id of negated)uncertain.delete(id);
 return {heard,matched:[...matched],negated:[...negated],uncertain:[...uncertain]};
}
