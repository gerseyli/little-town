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
 const queue=new RouteQueue(),costs=new Map([[start.id,0]]),previous=new Map();queue.push({node:start,cost:0});
 while(queue.items.length){const item=queue.pop(),n=item.node;if(item.cost!==costs.get(n.id))continue;if(n.id===end.id)break;
  const graph=navigationMap(n.map),edges=[...(links.get(n.id)||[])];
  if(!n.walkEdges){n.walkEdges=[];for(const [dx,dy]of [[10,0],[-10,0],[0,10],[0,-10]]){const next=graph.nodes.get(graph.id(n.x+dx,n.y+dy));if(next&&clearSegment(n.map,n,next))n.walkEdges.push({to:next,mode:'walk',cost:10})}}edges.push(...n.walkEdges);
  for(const edge of edges){const cost=item.cost+edge.cost;if(cost<(costs.get(edge.to.id)??Infinity)){costs.set(edge.to.id,cost);previous.set(edge.to.id,{from:n,edge});queue.push({node:edge.to,cost})}}
 }
 if(!costs.has(end.id))return null;
 const legs=[];let at=end;while(at.id!==start.id){const p=previous.get(at.id);legs.push({from:p.from,to:at,...p.edge});at=p.from}legs.reverse();
 // Preserve the actual position and exact place entrance, rather than silently snapping the user.
 legs.unshift({mode:'walk',from:origin,to:start});legs.push({mode:'walk',from:end,to:target});
 return {origin,destinationMap,destination,legs,cost:costs.get(end.id)};
}
function phrase(type){return BOOK_ENTRIES.directions.find(e=>e[3]===type)?.[0]||''}
function nearestPath(key,point){return MAPS[key].paths.reduce((a,b)=>pathDistance(point.x,point.y,a)<=pathDistance(point.x,point.y,b)?a:b)}
function headingBetween(a,b){return Math.abs(b.x-a.x)>=Math.abs(b.y-a.y)?(b.x>=a.x?'east':'west'):(b.y>=a.y?'south':'north')}
function turnPhrase(before,after){const order=['north','east','south','west'],turn=(order.indexOf(after)-order.indexOf(before)+4)%4;return phrase(turn===1?'right':turn===3?'left':turn===2?'aroundturn':'straight')}
function routeDirections(route,initialFacing=facing){
 if(!route)return ['Sorry, I cannot find a safe route from here. Try asking again on a nearby path.'];
 const instructions=[],groups=[];let group=null;
 for(const leg of route.legs){if(leg.mode!=='walk'){groups.push(leg);group=null;continue}
  if(Math.hypot(leg.to.x-leg.from.x,leg.to.y-leg.from.y)<1)continue;
  const key=leg.from.map,heading=headingBetween(leg.from,leg.to),path=nearestPath(key,{x:(leg.from.x+leg.to.x)/2,y:(leg.from.y+leg.to.y)/2}),name=path.name;
  if(group&&group.mode==='walk'&&group.heading===heading&&group.name===name&&group.from.map===key){group.to=leg.to;group.distance+=Math.hypot(leg.to.x-leg.from.x,leg.to.y-leg.from.y)}
  else{group={mode:'walk',heading,name,from:leg.from,to:leg.to,distance:Math.hypot(leg.to.x-leg.from.x,leg.to.y-leg.from.y)};groups.push(group)}
 }
 let looking=initialFacing;
 for(let i=0;i<groups.length;i++){
  const g=groups[i];
  if(g.mode==='bus'){instructions.push(`At ${g.fromStop.name}, take bus number ${g.number} to ${g.toStop.name}. Get off at ${g.toStop.name}.`);looking=null;continue}
  if(g.mode==='train'){instructions.push(`Go to the train station. ${g.to.map==='suburbs'?BOOK_ENTRIES.transport.find(e=>e[3]==='ticket')[0]:'Buy a ticket back to town.'} ${BOOK_ENTRIES.transport.find(e=>e[3]==='train')[0]} Get off in ${g.to.map==='town'?'town':'the suburbs'}.`);looking=null;continue}
  // Ignore tiny grid alignment steps; actual junction turns remain explicit.
  if(g.distance<19)continue;
  const turn=looking?turnPhrase(looking,g.heading):'Go straight on.';
  let text=`${turn} Walk ${g.heading} along ${g.name}.`;
  if(g.name==='Zebra crossing'||(inRoad(g.to.y,g.from.map)&&!inRoad(g.from.y,g.from.map)))text=`${turn} ${phrase('lights')} Wait for the green walking signal. ${BOOK_ENTRIES.directions.find(e=>e[4]==='crossing')[0]} Use the zebra crossing, heading ${g.heading}.`;
  else if(/Bridge/.test(g.name))text+=` ${BOOK_ENTRIES.directions.find(e=>e[4]==='bridge')[0]}`;
  else if(/Woodland Trail/.test(g.name))text+=` ${BOOK_ENTRIES.directions.find(e=>e[3]==='through')[0]}`;
  else if(/Field Path/.test(g.name))text+=` ${BOOK_ENTRIES.directions.find(e=>e[4]==='field')[0]}`;
  const next=groups[i+1];if(next?.mode==='walk'&&next.name!==g.name)text+=` Continue to ${next.name}.`;
  instructions.push(text);looking=g.heading;
 }
 const d=route.destination,last=route.legs.at(-1),dx=d.x-last.to.x,dy=d.y-last.to.y;
 const vectors={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]},v=vectors[looking];
 const side=v?v[0]*dy-v[1]*dx:0;
 instructions.push(`You’re at ${d.name}.`+(Math.abs(side)>15?' '+phrase(side>0?'onright':'onleft'):''));
 return instructions;
}
