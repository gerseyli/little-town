// AudioWorklet runs away from rendering. It forwards mono PCM; it never plays
// the microphone through the speakers or retains a recording.
class LittleTownVoiceCapture extends AudioWorkletProcessor{
 constructor(){super();this.samples=new Float32Array(2048);this.used=0}
 process(inputs,outputs){
  for(const output of outputs)for(const channel of output)channel.fill(0);
  const input=inputs[0]?.[0];if(!input)return true;
  for(const sample of input){
   this.samples[this.used++]=sample;
   if(this.used===this.samples.length){this.port.postMessage(this.samples,[this.samples.buffer]);this.samples=new Float32Array(2048);this.used=0}
  }return true;
 }
}
registerProcessor('little-town-voice-capture',LittleTownVoiceCapture);
