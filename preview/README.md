# Pharmacy entry preview

Download **Little-Town-Pharmacy-Entry.zip** using GitHub's **Download raw file** button. Extract it, then open **Little-Town.html** in a browser. No server, installation or internet connection is needed.

## Try the pilot

Walk near the pharmacy entrance on **Garden Street**, between the post office and supermarket. Click **Enter the pharmacy · Space** or press Space. The entrance prompt takes priority when a pedestrian is also nearby.

Inside, the supplied neutral chemist stands behind the counter and says **Hello, how can I help you today?** She is clickable and keyboard accessible. The next interaction will be defined by the user; the pilot does not make purchases or change expressions.

Click **Back outside** or press Escape to leave. Outdoor position, facing and money are preserved. Only the pharmacy has entry enabled in this pilot. The approved exterior artwork, traffic, directions, walking animation, paving fixes and money counter are retained.

## Verification

Syntax/full Node tests and Chromium interior, money and existing gameplay suites pass. Tests cover entrance/pedestrian precedence, stale targets, repeat/held keys, focus, exit/Escape/native close, rapid re-entry, original asset hashes, neutral image/greeting/click hook and preserving money/position. Desktop/portrait/landscape screenshots were visually reviewed. The HTML inside this archive is byte-identical to the build.

[Recovery plan](../docs/IMPLEMENTATION_PLAN.md) · [Interior behaviour and extension event](../docs/INTERIORS.md) · [Original artwork manifest](../assets/interiors/source-manifest.json)

Branch: `preview/pharmacy-entry-20261107`. Earlier previews remain on their earlier branches. Main is unchanged.
