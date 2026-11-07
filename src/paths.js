// Path names, label anchors and route vocabulary share the collision geometry.
function pathSegments(path){
 return path.p.slice(1).map((b,i)=>{const a=path.p[i];return {a,b,length:Math.hypot(b[0]-a[0],b[1]-a[1])}});
}
function pathLabelData(key){
 return MAPS[key].paths.map(path=>{
  const segment=pathSegments(path).reduce((best,item)=>item.length>best.length?item:best);
  let px=(segment.a[0]+segment.b[0])/2,py=(segment.a[1]+segment.b[1])/2;
  // Put bridge names over the crossing, not over their longer dry-land approach.
  if(key==='town'&&/Bridge/.test(path.name)){px=1460;py=segment.a[1]}
  let angle=Math.atan2(segment.b[1]-segment.a[1],segment.b[0]-segment.a[0])*180/Math.PI;
  if(angle>90)angle-=180;if(angle<=-90)angle+=180;
  const size=Math.max(8,Math.min(15,segment.length/(path.name.length*.58+2)));
  return {id:path.id,name:path.name,x:px,y:py,angle,size,minor:path.kind==='approach'};
 });
}
function renderPathLabels(){
 return pathLabelData(mapKey).map(p=>'<text data-path-label="'+p.id+'" class="street-label'+(p.minor?' minor-street-label':'')+'" text-anchor="middle" dominant-baseline="central" font-size="'+p.size+'" transform="translate('+p.x+' '+p.y+') rotate('+p.angle+')">'+p.name+'</text>').join('');
}
function pathAtPoint(key,point,previous=null){
 const m=MAPS[key];
 if(key==='town'&&point.x>665&&point.x<1030&&point.y>278&&point.y<548)return {id:'market-square',name:'Market Square',kind:'plaza',p:[]};
 if(key==='suburbs'&&point.x>m.lot[0]&&point.x<m.lot[2]&&point.y>m.lot[1]&&point.y<m.lot[3]){
  const aisle=m.paths.find(p=>p.name==='Mall Parking Aisle');
  if(pathDistance(point.x,point.y,aisle)>aisle.radius)return {id:'parking-lot',name:'the parking lot',kind:'plaza',p:[]};
 }
 if(previous?.p.length&&pathDistance(point.x,point.y,previous)<=previous.radius)return previous;
 const ranked=m.paths.map(p=>({path:p,d:Math.max(0,pathDistance(point.x,point.y,p)-2)/(p.radius||21)+(p.kind==='approach'?.12:0)}));
 ranked.sort((a,b)=>a.d-b.d);return ranked[0].path;
}
