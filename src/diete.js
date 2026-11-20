// Etichette alimentari calcolate dagli ingredienti di una ricetta: vegetariano, senza glutine, senza lattosio.
// Principio: nel dubbio NON si dichiara «sì». Ogni stato è uno di:
//   si = nessun ingrediente problematico · adatt = basta sostituire alcuni ingredienti
//   verifica = dipende dalla marca o non è riconosciuto · no
import { V } from "./data.js";

var BY = {};
V.forEach(function (v) { BY[v.id] = v; });

/* ---------- VEGETARIANO ---------- */
var CARNE_TXT = /(carne|pesce|salsicc|ragù|ragu|prosciutto|capocollo|luganega|lucanic|faraona|bottarga|ricci di mare|gamberi|crostacei|osso|midollo|bollito|lardo|pancetta|speck|guanciale|cotenn|trippa|mortadella|bresaola|coppa|salame|cotechino|zampone|polpo|seppi|calamar|cozze|vongole|tonno|acciug|baccal|stoccafisso|sarde|salmone|trota|branzino|orata|agnello|maiale|manzo|vitello|pollo|coniglio|anatra|tacchino|fegato|interiora)/;

function vegLine(i, nome) {
  var t = i[2].toLowerCase(), id = i[3], v = id && BY[id];
  if (id === "brodo" || (/brodo/.test(t) && !/(vegetal|verdur)/.test(t))) {
    if (!/(vegetal|verdur)/.test(t)) return { s: "adatt", n: "brodo vegetale al posto di quello di carne" };
  }
  if (id === "acciughe" || /acciug/.test(t)) {
    // adattabile solo se le acciughe sono un aroma, non il cuore del piatto
    if (/acciug/.test(nome.toLowerCase()) || (i[0] && i[0] > 80)) return { s: "no" };
    return { s: "adatt", n: "capperi o olive tritate al posto delle acciughe" };
  }
  if (/strutto/.test(t)) return { s: "adatt", n: "burro o olio al posto dello strutto" };
  if (id === "gelatina" || /(colla di pesce|gelatina)/.test(t)) return { s: "adatt", n: "agar-agar al posto della colla di pesce" };
  if (v && (v.cat === "Carne" || v.cat === "Pesce")) return { s: "no" };
  if (CARNE_TXT.test(t)) return { s: "no" };
  return { s: "si" };
}

/* ---------- SENZA GLUTINE ---------- */
var GLU_ID = { spaghetti: 1, farina: 1, pane: 1, semola: 1, pangrattato: 1, pastafresca: 1, couscous: 1, orzo: 1, farro: 1, fregola: 1, pastatipica: 1, pandispagna: 1, sfoglia: 1, brisee: 1, farinaintegrale: 1, manitoba: 1, biscottisecchi: 1, savoiardi: 1, salsasoia: 1, grano: 1 };
var GLU_TXT = /\b(birra|besciamella|crostini|gallette|sfoglia|sfoglie|sagne|fusilli|fileja|pici|strascinati|tortellini|lasagne|pasta|pane|mollica|pangrattato|biscott|couscous|seitan|farro|orzo|semola|manitoba|frolla|brisée|brisee|panettone|grano cotto|cappelletti|anolini|ravioli|gnocchi|tagliatelle|tagliolini|maccheroni|maccheroncini|spätzle|orecchiette|cavatelli|pizza|spaghetti|bigoli|pappardelle|trofie|malloreddus|gnocchetti|culurgiones|corzetti|strozzapreti|garganelli|paccheri|rigatoni|penne|bucatini|linguine|mezze maniche|ziti|fregola|taralli|piadina|focaccia|pizzoccheri|canederli|knödel|schlutzkrapfen|cjarsons|crespelle|crêpes|crepes|tortelloni|tortelli|agnolotti|plin|casoncelli|casunziei|passatelli|strangolapreti|lagane|fileja|umbricelli|maccheroncini|chitarra|tajarin|cantucci|savoiardi)\b/;
var GLU_FARINA_LIBERA = /(mais|ceci|riso|saraceno|castagn|mandorle|patate|tapioca|cocco)/;
var GLU_NO_SEMPRE = /(besciamella|fresca|ripien|sfoglia|sfoglie|frolla|brisée|brisee|birra|soia|couscous|pane\b|mollica|biscott|savoiardi|pan di spagna|gnocchi|ravioli|tortellini|cappelletti|anolini|pizza|crostini|gallette|lasagne|orzo|farro|semola|manitoba|integrale|grano|seitan)/;
// prodotti confezionati che di solito sono senza glutine ma dipendono dalla marca: si indica di sceglierli con l’etichetta
var GLU_ETICHETTA_ID = { amaretti: "amaretti senza glutine", brodo: "brodo fatto in casa o dado senza glutine", lievitochimico: "lievito senza glutine", cremanocciole: "crema di nocciole senza glutine", senape: "senape senza glutine", maionese: "maionese senza glutine", pesto: "pesto senza glutine", liquori: "liquori senza glutine", avena: "fiocchi d’avena certificati senza glutine", curry: "curry senza glutine", zuccherovelo: "zucchero a velo senza glutine", ostia: "ostia senza glutine" };
var GLU_ETICHETTA_TXT = [[/crema pasticcera/, "crema pasticcera fatta con amido di mais"], [/(spezie miste|^spezie$|curry)/, "miscela di spezie senza glutine"], [/amarett/, "amaretti senza glutine"], [/(dado|brodo)/, "brodo fatto in casa o dado senza glutine"]];
// righe senza ingrediente collegato che sono sicure
var SICURO_TXT = /^(acqua|ghiaccio|verdure|pesce|formaggio|funghi|tartufo|ricci|bottarga|prosciutto|fettine|faraona|lucanic|salsicc|luganega|friarielli|puntarelle|brovada|barolo|vin|frutta secca|semi|osso|midollo|carne|carni|arrosto|purè|mostarda|crostacei|gamberi|bollito|ragù|ragu|salsa verde|tofu)/;

var GLU_DISPENSA_SICURA = {};
"riso olio pelati passata concentrato polenta zucchero lievitobirra bicarbonato sale acetovino balsamico vinobianco vinorosso olive capperi ceci lenticchie cannellini borlotti pinoli noci mandorle nocciole pistacchi uvetta miele cacao cioccolato caffe gelatina oliosemi pomodorisecchi amido canditi arachidi pastamandorle farinaceci fecola zuccherocanna datteri sesamo girasole cecicotti tofu tahina sottaceti marmellata lattecondensato".split(" ").forEach(function (k) { GLU_DISPENSA_SICURA[k] = 1; });

function gluLine(i) {
  var t = i[2].toLowerCase(), id = i[3], q = i[0];
  if (/(farina)/.test(t) && GLU_FARINA_LIBERA.test(t)) return { s: "si" };
  if ((id && GLU_ID[id]) || GLU_TXT.test(t)) {
    if (GLU_NO_SEMPRE.test(t) || (id && !/^(spaghetti|farina|pangrattato)$/.test(id))) return { s: "no" };
    if (id === "farina" || /farina/.test(t)) return q && q <= 60 ? { s: "adatt", n: "farina di riso o di mais per infarinare" } : { s: "no" };
    if (id === "pangrattato" || /pangrattato/.test(t)) return { s: "adatt", n: "pangrattato senza glutine (o farina di mais)" };
    return { s: "adatt", n: "pasta senza glutine" };
  }
  if (/\bgrano\b(?! saraceno)/.test(t)) return { s: "no" };
  if (id && GLU_ETICHETTA_ID[id]) return { s: "adatt", n: GLU_ETICHETTA_ID[id] };
  for (var k = 0; k < GLU_ETICHETTA_TXT.length; k++) if (GLU_ETICHETTA_TXT[k][0].test(t)) return { s: "adatt", n: GLU_ETICHETTA_TXT[k][1] };
  if (!id && !SICURO_TXT.test(t)) return { s: "verifica", n: i[2] };
  if (id && BY[id] && BY[id].cat === "Dispensa" && !GLU_DISPENSA_SICURA[id]) return { s: "verifica", n: i[2] };
  return { s: "si" };
}

/* ---------- SENZA LATTOSIO ---------- */
var LAT_STAGIONATI = { parmigiano: 1, grana: 1, pecorino: 1 };   // naturalmente privi di lattosio
var LAT_ADATT = {
  burro: "burro senza lattosio (o olio)", latte: "latte delattosato", panna: "panna delattosata", yogurt: "yogurt senza lattosio",
  mascarpone: "mascarpone senza lattosio", ricotta: "ricotta senza lattosio", mozzarella: "mozzarella senza lattosio",
  stracchino: "stracchino senza lattosio", burrata: "burrata senza lattosio", pannaacida: "panna acida senza lattosio",
  robiola: "robiola senza lattosio", lattecondensato: "latte condensato senza lattosio"
};
var LAT_TXT = /(latte|burro|panna|formaggio|besciamella|crema pasticcera|ricotta|mascarpone|mozzarella|fontina|taleggio|gorgonzola|asiago|provol|scamorza|caciotta|caciocavallo|robiola|stracchino|burrata|yogurt|montasio|fonduta|cioccolato al latte)/;

function latLine(i) {
  var t = i[2].toLowerCase(), id = i[3], v = id && BY[id];
  if (id && LAT_STAGIONATI[id]) return { s: "si" };
  if (id && LAT_ADATT[id]) return { s: "adatt", n: LAT_ADATT[id] };
  if (/(besciamella|crema pasticcera)/.test(t)) return { s: "adatt", n: "besciamella o crema fatte con latte delattosato" };
  if (v && v.cat === "Latticini e uova" && id !== "uova") return { s: "verifica", n: i[2] };
  if (!id && LAT_TXT.test(t)) return { s: "verifica", n: i[2] };
  return { s: "si" };
}

/* ---------- combinazione ---------- */
function unisci(righe, extra) {
  var no = 0, adatt = [], ver = [];
  righe.forEach(function (r) {
    if (r.s === "no") no++;
    else if (r.s === "adatt") { if (r.n && adatt.indexOf(r.n) < 0) adatt.push(r.n); }
    else if (r.s === "verifica") { if (r.n && ver.indexOf(r.n) < 0) ver.push(r.n); }
  });
  if (no) return { s: "no" };
  if (adatt.length) return { s: "adatt", n: adatt.join(", ") + (ver.length ? ". Controlla l’etichetta di: " + ver.join(", ") : "") };
  if (ver.length) return { s: "verifica", n: ver.join(", ") };
  return { s: "si", n: extra || "" };
}

export var DIETE = [
  { k: "veg", n: "Vegetariano" },
  { k: "glu", n: "Senza glutine" },
  { k: "lat", n: "Senza lattosio" }
];

export function dieta(r) {
  var righe = r.ing || [], nome = r.n || "";
  var caglio = righe.some(function (i) { return /(parmigiano|grana|pecorino)/i.test(i[2]); });
  return {
    veg: unisci(righe.map(function (i) { return vegLine(i, nome); }), caglio ? "Parmigiano, grana e pecorino usano caglio animale: se sei rigoroso scegli versioni con caglio vegetale." : ""),
    glu: unisci(righe.map(gluLine)),
    lat: unisci(righe.map(latLine))
  };
}

// una ricetta passa il filtro se è «si» o «adatt»
export function passa(d, k) { return d[k].s === "si" || d[k].s === "adatt"; }
