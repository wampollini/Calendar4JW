# Guida Verifica OAuth Google - Console in Italiano

**Data:** 19 Marzo 2026  
**App:** Calendar4JW  
**Build:** 27

---

## 📋 Preparazione Documenti

Prima di iniziare, assicurati di avere pronti:

- ✅ **Video dimostrativo** dell'app che mostra:
  - Login con Google
  - Autorizzazioni richieste (Calendar)
  - Funzionalità di sincronizzazione calendario
  - Utilizzo completo dell'app
  
- ✅ **Privacy Policy URL:** https://calendar4jw-prod.web.app/privacy-policy.html

- ✅ **Build 27 APK** caricata su Firebase App Distribution

---

## 🔐 Accesso alla Console

1. Vai su: https://console.cloud.google.com/
2. Seleziona il progetto: **"calendar4jw-prod"**
3. Menu laterale → **"API e servizi"** → **"Schermata consenso OAuth"**

---

## 📝 Sezione 1: Informazioni sull'App

### Percorso: API e servizi → Schermata consenso OAuth → MODIFICA APP

**Campi da compilare:**

| Campo | Valore |
|-------|--------|
| **Nome dell'applicazione** | Calendar4JW |
| **Email assistenza utenti** | la tua email (già configurata) |
| **Logo dell'applicazione** | (opzionale) Carica logo 120x120px |
| **Link alla home page dell'app** | https://calendar4jw-prod.web.app |
| **Link Norme sulla privacy** | https://calendar4jw-prod.web.app/privacy-policy.html |
| **Link Termini di servizio** | https://calendar4jw-prod.web.app/terms-of-service.html |
| **Domini autorizzati** | calendar4jw-prod.web.app<br>calendar4jw-prod.firebaseapp.com |

---

## 🔑 Sezione 2: Ambiti (Scope)

### Percorso: Schermata consenso OAuth → MODIFICA APP → Ambiti

**Verifica che sia presente:**

```
https://www.googleapis.com/auth/calendar
```

**Descrizione da inserire:**
```
L'app sincronizza gli eventi del calendario dell'utente con Google Calendar 
per permettere la gestione unificata degli impegni congregazionali.
```

**Screenshot richiesto:** Mostra la sezione "Ambiti" con lo scope calendar visibile.

---

## 📹 Sezione 3: Video Dimostrativo

### Percorso: Schermata consenso OAuth → Verifica OAuth → Carica video

**Dove caricare il video:**

1. **Opzione A - YouTube (consigliata):**
   - Carica il video su YouTube
   - Imposta come "Non in elenco" (Unlisted)
   - Copia il link e incollalo nel modulo
   
2. **Opzione B - Google Drive:**
   - Carica il video su Google Drive
   - Imposta permessi: "Chiunque abbia il link può visualizzare"
   - Copia il link e incollalo nel modulo

**Cosa deve mostrare il video (già fatto):**
- ✅ Apertura dell'app
- ✅ Click su "Connetti Google Calendar"
- ✅ Schermata consenso Google con richiesta permessi Calendar
- ✅ Accettazione permessi
- ✅ Sincronizzazione eventi
- ✅ Visualizzazione eventi sincronizzati nel calendario

**Durata consigliata:** 1-3 minuti

---

## 📄 Sezione 4: Dichiarazione di Conformità

### Percorso: Verifica OAuth → Dichiarazione

**Domande da rispondere:**

### 1. **Perché l'app necessita dell'accesso a dati sensibili?**

**Risposta suggerita:**
```
Calendar4JW è un'applicazione per la gestione degli impegni congregazionali 
dei Testimoni di Geova. L'accesso al calendario Google è necessario per:

1. Sincronizzare automaticamente gli impegni di servizio (predicazione, 
   adunanze, assemblee)
2. Permettere agli utenti di visualizzare tutti i loro impegni in un unico 
   calendario
3. Inviare notifiche per gli impegni imminenti
4. Consentire la modifica e cancellazione di eventi sincronizzati

L'app accede SOLO ai calendari dell'utente che ha effettuato l'accesso, 
non raccoglie dati di terzi né condivide informazioni con esterni.
```

### 2. **Come viene utilizzato l'ambito calendar?**

**Risposta suggerita:**
```
L'ambito https://www.googleapis.com/auth/calendar viene utilizzato per:

LETTURA:
- Recuperare eventi già presenti nel calendario Google dell'utente
- Sincronizzare bidirezionalmente con il calendario locale dell'app

SCRITTURA:
- Creare nuovi eventi di servizio nel calendario Google
- Aggiornare eventi esistenti quando modificati nell'app
- Eliminare eventi quando rimossi dall'utente

NESSUN UTILIZZO PER:
- Accesso a calendari di altri utenti
- Vendita o condivisione dati con terze parti
- Profilazione o pubblicità
```

### 3. **Come vengono protetti i dati degli utenti?**

**Risposta suggerita:**
```
PROTEZIONE DATI:
- Token OAuth memorizzati in Capacitor SecureStorage con crittografia AES-256
- Comunicazione tramite HTTPS/SSL
- Nessun salvataggio dati su server esterni (tutto locale o Firebase Auth)
- Utente può disconnettere account Google in qualsiasi momento
- Disconnessione rimuove tutti gli eventi sincronizzati

PRIVACY:
- Privacy Policy completa pubblicata su: 
  https://calendar4jw-prod.web.app/privacy-policy.html
- Conformità GDPR
- Nessuna raccolta dati per scopi pubblicitari
- Utilizzo dati limitato esclusivamente alla funzionalità dell'app
```

### 4. **L'app è destinata al solo uso personale o sarà distribuita pubblicamente?**

**Risposta:**
```
L'app sarà distribuita pubblicamente su Google Play Store per l'uso da parte 
dei Testimoni di Geova in tutto il mondo. 

Target utenti: Membri delle congregazioni che desiderano gestire i propri 
impegni di servizio teocratico in modo organizzato.

Distribuzione: Gratuita, senza acquisti in-app, senza pubblicità.
```

---

## 🖼️ Sezione 5: Screenshot dell'App

### Percorso: Verifica OAuth → Screenshot

**Screenshot richiesti (almeno 4-5):**

1. **Schermata principale** - Vista calendario con eventi
2. **Connessione Google** - Bottone "Connetti Google Calendar"
3. **Consenso OAuth** - Schermata Google che richiede permessi Calendar
4. **Eventi sincronizzati** - Lista eventi dopo sincronizzazione
5. **Impostazioni account** - Sezione gestione account Google
6. **Privacy/Sicurezza** - Schermata che mostra opzione disconnessione

**Formato:** PNG o JPG, risoluzione minima 1280x720px

---

## 🚀 Invio della Richiesta

### Passi finali:

1. **Revisione completa:**
   - Controlla tutti i campi compilati
   - Verifica che i link Privacy Policy e Terms funzionino
   - Testa il link del video dimostrativo
   
2. **Percorso invio:**
   ```
   API e servizi → Schermata consenso OAuth → INVIA PER VERIFICA
   ```
   
3. **Bottone:** Clicca su **"Invia per verifica"** o **"Richiedi verifica"**

4. **Conferma:** Riceverai email di conferma ricezione richiesta

---

## ⏱️ Tempi di Verifica

- **Tempo medio:** 3-5 giorni lavorativi
- **Massimo:** 2-4 settimane per richieste complesse
- **Comunicazioni:** Tramite email dell'account Google Cloud

### Durante l'attesa:

- ✅ Puoi continuare a testare con account di test (massimo 100 utenti)
- ✅ L'app funziona normalmente per utenti test
- ❌ Utenti non-test vedranno "App non verificata" fino ad approvazione

---

## 📧 Possibili Richieste di Google

Google potrebbe chiedere chiarimenti su:

1. **Utilizzo specifico dello scope calendar**
   - Prepara screenshot che mostrano dove/come usi l'API Calendar
   
2. **Modello di business**
   - Specifica che l'app è gratuita, no ads, no monetizzazione
   
3. **Privacy Policy dettagliata**
   - Già presente e conforme: ✅
   
4. **Video più dettagliato**
   - Mostra ogni passaggio del flusso OAuth

---

## ✅ Checklist Finale Pre-Invio

```
□ Nome app: Calendar4JW
□ Email assistenza configurata
□ Privacy Policy URL verificato e funzionante
□ Terms of Service URL verificato e funzionante
□ Domini autorizzati aggiunti
□ Scope calendar configurato
□ Video dimostrativo caricato e accessibile
□ Screenshot app preparati (minimo 4-5)
□ Dichiarazione conformità completata
□ Build di test funzionante su Firebase App Distribution
```

---

## 🆘 In Caso di Problemi

### Errore: "Dominio non verificato"

**Soluzione:**
1. Menu → **Search Console** (cerca questa voce)
2. Aggiungi proprietà: `calendar4jw-prod.web.app`
3. Verifica tramite Firebase (automatico)

### Errore: "Privacy Policy non accessibile"

**Verifica:**
```bash
curl https://calendar4jw-prod.web.app/privacy-policy.html
```
Status 200 = OK ✅

### Errore: "Video non visualizzabile"

**Controlli:**
- YouTube: Impostato come "Non in elenco" (NON privato)
- Google Drive: Permessi "Chiunque con link può visualizzare"
- Link diretto al video (non alla cartella)

---

## 📞 Contatti Google per Supporto

Se hai problemi durante la verifica:

1. **Centro assistenza OAuth:**
   https://support.google.com/cloud/answer/9110914

2. **Forum Google Cloud:**
   https://www.googlecloudcommunity.com/

3. **Email dal modulo verifica:**
   Usa il link "Contatta il supporto" nel modulo stesso

---

## 📌 Note Importanti

⚠️ **NON modificare gli scope durante la verifica** - Dovrai rifare il processo

⚠️ **Mantieni Privacy Policy aggiornata** - Deve riflettere esattamente cosa fa l'app

⚠️ **Video deve mostrare SOLO funzionalità OAuth** - Non serve demo completa dell'app

✅ **Build 27 già deployata** - App pronta per la verifica pubblica

✅ **Scope calendar già configurato** - Sincronizzazione funzionante

---

## 🎯 Dopo l'Approvazione

Una volta approvato:

1. ✅ Rimuovi limite 100 utenti test
2. ✅ Pubblica su Google Play Store
3. ✅ Utenti non vedranno più "App non verificata"
4. ✅ Nessun limite al numero di utenti OAuth

**Tempo validità:** L'approvazione OAuth non scade, ma Google può ri-verificare se:
- Modifichi gli scope richiesti
- Cambi sostanzialmente la Privacy Policy
- Ricevi segnalazioni utenti

---

**Ultima revisione:** 19 Marzo 2026  
**Build corrente:** 27 (Traduzioni complete)  
**Status:** Pronta per verifica OAuth ✅
