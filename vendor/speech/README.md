# Local speech recognition

Vosk-browser 0.0.8 (Apache-2.0) and Alpha Cephei's small US English 0.15 model (Apache-2.0). Both are bundled locally; no hosted recognition service, API key, audio upload or paid subscription is used.

Upstream engine: https://github.com/ccoreilly/vosk-browser ; npm archive https://registry.npmjs.org/vosk-browser/-/vosk-browser-0.0.8.tgz. Download integrity is verified against npm's SHA-512 metadata. `vosk.js` remains the exact upstream distribution, including its embedded WebAssembly and worker.

Model: the official Vosk-browser demo distribution at commit `a4b0d0fe60359e5ea9800f810f6b6f6c1d2b03c6`, file `models/vosk-model-small-en-us-0.15.tar.gz`. Git blob SHA-1 `e3d1cd066774967367b0a0f313cbb6379587d353`; SHA-256 `f0b24bb92a48ca575b6a96500d6b543f0f079c573dfe85bbe16001fc0404e1d8`; 41,184,862 bytes. Downloaded from https://raw.githubusercontent.com/ccoreilly/vosk-browser/gh-pages/models/vosk-model-small-en-us-0.15.tar.gz and verified against that official Git blob. Model README credits Copyright 2020 Alpha Cephei Inc. See MODEL-COPYING and MODEL-NOTICE.

Little Town modification (2026-11-09): `scripts/speech-engine.mjs` derives the embedded runtime at build time by replacing the worker's IDBFS mount/sync calls with in-memory storage. The original engine and model are unchanged. This avoids a persistent model cache named after random offline Blob URLs and allows recognition without IndexedDB. No audio/transcripts are saved by the game. All WebAssembly stays on-device in a worker. Licenses/notices are retained in the source and embedded in the standalone export.

The model is loaded only after an explicit voice action. The microphone starts only with user permission, and stops when a take ends, voice is disabled, the symptom chooser is left or the page is hidden. A loaded model may remain warm in memory until page exit, with no microphone stream active.
