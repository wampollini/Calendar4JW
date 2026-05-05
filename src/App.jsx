import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Trash2, Edit2, Cloud, CloudOff, RefreshCw, Menu, X, Search, Clock, Share2, Paperclip, Sun, Moon, Monitor, Download, Upload, Eye, EyeOff, HelpCircle, QrCode } from 'lucide-react';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { connectCalDAV, syncCalDAVEvents, getCalDAVAccounts, disconnectCalDAV, createCalDAVEvent, deleteCalDAVEvent } from './lib/caldavSync';
import { exportEventsToICS, downloadICS, readICSFile } from './lib/icsUtils';
import { Html5Qrcode } from 'html5-qrcode';
import { helpContent } from './helpContent';
import { updateWidgetData } from './lib/widgetSync';
import { scheduleEventNotification, cancelEventNotification, updateAllNotifications, requestNotificationPermissions } from './lib/notifications';

// Import diretto dei file JSON per garantire compatibilità Capacitor
import translationsIT from '../public/locales/it.json';
import translationsES from '../public/locales/es.json';
import translationsEN from '../public/locales/en.json';

const availableTranslations = {
  it: translationsIT,
  es: translationsES,
  en: translationsEN
};

const GOOGLE_WEB_CLIENT_ID = '278165724364-f67mcfiuh61qgmjn4qkoiq79q95c7phs.apps.googleusercontent.com';
const GOOGLE_DISCONNECT_SNAPSHOTS_KEY = 'calendar4jw_google_disconnect_snapshots';

// Fallback translations in caso di errore
const fallbackTranslations = {
  title: 'Calendar4jw', today: 'Oggi', newEvent: 'Nuovo', accounts: 'Account',
  save: 'Salva', cancel: 'Annulla', delete: 'Elimina', edit: 'Modifica',
  noEvents: 'Nessun evento', localAccount: 'Locale'
};

const CalendarApp = () => {
  const [translations, setTranslations] = useState(availableTranslations.it);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showDayView, setShowDayView] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
  const isFirstRender = useRef(true);
  const [googleUserId, setGoogleUserId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [showCaldavModal, setShowCaldavModal] = useState(false);
  const [caldavAccounts, setCaldavAccounts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [serviceHours, setServiceHours] = useState({});
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceDate, setSelectedServiceDate] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const qrReaderRef = useRef(null);
  const messageTimeoutRef = useRef(null);
  
  const [caldavForm, setCaldavForm] = useState({
    serverUrl: '', username: '', password: '', accountName: ''
  });
  
  const [caldavCalendars, setCaldavCalendars] = useState([]);
  const [selectedCaldavCalendars, setSelectedCaldavCalendars] = useState([]);
  const [caldavConnecting, setCaldavConnecting] = useState(false);
  const [caldavStep, setCaldavStep] = useState('form'); // 'form' o 'selectCalendars'
  
  const [settings, setSettings] = useState({
    theme: 'dark',
    defaultView: 'month',
    notifications: true,
    defaultCalendar: 1,
    defaultNotificationTime: 15,
    weekStartsOn: 1,  // 0 = domenica, 1 = lunedì
    language: 'it'
  });
  
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', endDate: '', startTime: '', endTime: '', location: '', description: '', 
    accountId: 1, eventType: 'regular', attachments: [], notifyBefore: 15, 
    recurring: 'none', recurringEndDate: '', recurringInterval: 1, allDay: false
  });

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Locale', color: '#64748b', active: true }
  ]);

  const eventTypeTemplates = {
    regular: { title: '' },
    appointment: { title: '' },
    circuitAssembly: { title: 'Assemblea di Circoscrizione' },
    regionalConvention: { title: 'Congresso Regionale' },
    memorial: { title: 'Commemorazione' },
    specialTalk: { title: 'Discorso Speciale' },
    coVisit: { title: 'Visita Sorvegliante' }
  };

  const tr = translations;

  const showTransientMessage = (message, duration = 2000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setSyncMessage(message);
    messageTimeoutRef.current = setTimeout(() => {
      setSyncMessage('');
      messageTimeoutRef.current = null;
    }, duration);
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Converti ore:minuti in numero decimale
  const hoursToDecimal = (hoursStr) => {
    if (!hoursStr || hoursStr === '0:00') return 0;
    const parts = hoursStr.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    return hours + (minutes / 60);
  };

  // Converti numero decimale in ore:minuti
  const decimalToHours = (decimal) => {
    if (!decimal || decimal === 0) return '0:00';
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours}:${String(minutes).padStart(2, '0')}`;
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    const filtered = events.filter(e => {
      const hasAccount = accounts.find(a => a.id === e.accountId)?.active;
      if (!hasAccount) {
        return false;
      }
      
      // Eventi singoli o primo giorno di multi-giorno
      if (e.date === dateStr) {
        return true;
      }
      
      // Eventi multi-giorno: verifica se la data è tra start e end
      if (e.endDate && e.date < dateStr && dateStr <= e.endDate) {
        return true;
      }
      
      return false;
    });
    return filtered;
  };

  const getFilteredEvents = () => {
    if (!searchQuery) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e => 
      e.title?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
    );
  };

  const getMonthServiceTotal = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    let totalHours = 0;
    let totalVisits = 0;
    
    Object.keys(serviceHours).forEach(dateKey => {
      if (dateKey.startsWith(key)) {
        const hours = serviceHours[dateKey].hours;
        totalHours += typeof hours === 'string' ? hoursToDecimal(hours) : (hours || 0);
        totalVisits += serviceHours[dateKey].visits || 0;
      }
    });
    
    return { hours: decimalToHours(totalHours), visits: totalVisits };
  };

  const readGoogleDisconnectSnapshots = () => {
    try {
      const raw = localStorage.getItem(GOOGLE_DISCONNECT_SNAPSHOTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.error('[Google] Error reading disconnect snapshots:', error);
      return {};
    }
  };

  const writeGoogleDisconnectSnapshots = (snapshots) => {
    try {
      localStorage.setItem(GOOGLE_DISCONNECT_SNAPSHOTS_KEY, JSON.stringify(snapshots));
    } catch (error) {
      console.error('[Google] Error writing disconnect snapshots:', error);
    }
  };

  const saveGoogleDisconnectSnapshot = (account, accountEvents) => {
    if (!account) return;
    const snapshots = readGoogleDisconnectSnapshots();
    snapshots[String(account.id)] = {
      account,
      accountEvents,
      defaultCalendar: settings.defaultCalendar,
      googleUserId,
      savedAt: new Date().toISOString()
    };
    writeGoogleDisconnectSnapshots(snapshots);
  };

  const consumeGoogleDisconnectSnapshot = (accountId) => {
    const snapshots = readGoogleDisconnectSnapshots();
    const key = String(accountId);
    const snapshot = snapshots[key];
    if (snapshot) {
      delete snapshots[key];
      writeGoogleDisconnectSnapshots(snapshots);
      return snapshot;
    }
    return null;
  };

  const loadGoogleIdentityScript = () => new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window non disponibile'));
      return;
    }

    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existing = document.getElementById('google-identity-services');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Impossibile caricare Google Identity Services')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-services';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Impossibile caricare Google Identity Services'));
    document.head.appendChild(script);
  });

  const signInGoogleWeb = async ({ prompt = 'select_account' } = {}) => {
    await loadGoogleIdentityScript();

    const tokenResponse = await new Promise((resolve, reject) => {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_WEB_CLIENT_ID,
        scope: 'openid email profile https://www.googleapis.com/auth/calendar',
        prompt: 'consent',
        callback: (resp) => {
          if (resp?.error) {
            reject(new Error(`GIS_${resp.error}`));
            return;
          }
          if (!resp?.access_token) {
            reject(new Error('GIS_no_access_token'));
            return;
          }
          resolve(resp);
        }
      });

      tokenClient.requestAccessToken({ prompt });
    });

    const accessToken = tokenResponse.access_token;
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userInfoRes.ok) {
      throw new Error(`GIS_userinfo_http_${userInfoRes.status}`);
    }

    const userInfo = await userInfoRes.json();
    if (!userInfo?.email) {
      throw new Error('GIS_no_email');
    }

    return { accessToken, userEmail: userInfo.email };
  };

  const classifyGoogleAuthError = (error) => {
    const rawMessage = (error && (error.message || JSON.stringify(error))) || '';
    const lower = rawMessage.toLowerCase();

    const isPopupClosed =
      lower.includes('popup_closed_by_user') ||
      lower.includes('popup_closed') ||
      lower.includes('12501') ||
      lower.includes('cancelled') ||
      lower.includes('canceled') ||
      lower.includes('access_denied');

    const isDeveloperError =
      lower.includes('developer_error') ||
      lower.includes('status code: 10') ||
      lower.includes('code: 10') ||
      lower.includes('invalid_client') ||
      lower.includes('redirect_uri_mismatch') ||
      lower.includes('origin_mismatch');

    const isSessionExpired =
      lower.includes('invalid_grant') ||
      lower.includes('invalid_token') ||
      lower.includes('token has been expired or revoked') ||
      lower.includes('refresh token fallito') ||
      lower.includes('sessione google scaduta') ||
      lower.includes('unauthorized') ||
      lower.includes('http 401');

    if (isDeveloperError) {
      return { kind: 'developer_error', rawMessage };
    }
    if (isPopupClosed) {
      return { kind: 'popup_closed', rawMessage };
    }
    if (isSessionExpired) {
      return { kind: 'session_expired', rawMessage };
    }

    return { kind: 'unknown', rawMessage };
  };

  const getGoogleAuthErrorMessage = (classification, { isWeb } = {}) => {
    const lang = settings.language || 'it';

    if (classification.kind === 'developer_error') {
      if (lang === 'es') {
        return 'Configuracion OAuth de Google no valida (DEVELOPER_ERROR). Verifica package name com.jw.calendar y huellas SHA-1/SHA-256 de la clave de firma en el cliente OAuth Android de Google Cloud/Firebase.';
      }
      if (lang === 'en') {
        return 'Invalid Google OAuth Android configuration (DEVELOPER_ERROR). Verify package name com.jw.calendar and SHA-1/SHA-256 fingerprints for your signing key in the Google Cloud/Firebase Android OAuth client.';
      }
      return 'Configurazione Google OAuth Android non valida (DEVELOPER_ERROR). Verifica package name com.jw.calendar e SHA-1/SHA-256 della chiave con cui firmi l\'APK nel client OAuth Android in Google Cloud/Firebase.';
    }

    if (classification.kind === 'popup_closed') {
      if (isWeb) {
        if (lang === 'es') {
          return `Acceso Google interrumpido en el navegador. Origen actual: ${window.location.origin}. Si no cerraste el popup manualmente, revisa bloqueador de popups, cookies de terceros y Authorized JavaScript origins del cliente OAuth Web.`;
        }
        if (lang === 'en') {
          return `Google sign-in interrupted in browser. Current origin: ${window.location.origin}. If you did not close the popup manually, check popup blocking, third-party cookies, and Authorized JavaScript origins for the OAuth Web client.`;
        }
        return `Accesso Google interrotto nel browser. Origine corrente: ${window.location.origin}. Se non hai chiuso il popup manualmente, controlla popup bloccati, cookie di terze parti e Authorized JavaScript origins del client OAuth Web.`;
      }

      if (lang === 'es') {
        return 'Acceso Google cancelado. Si no cerraste el popup manualmente, verifica SHA-1/SHA-256 y package name del cliente OAuth Android.';
      }
      if (lang === 'en') {
        return 'Google sign-in cancelled. If you did not close the popup manually, verify SHA-1/SHA-256 and package name for the Android OAuth client.';
      }
      return 'Accesso Google annullato. Se non hai chiuso il popup manualmente, controlla SHA-1/SHA-256 e package name del client OAuth Android.';
    }

    if (classification.kind === 'session_expired') {
      if (lang === 'es') {
        return 'Sesion de Google caducada o revocada. Vuelve a iniciar sesion desde Configuracion > Cuenta Google.';
      }
      if (lang === 'en') {
        return 'Google session expired or revoked. Please sign in again from Settings > Google account.';
      }
      return 'Sessione Google scaduta o revocata. Effettua nuovamente il login da Impostazioni > Account Google.';
    }

    return classification.rawMessage || 'Errore Google OAuth sconosciuto.';
  };

  const logGoogleAuthDiagnostics = (context, classification) => {
    console.error('[Google][Diag]', {
      context,
      kind: classification.kind,
      message: classification.rawMessage,
      platform: Capacitor.getPlatform(),
      timestamp: new Date().toISOString()
    });
  };

  const syncGoogle = async () => {
    setSyncing(true);
    try {
      let reconnectReason = null;
      const isWebPlatform = Capacitor.getPlatform() === 'web';
      // Controlla se c'è già un account Google connesso con token salvato
      const savedAccounts = localStorage.getItem('calendar4jw_accounts');
      const allAccounts = savedAccounts ? JSON.parse(savedAccounts) : accounts;
      const existingGoogleAccount = allAccounts.find(a => a.name.startsWith('Google') && a.connected);
      
      let accessToken = null;
      let userEmail = null;
      let googleAccountId = null;
      
      if (existingGoogleAccount) {
        // Prova a usare il token esistente
        const savedToken = localStorage.getItem(`calendar4jw_google_token_${existingGoogleAccount.id}`);
        const savedEmail = localStorage.getItem(`calendar4jw_google_user_${existingGoogleAccount.id}`);
        const tokenExpiry = localStorage.getItem(`calendar4jw_google_token_expiry_${existingGoogleAccount.id}`);
        
        // Verifica se il token è ancora valido (scade dopo 55 minuti per sicurezza)
        const isTokenValid = tokenExpiry && (Date.now() < parseInt(tokenExpiry));
        
        if (savedToken && savedEmail && isTokenValid) {
          console.log('[Google] Using existing token for:', savedEmail, '- expires in', Math.round((parseInt(tokenExpiry) - Date.now()) / 60000), 'minutes');
          accessToken = savedToken;
          userEmail = savedEmail;
        } else if (savedToken && savedEmail && !isTokenValid) {
          reconnectReason = settings.language === 'it'
            ? 'Sessione Google scaduta: è richiesta una riconnessione.'
            : settings.language === 'es'
              ? 'La sesion de Google ha expirado: se requiere reconexion.'
              : 'Google session expired: reconnection is required.';
          console.log('[Google] Token expired, attempting silent refresh...');
          console.log('[Google] Token expiry was:', new Date(parseInt(tokenExpiry)).toISOString());
          console.log('[Google] Current time:', new Date().toISOString());
          try {
            if (isWebPlatform) {
              const webAuth = await signInGoogleWeb({ prompt: '' });
              accessToken = webAuth.accessToken;
              userEmail = webAuth.userEmail || savedEmail;
              const expiry = Date.now() + (55 * 60 * 1000);
              localStorage.setItem(`calendar4jw_google_token_${existingGoogleAccount.id}`, accessToken);
              localStorage.setItem(`calendar4jw_google_user_${existingGoogleAccount.id}`, userEmail);
              localStorage.setItem(`calendar4jw_google_token_expiry_${existingGoogleAccount.id}`, expiry.toString());
              console.log('[Google][Web] Token refreshed silently - new expiry:', new Date(expiry).toISOString());
            } else {
              // Prova refresh silenzioso
              console.log('[Google] Calling GoogleAuth.refresh()...');
              const user = await GoogleAuth.refresh();
              console.log('[Google] Refresh result:', user);
              
              if (user && user.authentication && user.authentication.accessToken) {
                accessToken = user.authentication.accessToken;
                userEmail = savedEmail;
                // Salva nuovo token con scadenza (55 minuti)
                const expiry = Date.now() + (55 * 60 * 1000);
                localStorage.setItem(`calendar4jw_google_token_${existingGoogleAccount.id}`, accessToken);
                localStorage.setItem(`calendar4jw_google_token_expiry_${existingGoogleAccount.id}`, expiry.toString());
                console.log('[Google] Token refreshed silently - new expiry:', new Date(expiry).toISOString());
              } else {
                console.warn('[Google] Refresh returned invalid user object');
              }
            }
          } catch (refreshErr) {
            console.error('[Google] Silent refresh failed:', refreshErr);
            console.error('[Google] Error details:', refreshErr.message, refreshErr.stack);
          }
        }
      }
      
      // Se non c'è un token salvato o refresh fallito, fai il login
      if (!accessToken) {
        if (!reconnectReason && existingGoogleAccount) {
          reconnectReason = settings.language === 'it'
            ? 'Token Google non disponibile: è richiesta una riconnessione.'
            : settings.language === 'es'
              ? 'Token de Google no disponible: se requiere reconexion.'
              : 'Google token unavailable: reconnection is required.';
        }
        console.log('[Google] Starting sign in...');
        console.log('[Google] Requesting scopes: profile, email, calendar');
        if (isWebPlatform) {
          console.log('[Google][Web] Current origin:', window.location.origin);
          console.log('[Google][Web] OAuth client ID:', GOOGLE_WEB_CLIENT_ID);
          const webAuth = await signInGoogleWeb({ prompt: 'select_account' });
          accessToken = webAuth.accessToken;
          userEmail = webAuth.userEmail;
          console.log('[Google][Web] Signed in as:', userEmail);
        } else {
          // Richiedi esplicitamente lo scope del calendar
          const user = await GoogleAuth.signIn();
          console.log('[Google] Sign in result:', user);
          
          // Verifica che lo scope calendar sia presente nel token
          if (user && user.authentication && user.authentication.accessToken) {
            console.log('[Google] Access token received, length:', user.authentication.accessToken.length);
            // Log per debug: verifica scope (se disponibile)
            if (user.authentication.scope) {
              console.log('[Google] Token scopes:', user.authentication.scope);
            }
          }
          
          if (!user || !user.authentication || !user.authentication.accessToken) {
            console.error('[Google] No access token received');
            throw new Error('Autenticazione fallita');
          }
          
          accessToken = user.authentication.accessToken;
          userEmail = user.email;
          console.log('[Google] Signed in as:', userEmail);
        }
      }
      
      // Calcola ID account Google (ID 1 è riservato per "Locale", Google parte da 2)
      const existingAccount = allAccounts.find(a => a.email === userEmail && a.name.startsWith('Google'));
      googleAccountId = existingAccount?.id || Math.max(1, ...allAccounts.map(a => a.id)) + 1;

      // Salva sempre token, email e scadenza per riuso nelle sync successive
      const loginExpiry = Date.now() + (55 * 60 * 1000);
      localStorage.setItem(`calendar4jw_google_token_${googleAccountId}`, accessToken);
      localStorage.setItem(`calendar4jw_google_user_${googleAccountId}`, userEmail);
      localStorage.setItem(`calendar4jw_google_token_expiry_${googleAccountId}`, loginExpiry.toString());
      console.log('[Google] Token saved with ID', googleAccountId);
      
      // Fetch eventi da Google Calendar (ultimi 6 mesi e prossimi 12 mesi)
      const timeMin = new Date();
      timeMin.setMonth(timeMin.getMonth() - 6);
      const timeMax = new Date();
      timeMax.setMonth(timeMax.getMonth() + 12);
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`;
      
      console.log('[Google] Fetching events with token...');
      console.log('[Google] API URL:', url);
      console.log('[Google] Token (first 20 chars):', accessToken.substring(0, 20) + '...');
      
      let res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Se il token è scaduto (401), prova a fare refresh automatico
      if (res.status === 401) {
        console.warn('[Google] Token scaduto durante sync, tento refresh...');
        try {
          if (isWebPlatform) {
            try {
              const webAuth = await signInGoogleWeb({ prompt: '' });
              accessToken = webAuth.accessToken;
              userEmail = webAuth.userEmail || userEmail;
            } catch (silentErr) {
              console.warn('[Google][Web] Silent refresh failed, requesting interactive login...');
              const webAuth = await signInGoogleWeb({ prompt: 'select_account' });
              accessToken = webAuth.accessToken;
              userEmail = webAuth.userEmail || userEmail;
            }
          } else {
            // Prima prova refresh silenzioso
            let user = await GoogleAuth.refresh();
            
            // Se refresh silenzioso fallisce, prova signIn
            if (!user || !user.authentication || !user.authentication.accessToken) {
              console.log('[Google] Refresh silenzioso fallito, richiedo login...');
              user = await GoogleAuth.signIn();
            }
            
            if (user && user.authentication && user.authentication.accessToken) {
              accessToken = user.authentication.accessToken;
              userEmail = user.email || userEmail; // Mantieni email esistente se non fornita
            } else {
              throw new Error('Refresh token fallito');
            }
          }
            
            // Salva token aggiornato con nuova scadenza
            const expiry = Date.now() + (55 * 60 * 1000);
            localStorage.setItem(`calendar4jw_google_token_${googleAccountId}`, accessToken);
            localStorage.setItem(`calendar4jw_google_user_${googleAccountId}`, userEmail);
            localStorage.setItem(`calendar4jw_google_token_expiry_${googleAccountId}`, expiry.toString());
            console.log('[Google] Token refreshed successfully');
            
            // Riprova la richiesta con il nuovo token
            res = await fetch(url, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
        } catch (refreshErr) {
          console.error('[Google] Refresh fallito:', refreshErr);
          // Rimuovi token invalido e disconnetti account
          if (existingGoogleAccount && !isWebPlatform) {
            localStorage.removeItem(`calendar4jw_google_token_${existingGoogleAccount.id}`);
            setAccounts(prev => prev.map(acc =>
              acc.id === existingGoogleAccount.id ? { ...acc, connected: false } : acc
            ));
          }
          throw new Error('Sessione Google scaduta. Effettua nuovamente il login dal menu Impostazioni.');
        }
      }
      
      if (!res.ok) {
        const errorBody = await res.text();
        console.error('[Google] API Error Response:', errorBody);
        console.error('[Google] Status:', res.status, res.statusText);
        
        // Gestisci 403 con messaggio chiaro
        if (res.status === 403) {
          try {
            const errorData = JSON.parse(errorBody);
            const errorMsg = errorData.error?.message || errorBody;
            console.error('[Google] 403 Details:', errorData);
            
            if (errorMsg.includes('Calendar API has not been used') || errorMsg.includes('API not enabled')) {
              throw new Error('API Google Calendar non abilitata nel progetto. Vai su Google Cloud Console > APIs & Services > Library > cerca "Google Calendar API" > Abilita.');
            } else if (errorMsg.includes('Access Not Configured') || errorMsg.includes('accessNotConfigured')) {
              throw new Error('Accesso non configurato. Abilita Google Calendar API nella Cloud Console.');
            } else if (errorMsg.includes('Forbidden') || errorMsg.includes('insufficient permissions')) {
              throw new Error('Permessi insufficienti. Verifica di essere nella lista Test Users dell\'OAuth consent screen.');
            } else {
              throw new Error(`Accesso negato (403): ${errorMsg}`);
            }
          } catch (parseErr) {
            throw new Error(`HTTP 403: ${errorBody || 'Accesso negato. Verifica test users e API abilitata.'}`);
          }
        }
        
        throw new Error(`HTTP ${res.status}: ${errorBody || res.statusText}`);
      }
      const data = await res.json();
      
      if (data.items) {
        const isNewGoogleAccount = !existingAccount;
        const googleEvents = data.items
          .filter(item => item.start && (item.start.date || item.start.dateTime))
          .map(item => {
            const startDate = item.start.date || item.start.dateTime?.split('T')[0];
            const startTime = item.start.dateTime ? new Date(item.start.dateTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
            const endTime = item.end?.dateTime ? new Date(item.end.dateTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
            
            return {
              id: item.id,
              googleId: item.id,
              title: item.summary || 'Senza titolo',
              date: startDate,
              startTime: startTime,
              endTime: endTime,
              location: item.location || '',
              description: item.description || '',
              type: 'regular',
              accountId: googleAccountId,
              color: '#4285f4'
            };
          });
        
        // Rimuovi eventi esistenti di questo account Google
        const localEvents = events.filter(e => e.accountId !== googleAccountId);
        setEvents([...localEvents, ...googleEvents]);
        
        // Aggiungi o aggiorna account Google
        if (!existingGoogleAccount) {
          setAccounts(prev => [...prev, {
            id: googleAccountId,
            name: `Google (${userEmail})`,
            email: userEmail,
            color: '#4285f4',
            active: true,
            connected: true
          }]);
        } else {
          // Aggiorna account esistente per assicurarsi che sia connesso
          setAccounts(prev => prev.map(a => 
            a.id === existingGoogleAccount.id 
              ? { ...a, connected: true, active: true }
              : a
          ));

          // Se l'account era stato disconnesso manualmente, ripristina lo stato precedente.
          const snapshot = consumeGoogleDisconnectSnapshot(existingGoogleAccount.id);
          if (snapshot) {
            setAccounts(prev => prev.map(a =>
              a.id === existingGoogleAccount.id
                ? {
                    ...a,
                    color: snapshot.account?.color || a.color,
                    active: snapshot.account?.active ?? true,
                    connected: true
                  }
                : a
            ));

            if (Array.isArray(snapshot.accountEvents) && snapshot.accountEvents.length > 0) {
              setEvents(prev => {
                const currentIds = new Set(prev.map(e => e.id));
                const missingFromSnapshot = snapshot.accountEvents.filter(e => !currentIds.has(e.id));
                return [...prev, ...missingFromSnapshot];
              });
            }

            if (snapshot.defaultCalendar === existingGoogleAccount.id) {
              setSettings(prev => ({ ...prev, defaultCalendar: existingGoogleAccount.id }));
            }
          }
        }
        
        localStorage.setItem(`calendar4jw_google_token_${googleAccountId}`, accessToken);
        localStorage.setItem(`calendar4jw_google_user_${googleAccountId}`, userEmail);
        localStorage.setItem(`calendar4jw_google_token_expiry_${googleAccountId}`, (Date.now() + (55 * 60 * 1000)).toString());
        setGoogleUserId(userEmail); // Imposta lo stato per mostrare i pulsanti

        if (reconnectReason) {
          const restoredMsg = settings.language === 'it'
            ? `${reconnectReason} Stato precedente ripristinato.`
            : settings.language === 'es'
              ? `${reconnectReason} Estado anterior restaurado.`
              : `${reconnectReason} Previous state restored.`;
          showTransientMessage(`ℹ️ ${restoredMsg}`, 4500);
        }

        // Chiedi all'utente se vuole usare il nuovo account Google come calendario predefinito
        if (isNewGoogleAccount && settings.defaultCalendar !== googleAccountId) {
          const setAsDefaultMsg =
            settings.language === 'it'
              ? `Vuoi impostare Google (${userEmail}) come calendario predefinito?`
              : settings.language === 'es'
                ? `¿Quieres configurar Google (${userEmail}) como calendario predeterminado?`
                : `Do you want to set Google (${userEmail}) as the default calendar?`;

          if (window.confirm(setAsDefaultMsg)) {
            setSettings(prev => ({ ...prev, defaultCalendar: googleAccountId }));
            showTransientMessage(
              settings.language === 'it'
                ? '✅ Calendario predefinito aggiornato'
                : settings.language === 'es'
                  ? '✅ Calendario predeterminado actualizado'
                  : '✅ Default calendar updated'
            );
          }
        }
        
        // Mantieni il calendario predefinito corrente (non cambiare automaticamente)
        // L'utente può cambiarlo manualmente dalle impostazioni se vuole
        
        alert(`✅ ${googleEvents.length} ${tr.syncSuccess} ${userEmail}!`);
      }
    } catch (err) {
      console.error('[Google] Error during sync:', err);
      console.error('[Google] Error stack:', err.stack);
      const classification = classifyGoogleAuthError(err);
      logGoogleAuthDiagnostics('syncGoogle', classification);

      if (classification.kind === 'unknown') {
        alert(`❌ ${tr.syncError} ${classification.rawMessage}`);
      } else {
        alert(`⚠️ ${getGoogleAuthErrorMessage(classification, { isWeb: Capacitor.getPlatform() === 'web' })}`);
      }
    } finally {
      setSyncing(false);
    }
  };

  const connectGoogle = async () => {
    await syncGoogle();
  };

  const disconnectGoogle = async (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    
    if (!window.confirm(tr.confirmDisconnect.replace('{name}', account.name))) return;

    // Salva uno snapshot completo per poter ripristinare lo stato dopo la riconnessione.
    const accountEvents = events.filter(e => e.accountId === accountId);
    saveGoogleDisconnectSnapshot(account, accountEvents);
    
    // Rimuovi token ed eventi per questo account specifico
    localStorage.removeItem(`calendar4jw_google_token_${accountId}`);
    localStorage.removeItem(`calendar4jw_google_user_${accountId}`);
    localStorage.removeItem(`calendar4jw_google_token_expiry_${accountId}`);
    setEvents(prev => prev.filter(e => e.accountId !== accountId));
    
    // Mantieni l'account visibile ma segnalo come disconnesso,
    // cosi l'utente puo riconnetterlo subito dal pulsante Sync.
    setAccounts(prev => prev.map(a =>
      a.id === accountId
        ? { ...a, connected: false, active: false }
        : a
    ));
    
    // Aggiorna googleUserId solo se non ci sono piu account Google connessi
    const remainingConnectedGoogleAccounts = accounts.filter(
      a => a.name.startsWith('Google') && a.id !== accountId && a.connected
    );
    if (remainingConnectedGoogleAccounts.length === 0) {
      setGoogleUserId(null);
      localStorage.removeItem('calendar4jw_google_user');
    }
    
    alert(`✅ ${account.name} ${tr.disconnectSuccess}`);
  };

  const addGoogleAccount = async () => {
    await syncGoogle();
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { value } = await Preferences.get({ key: 'calendar4jw_settings' });
        if (value) {
          const loaded = JSON.parse(value);
          // Se defaultCalendar è 2 o 3 (Microsoft rimosso), resetta a 1 (Google)
          if (loaded.defaultCalendar === 2 || loaded.defaultCalendar === 3) {
            loaded.defaultCalendar = 1;
          }
          // Assicura che language esista sempre
          if (!loaded.language || !availableTranslations[loaded.language]) {
            loaded.language = 'it';
          }
          setSettings(loaded);
          setViewMode(loaded.defaultView || 'month');
          console.log(`[App] Loaded settings with language: ${loaded.language}`);
        }
      } catch (error) {
        console.error('[App] Error loading settings:', error);
      }
      // Dopo il primo caricamento, permetti il salvataggio
      isFirstRender.current = false;
    };
    loadSettings();
    
    const savedHours = localStorage.getItem('calendar4jw_service_hours');
    if (savedHours) setServiceHours(JSON.parse(savedHours));
    
    // Carica accounts salvati (Google + CalDAV)
    const savedAccounts = localStorage.getItem('calendar4jw_accounts');
    if (savedAccounts) {
      try {
        const loadedAccounts = JSON.parse(savedAccounts);
        // Filtra eventuali account Google generici senza email
        const validAccounts = loadedAccounts.filter(acc => {
          if (acc.type === 'google' && !acc.email) return false;
          return true;
        });
        // Assicura che l'account Locale (id: 1) sia sempre presente
        const hasLocale = validAccounts.some(a => a.id === 1);
        if (!hasLocale) {
          validAccounts.unshift({ id: 1, name: 'Locale', color: '#64748b', active: true });
        }
        setAccounts(validAccounts);
      } catch (e) {
        console.error('[App] Error loading accounts:', e);
        // In caso di errore, mantieni almeno l'account Locale
        setAccounts([{ id: 1, name: 'Locale', color: '#64748b', active: true }]);
      }
    }
    // Se non ci sono accounts salvati, mantieni l'account Locale dallo stato iniziale
    // (non fare setAccounts([]) che cancellerebbe l'account Locale)
    
    const savedEvents = localStorage.getItem('calendar4jw_events');
    if (savedEvents) {
      try {
        const loadedEvents = JSON.parse(savedEvents);
        // Assicura che tutti gli eventi Google abbiano accountId: 1
        const fixedEvents = loadedEvents.map(evt => {
          if (evt.googleId && !evt.accountId) {
            return { ...evt, accountId: 1 };
          }
          return evt;
        });
        setEvents(fixedEvents);
        console.log('[App] Loaded events from localStorage:', fixedEvents.length);
      } catch (e) {
        console.error('[App] Error loading events:', e);
      }
    }
    
    const savedCaldav = localStorage.getItem('calendar4jw_caldav');
    if (savedCaldav) setCaldavAccounts(JSON.parse(savedCaldav));
    
    // Carica account CalDAV da Preferences
    getCalDAVAccounts().then(caldavAccs => {
      if (caldavAccs.length > 0) {
        setCaldavAccounts(caldavAccs);
        
        // Aggiungi gli account CalDAV all'array accounts per renderli visibili
        setAccounts(prev => {
          // Mantieni tutti gli account Google esistenti e aggiungi CalDAV
          const existingGoogle = prev.filter(a => a.name?.startsWith('Google'));
          const caldavAsAccounts = caldavAccs.map(ca => ({
            id: parseInt(ca.id),
            name: ca.accountName || 'CalDAV',
            color: '#34a853',
            active: true
          }));
          const mergedAccounts = [...existingGoogle, ...caldavAsAccounts];
          console.log('[App] Accounts finali:', mergedAccounts.map(a => ({ id: a.id, name: a.name })));
          return mergedAccounts;
        });
        
        // Sincronizzazione automatica ogni 30 minuti
        const syncInterval = setInterval(async () => {
          console.log('[App] Auto-sync CalDAV events...');
          for (const account of caldavAccs) {
            try {
              await syncCaldavEvents(account.id);
            } catch (err) {
              console.error('[App] Auto-sync error for account', account.id, err);
            }
          }
        }, 30 * 60 * 1000); // 30 minuti
        
        // Cleanup interval on unmount
        return () => clearInterval(syncInterval);
      }
    });
    
    // Inizializza GoogleAuth
    const isWebPlatform = Capacitor.getPlatform() === 'web';
    GoogleAuth.initialize({
      clientId: '278165724364-f67mcfiuh61qgmjn4qkoiq79q95c7phs.apps.googleusercontent.com',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
      // Sul web l'offline access aumenta i casi di popup failure se il client non e configurato ad hoc.
      grantOfflineAccess: !isWebPlatform
    });
    
    const savedUser = localStorage.getItem('calendar4jw_google_user');
    if (savedUser) setGoogleUserId(savedUser);
    
    // Richiedi permessi notifiche all'avvio
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('calendar4jw_events', JSON.stringify(events));
      
      // Aggiorna widget Android se presenti
      updateWidgetData(events).catch(() => {});
      
      // Aggiorna notifiche per tutti gli eventi
      updateAllNotifications(events, settings.defaultNotificationTime || 15).catch(() => {});
    }
  }, [events, settings.defaultNotificationTime]);

  useEffect(() => {
    // NON salvare al primo render (quando ha ancora i default)
    if (isFirstRender.current) {
      console.log('[App] Skipping save on first render');
      return;
    }
    
    const saveSettings = async () => {
      try {
        await Preferences.set({
          key: 'calendar4jw_settings',
          value: JSON.stringify(settings)
        });
        console.log('[App] Settings saved:', settings.language);
      } catch (error) {
        console.error('[App] Error saving settings:', error);
      }
    };
    saveSettings();
  }, [settings]);

  useEffect(() => {
    if (settings.language && availableTranslations[settings.language]) {
      setTranslations(availableTranslations[settings.language]);
      console.log(`[App] Changed language to: ${settings.language}`);
    }
  }, [settings.language]);

  useEffect(() => {
    localStorage.setItem('calendar4jw_service_hours', JSON.stringify(serviceHours));
  }, [serviceHours]);

  useEffect(() => {
    if (accounts.length > 0) {
      console.log('[App] Saving accounts to localStorage:', accounts.length);
      localStorage.setItem('calendar4jw_accounts', JSON.stringify(accounts));
    }
  }, [accounts]);

  // Helper function per rilevare e renderizzare HTML
  const isHTML = (str) => {
    if (!str) return false;
    return /<\/?[a-z][\s\S]*>/i.test(str);
  };

  const renderDescription = (description) => {
    if (!description) return null;
    if (isHTML(description)) {
      return <div dangerouslySetInnerHTML={{ __html: description }} />;
    }
    return <div className="whitespace-pre-wrap">{description}</div>;
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      if (viewMode === 'week') {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
      } else {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
      }
    }
    if (distance < -minSwipeDistance) {
      if (viewMode === 'week') {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
      } else {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
      }
    }
  };

  const renderMonth = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const firstDayOfMonth = new Date(y, m, 1).getDay();
    // Calcola offset in base a weekStartsOn
    const offset = (firstDayOfMonth - settings.weekStartsOn + 7) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days = [];

    // Celle vuote prima del primo giorno
    for (let i = 0; i < offset; i++) {
      days.push(<div key={`e${i}`} className={`h-28 border ${settings.theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-gray-700 bg-gray-900'}`}></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const dateKey = formatDate(date);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isLastDay = d === daysInMonth;
      const monthTotal = isLastDay ? getMonthServiceTotal() : null;
      const dayService = serviceHours[dateKey] || { hours: '0:00', visits: 0 };
      const hasServiceHours = (typeof dayService.hours === 'string' ? hoursToDecimal(dayService.hours) : dayService.hours) > 0 || dayService.visits > 0;
      
      days.push(
        <div key={d} onClick={() => { setSelectedDate(date); setShowDayView(true); }}
          className={`h-28 border p-1 cursor-pointer relative ${
            settings.theme === 'light' 
              ? `border-gray-300 ${isToday ? 'bg-blue-100' : 'bg-white'}` 
              : `border-gray-700 ${isToday ? 'bg-blue-900' : 'bg-gray-800'}`
          }`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm font-bold ${isToday ? 'text-blue-500' : settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{d}</div>
            {hasServiceHours && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title={`${typeof dayService.hours === 'string' ? dayService.hours : decimalToHours(dayService.hours || 0)}, ${dayService.visits} ${tr.visits}`}></div>
            )}
          </div>
          {dayEvents.slice(0, 3).map(e => (
            <div key={e.id} className="text-[9px] px-1 rounded truncate mt-0.5"
              style={{ backgroundColor: accounts.find(a => a.id === e.accountId)?.color, color: 'white' }}>
              {e.title}
            </div>
          ))}
          {isLastDay && monthTotal && (
            (typeof monthTotal.hours === 'string' ? hoursToDecimal(monthTotal.hours) : monthTotal.hours) > 0 || 
            monthTotal.visits > 0
          ) && (
            <div className="text-[10px] mt-1 p-1 bg-green-600 text-white rounded font-bold">
              📊 {monthTotal.hours} • {monthTotal.visits} {tr.visits}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const renderWeek = () => {
    const curr = new Date(currentDate);
    // Calcola il primo giorno della settimana in base alle impostazioni
    const dayOfWeek = curr.getDay();
    const diff = dayOfWeek - settings.weekStartsOn;
    const first = curr.getDate() - (diff < 0 ? diff + 7 : diff);
    const week = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(curr);
      date.setDate(first + i);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      week.push(
        <div key={i} className={`flex flex-row items-stretch border-b ${settings.theme === 'light' ? 'border-gray-300' : 'border-gray-700'} ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
          {/* Header giorno a sinistra - fisso */}
          <div className={`flex-shrink-0 w-20 flex flex-col items-center justify-center py-3 border-r ${settings.theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-gray-700 bg-gray-800'} ${isToday ? 'bg-blue-600 border-blue-600' : ''}`}>
            <div className={`text-xs font-semibold ${isToday ? 'text-white' : settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              {tr.days[date.getDay()]}
            </div>
            <div className={`text-2xl font-bold ${isToday ? 'text-white' : settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              {date.getDate()}
            </div>
          </div>
          {/* Eventi del giorno - scrollabili orizzontalmente */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex flex-row gap-2 p-2 min-h-[80px] items-center">
              {dayEvents.length === 0 ? (
                <div className={`text-xs ${settings.theme === 'light' ? 'text-gray-400' : 'text-gray-600'} italic`}>
                  {tr.noEvents}
                </div>
              ) : (
                dayEvents.map(e => (
                  <div key={e.id} className="flex-shrink-0 w-40 p-2 rounded-lg cursor-pointer shadow"
                    style={{ backgroundColor: accounts.find(a => a.id === e.accountId)?.color, color: 'white' }}
                    onClick={() => handleViewDetails(e)}>
                    <div className="font-bold text-sm truncate">{e.title}</div>
                    {e.startTime && <div className="text-xs opacity-90 mt-1">{e.startTime}</div>}
                    {e.location && <div className="text-xs opacity-75 truncate mt-0.5">📍 {e.location}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }
    // Ritorna le righe impilate verticalmente
    return <div className="space-y-0">{week}</div>;
  };

  const renderAgenda = () => {
    const filteredEvents = searchQuery ? getFilteredEvents() : events;
    const days = [];
    
    // Filtra eventi solo per il mese corrente
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const eventsByDate = {};
    filteredEvents.forEach(e => {
      const [y, m] = e.date.split('-').map(Number);
      // Mostra solo eventi del mese e anno corrente
      if (y === currentYear && m - 1 === currentMonth) {
        if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
        eventsByDate[e.date].push(e);
      }
    });
    
    Object.keys(eventsByDate).sort().forEach((dateStr, i) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const dayEvents = eventsByDate[dateStr];
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div key={i} className={`rounded-lg overflow-hidden ${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
          <div className={`p-3 border-l-4 ${isToday ? 'border-blue-500 bg-blue-100' : settings.theme === 'light' ? 'border-gray-400' : 'border-gray-600'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`text-2xl font-bold ${isToday ? 'text-blue-600' : settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{date.getDate()}</div>
              <div>
                <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  {tr.days[date.getDay()]}
                </div>
                <div className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                  {tr.months[date.getMonth()]} {date.getFullYear()}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {dayEvents.map(e => (
                <div key={e.id} className={`p-3 rounded-lg border-l-4 cursor-pointer ${settings.theme === 'light' ? 'bg-white hover:bg-gray-50' : 'bg-gray-700 hover:bg-gray-600'}`}
                  style={{ borderColor: accounts.find(a => a.id === e.accountId)?.color }}
                  onClick={() => handleViewDetails(e)}>
                  <div className="font-semibold">{e.title}</div>
                  {e.startTime && <div className={`text-sm mt-1 ${settings.theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{e.startTime} - {e.endTime}</div>}
                  {e.location && <div className={`text-sm mt-1 ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>📍 {e.location}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    });
    
    if (days.length === 0) {
      return <div className={`text-center py-8 ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{tr.noEvents}</div>;
    }
    
    return days;
  };

  // Espandi ricorrenze localmente
  const expandRecurrence = (baseEvent) => {
    if (!baseEvent.recurring || baseEvent.recurring === 'none') return [baseEvent];
    
    const occurrences = [];
    const startDate = new Date(baseEvent.date);
    const endDate = baseEvent.recurringEndDate ? new Date(baseEvent.recurringEndDate) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    const interval = baseEvent.recurringInterval || 1;
    
    let currentDate = new Date(startDate);
    let instanceCount = 0;
    const maxInstances = 365; // Limite sicurezza
    
    while (currentDate <= endDate && instanceCount < maxInstances) {
      occurrences.push({
        ...baseEvent,
        id: `${baseEvent.id}_${instanceCount}`,
        date: currentDate.toISOString().split('T')[0],
        recurringId: baseEvent.id // ID dell'evento ricorrente principale
      });
      
      instanceCount++;
      
      // Incrementa in base alla frequenza e intervallo
      switch (baseEvent.recurring) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + interval);
          break;
      }
    }
    
    console.log(`[expandRecurrence] Espanse ${occurrences.length} occorrenze per ${baseEvent.title}`);
    return occurrences;
  };

  // Helper per trovare un account valido
  const getValidAccountId = () => {
    // Carica accounts da localStorage
    const savedAccounts = localStorage.getItem('calendar4jw_accounts');
    const allAccounts = savedAccounts ? JSON.parse(savedAccounts) : accounts;
    
    // Prova a usare defaultCalendar se esiste
    if (allAccounts.find(a => a.id === settings.defaultCalendar)) {
      return settings.defaultCalendar;
    }
    
    // Altrimenti usa il primo account disponibile
    return allAccounts.length > 0 ? allAccounts[0].id : 1;
  };

  const handleSave = async () => {
    if (!newEvent.title || !newEvent.date) return;
    // Quando modifica, preserva googleId e caldavUrl dall'evento originale
    const evt = editingEvent 
      ? { ...newEvent, id: editingEvent.id, googleId: editingEvent.googleId, caldavUrl: editingEvent.caldavUrl } 
      : { ...newEvent, id: Date.now() };
    
    console.log('[handleSave] Salvando evento:', evt);
    console.log('[handleSave] Account ID selezionato:', newEvent.accountId, 'tipo:', typeof newEvent.accountId);
    console.log('[handleSave] Accounts disponibili:', JSON.stringify(accounts));
    
    // Carica accounts da localStorage per assicurarsi di avere i dati più aggiornati
    const savedAccounts = localStorage.getItem('calendar4jw_accounts');
    const allAccounts = savedAccounts ? JSON.parse(savedAccounts) : accounts;
    console.log('[handleSave] Accounts da localStorage:', JSON.stringify(allAccounts));
    
    // Trova l'account selezionato (confronta sia come numero che come stringa)
    const selectedAccount = allAccounts.find(a => a.id === newEvent.accountId || a.id === parseInt(newEvent.accountId));
    console.log('[handleSave] Account trovato:', JSON.stringify(selectedAccount));
    
    if (!selectedAccount) {
      console.error('[handleSave] ERRORE: Account non trovato!');
      alert(`⚠️ ${tr.selectValidCalendar}`);
      return;
    }
    
    let savedToCloud = false;
    
    // Salvataggio su Google Calendar
    if (selectedAccount.name === 'Google' || selectedAccount.name.startsWith('Google')) {
      try {
        const token = localStorage.getItem(`calendar4jw_google_token_${selectedAccount.id}`);
        if (token) {
          const startDateTime = newEvent.startTime 
            ? `${newEvent.date}T${newEvent.startTime}:00` 
            : newEvent.date;
          const endDateTime = newEvent.endTime 
            ? `${newEvent.date}T${newEvent.endTime}:00` 
            : newEvent.date;
          
          const googleEvent = {
            summary: newEvent.title,
            location: newEvent.location,
            description: newEvent.description,
            start: newEvent.startTime 
              ? { dateTime: startDateTime, timeZone: 'Europe/Rome' }
              : { date: newEvent.date },
            end: newEvent.endTime 
              ? { dateTime: endDateTime, timeZone: 'Europe/Rome' }
              : { date: newEvent.date }
          };
          
          // Aggiungi ricorrenza se presente
          if (newEvent.recurring && newEvent.recurring !== 'none') {
            const freq = newEvent.recurring.toUpperCase();
            let rrule = `RRULE:FREQ=${freq}`;
            const interval = newEvent.recurringInterval || 1;
            if (interval > 1) {
              rrule += `;INTERVAL=${interval}`;
            }
            if (newEvent.recurringEndDate) {
              // Google vuole UNTIL nel formato YYYYMMDDTHHMMSSZ
              const untilDate = newEvent.recurringEndDate.replace(/-/g, '');
              rrule += `;UNTIL=${untilDate}T235959Z`;
            }
            googleEvent.recurrence = [rrule];
            console.log('[Google] RRULE:', rrule);
          }
          
          const method = editingEvent?.googleId ? 'PATCH' : 'POST';
          const url = editingEvent?.googleId 
            ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${editingEvent.googleId}`
            : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
          
          console.log('[Google] Request:', { method, url, timestamp: new Date().toISOString() });
          
          const res = await fetch(url, {
            method,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(googleEvent)
          });
          
          if (res.ok) {
            const savedEvent = await res.json();
            evt.googleId = savedEvent.id;
            savedToCloud = true;
            console.log('✅ Evento salvato su Google Calendar');
          } else if (res.status === 401) {
            // Token scaduto - prova refresh silenzioso prima del login interattivo
            console.warn('⚠️ Token Google scaduto, tento refresh automatico...');
            try {
              const isWebPlatform = Capacitor.getPlatform() === 'web';
              let newToken = null;
              let refreshedEmail = selectedAccount.email || '';

              if (isWebPlatform) {
                try {
                  const webAuth = await signInGoogleWeb({ prompt: '' });
                  newToken = webAuth.accessToken;
                  refreshedEmail = webAuth.userEmail || refreshedEmail;
                } catch (silentErr) {
                  console.warn('[Google][Web] Silent refresh failed, requesting interactive login...');
                  const webAuth = await signInGoogleWeb({ prompt: 'select_account' });
                  newToken = webAuth.accessToken;
                  refreshedEmail = webAuth.userEmail || refreshedEmail;
                }
              } else {
                let user = await GoogleAuth.refresh();
                if (!user || !user.authentication || !user.authentication.accessToken) {
                  user = await GoogleAuth.signIn();
                }

                if (user && user.authentication && user.authentication.accessToken) {
                  newToken = user.authentication.accessToken;
                  refreshedEmail = user.email || refreshedEmail;
                }
              }

              if (!newToken) {
                throw new Error('Refresh token fallito');
              }

              const expiry = Date.now() + (55 * 60 * 1000);
              localStorage.setItem(`calendar4jw_google_token_${selectedAccount.id}`, newToken);
              localStorage.setItem(`calendar4jw_google_user_${selectedAccount.id}`, refreshedEmail);
              localStorage.setItem(`calendar4jw_google_token_expiry_${selectedAccount.id}`, expiry.toString());

              // Riprova la richiesta con il nuovo token
              const retryRes = await fetch(url, {
                method,
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(googleEvent)
              });

              if (retryRes.ok) {
                const savedEvent = await retryRes.json();
                evt.googleId = savedEvent.id;
                savedToCloud = true;
                console.log('✅ Evento salvato su Google Calendar dopo refresh token');
              } else {
                throw new Error(`Errore dopo refresh: ${retryRes.status}`);
              }
            } catch (refreshErr) {
              const classification = classifyGoogleAuthError(refreshErr);
              logGoogleAuthDiagnostics('handleSave-refresh', classification);
              const message = classification.kind === 'unknown'
                ? tr.googleSessionExpired
                : getGoogleAuthErrorMessage(classification, { isWeb: Capacitor.getPlatform() === 'web' });
              alert(`⚠️ ${message}`);
              localStorage.removeItem(`calendar4jw_google_token_${selectedAccount.id}`);
              setAccounts(prev => prev.map(acc => 
                acc.id === selectedAccount.id ? { ...acc, connected: false } : acc
              ));
            }
          } else {
            const errorText = await res.text();
            console.error('❌ Errore HTTP Google:', { status: res.status, statusText: res.statusText, body: errorText });
            alert(`⚠️ ${tr.googleSaveError} ${res.status} ${res.statusText}`);
          }
        } else {
          alert(`⚠️ ${tr.googleTokenNotFound}`);
        }
      } catch (err) {
        console.error('Errore salvataggio Google:', err);
        const classification = classifyGoogleAuthError(err);
        logGoogleAuthDiagnostics('handleSave', classification);
        if (classification.kind === 'unknown') {
          alert(`⚠️ ${tr.googleSaveError} ${classification.rawMessage}`);
        } else {
          alert(`⚠️ ${getGoogleAuthErrorMessage(classification, { isWeb: Capacitor.getPlatform() === 'web' })}`);
        }
      }
    }
    // Salvataggio su CalDAV (tutti gli account che non sono Google)
    else if (selectedAccount.id !== 1) {
      console.log('[handleSave] Tento salvataggio CalDAV per account ID:', newEvent.accountId);
      try {
        const caldavAccounts = await getCalDAVAccounts();
        console.log('[handleSave] CalDAV accounts da Preferences:', caldavAccounts);
        const account = caldavAccounts.find(a => parseInt(a.id) === newEvent.accountId);
        console.log('[handleSave] Account CalDAV selezionato:', account);
        
        if (account) {
          // Calendari sono salvati in Preferences
          const aid = String(account.id);
          const accountJsonRaw = await Preferences.get({ key: 'caldav_' + aid });
          const accountJson = accountJsonRaw.value;
          console.log('[handleSave] CHECKPOINT 1');
          
          if (accountJson) {
            console.log('[handleSave] CHECKPOINT 2');
            const accountData = JSON.parse(accountJson);
            console.log('[handleSave] CHECKPOINT 3');
            let calendars = accountData.calendars || [];
            
            console.log('[handleSave] Calendari nell\'account:', calendars);
            
            // Hardcode per evitare property access - usa URL diretto
            const serverUrl = localStorage.getItem('caldav_' + newEvent.accountId + '_serverUrl');
            const username = localStorage.getItem('caldav_' + newEvent.accountId + '_username');
            const targetUrl = serverUrl + '/remote.php/dav/calendars/' + username + '/personal/';
            
            const result = await createCalDAVEvent(newEvent.accountId, targetUrl, {
                title: newEvent.title,
                description: newEvent.description,
                location: newEvent.location,
                startDate: newEvent.date,
                startTime: newEvent.startTime,
                endDate: newEvent.endDate || newEvent.date,
                endTime: newEvent.endTime,
                recurring: newEvent.recurring,
                recurringEndDate: newEvent.recurringEndDate,
                recurringInterval: newEvent.recurringInterval || 1
              }, editingEvent?.caldavUrl ? true : false); // passa flag isUpdate
              
              if (result.success) {
                console.log('✅ Evento salvato su CalDAV');
                evt.caldavUrl = result.eventUrl;
                savedToCloud = true;
              } else {
                console.error('❌ Errore salvataggio CalDAV:', result.error);
                alert(`⚠️ ${tr.caldavSaveError} ${result.error}`);
              }
          } else {
            console.error('[handleSave] Account JSON non trovato');
            alert(`⚠️ ${tr.caldavAccountDataNotFound}`);
          }
        } else {
          console.error('[handleSave] Account CalDAV non trovato in Preferences');
          alert(`⚠️ ${tr.caldavAccountNotFound}`);
        }
      } catch (err) {
        console.error('Errore salvataggio CalDAV:', err);
        alert(`⚠️ ${tr.caldavSaveError} ${err.message}`);
      }
    }
    
    // Avvisa se non salvato sul cloud (solo se l'utente aveva scelto un account cloud)
    if (!savedToCloud && selectedAccount.id !== 1) {
      console.log('⚠️ Evento non salvato sul cloud, ma salvo localmente');
      // Mostra avviso ma non blocca il salvataggio locale
      alert(`⚠️ ${tr.eventSavedLocalOnly}`);
    }
    
    if (editingEvent) {
      console.log('[handleSave] Aggiornamento evento esistente');
      // Se l'evento modificato era ricorrente, rimuovi tutte le occorrenze vecchie
      const eventsWithoutOld = events.filter(e => 
        e.id !== editingEvent.id && e.recurringId !== editingEvent.id
      );
      // Espandi il nuovo evento
      const expandedEvents = expandRecurrence(evt);
      const updatedEvents = [...eventsWithoutOld, ...expandedEvents];
      setEvents(updatedEvents);
      setEditingEvent(null);
      
      // Forza aggiornamento notifiche
      setTimeout(() => {
        updateAllNotifications(updatedEvents, settings.defaultNotificationTime || 15)
          .catch(err => console.error('[handleSave] Errore aggiornamento notifiche:', err));
      }, 500);
    } else {
      console.log('[handleSave] Aggiunta nuovo evento alla lista');
      // Espandi ricorrenze se presenti
      const expandedEvents = expandRecurrence(evt);
      const updatedEvents = [...events, ...expandedEvents];
      setEvents(updatedEvents);
      
      // Forza aggiornamento notifiche
      setTimeout(() => {
        updateAllNotifications(updatedEvents, settings.defaultNotificationTime || 15)
          .catch(err => console.error('[handleSave] Errore aggiornamento notifiche:', err));
      }, 500);
    }
    
    console.log('[handleSave] Evento salvato, chiusura modal');
    setShowEventModal(false);
    setNewEvent({ title: '', date: '', endDate: '', startTime: '', endTime: '', location: '', description: '', accountId: settings.defaultCalendar, eventType: 'regular', attachments: [], notifyBefore: settings.defaultNotificationTime, recurring: 'none', recurringEndDate: '', recurringInterval: 1 });
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm(tr.confirmDelete)) return;
    const event = events.find(e => e.id === eventId);
    
    // Elimina da Google Calendar
    if (event?.googleId && event?.accountId) {
      try {
        const token = localStorage.getItem(`calendar4jw_google_token_${event.accountId}`);
        if (token) {
          await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.googleId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (err) {
        console.error('Errore eliminazione Google:', err);
      }
    }
    
    // Elimina da CalDAV
    if (event?.caldavUrl && event.accountId !== 1) {
      try {
        const caldavAccounts = await getCalDAVAccounts();
        const account = caldavAccounts.find(a => parseInt(a.id) === event.accountId);
        if (account && event.caldavUrl) {
          const result = await deleteCalDAVEvent(account.id, event.caldavUrl);
          if (result.success) {
            console.log('✅ Evento eliminato da CalDAV');
          } else {
            console.warn('⚠️ Errore eliminazione CalDAV:', result.error);
          }
        }
      } catch (err) {
        console.error('Errore eliminazione CalDAV:', err);
      }
    }
    
    // Cancella la notifica dell'evento
    await cancelEventNotification(eventId);
    
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleViewDetails = (event) => {
    setShowDayView(false);
    setViewingEvent(event);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setNewEvent({ ...event });
    setShowDayView(false);
    setViewingEvent(null);
    setShowEventModal(true);
  };

  const handleShare = (event) => {
    const text = `${event.title}\n${event.date} ${event.startTime || ''}\n${event.location || ''}`;
    if (navigator.share) {
      navigator.share({ title: event.title, text });
    } else {
      navigator.clipboard.writeText(text);
      alert(`📋 ${tr.eventCopied}`);
    }
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewEvent({
          ...newEvent,
          attachments: [...(newEvent.attachments || []), { name: file.name, data: reader.result }]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveServiceHours = () => {
    if (!selectedServiceDate) return;
    const dateKey = formatDate(selectedServiceDate);
    const hoursInput = document.getElementById('service-hours').value || '0:00';
    const visits = parseInt(document.getElementById('service-visits').value) || 0;
    
    // Accetta : . , ; come separatori
    let hours = hoursInput;
    if (hoursInput.match(/[.:,;]/)) {
      // Sostituisci qualsiasi separatore con :
      const normalized = hoursInput.replace(/[.,;]/g, ':');
      const parts = normalized.split(':');
      const h = parseInt(parts[0]) || 0;
      const m = parseInt(parts[1]) || 0;
      hours = `${h}:${String(m).padStart(2, '0')}`;
    } else {
      // Se è solo un numero, trattalo come ore intere
      const h = parseInt(hoursInput) || 0;
      hours = `${h}:00`;
    }
    
    setServiceHours({
      ...serviceHours,
      [dateKey]: { hours, visits }
    });
    
    setShowServiceModal(false);
    setSelectedServiceDate(null);
  };

  const deleteServiceHours = () => {
    if (!selectedServiceDate) return;
    const dateKey = formatDate(selectedServiceDate);
    
    // Rimuovi l'entry dalle ore di servizio
    const updated = { ...serviceHours };
    delete updated[dateKey];
    setServiceHours(updated);
    
    setShowServiceModal(false);
    setSelectedServiceDate(null);
  };

  const handleExportICS = () => {
    try {
      const icsContent = exportEventsToICS(events, 'Calendar4JW');
      const filename = `calendar4jw_${new Date().toISOString().split('T')[0]}.ics`;
      downloadICS(icsContent, filename);
      alert(`${events.length} ${tr.exportAllEvents.toLowerCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      alert(tr.importError);
    }
  };

  const handleImportICS = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const importedEvents = await readICSFile(file);
      
      // Assegna accountId dal calendario predefinito e genera ID univoci
      const newEvents = importedEvents.map(evt => ({
        ...evt,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        accountId: settings.defaultCalendar,
        color: accounts.find(a => a.id === settings.defaultCalendar)?.color || '#4285f4'
      }));

      setEvents([...events, ...newEvents]);
      alert(`${newEvents.length} ${tr.importSuccess}`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(tr.importError);
    }
  };

  // QR Code Functions
  const parseQRCode = (qrData) => {
    try {
      console.log('=== QR CODE PARSING START ===');
      console.log('[QR] Raw data:', qrData);
      console.log('[QR] Data length:', qrData.length);
      console.log('[QR] First 50 chars:', qrData.substring(0, 50));
      
      // Check if it's Nextcloud format: nc://login/user:username&password:pass&server:https://...
      if (qrData.startsWith('nc://login/')) {
        const params = qrData.replace('nc://login/', '');
        console.log('[QR] Params after removing prefix:', params);
        
        // Parsing manuale - splitta solo per i primi 2 &, il resto va al server
        let username = '';
        let password = '';
        let serverUrl = '';
        let accountName = 'Nextcloud';
        
        // Metodo più robusto: trova indici di user:, password:, server:
        const userIdx = params.indexOf('user:');
        const passIdx = params.indexOf('password:');
        const serverIdx = params.indexOf('server:');
        
        console.log('[QR] Indices - user:', userIdx, 'password:', passIdx, 'server:', serverIdx);
        
        if (userIdx !== -1 && passIdx !== -1) {
          // Estrai user: dalla posizione user: fino a &password
          username = params.substring(userIdx + 5, passIdx - 1); // -1 per &
          console.log('[QR] Extracted username:', username);
        }
        
        if (passIdx !== -1 && serverIdx !== -1) {
          // Estrai password: dalla posizione password: fino a &server
          password = params.substring(passIdx + 9, serverIdx - 1); // -1 per &
          console.log('[QR] Extracted password:', password ? '***' + password.slice(-4) : 'empty');
        }
        
        if (serverIdx !== -1) {
          // Estrai server: tutto dopo server:
          serverUrl = params.substring(serverIdx + 7);
          console.log('[QR] Extracted server (raw):', serverUrl);
          
          // Pulisci URL
          try {
            // Rimuovi eventuali spazi o caratteri strani all'inizio/fine
            serverUrl = serverUrl.trim();
            
            const urlObj = new URL(serverUrl);
            // Ricostruisci URL pulito: protocol + host + pathname (senza query/hash)
            serverUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
            serverUrl = serverUrl.replace(/\/$/, ''); // Rimuovi trailing slash
            console.log('[QR] Cleaned server URL:', serverUrl);
            
            // Estrai nome host per account name di default
            try {
              const hostname = urlObj.hostname.split('.')[0];
              accountName = hostname.charAt(0).toUpperCase() + hostname.slice(1);
              console.log('[QR] Account name from hostname:', accountName);
            } catch (e) {
              accountName = 'Nextcloud';
            }
          } catch (e) {
            console.error('[QR] URL parse error:', e);
            // Se URL non è valido, usa la stringa originale pulita
            serverUrl = serverUrl.trim().split('?')[0].split('#')[0].replace(/\/$/, '');
          }
          console.log('[QR] Final server URL:', serverUrl);
        }
        
        console.log('[QR] === RESULT ===');
        console.log('[QR] Username:', username);
        console.log('[QR] Password:', password ? 'present (***' + password.slice(-4) + ')' : 'MISSING');
        console.log('[QR] Server:', serverUrl);
        console.log('[QR] Account:', accountName);
        console.log('=== QR CODE PARSING END ===');
        
        const result = { serverUrl, username, password, accountName };
        console.log('[QR] Returning object:', JSON.stringify({ 
          serverUrl: result.serverUrl,
          username: result.username, 
          password: result.password ? '***' : 'empty',
          accountName: result.accountName 
        }));
        
        return result;
      }
      
      // Parse caldav://username:password@server.com/path or https://server.com/... format
      let url = qrData;
      let username = '';
      let password = '';
      
      // Check if it's a caldav:// URL
      if (qrData.startsWith('caldav://')) {
        url = qrData.replace('caldav://', 'https://');
      }
      
      // Try to extract credentials from URL
      const urlObj = new URL(url);
      if (urlObj.username) {
        username = decodeURIComponent(urlObj.username);
      }
      if (urlObj.password) {
        password = decodeURIComponent(urlObj.password);
      }
      
      // Reconstruct server URL without credentials
      const serverUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      
      return { serverUrl, username, password };
    } catch (error) {
      console.error('QR parse error:', error);
      return null;
    }
  };

  const startQRScan = async () => {
    try {
      setShowQRScanner(true);
      
      // Wait for DOM to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrReaderRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          console.log('[QR SCAN] Decoded text received:', decodedText);
          const parsed = parseQRCode(decodedText);
          console.log('[QR SCAN] Parse result:', parsed);
          
          if (parsed && parsed.serverUrl && parsed.username) {
            console.log('[QR SCAN] Valid data, updating form...');
            // Genera nome account progressivo: CalDAV 1, CalDAV 2, ecc.
            const accountNumber = caldavAccounts.length + 1;
            const defaultAccountName = `CalDAV ${accountNumber}`;
            
            setCaldavForm(prev => ({
              ...prev,
              serverUrl: parsed.serverUrl,
              username: parsed.username,
              password: parsed.password,
              accountName: defaultAccountName
            }));
            const msg = `✅ ${tr.qrScanSuccess}\n\n🏷️ Nome account: "${defaultAccountName}" (puoi modificarlo)\n\n🌐 Server: ${parsed.serverUrl}\n👤 User: ${parsed.username}`;
            console.log('[QR SCAN] Showing alert:', msg);
            alert(msg);
            stopQRScan();
          } else {
            console.error('[QR SCAN] Parse failed or incomplete. Parsed data:', parsed);
            console.error('[QR SCAN] serverUrl:', parsed?.serverUrl, 'username:', parsed?.username);
            alert(tr.qrScanError + '\n\nDettagli: ' + JSON.stringify(parsed));
          }
        },
        (errorMessage) => {
          // Ignore scan errors (just no QR detected yet)
        }
      );
    } catch (err) {
      console.error('QR scan error:', err);
      alert(tr.qrScanError + ': ' + err.message);
      setShowQRScanner(false);
    }
  };

  const stopQRScan = () => {
    if (qrReaderRef.current) {
      qrReaderRef.current.stop().then(() => {
        qrReaderRef.current = null;
        setShowQRScanner(false);
      }).catch((err) => {
        console.error('Stop QR error:', err);
        setShowQRScanner(false);
      });
    } else {
      setShowQRScanner(false);
    }
  };

  const connectCaldav = async () => {
    if (!caldavForm.serverUrl || !caldavForm.username || !caldavForm.password || !caldavForm.accountName) {
      alert(tr.fillAllFields);
      return;
    }

    setCaldavConnecting(true);
    try {
      const result = await connectCalDAV(
        caldavForm.serverUrl,
        caldavForm.username,
        caldavForm.password,
        caldavForm.accountName
      );

      if (result.success) {
        setCaldavCalendars(result.calendars);
        setCaldavStep('selectCalendars');
        setSelectedCaldavCalendars(result.calendars.map(cal => cal.url)); // Seleziona tutti di default
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (err) {
      alert(`❌ ${tr.caldavConnectionError} ${err.message}`);
    } finally {
      setCaldavConnecting(false);
    }
  };
  
  const finishCaldavSetup = async () => {
    // Carica account CalDAV salvati
    const caldavAccs = await getCalDAVAccounts();
    setCaldavAccounts(caldavAccs);
    
    // Aggiungi gli account CalDAV all'array accounts per renderli visibili
    if (caldavAccs.length > 0) {
      setAccounts(prev => {
        const caldavAccountIds = caldavAccs.map(a => parseInt(a.id));
        console.log('[App] Adding CalDAV accounts after setup:', caldavAccountIds);
        const withoutCaldav = prev.filter(a => !caldavAccountIds.includes(a.id));
        const caldavAsAccounts = caldavAccs.map(ca => ({
          id: parseInt(ca.id),
          name: ca.accountName || 'CalDAV',
          color: '#34a853',
          active: true
        }));
        console.log('[App] Accounts array after CalDAV setup:', [...withoutCaldav, ...caldavAsAccounts].map(a => ({ id: a.id, name: a.name })));
        return [...withoutCaldav, ...caldavAsAccounts];
      });
    }
    
    // Sincronizza eventi dai calendari selezionati
    if (caldavAccs.length > 0) {
      const latestAccount = caldavAccs[caldavAccs.length - 1];
      
      // Salva i calendari selezionati nell'account
      const { value: accountJson } = await Preferences.get({ key: `caldav_${latestAccount.id}` });
      if (accountJson) {
        const accountData = JSON.parse(accountJson);
        accountData.calendars = caldavCalendars.filter(cal => 
          selectedCaldavCalendars.includes(cal.url)
        );
        await Preferences.set({
          key: `caldav_${latestAccount.id}`,
          value: JSON.stringify(accountData)
        });
      }
      
      await syncCaldavEvents(latestAccount.id);
    }
    
    // Reset form
    setCaldavForm({ serverUrl: '', username: '', password: '', accountName: '' });
    setCaldavCalendars([]);
    setSelectedCaldavCalendars([]);
    setCaldavStep('form');
    setShowCaldavModal(false);
  };
  
  const syncCaldavEvents = async (accountId) => {
    setSyncing(true);
    setSyncMessage('🔄 Sincronizzazione CalDAV in corso...');
    try {
      console.log('[App] Avvio sincronizzazione CalDAV per account:', accountId);
      // Non passiamo calendarIds, syncCalDAVEvents userà tutti i calendari salvati nell'account
      const result = await syncCalDAVEvents(accountId);
      console.log('[App] Risultato sincronizzazione:', result);
      
      if (result.success) {
        // Rimuovi vecchi eventi CalDAV di questo account
        const otherEvents = events.filter(e => e.accountId !== parseInt(accountId));
        const newEvents = [...otherEvents, ...result.events];
        console.log('[App] Setting events:', newEvents.length, 'total (', result.events.length, 'CalDAV +', otherEvents.length, 'others)');
        console.log('[App] Sample CalDAV events:', result.events.slice(0, 3).map(e => ({ title: e.title, date: e.date })));
        setEvents(newEvents);
        setSyncMessage('✅ Sincronizzazione completata!');
        setTimeout(() => setSyncMessage(''), 2000);
        alert(`✅ ${result.events.length} ${tr.caldavSyncSuccess.replace('{count}', result.calendarsCount)}`);
      } else {
        console.error('[App] Errore sincronizzazione:', result.error);
        setSyncMessage('❌ Errore sincronizzazione');
        setTimeout(() => setSyncMessage(''), 3000);
        alert(`❌ ${result.error || tr.caldavSyncError}`);
      }
    } catch (err) {
      console.error('[App] Eccezione durante sincronizzazione:', err);
      setSyncMessage('❌ Errore sincronizzazione');
      setTimeout(() => setSyncMessage(''), 3000);
      alert(`❌ ${tr.syncError} ${err.message || err.toString() || tr.unknownError}`);
    } finally {
      setSyncing(false);
    }
  };

  const bgClass = settings.theme === 'light' ? 'bg-gray-50' : 'bg-gray-900';
  const textClass = settings.theme === 'light' ? 'text-gray-900' : 'text-white';
  const cardBg = settings.theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const borderClass = settings.theme === 'light' ? 'border-gray-300' : 'border-gray-700';

  // Modal ore servizio - accessibile da tutte le viste
  const serviceModal = showServiceModal && selectedServiceDate && (() => {
    const monthKey = `${selectedServiceDate.getFullYear()}-${String(selectedServiceDate.getMonth() + 1).padStart(2, '0')}`;
    const monthHours = Object.keys(serviceHours)
      .filter(k => k.startsWith(monthKey))
      .reduce((sum, k) => {
        const hours = serviceHours[k].hours;
        return sum + (typeof hours === 'string' ? hoursToDecimal(hours) : (hours || 0));
      }, 0);
    const monthVisits = Object.keys(serviceHours)
      .filter(k => k.startsWith(monthKey))
      .reduce((sum, k) => sum + (serviceHours[k].visits || 0), 0);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-[100]">
        <div className={`${cardBg} rounded-t-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
          <div className={`p-4 border-b ${borderClass}`}>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-6 h-6 text-green-500" />
              {tr.addServiceHours}
            </h3>
            <p className={`text-sm mt-1 ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              {selectedServiceDate.getDate()} {tr.months[selectedServiceDate.getMonth()]} {selectedServiceDate.getFullYear()}
            </p>
            <div className={`mt-3 p-3 bg-green-600/20 border border-green-600 rounded-lg`}>
              <div className="text-sm font-semibold text-green-400 mb-1">{tr.monthTotal}</div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{tr.hours}:</span>
                  <span className="text-lg font-bold">{decimalToHours(monthHours)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{tr.visits}:</span>
                  <span className="text-lg font-bold">{monthVisits}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">⏰ {tr.hours} (es: 2:30 o 2.30)</label>
              <input
                id="service-hours"
                type="text"
                inputMode="decimal"
                placeholder="0:00"
                defaultValue={serviceHours[formatDate(selectedServiceDate)]?.hours || '0:00'}
                className={`w-full px-4 py-3 ${cardBg} border ${borderClass} rounded-lg text-lg font-semibold focus:ring-2 focus:ring-green-500 outline-none`}
              />
              <p className={`text-xs mt-1 ${settings.theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                Usa : . o , come separatore
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">🚪 {tr.visits}</label>
              <input
                id="service-visits"
                type="number"
                min="0"
                defaultValue={serviceHours[formatDate(selectedServiceDate)]?.visits || 0}
                className={`w-full px-4 py-3 ${cardBg} border ${borderClass} rounded-lg text-lg font-semibold focus:ring-2 focus:ring-green-500 outline-none`}
              />
            </div>
          </div>
          <div className="flex gap-3 p-4">
            <button onClick={() => { setShowServiceModal(false); setSelectedServiceDate(null); }} 
              className={`flex-1 px-4 py-3 ${settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} rounded-lg font-medium transition`}>
              {tr.cancel}
            </button>
            {serviceHours[formatDate(selectedServiceDate)] && (
              <button onClick={deleteServiceHours} className="px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={saveServiceHours} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow">
              {tr.save}
            </button>
          </div>
        </div>
      </div>
    );
  })();

  if (showDayView && selectedDate) {
    const dayEvents = getEventsForDate(selectedDate);
    const dateKey = formatDate(selectedDate);
    const dayService = serviceHours[dateKey] || { hours: '0:00', visits: 0 };
    
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} pb-10`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className={`app-header ${cardBg} p-4 flex items-center justify-between border-b ${borderClass} sticky top-0 z-10`}>
          <button onClick={() => setShowDayView(false)} className="p-2 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="font-bold">{selectedDate.getDate()} {tr.months[selectedDate.getMonth()]}</h2>
          <div className="flex gap-2">
            <button onClick={() => { setSelectedServiceDate(selectedDate); setShowServiceModal(true); }}
              className="p-2 rounded-lg hover:bg-gray-700">
              <Clock className="w-5 h-5 text-green-500" />
            </button>
            <button onClick={() => { 
              setEditingEvent(null); 
              setNewEvent({ ...newEvent, date: formatDate(selectedDate), eventType: 'regular', attachments: [], accountId: getValidAccountId() }); 
              setShowDayView(false); 
              setShowEventModal(true); 
            }} className="p-2 rounded-lg hover:bg-gray-700">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {((typeof dayService.hours === 'string' ? hoursToDecimal(dayService.hours) : dayService.hours) > 0 || dayService.visits > 0) && (
          <div className="p-4 bg-gradient-to-r from-green-600 to-green-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{tr.serviceHours}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-4">
                  <div><span className="font-bold text-lg">{typeof dayService.hours === 'string' ? dayService.hours : decimalToHours(dayService.hours || 0)}</span> {tr.hours}</div>
                  <div><span className="font-bold text-lg">{dayService.visits}</span> {tr.visits}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelectedServiceDate(selectedDate); setShowServiceModal(true); }}
                    className="p-1.5 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { 
                    if (window.confirm(tr.confirmDeleteServiceHours)) {
                      const updated = { ...serviceHours };
                      delete updated[dateKey];
                      setServiceHours(updated);
                    }
                  }}
                    className="p-1.5 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 space-y-3">
          {dayEvents.length === 0 ? 
            <div className={`text-center py-8 ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{tr.noEvents}</div> :
            dayEvents.map(e => (
              <div key={e.id} className={`${cardBg} rounded-lg p-4 border-l-4 ${borderClass} shadow`}
                style={{ borderColor: accounts.find(a => a.id === e.accountId)?.color }}>
                <div className="flex justify-between items-start mb-2" onClick={() => handleViewDetails(e)}>
                  <h3 className="font-bold flex-1 cursor-pointer">{e.title}</h3>
                  <div className="flex gap-1" onClick={(evt) => evt.stopPropagation()}>
                    <button onClick={() => handleShare(e)} className="text-blue-400 p-2 hover:bg-gray-700 rounded">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(e)} className="text-blue-400 p-2 hover:bg-gray-700 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="text-red-400 p-2 hover:bg-gray-700 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {e.startTime && <div className={`text-sm ${settings.theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>🕐 {e.startTime} - {e.endTime}</div>}
                {e.location && <div className={`text-sm ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>📍 {e.location}</div>}
                {e.description && <div className={`text-sm mt-2 ${settings.theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{e.description}</div>}
                {e.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {e.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        <Paperclip className="w-3 h-3" />
                        {att.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
        {serviceModal}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} relative pb-10`}>
      {syncMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] animate-fade-in">
          <div className={`${cardBg} px-6 py-3 rounded-lg shadow-2xl border ${borderClass} flex items-center gap-2`}>
            <span className="text-sm font-medium">{syncMessage}</span>
          </div>
        </div>
      )}
      
      <div className={`app-header ${cardBg} p-4 sticky top-0 z-10 border-b ${borderClass} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <img src="/icon.png" alt="Calendar4JW" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="tracking-wide">Calendar4JW</span>
          </h1>
          <div className="flex items-center gap-2">
            {!showSearch && (
              <button onClick={() => setShowSearch(true)} className={`p-2 ${settings.theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'} rounded-lg transition`}>
                <Search className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setShowSystemMenu(!showSystemMenu)} className={`p-2 ${settings.theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'} rounded-lg transition`}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="mb-4 flex gap-2 animate-in slide-in-from-top">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr.searchEvents}
              className={`flex-1 px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
              autoFocus
            />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex gap-1">
            {['month', 'week', 'agenda'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === v 
                    ? 'bg-blue-600 text-white shadow' 
                    : settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'
                }`}>
                {tr[v + 'View']}
              </button>
            ))}
          </div>
          <button onClick={() => { setNewEvent({ ...newEvent, date: formatDate(new Date()), attachments: [], accountId: getValidAccountId() }); setShowEventModal(true); }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition shadow">
            <Plus className="w-4 h-4" />{tr.newEvent}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => {
            if (viewMode === 'week') {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 7);
              setCurrentDate(newDate);
            } else {
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
            }
          }}
            className={`p-2 rounded-lg ${settings.theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'} transition`}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={() => setShowMonthPicker(true)} className="text-lg font-semibold hover:text-blue-500 transition">
            {tr.months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </button>
          <button onClick={() => {
            if (viewMode === 'week') {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + 7);
              setCurrentDate(newDate);
            } else {
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
            }
          }}
            className={`p-2 rounded-lg ${settings.theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'} transition`}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {showSystemMenu && (
        <div className={`absolute top-20 right-4 ${cardBg} rounded-lg shadow-2xl border ${borderClass} w-80 z-50 animate-in slide-in-from-top`}>
          <div className={`p-4 border-b ${borderClass} flex items-center justify-between`}>
            <h3 className="font-semibold">{tr.accounts}</h3>
            <button onClick={() => setShowSystemMenu(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            <button onClick={() => { setShowSettings(true); setShowSystemMenu(false); }}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
              <Settings className="w-5 h-5" />
              {tr.settings}
            </button>
            
            <div className={`${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Google Calendar</span>
                </div>
              </div>
              <div className="space-y-2">
                {accounts.filter(acc => acc.name.startsWith('Google')).map(acc => (
                  <div key={acc.id} className={`p-3 ${settings.theme === 'light' ? 'bg-white' : 'bg-gray-600'} rounded-lg`}>
                    <div className="mb-2">
                      <div className="font-medium text-sm">{acc.name}</div>
                      <div className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {acc.email}
                      </div>
                      {!acc.connected && (
                        <div className="text-xs text-amber-500 mt-1">
                          {settings.language === 'it'
                            ? 'Account scollegato'
                            : settings.language === 'es'
                              ? 'Cuenta desconectada'
                              : 'Account disconnected'}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => { 
                        await syncGoogle(); 
                        setShowSystemMenu(false); 
                      }}
                        disabled={syncing}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {acc.connected
                          ? tr.sync
                          : (settings.language === 'it'
                              ? 'Riconnetti'
                              : settings.language === 'es'
                                ? 'Reconectar'
                                : 'Reconnect')}
                      </button>
                      <button onClick={async () => {
                        await disconnectGoogle(acc.id);
                        setShowSystemMenu(false);
                      }}
                        disabled={!acc.connected}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1">
                        <X className="w-4 h-4" />
                        {tr.disconnect}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setSettings(prev => ({ ...prev, defaultCalendar: acc.id }));
                        showTransientMessage(
                          settings.language === 'it'
                            ? '✅ Calendario predefinito aggiornato'
                            : settings.language === 'es'
                              ? '✅ Calendario predeterminado actualizado'
                              : '✅ Default calendar updated'
                        );
                      }}
                      disabled={settings.defaultCalendar === acc.id}
                      className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
                      {settings.defaultCalendar === acc.id
                        ? (settings.language === 'it' ? 'Calendario predefinito' : settings.language === 'es' ? 'Calendario predeterminado' : 'Default calendar')
                        : (settings.language === 'it' ? 'Imposta come predefinito' : settings.language === 'es' ? 'Establecer como predeterminado' : 'Set as default')}
                    </button>
                  </div>
                ))}
                <button onClick={addGoogleAccount}
                  disabled={syncing}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  <Cloud className="w-5 h-5" />
                  {tr.addGoogleAccount}
                </button>
              </div>
            </div>
            
            <div className={`${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold">CalDAV / Nextcloud</span>
                </div>
              </div>
              {caldavAccounts.length > 0 ? (
                <div className="space-y-2">
                  {caldavAccounts.map(acc => (
                    <div key={acc.id} className={`p-3 ${settings.theme === 'light' ? 'bg-white' : 'bg-gray-600'} rounded-lg`}>
                      <div className="mb-2">
                        <div className="font-medium text-sm">{acc.accountName}</div>
                        <div className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                          {acc.calendarsCount} {tr.calendars}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={async () => { 
                          await syncCaldavEvents(acc.id); 
                          setShowSystemMenu(false); 
                        }}
                          disabled={syncing}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                          {tr.sync}
                        </button>
                        <button onClick={async () => {
                          if (window.confirm(tr.confirmDisconnectCaldav)) {
                            await disconnectCalDAV(acc.id);
                            const accounts = await getCalDAVAccounts();
                            setCaldavAccounts(accounts);
                            // Rimuovi anche dall'array accounts per il cambio colore
                            setAccounts(prev => prev.filter(a => a.id !== parseInt(acc.id)));
                            setEvents(events.filter(e => e.accountId !== parseInt(acc.id)));
                          }
                        }}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center justify-center gap-1">
                          <CloudOff className="w-4 h-4" />
                          {tr.remove}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setSettings(prev => ({ ...prev, defaultCalendar: parseInt(acc.id) }));
                          showTransientMessage(
                            settings.language === 'it'
                              ? '✅ Calendario predefinito aggiornato'
                              : settings.language === 'es'
                                ? '✅ Calendario predeterminado actualizado'
                                : '✅ Default calendar updated'
                          );
                        }}
                        disabled={settings.defaultCalendar === parseInt(acc.id)}
                        className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
                        {settings.defaultCalendar === parseInt(acc.id)
                          ? (settings.language === 'it' ? 'Calendario predefinito' : settings.language === 'es' ? 'Calendario predeterminado' : 'Default calendar')
                          : (settings.language === 'it' ? 'Imposta come predefinito' : settings.language === 'es' ? 'Establecer como predeterminado' : 'Set as default')}
                      </button>
                    </div>
                  ))}
                  <button onClick={() => { setShowCaldavModal(true); setShowSystemMenu(false); }}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm">
                    {tr.addCaldavAccount}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowCaldavModal(true); setShowSystemMenu(false); }}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">{tr.connect}</button>
              )}
            </div>

            <div className={`${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4`}>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>🎨</span> {tr.changeColor}
              </h4>
              {accounts.map(acc => {
                const displayName = acc.id === 1 ? (tr.localAccount || 'Locale') : acc.name;
                return (
                  <div key={acc.id} className="flex items-center justify-between mb-3 last:mb-0">
                    <span className="text-sm font-medium">{displayName}</span>
                    <input
                      type="color"
                      value={acc.color}
                      onChange={(e) => {
                        const updated = accounts.map(a => a.id === acc.id ? { ...a, color: e.target.value } : a);
                        setAccounts(updated);
                      }}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="p-2" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {Array.from({ length: 7 }, (_, i) => {
                const dayIndex = (settings.weekStartsOn + i) % 7;
                return <div key={i} className={`text-center text-xs font-bold py-2 ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{tr.days[dayIndex]}</div>;
              })}
            </div>
            <div className="grid grid-cols-7 gap-0.5">{renderMonth()}</div>
          </div>
        )}
        {viewMode === 'week' && renderWeek()}
        {viewMode === 'agenda' && <div className="space-y-3">{renderAgenda()}</div>}
      </div>

      {showMonthPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-sm max-h-96 overflow-y-auto shadow-2xl`}>
            <div className={`p-4 border-b ${borderClass} flex items-center justify-between sticky top-0 ${cardBg}`}>
              <h3 className="text-lg font-semibold">📅 Seleziona Data</h3>
              <button onClick={() => setShowMonthPicker(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <select
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth()))}
                className={`w-full mb-4 px-3 py-2 ${cardBg} border ${borderClass} rounded-lg font-semibold`}>
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                {tr.months.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentDate(new Date(currentDate.getFullYear(), i));
                      setShowMonthPicker(false);
                    }}
                    className={`px-3 py-2 rounded-lg font-medium transition ${
                      i === currentDate.getMonth() 
                        ? 'bg-blue-600 text-white shadow' 
                        : settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'
                    }`}>
                    {m.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`p-4 border-b ${borderClass} flex items-center justify-between sticky top-0 ${cardBg}`}>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="w-6 h-6" />
                {tr.settings}
              </h3>
              <button onClick={() => setShowSettings(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">🌍 {tr.language}</label>
                <div className="grid grid-cols-3 gap-3">
                  {['it', 'es', 'en'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSettings(prev => ({ ...prev, language: lang }))}
                      className={`px-4 py-3 rounded-lg font-bold text-lg transition ${
                        settings.language === lang 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'
                      }`}>
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">{tr.theme}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'dark', 'system'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => setSettings({ ...settings, theme })}
                      className={`px-3 py-3 rounded-lg flex flex-col items-center justify-center gap-2 font-medium transition ${
                        settings.theme === theme 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'
                      }`}>
                      {theme === 'light' && <Sun className="w-5 h-5" />}
                      {theme === 'dark' && <Moon className="w-5 h-5" />}
                      {theme === 'system' && <Monitor className="w-5 h-5" />}
                      <span className="text-xs">{tr[theme]}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">{tr.defaultView}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['month', 'week', 'agenda'].map(view => (
                    <button
                      key={view}
                      onClick={() => setSettings({ ...settings, defaultView: view })}
                      className={`px-3 py-2 rounded-lg font-medium transition ${
                        settings.defaultView === view 
                          ? 'bg-blue-600 text-white shadow' 
                          : settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'
                      }`}>
                      {tr[view + 'View']}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">📅 {tr.weekStartsOn}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSettings({ ...settings, weekStartsOn: 1 })}
                    className={`px-3 py-2 rounded-lg font-medium transition ${
                      settings.weekStartsOn === 1 
                        ? 'bg-blue-600 text-white shadow' 
                        : settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'
                    }`}>
                    {tr.monday}
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, weekStartsOn: 0 })}
                    className={`px-3 py-2 rounded-lg font-medium transition ${
                      settings.weekStartsOn === 0 
                        ? 'bg-blue-600 text-white shadow' 
                        : settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'
                    }`}>
                    {tr.sunday}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">📅 {tr.defaultCalendar}</label>
                <select value={settings.defaultCalendar} onChange={(e) => setSettings({ ...settings, defaultCalendar: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg font-medium`}>
                  {accounts.filter(a => a.active).map(acc => {
                    const displayName = acc.id === 1 ? (tr.localAccount || 'Locale') : acc.name;
                    return <option key={acc.id} value={acc.id}>{displayName}</option>;
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">🔔 {tr.notificationTime}</label>
                <select value={settings.defaultNotificationTime} onChange={(e) => setSettings({ ...settings, defaultNotificationTime: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg font-medium`}>
                  <option value="5">5 {tr.minutes}</option>
                  <option value="10">10 {tr.minutes}</option>
                  <option value="15">15 {tr.minutes}</option>
                  <option value="30">30 {tr.minutes}</option>
                  <option value="60">1 {settings.language === 'it' ? 'ora' : settings.language === 'es' ? 'hora' : 'hour'}</option>
                  <option value="1440">1 {settings.language === 'it' ? 'giorno' : settings.language === 'es' ? 'día' : 'day'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">📥📤 {tr.importICS} / {tr.exportICS}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportICS}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    {tr.exportICS}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    {tr.importICS}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ics,.ical"
                  onChange={handleImportICS}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">📱 Widget Android</label>
                <button
                  onClick={async () => {
                    try {
                      const result = await updateWidgetData(events);
                      if (result && result.success) {
                        alert(`✅ ${tr.widgetUpdated.replace('{count}', events.length)}`);
                      }
                    } catch (err) {
                      alert(`❌ ${tr.errorLabel} ${err.message}`);
                    }
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  {tr.syncWidget}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">❓ {tr.help}</label>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowHelp(true);
                  }}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  {tr.help}
                </button>
              </div>

              <div className={`${settings.theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-gray-800 border-gray-700'} rounded-lg p-4 border`}>
                <h3 className="font-semibold mb-3 text-lg">ℹ️ {settings.language === 'it' ? 'Informazioni' : settings.language === 'es' ? 'Información' : 'About'}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>{settings.language === 'it' ? 'Nome' : settings.language === 'es' ? 'Nombre' : 'Name'}:</span>
                    <span className="font-semibold">Calendar4JW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>{settings.language === 'it' ? 'Versione' : settings.language === 'es' ? 'Versión' : 'Version'}:</span>
                    <span className="font-semibold">1.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>{settings.language === 'it' ? 'Licenza' : settings.language === 'es' ? 'Licencia' : 'License'}:</span>
                    <span className="font-semibold">MIT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>{settings.language === 'it' ? 'Repository' : settings.language === 'es' ? 'Repositorio' : 'Repository'}:</span>
                    <a href="https://github.com/wampollini/Calendar4JW" target="_blank" rel="noopener noreferrer" 
                      className="font-semibold text-blue-500 hover:text-blue-600 transition">
                      GitHub
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`p-4 border-b ${borderClass} sticky top-0 ${cardBg}`}>
              <h3 className="text-xl font-semibold">{editingEvent ? `${tr.edit} ${tr.newEvent}` : tr.newEvent}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">📅 {tr.selectCalendar}</label>
                <select value={newEvent.accountId} onChange={(e) => setNewEvent({ ...newEvent, accountId: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg font-medium`}>
                  {accounts.map(acc => {
                    const displayName = acc.id === 1 ? (tr.localAccount || 'Locale') : acc.name;
                    return <option key={acc.id} value={acc.id}>{displayName}</option>;
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{tr.selectEventType}</label>
                <select value={newEvent.eventType} onChange={(e) => {
                  const type = e.target.value;
                  const template = eventTypeTemplates[type];
                  setNewEvent({ ...newEvent, eventType: type, title: template.title || newEvent.title });
                }} className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg font-medium`}>
                  <option value="regular">{tr.regularEvent}</option>
                  <option value="appointment">{tr.appointment}</option>
                  <option value="circuitAssembly">{tr.circuitAssembly}</option>
                  <option value="regionalConvention">{tr.regionalConvention}</option>
                  <option value="memorial">{tr.memorial}</option>
                  <option value="specialTalk">{tr.specialTalk}</option>
                  <option value="coVisit">{tr.coVisit}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">✏️ {tr.eventTitle}</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder={tr.eventTitle} 
                  className={`w-full px-4 py-4 ${cardBg} border-2 ${borderClass} rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-600/20 rounded-lg border border-blue-600/50">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <span>🌅</span> {tr.allDay}
                </label>
                <button
                  type="button"
                  onClick={() => setNewEvent({ ...newEvent, allDay: !newEvent.allDay, startTime: '', endTime: '' })}
                  className={`relative w-14 h-7 rounded-full transition ${
                    newEvent.allDay ? 'bg-blue-600' : settings.theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition transform ${
                    newEvent.allDay ? 'translate-x-7' : ''
                  }`} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">{tr.date}</label>
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{tr.endDate}</label>
                  <input type="date" value={newEvent.endDate} min={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    placeholder="Opzionale" className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                </div>
              </div>
              
              {!newEvent.allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">{tr.startTime}</label>
                    <input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{tr.endTime}</label>
                    <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">📍 {tr.location}</label>
                <div className="flex gap-2">
                  <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder={tr.location} className={`flex-1 px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                  {newEvent.location && (
                    <button type="button" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newEvent.location)}`, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      {tr.openInMaps}
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">🔔 {tr.notifyBefore}</label>
                <select value={newEvent.notifyBefore} onChange={(e) => setNewEvent({ ...newEvent, notifyBefore: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg font-medium`}>
                  <option value="5">5 {tr.minutes}</option>
                  <option value="10">10 {tr.minutes}</option>
                  <option value="15">15 {tr.minutes}</option>
                  <option value="30">30 {tr.minutes}</option>
                  <option value="60">1 {settings.language === 'it' ? 'ora' : settings.language === 'es' ? 'hora' : 'hour'}</option>
                  <option value="1440">1 {settings.language === 'it' ? 'giorno' : settings.language === 'es' ? 'día' : 'day'}</option>
                  <option value="10080">1 {tr.week}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">🔁 {tr.recurring}</label>
                <select value={newEvent.recurring} onChange={(e) => setNewEvent({ ...newEvent, recurring: e.target.value })}
                  className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg font-medium`}>
                  <option value="none">{tr.noRepeat}</option>
                  <option value="daily">{tr.daily}</option>
                  <option value="weekly">{tr.weekly}</option>
                  <option value="monthly">{tr.monthly}</option>
                  <option value="yearly">{tr.yearly}</option>
                </select>
              </div>
              
              {newEvent.recurring !== 'none' && (
                <div>
                  <label className="block text-sm font-medium mb-2">🔢 Ogni {newEvent.recurringInterval || 1} {
                    newEvent.recurring === 'daily' ? (settings.language === 'it' ? 'giorni' : settings.language === 'es' ? 'días' : 'days') :
                    newEvent.recurring === 'weekly' ? (settings.language === 'it' ? 'settimane' : settings.language === 'es' ? 'semanas' : 'weeks') :
                    newEvent.recurring === 'monthly' ? (settings.language === 'it' ? 'mesi' : settings.language === 'es' ? 'meses' : 'months') :
                    newEvent.recurring === 'yearly' ? (settings.language === 'it' ? 'anni' : settings.language === 'es' ? 'años' : 'years') : ''
                  }</label>
                  <input type="number" min="1" max="99" value={newEvent.recurringInterval || 1} 
                    onChange={(e) => setNewEvent({ ...newEvent, recurringInterval: parseInt(e.target.value) || 1 })}
                    className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                </div>
              )}
              
              {newEvent.recurring !== 'none' && (
                <div>
                  <label className="block text-sm font-medium mb-2">📅 Fine ricorrenza</label>
                  <input type="date" value={newEvent.recurringEndDate} onChange={(e) => setNewEvent({ ...newEvent, recurringEndDate: e.target.value })}
                    placeholder="Opzionale" className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">📝 {tr.description}</label>
                <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder={`${tr.description} (testo semplice o HTML)`} rows="3" className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}></textarea>
                {newEvent.description && isHTML(newEvent.description) && (
                  <div className="mt-2 p-2 bg-green-600/20 border border-green-600 rounded text-xs">
                    ✓ HTML rilevato - verrà renderizzato con formattazione
                  </div>
                )}
              </div>
              
              {/* ALLEGATI TEMPORANEAMENTE DISABILITATI - CAUSANO CRASH
              <div>
                <label className="block text-sm font-medium mb-2">📎 {tr.attachments}</label>
                <input type="file" onChange={handleFileAttach} className="hidden" id="file-input" />
                <button type="button" onClick={() => document.getElementById('file-input').click()}
                  className={`w-full px-3 py-3 border-2 border-dashed ${borderClass} rounded-lg flex items-center justify-center gap-2 hover:border-blue-500 transition`}>
                  <Paperclip className="w-4 h-4" />
                  {tr.addAttachment}
                </button>
                {newEvent.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newEvent.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg shadow">
                        <Paperclip className="w-3 h-3" />
                        <span className="text-sm">{att.name}</span>
                        <button type="button" onClick={() => setNewEvent({ ...newEvent, attachments: newEvent.attachments.filter((_, idx) => idx !== i) })}>
                          <X className="w-4 h-4 hover:text-red-300" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              */}
            </div>
            <div className="flex gap-3 p-4 border-t ${borderClass}">
              <button onClick={() => { setShowEventModal(false); setEditingEvent(null); setNewEvent({ title: '', date: '', endDate: '', startTime: '', endTime: '', location: '', description: '', accountId: settings.defaultCalendar, eventType: 'regular', attachments: [], notifyBefore: settings.defaultNotificationTime, recurring: 'none', recurringEndDate: '', recurringInterval: 1, allDay: false }); }} 
                className={`flex-1 px-4 py-3 ${settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} rounded-lg font-medium transition`}>
                {tr.cancel}
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow">
                {tr.save}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showCaldavModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`p-4 border-b ${borderClass} sticky top-0 ${cardBg} flex items-center justify-between`}>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-500" />
                {caldavStep === 'form' ? tr.caldavConnect : 'Seleziona Calendari'}
              </h3>
              <button onClick={() => { 
                setShowCaldavModal(false); 
                setCaldavForm({ serverUrl: '', username: '', password: '', accountName: '' });
                setCaldavStep('form');
                setCaldavCalendars([]);
              }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {caldavStep === 'form' ? (
              <>
                <div className="p-4 space-y-4">
                  <div className={`p-3 ${settings.theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/30 border-blue-700'} border rounded-lg text-sm`}>
                    💡 Per Nextcloud: <code className="font-mono">https://tuoserver.com</code>
                  </div>
                  
                  <button
                    onClick={startQRScan}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition shadow flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5" />
                    {tr.scanQR}
                  </button>
                  
                  <div className="text-center text-sm text-gray-500">
                    {tr.orManual}
                  </div>
                  
                  <input type="text" value={caldavForm.accountName} 
                    onChange={(e) => setCaldavForm({ ...caldavForm, accountName: e.target.value })}
                    placeholder={tr.caldavAccountName} 
                    className={`w-full px-3 py-3 ${cardBg} border ${borderClass} rounded-lg font-medium focus:ring-2 focus:ring-purple-500 outline-none`} />
                  <input type="url" value={caldavForm.serverUrl} 
                    onChange={(e) => setCaldavForm({ ...caldavForm, serverUrl: e.target.value })}
                    placeholder={tr.caldavServerUrl} 
                    className={`w-full px-3 py-3 ${cardBg} border ${borderClass} rounded-lg font-medium focus:ring-2 focus:ring-purple-500 outline-none`} />
                  <input type="text" value={caldavForm.username} 
                    onChange={(e) => setCaldavForm({ ...caldavForm, username: e.target.value })}
                    placeholder={tr.caldavUsername} 
                    className={`w-full px-3 py-3 ${cardBg} border ${borderClass} rounded-lg font-medium focus:ring-2 focus:ring-purple-500 outline-none`} />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={caldavForm.password} 
                      onChange={(e) => setCaldavForm({ ...caldavForm, password: e.target.value })}
                      placeholder={tr.caldavPassword} 
                      className={`w-full px-3 py-3 pr-12 ${cardBg} border ${borderClass} rounded-lg font-medium focus:ring-2 focus:ring-purple-500 outline-none`} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 p-4 border-t ${borderClass}">
                  <button onClick={() => { 
                    setShowCaldavModal(false); 
                    setCaldavForm({ serverUrl: '', username: '', password: '', accountName: '' }); 
                  }}
                    className={`flex-1 px-4 py-3 ${settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} rounded-lg font-medium transition`}>
                    {tr.cancel}
                  </button>
                  <button onClick={connectCaldav} disabled={caldavConnecting}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition shadow disabled:opacity-50">
                    {caldavConnecting ? 'Connessione...' : 'Connetti'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 space-y-3">
                  <p className={`text-sm ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    Seleziona i calendari da sincronizzare:
                  </p>
                  {caldavCalendars.map(cal => (
                    <div key={cal.url} 
                      className={`p-3 ${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg flex items-center gap-3`}>
                      <input 
                        type="checkbox"
                        checked={selectedCaldavCalendars.includes(cal.url)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCaldavCalendars([...selectedCaldavCalendars, cal.url]);
                          } else {
                            setSelectedCaldavCalendars(selectedCaldavCalendars.filter(url => url !== cal.url));
                          }
                        }}
                        className="w-5 h-5 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cal.color }}></div>
                          {cal.displayName}
                        </div>
                        {cal.description && (
                          <div className={`text-sm ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {cal.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 p-4 border-t ${borderClass}">
                  <button onClick={() => setCaldavStep('form')}
                    className={`flex-1 px-4 py-3 ${settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} rounded-lg font-medium transition`}>
                    Indietro
                  </button>
                  <button onClick={finishCaldavSetup}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition shadow">
                    Sincronizza ({selectedCaldavCalendars.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-[60]">
          <div className={`${cardBg} rounded-lg w-[90%] max-w-md p-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <QrCode className="w-6 h-6" />
                {tr.scanQR}
              </h3>
              <button onClick={stopQRScan}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
            <button
              onClick={stopQRScan}
              className="w-full mt-4 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
              {tr.cancel}
            </button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-[60]">
          <div className={`${cardBg} rounded-t-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`p-4 border-b ${borderClass} flex items-center justify-between sticky top-0 ${cardBg}`}>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                {tr.help}
              </h3>
              <button onClick={() => setShowHelp(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              {helpContent[settings.language].sections.map((section, index) => (
                <div key={index} className={`p-4 ${settings.theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'} rounded-lg`}>
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-2xl">{section.icon}</span>
                    {section.title}
                  </h4>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-[70]">
          <div className={`${cardBg} rounded-t-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`p-4 border-b ${borderClass} sticky top-0 ${cardBg} flex items-center justify-between`}>
              <h3 className="text-xl font-semibold">{tr.viewDetails}</h3>
              <button onClick={() => setViewingEvent(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">{tr.eventTitle}</div>
                <div className={`text-lg font-semibold ${settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{viewingEvent.title}</div>
              </div>
              {viewingEvent.date && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.date}</div>
                  <div className={`font-medium ${settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{viewingEvent.date}</div>
                </div>
              )}
              {(viewingEvent.startTime || viewingEvent.endTime) && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.startTime} - {tr.endTime}</div>
                  <div className={`font-medium ${settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{viewingEvent.startTime} - {viewingEvent.endTime}</div>
                </div>
              )}
              {viewingEvent.location && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.location}</div>
                  <div className={`font-medium mb-2 ${settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>📍 {viewingEvent.location}</div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(viewingEvent.location)}`, '_blank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {tr.openInMaps}
                  </button>
                </div>
              )}
              {viewingEvent.description && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.description}</div>
                  {renderDescription(viewingEvent.description)}
                </div>
              )}
              {viewingEvent.recurring && viewingEvent.recurring !== 'none' && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.recurring}</div>
                  <div className="font-medium">
                    {viewingEvent.recurring === 'daily' && tr.daily}
                    {viewingEvent.recurring === 'weekly' && tr.weekly}
                    {viewingEvent.recurring === 'monthly' && tr.monthly}
                    {viewingEvent.recurring === 'yearly' && tr.yearly}
                    {viewingEvent.recurringEndDate && ` (fino al ${viewingEvent.recurringEndDate})`}
                  </div>
                </div>
              )}
              {viewingEvent.accountId && (() => {
                const account = accounts.find(a => a.id === viewingEvent.accountId);
                const displayName = account 
                  ? (account.id === 1 ? (tr.localAccount || 'Locale') : account.name)
                  : 'Account sconosciuto';
                
                return (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">{tr.account}</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: account?.color || '#64748b' }}
                      ></div>
                      <span className={`font-medium ${settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        {displayName}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="flex gap-3 p-4 border-t ${borderClass}">
              <button 
                onClick={() => { setViewingEvent(null); handleDelete(viewingEvent.id); }} 
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow"
              >
                {tr.delete}
              </button>
              <button 
                onClick={() => handleEdit(viewingEvent)} 
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow"
              >
                {tr.edit}
              </button>
            </div>
          </div>
        </div>
      )}

      {serviceModal}

      {/* Footer con link Privacy Policy e Terms */}
      <div className={`fixed bottom-0 left-0 right-0 ${settings.theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-gray-800 border-gray-700'} border-t py-1 px-2 text-center text-[10px] ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'} z-10`}>
        <div className="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
          <span>Calendar4JW v1.1</span>
          <span>•</span>
          <a 
            href="https://wahost.eu/privacy-policy.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 underline"
          >
            Privacy Policy
          </a>
          <span>•</span>
          <a 
            href="https://wahost.eu/terms-of-service.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 underline"
          >
            Terms of Service
          </a>
          <span>•</span>
          <a 
            href="https://github.com/wampollini/Calendar4JW" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;