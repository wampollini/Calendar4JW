import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Calendar, Trash2, Edit2, Cloud, CloudOff, RefreshCw, Menu, X } from 'lucide-react';

// Traduzioni inline semplificate
const t = {
  it: { 
    title: 'Calendar4jw', today: 'Oggi', newEvent: 'Nuovo', accounts: 'Account', 
    save: 'Salva', cancel: 'Annulla', delete: 'Elimina', edit: 'Modifica', 
    noEvents: 'Nessun evento', monthView: 'Mese', weekView: 'Settimana', agendaView: 'Agenda',
    eventTitle: 'Titolo', date: 'Data', startTime: 'Inizio', endTime: 'Fine',
    location: 'Luogo', description: 'Descrizione', confirmDelete: 'Eliminare questo evento?',
    regularEvent: 'Normale', circuitAssembly: 'Assemblea', regionalConvention: 'Congresso',
    memorial: 'Commemorazione', specialTalk: 'Discorso Speciale', coVisit: 'Visita CO',
    selectEventType: 'Tipo evento',
    caldavConnect: 'CalDAV', caldavServerUrl: 'URL Server', caldavUsername: 'Username',
    caldavPassword: 'Password', caldavAccountName: 'Nome Account',
    days: ['D', 'L', 'M', 'M', 'G', 'V', 'S'], 
    months: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
  },
  es: {
    title: 'Calendar4jw', today: 'Hoy', newEvent: 'Nuevo', accounts: 'Cuentas',
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar',
    noEvents: 'Sin eventos', monthView: 'Mes', weekView: 'Semana', agendaView: 'Agenda',
    eventTitle: 'Título', date: 'Fecha', startTime: 'Inicio', endTime: 'Fin',
    location: 'Ubicación', description: 'Descripción', confirmDelete: '¿Eliminar evento?',
    regularEvent: 'Normal', circuitAssembly: 'Asamblea', regionalConvention: 'Congreso',
    memorial: 'Conmemoración', specialTalk: 'Discurso', coVisit: 'Visita SC',
    selectEventType: 'Tipo',
    caldavConnect: 'CalDAV', caldavServerUrl: 'URL', caldavUsername: 'Usuario',
    caldavPassword: 'Contraseña', caldavAccountName: 'Nombre',
    days: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  },
  en: {
    title: 'Calendar4jw', today: 'Today', newEvent: 'New', accounts: 'Accounts',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    noEvents: 'No events', monthView: 'Month', weekView: 'Week', agendaView: 'Agenda',
    eventTitle: 'Title', date: 'Date', startTime: 'Start', endTime: 'End',
    location: 'Location', description: 'Description', confirmDelete: 'Delete event?',
    regularEvent: 'Regular', circuitAssembly: 'Assembly', regionalConvention: 'Convention',
    memorial: 'Memorial', specialTalk: 'Special Talk', coVisit: 'CO Visit',
    selectEventType: 'Type',
    caldavConnect: 'CalDAV', caldavServerUrl: 'Server URL', caldavUsername: 'Username',
    caldavPassword: 'Password', caldavAccountName: 'Account Name',
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }
};

const API_URL = 'https://cal4jw.wahost.eu'; // ← CAMBIA CON IL TUO DOMINIO VPS

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
  const [showCaldavModal, setShowCaldavModal] = useState(false);
  const [caldavAccounts, setCaldavAccounts] = useState([]);
  const [caldavForm, setCaldavForm] = useState({
    serverUrl: '', username: '', password: '', accountName: ''
  });
  
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', startTime: '', endTime: '', location: '', description: '', accountId: 1, eventType: 'regular'
  });

  const eventTypeTemplates = {
    regular: { title: '' },
    circuitAssembly: { title: 'Assemblea di Circoscrizione' },
    regionalConvention: { title: 'Congresso Regionale' },
    memorial: { title: 'Commemorazione' },
    specialTalk: { title: 'Discorso Speciale' },
    coVisit: { title: 'Visita Sorvegliante' }
  };

  const [accounts] = useState([
    { id: 1, name: 'Google', color: '#4285f4', active: true },
    { id: 2, name: 'Microsoft', color: '#0078d4', active: true },
    { id: 3, name: 'CalDAV', color: '#34a853', active: true }
  ]);

  const tr = t[language];

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return events.filter(e => e.date === dateStr && accounts.find(a => a.id === e.accountId)?.active);
  };

  const syncGoogle = async (userId) => {
    if (!userId) {
      console.log('syncGoogle: no userId');
      alert('Nessun userId per sincronizzare');
      return;
    }
    
    console.log('Syncing Google with userId:', userId);
    setSyncing(true);
    try {
      const url = `${API_URL}/api/events/${userId}`;
      console.log('Fetching from:', url);
      
      const res = await fetch(url);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Data received:', data);
      
      if (data.events) {
        console.log('Events count:', data.events.length);
        // Rimuovi eventi Google vecchi e aggiungi i nuovi
        const localEvents = events.filter(e => e.accountId !== 1);
        const allEvents = [...localEvents, ...data.events];
        setEvents(allEvents);
        localStorage.setItem('calendar4jw_events', JSON.stringify(allEvents));
        alert(`✅ ${data.events.length} eventi Google sincronizzati!`);
      } else if (data.error) {
        alert('❌ Errore: ' + data.error);
      } else {
        alert('⚠️ Nessun evento trovato');
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert('❌ Errore sync: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const connectGoogle = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/google`);
      const data = await res.json();
      window.location.href = data.authUrl;
    } catch (err) {
      alert('Errore connessione');
    }
  };

  useEffect(() => {
    // Setup deep linking
    const setupDeepLink = async () => {
      try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
          const AppPlugin = window.Capacitor.Plugins.App;
          
          console.log('Setting up App URL listener...');
          
          AppPlugin.addListener('appUrlOpen', (event) => {
            console.log('Deep link received!', event);
            const url = event.url;
            
            try {
              // Parse: calendar4jw://?userId=...&connected=true
              const urlObj = new URL(url.replace('calendar4jw://', 'http://dummy/'));
              const userId = urlObj.searchParams.get('userId');
              const connected = urlObj.searchParams.get('connected');
              
              console.log('Parsed params:', { userId, connected });
              
              if (userId && connected === 'true') {
                console.log('Setting Google userId:', userId);
                setGoogleUserId(userId);
                localStorage.setItem('googleUserId', userId);
                setTimeout(() => syncGoogle(userId), 1000);
                alert('✅ Connesso a Google Calendar!');
              }
            } catch (e) {
              console.error('Error parsing deep link:', e);
            }
          });
        } else {
          console.log('Capacitor App plugin not available');
        }
      } catch (err) {
        console.error('Error setting up deep link:', err);
      }
    };
    
    setupDeepLink();
    
    // Carica eventi salvati
    const savedEvents = localStorage.getItem('calendar4jw_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
        console.log('Loaded events from localStorage:', JSON.parse(savedEvents).length);
      } catch (e) {
        console.error('Error loading events:', e);
      }
    }
    
    // Carica account CalDAV
    const savedCaldav = localStorage.getItem('calendar4jw_caldav');
    if (savedCaldav) {
      try {
        setCaldavAccounts(JSON.parse(savedCaldav));
      } catch (e) {
        console.error('Error loading CalDAV accounts:', e);
      }
    }
    
    // Controlla Google OAuth da URL (fallback per web)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const connected = params.get('connected');
    
    console.log('URL params:', { userId, connected });
    
    if (userId && connected === 'true') {
      console.log('Setting Google userId from URL:', userId);
      setGoogleUserId(userId);
      localStorage.setItem('googleUserId', userId);
      syncGoogle(userId);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const saved = localStorage.getItem('googleUserId');
      if (saved) {
        console.log('Loaded Google userId from localStorage:', saved);
        setGoogleUserId(saved);
      } else {
        console.log('No Google userId found');
      }
    }
  }, []);

  // Salva eventi quando cambiano
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('calendar4jw_events', JSON.stringify(events));
    }
  }, [events]);

  const renderMonth = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e${i}`} className="h-20 border border-gray-700 bg-gray-900"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div key={d} onClick={() => { setSelectedDate(date); setShowDayView(true); }}
          className={`h-20 border border-gray-700 p-1 cursor-pointer ${isToday ? 'bg-blue-900' : 'bg-gray-800'}`}>
          <div className={`text-xs font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>{d}</div>
          {dayEvents.slice(0, 2).map(e => (
            <div key={e.id} className="text-[8px] px-1 rounded truncate mt-1"
              style={{ backgroundColor: accounts.find(a => a.id === e.accountId)?.color, color: 'white' }}>
              {e.title}
            </div>
          ))}
        </div>
      );
    }
    return days;
  };

  const renderWeek = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    const week = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(curr);
      date.setDate(first + i);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      week.push(
        <div key={i} className="border border-gray-700 rounded-lg overflow-hidden">
          <div className={`text-center py-2 ${isToday ? 'bg-blue-900' : 'bg-gray-800'}`}>
            <div className="text-xs text-gray-400">{tr.days[date.getDay()]}</div>
            <div className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>{date.getDate()}</div>
          </div>
          <div className="p-2 min-h-[150px] space-y-1">
            {dayEvents.map(e => (
              <div key={e.id} className="text-xs p-2 rounded cursor-pointer"
                style={{ backgroundColor: accounts.find(a => a.id === e.accountId)?.color, color: 'white' }}
                onClick={() => { setSelectedDate(date); setShowDayView(true); }}>
                <div className="font-semibold truncate">{e.title}</div>
                {e.startTime && <div className="text-[10px] opacity-90">{e.startTime}</div>}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return week;
  };

  const renderAgenda = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayEvents = getEventsForDate(date);
      
      if (dayEvents.length === 0) continue;
      
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div key={i} className="bg-gray-800 rounded-lg overflow-hidden">
          <div className={`p-3 border-l-4 ${isToday ? 'border-blue-500 bg-blue-900' : 'border-gray-600'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`text-2xl font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>{date.getDate()}</div>
              <div>
                <div className={`text-sm font-semibold ${isToday ? 'text-blue-400' : 'text-white'}`}>
                  {tr.days[date.getDay()]}
                </div>
                <div className="text-xs text-gray-400">
                  {tr.months[date.getMonth()]} {date.getFullYear()}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {dayEvents.map(e => (
                <div key={e.id} className="bg-gray-700 p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-600"
                  style={{ borderColor: accounts.find(a => a.id === e.accountId)?.color }}
                  onClick={() => { setSelectedDate(date); setShowDayView(true); }}>
                  <div className="font-semibold">{e.title}</div>
                  {e.startTime && <div className="text-sm text-gray-300 mt-1">{e.startTime} - {e.endTime}</div>}
                  {e.location && <div className="text-sm text-gray-400 mt-1">📍 {e.location}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (days.length === 0) {
      return <div className="text-center text-gray-400 py-8">{tr.noEvents}</div>;
    }
    
    return days;
  };

  const handleSave = async () => {
    if (!newEvent.title || !newEvent.date) return;
    const evt = editingEvent ? { ...newEvent, id: editingEvent.id } : { ...newEvent, id: Date.now() };
    
    if (newEvent.accountId === 1 && googleUserId) {
      try {
        await fetch(`${API_URL}/api/events/${googleUserId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });
      } catch (err) {
        console.error(err);
      }
    }
    
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? evt : e));
      setEditingEvent(null);
    } else {
      setEvents([...events, evt]);
    }
    
    setShowEventModal(false);
    setNewEvent({ title: '', date: '', startTime: '', endTime: '', location: '', description: '', accountId: 1, eventType: 'regular' });
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm(tr.confirmDelete)) return;
    const event = events.find(e => e.id === eventId);
    
    if (event?.googleId && googleUserId) {
      try {
        await fetch(`${API_URL}/api/events/${googleUserId}/${event.googleId}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
    
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setNewEvent({ ...event });
    setShowDayView(false);
    setShowEventModal(true);
  };

  const connectCaldav = async () => {
    if (!caldavForm.serverUrl || !caldavForm.username || !caldavForm.password || !caldavForm.accountName) {
      alert('Compila tutti i campi');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/caldav/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caldavForm)
      });
      const data = await res.json();

      if (data.success) {
        const newAcc = { caldavId: data.caldavId, accountName: data.accountName, serverUrl: caldavForm.serverUrl };
        const updated = [...caldavAccounts, newAcc];
        setCaldavAccounts(updated);
        localStorage.setItem('calendar4jw_caldav', JSON.stringify(updated));
        setShowCaldavModal(false);
        setCaldavForm({ serverUrl: '', username: '', password: '', accountName: '' });
        syncCaldav(data.caldavId);
        alert('Connesso a CalDAV!');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Errore connessione CalDAV');
    }
  };

  const syncCaldav = async (caldavId) => {
    if (!caldavId) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/caldav/events/${caldavId}`);
      const data = await res.json();
      if (data.events) {
        setEvents([...events.filter(e => e.accountId !== 3), ...data.events]);
        alert(`${data.events.length} eventi CalDAV sincronizzati`);
      }
    } catch (err) {
      alert('Errore sync CalDAV');
    } finally {
      setSyncing(false);
    }
  };

  const disconnectCaldav = (caldavId) => {
    const updated = caldavAccounts.filter(a => a.caldavId !== caldavId);
    setCaldavAccounts(updated);
    localStorage.setItem('calendar4jw_caldav', JSON.stringify(updated));
    setEvents(events.filter(e => !(e.accountId === 3 && e.caldavId === caldavId)));
  };

  if (showDayView && selectedDate) {
    const dayEvents = getEventsForDate(selectedDate);
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <button onClick={() => setShowDayView(false)}><ChevronLeft className="w-6 h-6" /></button>
          <h2>{selectedDate.getDate()} {tr.months[selectedDate.getMonth()]}</h2>
          <button onClick={() => { setEditingEvent(null); setNewEvent({ ...newEvent, date: formatDate(selectedDate), eventType: 'regular' }); setShowDayView(false); setShowEventModal(true); }}>
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {dayEvents.length === 0 ? <div className="text-center text-gray-400 py-8">{tr.noEvents}</div> :
            dayEvents.map(e => (
              <div key={e.id} className="bg-gray-800 rounded-lg p-4 border-l-4"
                style={{ borderColor: accounts.find(a => a.id === e.accountId)?.color }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold flex-1">{e.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(e)} className="text-blue-400 p-2 hover:bg-gray-700 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="text-red-400 p-2 hover:bg-gray-700 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {e.startTime && <div className="text-sm text-gray-300">{e.startTime} - {e.endTime}</div>}
                {e.location && <div className="text-sm text-gray-400">📍 {e.location}</div>}
                {e.description && <div className="text-sm text-gray-300 mt-2">{e.description}</div>}
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <div className="bg-gray-800 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-500" />{tr.title}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSystemMenu(!showSystemMenu)} className="p-2 bg-gray-700 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs">
              <option value="it">IT</option>
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex gap-1">
            {['month', 'week', 'agenda'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-2 py-1 rounded text-xs ${viewMode === v ? 'bg-blue-600' : 'bg-gray-700'}`}>
                {tr[v + 'View']}
              </button>
            ))}
          </div>
          <button onClick={() => { setNewEvent({ ...newEvent, date: formatDate(new Date()) }); setShowEventModal(true); }}
            className="px-3 py-2 bg-blue-600 rounded-lg flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />{tr.newEvent}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}><ChevronLeft className="w-6 h-6" /></button>
          <h2 className="text-lg font-semibold">{tr.months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>

      {showSystemMenu && (
        <div className="absolute top-16 right-4 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-80 z-50">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">{tr.accounts}</h3>
            <button onClick={() => setShowSystemMenu(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Google</span>
              </div>
              {googleUserId ? (
                <div className="flex gap-2">
                  <button onClick={() => { syncGoogle(googleUserId); setShowSystemMenu(false); }}
                    disabled={syncing} className="flex-1 px-3 py-2 bg-green-600 rounded text-sm">
                    <RefreshCw className={`w-4 h-4 inline ${syncing ? 'animate-spin' : ''}`} /> Sync
                  </button>
                  <button onClick={() => { setGoogleUserId(null); localStorage.removeItem('googleUserId'); setEvents(events.filter(e => e.accountId !== 1)); }}
                    className="px-3 py-2 bg-red-600 rounded text-sm">
                    <CloudOff className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { connectGoogle(); setShowSystemMenu(false); }}
                  className="w-full px-3 py-2 bg-blue-600 rounded">Connetti</button>
              )}
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">CalDAV</span>
              </div>
              {caldavAccounts.length > 0 ? (
                <div className="space-y-2">
                  {caldavAccounts.map(acc => (
                    <div key={acc.caldavId} className="bg-gray-800 rounded p-2">
                      <div className="text-sm font-medium">{acc.accountName}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { syncCaldav(acc.caldavId); setShowSystemMenu(false); }}
                          className="flex-1 px-2 py-1 bg-green-600 rounded text-xs">Sync</button>
                        <button onClick={() => disconnectCaldav(acc.caldavId)}
                          className="px-2 py-1 bg-red-600 rounded text-xs">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setShowCaldavModal(true); setShowSystemMenu(false); }}
                    className="w-full px-3 py-2 bg-purple-600 rounded text-sm">+ Aggiungi</button>
                </div>
              ) : (
                <button onClick={() => { setShowCaldavModal(true); setShowSystemMenu(false); }}
                  className="w-full px-3 py-2 bg-purple-600 rounded">Connetti</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-2">
        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {tr.days.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">{renderMonth()}</div>
          </div>
        )}
        {viewMode === 'week' && <div className="grid grid-cols-7 gap-1">{renderWeek()}</div>}
        {viewMode === 'agenda' && <div className="space-y-3">{renderAgenda()}</div>}
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold">{editingEvent ? tr.edit + ' ' + tr.newEvent : tr.newEvent}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{tr.selectEventType}</label>
                <select value={newEvent.eventType} onChange={(e) => {
                  const type = e.target.value;
                  const template = eventTypeTemplates[type];
                  setNewEvent({ ...newEvent, eventType: type, title: template.title || newEvent.title });
                }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option value="regular">{tr.regularEvent}</option>
                  <option value="circuitAssembly">{tr.circuitAssembly}</option>
                  <option value="regionalConvention">{tr.regionalConvention}</option>
                  <option value="memorial">{tr.memorial}</option>
                  <option value="specialTalk">{tr.specialTalk}</option>
                  <option value="coVisit">{tr.coVisit}</option>
                </select>
              </div>
              <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder={tr.eventTitle} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  placeholder={tr.startTime} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  placeholder={tr.endTime} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              </div>
              <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder={tr.location} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder={tr.description} rows="3" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"></textarea>
            </div>
            <div className="flex gap-3 p-4">
              <button onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className="flex-1 px-4 py-3 bg-gray-700 rounded-lg">{tr.cancel}</button>
              <button onClick={handleSave} className="flex-1 px-4 py-3 bg-blue-600 rounded-lg">{tr.save}</button>
            </div>
          </div>
        </div>
      )}
      
      {showCaldavModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold">{tr.caldavConnect}</h3>
            </div>
            <div className="p-4 space-y-4">
              <input type="text" value={caldavForm.accountName} 
                onChange={(e) => setCaldavForm({ ...caldavForm, accountName: e.target.value })}
                placeholder={tr.caldavAccountName} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              <input type="url" value={caldavForm.serverUrl} 
                onChange={(e) => setCaldavForm({ ...caldavForm, serverUrl: e.target.value })}
                placeholder={tr.caldavServerUrl} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              <input type="text" value={caldavForm.username} 
                onChange={(e) => setCaldavForm({ ...caldavForm, username: e.target.value })}
                placeholder={tr.caldavUsername} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              <input type="password" value={caldavForm.password} 
                onChange={(e) => setCaldavForm({ ...caldavForm, password: e.target.value })}
                placeholder={tr.caldavPassword} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
            <div className="flex gap-3 p-4">
              <button onClick={() => { setShowCaldavModal(false); setCaldavForm({ serverUrl: '', username: '', password: '', accountName: '' }); }}
                className="flex-1 px-4 py-3 bg-gray-700 rounded-lg">{tr.cancel}</button>
              <button onClick={connectCaldav} className="flex-1 px-4 py-3 bg-purple-600 rounded-lg">{tr.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;