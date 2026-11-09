// Derive the browser runtime from pinned, unmodified upstream source.
// Keep the speech model in memory: no IndexedDB model cache or audio storage.
export function memorySpeechEngine(source){
 const expression=/var WorkerFactory = createBase64WorkerFactory\('([^']+)'/;
 const match=expression.exec(source);
 if(!match)throw new Error('Pinned Vosk worker was not found.');
 let worker=Buffer.from(match[1],'base64').toString('utf8');
 for(const [before,after] of [
  ['this.Vosk.FS.mount(this.Vosk.IDBFS, {}, storagePath);','/* Little Town: retain the bundled model in MEMFS only. */'],
  ['return this.Vosk.syncFilesystem(true);','return Promise.resolve();'],
  ['return this.Vosk.syncFilesystem(false);','return Promise.resolve();']
 ]){
  if(worker.split(before).length!==2)throw new Error('Vosk memory-storage patch does not match pinned upstream.');
  worker=worker.replace(before,after);
 }
 return source.replace(expression,()=>"var WorkerFactory = createBase64WorkerFactory('"+Buffer.from(worker).toString('base64')+"'");
}
