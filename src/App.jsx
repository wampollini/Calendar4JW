import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Trash2, Edit2, Cloud, CloudOff, RefreshCw, Menu, X, Search, Clock, Share2, Paperclip, Sun, Moon, Monitor, Download, Upload, Eye, EyeOff, HelpCircle, QrCode } from 'lucide-react';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Preferences } from '@capacitor/preferences';
import { connectCalDAV, syncCalDAVEvents, getCalDAVAccounts, disconnectCalDAV, createCalDAVEvent, deleteCalDAVEvent } from './lib/caldavSync';
import { exportEventsToICS, downloadICS, readICSFile } from './lib/icsUtils';
import { Html5Qrcode } from 'html5-qrcode';
import { helpContent } from './helpContent';
import { updateWidgetData } from './lib/widgetSync';
import { scheduleEventNotification, cancelEventNotification, updateAllNotifications, requestNotificationPermissions } from './lib/notifications';

const t = {
  it: { 
    title: 'Calendar4jw', today: 'Oggi', newEvent: 'Nuovo', accounts: 'Account', 
    save: 'Salva', cancel: 'Annulla', delete: 'Elimina', edit: 'Modifica', 
    noEvents: 'Nessun evento', monthView: 'Mese', weekView: 'Settimana', agendaView: 'Agenda',
    eventTitle: 'Titolo', date: 'Data', endDate: 'Data fine', startTime: 'Inizio', endTime: 'Fine',
    location: 'Luogo', description: 'Descrizione', confirmDelete: 'Eliminare questo evento?',
    regularEvent: 'Normale', circuitAssembly: 'Assemblea', regionalConvention: 'Congresso',
    memorial: 'Commemorazione', specialTalk: 'Discorso Speciale', coVisit: 'Visita CO',
    selectEventType: 'Tipo evento', selectCalendar: 'Calendario',
    caldavConnect: 'CalDAV', caldavServerUrl: 'URL Server', caldavUsername: 'Username',
    caldavPassword: 'Password', caldavAccountName: 'Nome Account',
    settings: 'Impostazioni', language: 'Lingua', theme: 'Tema', defaultView: 'Vista predefinita',
    defaultCalendar: 'Calendario predefinito', notificationTime: 'Tempo notifica predefinito',
    permissions: 'Permessi', searchEvents: 'Cerca eventi', serviceHours: 'Ore servizio',
    hours: 'Ore', visits: 'SB', addServiceHours: 'Aggiungi ore servizio',
    monthTotal: 'Totale mese', total: 'Totale', share: 'Condividi', attachments: 'Allegati',
    allDay: 'Tutto il giorno',
    addAttachment: 'Aggiungi allegato', changeColor: 'Cambia colore', openInMaps: 'Apri in Mappe',
    notifyBefore: 'Notifica prima', minutes: 'minuti', days: 'giorni', week: 'settimana',
    viewDetails: 'Dettagli', close: 'Chiudi',
    recurring: 'Ricorrente', noRepeat: 'Mai', daily: 'Giornaliero', weekly: 'Settimanale', monthly: 'Mensile', yearly: 'Annuale',
    days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'], 
    months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    light: 'Chiaro', dark: 'Scuro', system: 'Sistema',
    weekStartsOn: 'Inizio settimana', monday: 'Lunedì', sunday: 'Domenica',
    exportICS: 'Esporta ICS', importICS: 'Importa ICS', exportAllEvents: 'Esporta tutti gli eventi', importFromFile: 'Importa da file',
    importSuccess: 'eventi importati con successo', importError: 'Errore importazione file',
    qrScanSuccess: 'QR scansionato! Verifica i dati e tocca Connetti.',
    qrScanError: 'Errore scansione QR. Riprova o inserisci manualmente.',
    qrScanCancelled: 'Scansione annullata'
  },
  es: {
    title: 'Calendar4jw', today: 'Hoy', newEvent: 'Nuevo', accounts: 'Cuentas',
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar',
    noEvents: 'Sin eventos', monthView: 'Mes', weekView: 'Semana', agendaView: 'Agenda',
    eventTitle: 'Título', date: 'Fecha', endDate: 'Fecha fin', startTime: 'Inicio', endTime: 'Fin',
    location: 'Ubicación', description: 'Descripción', confirmDelete: '¿Eliminar evento?',
    regularEvent: 'Normal', circuitAssembly: 'Asamblea', regionalConvention: 'Congreso',
    memorial: 'Conmemoración', specialTalk: 'Discurso', coVisit: 'Visita SC',
    selectEventType: 'Tipo', selectCalendar: 'Calendario',
    caldavConnect: 'CalDAV', caldavServerUrl: 'URL', caldavUsername: 'Usuario',
    caldavPassword: 'Contraseña', caldavAccountName: 'Nombre',
    settings: 'Ajustes', language: 'Idioma', theme: 'Tema', defaultView: 'Vista predeterminada',
    defaultCalendar: 'Calendario predeterminado', notificationTime: 'Tiempo de notificación',
    permissions: 'Permisos', searchEvents: 'Buscar eventos', serviceHours: 'Horas servicio',
    hours: 'Horas', visits: 'CB', addServiceHours: 'Añadir horas', 
    monthTotal: 'Total mes', total: 'Total', share: 'Compartir', attachments: 'Adjuntos',
    allDay: 'Todo el día',
    addAttachment: 'Añadir adjunto', changeColor: 'Cambiar color', openInMaps: 'Abrir en Mapas',
    notifyBefore: 'Notificar antes', minutes: 'minutos', days: 'días', week: 'semana',
    viewDetails: 'Detalles', close: 'Cerrar',
    recurring: 'Recurrente', noRepeat: 'Nunca', daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual',
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    light: 'Claro', dark: 'Oscuro', system: 'Sistema',
    weekStartsOn: 'Inicio semana', monday: 'Lunes', sunday: 'Domingo',
    exportICS: 'Exportar ICS', importICS: 'Importar ICS', exportAllEvents: 'Exportar todos los eventos', importFromFile: 'Importar desde archivo',
    importSuccess: 'eventos importados correctamente', importError: 'Error al importar archivo',
    qrScanSuccess: '¡QR escaneado! Verifica los datos y toca Conectar.',
    qrScanError: 'Error al escanear QR. Intenta de nuevo o introduce manualmente.',
    qrScanCancelled: 'Escaneo cancelado'
  },
  en: {
    title: 'Calendar4jw', today: 'Today', newEvent: 'New', accounts: 'Accounts',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    noEvents: 'No events', monthView: 'Month', weekView: 'Week', agendaView: 'Agenda',
    eventTitle: 'Title', date: 'Date', endDate: 'End date', startTime: 'Start', endTime: 'End',
    location: 'Location', description: 'Description', confirmDelete: 'Delete event?',
    regularEvent: 'Regular', circuitAssembly: 'Assembly', regionalConvention: 'Convention',
    memorial: 'Memorial', specialTalk: 'Special Talk', coVisit: 'CO Visit',
    selectEventType: 'Type', selectCalendar: 'Calendar',
    caldavConnect: 'CalDAV', caldavServerUrl: 'Server URL', caldavUsername: 'Username',
    caldavPassword: 'Password', caldavAccountName: 'Account Name',
    settings: 'Settings', language: 'Language', theme: 'Theme', defaultView: 'Default view',
    defaultCalendar: 'Default calendar', notificationTime: 'Default notification time',
    permissions: 'Permissions', searchEvents: 'Search events', serviceHours: 'Service hours',
    hours: 'Hours', visits: 'BS', addServiceHours: 'Add service hours',
    monthTotal: 'Month total', total: 'Total', share: 'Share', attachments: 'Attachments',
    allDay: 'All day',
    addAttachment: 'Add attachment', changeColor: 'Change color', openInMaps: 'Open in Maps',
    notifyBefore: 'Notify before', minutes: 'minutes', days: 'days', week: 'week',
    viewDetails: 'Details', close: 'Close',
    recurring: 'Recurring', noRepeat: 'Never', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    light: 'Light', dark: 'Dark', system: 'System',
    weekStartsOn: 'Week starts on', monday: 'Monday', sunday: 'Sunday',
    exportICS: 'Export ICS', importICS: 'Import ICS', exportAllEvents: 'Export all events', importFromFile: 'Import from file',
    importSuccess: 'events imported successfully', importError: 'Error importing file',
    qrScanSuccess: 'QR scanned! Verify data and tap Connect.',
    qrScanError: 'QR scan error. Try again or enter manually.',
    qrScanCancelled: 'Scan cancelled'
  }
};

const CalendarApp = () => {
  const [language, setLanguage] = useState('it');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showDayView, setShowDayView] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
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
    weekStartsOn: 1  // 0 = domenica, 1 = lunedì
  });
  
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', endDate: '', startTime: '', endTime: '', location: '', description: '', 
    accountId: 1, eventType: 'regular', attachments: [], notifyBefore: 15, 
    recurring: 'none', recurringEndDate: '', recurringInterval: 1, allDay: false
  });

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Google', color: '#4285f4', active: true }
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

  const tr = t[language];

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
        totalHours += serviceHours[dateKey].hours || 0;
        totalVisits += serviceHours[dateKey].visits || 0;
      }
    });
    
    return { hours: totalHours, visits: totalVisits };
  };

  const syncGoogle = async () => {
    setSyncing(true);
    try {
      // Controlla se c'è già un account Google connesso con token salvato
      const savedAccounts = localStorage.getItem('calendar4jw_accounts');
      const allAccounts = savedAccounts ? JSON.parse(savedAccounts) : accounts;
      const existingGoogleAccount = allAccounts.find(a => a.name.startsWith('Google') && a.connected);
      
      let accessToken = null;
      let userEmail = null;
      
      if (existingGoogleAccount) {
        // Prova a usare il token esistente
        const savedToken = localStorage.getItem(`calendar4jw_google_token_${existingGoogleAccount.id}`);
        const savedEmail = localStorage.getItem(`calendar4jw_google_user_${existingGoogleAccount.id}`);
        
        if (savedToken && savedEmail) {
          console.log('[Google] Using existing token for:', savedEmail);
          accessToken = savedToken;
          userEmail = savedEmail;
        }
      }
      
      // Se non c'è un token salvato, fai il login
      if (!accessToken) {
        console.log('[Google] Starting sign in...');
        const user = await GoogleAuth.signIn();
        console.log('[Google] Sign in result:', user);
        
        if (!user || !user.authentication || !user.authentication.accessToken) {
          console.error('[Google] No access token received');
          throw new Error('Autenticazione fallita');
        }
        
        accessToken = user.authentication.accessToken;
        userEmail = user.email;
        console.log('[Google] Signed in as:', userEmail);
      }
      
      // Trova o crea account Google
      const existingAccount = allAccounts.find(a => a.email === userEmail && a.name.startsWith('Google'));
      
      // Il primo account Google ha sempre ID 1
      const googleAccountId = existingAccount ? existingAccount.id : (
        allAccounts.some(a => a.id === 1) 
          ? Math.max(1, ...allAccounts.filter(a => a.name.startsWith('Google')).map(a => a.id), 0) + 1
          : 1
      );
      
      // Fetch eventi da Google Calendar (ultimi 6 mesi e prossimi 12 mesi)
      const timeMin = new Date();
      timeMin.setMonth(timeMin.getMonth() - 6);
      const timeMax = new Date();
      timeMax.setMonth(timeMax.getMonth() + 12);
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`;
      
      let res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Se il token è scaduto (401), prova a fare refresh automatico
      if (res.status === 401) {
        console.warn('[Google] Token scaduto durante sync, tento refresh...');
        try {
          const user = await GoogleAuth.signIn();
          if (user && user.authentication && user.authentication.accessToken) {
            accessToken = user.authentication.accessToken;
            userEmail = user.email;
            localStorage.setItem(`calendar4jw_google_token_${googleAccountId}`, accessToken);
            console.log('[Google] Token refreshed successfully');
            
            // Riprova la richiesta con il nuovo token
            res = await fetch(url, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
          } else {
            throw new Error('Refresh token fallito');
          }
        } catch (refreshErr) {
          console.error('[Google] Refresh fallito:', refreshErr);
          // Rimuovi token invalido e disconnetti account
          if (existingGoogleAccount) {
            localStorage.removeItem(`calendar4jw_google_token_${existingGoogleAccount.id}`);
            setAccounts(prev => prev.map(acc =>
              acc.id === existingGoogleAccount.id ? { ...acc, connected: false } : acc
            ));
          }
          throw new Error('Sessione Google scaduta. Effettua nuovamente il login dal menu Impostazioni.');
        }
      }
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (data.items) {
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
        }
        
        localStorage.setItem(`calendar4jw_google_token_${googleAccountId}`, accessToken);
        localStorage.setItem(`calendar4jw_google_user_${googleAccountId}`, userEmail);
        setGoogleUserId(userEmail); // Imposta lo stato per mostrare i pulsanti
        
        // Mantieni il calendario predefinito corrente (non cambiare automaticamente)
        // L'utente può cambiarlo manualmente dalle impostazioni se vuole
        
        alert(`✅ ${googleEvents.length} eventi sincronizzati per ${userEmail}!`);
      }
    } catch (err) {
      console.error('[Google] Error during sync:', err);
      console.error('[Google] Error stack:', err.stack);
      alert('❌ Errore sync: ' + (err.message || JSON.stringify(err)));
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
    
    if (!window.confirm(`Disconnettere ${account.name}? Gli eventi sincronizzati verranno rimossi.`)) return;
    
    // Rimuovi token ed eventi per questo account specifico
    localStorage.removeItem(`calendar4jw_google_token_${accountId}`);
    localStorage.removeItem(`calendar4jw_google_user_${accountId}`);
    setEvents(prev => prev.filter(e => e.accountId !== accountId));
    
    // Rimuovi solo questo account
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    
    // Aggiorna googleUserId solo se non ci sono più account Google
    const remainingGoogleAccounts = accounts.filter(a => a.name.startsWith('Google') && a.id !== accountId);
    if (remainingGoogleAccounts.length === 0) {
      setGoogleUserId(null);
      localStorage.removeItem('calendar4jw_google_user');
    }
    
    alert(`✅ ${account.name} disconnesso`);
  };

  const addGoogleAccount = async () => {
    await syncGoogle();
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('calendar4jw_settings');
    if (savedSettings) {
      const loaded = JSON.parse(savedSettings);
      // Se defaultCalendar è 2 o 3 (Microsoft rimosso), resetta a 1 (Google)
      if (loaded.defaultCalendar === 2 || loaded.defaultCalendar === 3) {
        loaded.defaultCalendar = 1;
      }
      setSettings(loaded);
      setViewMode(loaded.defaultView || 'month');
    }
    
    const savedHours = localStorage.getItem('calendar4jw_service_hours');
    if (savedHours) setServiceHours(JSON.parse(savedHours));
    
    // Carica accounts salvati (Google + CalDAV)
    const savedAccounts = localStorage.getItem('calendar4jw_accounts');
    if (savedAccounts) {
      try {
        const loadedAccounts = JSON.parse(savedAccounts);
        // Filtra eventuali account Google generici senza email
        const validAccounts = loadedAccounts.filter(acc => 
          !acc.name.startsWith('Google') || acc.email
        );
        setAccounts(validAccounts);
      } catch (e) {
        console.error('[App] Error loading accounts:', e);
        setAccounts([]);
      }
    } else {
      setAccounts([]);
    }
    
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
    GoogleAuth.initialize({
      clientId: '278165724364-f67mcfiuh61qgmjn4qkoiq79q95c7phs.apps.googleusercontent.com',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
      grantOfflineAccess: true
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
    localStorage.setItem('calendar4jw_settings', JSON.stringify(settings));
  }, [settings]);

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
      const dayService = serviceHours[dateKey] || { hours: 0, visits: 0 };
      const hasServiceHours = dayService.hours > 0 || dayService.visits > 0;
      
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
              <div className="w-2 h-2 bg-green-500 rounded-full" title={`${dayService.hours}h, ${dayService.visits} ${tr.visits}`}></div>
            )}
          </div>
          {dayEvents.slice(0, 3).map(e => (
            <div key={e.id} className="text-[9px] px-1 rounded truncate mt-0.5"
              style={{ backgroundColor: accounts.find(a => a.id === e.accountId)?.color, color: 'white' }}>
              {e.title}
            </div>
          ))}
          {isLastDay && monthTotal && (monthTotal.hours > 0 || monthTotal.visits > 0) && (
            <div className="text-[10px] mt-1 p-1 bg-green-600 text-white rounded font-bold">
              📊 {monthTotal.hours}h • {monthTotal.visits} {tr.visits}
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
      alert('⚠️ Seleziona un calendario valido (Google o CalDAV)');
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
            // Token scaduto - prova a ottenere un nuovo token
            console.warn('⚠️ Token Google scaduto, tento refresh automatico...');
            try {
              const user = await GoogleAuth.signIn();
              if (user && user.authentication && user.authentication.accessToken) {
                const newToken = user.authentication.accessToken;
                localStorage.setItem(`calendar4jw_google_token_${selectedAccount.id}`, newToken);
                
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
              } else {
                throw new Error('Refresh token fallito');
              }
            } catch (refreshErr) {
              console.error('❌ Refresh token fallito:', refreshErr);
              alert('⚠️ Sessione Google scaduta. Effettua nuovamente il login dal menu Impostazioni.');
              localStorage.removeItem(`calendar4jw_google_token_${selectedAccount.id}`);
              setAccounts(prev => prev.map(acc => 
                acc.id === selectedAccount.id ? { ...acc, connected: false } : acc
              ));
            }
          } else {
            const errorText = await res.text();
            console.error('❌ Errore HTTP Google:', { status: res.status, statusText: res.statusText, body: errorText });
            alert(`⚠️ Errore nel salvataggio su Google Calendar: ${res.status} ${res.statusText}`);
          }
        } else {
          alert('⚠️ Token Google non trovato. Effettua il login.');
        }
      } catch (err) {
        console.error('Errore salvataggio Google:', err);
        alert('⚠️ Errore nel salvataggio su Google Calendar: ' + err.message);
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
                alert('⚠️ Errore nel salvataggio su CalDAV: ' + result.error);
              }
          } else {
            console.error('[handleSave] Account JSON non trovato');
            alert('⚠️ Dati account CalDAV non trovati. Riconfigura l\'account.');
          }
        } else {
          console.error('[handleSave] Account CalDAV non trovato in Preferences');
          alert('⚠️ Account CalDAV non trovato. Riconfigura l\'account.');
        }
      } catch (err) {
        console.error('Errore salvataggio CalDAV:', err);
        alert('⚠️ Errore nel salvataggio su CalDAV: ' + err.message);
      }
    }
    
    // Avvisa se non salvato sul cloud, ma procedi comunque con salvataggio locale
    if (!savedToCloud) {
      console.log('⚠️ Evento non salvato sul cloud, ma salvo localmente');
      // Mostra avviso ma non blocca il salvataggio locale
      alert('⚠️ Evento salvato solo localmente. Errore sincronizzazione con il cloud.');
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
      alert('📋 Evento copiato!');
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
    const hours = parseFloat(document.getElementById('service-hours').value) || 0;
    const visits = parseInt(document.getElementById('service-visits').value) || 0;
    
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
      alert('Compila tutti i campi');
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
      alert('❌ Errore connessione CalDAV: ' + err.message);
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
        alert(`✅ ${result.events.length} eventi sincronizzati da ${result.calendarsCount} calendari!`);
      } else {
        console.error('[App] Errore sincronizzazione:', result.error);
        setSyncMessage('❌ Errore sincronizzazione');
        setTimeout(() => setSyncMessage(''), 3000);
        alert(`❌ ${result.error || 'Errore sconosciuto durante la sincronizzazione'}`);
      }
    } catch (err) {
      console.error('[App] Eccezione durante sincronizzazione:', err);
      setSyncMessage('❌ Errore sincronizzazione');
      setTimeout(() => setSyncMessage(''), 3000);
      alert('❌ Errore sync: ' + (err.message || err.toString() || 'Errore sconosciuto'));
    } finally {
      setSyncing(false);
    }
  };

  const bgClass = settings.theme === 'light' ? 'bg-gray-50' : 'bg-gray-900';
  const textClass = settings.theme === 'light' ? 'text-gray-900' : 'text-white';
  const cardBg = settings.theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const borderClass = settings.theme === 'light' ? 'border-gray-300' : 'border-gray-700';

  if (showDayView && selectedDate) {
    const dayEvents = getEventsForDate(selectedDate);
    const dateKey = formatDate(selectedDate);
    const dayService = serviceHours[dateKey] || { hours: 0, visits: 0 };
    
    return (
      <div className={`min-h-screen ${bgClass} ${textClass}`}>
        <div className={`${cardBg} p-4 flex items-center justify-between border-b ${borderClass} sticky top-0 z-10`}>
          <button onClick={() => setShowDayView(false)}><ChevronLeft className="w-6 h-6" /></button>
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
        
        {(dayService.hours > 0 || dayService.visits > 0) && (
          <div className="p-4 bg-gradient-to-r from-green-600 to-green-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{tr.serviceHours}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-4">
                  <div><span className="font-bold text-lg">{dayService.hours}</span> {tr.hours}</div>
                  <div><span className="font-bold text-lg">{dayService.visits}</span> {tr.visits}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelectedServiceDate(selectedDate); setShowServiceModal(true); }}
                    className="p-1.5 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { 
                    if (window.confirm(tr.confirmDelete || 'Eliminare le ore di servizio?')) {
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

        {showServiceModal && selectedServiceDate && (() => {
          const monthKey = `${selectedServiceDate.getFullYear()}-${String(selectedServiceDate.getMonth() + 1).padStart(2, '0')}`;
          const monthHours = Object.keys(serviceHours)
            .filter(k => k.startsWith(monthKey))
            .reduce((sum, k) => sum + (serviceHours[k].hours || 0), 0);
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
                        <span className="text-lg font-bold">{monthHours}</span>
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
                  <label className="block text-sm font-medium mb-2">⏰ {tr.hours}</label>
                  <input
                    id="service-hours"
                    type="number"
                    step="0.5"
                    min="0"
                    defaultValue={serviceHours[formatDate(selectedServiceDate)]?.hours || 0}
                    className={`w-full px-4 py-3 ${cardBg} border ${borderClass} rounded-lg text-lg font-semibold focus:ring-2 focus:ring-green-500 outline-none`}
                  />
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
        })()}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} relative`}>
      {syncMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] animate-fade-in">
          <div className={`${cardBg} px-6 py-3 rounded-lg shadow-2xl border ${borderClass} flex items-center gap-2`}>
            <span className="text-sm font-medium">{syncMessage}</span>
          </div>
        </div>
      )}
      
      <div className={`${cardBg} p-4 sticky top-0 z-10 border-b ${borderClass} shadow-sm`}>
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
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => { 
                        await syncGoogle(); 
                        setShowSystemMenu(false); 
                      }}
                        disabled={syncing}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        Sincronizza
                      </button>
                      <button onClick={async () => {
                        await disconnectGoogle(acc.id);
                        setShowSystemMenu(false);
                      }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center justify-center gap-1">
                        <X className="w-4 h-4" />
                        Disconnetti
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={addGoogleAccount}
                  disabled={syncing}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Aggiungi Account Google
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
                          {acc.calendarsCount} calendari
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
                          Sincronizza
                        </button>
                        <button onClick={async () => {
                          if (window.confirm('Disconnettere questo account CalDAV?')) {
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
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setShowCaldavModal(true); setShowSystemMenu(false); }}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm">
                    + Aggiungi Account
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowCaldavModal(true); setShowSystemMenu(false); }}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Connetti</button>
              )}
            </div>

            <div className={`${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4`}>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>🎨</span> {tr.changeColor}
              </h4>
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between mb-3 last:mb-0">
                  <span className="text-sm font-medium">{acc.name}</span>
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
              ))}
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
                      onClick={() => setLanguage(lang)}
                      className={`px-4 py-3 rounded-lg font-bold text-lg transition ${
                        language === lang 
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
                  {accounts.filter(a => a.active).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
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
                  <option value="60">1 {language === 'it' ? 'ora' : language === 'es' ? 'hora' : 'hour'}</option>
                  <option value="1440">1 {language === 'it' ? 'giorno' : language === 'es' ? 'día' : 'day'}</option>
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
                        alert('✅ Widget aggiornato con ' + events.length + ' eventi');
                      }
                    } catch (err) {
                      alert('❌ Errore: ' + err.message);
                    }
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Sincronizza Widget
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
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
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
                  <option value="60">1 {language === 'it' ? 'ora' : language === 'es' ? 'hora' : 'hour'}</option>
                  <option value="1440">1 {language === 'it' ? 'giorno' : language === 'es' ? 'día' : 'day'}</option>
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
                    newEvent.recurring === 'daily' ? (language === 'it' ? 'giorni' : language === 'es' ? 'días' : 'days') :
                    newEvent.recurring === 'weekly' ? (language === 'it' ? 'settimane' : language === 'es' ? 'semanas' : 'weeks') :
                    newEvent.recurring === 'monthly' ? (language === 'it' ? 'mesi' : language === 'es' ? 'meses' : 'months') :
                    newEvent.recurring === 'yearly' ? (language === 'it' ? 'anni' : language === 'es' ? 'años' : 'years') : ''
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
              {helpContent[language].sections.map((section, index) => (
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
                <div className="text-lg font-semibold">{viewingEvent.title}</div>
              </div>
              {viewingEvent.date && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.date}</div>
                  <div className="font-medium">{viewingEvent.date}</div>
                </div>
              )}
              {(viewingEvent.startTime || viewingEvent.endTime) && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.startTime} - {tr.endTime}</div>
                  <div className="font-medium">{viewingEvent.startTime} - {viewingEvent.endTime}</div>
                </div>
              )}
              {viewingEvent.location && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.location}</div>
                  <div className="font-medium mb-2">📍 {viewingEvent.location}</div>
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
              {viewingEvent.accountId && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">{tr.account}</div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: accounts.find(a => a.id === viewingEvent.accountId)?.color }}
                    ></div>
                    <div className="font-medium">{accounts.find(a => a.id === viewingEvent.accountId)?.name}</div>
                  </div>
                </div>
              )}
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

      {showServiceModal && selectedServiceDate && (() => {
        const monthKey = `${selectedServiceDate.getFullYear()}-${String(selectedServiceDate.getMonth() + 1).padStart(2, '0')}`;
        const monthHours = Object.keys(serviceHours)
          .filter(k => k.startsWith(monthKey))
          .reduce((sum, k) => sum + (serviceHours[k].hours || 0), 0);
        const monthVisits = Object.keys(serviceHours)
          .filter(k => k.startsWith(monthKey))
          .reduce((sum, k) => sum + (serviceHours[k].visits || 0), 0);
        
        const lastDayOfMonth = new Date(selectedServiceDate.getFullYear(), selectedServiceDate.getMonth() + 1, 0);
        const isLastDay = selectedServiceDate.getDate() === lastDayOfMonth.getDate();
        
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
                      <span className="text-lg font-bold">{monthHours}</span>
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
                <label className="block text-sm font-medium mb-2">⏰ {tr.hours}</label>
                <input
                  id="service-hours"
                  type="number"
                  step="0.5"
                  min="0"
                  defaultValue={serviceHours[formatDate(selectedServiceDate)]?.hours || 0}
                  className={`w-full px-4 py-3 ${cardBg} border ${borderClass} rounded-lg text-lg font-semibold focus:ring-2 focus:ring-green-500 outline-none`}
                />
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
              <button onClick={saveServiceHours} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow">
                {tr.save}
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default CalendarApp;