import { Preferences } from '@capacitor/preferences';
import { CapacitorHttp } from '@capacitor/core';
import { Buffer } from 'buffer';
import { encryptPassword, decryptPassword } from './encryption';

// Helper per autenticazione Basic
function getAuthHeader(username, password) {
  const credentials = Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');
  return `Basic ${credentials}`;
}

// URL del proxy Cloudflare per CalDAV (da environment variables)
const CLOUDFLARE_CALDAV_PROXY = import.meta.env.VITE_CLOUDFLARE_CALDAV_PROXY || 'https://caldav-proxy.YOUR_SUBDOMAIN.workers.dev';

// Richiesta HTTP diretta (senza proxy) - bypassa CORS su mobile
async function makeDirectHttpRequest(url, method, headers, body) {
  try {
    console.log(`[HTTP Direct] Tentativo richiesta diretta: ${method} ${url}`);
    const response = await CapacitorHttp.request({
      url: url,
      method: method,
      headers: headers,
      data: body,
      connectTimeout: 30000,
      readTimeout: 30000
    });
    
    console.log(`[HTTP Direct] Successo! Status: ${response.status}`);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers || {}
    };
  } catch (error) {
    console.log(`[HTTP Direct] Fallito:`, error.message);
    throw error;
  }
}

// Cache per metodo di connessione preferito per dominio (direct vs proxy)
const connectionMethodCache = {};

// Helper per richieste HTTP con fallback automatico: Direct → Proxy
async function makeHttpRequest(url, method, headers, body, accountId = null) {
  const startTime = Date.now();
  const domain = new URL(url).hostname;
  
  console.log('[HTTP] makeHttpRequest called:', method, domain);
  
  // WebDAV methods + TUTTI i PUT verso CalDAV richiedono proxy
  const webdavMethods = ['PROPFIND', 'REPORT', 'PROPPATCH', 'MKCOL', 'COPY', 'MOVE', 'LOCK', 'UNLOCK'];
  const isCalDAVServer = domain.includes('wahost.eu');
  const isCalDAVPut = method === 'PUT' && isCalDAVServer;
  
  if (webdavMethods.includes(method.toUpperCase()) || isCalDAVPut) {
    console.log(`[HTTP] ${method} richiede proxy (WebDAV/CalDAV) - usando proxy`);
    const proxyResult = await makeProxyRequest(url, method, headers, body);
    const elapsed = Date.now() - startTime;
    console.log(`[HTTP] Proxy completato (${elapsed}ms)`);
    return proxyResult;
  }
  
  // Controlla se abbiamo già un metodo funzionante per questo dominio
  const cachedMethod = accountId ? connectionMethodCache[accountId] : connectionMethodCache[domain];
  
  // Se sappiamo già che questo server richiede il proxy, usalo direttamente
  if (cachedMethod === 'proxy') {
    console.log(`[HTTP] Dominio ${domain} richiede proxy (cached)`);
    return await makeProxyRequest(url, method, headers, body);
  }
  
  console.log('[HTTP] Tentativo richiesta diretta...');
  // Prova prima richiesta diretta (solo su mobile, bypassa CORS)
  try {
    const directResult = await makeDirectHttpRequest(url, method, headers, body);
    
    // Successo! Memorizza che questo dominio supporta richieste dirette
    if (accountId) {
      connectionMethodCache[accountId] = 'direct';
    } else {
      connectionMethodCache[domain] = 'direct';
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`[HTTP] Richiesta diretta completata (${elapsed}ms)`);
    return directResult;
    
  } catch (directError) {
    // Fallback su proxy Supabase
    console.log(`[HTTP] Richiesta diretta fallita, uso proxy Supabase`);
    
    try {
      const proxyResult = await makeProxyRequest(url, method, headers, body);
      
      // Memorizza che questo dominio richiede il proxy
      if (accountId) {
        connectionMethodCache[accountId] = 'proxy';
      } else {
        connectionMethodCache[domain] = 'proxy';
      }
      
      const elapsed = Date.now() - startTime;
      console.log(`[HTTP] Richiesta via proxy completata (${elapsed}ms)`);
      return proxyResult;
      
    } catch (proxyError) {
      const elapsed = Date.now() - startTime;
      console.error(`[HTTP] Entrambi i metodi falliti dopo ${elapsed}ms`);
      throw proxyError;
    }
  }
}

// Richiesta tramite proxy Cloudflare
async function makeProxyRequest(url, method, headers, body) {
  const startTime = Date.now();
  try {
    console.log(`[HTTP via Proxy] ${method} ${url}`);
    console.log('[Proxy] Headers:', headers);
    console.log('[Proxy] Body length:', body ? body.length : 0);
    
    const response = await CapacitorHttp.request({
      url: CLOUDFLARE_CALDAV_PROXY,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        url: url,
        method: method,
        headers: headers,
        body: body || undefined
      },
      connectTimeout: 45000,
      readTimeout: 45000
    });
    
    console.log('[Proxy] Response status:', response.status);
    console.log('[Proxy] ProxyData:', response.data);
    
    if (response.status === 200 && response.data) {
      const proxyData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      console.log('[Proxy] ProxyData.status:', proxyData.status);
      return {
        status: proxyData.status,
        data: proxyData.data,
        headers: proxyData.headers || {}
      };
    } else {
      throw new Error(`Proxy error ${response.status}: ${response.data || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[HTTP Proxy] Error:', error.message || error);
    throw error;
  }
}

// Fetch calendari usando CalDAV PROPFIND (via POST con X-HTTP-Method-Override)
async function fetchCalendarsViaCalDAV(baseUrl, username, password) {
  const propfindBody = `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:a="http://apple.com/ns/ical/">
  <d:prop>
    <d:resourcetype />
    <d:displayname />
    <c:calendar-description />
    <a:calendar-color />
    <c:supported-calendar-component-set />
  </d:prop>
</d:propfind>`;

  const davUrl = `${baseUrl}/remote.php/dav/calendars/${username}/`;
  
  // Usa PROPFIND vero tramite proxy Supabase
  const response = await makeHttpRequest(
    davUrl,
    'PROPFIND',
    {
      'Authorization': getAuthHeader(username, password),
      'Content-Type': 'application/xml; charset=utf-8',
      'Depth': '1'
    },
    propfindBody
  );
  
  if (response.status !== 207) {
    console.error('[CalDAV] Unexpected status:', response.status);
    if (response.status === 401) {
      throw new Error('Credenziali non valide');
    } else if (response.status === 404) {
      throw new Error('Percorso CalDAV non trovato. Verifica l\'URL del server.');
    } else {
      throw new Error(`Errore server: HTTP ${response.status}`);
    }
  }
  
  // Parse XML response
  return parseCalendarsFromXML(response.data, baseUrl, username);
}

// Parser XML per calendari
function parseCalendarsFromXML(xmlData, baseUrl, username) {
  const calendars = [];
  const xmlString = typeof xmlData === 'string' ? xmlData : JSON.stringify(xmlData);
  
  console.log('[CalDAV] Parsing XML response...');
  console.log('[CalDAV] XML sample:', xmlString.substring(0, 500));
  
  // Regex per estrarre info calendario
  const responseRegex = /<d:response[^>]*>([\s\S]*?)<\/d:response>/gi;
  const matches = [...xmlString.matchAll(responseRegex)];
  
  console.log('[CalDAV] Found XML responses:', matches.length);
  
  for (const match of matches) {
    const responseContent = match[1];
    
    console.log('[CalDAV] Response content sample:', responseContent.substring(0, 300));
    
    // Verifica se è un calendario (ha resourcetype calendar) - case insensitive e più permissivo
    const hasCalendar = /calendar/i.test(responseContent) && /<.*:?resourcetype/i.test(responseContent);
    console.log('[CalDAV] Has calendar tag:', hasCalendar);
    
    if (!hasCalendar) {
      continue;
    }
    
    // Estrai URL
    const hrefMatch = responseContent.match(/<d:href[^>]*>([^<]+)<\/d:href>/i);
    if (!hrefMatch) {
      console.log('[CalDAV] No href found, skipping');
      continue;
    }
    
    let calUrl = hrefMatch[1];
    if (!calUrl.startsWith('http')) {
      calUrl = `${baseUrl}${calUrl.startsWith('/') ? '' : '/'}${calUrl}`;
    }
    
    // Estrai displayname
    const displayNameMatch = responseContent.match(/<d:displayname[^>]*>([^<]*)<\/d:displayname>/i);
    const displayName = displayNameMatch ? displayNameMatch[1] : 'Calendario';
    
    // Estrai description
    const descMatch = responseContent.match(/<c:calendar-description[^>]*>([^<]*)<\/c:calendar-description>/i);
    const description = descMatch ? descMatch[1] : '';
    
    // Estrai colore
    const colorMatch = responseContent.match(/<a:calendar-color[^>]*>([^<]*)<\/a:calendar-color>/i);
    const color = colorMatch ? colorMatch[1] : '#4285f4';
    
    // Estrai URI dalla URL
    const uriMatch = calUrl.match(/\/calendars\/[^\/]+\/([^\/]+)\/?$/);
    const uri = uriMatch ? uriMatch[1] : calUrl;
    
    calendars.push({
      id: uri,
      uri: uri,
      url: calUrl,
      displayName: displayName,
      displayname: displayName,
      description: description,
      color: color,
      calendarColor: color
    });
  }
  
  console.log('[CalDAV] Parsed calendars:', calendars.length);
  
  return calendars;
}

// Connessione a server CalDAV/Nextcloud usando API OCS (compatibile con metodi HTTP standard)
export async function connectCalDAV(serverUrl, username, password, accountName) {
  try {
    console.log('[CalDAV] Connecting to:', serverUrl);
    
    // Normalizza URL
    let baseUrl = serverUrl.trim();
    if (!baseUrl.startsWith('http')) {
      baseUrl = 'https://' + baseUrl;
    }
    baseUrl = baseUrl.replace(/\/$/, '');
    
    console.log('[CalDAV] Base URL:', baseUrl);
    
    // Test connessione con API OCS di Nextcloud
    const statusUrl = `${baseUrl}/ocs/v2.php/cloud/capabilities?format=json`;
    const statusResponse = await makeHttpRequest(
      statusUrl,
      'GET',
      {
        'Authorization': getAuthHeader(username, password),
        'OCS-APIRequest': 'true'
      }
    );
    
    console.log('[CalDAV] Connection test:', statusResponse.status);
    
    if (statusResponse.status !== 200) {
      throw new Error(`Connessione fallita: HTTP ${statusResponse.status}`);
    }
    
    // Prova prima con l'API REST di Nextcloud
    const calendarsUrl = `${baseUrl}/index.php/apps/calendar/v1/calendars`;
    const calendarsResponse = await makeHttpRequest(
      calendarsUrl,
      'GET',
      {
        'Authorization': getAuthHeader(username, password),
        'Accept': 'application/json'
      }
    );
    
    console.log('[CalDAV] Calendars response:', calendarsResponse.status);
    
    let calendars = [];
    
    // Se l'API REST non è disponibile (404), usa CalDAV standard
    if (calendarsResponse.status === 404) {
      console.log('[CalDAV] API REST not available, falling back to CalDAV');
      calendars = await fetchCalendarsViaCalDAV(baseUrl, username, password);
    } else if (calendarsResponse.status === 200 && calendarsResponse.data) {
      const data = typeof calendarsResponse.data === 'string' 
        ? JSON.parse(calendarsResponse.data) 
        : calendarsResponse.data;
      calendars = Array.isArray(data) ? data : (data.calendars || []);
    }
    
    console.log('[CalDAV] Found calendars:', calendars.length);
    
    if (!calendars || calendars.length === 0) {
      throw new Error('Nessun calendario trovato');
    }

    // Salva credenziali in localStorage (senza encryption per debug)
    const accountId = Date.now().toString();
    
    localStorage.setItem('caldav_' + accountId + '_id', accountId);
    localStorage.setItem('caldav_' + accountId + '_name', accountName || 'Nextcloud');
    localStorage.setItem('caldav_' + accountId + '_serverUrl', baseUrl);
    localStorage.setItem('caldav_' + accountId + '_username', username);
    localStorage.setItem('caldav_' + accountId + '_password', password); // PLAINTEXT per debug
    
    // Mantieni anche in Preferences per compatibilità con lista account
    await Preferences.set({
      key: `caldav_${accountId}`,
      value: JSON.stringify({
        id: accountId,
        accountName: accountName || 'Nextcloud',
        serverUrl: baseUrl,
        username: username,
        password: password,
        encrypted: false
      })
    });

    // Salva lista account CalDAV
    const { value: accountsJson } = await Preferences.get({ key: 'caldav_accounts' });
    const accounts = accountsJson ? JSON.parse(accountsJson) : [];
    accounts.push({
      id: accountId,
      accountName: accountName || 'Nextcloud',
      serverUrl: baseUrl,
      calendarsCount: calendars.length
    });
    await Preferences.set({ key: 'caldav_accounts', value: JSON.stringify(accounts) });

    return {
      success: true,
      accountId: accountId,
      calendars: calendars.map(cal => {
        // Estrai solo l'URI finale (es: "personal") dall'URL completo se necessario
        let calendarId = cal.id || cal.uri;
        let calendarUrl = cal.url;
        
        // Se l'id è un URL completo, estraiamo solo la parte finale
        if (calendarId && calendarId.startsWith('http')) {
          const match = calendarId.match(/\/calendars\/[^\/]+\/([^\/]+)\/?$/);
          if (match) calendarId = match[1];
        }
        
        // Se l'URL non è completo, costruiscilo
        if (!calendarUrl || !calendarUrl.startsWith('http')) {
          calendarUrl = `${baseUrl}/remote.php/dav/calendars/${username}/${calendarId}/`;
        }
        
        // Assicura che l'URL termini con /
        if (!calendarUrl.endsWith('/')) {
          calendarUrl += '/';
        }
        
        return {
          id: calendarId,
          uri: calendarId,
          url: calendarUrl,
          displayName: cal.displayName || cal.displayname || 'Calendario',
          description: cal.description || '',
          color: cal.color || cal.calendarColor || '#4285f4',
        };
      })
    };
  } catch (error) {
    console.error('Errore connessione CalDAV:', error);
    return {
      success: false,
      error: error.message || 'Errore di connessione'
    };
  }
}

// Recupera tutti gli account CalDAV salvati
export async function getCalDAVAccounts() {
  try {
    const { value: accountsJson } = await Preferences.get({ key: 'caldav_accounts' });
    return accountsJson ? JSON.parse(accountsJson) : [];
  } catch (error) {
    console.error('Errore recupero account:', error);
    return [];
  }
}

// Sincronizza eventi da un account CalDAV usando REPORT method
export async function syncCalDAVEvents(accountId, calendarIds = []) {
  try {
    console.log('[CalDAV Sync] Starting sync for account:', accountId);
    
    // Recupera credenziali
    const { value: accountJson } = await Preferences.get({ key: `caldav_${accountId}` });
    if (!accountJson) {
      throw new Error('Account non trovato');
    }

    const account = JSON.parse(accountJson);
    console.log('[CalDAV Sync] Account loaded:', account.accountName);
    console.log('[CalDAV Sync] Account has calendars:', account.calendars ? account.calendars.length : 0);
    
    // Decripta password se necessario
    console.log('[CalDAV Sync] Decrypting password...');
    const password = account.encrypted ? await decryptPassword(account.password) : account.password;
    console.log('[CalDAV Sync] Password decrypted, starting sync...');
    
    const allEvents = [];
    
    // Se l'account non ha calendari, recuperali prima
    if (!account.calendars || account.calendars.length === 0) {
      console.log('[CalDAV Sync] No calendars in account, fetching...');
      const calendarsResult = await fetchCalendarsViaCalDAV(account.serverUrl, account.username, password);
      if (calendarsResult.success && calendarsResult.calendars.length > 0) {
        account.calendars = calendarsResult.calendars;
        // Salva l'account aggiornato
        await Preferences.set({
          key: `caldav_${accountId}`,
          value: JSON.stringify(account)
        });
        console.log('[CalDAV Sync] Fetched and saved calendars:', account.calendars.length);
      } else {
        throw new Error('Nessun calendario trovato');
      }
    }
    
    // Se non ci sono calendari specificati, usa tutti i calendari salvati
    const calendarsToSync = calendarIds.length > 0 
      ? account.calendars.filter(cal => calendarIds.includes(cal.id))
      : account.calendars;
    
    console.log('[CalDAV Sync] Selected calendars:', calendarsToSync.length);

    for (const calendar of calendarsToSync) {
      try {
        console.log('[CalDAV Sync] Fetching events from:', calendar.displayName);
        console.log('[CalDAV Sync] Calendar URL:', calendar.url);
        console.log('[CalDAV Sync] Preparing calendar-query REPORT...');
        
        // Usa calendar-query REPORT con solo getetag per ottenere lista eventi
        const reportBody = `<?xml version="1.0" encoding="UTF-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT" />
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`;
        
        const reportResponse = await makeHttpRequest(
          calendar.url,
          'REPORT',
          {
            'Authorization': getAuthHeader(account.username, password),
            'Content-Type': 'application/xml; charset=utf-8',
            'Depth': '1'
          },
          reportBody,
          accountId
        );
        
        console.log('[CalDAV Sync] REPORT response status:', reportResponse.status);
        
        if (reportResponse.status === 207) {
          const xmlString = typeof reportResponse.data === 'string' ? reportResponse.data : JSON.stringify(reportResponse.data);
          console.log('[CalDAV Sync] REPORT XML length:', xmlString.length);
          
          // Estrai tutti gli href dalla risposta
          const hrefRegex = /<d:href>([^<]+)<\/d:href>/gi;
          const hrefs = [...xmlString.matchAll(hrefRegex)].map(m => m[1]);
          
          console.log('[CalDAV Sync] Found event hrefs:', hrefs.length);
          
          // Step 2: GET di ogni singolo evento
          for (const href of hrefs) {
            try {
              // Salta l'href del calendario stesso
              if (href === calendar.url || href.endsWith(calendar.url.split('/').pop() + '/')) {
                continue;
              }
              
              // Costruisci URL completo se href è relativo
              const eventUrl = href.startsWith('http') ? href : `${account.serverUrl}${href}`;
              console.log('[CalDAV Sync] Fetching event:', eventUrl);
              
              const eventResponse = await makeHttpRequest(
                eventUrl,
                'GET',
                {
                  'Authorization': getAuthHeader(account.username, password)
                },
                null,
                accountId
              );
              
              if (eventResponse.status === 200) {
                const icalData = typeof eventResponse.data === 'string' ? eventResponse.data : eventResponse.data;
                const parsedEvents = parseICalendar(icalData, accountId, calendar.displayName, calendar.color);
                allEvents.push(...parsedEvents);
                console.log('[CalDAV Sync] Parsed event, total so far:', allEvents.length);
              }
            } catch (err) {
              console.error('[CalDAV Sync] Error fetching event:', href, err);
            }
          }
        }
      } catch (err) {
        console.error(`[CalDAV Sync] Error fetching calendar ${calendar.displayName}:`, err);
      }
    }
    
    console.log('[CalDAV Sync] Total events:', allEvents.length);

    return {
      success: true,
      events: allEvents,
      calendarsCount: calendarsToSync.length
    };
  } catch (error) {
    console.error('[CalDAV Sync] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Parse iCalendar data from CalDAV XML response
function parseICalendarFromXML(xmlData, accountId, calendarName, color) {
  const events = [];
  const xmlString = typeof xmlData === 'string' ? xmlData : JSON.stringify(xmlData);
  
  console.log('[CalDAV Parse] XML data type:', typeof xmlData);
  console.log('[CalDAV Parse] XML string length:', xmlString.length);
  console.log('[CalDAV Parse] XML sample:', xmlString.substring(0, 500));
  
  try {
    // Estrai i dati calendar-data da ogni response
    const calendarDataRegex = /<c:calendar-data[^>]*>([\s\S]*?)<\/c:calendar-data>/gi;
    const matches = [...xmlString.matchAll(calendarDataRegex)];
    
    console.log('[CalDAV Parse] Found calendar-data blocks:', matches.length);
    
    // Prova anche con namespace diversi
    if (matches.length === 0) {
      const altRegex = /<[^:]*:?calendar-data[^>]*>([\s\S]*?)<\/[^:]*:?calendar-data>/gi;
      const altMatches = [...xmlString.matchAll(altRegex)];
      console.log('[CalDAV Parse] Found with alternative regex:', altMatches.length);
    }
    
    for (const match of matches) {
      const icalData = match[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#13;/g, '\r')
        .replace(/&#10;/g, '\n');
      
      const parsedEvents = parseICalendar(icalData, accountId, calendarName, color);
      events.push(...parsedEvents);
    }
  } catch (error) {
    console.error('[CalDAV Parse] Error parsing XML:', error);
  }
  
  return events;
}

// Parser semplificato iCalendar
function parseICalendar(icalData, accountId, calendarName, color) {
  const events = [];
  
  try {
    // Split per VEVENT
    const vevents = icalData.split('BEGIN:VEVENT');
    
    for (let i = 1; i < vevents.length; i++) {
      const vevent = vevents[i].split('END:VEVENT')[0];
      
      const event = {
        id: extractField(vevent, 'UID') || `caldav_${Date.now()}_${i}`,
        caldavId: extractField(vevent, 'UID'),
        title: extractField(vevent, 'SUMMARY') || 'Senza titolo',
        description: extractField(vevent, 'DESCRIPTION') || '',
        location: extractField(vevent, 'LOCATION') || '',
        accountId: parseInt(accountId),
        calendarName: calendarName,
        color: color || '#4285f4',
        type: 'regular'
      };

      // Parse date
      const dtstart = extractField(vevent, 'DTSTART');
      const dtend = extractField(vevent, 'DTEND');
      
      if (dtstart) {
        const { date, time } = parseDateTimeField(dtstart);
        event.date = date;
        event.startTime = time;
      }
      
      if (dtend) {
        const { time } = parseDateTimeField(dtend);
        event.endTime = time;
      }

      if (event.date) {
        events.push(event);
        console.log('[CalDAV Parse] Event:', event.title, '| Date:', event.date, '| Time:', event.startTime, '-', event.endTime);
      } else {
        console.log('[CalDAV Parse] Event skipped (no date):', event.title);
      }
    }
  } catch (error) {
    console.error('Errore parsing iCalendar:', error);
  }
  
  console.log('[CalDAV Parse] Total events parsed:', events.length);
  return events;
}

// Estrae un campo da iCalendar
function extractField(vevent, fieldName) {
  const regex = new RegExp(`${fieldName}[^:]*:(.+)`, 'm');
  const match = vevent.match(regex);
  return match ? match[1].trim().replace(/\\n/g, '\n').replace(/\\,/g, ',') : '';
}

// Parse campo data/ora iCalendar
function parseDateTimeField(dtField) {
  // Formato: 20231124T140000Z o 20231124
  const cleanValue = dtField.split(':')[1] || dtField;
  const dateStr = cleanValue.replace(/[TZ]/g, '');
  
  let date = '';
  let time = '';
  
  if (dateStr.length >= 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    date = `${year}-${month}-${day}`;
    
    if (dateStr.length >= 14) {
      const hour = dateStr.substring(8, 10);
      const minute = dateStr.substring(10, 12);
      time = `${hour}:${minute}`;
    }
  }
  
  return { date, time };
}

// Crea evento su CalDAV
export async function createCalDAVEvent(accountId, calendarUrlOrEventUrl, event, isUpdate = false) {
  try {
    console.log('[createCalDAVEvent] START');
    
    const aid = String(accountId);
    const serverUrl = localStorage.getItem('caldav_' + aid + '_serverUrl');
    const username = localStorage.getItem('caldav_' + aid + '_username');
    const password = localStorage.getItem('caldav_' + aid + '_password');
    
    if (!serverUrl || !username || !password) {
      throw new Error('Dati account CalDAV mancanti');
    }

    const uid = Date.now() + '@calendar4jw';
    
    const startDate = event.startDate || event.date;
    const endDate = event.endDate || startDate;
    
    const dtstart = event.startTime 
      ? startDate.replace(/-/g, '') + 'T' + event.startTime.replace(/:/g, '') + '00'
      : startDate.replace(/-/g, '') + 'T000000';
    const dtend = event.endTime 
      ? endDate.replace(/-/g, '') + 'T' + event.endTime.replace(/:/g, '') + '00'
      : endDate.replace(/-/g, '') + 'T235959';

    // Skip recurring per ora
    let rrule = '';

    const nl = String.fromCharCode(13, 10);
    let icalData = 'BEGIN:VCALENDAR' + nl + 'VERSION:2.0' + nl + 'PRODID:-//Calendar4JW//Calendar4JW//EN' + nl + 'BEGIN:VEVENT' + nl + 'UID:' + uid + nl + 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' + nl + 'DTSTART:' + dtstart + nl + 'DTEND:' + dtend + nl;
    
    if (event.title) {
      icalData = icalData + 'SUMMARY:' + event.title + nl;
    }
    if (event.description) {
      icalData = icalData + 'DESCRIPTION:' + event.description + nl;
    }
    if (event.location) {
      icalData = icalData + 'LOCATION:' + event.location + nl;
    }
    
    icalData = icalData + rrule + 'END:VEVENT' + nl + 'END:VCALENDAR';

    const eventUrl = calendarUrlOrEventUrl + uid + '.ics';
    console.log('[createCalDAVEvent] Event URL:', eventUrl);
    
    const response = await makeHttpRequest(
      eventUrl,
      'PUT',
      {
        'Authorization': getAuthHeader(username, password),
        'Content-Type': 'text/calendar',
      },
      icalData,
      accountId
    );

    console.log('[createCalDAVEvent] Response status:', response.status);
    
    if (response.status < 200 || response.status >= 300) {
      console.error('[createCalDAVEvent] Errore HTTP:', response.status);
      throw new Error('HTTP ' + response.status);
    }

    console.log('[createCalDAVEvent] ✅ Evento creato con successo');
    return { success: true, uid: uid, eventUrl: eventUrl };
  } catch (error) {
    console.error('Errore creazione evento CalDAV:', error);
    return { success: false, error: error.message };
  }
}

// Elimina evento da CalDAV
export async function deleteCalDAVEvent(accountId, eventUrl) {
  try {
    const { value: accountJson } = await Preferences.get({ key: `caldav_${accountId}` });
    if (!accountJson) {
      throw new Error('Account non trovato');
    }

    const account = JSON.parse(accountJson);

    // Decripta password se necessario
    const password = account.encrypted ? await decryptPassword(account.password) : account.password;

    // DELETE per eliminare evento via proxy
    const response = await makeHttpRequest(
      eventUrl,
      'DELETE',
      {
        'Authorization': getAuthHeader(account.username, password),
      },
      null,
      accountId
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Errore eliminazione evento CalDAV:', error);
    return { success: false, error: error.message };
  }
}

// Disconnetti account CalDAV
export async function disconnectCalDAV(accountId) {
  try {
    // Rimuovi credenziali
    await Preferences.remove({ key: `caldav_${accountId}` });
    
    // Rimuovi da lista account
    const { value: accountsJson } = await Preferences.get({ key: 'caldav_accounts' });
    if (accountsJson) {
      const accounts = JSON.parse(accountsJson);
      const updated = accounts.filter(acc => acc.id !== accountId);
      await Preferences.set({ key: 'caldav_accounts', value: JSON.stringify(updated) });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Errore disconnessione CalDAV:', error);
    return { success: false, error: error.message };
  }
}
