import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Trash2, Edit2, Cloud, CloudOff, RefreshCw, Menu, X, Search, Clock, Share2, Paperclip, Sun, Moon, Monitor } from 'lucide-react';

const t = {
  it: { 
    title: 'Calendar4jw', today: 'Oggi', newEvent: 'Nuovo', accounts: 'Account', 
    save: 'Salva', cancel: 'Annulla', delete: 'Elimina', edit: 'Modifica', 
    noEvents: 'Nessun evento', monthView: 'Mese', weekView: 'Settimana', agendaView: 'Agenda',
    eventTitle: 'Titolo', date: 'Data', startTime: 'Inizio', endTime: 'Fine',
    location: 'Luogo', description: 'Descrizione', confirmDelete: 'Eliminare questo evento?',
    regularEvent: 'Normale', circuitAssembly: 'Assemblea', regionalConvention: 'Congresso',
    memorial: 'Commemorazione', specialTalk: 'Discorso Speciale', coVisit: 'Visita CO',
    selectEventType: 'Tipo evento', selectCalendar: 'Calendario',
    caldavConnect: 'CalDAV', caldavServerUrl: 'URL Server', caldavUsername: 'Username',
    caldavPassword: 'Password', caldavAccountName: 'Nome Account',
    settings: 'Impostazioni', language: 'Lingua', theme: 'Tema', defaultView: 'Vista predefinita',
    permissions: 'Permessi', searchEvents: 'Cerca eventi', serviceHours: 'Ore servizio',
    hours: 'Ore', visits: 'Visite', addServiceHours: 'Aggiungi ore servizio',
    monthTotal: 'Totale mese', share: 'Condividi', attachments: 'Allegati',
    addAttachment: 'Aggiungi allegato', changeColor: 'Cambia colore',
    days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'], 
    months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    light: 'Chiaro', dark: 'Scuro', system: 'Sistema'
  },
  es: {
    title: 'Calendar4jw', today: 'Hoy', newEvent: 'Nuevo', accounts: 'Cuentas',
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar',
    noEvents: 'Sin eventos', monthView: 'Mes', weekView: 'Semana', agendaView: 'Agenda',
    eventTitle: 'Título', date: 'Fecha', startTime: 'Inicio', endTime: 'Fin',
    location: 'Ubicación', description: 'Descripción', confirmDelete: '¿Eliminar evento?',
    regularEvent: 'Normal', circuitAssembly: 'Asamblea', regionalConvention: 'Congreso',
    memorial: 'Conmemoración', specialTalk: 'Discurso', coVisit: 'Visita SC',
    selectEventType: 'Tipo', selectCalendar: 'Calendario',
    caldavConnect: 'CalDAV', caldavServerUrl: 'URL', caldavUsername: 'Usuario',
    caldavPassword: 'Contraseña', caldavAccountName: 'Nombre',
    settings: 'Ajustes', language: 'Idioma', theme: 'Tema', defaultView: 'Vista predeterminada',
    permissions: 'Permisos', searchEvents: 'Buscar eventos', serviceHours: 'Horas servicio',
    hours: 'Horas', visits: 'Visitas', addServiceHours: 'Añadir horas', 
    monthTotal: 'Total mes', share: 'Compartir', attachments: 'Adjuntos',
    addAttachment: 'Añadir adjunto', changeColor: 'Cambiar color',
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    light: 'Claro', dark: 'Oscuro', system: 'Sistema'
  },
  en: {
    title: 'Calendar4jw', today: 'Today', newEvent: 'New', accounts: 'Accounts',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    noEvents: 'No events', monthView: 'Month', weekView: 'Week', agendaView: 'Agenda',
    eventTitle: 'Title', date: 'Date', startTime: 'Start', endTime: 'End',
    location: 'Location', description: 'Description', confirmDelete: 'Delete event?',
    regularEvent: 'Regular', circuitAssembly: 'Assembly', regionalConvention: 'Convention',
    memorial: 'Memorial', specialTalk: 'Special Talk', coVisit: 'CO Visit',
    selectEventType: 'Type', selectCalendar: 'Calendar',
    caldavConnect: 'CalDAV', caldavServerUrl: 'Server URL', caldavUsername: 'Username',
    caldavPassword: 'Password', caldavAccountName: 'Account Name',
    settings: 'Settings', language: 'Language', theme: 'Theme', defaultView: 'Default view',
    permissions: 'Permissions', searchEvents: 'Search events', serviceHours: 'Service hours',
    hours: 'Hours', visits: 'Visits', addServiceHours: 'Add service hours',
    monthTotal: 'Month total', share: 'Share', attachments: 'Attachments',
    addAttachment: 'Add attachment', changeColor: 'Change color',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    light: 'Light', dark: 'Dark', system: 'System'
  }
};

const API_URL = 'https://cal4jw.wahost.eu';

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
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [serviceHours, setServiceHours] = useState({});
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceDate, setSelectedServiceDate] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const [caldavForm, setCaldavForm] = useState({
    serverUrl: '', username: '', password: '', accountName: ''
  });
  
  const [settings, setSettings] = useState({
    theme: 'dark',
    defaultView: 'month',
    notifications: true
  });
  
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', startTime: '', endTime: '', location: '', description: '', 
    accountId: 1, eventType: 'regular', attachments: []
  });

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Google', color: '#4285f4', active: true },
    { id: 2, name: 'Microsoft', color: '#0078d4', active: true },
    { id: 3, name: 'CalDAV', color: '#34a853', active: true }
  ]);

  const eventTypeTemplates = {
    regular: { title: '' },
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
    return events.filter(e => e.date === dateStr && accounts.find(a => a.id === e.accountId)?.active);
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

  const syncGoogle = async (userId) => {
    if (!userId) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/events/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.events) {
        const localEvents = events.filter(e => e.accountId !== 1);
        setEvents([...localEvents, ...data.events]);
        alert(`✅ ${data.events.length} eventi sincronizzati!`);
      }
    } catch (err) {
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
    const savedSettings = localStorage.getItem('calendar4jw_settings');
    if (savedSettings) {
      const loaded = JSON.parse(savedSettings);
      setSettings(loaded);
      setViewMode(loaded.defaultView || 'month');
    }
    
    const savedHours = localStorage.getItem('calendar4jw_service_hours');
    if (savedHours) setServiceHours(JSON.parse(savedHours));
    
    const savedAccounts = localStorage.getItem('calendar4jw_accounts');
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    
    const savedEvents = localStorage.getItem('calendar4jw_events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    
    const savedCaldav = localStorage.getItem('calendar4jw_caldav');
    if (savedCaldav) setCaldavAccounts(JSON.parse(savedCaldav));
    
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const connected = params.get('connected');
    
    if (userId && connected === 'true') {
      setGoogleUserId(userId);
      localStorage.setItem('googleUserId', userId);
      syncGoogle(userId);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const saved = localStorage.getItem('googleUserId');
      if (saved) setGoogleUserId(saved);
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) localStorage.setItem('calendar4jw_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('calendar4jw_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('calendar4jw_service_hours', JSON.stringify(serviceHours));
  }, [serviceHours]);

  useEffect(() => {
    localStorage.setItem('calendar4jw_accounts', JSON.stringify(accounts));
  }, [accounts]);

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
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    }
    if (distance < -minSwipeDistance) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }
  };

  const renderMonth = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e${i}`} className={`h-28 border ${settings.theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-gray-700 bg-gray-900'}`}></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isLastDay = d === daysInMonth;
      const monthTotal = isLastDay ? getMonthServiceTotal() : null;
      
      days.push(
        <div key={d} onClick={() => { setSelectedDate(date); setShowDayView(true); }}
          className={`h-28 border p-1 cursor-pointer ${
            settings.theme === 'light' 
              ? `border-gray-300 ${isToday ? 'bg-blue-100' : 'bg-white'}` 
              : `border-gray-700 ${isToday ? 'bg-blue-900' : 'bg-gray-800'}`
          }`}>
          <div className={`text-sm font-bold ${isToday ? 'text-blue-500' : settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{d}</div>
          {dayEvents.slice(0, 3).map(e => (
            <div key={e.id} className="text-[9px] px-1 rounded truncate mt-0.5"
              style={{ backgroundColor: accounts.find(a => a.id === e.accountId)?.color, color: 'white' }}>
              {e.title}
            </div>
          ))}
          {isLastDay && monthTotal && (monthTotal.hours > 0 || monthTotal.visits > 0) && (
            <div className="text-[10px] mt-1 p-1 bg-green-600 text-white rounded font-bold">
              📊 {monthTotal.hours}h • {monthTotal.visits}v
            </div>
          )}
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
        <div key={i} className={`border rounded-lg overflow-hidden ${settings.theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
          <div className={`text-center py-2 ${isToday ? 'bg-blue-600' : settings.theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}>
            <div className={`text-xs ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{tr.days[date.getDay()]}</div>
            <div className={`text-lg font-bold ${isToday ? 'text-white' : settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{date.getDate()}</div>
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
    const filteredEvents = searchQuery ? getFilteredEvents() : events;
    const days = [];
    
    const eventsByDate = {};
    filteredEvents.forEach(e => {
      if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
      eventsByDate[e.date].push(e);
    });
    
    Object.keys(eventsByDate).sort().slice(0, 30).forEach((dateStr, i) => {
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
                  onClick={() => { setSelectedDate(date); setShowDayView(true); }}>
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
    setNewEvent({ title: '', date: '', startTime: '', endTime: '', location: '', description: '', accountId: 1, eventType: 'regular', attachments: [] });
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
        alert('✅ Connesso a CalDAV!');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('❌ Errore connessione CalDAV');
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
              setNewEvent({ ...newEvent, date: formatDate(selectedDate), eventType: 'regular', attachments: [] }); 
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
              <div className="flex gap-4">
                <div><span className="font-bold text-lg">{dayService.hours}</span> {tr.hours}</div>
                <div><span className="font-bold text-lg">{dayService.visits}</span> {tr.visits}</div>
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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold flex-1">{e.title}</h3>
                  <div className="flex gap-1">
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
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} relative`}>
      <div className={`${cardBg} p-4 sticky top-0 z-10 border-b ${borderClass} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
              C4
            </div>
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
          <button onClick={() => { setNewEvent({ ...newEvent, date: formatDate(new Date()), attachments: [] }); setShowEventModal(true); }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition shadow">
            <Plus className="w-4 h-4" />{tr.newEvent}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className={`p-2 rounded-lg ${settings.theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'} transition`}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={() => setShowMonthPicker(true)} className="text-lg font-semibold hover:text-blue-500 transition">
            {tr.months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </button>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
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
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Google</span>
              </div>
              {googleUserId ? (
                <div className="flex gap-2">
                  <button onClick={() => { syncGoogle(googleUserId); setShowSystemMenu(false); }}
                    disabled={syncing} className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 inline ${syncing ? 'animate-spin' : ''}`} /> Sync
                  </button>
                  <button onClick={() => { setGoogleUserId(null); localStorage.removeItem('googleUserId'); setEvents(events.filter(e => e.accountId !== 1)); }}
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition">
                    <CloudOff className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { connectGoogle(); setShowSystemMenu(false); }}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Connetti</button>
              )}
            </div>
            
            <div className={`${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold">CalDAV</span>
                </div>
              </div>
              <button onClick={() => { setShowCaldavModal(true); setShowSystemMenu(false); }}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Connetti</button>
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
              {tr.days.map(d => <div key={d} className={`text-center text-xs font-bold py-2 ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">{renderMonth()}</div>
          </div>
        )}
        {viewMode === 'week' && <div className="grid grid-cols-7 gap-1">{renderWeek()}</div>}
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

      {showServiceModal && selectedServiceDate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`p-4 border-b ${borderClass}`}>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-500" />
                {tr.addServiceHours}
              </h3>
              <p className={`text-sm mt-1 ${settings.theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                {selectedServiceDate.getDate()} {tr.months[selectedServiceDate.getMonth()]} {selectedServiceDate.getFullYear()}
              </p>
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
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg font-medium`}>
                  <option value="it">🇮🇹 Italiano</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇬🇧 English</option>
                </select>
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
              
              <div className={`p-4 ${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg`}>
                <h4 className="font-semibold mb-3">🔔 {tr.permissions}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Notifiche</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
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
                  <option value="circuitAssembly">{tr.circuitAssembly}</option>
                  <option value="regionalConvention">{tr.regionalConvention}</option>
                  <option value="memorial">{tr.memorial}</option>
                  <option value="specialTalk">{tr.specialTalk}</option>
                  <option value="coVisit">{tr.coVisit}</option>
                </select>
              </div>
              
              <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder={tr.eventTitle} className={`w-full px-3 py-3 ${cardBg} border ${borderClass} rounded-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none`} />
              
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className={`w-full px-3 py-3 ${cardBg} border ${borderClass} rounded-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none`} />
              
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
              
              <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder={`📍 ${tr.location}`} className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`} />
              
              <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder={tr.description} rows="3" className={`w-full px-3 py-2 ${cardBg} border ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}></textarea>
              
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
            </div>
            <div className="flex gap-3 p-4 border-t ${borderClass}">
              <button onClick={() => { setShowEventModal(false); setEditingEvent(null); setNewEvent({ title: '', date: '', startTime: '', endTime: '', location: '', description: '', accountId: 1, eventType: 'regular', attachments: [] }); }} 
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
            <div className={`p-4 border-b ${borderClass} sticky top-0 ${cardBg}`}>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-500" />
                {tr.caldavConnect}
              </h3>
            </div>
            <div className="p-4 space-y-4">
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
              <input type="password" value={caldavForm.password} 
                onChange={(e) => setCaldavForm({ ...caldavForm, password: e.target.value })}
                placeholder={tr.caldavPassword} 
                className={`w-full px-3 py-3 ${cardBg} border ${borderClass} rounded-lg font-medium focus:ring-2 focus:ring-purple-500 outline-none`} />
            </div>
            <div className="flex gap-3 p-4 border-t ${borderClass}">
              <button onClick={() => { setShowCaldavModal(false); setCaldavForm({ serverUrl: '', username: '', password: '', accountName: '' }); }}
                className={`flex-1 px-4 py-3 ${settings.theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} rounded-lg font-medium transition`}>
                {tr.cancel}
              </button>
              <button onClick={connectCaldav} className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition shadow">
                {tr.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;