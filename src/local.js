import { PROMPT } from "./claude.js";

const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.0";
const MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct";
let loading = null;

async function load(onProgress) {
  if (!navigator.gpu) {
    throw new Error("The free local model needs WebGPU. Use a recent Chrome or Edge, or enter an API key.");
  }
  const tf = await import(LIB);
  const progress_callback = (p) => {
    if (p.status === "progress" && typeof p.progress === "number") onProgress(Math.round(p.progress));
  };
  const processor = await tf.AutoProcessor.from_pretrained(MODEL_ID);
  const model = await tf.AutoModelForVision2Seq.from_pretrained(MODEL_ID, {
    dtype: { embed_tokens: "fp16", vision_encoder: "q4", decoder_model_merged: "q4" },
    device: "webgpu",
    progress_callback,
  });
  return { tf, processor, model };
}

export async function askLocal(imageBase64, onProgress = () => {}) {
  loading ??= load(onProgress).catch((e) => {
    loading = null;
    throw e;
  });
  const { tf, processor, model } = await loading;
  const messages = [{ role: "user", content: [{ type: "image" }, { type: "text", text: PROMPT }] }];
  const text = processor.apply_chat_template(messages, { add_generation_prompt: true });
  const image = await tf.load_image(`data:image/jpeg;base64,${imageBase64}`);
  const inputs = await processor(text, [image], { do_image_splitting: false });
  const out = await model.generate({ ...inputs, max_new_tokens: 256 });
  const [decoded] = processor.batch_decode(out.slice(null, [inputs.input_ids.dims.at(-1), null]), {
    skip_special_tokens: true,
  });
  return decoded.trim();
}
