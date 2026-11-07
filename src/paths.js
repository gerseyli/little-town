// Path names, label anchors and route vocabulary share the collision geometry.
function pathSegments(path){
 return path.p.slice(1).map((b,i)=>{const a=path.p[i];return {a,b,length:Math.hypot(b[0]-a[0],b[1]-a[1])}});
}
function pathLabelData(key){
 return MAPS[key].paths.flatMap(path=>{
  const segments=pathSegments(path),longest=segments.reduce((best,item)=>item.length>best.length?item:best);
  const label=(segment,index)=>{
   let px=(segment.a[0]+segment.b[0])/2,py=(segment.a[1]+segment.b[1])/2;
   if(index===0&&key==='town'&&/Bridge/.test(path.name)){px=1460;py=segment.a[1]}
   let angle=Math.atan2(segment.b[1]-segment.a[1],segment.b[0]-segment.a[0])*180/Math.PI;
   if(angle>90)angle-=180;if(angle<=-90)angle+=180;
   const readableLength=path.p.length>4&&segments.reduce((sum,s)=>sum+s.length,0)>500?Math.max(180,segment.length):segment.length;
   const size=Math.max(8,Math.min(15,readableLength/(path.name.length*.58+2)));
   return {id:path.id+(index?'--'+index:''),pathId:path.id,name:path.name,x:px,y:py,angle,size,minor:path.kind==='approach'};
  };
  const labels=[label(longest,0)];
  // A long bent street needs its name visible on its other major sections too.
  if(path.p.length>2)for(const segment of segments)if(segment!==longest&&segment.length>180){const next=label(segment,labels.length);if(labels.every(p=>Math.hypot(p.x-next.x,p.y-next.y)>150))labels.push(next)}
  return labels;
 });
}
function renderPathLabels(){
 return pathLabelData(mapKey).map(p=>'<text data-path-label="'+p.id+'" class="street-label'+(p.minor?' minor-street-label':'')+'" text-anchor="middle" dominant-baseline="central" font-size="'+p.size+'" transform="translate('+p.x+' '+p.y+') rotate('+p.angle+')">'+p.name+'</text>').join('');
}
function pathAlignment(path,point,direction){
 if(!direction)return 1;
 const length=Math.hypot(direction.x,direction.y);if(!length)return 1;
 const distance=pathDistance(point.x,point.y,path);let alignment=0;
 for(const {a,b,length:segmentLength} of pathSegments(path))if(segmentLength&&distSeg(point.x,point.y,a,b)<=distance+2)alignment=Math.max(alignment,Math.abs((b[0]-a[0])*direction.x+(b[1]-a[1])*direction.y)/(segmentLength*length));
 return alignment;
}
function pathAtPoint(key,point,previous=null,direction=null){
 const m=MAPS[key];
 if(key==='town'&&point.x>665&&point.x<1030&&point.y>278&&point.y<548)return {id:'market-square',name:'Market Square',kind:'plaza',p:[]};
 if(key==='suburbs'&&point.x>m.lot[0]&&point.x<m.lot[2]&&point.y>m.lot[1]&&point.y<m.lot[3]){
  const aisle=m.paths.find(p=>p.name==='Mall Parking Aisle');
  if(pathDistance(point.x,point.y,aisle)>aisle.radius)return {id:'parking-lot',name:'the parking lot',kind:'plaza',p:[]};
 }
 if(previous?.p.length&&pathDistance(point.x,point.y,previous)<=previous.radius&&pathAlignment(previous,point,direction)>.6)return previous;
 const ranked=m.paths.map(p=>({path:p,d:Math.max(0,pathDistance(point.x,point.y,p)-2)/(p.radius||21)+(p.kind==='approach'?.12:0)+(1-pathAlignment(p,point,direction))*1.5}));
 ranked.sort((a,b)=>a.d-b.d);return ranked[0].path;
}
