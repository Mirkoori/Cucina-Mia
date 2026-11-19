// Riconoscimento del testo da una foto (Tesseract, in italiano, tutto sul dispositivo).
// Funziona bene su testo stampato o scritto in stampatello; il corsivo a mano viene letto male:
// il risultato va sempre ricontrollato.
export async function leggiFoto(blob, onProgress) {
  const { createWorker } = await import("tesseract.js");
  var base = new URL("./ocr/", document.baseURI).href;
  var worker = await createWorker("ita", 1, {
    workerPath: base + "worker.min.js",
    corePath: base,
    langPath: base + "lang",
    gzip: true,
    workerBlobURL: false,
    logger: function (m) { if (m && m.status === "recognizing text" && onProgress) onProgress(m.progress || 0); }
  });
  try {
    var r = await worker.recognize(blob);
    return (r && r.data && r.data.text) || "";
  } finally {
    try { await worker.terminate(); } catch (e) {}
  }
}

// Divide il testo letto in titolo, ingredienti e passaggi.
export function dividiTesto(txt) {
  var righe = String(txt || "").replace(/\r/g, "").split("\n").map(function (r) { return r.replace(/\s+/g, " ").trim(); }).filter(Boolean);
  var out = { titolo: "", ing: [], steps: [] };
  var isIng = /^(ingredienti|per\s+\d+\s+persone|occorrente)\b/i, isPrep = /^(preparazione|procedimento|istruzioni|esecuzione|metodo|come si prepara)\b/i;
  var qty = /^(\d+([.,]\d+)?|½|¼|¾|\d+\s*\/\s*\d+)\s*(kg|g|gr|ml|l|dl|cl|cucchiai\w*|cucchiaini?|spicchi\w*|bicchieri?|tazz\w+|mazzo|rametti|pizzico|foglie|uova|uovo)?\b/i;
  var mode = "";
  righe.forEach(function (r) {
    if (isIng.test(r)) { mode = "ing"; var resto = r.replace(isIng, "").replace(/^[:\-–\s]+/, ""); if (resto && !/^\d*\s*persone/i.test(resto)) out.ing.push(resto); return; }
    if (isPrep.test(r)) { mode = "prep"; var rest = r.replace(isPrep, "").replace(/^[:\-–\s]+/, ""); if (rest) out.steps.push(rest); return; }
    if (!mode) {
      if (!out.titolo && !qty.test(r)) { out.titolo = r; return; }
      mode = qty.test(r) ? "ing" : "prep";
    }
    if (mode === "ing") { if (qty.test(r) || r.length < 40) out.ing.push(r.replace(/^[-•*·]\s*/, "")); else { mode = "prep"; out.steps.push(r); } }
    else out.steps.push(r.replace(/^(\d+[.)]|[-•*·])\s*/, ""));
  });
  return out;
}
