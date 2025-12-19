# Guida alla Distribuzione - Calendar4JW

## 📦 File APK

L'APK firmato è pronto per la distribuzione:
- **Percorso**: `android/app/build/outputs/apk/release/app-release.apk`
- **Dimensione**: ~3.8 MB
- **Requisiti**: Android 7.0+ (API 24+)

## 🚀 Distribuzione

### Opzione 1: Google Play Store

1. **Crea un account sviluppatore Google Play** (25$ una tantum)
   - Vai su: https://play.google.com/console/signup

2. **Crea una nuova app**
   - Nome: Calendar4JW
   - Lingua predefinita: Italiano
   - Tipo: App gratuita
   - Categoria: Produttività

3. **Carica l'APK**
   - Vai su "Rilascio" → "Produzione"
   - Carica `app-release.apk`
   - Compila le informazioni richieste:
     - Descrizione breve
     - Descrizione completa
     - Screenshot (almeno 2)
     - Icona app (512x512 px)
     - Grafica promozionale (1024x500 px)

4. **Privacy Policy** (obbligatoria se salvi dati utente)
   - L'app salva password CalDAV criptate localmente
   - Crea una pagina web con informativa privacy
   - Link esempio: https://tuosito.com/calendar4jw/privacy

5. **Invia per revisione**
   - La revisione richiede 1-7 giorni

### Opzione 2: Installazione Diretta (Sideload)

**Per utenti finali:**

1. Scarica `app-release.apk`
2. Sul telefono: Impostazioni → Sicurezza → "Consenti installazione da origini sconosciute"
3. Apri il file APK scaricato
4. Tocca "Installa"

**Per distribuzione via web:**

```html
<!-- Esempio link download -->
<a href="app-release.apk" download>
  📥 Scarica Calendar4JW v1.0
</a>
```

**Verifica firma APK** (opzionale, per sicurezza):
```powershell
keytool -printcert -jarfile app-release.apk
```

### Opzione 3: Distribuzione Interna

**Via email/Google Drive/Dropbox:**
- Condividi semplicemente il file `app-release.apk`
- Gli utenti devono abilitare "Installazione da origini sconosciute"

## 🔧 Cloudflare Worker

### URL Worker
Il proxy CalDAV è deployato su:
```
https://caldav-proxy.cal4jw-backend.workers.dev
```

### Gestione Worker

**Vedere log:**
```powershell
wrangler tail caldav-proxy
```

**Re-deploy dopo modifiche:**
```powershell
cd cloudflare-worker
wrangler deploy
```

**Monitoraggio:**
- Dashboard: https://dash.cloudflare.com
- Analytics → Workers → caldav-proxy
- Controlla richieste/giorno (limite gratuito: 100,000)

### In caso di problemi

**Worker non risponde:**
1. Verifica status: https://www.cloudflarestatus.com
2. Controlla dashboard Cloudflare per errori
3. Re-deploy: `wrangler deploy`

**Superamento limite gratuito:**
- Cloudflare Workers piano gratuito: 100,000 richieste/giorno
- Se superi, considera piano Workers Paid ($5/mese, 10M richieste)
- Oppure implementa rate limiting nell'app

## 🔄 Aggiornamenti App

### Build nuovo APK

1. **Incrementa versione** in `capacitor.config.json`:
```json
{
  "appId": "com.calendar4jw.app",
  "appName": "Calendar4JW",
  "version": "1.1.0"  // <-- cambia questo
}
```

2. **Incrementa versionCode** in `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 2       // <-- incrementa
        versionName "1.1.0" // <-- aggiorna
    }
}
```

3. **Build e deploy:**
```powershell
cd c:\progetti\calendar4jw
npm run build
npx cap copy android
cd android
.\gradlew assembleRelease
```

4. **APK aggiornato** sarà in:
   `android/app/build/outputs/apk/release/app-release.apk`

### Pubblicare aggiornamento

**Google Play:**
- Carica nuovo APK nella sezione "Produzione"
- Compila "Note di rilascio"
- Invia per revisione

**Distribuzione diretta:**
- Sostituisci vecchio APK con nuovo
- Notifica gli utenti dell'aggiornamento disponibile

## 🔐 Sicurezza

### Keystore
**IMPORTANTE**: Il file `android/keystore.properties` e `android/app/calendar4jw-release.keystore` sono esclusi da Git.

**Backup keystore:**
1. Copia `android/app/calendar4jw-release.keystore` in un luogo sicuro
2. Copia `android/keystore.properties` in un gestore password
3. **Non perdere questi file!** Senza keystore non potrai pubblicare aggiornamenti su Play Store

**Info keystore:**
- Alias: `calendar4jw`
- Tipo: PKCS12
- Validità: 10,000 giorni (27 anni)
- Certificato: CN=william ampollini, O=wahost code

### Environment Variables

L'app usa queste variabili (in `.env`):
```env
VITE_CLOUDFLARE_CALDAV_PROXY=https://caldav-proxy.cal4jw-backend.workers.dev
```

Dopo modifiche a `.env`, rifare build completo.

## 📊 Monitoraggio

### Statistiche Cloudflare
- Vai su: https://dash.cloudflare.com
- Workers & Pages → caldav-proxy
- Vedi: Richieste totali, errori, latenza

### Google Play Console (se pubblicato)
- Installazioni attive
- Crash reports
- Recensioni utenti
- Performance ANR (Application Not Responding)

## 🆘 Supporto

### Problemi comuni

**"App non installata":**
- Verifica che sia disinstallata la versione precedente
- Controlla spazio disponibile su telefono
- Abilita "Installazione da origini sconosciute"

**"Errore di parsing del pacchetto":**
- APK corrotto, scarica di nuovo
- Versione Android non compatibile (minimo: Android 7.0)

**Sincronizzazione CalDAV fallisce:**
1. Verifica connessione internet
2. Controlla credenziali account
3. Testa URL Nextcloud da browser
4. Controlla log Worker Cloudflare: `wrangler tail caldav-proxy`

**Worker Cloudflare in pausa:**
- Il piano gratuito NON ha pause automatiche
- Se ci sono problemi, controlla status: https://www.cloudflarestatus.com

## 📝 Changelog

### v1.0.0 (18/12/2025)
- ✅ Multi-account Google Calendar
- ✅ CalDAV/Nextcloud sync
- ✅ Import/Export ICS
- ✅ Tracking ore servizio (SB/CB/BS)
- ✅ Descrizioni HTML
- ✅ Password visibility toggle
- ✅ Migrazione a Cloudflare Workers

## 🔗 Link Utili

- **Repository**: https://github.com/wampollini/Calendar4JW
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Google Play Console**: https://play.google.com/console
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

---

**Sviluppatore**: William Ampollini - Wahost Code
**Licenza**: Proprietaria
**Supporto**: Vedi issues su GitHub
