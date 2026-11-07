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
assert.equal(web.slice(0,published.start)+offline.slice(original.start,original.end)+web.slice(published.end),offline,'gameplay and markup unchanged apart from image URLs');
assert.equal(version.game,'game-'+crypto.createHash('sha256').update(web).digest('hex').slice(0,20)+'.html');
assert.deepEqual(fs.readdirSync(site).sort(),['.nojekyll','assets',version.game,'index.html','version.json'].sort(),'only publishable build files');
assert(fs.readFileSync(path.join(site,'index.html'),'utf8').includes("cache:'no-store'"));
console.log('PASS: static preview preserves game/asset bytes, safe relative paths, content hashes, version manifest and build-only publication');
