import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Richiede i permessi per le notifiche
 */
export async function requestNotificationPermissions() {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Errore richiesta permessi notifiche:', error);
    return false;
  }
}

/**
 * Controlla se i permessi sono già stati concessi
 */
export async function checkNotificationPermissions() {
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Errore controllo permessi:', error);
    return false;
  }
}

/**
 * Schedula una notifica per un evento
 * @param {Object} event - L'evento per cui creare la notifica
 * @param {number} minutesBefore - Minuti prima dell'evento (default: 15)
 */
export async function scheduleEventNotification(event, minutesBefore = 15) {
  try {
    // Non schedulare se non ha orario di inizio (controlla anche stringa vuota)
    if (!event.startTime || event.startTime === '') {
      return false;
    }
    
    // Controlla permessi
    const hasPermission = await checkNotificationPermissions();
    
    if (!hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        return false;
      }
    }

    // Calcola data/ora della notifica
    const eventDateTime = new Date(`${event.date}T${event.startTime || '00:00'}`);
    const notificationTime = new Date(eventDateTime.getTime() - minutesBefore * 60000);
    const now = new Date();

    // Non schedulare solo se la notifica è già passata
    if (notificationTime.getTime() < now.getTime()) {
      return false;
    }

    // Crea il testo della notifica (sanitizza caratteri speciali)
    const sanitize = (str) => str ? String(str).replace(/[\u0000-\u001F\u007F-\u009F]/g, '') : '';
    const title = sanitize(`📅 ${event.title}`);
    const body = event.startTime 
      ? sanitize(`Tra ${minutesBefore} minuti alle ${event.startTime}`)
      : sanitize(`Tra ${minutesBefore} minuti`);

    // ID deve essere int Java valido (max 2147483647)
    // Usa hash semplice dell'ID originale
    const hashId = Math.abs(String(event.id).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)) % 2147483647;

    // Schedula la notifica
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId,
        title: title,
        body: body,
        schedule: { at: notificationTime },
        sound: 'default',
        extra: { eventId: String(event.id) }
      }]
    });

    return true;

  } catch (error) {
    console.error('Errore schedulazione notifica:', error);
    return false;
  }
}

/**
 * Cancella la notifica di un evento
 * @param {string|number} eventId - ID dell'evento
 */
export async function cancelEventNotification(eventId) {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: parseInt(eventId) }]
    });
    console.log(`Notifica cancellata per evento ${eventId}`);
    return true;
  } catch (error) {
    console.error('Errore cancellazione notifica:', error);
    return false;
  }
}

/**
 * Aggiorna tutte le notifiche per gli eventi
 * @param {Array} events - Array di eventi
 * @param {number} defaultMinutesBefore - Minuti prima per default
 */
export async function updateAllNotifications(events, defaultMinutesBefore = 15) {
  try {
    console.log('[Notifications] Updating all notifications, events count:', events.length);
    
    // Filtra solo eventi futuri con orario
    const now = new Date();
    console.log('[Notifications] Current time:', now.toLocaleString());
    
    const futureEvents = events.filter(event => {
      if (!event.startTime || event.startTime === '') {
        console.log('[Notifications] Skipping event (no time/all-day):', event.title);
        return false;
      }
      const eventDateTime = new Date(`${event.date}T${event.startTime}`);
      const isFuture = eventDateTime > now;
      console.log('[Notifications] Event:', event.title, 'at', eventDateTime.toLocaleString(), 'future:', isFuture);
      return isFuture;
    });
    
    console.log('[Notifications] Future events with time:', futureEvents.length);
    
    // Cancella tutte le notifiche esistenti
    const pending = await LocalNotifications.getPending();
    console.log('[Notifications] Pending notifications:', pending.notifications.length);
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    // Schedula notifiche per eventi futuri
    let scheduled = 0;
    let skipped = [];
    let skipReasons = [];
    let errors = [];
    
    for (const event of futureEvents) {
      const minutesBefore = event.notifyBefore || defaultMinutesBefore;
      try {
        console.log(`[LOOP] Processing: ${event.title}, startTime="${event.startTime}", type=${typeof event.startTime}`);
        const success = await scheduleEventNotification(event, minutesBefore);
        if (success) {
          scheduled++;
        } else {
          const eventTime = new Date(`${event.date}T${event.startTime}`);
          const notifTime = new Date(eventTime.getTime() - minutesBefore * 60000);
          const isPast = notifTime.getTime() < Date.now();
          const isInvalid = isNaN(eventTime.getTime());
          const reason = isInvalid ? 'DATA_INVALIDA' : (isPast ? 'PASSATO' : 'ALTRO');
          skipReasons.push(`${event.title}: ${reason} (${event.date} ${event.startTime})`);
          skipped.push(`${event.title} (${event.date} ${event.startTime})`);
        }
      } catch (err) {
        errors.push(`${event.title}: ${err.message}`);
        skipped.push(`${event.title} (${event.date} ${event.startTime}) - ERROR`);
      }
    }

    console.log(`[Notifications] Scheduled ${scheduled} notifications for ${futureEvents.length} future events`);
    
    // Alert di debug
    const skippedInfo = skipped.length > 0 ? `\n\nSKIP (${skipped.length}):\n${skipReasons.slice(0, 3).join('\n')}${skipReasons.length > 3 ? `\n...+${skipReasons.length - 3}` : ''}` : '';
    const errorInfo = errors.length > 0 ? `\n\nERRORI:\n${errors.slice(0, 2).join('\n')}` : '';
    alert(`🔔 Debug:\nTotali: ${events.length}\nFuturi: ${futureEvents.length}\nSchedulate: ${scheduled}${skippedInfo}${errorInfo}`);
    
    return scheduled;

  } catch (error) {
    console.error('Errore aggiornamento notifiche:', error);
    return 0;
  }
}
