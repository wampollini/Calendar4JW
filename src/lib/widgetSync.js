// Widget sync helper per Android
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Aggiorna i dati del widget con gli eventi correnti
 * @param {Array} events - Array di eventi da mostrare nel widget
 */
export async function updateWidgetData(events) {
  try {
    console.log('[WidgetSync] Aggiornamento widget con', events.length, 'eventi totali');
    console.log('[WidgetSync] Platform:', Capacitor.getPlatform());
    
    // Solo su Android
    if (Capacitor.getPlatform() !== 'android') {
      console.log('[WidgetSync] Not on Android, skipping');
      return null;
    }
    
    // Filtra solo gli eventi necessari (oggi + prossimi 7 giorni)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const filteredEvents = events
      .filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .map(e => ({
        title: e.title,
        date: e.date,
        endDate: e.endDate || e.date,
        startTime: e.startTime || '',
        endTime: e.endTime || '',
        color: e.color || '#4285F4',
        location: e.location || ''
      }));
    
    console.log('[WidgetSync] Eventi filtrati per widget:', filteredEvents.length);
    
    const eventsJson = JSON.stringify(filteredEvents);
    console.log('[WidgetSync] Salvando in Preferences, lunghezza:', eventsJson.length);
    
    // Salva usando Capacitor Preferences
    await Preferences.set({
      key: 'widget_events',
      value: eventsJson
    });
    
    console.log('[WidgetSync] Eventi salvati in Preferences');
    
    // Verifica che sia stato salvato
    const check = await Preferences.get({ key: 'widget_events' });
    console.log('[WidgetSync] Verifica salvataggio - lunghezza:', check.value ? check.value.length : 0);
    
    // Salva anche in localStorage per debug
    localStorage.setItem('widget_events_debug', eventsJson);
    console.log('[WidgetSync] Salvato anche in localStorage');
    
    return { success: true, widgetsUpdated: 1 };
  } catch (error) {
    console.error('[WidgetSync] Errore aggiornamento widget:', error);
    throw error;
  }
}

/**
 * Verifica se ci sono widget attivi
 */
export async function hasActiveWidgets() {
  return true; // Su Android assume sempre che ci siano widget
}
