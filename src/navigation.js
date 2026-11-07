// Routing uses the same collision rules as walking, with directed public transport links.
const NAV_STEP=10, navigationMaps=new Map(), navigationAnchors=new Map();
class RouteQueue {
 constructor(){this.items=[]}
 push(item){const a=this.items;let i=a.length;a.push(item);while(i){const p=(i-1)>>1;if(a[p].cost<=item.cost)break;a[i]=a[p];i=p}a[i]=item}
 pop(){const a=this.items,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].cost<a[j].cost)j++;if(a[j].cost>=last.cost)break;a[i]=a[j];i=j}a[i]=last}return first}
}
function clearSegment(key,a,b){const distance=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(distance/2));for(let i=0;i<=steps;i++)if(!walkable(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,true,a.y,key))return false;return true}
function navigationMap(key){
 if(navigationMaps.has(key))return navigationMaps.get(key);
 const m=MAPS[key],nodes=new Map(),id=(x,y)=>key+':'+x+':'+y;
 for(let y=40;y<=m.maxY;y+=NAV_STEP)for(let x=40;x<=m.w-40;x+=NAV_STEP)if(walkable(x,y,true,y,key))nodes.set(id(x,y),{id:id(x,y),map:key,x,y});
 const graph={nodes,id};navigationMaps.set(key,graph);return graph;
}
function nearbyNode(key,point){const cacheKey=key+':'+point.x+':'+point.y;if(navigationAnchors.has(cacheKey))return navigationAnchors.get(cacheKey);const graph=navigationMap(key);let best=null,distance=Infinity;for(const n of graph.nodes.values()){const d=Math.hypot(n.x-point.x,n.y-point.y);if(d<distance&&d<=35&&clearSegment(key,point,n)){best=n;distance=d}}navigationAnchors.set(cacheKey,best);return best}
function routeTo(destinationMap,destinationId,origin={map:mapKey,x,y}){
 const destination=MAPS[destinationMap]?.places.find(p=>p.id===destinationId);if(!destination)return null;
 const target={map:destinationMap,x:destination.access[0],y:destination.access[1]};
 const start=nearbyNode(origin.map,origin),end=nearbyNode(target.map,target);if(!start||!end)return null;
 const links=new Map();
 const add=(from,to,data)=>{if(!from||!to)return;const a=links.get(from.id)||[];a.push({to,...data});links.set(from.id,a)};
 for(const [key,m]of Object.entries(MAPS))for(const route of m.routes)for(let i=0;i<route.stops.length;i++){
  const from=m.stops.find(s=>s.id===route.stops[i]),to=m.stops.find(s=>s.id===route.stops[(i+1)%route.stops.length]);
  add(nearbyNode(key,from),nearbyNode(key,to),{mode:'bus',number:route.n,fromStop:from,toStop:to,cost:180+Math.hypot(to.x-from.x,to.y-from.y)*.18});
 }
 const town=nearbyNode('town',MAPS.town.train),suburbs=nearbyNode('suburbs',MAPS.suburbs.train);
 add(town,suburbs,{mode:'train',cost:360});add(suburbs,town,{mode:'train',cost:360});
 const startState=start.id+':start',queue=new RouteQueue(),costs=new Map([[startState,0]]),previous=new Map();let endState=null;queue.push({node:start,cost:0,state:startState,heading:null});
 while(queue.items.length){const item=queue.pop(),n=item.node;if(item.cost!==costs.get(item.state))continue;if(n.id===end.id){endState=item.state;break;}
  const graph=navigationMap(n.map),edges=[...(links.get(n.id)||[])];
  if(!n.walkEdges){n.walkEdges=[];for(const [dx,dy]of [[10,0],[-10,0],[0,10],[0,-10]]){const next=graph.nodes.get(graph.id(n.x+dx,n.y+dy));if(next&&clearSegment(n.map,n,next))n.walkEdges.push({to:next,mode:'walk',cost:10,heading:dx>0?'east':dx<0?'west':dy>0?'south':'north'})}}edges.push(...n.walkEdges);
  for(const edge of edges){const heading=edge.mode==='walk'?edge.heading:null,state=edge.to.id+':'+(heading||'transfer');const turn=item.heading&&heading&&item.heading!==heading?70:0,cost=item.cost+edge.cost+turn;if(cost<(costs.get(state)??Infinity)){costs.set(state,cost);previous.set(state,{from:n,fromState:item.state,edge});queue.push({node:edge.to,cost,state,heading})}}
 }
 if(!endState)return null;
 const legs=[];let state=endState;while(state!==startState){const p=previous.get(state);legs.push({from:p.from,to:p.edge.to,...p.edge});state=p.fromState}legs.reverse();
 // Preserve the actual position and exact place entrance, rather than silently snapping the user.
 legs.unshift({mode:'walk',from:origin,to:start});legs.push({mode:'walk',from:end,to:target});
 return {origin,destinationMap,destination,legs,cost:costs.get(endState)};
}
function phrase(type){return BOOK_ENTRIES.directions.find(e=>e[3]===type)?.[0]||''}
function nearestPath(key,point){return MAPS[key].paths.reduce((a,b)=>pathDistance(point.x,point.y,a)<=pathDistance(point.x,point.y,b)?a:b)}
function headingBetween(a,b){return Math.abs(b.x-a.x)>=Math.abs(b.y-a.y)?(b.x>=a.x?'east':'west'):(b.y>=a.y?'south':'north')}
function turnPhrase(before,after){const order=['north','east','south','west'],turn=(order.indexOf(after)-order.indexOf(before)+4)%4;return phrase(turn===1?'right':turn===3?'left':turn===2?'aroundturn':'straight')}
// Name a continuous path once, including its bends, instead of narrating grid cells.
function directionGroups(route){
 const groups=[];let previousPath=null;
 for(const leg of route.legs){
  if(leg.mode!=='walk'){groups.push({...leg});previousPath=null;continue}
  const distance=Math.hypot(leg.to.x-leg.from.x,leg.to.y-leg.from.y);if(distance<.01)continue;
  const midpoint={x:(leg.from.x+leg.to.x)/2,y:(leg.from.y+leg.to.y)/2};
  const path=pathAtPoint(leg.from.map,midpoint,previousPath),last=groups.at(-1);
  if(last?.mode==='walk'&&last.path.name===path.name&&last.from.map===leg.from.map){last.to=leg.to;last.distance+=distance;last.points.push(leg.to)}
  else groups.push({mode:'walk',path,from:leg.from,to:leg.to,distance,points:[leg.from,leg.to]});
  previousPath=path;
 }
 // Tiny changes just align a foot to the grid or pass through a junction.
 // Road crossings and transport are always retained.
 for(let i=groups.length-1;i>=0;i--){const g=groups[i];if(g.mode!=='walk'||g.path.kind==='crossing'||g.distance>=24)continue;
  if(groups[i-1]?.mode==='walk'){groups[i-1].to=g.to;groups[i-1].points.push(...g.points.slice(1));groups.splice(i,1)}
  else if(groups[i+1]?.mode==='walk'){groups[i+1].from=g.from;groups[i+1].points.unshift(g.from);groups.splice(i,1)}
 }
 return groups;
}
function pathTravelHeadings(group){
 const path=group.path;
 if(!path.p.length)return {entry:headingBetween(group.from,group.to),exit:headingBetween(group.from,group.to)};
 const project=point=>{let best=null,offset=0;
  for(const segment of pathSegments(path)){
   const dx=segment.b[0]-segment.a[0],dy=segment.b[1]-segment.a[1],t=Math.max(0,Math.min(1,((point.x-segment.a[0])*dx+(point.y-segment.a[1])*dy)/(segment.length**2||1)));
   const px=segment.a[0]+dx*t,py=segment.a[1]+dy*t,d=Math.hypot(point.x-px,point.y-py);
   if(!best||d<best.d)best={d,arc:offset+t*segment.length,segment};offset+=segment.length;
  }return best;
 };
 const a=project(group.from),b=project(group.to),forward=b.arc>=a.arc;
 const heading=segment=>headingBetween({x:segment[forward?'a':'b'][0],y:segment[forward?'a':'b'][1]},{x:segment[forward?'b':'a'][0],y:segment[forward?'b':'a'][1]});
 return {entry:heading(a.segment),exit:heading(b.segment)};
}
function routeDirectionActions(route){
 const groups=directionGroups(route),actions=[];
 const name=path=>path.name.replace(' · north pavement',"’s north pavement").replace(' · south pavement',"’s south pavement");
 let looking=null;
 for(let i=0;i<groups.length;i++){
  const g=groups[i],next=groups[i+1];
  if(g.mode==='bus'){actions.push({kind:'transport',text:`At ${g.fromStop.name}, take bus number ${g.number} to ${g.toStop.name}.`});looking=null;continue}
  if(g.mode==='train'){actions.push({kind:'transport',text:`Buy a ticket. Take the train. Get off in ${g.to.map==='town'?'town':'the suburbs'}.`});looking=null;continue}
  const entry=g.points.find(p=>Math.hypot(p.x-g.from.x,p.y-g.from.y)>15)||g.to;
  const exit=[...g.points].reverse().find(p=>Math.hypot(p.x-g.to.x,p.y-g.to.y)>15)||g.from;
  const directions=pathTravelHeadings(g);const heading=directions.entry,exitHeading=directions.exit;
  const target=!next?route.destination.name:next.mode==='train'?'the train station':next.mode==='bus'?next.fromStop.name:next.path.kind==='crossing'?'the crossing':name(next.path);
  const road=g.points.some(p=>inRoad(p.y,p.map));
  let lead,text;
  if(g.path.kind==='crossing'){lead='Cross Main Road at the green walking signal';text=lead+'.'}
  else if(road&&g.path.name==='Coast Road'){lead='Follow Coast Road; wait for traffic to stop before crossing Main Road';text=lead+'.'}
  else if(g.path.kind==='plaza'){lead=g.path.id==='market-square'?'Go through Market Square, around the fountain':'Walk through the parking lot';text=lead+' to '+target+'.'}
  else{
   const curved=g.path.p.length>2;
   if(curved)lead='Follow '+name(g.path);
   else if(!looking)lead='Go '+heading+' along '+name(g.path);
   else{const turn=turnPhrase(looking,heading);lead=turn==='Go straight on.'?'Continue along '+name(g.path):turn.replace(/\.$/,'')+' onto '+name(g.path)}
   text=lead+' to '+target+'.';
  }
  actions.push({kind:'walk',lead,text,path:g.path.name,target,heading});looking=exitHeading;
 }
 if(!actions.length)return [{kind:'arrival',text:route.destination.name+' is here.'}];
 const last=actions.at(-1);
 if(!last.text.includes(route.destination.name))last.text=last.text.replace(/\.$/,'')+'. You’re at '+route.destination.name+'.';
 return actions;
}
function routeDirections(route,initialFacing=facing){
 if(!route)return ['Sorry, I cannot find a safe route from here. Try a nearby path.'];
 const actions=routeDirectionActions(route),items=[];
 for(let i=0;i<actions.length;){
  const a=actions[i];let combined=a.text,used=1;
  // Two short walking actions make one readable instruction. Transport remains explicit.
  if(a.kind==='walk'&&actions[i+1]?.kind==='walk'){
   const b=actions[i+1],candidate=a.lead+'; '+b.text.charAt(0).toLowerCase()+b.text.slice(1);
   if(candidate.length<=155){combined=candidate;used=2}
  }
  items.push(combined);i+=used;
 }
 return items;
}
