# Milan Club Marmirolo - Modulo Web Dati Socio

Applicazione web responsive creata per la raccolta e l'aggiornamento dei dati anagrafici dei soci del **Milan Club Marmirolo**, perfettamente fruibile da **smartphone, tablet e computer**, con invio immediato dei dati all'indirizzo email:

📧 **milanclubmarmirolo@gmail.com**

---

## 📱 Caratteristiche Principali

- **Ottimizzato per Smartphone e Tablet**:
  - Campi touch-friendly con altezza comoda (minimo 48px).
  - Nessun ingrandimento indesiderato della schermata su iPhone/iPad (font size ottimizzato a 16px).
  - Tastierini virtuali adatti a ciascun campo: numerico per CAP e Cellulare, tastiera email con chiocciola rapida, selettore nativo calendario per la data di nascita.
  - Supporto per il riempimento automatico del browser (*Autofill* di nome, cognome, indirizzo, ecc.).
- **Tutti i Campi della Scheda Socio**:
  - Ruolo/Qualifica (Presidente, Vice Presidente, Segretario, Tesoriere, Consigliere, Socio Ordinario, Junior, ecc.)
  - Nome, Cognome, Data di nascita, Luogo di nascita
  - Codice Fiscale (con conversione automatica in maiuscolo, verifica a 16 caratteri e contatore in tempo reale)
  - Indirizzo, Numero Civico, CAP, Località (Marmirolo e comuni limitrofi), Provincia
  - Email e Telefono Cellulare
  - Procedure speciali (Nuovo tesseramento, Aggiornamento dati, Segnalazione decesso, Provvedimento/Dimissioni)
  - Consenso Privacy GDPR obbligatorio
- **Design Rossonero Milan Club**:
  - Grafica personalizzata con stemma, colori sociali rossoneri, ombreggiature e icone SVG moderne.
- **Riepilogo e Stampa/PDF**:
  - Finestra di conferma a fine invio con riassunto dei dati inviati e pulsante per stampare o salvare in formato PDF.

---

## 🚀 Come Funziona l'Invio delle Email

Il form include **3 modalità di invio**:

### 1. Invio Diretto Web (FormSubmit - Consigliato, Già Configurato)
Il modulo invia i dati direttamente a `https://formsubmit.co/milanclubmarmirolo@gmail.com` tramite connessione sicura e crittografata (AJAX).
- **Cosa fare la primissima volta**: alla prima compilazione, FormSubmit invierà un'email a `milanclubmarmirolo@gmail.com` con un pulsante *"Activate Form"*. Basta cliccarlo una sola volta per attivare la casella. Da quel momento in poi, ogni modulo inviato arriverà subito nella posta in arrivo formattato in una tabella chiara e ordinata.

### 2. Invio tramite App Email (Mailto - Tasto Alternativo)
Se il dispositivo non ha connessione internet o si preferisce usare direttamente la propria app di posta (Gmail, Apple Mail, Outlook), premendo il pulsante secondario **"Oppure invia tramite App Email"** si aprirà l'app di posta con la mail precompilata con tutti i dati del socio, indirizzata a `milanclubmarmirolo@gmail.com`.

### 3. Server PHP Opzionale (`send.php`)
Se caricate i file su uno spazio web con PHP (es. hosting Aruba, Register, Altervista o cPanel del Milan Club), il file `send.php` è già pronto per inviare le email dal vostro server con layout HTML professionale.

---

## 💻 Come Aprire e Testare il Modulo in Locale

### Sul tuo computer:
Basta fare doppio clic sul file `index.html` per aprirlo in Google Chrome, Safari, Edge o Firefox.

### Da Tablet o Smartphone (stessa rete Wi-Fi):
Puoi avviare un server locale temporaneo dal terminale del tuo computer:

```bash
cd "/Users/lorenzo/Downloads/milan club"
python3 -m http.server 8080
```
Poi apri il browser del tablet/smartphone e digita l'indirizzo IP del tuo Mac seguito da `:8080` (es. `http://192.168.1.50:8080`).

---

## 🌐 Come Pubblicare il Modulo Online Gratuitamente

Per condividere il link con i soci o con i consiglieri via WhatsApp o Facebook, puoi pubblicare il form online gratis in pochi secondi con uno di questi metodi:

1. **Netlify Drop (Il più facile e veloce)**:
   - Vai su [app.netlify.com/drop](https://app.netlify.com/drop)
   - Trascina la cartella `milan club` nella finestra del browser.
   - Otterrai subito un link pubblico sicuro (es. `https://milanclubmarmirolo.netlify.app`) utilizzabile da qualsiasi smartphone e tablet nel mondo.
2. **GitHub Pages**:
   - Carica la cartella in un repository GitHub e attiva "Pages" dalle impostazioni.
3. **Hosting del Club**:
   - Carica i file (`index.html`, `style.css`, `script.js`, `send.php`) via FTP nella cartella del vostro sito web.
