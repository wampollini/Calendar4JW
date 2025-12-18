# Cloudflare Worker - CalDAV Proxy

Proxy per bypassare CORS e supportare metodi HTTP custom (PROPFIND, REPORT) necessari per CalDAV/Nextcloud.

## Setup

### 1. Installa Wrangler CLI
```powershell
npm install -g wrangler
```

### 2. Login a Cloudflare
```powershell
wrangler login
```

### 3. Deploy
```powershell
cd cloudflare-worker
wrangler deploy
```

Il worker sarà disponibile all'URL: `https://caldav-proxy.YOUR_SUBDOMAIN.workers.dev`

### 4. Aggiorna l'app
Dopo il deploy, copia l'URL del worker e aggiornalo in `src/lib/caldavSync.js`:

```javascript
const CLOUDFLARE_CALDAV_PROXY = 'https://caldav-proxy.YOUR_SUBDOMAIN.workers.dev';
```

## Limiti Piano Gratuito Cloudflare

- ✅ 100,000 richieste/giorno
- ✅ Nessuna pausa automatica
- ✅ Edge network globale
- ✅ Deploy illimitati

## Testing Locale

```powershell
wrangler dev
```

Il worker sarà disponibile su `http://localhost:8787` per test locali.
