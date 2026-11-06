// Atlas layout: four gait frames across; south, west, east, north down.
// Distance drives gait so paused or blocked actors never walk in place.
const WALK_ROWS={south:0,west:1,east:2,north:3};
const WALK_FRAMES=4,TOURIST_SIZE=86,PEDESTRIAN_SIZE=88;
const touristGait={distance:0,moving:false};
function travelFacing(dx,dy){return Math.abs(dx)>Math.abs(dy)?(dx>0?'east':'west'):(dy>0?'south':'north')}
function gaitFrame(actor,stride){return actor.moving?Math.floor(actor.distance/(stride/WALK_FRAMES))%WALK_FRAMES:1}
function actorSprite(id,asset,width,height){
 return `<svg id="${id}" x="${-width/2}" y="${-height}" width="${width}" height="${height}" viewBox="0 0 1 1" overflow="hidden"><image href="${ASSETS[asset]}" width="4" height="4" preserveAspectRatio="none"/></svg>`;
}
function renderActor(id,actor,facing,stride){
 const frame=gaitFrame(actor,stride),row=WALK_ROWS[facing]??0;
 const element=$(id),viewBox=`${frame} ${row} 1 1`;
 element.setAttribute('viewBox',viewBox);
 const tourist=id==='walkerart',name=tourist?'tourist':id.replace('person-sprite-','person-'),height=tourist?TOURIST_SIZE:PEDESTRIAN_SIZE;
 // Generated frames have slightly different transparent foot margins. Move
 // the viewport, keeping the planted foot at the same world-space anchor.
 const gap=WALK_FOOT_ANCHORS[name]?.[row*WALK_FRAMES+frame]||0;
 $(id).setAttribute('y',-height+gap*height);
}
