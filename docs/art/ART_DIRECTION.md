# Little Town: modular art direction

Little Town production game art. Create a premium, exceptionally detailed raster sprite sheet, maximum available native resolution, ideally 2048x2048 square. Exactly FOUR independent objects arranged in an exact evenly spaced 2 by 2 grid. Each object centered in its own equal quadrant, with at least 8% transparent margin inside every quadrant, no object crossing cell boundaries. Transparent background, no ground rectangle, no scenery behind the object, no sheet dividers, no labels, NO LETTERS OR WORDS. Object fills about 85% of its cell. Each is one coherent miniature landmark, complete unclipped silhouette with tidy edges and soft localized contact shadow. Consistent elevated near-orthographic FRONT view looking down at roofs at 35 degrees, vertical facades, north at top, front doors facing bottom, no rotated isometric diamond bases. Realistic physical materials and richly painted storybook charm, only slightly whimsical/cartoon proportions; sunlit warm limestone, terracotta, deep teal accents, lush restrained greenery, crisp finely resolved texture. Soft sunlight from upper left. Beautiful inviting educational game artwork, natural believable anatomy and architecture, clean straight structural edges, coherent windows and doors, accurate wheel and railing geometry, no melted details, no random floating props, no gibberish signage, no people. Distinct recognizable visual storytelling at small sizes while rewarding zoom. Do not bake in surrounding streets, paths, map labels or game controls. Individual objects will be extracted by splitting the sheet at the exact horizontal and vertical midpoint.

## town-civic

- **Top left**: bakery: charming terracotta-roof bakery, striped cream-and-coral awning, clearly visible individual croissants, baguettes, sourdough loaves and berry tarts on exterior wicker stalls and behind large glass windows, bread emblem without lettering
- **Top right**: library: stately limestone library with slate roof, arched windows with visible orderly shelves of individually bound books, open-book relief above central door, wisteria
- **Bottom left**: school: welcoming small school with red tiled roof, small bell tower, wall clock with simple plausible hands, windows showing books and globe, neat central entrance
- **Bottom right**: hospital: small elegant cream hospital with slate roof, clear red medical cross emblem, accessible entrance, visible reception through glazing, restrained flower planters

## town-culture

- **Top left**: bank: dignified limestone bank, columns, golden coin relief, blue slate roof, secure brass doors, no words
- **Top right**: cafe: cozy terracotta-roof cafe, striped awning, espresso machine visible through window, two little outdoor tables with cups and cakes, chairs properly formed
- **Bottom left**: museum: beautiful neoclassical natural-history museum, large central glass exhibit window clearly showing a detailed anatomically coherent dinosaur skull on a plinth, ammonite fossils and pottery in side windows, limestone columns, teal banners without lettering
- **Bottom right**: police station: welcoming civic police building, blue slate roof, gold shield emblem, blue front door, tidy notice case without text

## town-shops

- **Top left**: post office: compact warm brick post office, envelope relief, traditional red postbox, visible sorted parcels behind window, red tile roof
- **Top right**: pharmacy: cream stone pharmacy, green cross emblem, large shop windows with orderly medicine bottles and mortar and pestle display, green-and-cream awning
- **Bottom left**: supermarket: welcoming neighborhood supermarket, wide glazing with neatly arranged recognizable fruit, vegetables, bread and baskets, coral awning, two coherent shopping carts
- **Bottom right**: train station: picturesque low railway station, central round analog clock, dark pitched slate roof, ticket windows, benches, cream walls; station only, no tracks

## town-leisure

- **Top left**: hotel: elegant three-storey boutique hotel with red tiled mansard roof, neat balconies, red rounded entrance canopy, flower boxes and polished brass luggage trolley
- **Top right**: cinema: charming small art-deco cinema, curved terracotta roof, gold star motif and orderly glowing marquee bulbs without words, posters with simple cinematic illustrations and no text, red curtains visible at doors
- **Bottom left**: park: compact landscaped park landmark with beautiful green-roof wooden gazebo, cherry tree, two benches, low flower beds and small oval pond; transparent irregular perimeter, NO paths crossing the middle
- **Bottom right**: market square fountain: beautiful circular limestone fountain with clear blue water and physically coherent fine water jets, four flower planters and two benches, compact circular paving base only, leave broad open walking ring around fountain

## town-nature-homes

- **Top left**: forest: dense lush cluster of deciduous and evergreen trees with individual leaf masses and beautifully textured trunks, wildflowers and mossy rocks, irregular footprint, no paths
- **Top right**: field: green meadow with delicate daisies, yellow buttercups, purple wildflowers and a few low rocks, low flat ground vignette with natural irregular transparent edges
- **Bottom left**: Bakers house: cozy cream family cottage with blue slate roof, little front porch, flower boxes, pink flowering tree beside house, side garage
- **Bottom right**: Johnsons house: warm peach two-storey family house, terracotta roof, symmetrical windows, front steps, rose bushes and small mailbox

## suburbs-homes-farm

- **Top left**: Millers house: cheerful yellow clapboard family home, deep blue slate roof, broad front porch, little dormer windows, flowering shrubs
- **Top right**: Wilsons house: pale blue family cottage with blue slate gables, garage to right, white picket fence sections and white flowering tree
- **Bottom left**: farm: wide compact red wooden barn with white trim, silo, tidy vegetable beds, small fenced paddock with two believable cows and hay bales, no roads
- **Bottom right**: suburban train station: small single-storey cream rural station, dark slate roof with little clock tower, open wooden porch and ticket counter, benches; no tracks

## suburbs-landscape

- **Top left**: forest: dense mixed woodland cluster with firs, broadleaf trees, textured bark, mossy rocks and small purple flowers, natural irregular silhouette, no paths
- **Top right**: field: golden wheat field with individually textured stalks, two round hay bales, low rustic fence fragments, red poppies, NO paths
- **Bottom left**: lake: beautiful calm oval turquoise lake with realistic ripples and reflections, water lilies, restrained rocky shore, a single weeping willow, NO paths
- **Bottom right**: hill: lush green rounded hill with wildflowers, limestone outcrops and a small wooden lookout railing at summit, NO paths

## suburbs-destinations

- **Top left**: mountain: magnificent compact group of grey alpine peaks with subtle snowy caps, layered believable rock strata and dark pines at base, no clouds or sky, NO paths
- **Top right**: shopping mall: wide elegant two-storey limestone mall, central curved glass atrium, colorful individually articulated shop displays, orderly potted trees, no logos or words, no road
- **Bottom left**: parking lot: rectangular flat asphalt parking area seen in same elevated front view, white organized parking bays, central OPEN north-south driving aisle and OPEN east-west middle aisle, few neatly parked distinct colored cars around edges, no buildings
- **Bottom right**: theme park: compact charming amusement park with fully coherent Ferris wheel, carousel, tidy red roller-coaster track on physically coherent supports, striped booths and welcoming central entrance facing forward, no text

## suburbs-coast

- **Top left**: bay: flat coastal blue water inlet vignette with natural rounded rocky shore on left and top, luminous ripples, reeds and subtle pebbles, no boats, no paths, natural irregular transparent edges
- **Top right**: harbor: small wooden marina jetty viewed from elevated front, neatly tied white sailboats with coherent masts and rigging on turquoise water around jetty, no shoreline paths, no text
- **Bottom left**: botanical prop: tiny flowering planter with terracotta pot and yellow flowers
- **Bottom right**: botanical prop: wooden garden bench with teal-painted iron legs

## Production rules

Each named place has an independent transparent WebP under `assets/places/`. `src/art.json` maps a stable place ID to its file and world-space rectangle. Replace an image there without changing `src/maps.json`, collision rules, labels, bus stops or train coordinates. Source sprite sheets are generated with transparent backgrounds; extract quadrants and trim transparent padding without resampling. Keep the original native pixels; do not describe upscaled files as new detail. The last two botanical props are spare art and are not game destinations.

Backgrounds are separate terrain plates under `assets/backgrounds/`. Keep roads, walkways, crossings, railway, bridges and river topology aligned with `src/maps.json`. No landmark should remain baked into a terrain plate. Review generated art visually; generation prompts cannot guarantee artifact-free output.

## Inspection and production notes

- Native destination sprites are approximately 571–650 pixels wide; exact sizes are recorded in `ASSET_INVENTORY.json`. No sprite was enlarged during extraction. Most building sprites have substantially more pixels per landmark than the former flattened maps.
- The generator sometimes returned a semi-opaque pale matte despite requesting transparency. Corrective image edits removed that matte from the shops, leisure, homes/farm and destination sheets before extraction.
- Corrective prompt: “Preserve the four exact landmarks and their details and positions. Remove all white/grey backdrop and haze to fully transparent alpha=0, including gutters. Only small localized contact shadows. Preserve complete silhouettes; no extra props, lettering or shared base.”
- Wide suburban destinations were regenerated to suit their footprints: mall approximately 4.5:1, parking approximately 4.8:1, theme park approximately 3.3:1. The destination sheet's actual vertical gutter is at x=600, rather than its exact midpoint; extraction follows that gutter to avoid neighboring fragments.
- Artwork-only `fit` overrides in `src/art.json` let ground planes fill a plot and forest clusters fill their viewport. They never change walkability.
- Paths through landscape sprites are rendered from the existing navigation polylines with a cobblestone texture extracted from the new terrain. Parked cars are independent sprites rendered at the existing collision rectangles; the parking surface contains no baked-in cars.
- Current validation: JavaScript syntax, existing gameplay suite, complete artwork coverage and offline embedding, plus browser rendering of both maps at 1920×1080. These checks do not prove every visual path is traversable or resolve the three deferred path bugs.
- Background terrain remains 1500×1049 (Town) and 1536×1024 (Suburbs). The generator retained the reference resolution. This release is not a native 4K terrain pack; 4K terrain requires a further higher-resolution art pass. Original flattened maps are preserved as references in `assets/`.
