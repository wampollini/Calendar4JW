// Utility per importazione/esportazione file ICS (iCalendar)

/**
 * Formatta data per ICS nel formato YYYYMMDD o YYYYMMDDTHHMMSS
 */
const formatICSDate = (dateStr, timeStr = null) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':');
    return `${year}${month}${day}T${hours}${minutes}00`;
  }
  
  return `${year}${month}${day}`;
};

/**
 * Escape caratteri speciali per formato ICS
 */
const escapeICS = (str) => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

/**
 * Unescape caratteri dal formato ICS
 */
const unescapeICS = (str) => {
  if (!str) return '';
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
};

/**
 * Esporta array di eventi in formato ICS
 */
export const exportEventsToICS = (events, calendarName = 'Calendar4JW') => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendar4JW//Calendar 1.0//EN',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:UTC',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    const uid = event.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const dtstamp = formatICSDate(new Date().toISOString().split('T')[0]);
    
    // DTSTART
    let dtstart = event.startTime 
      ? `DTSTART:${formatICSDate(event.date, event.startTime)}`
      : `DTSTART;VALUE=DATE:${formatICSDate(event.date)}`;
    
    // DTEND
    let dtend = '';
    if (event.endDate) {
      dtend = event.endTime
        ? `DTEND:${formatICSDate(event.endDate, event.endTime)}`
        : `DTEND;VALUE=DATE:${formatICSDate(event.endDate)}`;
    } else if (event.endTime) {
      dtend = `DTEND:${formatICSDate(event.date, event.endTime)}`;
    }

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${uid}`);
    icsContent.push(`DTSTAMP:${dtstamp}`);
    icsContent.push(dtstart);
    if (dtend) icsContent.push(dtend);
    icsContent.push(`SUMMARY:${escapeICS(event.title)}`);
    
    if (event.location) {
      icsContent.push(`LOCATION:${escapeICS(event.location)}`);
    }
    
    if (event.description) {
      // Se è HTML, aggiungi come X-ALT-DESC per compatibilità, e come testo semplice in DESCRIPTION
      if (/<\/?[a-z][\s\S]*>/i.test(event.description)) {
        icsContent.push(`X-ALT-DESC;FMTTYPE=text/html:${escapeICS(event.description)}`);
        // Versione testo semplice (strip HTML base)
        const textOnly = event.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        icsContent.push(`DESCRIPTION:${escapeICS(textOnly)}`);
      } else {
        icsContent.push(`DESCRIPTION:${escapeICS(event.description)}`);
      }
    }

    // Ricorrenza
    if (event.recurring && event.recurring !== 'none') {
      let rrule = 'RRULE:';
      switch (event.recurring) {
        case 'daily':
          rrule += 'FREQ=DAILY';
          break;
        case 'weekly':
          rrule += 'FREQ=WEEKLY';
          break;
        case 'monthly':
          rrule += 'FREQ=MONTHLY';
          break;
        case 'yearly':
          rrule += 'FREQ=YEARLY';
          break;
      }
      
      if (event.recurringEndDate) {
        rrule += `;UNTIL=${formatICSDate(event.recurringEndDate)}`;
      }
      
      icsContent.push(rrule);
    }

    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');
  
  return icsContent.join('\r\n');
};

/**
 * Importa file ICS e restituisce array di eventi
 */
export const importEventsFromICS = (icsContent) => {
  const lines = icsContent.split(/\r?\n/);
  const events = [];
  let currentEvent = null;
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Gestione line folding (righe che continuano)
    while (i + 1 < lines.length && lines[i + 1].match(/^[ \t]/)) {
      i++;
      line += lines[i].trim();
    }

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {
        title: '',
        date: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        recurring: 'none',
        recurringEndDate: ''
      };
    } else if (line === 'END:VEVENT' && inEvent) {
      inEvent = false;
      if (currentEvent.title || currentEvent.date) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (inEvent && currentEvent) {
      const colonIndex = line.indexOf(':');
      const semicolonIndex = line.indexOf(';');
      
      let key, value, params = '';
      
      if (semicolonIndex !== -1 && (colonIndex === -1 || semicolonIndex < colonIndex)) {
        key = line.substring(0, semicolonIndex);
        const rest = line.substring(semicolonIndex + 1);
        const colonInRest = rest.indexOf(':');
        if (colonInRest !== -1) {
          params = rest.substring(0, colonInRest);
          value = rest.substring(colonInRest + 1);
        }
      } else if (colonIndex !== -1) {
        key = line.substring(0, colonIndex);
        value = line.substring(colonIndex + 1);
      }

      if (!key || !value) continue;

      switch (key) {
        case 'SUMMARY':
          currentEvent.title = unescapeICS(value);
          break;
        
        case 'DTSTART':
          // Formato: YYYYMMDD o YYYYMMDDTHHMMSS
          const startMatch = value.match(/(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2}))?/);
          if (startMatch) {
            currentEvent.date = `${startMatch[1]}-${startMatch[2]}-${startMatch[3]}`;
            if (startMatch[5] && startMatch[6]) {
              currentEvent.startTime = `${startMatch[5]}:${startMatch[6]}`;
            }
          }
          break;
        
        case 'DTEND':
          const endMatch = value.match(/(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2}))?/);
          if (endMatch) {
            const endDate = `${endMatch[1]}-${endMatch[2]}-${endMatch[3]}`;
            // Solo se diverso dalla data di inizio
            if (endDate !== currentEvent.date) {
              currentEvent.endDate = endDate;
            }
            if (endMatch[5] && endMatch[6]) {
              currentEvent.endTime = `${endMatch[5]}:${endMatch[6]}`;
            }
          }
          break;
        
        case 'LOCATION':
          currentEvent.location = unescapeICS(value);
          break;
        
        case 'DESCRIPTION':
          currentEvent.description = unescapeICS(value);
          break;
        
        case 'X-ALT-DESC':
          // HTML description (priorità su DESCRIPTION se presente)
          if (params.includes('text/html')) {
            currentEvent.description = unescapeICS(value);
          }
          break;
        
        case 'RRULE':
          // Parsing RRULE base
          if (value.includes('FREQ=DAILY')) {
            currentEvent.recurring = 'daily';
          } else if (value.includes('FREQ=WEEKLY')) {
            currentEvent.recurring = 'weekly';
          } else if (value.includes('FREQ=MONTHLY')) {
            currentEvent.recurring = 'monthly';
          } else if (value.includes('FREQ=YEARLY')) {
            currentEvent.recurring = 'yearly';
          }
          
          // UNTIL
          const untilMatch = value.match(/UNTIL=(\d{4})(\d{2})(\d{2})/);
          if (untilMatch) {
            currentEvent.recurringEndDate = `${untilMatch[1]}-${untilMatch[2]}-${untilMatch[3]}`;
          }
          break;
      }
    }
  }

  return events;
};

/**
 * Download file ICS
 */
export const downloadICS = (icsContent, filename = 'calendar.ics') => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Leggi file ICS caricato
 */
export const readICSFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const events = importEventsFromICS(content);
        resolve(events);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
