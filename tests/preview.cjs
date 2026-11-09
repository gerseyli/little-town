const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const root=path.join(__dirname,'..'),site=path.join(root,'dist/preview-site');
const offline=fs.readFileSync(path.join(root,'dist/Little-Town.html'),'utf8');
const version=JSON.parse(fs.readFileSync(path.join(site,'version.json')));
assert(/^game-[a-f0-9]{20}\.html$/.test(version.game));
const web=fs.readFileSync(path.join(site,version.game),'utf8');
const assetManifest=html=>{const start=html.indexOf('const ASSETS=')+13,end=html.indexOf(';\nconst MAPS=',start);return {start,end,data:JSON.parse(html.slice(start,end))}};
const original=assetManifest(offline),published=assetManifest(web);
assert.deepEqual(Object.keys(published.data),Object.keys(original.data));
assert.equal(version.assetCount,Object.keys(original.data).length);
for(const [key,url] of Object.entries(published.data)){
 assert(/^\.\/assets\/[a-zA-Z0-9_-]+-[a-f0-9]{20}\.(png|webp|jpeg)$/.test(url));
 const bytes=fs.readFileSync(path.join(site,url));
 assert(bytes.equals(Buffer.from(original.data[key].split(',')[1],'base64')),'unchanged asset '+key);
 const digest=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,20);
 assert(url.includes('-'+digest+'.'),'content hash '+key);
}
const speechManifest=html=>{const start=html.indexOf('const SPEECH_ASSETS=')+20,end=html.indexOf(';\nconst SPEECH_CONFIG=',start);return {start,end,data:JSON.parse(html.slice(start,end))}};
const originalSpeech=speechManifest(offline),publishedSpeech=speechManifest(web);
assert.equal(version.speechAssetCount,3);
for(const [key,url] of Object.entries(publishedSpeech.data)){
 assert(/^\.\/assets\/speech-(engine|model|worklet)-[a-f0-9]{20}\.(js|tar\.gz)$/.test(url));
 const bytes=fs.readFileSync(path.join(site,url));assert(bytes.equals(Buffer.from(originalSpeech.data[key].split(',')[1],'base64')),'unchanged speech asset '+key);
 assert(url.includes('-'+crypto.createHash('sha256').update(bytes).digest('hex').slice(0,20)+'.'));
}
// Restore manifests in reverse position order before comparing all gameplay.
let normalized=web.slice(0,publishedSpeech.start)+offline.slice(originalSpeech.start,originalSpeech.end)+web.slice(publishedSpeech.end);
const restoredImages=assetManifest(normalized);
normalized=normalized.slice(0,restoredImages.start)+offline.slice(original.start,original.end)+normalized.slice(restoredImages.end);
assert.equal(normalized,offline,'gameplay and markup unchanged apart from image/speech URLs');
assert.equal(version.game,'game-'+crypto.createHash('sha256').update(web).digest('hex').slice(0,20)+'.html');
assert.deepEqual(fs.readdirSync(site).sort(),['.nojekyll','assets',version.game,'index.html','version.json'].sort(),'only publishable build files');
assert(fs.readFileSync(path.join(site,'index.html'),'utf8').includes("cache:'no-store'"));
assert(fs.readFileSync(path.join(site,'index.html'),'utf8').includes('allow="fullscreen; microphone"'));
console.log('PASS: static preview preserves game/asset bytes, safe relative paths, content hashes, version manifest and build-only publication');
