# Cucina Mia: scheda per il Google Play Store

Tutto quello che serve da incollare nella Play Console. Testi in italiano.

## Dati dell'app

| Campo | Valore |
|---|---|
| Nome dell'app (max 30) | **Cucina Mia: Ricette Italiane** (28 caratteri) |
| ID dell'app | `it.devori.cucinamia` (non si cambia più dopo la prima pubblicazione) |
| Tipo | App |
| Gratuita o a pagamento | Gratuita |
| Categoria | Cibo e bevande |
| Email di contatto (pubblica) | mirko.ori.service@gmail.com |
| Sito web | https://mirkoori.github.io/Cucina-Mia/ |
| Informativa sulla privacy | https://mirkoori.github.io/Cucina-Mia/privacy.html |
| Lingua predefinita | Italiano (Italia) |

## Descrizione breve (max 80 caratteri)

```
496 ricette italiane per regione, menu con lista della spesa e filtri per dieta
```

## Descrizione completa (max 4000 caratteri)

```
Cucina Mia è il ricettario della cucina italiana, regione per regione, con gli ingredienti di stagione, un menu con la lista della spesa e gli strumenti utili ai fornelli.

RICETTARIO
496 ricette della tradizione, da tutte le regioni: antipasti, primi, secondi, contorni, dolci e le preparazioni di base. Ogni ricetta ha ingredienti con le dosi, passaggi, tempi, difficoltà e porzioni. Scegli per quante persone cucini e le quantità si ricalcolano da sole.

FILTRI PER ALIMENTAZIONE
Filtra le ricette vegetariane, senza glutine e senza lattosio. Ogni ricetta è etichettata: «sì» se è già adatta, «adattabile» con la sostituzione da fare. Nel dubbio non diciamo mai «sì». Le etichette sono indicative: in caso di celiachia, allergie o intolleranze controlla sempre l'etichetta dei prodotti.

INGREDIENTI
Le schede degli ingredienti con la stagione, come sceglierli e conservarli, e le ricette in cui si usano. Scopri subito cosa è di stagione nel mese.

MENU E LISTA DELLA SPESA
Metti insieme un menu scegliendo le ricette, indica per quante persone, e ottieni la lista della spesa già divisa per reparto, da spuntare mentre compri. La puoi copiare o condividere.

LE TUE RICETTE
Scrivi le tue ricette, modifica quelle dell'app, segna le preferite. Con «Scansiona un foglio» fotografi una ricetta scritta e il testo viene letto direttamente sul telefono. Puoi condividere una ricetta con un link.

STRUMENTI
Timer multipli per la cucina e «Scansiona un prodotto» per leggere un codice a barre e vedere gli ingredienti (dati Open Food Facts).

PENSATA PER ESSERE SEMPLICE
• Gratuita, senza pubblicità
• Nessun account e nessuna raccolta di dati personali
• Ricette e ingredienti funzionano anche offline
• Tema chiaro e scuro

NOTE
Le ricette sono quelle tradizionali: dosi e tempi sono indicativi e cambiano con forno, ingredienti e gusto. Il database di Open Food Facts è collaborativo (licenza ODbL): possono mancare dati o contenere errori.
```

## Grafica

Nella cartella `grafica/`:

| File | Dove va |
|---|---|
| `icona-512.png` | Icona dell'app (512 × 512) |
| `immagine-copertina-1024x500.png` | Immagine di presentazione (1024 × 500) |
| `screenshot-1…6-*.png` | Screenshot del telefono (1080 × 2100). Ne servono almeno 2, al massimo 8 |

Gli screenshot sono presi dall'app vera.

## Moduli della Play Console: risposte pronte

### Sicurezza dei dati (Data safety)
- **L'app raccoglie o condivide dati utente?** Le ricette, i preferiti e i menu restano solo sul telefono: non sono «raccolti». L'unico dato che esce dal dispositivo è il **codice a barre o il testo cercato in «Scansiona un prodotto»**, inviato a Open Food Facts (terza parte) solo per mostrare il prodotto, su richiesta dell'utente. Nel modulo la scelta più prudente è dichiararlo: **Informazioni sull'app e prestazioni → no; Attività nell'app → «Cronologia delle ricerche nell'app»: condiviso con terze parti, scopo «Funzionalità dell'app», facoltativo, non collegato all'identità.** Verifica le opzioni esatte mostrate dal modulo al momento della compilazione.
- **Foto e video / fotocamera:** la fotocamera serve per leggere testo e codici a barre sul dispositivo; le immagini non vengono inviate né salvate fuori dal telefono (non sono dati raccolti).
- **Pratiche di sicurezza:** dati in transito cifrati (HTTPS). L'utente può eliminare i dati disinstallando l'app o cancellando i dati dalle impostazioni di Android.
- **Se in futuro aggiungi pubblicità, account o statistiche, questa scheda e l'informativa vanno aggiornate prima.**

### Contenuto dell'app
- **Informativa sulla privacy:** https://mirkoori.github.io/Cucina-Mia/privacy.html
- **Annunci:** no.
- **Accesso all'app:** tutte le funzioni sono disponibili senza accesso né account.
- **Pubblico di destinazione:** 18 anni e oltre (alcune ricette usano vino o liquori come ingredienti). Non scegliere «meno di 13 anni».
- **App di notizie:** no. **Governativa:** no. **Funzioni finanziarie:** no.
- **App sulla salute:** no. Le etichette vegetariano / senza glutine / senza lattosio sono informative e hanno l'avvertenza; l'app non dà consigli medici.
- **Autorizzazioni sensibili:** solo fotocamera, richiesta quando l'utente tocca «Scansiona». Nessuna dichiarazione speciale.

### Classificazione dei contenuti (questionario IARC)
- Categoria: **Utilità / Riferimento**.
- Violenza, contenuti sessuali, linguaggio volgare, gioco d'azzardo, paura: **No**.
- Alcol e droghe: l'app contiene solo ricette con vino/liquori come ingrediente, non promuove il consumo. Rispondi in base alle domande del questionario e valuta se segnalare «riferimenti ad alcol».
- Interazione con altri utenti o contenuti generati dagli utenti: **No**. Condivisione posizione: **No**. Acquisti digitali: **No**.

### Altro
- **Nuove app e test:** per gli account personali creati dopo novembre 2023 Google chiede un test chiuso con almeno 12 tester per 14 giorni prima della produzione (verifica le regole attuali nella Play Console).
- **Operatore commerciale (DSA, UE):** se lo dichiari, nome, indirizzo ed email diventano pubblici. Per un'app gratuita e senza guadagni di solito si risponde di no; da rivalutare con pubblicità o acquisti.
