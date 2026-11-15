import {parseQuery,rankVectors} from './search.js';
let extractor,loading,cachedKey='',cachedVectors=[];
export const metrics={modelCalls:0,dimensions:0,backend:'WASM / CPU',dtype:'q8'};
export async function loadModel(progress=()=>{}){
 if(extractor)return;if(loading)return loading;
 loading=(async()=>{const {pipeline,env}=await import('./vendor/transformers.min.js');
 env.allowRemoteModels=false;env.allowLocalModels=true;
 env.localModelPath=new URL('./models/',import.meta.url).href;
 env.backends.onnx.wasm.wasmPaths=new URL('./vendor/',import.meta.url).href;
 env.backends.onnx.wasm.numThreads=1;
 extractor=await pipeline('feature-extraction','MiniLM',{device:'wasm',dtype:'q8',progress_callback:progress});})();
 try{await loading}catch(e){loading=null;throw e}
}
async function embed(text){metrics.modelCalls++;const result=await extractor(text,{pooling:'mean',normalize:true});metrics.dimensions=result.dims.at(-1);return result.tolist()}
export async function semantic(query,inventory){const parsed=parseQuery(query);if(parsed.unsupported)return {hits:[],parsed,blocked:0,clarification:true};if(!parsed.positive||!inventory.length)return {hits:[],parsed,blocked:0};await loadModel();const key=JSON.stringify(inventory);if(key!==cachedKey){cachedVectors=await embed(inventory);cachedKey=key}const [q]=await embed([parsed.positive]);return rankVectors(query,inventory,cachedVectors,q)}
