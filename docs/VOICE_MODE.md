# Voice mode: pharmacy pilot

Open the pharmacy, click the chemist and turn **Voice: on** beside the symptom chooser. Allow microphone permission when the browser asks. Say a symptom name or a sentence, then pause, or press **Finish speaking**. Matching symptom pictures acquire the existing green selection frame. Use **Speak** for another take, tap any picture to correct a selection, and use the normal recommendation button when ready.

Voice mode is optional. Every picture/control remains usable with mouse, touch or keyboard. Turning voice off, leaving the chooser/counter/interior, hiding the page or losing focus during recording stops the microphone. Each take ends automatically after speech/silence, with an absolute 30-second limit. Returning to a screen or reloading never starts recording automatically, even when the on/off preference was saved. The speaker icon represents the requested voice-input mode; this pilot does not add spoken pharmacist audio.

## Recognition and learner tolerance

The engine recognizes English locally, and the game matches symptom keywords rather than grading articles, verbs or sentence order. “Headache”, “I have a headache”, “I has a headache” and “head ache” all select headache. All twelve existing pharmacy symptoms have explicit keywords/aliases, including back pain, tooth ache, high temperature, coughing, influenza, a running nose and mosquito bites. Multiple clear symptoms in one utterance are supported. Existing manual selections remain selected; repeating a symptom never toggles it off.

Only final recognition results affect selections. Interim words are shown as feedback. Negated phrases such as “no fever” or “I don’t have a cough” do not add those symptoms. Negation does not erase an earlier manual selection; students can review and tap pictures to remove them. Long, close-spelled keywords or low-confidence words offer **Did you mean …?** buttons instead of guessing. Short unrelated words such as “coffee” do not fuzzy-match cough. Unknown/empty speech prompts a friendly retry or picture selection.

This is keyword practice, not a pronunciation/grammar grade or a diagnosis engine. Accent, microphone quality, background noise and the free English model affect accuracy. Students always review selections before recommendations; speech never buys products, spends money or advances the game month. Typed/transcribed grammar tests do not establish recognition accuracy for real student speech.

## Free, local engine

Vosk-browser 0.0.8 and Alpha Cephei's small US English 0.15 model are bundled under Apache-2.0, including WebAssembly, worker and model. No API key, paid recognition service, server or audio upload is used. The model is about 41 MB and is initialized only on the first explicit voice action. Warm model memory may be reused for later takes with no active microphone. Speech recognition works without internet when using the complete downloadable HTML.

Upstream files, checksums/licenses and the small in-memory filesystem modification are documented in `vendor/speech/README.md`/`manifest.json`. The original upstream engine/model remain unchanged in the source. The derived runtime disables IDBFS caching, keeping the model in memory rather than storing random Blob-URL model directories. The derived worker also parses our absolute model URL directly, so local-file `blob:null` worker origins do not become invalid base URLs. The game does not store recordings/transcripts. Only the on/off preference is stored, separately from gameplay progress.

The offline HTML embeds every image, engine, model, AudioWorklet and license. It is larger than previous downloads because it includes the English recognition model. The web preview externalizes the identical speech resources as content-hashed assets and loads them only on demand; its game iframe explicitly allows microphone access. The existing offline/web gameplay equivalence check verifies both image and speech manifests.

## Browser requirements and failure behavior

Use a recent desktop Chrome or Edge browser with microphone access permitted. Browsers typically require HTTPS, localhost or a trusted local-file context for microphone APIs. Local-file microphone support varies by browser/device; if unavailable or denied, the game explains how to retry and keeps manual symptom selection available. Safari/mobile and real student accents need user-device validation; no universal support is claimed.

The audio graph prefers AudioWorklet and falls back to ScriptProcessor for compatible browsers/file contexts. It sends mono PCM to the worker and outputs silence, preventing microphone playback/feedback. Model/script loads have timeouts. Cancelled model loads, delayed permission grants and late recognition results cannot revive recording or modify another visit's choices. Streams, audio nodes, contexts, recognizers and timers are cleaned up. Denied/missing/busy microphones and model errors show retry/manual instructions.

## Reusable architecture

- `src/voice-input.js`: context-neutral capture lifecycle with injected engine/audio/result adapters; one take at a time, cancellation tokens, final/partial results and resource cleanup.
- `src/voice-engine.js`: pinned local Vosk loader, warm in-memory model and browser audio graph.
- `src/voice-capture.js`: mono AudioWorklet; no recording storage or speaker playback.
- `src/voice-matching.js`: pure English symptom matching/negation/uncertainty rules.
- `src/pharmacy-voice.js`: pharmacy adapter, preference, controls/feedback and set-based selection integration.
- `assets/ui/voice`: generated matching HD speaker states and exact prompts.

Other venues can provide a different active-context/result adapter to the same controller. The pilot only enables the pharmacy chooser; no nonfunctional voice buttons are added to other places.

## Verification

`tests/voice.cjs` covers all twelve symptom mappings, common learner forms, multiple/negated/uncertain/no-match phrases, vendor integrity and microphone lifecycle races. `tests/voice-browser.py` runs the actual bundled Vosk/WASM engine through Chromium's audio capture pipeline using synthetic speech from FFmpeg/Flite, then checks selection, manual preservation, repeated/stale results, permission denial/delayed grants, context exit, ended tracks, responsive controls and unchanged money/calendar. This is synthetic-input browser validation, not a physical-microphone or student-accent test. The complete standalone HTML must also pass recognition with networking disabled before download delivery. Existing pharmacy/bank/grocery/gameplay regressions remain required.

`tests/voice-origin-browser.py` additionally loads the actual Vosk/WASM model and recognizes learner-grammar audio inside a sandboxed opaque-origin Blob worker, reproducing the `blob:null` URL condition found with direct local HTML. This checks the upstream URL compatibility patch without claiming physical microphone support in every browser/file policy.
