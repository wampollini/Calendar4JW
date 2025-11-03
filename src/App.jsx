import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Calendar, Trash2, Edit2, Cloud, CloudOff, RefreshCw, Menu, X } from 'lucide-react';

const translations = {
  it: {
    title: 'Calendar4jw',
    today: 'Oggi',
    newEvent: 'Nuovo Evento',
    accounts: 'Account',
    settings: 'Impostazioni',
    eventTitle: 'Titolo evento',
    eventTitlePlaceholder: 'Inserisci titolo...',
    date: 'Data',
    startTime: 'Ora inizio',
    endTime: 'Ora fine',
    location: 'Luogo',
    locationPlaceholder: 'Aggiungi luogo...',
    description: 'Descrizione',
    descriptionPlaceholder: 'Aggiungi descrizione...',
    account: 'Account',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    close: 'Chiudi',
    noEvents: 'Nessun evento per questo giorno',
    activeAccounts: 'Gestione Account',
    addAccount: 'Aggiungi Account',
    editAccount: 'Modifica Account',
    accountName: 'Nome Account',
    accountNamePlaceholder: 'es. Gmail Lavoro',
    accountType: 'Tipo',
    accountColor: 'Colore',
    deleteAccount: 'Elimina Account',
    confirmDelete: 'Sei sicuro di eliminare questo account e tutti i suoi eventi?',
    confirmDeleteEvent: 'Sei sicuro di eliminare questo evento?',
    caldavConnect: 'Connetti CalDAV',
    caldavServerUrl: 'URL Server',
    caldavUsername: 'Username',
    caldavPassword: 'Password',
    caldavAccountName: 'Nome Account',
    caldavServerPlaceholder: 'https://caldav.esempio.com',
    monthView: 'Mese',
    weekView: 'Settimana',
    agendaView: 'Agenda',
    eventTypes: 'Tipi di Evento',
    regularEvent: 'Evento Normale',
    circuitAssembly: 'Assemblea di Circoscrizione',
    regionalConvention: 'Congresso Regionale',
    memorial: 'Commemorazione',
    specialTalk: 'Discorso Speciale',
    coVisit: 'Visita Sorvegliante (inizio)',
    coVisitEnd: 'Visita Sorvegliante (fine)',
    selectEventType: 'Seleziona tipo evento',
    days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
    months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
  },
  es: {
    title: 'Calendar4jw',
    today: 'Hoy',
    newEvent: 'Nuevo Evento',
    accounts: 'Cuentas',
    settings: 'Configuración',
    eventTitle: 'Título del evento',
    eventTitlePlaceholder: 'Introduce título...',
    date: 'Fecha',
    startTime: 'Hora inicio',
    endTime: 'Hora fin',
    location: 'Ubicación',
    locationPlaceholder: 'Añadir ubicación...',
    description: 'Descripción',
    descriptionPlaceholder: 'Añadir descripción...',
    account: 'Cuenta',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    noEvents: 'No hay eventos para este día',
    activeAccounts: 'Gestión de Cuentas',
    addAccount: 'Añadir Cuenta',
    editAccount: 'Editar Cuenta',
    accountName: 'Nombre Cuenta',
    accountNamePlaceholder: 'ej. Gmail Trabajo',
    accountType: 'Tipo',
    accountColor: 'Color',
    deleteAccount: 'Eliminar Cuenta',
    confirmDelete: '¿Seguro que quieres eliminar esta cuenta y todos sus eventos?',
    confirmDeleteEvent: '¿Seguro que quieres eliminar este evento?',
    caldavConnect: 'Conectar CalDAV',
    caldavServerUrl: 'URL Servidor',
    caldavUsername: 'Usuario',
    caldavPassword: 'Contraseña',
    caldavAccountName: 'Nombre Cuenta',
    caldavServerPlaceholder: 'https://caldav.ejemplo.com',
    monthView: 'Mes',
    weekView: 'Semana',
    agendaView: 'Agenda',
    eventTypes: 'Tipos de Evento',
    regularEvent: 'Evento Normal',
    circuitAssembly: 'Asamblea de Circuito',
    regionalConvention: 'Congreso Regional',
    memorial: 'Conmemoración',
    specialTalk: 'Discurso Especial',
    coVisit: 'Visita Superintendente (inicio)',
    coVisitEnd: 'Visita Superintendente (fin)',
    selectEventType: 'Selecciona tipo',
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  },
  en: {
    title: 'Calendar4jw',
    today: 'Today',
    newEvent: 'New Event',
    accounts: 'Accounts',
    settings: 'Settings',
    eventTitle: 'Event title',
    eventTitlePlaceholder: 'Enter title...',
    date: 'Date',
    startTime: 'Start time',
    endTime: 'End time',
    location: 'Location',
    locationPlaceholder: 'Add location...',
    description: 'Description',
    descriptionPlaceholder: 'Add description...',
    account: 'Account',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    noEvents: 'No events for this day',
    activeAccounts: 'Account Management',
    addAccount: 'Add Account',
    editAccount: 'Edit Account',
    accountName: 'Account Name',
    accountNamePlaceholder: 'e.g. Work Gmail',
    accountType: 'Type',
    accountColor: 'Color',
    deleteAccount: 'Delete Account',
    confirmDelete: 'Are you sure you want to delete this account and all its events?',
    confirmDeleteEvent: 'Are you sure you want to delete this event?',
    caldavConnect: 'Connect CalDAV',
    caldavServerUrl: 'Server URL',
    caldavUsername: 'Username',
    caldavPassword: 'Password',
    caldavAccountName: 'Account Name',
    caldavServerPlaceholder: 'https://caldav.example.com',
    monthView: 'Month',
    weekView: 'Week',
    agendaView: 'Agenda',
    eventTypes: 'Event Types',
    regularEvent: 'Regular Event',
    circuitAssembly: 'Circuit Assembly',
    regionalConvention: 'Regional Convention',
    memorial: 'Memorial',
    specialTalk: 'Special Talk',
    coVisit: 'CO Visit (start)',
    coVisitEnd: 'CO Visit (end)',
    selectEventType: 'Select event type',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  }
};

const CalendarApp = () => {
  const [language, setLanguage] = useState('it');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAccountsPanel, setShowAccountsPanel] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDayView, setShowDayView] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'agenda'
  const [events, setEvents] = useState([]);
  const [googleUserId, setGoogleUserId] = useState(null);
  const [caldavAccounts, setCaldavAccounts] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [showCaldavModal, setShowCaldavModal] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [caldavForm, setCaldavForm] = useState({
    serverUrl: '',
    username: '',
    password: '',
    accountName: ''
  });
  
  const API_URL = 'https://calendar4jw-backend.onrender.com';
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Google Calendar', type: 'google', color: '#4285f4', active: true },
    { id: 2, name: 'Microsoft Outlook', type: 'microsoft', color: '#0078d4', active: true },
    { id: 3, name: 'CalDAV Personal', type: 'caldav', color: '#34a853', active: true }
  ]);

  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'google',
    color: '#4285f4'
  });

  const accountTypes = [
    { value: 'google', label: 'Google Calendar' },
    { value: 'microsoft', label: 'Microsoft Outlook' },
    { value: 'caldav', label: 'CalDAV' },
    { value: 'other', label: 'Other' }
  ];

  const colorPresets = [
    '#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d00',
    '#0078d4', '#7b1fa2', '#c2185b', '#d32f2f', '#00acc1'
  ];

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    accountId: 1,
    eventType: 'regular'
  });

  const eventTypeTemplates = {
    regular: { title: '', color: null },
    circuitAssembly: { title: 'Assemblea di Circoscrizione', color: '#9333ea' },
    regionalConvention: { title: 'Congresso Regionale', color: '#dc2626' },
    memorial: { title: 'Commemorazione', color: '#ca8a04' },
    specialTalk: { title: 'Discorso Speciale', color: '#2563eb' },
    coVisit: { title: 'Visita Sorvegliante - Inizio', color: '#059669' },
    coVisitEnd: { title: 'Visita Sorvegliante - Fine', color: '#059669' }
  };

  const t = translations[language];

  // Sincronizza eventi da Google Calendar
  const syncGoogleEvents = async (userId) => {
    if (!userId) {
      console.log('syncGoogleEvents: no userId');
      return;
    }
    
    console.log('Syncing Google events for userId:', userId);
    setSyncing(true);
    try {
      const url = `${API_URL}/api/events/${userId}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Events received:', data);
      
      if (data.events) {
        const localEvents = events.filter(e => e.accountId !== 1);
        console.log('Local events:', localEvents.length, 'Google events:', data.events.length);
        setEvents([...localEvents, ...data.events]);
        alert(`✅ Sincronizzati ${data.events.length} eventi da Google!`);
      } else {
        alert('⚠️ Nessun evento trovato su Google Calendar');
      }
    } catch (error) {
      console.error('Error syncing events:', error);
      alert('Errore sincronizzazione eventi: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // Gestisci deep link da OAuth
  useEffect(() => {
    const setupDeepLinking = async () => {
      try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
          const AppPlugin = window.Capacitor.Plugins.App;
          
          AppPlugin.addListener('appUrlOpen', (event) => {
            const url = event.url;
            console.log('Deep link received:', url);
            
            try {
              const urlObj = new URL(url);
              const userId = urlObj.searchParams.get('userId');
              const connected = urlObj.searchParams.get('connected');
              
              if (userId && connected === 'true') {
                console.log('Deep link: userId received:', userId);
                setGoogleUserId(userId);
                localStorage.setItem('googleUserId', userId);
                syncGoogleEvents(userId);
              } else {
                console.log('Deep link: invalid params', { userId, connected });
              }
            } catch (e) {
              console.error('Error parsing deep link:', e);
            }
          });
        }
      } catch (error) {
        console.log('Capacitor not available, using web mode');
      }
    };

    setupDeepLinking();

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const connected = params.get('connected');
    
    if (userId && connected === 'true') {
      setGoogleUserId(userId);
      localStorage.setItem('googleUserId', userId);
      syncGoogleEvents(userId);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const savedUserId = localStorage.getItem('googleUserId');
      if (savedUserId) {
        setGoogleUserId(savedUserId);
      }
    }
  }, []);

  // Connetti a Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      console.log('Connecting to:', `${API_URL}/auth/google`);
      const response = await fetch(`${API_URL}/auth/google`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Auth URL:', data.authUrl);
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting to Google:', error);
      alert('Errore connessione Google Calendar: ' + error.message);
    }
  };

  // Disconnetti Google Calendar
  const disconnectGoogleCalendar = () => {
    setGoogleUserId(null);
    localStorage.removeItem('googleUserId');
    setEvents(events.filter(e => e.accountId !== 1));
  };

  // Connetti CalDAV
  const connectCalDAV = async () => {
    if (!caldavForm.serverUrl || !caldavForm.username || !caldavForm.password || !caldavForm.accountName) {
      alert('Compila tutti i campi');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/caldav/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caldavForm)
      });

      const data = await response.json();

      if (data.success) {
        const newAccount = {
          caldavId: data.caldavId,
          accountName: data.accountName,
          serverUrl: caldavForm.serverUrl
        };
        
        const updatedAccounts = [...caldavAccounts, newAccount];
        setCaldavAccounts(updatedAccounts);
        localStorage.setItem('caldavAccounts', JSON.stringify(updatedAccounts));
        
        setShowCaldavModal(false);
        setCaldavForm({ serverUrl: '', username: '', password: '', accountName: '' });
        
        // Sincronizza eventi
        syncCalDAVEvents(data.caldavId);
        alert('✅ Connesso a CalDAV!');
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('CalDAV connection error:', error);
      alert('Errore connessione CalDAV: ' + error.message);
    }
  };

  // Sincronizza eventi CalDAV
  const syncCalDAVEvents = async (caldavId) => {
    if (!caldavId) return;

    setSyncing(true);
    try {
      const response = await fetch(`${API_URL}/api/caldav/events/${caldavId}`);
      const data = await response.json();

      if (data.events) {
        const localEvents = events.filter(e => e.accountId !== 3);
        setEvents([...localEvents, ...data.events]);
        alert(`✅ Sincronizzati ${data.events.length} eventi CalDAV!`);
      }
    } catch (error) {
      console.error('Error syncing CalDAV:', error);
      alert('Errore sincronizzazione CalDAV');
    } finally {
      setSyncing(false);
    }
  };

  // Disconnetti CalDAV
  const disconnectCalDAV = (caldavId) => {
    const updated = caldavAccounts.filter(a => a.caldavId !== caldavId);
    setCaldavAccounts(updated);
    localStorage.setItem('caldavAccounts', JSON.stringify(updated));
    setEvents(events.filter(e => !(e.accountId === 3 && e.caldavId === caldavId)));
  };

  // Salva evento su Google Calendar
  const saveEventToGoogle = async (event) => {
    if (!googleUserId || event.accountId !== 1) return;
    
    try {
      const response = await fetch(`${API_URL}/api/events/${googleUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      const data = await response.json();
      return data.eventId;
    } catch (error) {
      console.error('Error saving to Google:', error);
      alert('Errore salvataggio su Google Calendar');
    }
  };

  // Elimina evento da Google Calendar
  const deleteEventFromGoogle = async (eventId) => {
    if (!googleUserId) return;
    
    try {
      await fetch(`${API_URL}/api/events/${googleUserId}/${eventId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting from Google:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return events.filter(event => {
      const account = accounts.find(acc => acc.id === event.accountId);
      return event.date === dateStr && account && account.active;
    });
  };

  const handleSaveEvent = async () => {
    if (newEvent.title && newEvent.date) {
      let savedEvent = { ...newEvent, id: editingEvent ? editingEvent.id : Date.now() };
      
      // Se è un evento Google, sincronizza
      if (newEvent.accountId === 1 && googleUserId) {
        const googleEventId = await saveEventToGoogle(newEvent);
        if (googleEventId) {
          savedEvent.googleId = googleEventId;
        }
      }
      
      if (editingEvent) {
        setEvents(events.map(e => e.id === editingEvent.id ? savedEvent : e));
        setEditingEvent(null);
      } else {
        setEvents([...events, savedEvent]);
      }
      
      setShowEventModal(false);
      setNewEvent({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        accountId: 1,
        eventType: 'regular'
      });
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({ 
      title: event.title,
      date: event.date,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      description: event.description || '',
      accountId: event.accountId,
      eventType: event.eventType || 'regular'
    });
    setShowDayView(false);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm(t.confirmDeleteEvent);
    if (confirmed) {
      const event = events.find(e => e.id === eventId);
      
      // Se è un evento Google, eliminalo anche da Google
      if (event && event.googleId && googleUserId) {
        await deleteEventFromGoogle(event.googleId);
      }
      
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const toggleAccount = (accountId) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, active: !acc.active } : acc
    ));
  };

  const handleAddAccount = () => {
    console.log('Add account clicked');
    setEditingAccount(null);
    setAccountForm({ name: '', type: 'google', color: '#4285f4' });
    setShowAccountModal(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setAccountForm({ name: account.name, type: account.type, color: account.color });
    setShowAccountModal(true);
  };

  const handleSaveAccount = () => {
    console.log('Save account clicked', accountForm);
    if (!accountForm.name.trim()) {
      console.log('Name is empty, cannot save');
      return;
    }

    if (editingAccount) {
      setAccounts(accounts.map(acc =>
        acc.id === editingAccount.id
          ? { ...acc, name: accountForm.name, type: accountForm.type, color: accountForm.color }
          : acc
      ));
    } else {
      const newAccount = {
        id: Date.now(),
        name: accountForm.name,
        type: accountForm.type,
        color: accountForm.color,
        active: true
      };
      console.log('Adding new account', newAccount);
      setAccounts([...accounts, newAccount]);
    }

    setShowAccountModal(false);
    setAccountForm({ name: '', type: 'google', color: '#4285f4' });
    setEditingAccount(null);
  };

  const handleDeleteAccount = (accountId) => {
    const confirmed = window.confirm(t.confirmDelete);
    if (confirmed) {
      setAccounts(accounts.filter(acc => acc.id !== accountId));
      setEvents(events.filter(event => event.accountId !== accountId));
    }
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowDayView(true);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setNewEvent(prev => ({ ...prev, date: dateStr }));
  };

  const getWeekDates = (date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i));
      weekDates.push(new Date(day));
    }
    return weekDates;
  };

  const getNextDays = (count = 30) => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square border border-gray-700 bg-gray-900"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`border border-gray-700 p-1 cursor-pointer hover:bg-gray-700 transition-colors ${
            isToday ? 'bg-blue-900' : 'bg-gray-800'
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{ minHeight: '80px' }}
          onClick={() => handleDayClick(date)}
        >
          <div className={`text-xs font-semibold ${isToday ? 'text-blue-400' : 'text-gray-200'}`}>
            {day}
          </div>
      </div>

      {showSystemMenu && (
          <div className="absolute top-16 right-4 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-80 z-50">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Account & Sincronizzazione</h3>
              <button onClick={() => setShowSystemMenu(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Google Calendar */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Google Calendar</span>
                </div>
                {googleUserId ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          syncGoogleEvents(googleUserId);
                          setShowSystemMenu(false);
                        }}
                        disabled={syncing}
                        className="flex-1 px-3 py-2 bg-green-600 rounded flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        Sincronizza
                      </button>
                      <button
                        onClick={() => {
                          disconnectGoogleCalendar();
                          setShowSystemMenu(false);
                        }}
                        className="px-3 py-2 bg-red-600 rounded flex items-center gap-2 text-sm"
                      >
                        <CloudOff className="w-4 h-4" />
                        Disconnetti
                      </button>
                    </div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      ✓ Connesso
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      connectGoogleCalendar();
                      setShowSystemMenu(false);
                    }}
                    className="w-full px-3 py-2 bg-blue-600 rounded flex items-center justify-center gap-2"
                  >
                    <Cloud className="w-4 h-4" />
                    Connetti
                  </button>
                )}
              </div>

              {/* CalDAV */}
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
                        <div className="text-xs text-gray-400 mb-2">{acc.serverUrl}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              syncCalDAVEvents(acc.caldavId);
                              setShowSystemMenu(false);
                            }}
                            className="flex-1 px-2 py-1 bg-green-600 rounded text-xs flex items-center justify-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Sync
                          </button>
                          <button
                            onClick={() => {
                              disconnectCalDAV(acc.caldavId);
                            }}
                            className="px-2 py-1 bg-red-600 rounded text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setShowCaldavModal(true);
                        setShowSystemMenu(false);
                      }}
                      className="w-full px-3 py-2 bg-purple-600 rounded text-sm"
                    >
                      + Aggiungi altro account
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowCaldavModal(true);
                      setShowSystemMenu(false);
                    }}
                    className="w-full px-3 py-2 bg-purple-600 rounded flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Connetti
                  </button>
                )}
              </div>

              {/* Account personalizzati */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Account Locali</span>
                  <button
                    onClick={() => {
                      setShowAccountsPanel(true);
                      setShowSystemMenu(false);
                    }}
                    className="text-blue-400 text-sm"
                  >
                    Gestisci
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  {accounts.filter(a => a.active).length} account attivi
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
          <div className="space-y-0.5 mt-0.5">
            {dateEvents.slice(0, 2).map(event => {
              const account = accounts.find(acc => acc.id === event.accountId);
              return (
                <div
                  key={event.id}
                  className="text-[8px] px-0.5 rounded truncate"
                  style={{ backgroundColor: account?.color, color: 'white' }}
                >
                  {event.title}
                </div>
              );
            })}
            {dateEvents.length > 2 && (
              <div className="text-[8px] text-gray-400">+{dateEvents.length - 2}</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (showDayView && selectedDate) {
    const dayEvents = getEventsForDate(selectedDate);
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowDayView(false)} className="p-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold">
              {selectedDate.getDate()} {t.months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>
            <button
              onClick={() => {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                setNewEvent({ 
                  ...newEvent, 
                  date: dateStr,
                  eventType: 'regular'
                });
                setEditingEvent(null);
                setShowDayView(false);
                setShowEventModal(true);
              }}
              className="p-2"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center text-gray-400 py-8">{t.noEvents}</div>
          ) : (
            dayEvents.map(event => {
              const account = accounts.find(acc => acc.id === event.accountId);
              return (
                <div key={event.id} className="bg-gray-800 rounded-lg p-4 border-l-4" style={{ borderColor: account?.color }}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg flex-1">{event.title}</h3>
                    <div className="flex gap-3 ml-2">
                      <button onClick={() => handleEditEvent(event)} className="text-blue-400 p-2 hover:bg-gray-700 rounded">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="text-red-400 p-2 hover:bg-gray-700 rounded">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {(event.startTime || event.endTime) && (
                    <div className="text-sm text-gray-300 mb-1">
                      {event.startTime} {event.endTime && `- ${event.endTime}`}
                    </div>
                  )}
                  {event.location && (
                    <div className="text-sm text-gray-400 mb-1">📍 {event.location}</div>
                  )}
                  {event.description && (
                    <div className="text-sm text-gray-300 mt-2">{event.description}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">{account?.name}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (showAccountsPanel) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowAccountsPanel(false)} className="p-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold">{t.activeAccounts}</h2>
            <button onClick={handleAddAccount} className="p-2 text-blue-400">
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {accounts.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Nessun account. Premi + per aggiungerne uno.</div>
          ) : (
            accounts.map(account => (
              <div key={account.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={account.active}
                    onChange={() => toggleAccount(account.id)}
                    className="w-6 h-6"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600" style={{ backgroundColor: account.color }}></div>
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-xs text-gray-400">{accountTypes.find(t => t.value === account.type)?.label}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-9">
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="flex-1 px-3 py-2 bg-gray-700 rounded flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    {t.edit}
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="flex-1 px-3 py-2 bg-red-600 rounded flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.delete}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
            <div className="bg-gray-800 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold">
                  {editingAccount ? t.editAccount : t.addAccount}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.accountName}</label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    placeholder={t.accountNamePlaceholder}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.accountType}</label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {accountTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.accountColor}</label>
                  <div className="grid grid-cols-5 gap-3 mb-3">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        onClick={() => setAccountForm({ ...accountForm, color })}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          accountForm.color === color ? 'border-white scale-110' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={accountForm.color}
                    onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-4">
                <button
                  onClick={() => {
                    setShowAccountModal(false);
                    setEditingAccount(null);
                    setAccountForm({ name: '', type: 'google', color: '#4285f4' });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 rounded-lg font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveAccount}
                  disabled={!accountForm.name.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-500" />
            Calendar4jw
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSystemMenu(!showSystemMenu)}
              className="p-2 bg-gray-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-medium"
            >
              <option value="it">IT</option>
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <button 
              onClick={() => setViewMode('month')}
              className={`px-2 py-1 rounded text-xs ${viewMode === 'month' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              {t.monthView}
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-2 py-1 rounded text-xs ${viewMode === 'week' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              {t.weekView}
            </button>
            <button 
              onClick={() => setViewMode('agenda')}
              className={`px-2 py-1 rounded text-xs ${viewMode === 'agenda' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              {t.agendaView}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAccountsPanel(true)} className="px-3 py-2 bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" />
            {t.accounts}
          </button>
          <button
            onClick={() => {
              setEditingEvent(null);
              setNewEvent({ ...newEvent, date: new Date().toISOString().split('T')[0], eventType: 'regular' });
              setShowEventModal(true);
            }}
            className="px-3 py-2 bg-blue-600 rounded-lg flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            {t.newEvent}
          </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button onClick={() => changeMonth(-1)} className="p-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {t.months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={goToToday} className="px-2 py-1 text-xs bg-blue-600 rounded">
              {t.today}
            </button>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-2">
        {viewMode === 'month' && (
          <>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {t.days.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {renderCalendar()}
            </div>
          </>
        )}

        {viewMode === 'week' && (
          <div>
            <div className="grid grid-cols-7 gap-1">
              {getWeekDates(currentDate).map((date, idx) => {
                const dayEvents = getEventsForDate(date);
                const isToday = new Date().toDateString() === date.toDateString();
                
                return (
                  <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
                    <div className={`text-center py-2 ${isToday ? 'bg-blue-900' : 'bg-gray-800'}`}>
                      <div className="text-xs text-gray-400">{t.days[date.getDay()]}</div>
                      <div className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                    <div className="p-2 space-y-1 min-h-[200px] bg-gray-850">
                      {dayEvents.map(event => {
                        const account = accounts.find(acc => acc.id === event.accountId);
                        return (
                          <div
                            key={event.id}
                            className="text-xs p-2 rounded cursor-pointer"
                            style={{ backgroundColor: account?.color, color: 'white' }}
                            onClick={() => {
                              setSelectedDate(date);
                              setShowDayView(true);
                            }}
                          >
                            <div className="font-semibold truncate">{event.title}</div>
                            {event.startTime && (
                              <div className="text-[10px] opacity-90">{event.startTime}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'agenda' && (
          <div className="space-y-3">
            {getNextDays(30).map(date => {
              const dayEvents = getEventsForDate(date);
              if (dayEvents.length === 0) return null;
              
              const isToday = new Date().toDateString() === date.toDateString();
              
              return (
                <div key={date.toISOString()} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className={`p-3 border-l-4 ${isToday ? 'border-blue-500 bg-blue-900' : 'border-gray-600'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-2xl font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>
                        {date.getDate()}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isToday ? 'text-blue-400' : 'text-white'}`}>
                          {t.days[date.getDay()]}
                        </div>
                        <div className="text-xs text-gray-400">
                          {t.months[date.getMonth()]} {date.getFullYear()}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.map(event => {
                        const account = accounts.find(acc => acc.id === event.accountId);
                        return (
                          <div
                            key={event.id}
                            className="bg-gray-700 p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-600"
                            style={{ borderColor: account?.color }}
                            onClick={() => {
                              setSelectedDate(date);
                              setShowDayView(true);
                            }}
                          >
                            <div className="font-semibold">{event.title}</div>
                            {(event.startTime || event.endTime) && (
                              <div className="text-sm text-gray-300 mt-1">
                                {event.startTime} {event.endTime && `- ${event.endTime}`}
                              </div>
                            )}
                            {event.location && (
                              <div className="text-sm text-gray-400 mt-1">📍 {event.location}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">{account?.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {getNextDays(30).every(date => getEventsForDate(date).length === 0) && (
              <div className="text-center text-gray-400 py-8">
                {t.noEvents}
              </div>
            )}
          </div>
        )}
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold">{editingEvent ? t.edit + ' ' + t.newEvent : t.newEvent}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.selectEventType}</label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => {
                    const type = e.target.value;
                    const template = eventTypeTemplates[type];
                    setNewEvent({ 
                      ...newEvent, 
                      eventType: type,
                      title: template.title || newEvent.title
                    });
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="regular">{t.regularEvent}</option>
                  <option value="circuitAssembly">{t.circuitAssembly}</option>
                  <option value="regionalConvention">{t.regionalConvention}</option>
                  <option value="memorial">{t.memorial}</option>
                  <option value="specialTalk">{t.specialTalk}</option>
                  <option value="coVisit">{t.coVisit}</option>
                  <option value="coVisitEnd">{t.coVisitEnd}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.eventTitle}</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder={t.eventTitlePlaceholder}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.date}</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.startTime}</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.endTime}</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.location}</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder={t.locationPlaceholder}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.description}</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder={t.descriptionPlaceholder}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.account}</label>
                <select
                  value={newEvent.accountId}
                  onChange={(e) => setNewEvent({ ...newEvent, accountId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 rounded-lg font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex-1 px-4 py-3 bg-blue-600 rounded-lg font-medium"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold">
                {editingAccount ? t.editAccount : t.addAccount}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.accountName}</label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder={t.accountNamePlaceholder}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.accountType}</label>
                <select
                  value={accountForm.type}
                  onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.accountColor}</label>
                <div className="grid grid-cols-5 gap-3 mb-3">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      onClick={() => setAccountForm({ ...accountForm, color })}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        accountForm.color === color ? 'border-white scale-110' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={accountForm.color}
                  onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  setEditingAccount(null);
                  setAccountForm({ name: '', type: 'google', color: '#4285f4' });
                }}
                className="flex-1 px-4 py-3 bg-gray-700 rounded-lg font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveAccount}
                disabled={!accountForm.name.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showCaldavModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold">{t.caldavConnect}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.caldavAccountName}</label>
                <input
                  type="text"
                  value={caldavForm.accountName}
                  onChange={(e) => setCaldavForm({ ...caldavForm, accountName: e.target.value })}
                  placeholder="es. Nextcloud"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.caldavServerUrl}</label>
                <input
                  type="url"
                  value={caldavForm.serverUrl}
                  onChange={(e) => setCaldavForm({ ...caldavForm, serverUrl: e.target.value })}
                  placeholder={t.caldavServerPlaceholder}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.caldavUsername}</label>
                <input
                  type="text"
                  value={caldavForm.username}
                  onChange={(e) => setCaldavForm({ ...caldavForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.caldavPassword}</label>
                <input
                  type="password"
                  value={caldavForm.password}
                  onChange={(e) => setCaldavForm({ ...caldavForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              
              {caldavAccounts.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-2">Account connessi:</h4>
                  {caldavAccounts.map(acc => (
                    <div key={acc.caldavId} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg mb-2">
                      <div>
                        <div className="font-medium">{acc.accountName}</div>
                        <div className="text-xs text-gray-400">{acc.serverUrl}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => syncCalDAVEvents(acc.caldavId)}
                          className="p-2 bg-green-600 rounded"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => disconnectCalDAV(acc.caldavId)}
                          className="p-2 bg-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 p-4">
              <button
                onClick={() => {
                  setShowCaldavModal(false);
                  setCaldavForm({ serverUrl: '', username: '', password: '', accountName: '' });
                }}
                className="flex-1 px-4 py-3 bg-gray-700 rounded-lg font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={connectCalDAV}
                className="flex-1 px-4 py-3 bg-purple-600 rounded-lg font-medium"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;