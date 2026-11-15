# Third-party components and data flow

| Component | Pinned version / revision | License | Purpose |
|---|---|---|---|
| Xenova/all-MiniLM-L6-v2 | 751bff37182d3f1213fa05d7196b954e230abad9 | Apache-2.0 | Quantized 23 MB sentence encoder, derived from sentence-transformers/all-MiniLM-L6-v2 |
| @huggingface/transformers | 3.7.2 | Apache-2.0 | Tokenization, mean pooling and normalized embeddings |
| ONNX Runtime Web | 1.22.0-dev.20250409-89f8206ba4 | MIT | CPU WebAssembly inference; exact dependency of Transformers.js 3.7.2 |

Sources: https://huggingface.co/Xenova/all-MiniLM-L6-v2/blob/main/README.md ; https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 ; https://github.com/huggingface/transformers.js/blob/3.7.2/LICENSE ; https://github.com/microsoft/onnxruntime/blob/v1.22.0/LICENSE

`python scripts/prepare_assets.py` is a maintainer-time download. It contacts Hugging Face, its model-file redirect/CDN infrastructure, jsDelivr, raw.githubusercontent.com and apache.org. No API key, account, paid API, or inference service is required. `evidence/assets.json` records exact URLs, sizes and SHA-256 hashes. The model revision and runtime versions are pinned. Include downloaded license files when deploying `app/`. Preserve notices in minified runtime files.

The visitor's browser loads the prepared model, tokenizer, JS and WASM **from the same host as the app**. Remote model lookup is disabled in code. The Content Security Policy restricts connections to the app's origin. Requests still reveal connection metadata to the hosting provider. Query and inventory strings are processed locally; the application contains no analytics, submission endpoint, fetch carrying descriptions, cloud inference, or fallback API.

First use needs the app/runtime/model downloads (~45 MB). A loaded tab holds the model and inventory in memory. Search in that already loaded tab may work offline. Offline first visits/reloads are not guaranteed. The browser's online indicator reports navigator.onLine, not a successful reachability probe. Inventory changes are not persisted and reset on reload.

Only fictional item descriptions are included. No face, voice, owner identity or real lost-property dataset. No ownership decision is automated; staff need a private identifying detail. English-only, restricted negation grammar, heuristic similarity threshold, no calibrated accuracy claims.

The recorded Node CPU benchmark used ONNX Runtime Node 1.21.0 (MIT). That development dependency is not included in this minimal static-app source package. Browser comparison and rule tests are included.
