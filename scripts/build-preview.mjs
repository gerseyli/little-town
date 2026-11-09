// Build the public static site from the same verified offline HTML export.
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output=path.join(root,'dist/preview-site');
const offline=await readFile(path.join(root,'dist/Little-Town.html'),'utf8');
const marker='const ASSETS=',start=offline.indexOf(marker),end=offline.indexOf(';\nconst MAPS=',start);
if(start<0||end<0)throw new Error('Offline asset manifest was not found; build the game first.');
const embedded=JSON.parse(offline.slice(start+marker.length,end)),urls={};
await rm(output,{recursive:true,force:true});await mkdir(path.join(output,'assets'),{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex').slice(0,20);
for(const [key,value] of Object.entries(embedded)){
 const match=/^data:image\/(png|webp|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(value);
 if(!match||!/^[a-zA-Z0-9_-]+$/.test(key))throw new Error('Unsupported preview asset '+key);
 const bytes=Buffer.from(match[2],'base64'),filename=key+'-'+hash(bytes)+'.'+match[1];
 urls[key]='./assets/'+filename;await writeFile(path.join(output,'assets',filename),bytes);
}
let game=offline.slice(0,start+marker.length)+JSON.stringify(urls)+offline.slice(end);
const speechMarker='const SPEECH_ASSETS=',speechStart=game.indexOf(speechMarker),speechEnd=game.indexOf(';\nconst SPEECH_CONFIG=',speechStart);
if(speechStart<0||speechEnd<0)throw new Error('Speech asset manifest was not found.');
const speechEmbedded=JSON.parse(game.slice(speechStart+speechMarker.length,speechEnd)),speechUrls={};
for(const [key,[type,extension]] of Object.entries({engine:['application/javascript','js'],model:['application/gzip','tar.gz'],worklet:['application/javascript','js']})){
 const prefix='data:'+type+';base64,';
 if(!speechEmbedded[key]?.startsWith(prefix))throw new Error('Unsupported speech asset '+key);
 const bytes=Buffer.from(speechEmbedded[key].slice(prefix.length),'base64'),filename='speech-'+key+'-'+hash(bytes)+'.'+extension;
 speechUrls[key]='./assets/'+filename;await writeFile(path.join(output,'assets',filename),bytes);
}
game=game.slice(0,speechStart+speechMarker.length)+JSON.stringify(speechUrls)+game.slice(speechEnd);
const filename='game-'+hash(game)+'.html';
const commit=process.env.GITHUB_SHA||'local';
const version={game:filename,commit,generatedAt:new Date().toISOString(),assetCount:Object.keys(urls).length,speechAssetCount:Object.keys(speechUrls).length};
await writeFile(path.join(output,filename),game);
await writeFile(path.join(output,'version.json'),JSON.stringify(version,null,2)+'\n');
await writeFile(path.join(output,'.nojekyll'),'');
await writeFile(path.join(output,'index.html'),`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Little Town — Preview</title>
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#355640;color:#fff4db;font:16px system-ui,sans-serif}#loading{position:absolute;inset:0;display:grid;place-content:center;text-align:center;padding:24px}#game{display:block;border:0;width:100%;height:100dvh}#game[hidden],#loading[hidden]{display:none}a{color:#ffdfa1}</style></head>
<body><div id="loading" role="status" aria-live="polite">Opening Little Town…</div><iframe id="game" title="Little Town game" allow="fullscreen; microphone" allowfullscreen hidden></iframe>
<noscript><p>Enable JavaScript to play Little Town.</p></noscript><script>
(async()=>{
 const loading=document.getElementById('loading'),frame=document.getElementById('game');
 try{
  const response=await fetch('./version.json?t='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error('Preview version unavailable');
  const version=await response.json();
  if(!/^game-[a-f0-9]{20}\\.html$/.test(version.game))throw new Error('Invalid preview version');
  frame.addEventListener('load',()=>{
   if(!frame.contentDocument?.getElementById('camera')){loading.textContent='The game could not load. Refresh this page to try again.';return}
   loading.hidden=true;frame.hidden=false;frame.focus();
  },{once:true});
  frame.src='./'+version.game;
 }catch{loading.textContent='The game could not load. Refresh this page to try again.'}
})();
</script></body></html>\n`);
console.log('Built dist/preview-site: '+Object.keys(urls).length+' cached HD assets; game '+filename+'; source '+commit);
