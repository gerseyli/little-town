const BOOK_ENTRIES={directions:[
['Go straight on.','Идите прямо.','Keep going in the same direction.','straight'],
['Turn right.','Поверните направо.','Take the street on your right.','right'],
['Turn left.','Поверните налево.','Take the street on your left.','left'],
['Turn around.','Развернитесь.','Go back in the opposite direction.','aroundturn'],
['Go past the bank.','Пройдите мимо банка.','Pass the building and keep going.','past'],
['Walk along the river.','Идите вдоль реки.','Follow the river on the path beside it.','along'],
['Walk across the field.','Пройдите через поле.','Go from one side of the field to the other.','across','field'],
['Walk through the forest.','Пройдите через лес.','Follow the path inside the forest.','through','forest'],
['Go over the bridge.','Перейдите по мосту.','Use the bridge to cross the river.','across','bridge'],
['Walk around the lake.','Обойдите озеро.','Follow the path around the water.','around','lake'],
['Go up the hill.','Поднимитесь на холм.','Follow the path to a higher place.','up','hill'],
['Go down the hill.','Спуститесь с холма.','Follow the path to a lower place.','down','hill'],
['At the corner','На углу','Turn where the two streets meet.','corner'],
['It’s on your left.','Это слева от вас.','Look to your left as you walk.','onleft'],
['It’s on your right.','Это справа от вас.','Look to your right as you walk.','onright'],
['Next to','Рядом с','The café is next to the square.','next'],
['Opposite','Напротив','The bank is opposite the bakery.','opposite'],
['Between','Между','Look for the place between two others.','between'],
['Cross the road.','Перейдите дорогу.','Use the zebra crossing.','straight','crossing'],
['Wait at the traffic lights.','Подождите у светофора.','Cross when the walking signal is green.','lights'],
['Excuse me. Where’s the…?','Извините. Где находится…?','Ask someone to help you find a place.','question'],
['How do I get to the…?','Как мне добраться до…?','Ask for directions to a place.','map'],
['Is it far?','Это далеко?','Ask about the distance.','distance'],
['Could you show me on the map?','Можете показать мне на карте?','Ask someone to point to the place.','map']
],places:[
['The suburbs','Пригород','A residential area outside the centre of a town or city.','photo','houses'],
['A detached house','Отдельно стоящий дом','A house that is not joined to another house.','photo','bakers'],
['The Johnsons’ house','Дом семьи Джонсонов','The Johnson family: the Johnsons. Their house: the Johnsons’ house.','photo','johnsons'],
['A shopping mall','Торговый центр','A large building with many different shops.','photo','mall'],
['A parking lot','Парковка','An area where people park their cars.','photo','parking'],
['A farm','Ферма','A place where people grow crops or keep farm animals.','photo','farm'],
['A forest','Лес','A large area with many trees.','photo','forest'],
['A field','Поле','An open area of land, often used for crops or animals.','photo','field'],
['A hill','Холм','A raised area of land, usually lower than a mountain.','photo','hill'],
['A mountain','Гора','A very high area of land with steep sides.','photo','mountain'],
['A lake','Озеро','A large area of water surrounded by land.','photo','lake'],
['A bay','Залив','A part of the sea that curves into the land.','photo','bay'],
['A harbor','Гавань','A sheltered place where boats can stay safely.','photo','harbor'],
['A theme park','Парк аттракционов','A place with rides, games and attractions.','photo','themepark'],
['A square','Площадь','An open public space in a town.','photo','square'],
['A bridge','Мост','A structure that takes you across water or a road.','photo','bridge'],
['A zebra crossing','Пешеходный переход','White stripes that show where to cross the road.','photo','crossing'],
['A pavement','Тротуар','A path beside a road for people to walk on.','along','pavement']
],transport:[
['A train station','Железнодорожный вокзал','The place where you catch a train.','photo','station'],
['Buy a ticket to the suburbs.','Купите билет в пригород.','Walk up to the train station and choose your ticket.','ticket'],
['A platform','Платформа','The place where you wait beside the train track.','photo','platform'],
['Take the train.','Сядьте на поезд.','Travel from town to the suburbs, or back to town.','train'],
['A bus stop','Автобусная остановка','The place where you wait for a bus.','busstop'],
['Take bus number 5 to Woodland Gate.','Сядьте на автобус № 5 до Woodland Gate.','Check the bus number and its next stop.','bus'],
['Get on the bus.','Сядьте в автобус.','Choose a service, then press Space.','bus'],
['Get off at Market Square.','Выйдите на остановке Market Square.','Leave the bus when you arrive at your stop.','busstop'],
['Back to town','Обратно в город','Buy a return ticket at the suburbs train station.','train']
]};
function photoSpec(id){const special={houses:['suburbs',[90,260,800,620]],bridge:['town',[1320,280,390,210]],crossing:['town',[230,665,170,220]],square:['town',[650,270,380,295]],pavement:['town',[360,625,600,135]],platform:['town',[455,1170,300,210]]};if(special[id])return special[id];const p=MAPS.suburbs.places.find(p=>p.id===id);return p?['suburbs',p.crop]:['town',[470,1130,250,250]]}
function photoMarkup(id){const [k,b]=photoSpec(id),m=MAPS[k];return '<svg x="0" y="0" width="140" height="100" viewBox="'+b.join(' ')+'" preserveAspectRatio="xMidYMid slice"><image href="'+ASSETS[k]+'" width="'+m.w+'" height="'+m.h+'"/></svg>'}
function picture(e,n){const type=e[3],photo=e[4],head='arr'+n;let body=photo?photoMarkup(photo):'<rect width="140" height="100" rx="8" fill="#e8ddbb"/>';const arrow=d=>'<path d="'+d+'" stroke="#fff8db" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" stroke="#d57c35" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#'+head+')"/>';const house=(a,b,c='#b8c6a3')=>'<g transform="translate('+a+' '+b+')"><rect x="-18" y="0" width="36" height="28" rx="3" fill="'+c+'" stroke="#5b7960" stroke-width="2"/><path d="M-23 0L0-19 23 0Z" fill="#aa7650"/><rect x="-5" y="12" width="10" height="16" fill="#476957"/></g>';
if(type==='straight')body+=arrow('M70 85V20');if(type==='right')body+='<path d="M40 100V45H140" stroke="#bdbca0" stroke-width="27" fill="none"/>'+arrow('M40 84V45H113');if(type==='left')body+='<path d="M100 100V45H0" stroke="#bdbca0" stroke-width="27" fill="none"/>'+arrow('M100 84V45H27');if(type==='aroundturn')body+=arrow('M45 84V32Q70-1 96 32V80');if(type==='across')body+=arrow('M15 55H120');if(type==='through')body+=arrow('M72 88V16');if(type==='around')body+=arrow('M25 75Q6 35 39 20Q116-1 121 49Q125 85 89 87');if(type==='up')body+=arrow('M25 82L113 24');if(type==='down')body+=arrow('M113 24L25 82');if(type==='past')body+=house(41,38)+arrow('M93 88V15');if(type==='along')body+=(photo?'':'<path d="M0 24Q60 15 140 30V62Q65 50 0 63Z" fill="#7aaab1"/>')+arrow('M20 78H120');if(type==='corner')body+='<path d="M20 100V42H140" stroke="#b1b99c" stroke-width="28" fill="none"/>'+house(67,65)+arrow('M20 87V42H115');if(type==='onleft'||type==='onright')body+=house(type==='onleft'?29:111,48)+arrow('M70 90V18');if(type==='next')body+=house(38,45)+house(85,45,'#e1bd81');if(type==='opposite')body+='<rect y="37" width="140" height="25" fill="#b5baa6"/>'+house(70,8)+house(70,80,'#e1bd81');if(type==='between')body+=house(25,53)+house(70,53,'#efc876')+house(115,53);if(type==='lights')body+='<rect x="49" y="6" width="42" height="75" rx="12" fill="#3d584a"/><circle cx="70" cy="24" r="12" fill="#cb6c48"/><circle cx="70" cy="62" r="12" fill="#96c081"/><path d="M70 81V100" stroke="#647858" stroke-width="7"/>';if(['question','map','distance'].includes(type))body+='<path d="M20 30 50 17 90 30 120 17V80L90 93 50 80 20 93Z" fill="#b7ccb0" stroke="#5f8067" stroke-width="3"/><path d="M50 17V80M90 30V93" stroke="#6f9678" stroke-width="2"/><circle cx="75" cy="52" r="20" fill="#fff0cb" stroke="#bda365" stroke-width="2"/><text x="75" y="62" text-anchor="middle" font-size="31" font-weight="800" fill="#906744">?</text>';if(type==='ticket')body+='<path d="M15 23H125V39Q108 50 125 61V80H15V61Q31 50 15 39Z" fill="#e4bd7b" stroke="#926f45" stroke-width="3"/><path d="M88 26V77" stroke="#a37f51" stroke-dasharray="4 4"/><text x="51" y="60" text-anchor="middle" font-size="23" font-weight="850" fill="#536e50">T</text>';if(type==='train')body+='<g transform="translate(0 12) scale(.78)">'+trainPic().replace(/<svg[^>]*>|<\/svg>/g,'')+'</g>';if(type==='busstop')body+='<image href="'+ASSETS.shelter+'" width="136" height="94" preserveAspectRatio="xMidYMid meet"/>';if(type==='bus')body+='<rect x="16" y="22" width="108" height="57" rx="12" fill="#6c9d86" stroke="#3c6d59" stroke-width="3"/><path d="M25 32H112V53H25Z" fill="#f7e3b1"/><path d="M48 32V53M75 32V53M99 32V53" stroke="#527a65" stroke-width="4"/><circle cx="39" cy="80" r="10" fill="#3a5748"/><circle cx="103" cy="80" r="10" fill="#3a5748"/><text x="68" y="71" text-anchor="middle" font-size="17" font-weight="800" fill="#fff5cf">5</text>';
return '<svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><marker id="'+head+'" markerWidth="4" markerHeight="4" refX="2.7" refY="2" orient="auto"><path d="M0 0L3 2 0 4Z" fill="#d57c35"/></marker></defs>'+body+'</svg>'}
function busTable(){const m=MAPS.town;return '<table><thead><tr><th>Town bus stop</th><th>Bus → next stop</th></tr></thead><tbody>'+m.stops.map(s=>'<tr><td>'+s.name+'</td><td>'+m.routes.filter(r=>r.stops.includes(s.id)).map(r=>'Bus '+r.n+' → '+m.stops.find(p=>p.id===r.stops[(r.stops.indexOf(s.id)+1)%r.stops.length]).name).join('<br>')+'</td></tr>').join('')+'</tbody></table>'}
function bookContent(){if(bookTab==='controls')return '<div class="controls-help"><h3>Walking and looking around</h3><p>Hold <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or <b>WASD</b> to walk. Tap for a small step. The arrow buttons do the same thing. Up is north.</p><p>Drag the scenery to look around. Use <b>+</b> and <b>−</b> to zoom. <b>Whole map</b> shows the entire area. The camera follows you when you walk. <b>H</b> hides or shows the controls.</p><h3>Crossing roads</h3><p>Use a zebra crossing and wait for the green walking signal. If it changes while you are crossing, you can finish crossing.</p><h3>Buses</h3><p>Walk close to a named bus stop. Click a service or press the choice number shown beside it. Press <b>Space</b> to board. Check the next-stop name: a different bus goes somewhere else.</p>'+busTable()+'<h3>Trains</h3><p>Walk up to the train station. Choose <b>Buy ticket · Go to the suburbs</b>, or press <b>Space</b>. At the station in the suburbs, buy a ticket back to town.</p><p>Close an offer with <b>×</b> if you prefer to keep walking. It appears again after you walk away and return. <b>Back to start</b> returns you to the starting point on your current map.</p></div>';return '<div class="glossary">'+BOOK_ENTRIES[bookTab].map((e,n)=>'<article class="entry"><div class="picture">'+picture(e,bookTab+n)+'</div><h3>'+e[0]+'</h3><p>'+e[2]+'</p><p class="ru" lang="ru">'+e[1]+'</p></article>').join('')+'</div>'}
function renderBook(){const b=$('book');b.classList.toggle('with-russian',russian);b.innerHTML='<div class="book-shell"><div class="book-head"><h2><img src="'+ASSETS.bookIcon+'" alt="">Phrases & places</h2><button class="close" data-close-book aria-label="Close phrase book">×</button></div><div class="book-nav">'+[['directions','Directions'],['places','Places'],['transport','Transport'],['controls','How to play']].map(([id,n])=>'<button class="tab '+(bookTab===id?'active':'')+'" data-tab="'+id+'" aria-pressed="'+(bookTab===id)+'">'+n+'</button>').join('')+'<label class="translation-toggle"><input id="russian" type="checkbox" '+(russian?'checked':'')+'>Russian translations</label></div><div class="book-content">'+bookContent()+'</div><div class="book-foot">Ask for directions, take a walk, then swap roles.</div></div>'}
function openBook(){if(activeInterior)return;clearKeys();renderBook();if(!$('book').open)$('book').showModal()}
$('book').addEventListener('click',e=>{if(e.target.closest('[data-close-book]')){$('book').close();$('camera').focus()}const t=e.target.closest('[data-tab]');if(t){bookTab=t.dataset.tab;renderBook()}});$('book').addEventListener('change',e=>{if(e.target.id==='russian'){russian=e.target.checked;$('book').classList.toggle('with-russian',russian)}});$('book').addEventListener('close',clearKeys);

