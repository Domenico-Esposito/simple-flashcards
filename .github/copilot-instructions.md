# Progetto

Il progetto "flashcards" è un'applicazione React Native con Expo. Viene utilizzata per creare,
visualizzare e gestire flashcard per lo studio.

Il progetto è strutturato con le seguenti cartelle principali, gestite come una monorepo Turborepo:

- `app`: Contiene il codice sorgente principale dell'applicazione React Native.
- `site`: Contiene il sito web associato al progetto. (Al momento vuoto)

# Applicazione

## Funzionalità principali app

L'applicazione non include funzionalità complesse, ma si concentra su:

- Creazione di mazzi di flashcard.
  - Ogni mazzo può contenere più flashcard.
  - Ogni mazzo è identificato da un "id". Dispone poi di: un titolo, una descrizione e una data di
    creazione. Solo il titolo è obbligatorio. La descrizione può essere vuota. La data di creazione
    viene impostata automaticamente e non è modificabile dall'utente.
- Aggiunta, modifica e cancellazione di flashcard ai mazzi.
  - Ogni flashcard è identificata da un "id". Dispone poi di: una domanda, una risposta, un
    riferimento all'id del mazzo a cui appartiene. Sia la domanda che la risposta sono obbligatorie.
  - La risposta può includere testo formattato in Markdown. Anche le immagini possono essere incluse
    nella risposta utilizzando la sintassi Markdown standard.
- Visualizzazione delle flashcard in modalità quiz.
  - L'utente può selezionare un mazzo e iniziare a rispondere alle flashcard. Nalla modalità quiz,
    viene mostrata solo la domanda inizialmente. L'utente può toccare un pulsante per rivelare la
    risposta.
  - Le flashcard vengono presentate in ordine casuale.
  - Le flashcard vengono presentate una alla volta, con un'interfaccia semplice per navigare tra le
    domande.
  - L'idea è di un'interfaccia pulita e minimalista. Le domande vengono mostrate all'utente con una
    presentazione simile a quella dei video TikTok, quindi con uno scroll continuo. La risposta
    viene mostrata solo quando l'utente tocca un pulsante apposito. La risposta viene mostrata con
    una transizione fluida, con un effetto simile al cambio di storia su Instagram.
  - Ricapitolando: l'utente vede le singole domande e può scrorrere verso l'alto o verso il basso
    per navigare tra le domande. Ogni domanda ha due pagine in stile "storie Instagram". La prima è
    quella di default e mostra la domanda. La seconda viene mostrata quando l'utente tocca un
    pulsante "Mostra risposta" e mostra la risposta.
  - Considera la possibilità che sia la domanda che la risposta possano essere molto lunghe. In
    questo caso, la singola pagina della domanda o della risposta deve essere scrollabile
    verticalmente.
- L'utente può importare ed esportare i mazzi di flashcard in formato JSON.
  - L'importazione, altro non fa che leggere un file JSON sul web in un particolare formato e
    aggiunge il mazzo di flashcard all'archivio locale dell'app.
  - Il formato JSON utilizzato per l'importazione e l'esportazione è semplice e documentato nell'app
    stessa.
- Persistenza dei dati localmente sul dispositivo utilizzando Expo SQLite.

## Struttura dati

Le strutture dati principali sono:

- Mazzo di flashcard:

  ```ts
  type Deck = {
    id: number; // Identificatore univoco del mazzo
    title: string; // Titolo del mazzo
    description?: string; // Descrizione opzionale del mazzo
    createdAt: string; // Data di creazione del mazzo in formato ISO
    flashcards: Flashcard[]; // Array di flashcard appartenenti al mazzo
  };
  ```

- Flashcard:
  ```ts
  type Flashcard = {
    id: number; // Identificatore univoco della flashcard
    question: string; // Testo della domanda (può includere Markdown)
    answer: string; // Testo della risposta (può includere Markdown)
    deckId: number; // Identificatore del mazzo a cui appartiene la flashcard
  };
  ```

## Design e UI

L'interfaccia utente è progettata per essere semplice e intuitiva, con un focus sulla facilità
d'uso. Viene utilizzato Tamagui per i componenti UI e lo styling.

Sono presenti animazioni fluide per migliorare l'esperienza utente, come transizioni tra le
schermate e animazioni per la visualizzazione delle risposte delle flashcard.

I colori sono neutri e rilassanti, per non affaticare l'utente durante le sessioni di studio
prolungate. È possibile scegliere tra una modalità chiara e una modalità scura.

La modalità chiara utilizza principalmente sfondi bianchi e colori pastello, mentre la modalità
scura utilizza sfondi scuri con accenti di colore più vivaci per garantire un buon contrasto. È
importante che entrambe le modalità siano coerenti tra tutti gli elementi dell'interfaccia utente.

Il font da utilizzare è un font elegante e altamente leggibile. La dimensione del font deve essere
adeguata per garantire una lettura confortevole su dispositivi mobili.

## Tecnologie utilizzate

- React Native con Expo per lo sviluppo mobile.
- TypeScript come linguaggio di programmazione.
- Expo Router per la gestione della navigazione.
- Zustand per la gestione dello stato globale.
- Expo SQLite per la persistenza dei dati localmente sul dispositivo (es. Flashcard e mazzi).
- React Hook Form per la gestione dei moduli.
- Tamagui per i componenti UI e lo styling.

## Dettagli tecnici

- L'obiettivo è mantenere il codice semplice e facilmente manutenibile.
- Viene utilizzato TypeScript per garantire la tipizzazione statica e ridurre gli errori a runtime.
- La gestione dello stato globale viene effettuata con Zustand, evitando l'uso di librerie più
  complesse come Redux.
- È importante scrivere codice modulare, con componenti riutilizzabili e funzioni ben definite.
- È importante includere commenti chiari e concisi per spiegare la logica complessa. I commenti
  devono essere scritti in inglese.
- Riduci al minimo la quantità di codice duplicato, creando funzioni e componenti riutilizzabili
  quando possibile.

## Struttura del progetto

- `app/components`: Componenti riutilizzabili dell'interfaccia utente.
- `app/app`: Schermate principali dell'applicazione, organizzate secondo la struttura di Expo
  Router.
- `app/store`: Gestione dello stato globale con Zustand.
- `app/utils`: Funzioni di utilità e helper.
- `app/hooks`: Custom hooks per la logica riutilizzabile.
- `app/types`: Definizioni dei tipi TypeScript utilizzati nel progetto.
- `app/assets`: Risorse statiche come immagini e font.
- `app/__tests__`: Test unitari per i componenti e le funzionalità dell'app.
