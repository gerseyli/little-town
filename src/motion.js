// Distances, acceleration and gait phase are in world units, independent of frame rate.
let cameraTracking=true;const cameraGoal={x:null,y:null};
const motion={vx:0,vy:0,tap:null,distance:0,moving:false};
function approachSpeed(value,target,amount){return value<target?Math.min(target,value+amount):Math.max(target,value-amount)}
function stopPlayerMotion(){motion.vx=motion.vy=0;motion.tap=null;motion.moving=false;touristGait.moving=false}
function advancePlayer(dt){
 if(busy||$('book').open||$('directions-dialog').open){stopPlayerMotion();return}
 const key=[...held].at(-1)||motion.tap?.key,d=facingFor(key);
 if(motion.tap){motion.tap.time-=dt;if(motion.tap.time<=0)motion.tap=null}
 if(d){cameraTracking=true;facing=d[2];angle=d[3]}
 const acceleration=d?1500:2300;
 motion.vx=approachSpeed(motion.vx,(d?.[0]||0)*SPEED,acceleration*dt);
 motion.vy=approachSpeed(motion.vy,(d?.[1]||0)*SPEED,acceleration*dt);
 const px=x,py=y;
 if(motion.vx||motion.vy)move(motion.vx/SPEED,motion.vy/SPEED,dt);
 const distance=Math.hypot(x-px,y-py);motion.moving=distance>.0001;motion.distance+=distance;touristGait.moving=motion.moving;
 if(Math.abs(x-px)<.0001)motion.vx=0;
 if(Math.abs(y-py)<.0001)motion.vy=0;
}
function simulationFrame(dt,now){
 // Small collision/traffic steps prevent tunnelling at low refresh rates.
 let remaining=Math.max(0,Math.min(dt,.12));
 while(remaining>1e-7){const step=Math.min(remaining,1/120);advanceTraffic(step,now-remaining*1000);if(!$('directions-dialog').open&&!$('book').open)advancePeople(step);advancePlayer(step);remaining-=step}
}
