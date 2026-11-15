# Found Again

Find possible lost-property matches from a remembered English description. A quantized MiniLM sentence encoder runs in the browser on the CPU, with separate rules for simple exclusions such as “not red”. All example items are fictional. A match is a lead, never proof of ownership.

## Run locally

Requirements: Python 3.10+; Node 20+ only for the optional rule tests. No API key, account or paid inference service is needed.

```sh
python3 scripts/prepare_assets.py
python3 scripts/build_site.py
python3 -m http.server 8788 --directory _site
```

Open http://localhost:8788/ in a modern browser. Use HTTP(S), not file URLs. Asset preparation downloads about 46.2 MB (44.1 MiB) from the exact URLs in `evidence/assets.json`; every file must match its recorded size and SHA-256. A missing manifest, missing hash or mismatch fails the build. No models are included in the source archive. The script does not change the lock manifest.

## Deploy with GitHub Pages

Use a public repository with `main` as the release branch. Select **Settings → Pages → Build and deployment → Source → GitHub Actions**. The workflow runs on pushes to main or a manual dispatch. It prepares verified assets, stages the contents of `app/` with license notices in `_site/`, uploads the Pages artifact and deploys it. Standard Linux runners for public repositories avoid paid inference and custom infrastructure. No repository secret is required; GitHub supplies a short-lived workflow token. The workflow uses pinned action commits and grants Pages write/OIDC permissions only to the deployment job.

After deployment, load the public URL and perform a real search. Verify the `.wasm` response has MIME `application/wasm`, the `.mjs` response is JavaScript, and the roughly 23 MB ONNX model loads successfully. A local test does not establish that the public deployment works.

## Evaluation and limitations

The recorded comparison used 18 fixed, hand-written, synthetic cases and the same eight fictional inventory items. The query set and 0.40 threshold were not changed after observing results.

| Cases | New complete system | Original TF–IDF + synonyms |
|---|---:|---:|
| Paraphrase / ordinary search (8) | 5/8 | 7/8 |
| Simple color/type exclusions (4) | 4/4 | 0/4 |
| No matching item (3) | 3/3 | 2/3 |
| Empty input (1) | 1/1 | 1/1 |
| Complex exclusions requiring clarification (2) | 2/2 | 0/2 |
| All cases (18) | **15/18** | **10/18** |

Both the recorded Node CPU and Chromium WASM runs produced these totals. Overall improvement includes the exclusion and rejection rules; **the paraphrase-only subset got worse**. This is not evidence that the embedding model alone is superior, a real-user study, a recovery rate, or a general accuracy estimate. Full recorded results are in `evidence/`; the fixture is `tests/cases.json`.

Run `node tests/core.mjs` for baseline parity and rule checks. For the browser model comparison, run `python3 scripts/prepare_assets.py`, serve the repository root with `python3 -m http.server 8789`, and open http://localhost:8789/tests/browser-benchmark.html. This loads the actual model from `app/`. The original baseline is retained in `reference/original-index.html`.

English only; at most 50 items, 300 characters per item and a 500-character query. Similarity is not a probability. Complex negatives request clarification, and the fixed cutoff can miss a valid item. Inventory edits trigger new embeddings; edits are not persisted and reset on reload. Staff must verify a private identifying detail before returning an item. Other browsers, low-end devices and real-world inventory have not been validated.

## Privacy and offline scope

Prepared runtime and model files are served from the app host. Inference uses browser memory; no inference API or analytics is used. The hosting provider still receives connection metadata. A loaded tab can search offline after loading the model. First visits and reloads offline are not guaranteed. The network label reflects `navigator.onLine`, not an actual reachability test.

## Licenses

Original application source: MIT (`LICENSE`). Model and Transformers.js: Apache-2.0. ONNX Runtime: MIT. Third-party files retain their own licenses and notices; see `THIRD_PARTY.md`, `licenses/` and the locked asset manifest. Third-party components are not relicensed by the application license.
