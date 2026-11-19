// Copia nella cartella public/ocr i file del riconoscimento testo (Tesseract) così l'app funziona senza internet.
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
const out = "public/ocr", lang = out + "/lang";
mkdirSync(lang, { recursive: true });
const core = "node_modules/tesseract.js-core/";
for (const f of ["tesseract-core-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js", "tesseract-core-relaxedsimd-lstm.wasm.js"]) copyFileSync(core + f, out + "/" + f);
copyFileSync("node_modules/tesseract.js/dist/worker.min.js", out + "/worker.min.js");
const ita = "node_modules/@tesseract.js-data/ita/4.0.0_best_int/ita.traineddata.gz";
if (!existsSync(ita)) throw new Error("manca " + ita);
copyFileSync(ita, lang + "/ita.traineddata.gz");
console.log("OCR copiato in " + out);
