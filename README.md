# Cucina Mia

App di cucina: ingredienti di stagione, 120 ricette italiane divise per regione, il tuo ricettario personale, i menu con la lista della spesa e gli strumenti da cucina. Stessa grafica di Orto Mio, in tinta terracotta. Tutto funziona senza internet e senza account: i dati restano sul telefono.

## Cosa c'è

- **Ingredienti**: 177 ingredienti (verdure, frutta, erbe e spezie, latticini e uova, carne, pesce, dispensa) con selettore del mese (di stagione / sempre / tutti), ricerca e categorie. Ogni scheda ha stagione, come si conserva, con cosa si abbina, cosa usare se manca, un consiglio e l'elenco delle ricette che lo usano (anche le tue).
- **Menu**: crea un menu (es. Cena di Natale), scegli le ricette e il numero di persone: la lista della spesa somma le quantità, le raggruppa per reparto e si può spuntare, copiare o condividere.
- **Ricettario**: 120 ricette di base per le 20 regioni, filtrabili per regione e tipo di piatto. Dosi che si adattano al numero di persone. Ogni ricetta si può **modificare** (con «Originale» per tornare indietro), segnare come **preferita**, e si possono **aggiungere ricette proprie**.
- **Scansiona un foglio**: scatti o scegli una foto, il testo viene letto sul telefono (Tesseract, italiano, offline) e finisce nei campi della ricetta, da correggere. Funziona bene con testo stampato o in stampatello; il corsivo a mano viene letto male. La foto resta allegata alla ricetta.
- **Strumenti**: conversioni (grammi, ml, tazze, cucchiai e °C/°F), timer multipli, tabella dei tempi di cottura.

Le ricette sono scritte appositamente per l'app, con dosi indicative («assaggia e regola»). Vanno provate e riviste prima della pubblicazione.

## Avvio

```bash
npm install
npm run dev      # sviluppo, http://localhost:5173
npm run build    # versione di produzione in dist/
npm run preview  # prova la build
```

`dev` e `build` copiano da soli in `public/ocr/` i file del riconoscimento testo (cartella ignorata da git). Serve Node 18 o superiore.

## Struttura

```
index.html        pagina e tre sezioni
src/main.js       stato, schermate, schede, editor ricette, timer, conversioni
src/data.js, src/data2.js   ingredienti (stagioni, conservazione, abbinamenti)
src/ricette.js    ricette e regioni
src/art.js        illustrazioni SVG (verdure)  ·  src/art2.js  (formaggi, pasta, uova, pane…)
src/ocr.js        lettura del testo dalle foto e divisione in titolo / ingredienti / passaggi
src/style.css     grafica (tema chiaro e scuro automatici)
scripts/copy-ocr.mjs   copia i file di Tesseract in public/ocr
```

## Android

L'ID dell'app è `it.devori.cucinamia`. I workflow in `.github/workflows` sono quelli di Orto Mio (APK di prova a ogni modifica e build di pubblicazione AAB con i Secrets `UPLOAD_KEYSTORE_B64` e `UPLOAD_KEYSTORE_PASSWORD`): per la pubblicazione vale la stessa procedura, serve però una **nuova chiave di caricamento** per questa app.
