export const helpContent = {
  it: {
    helpTitle: 'Guida all\'uso',
    sections: [
      {
        title: '🚀 Primi Passi',
        content: `<h3>Benvenuto in Calendar4JW!</h3>
<p>Questa app ti permette di gestire il tuo calendario personale sincronizzandolo con Google Calendar e server CalDAV/Nextcloud.</p>
<p><strong>Funzionalità principali:</strong></p>
<ul>
<li>✅ Sincronizzazione con più account Google Calendar</li>
<li>✅ Supporto CalDAV/Nextcloud</li>
<li>✅ Import/Export file ICS</li>
<li>✅ Tracciamento ore di servizio (SB/CB/BS)</li>
<li>✅ Descrizioni HTML formattate</li>
<li>✅ Modalità chiara/scura</li>
</ul>`
      },
      {
        title: '📱 Aggiungere Account Google',
        content: `<h3>Connetti Google Calendar</h3>
<ol>
<li>Tocca <strong>⚙️</strong> (Impostazioni) in alto a destra</li>
<li>Scorri fino a <strong>"Account Google Calendar"</strong></li>
<li>Tocca <strong>"+ Aggiungi Account Google"</strong></li>
<li>Accedi con il tuo account Google</li>
<li>Autorizza l'accesso al calendario</li>
<li>L'app sincronizzerà automaticamente gli eventi</li>
</ol>
<p><strong>💡 Suggerimento:</strong> Puoi aggiungere più account Google (lavoro, personale, ecc.) e sincronizzarli separatamente.</p>`
      },
      {
        title: '🔐 Configurare CalDAV/Nextcloud',
        content: `<h3>Configurazione</h3>
<ol>
<li>Vai su Impostazioni → <strong>"Account CalDAV"</strong></li>
<li>Inserisci:
  <ul>
    <li><strong>URL Server:</strong> es. https://dav.infomaniak.com/calendars/tuouser</li>
    <li><strong>Username:</strong> il tuo username</li>
    <li><strong>Password:</strong> password o token app</li>
    <li><strong>Nome Account:</strong> nome descrittivo (es. "Nextcloud Casa")</li>
  </ul>
</li>
<li>Tocca <strong>"Connetti"</strong></li>
<li>Seleziona i calendari da sincronizzare</li>
</ol>
<p><strong>🔒 Sicurezza:</strong> La password è criptata localmente sul tuo dispositivo.</p>`
      },
      {
        title: '📥 Import/Export Eventi',
        content: `<h3>Esportare Eventi</h3>
<ol>
<li>Tocca <strong>⚙️</strong> → <strong>"Esporta eventi (.ics)"</strong></li>
<li>Scegli dove salvare il file</li>
<li>Il file .ics contiene tutti i tuoi eventi</li>
</ol>

<h3>Importare Eventi</h3>
<ol>
<li>Tocca <strong>⚙️</strong> → <strong>"Importa eventi (.ics)"</strong></li>
<li>Seleziona il file .ics</li>
<li>Gli eventi saranno aggiunti al calendario locale</li>
</ol>
<p><strong>💡 Usa questa funzione per:</strong> Backup, migrazione da altre app, condivisione con altri.</p>`
      },
      {
        title: '⏱️ Tracciamento Ore di Servizio',
        content: `<p>Per registrare le ore di servizio, usa il pulsante con l'<strong>orologio ⏱️</strong> quando crei un evento.</p>
<p>Le statistiche mensili saranno visualizzate automaticamente nella vista Mese.</p>`
      },
      {
        title: '🎨 Personalizzazione',
        content: `<h3>Cambiare Tema</h3>
<p>Vai su <strong>Impostazioni</strong> e scegli:
<ul>
<li>☀️ <strong>Chiaro:</strong> tema luminoso</li>
<li>🌙 <strong>Scuro:</strong> tema scuro (risparmia batteria su OLED)</li>
<li>📱 <strong>Sistema:</strong> segue le impostazioni Android</li>
</ul>

<h3>Colori Account</h3>
<p>Quando aggiungi un account, puoi assegnargli un colore. Gli eventi di quell'account avranno quel colore nel calendario.</p>`
      },
      {
        title: '❓ Risoluzione Problemi',
        content: `<h3>Sincronizzazione non funziona</h3>
<ul>
<li>✅ Verifica connessione internet</li>
<li>✅ Controlla username/password CalDAV</li>
<li>✅ Google: prova a disconnettere e riconnettere</li>
<li>✅ CalDAV: verifica URL server (deve iniziare con https://)</li>
</ul>

<h3>Eventi duplicati</h3>
<p>Se vedi eventi doppi dopo la sincronizzazione, disconnetti e ricollega l'account.</p>

<h3>Password CalDAV dimenticata</h3>
<p>Rimuovi l'account e aggiungilo nuovamente con la password corretta.</p>

<h3>Errore "App non verificata" (Google)</h3>
<p>Durante il login Google, clicca su <strong>"Avanzate"</strong> → <strong>"Vai a Calendar4JW (non sicuro)"</strong>. Questo è normale per app in sviluppo.</p>`
      }
    ]
  },
  es: {
    helpTitle: 'Guía de Uso',
    sections: [
      {
        title: '🚀 Primeros Pasos',
        content: `<h3>¡Bienvenido a Calendar4JW!</h3>
<p>Esta app te permite gestionar tu calendario personal sincronizándolo con Google Calendar y servidores CalDAV/Nextcloud.</p>
<p><strong>Funciones principales:</strong></p>
<ul>
<li>✅ Sincronización con múltiples cuentas Google Calendar</li>
<li>✅ Soporte CalDAV/Nextcloud</li>
<li>✅ Importar/Exportar archivos ICS</li>
<li>✅ Seguimiento de horas de servicio (SB/CB/BS)</li>
<li>✅ Descripciones HTML formateadas</li>
<li>✅ Modo claro/oscuro</li>
</ul>`
      },
      {
        title: '📱 Añadir Cuenta Google',
        content: `<h3>Conectar Google Calendar</h3>
<ol>
<li>Toca <strong>⚙️</strong> (Configuración) arriba a la derecha</li>
<li>Desplázate hasta <strong>"Cuentas Google Calendar"</strong></li>
<li>Toca <strong>"+ Añadir Cuenta Google"</strong></li>
<li>Inicia sesión con tu cuenta Google</li>
<li>Autoriza el acceso al calendario</li>
<li>La app sincronizará automáticamente los eventos</li>
</ol>
<p><strong>💡 Consejo:</strong> Puedes añadir múltiples cuentas Google (trabajo, personal, etc.) y sincronizarlas por separado.</p>`
      },
      {
        title: '🔐 Configurar CalDAV/Nextcloud',
        content: `<h3>Configuración</h3>
<ol>
<li>Ve a Configuración → <strong>"Cuentas CalDAV"</strong></li>
<li>Introduce:
  <ul>
    <li><strong>URL Servidor:</strong> ej. https://dav.infomaniak.com/calendars/tuusuario</li>
    <li><strong>Usuario:</strong> tu nombre de usuario</li>
    <li><strong>Contraseña:</strong> contraseña o token de app</li>
    <li><strong>Nombre Cuenta:</strong> nombre descriptivo (ej. "Nextcloud Casa")</li>
  </ul>
</li>
<li>Toca <strong>"Conectar"</strong></li>
<li>Selecciona los calendarios a sincronizar</li>
</ol>
<p><strong>🔒 Seguridad:</strong> La contraseña se cifra localmente en tu dispositivo.</p>`
      },
      {
        title: '📥 Importar/Exportar Eventos',
        content: `<h3>Exportar Eventos</h3>
<ol>
<li>Toca <strong>⚙️</strong> → <strong>"Exportar eventos (.ics)"</strong></li>
<li>Elige dónde guardar el archivo</li>
<li>El archivo .ics contiene todos tus eventos</li>
</ol>

<h3>Importar Eventos</h3>
<ol>
<li>Toca <strong>⚙️</strong> → <strong>"Importar eventos (.ics)"</strong></li>
<li>Selecciona el archivo .ics</li>
<li>Los eventos se añadirán al calendario local</li>
</ol>
<p><strong>💡 Usa esta función para:</strong> Respaldo, migración desde otras apps, compartir con otros.</p>`
      },
      {
        title: '⏱️ Seguimiento Horas de Servicio',
        content: `<p>Para registrar horas de servicio, usa el botón con el <strong>reloj ⏱️</strong> al crear un evento.</p>
<p>Las estadísticas mensuales se mostrarán automáticamente en la vista Mes.</p>`
      },
      {
        title: '🎨 Personalización',
        content: `<h3>Cambiar Tema</h3>
<p>Ve a <strong>Configuración</strong> y elige:
<ul>
<li>☀️ <strong>Claro:</strong> tema luminoso</li>
<li>🌙 <strong>Oscuro:</strong> tema oscuro (ahorra batería en OLED)</li>
<li>📱 <strong>Sistema:</strong> sigue la configuración de Android</li>
</ul>

<h3>Colores de Cuenta</h3>
<p>Al añadir una cuenta, puedes asignarle un color. Los eventos de esa cuenta tendrán ese color en el calendario.</p>`
      },
      {
        title: '❓ Solución de Problemas',
        content: `<h3>La sincronización no funciona</h3>
<ul>
<li>✅ Verifica conexión a internet</li>
<li>✅ Comprueba usuario/contraseña CalDAV</li>
<li>✅ Google: intenta desconectar y reconectar</li>
<li>✅ CalDAV: verifica URL del servidor (debe empezar con https://)</li>
</ul>

<h3>Eventos duplicados</h3>
<p>Si ves eventos dobles después de sincronizar, desconecta y vuelve a conectar la cuenta.</p>

<h3>Contraseña CalDAV olvidada</h3>
<p>Elimina la cuenta y añádela nuevamente con la contraseña correcta.</p>

<h3>Error "App no verificada" (Google)</h3>
<p>Durante el inicio de sesión Google, haz clic en <strong>"Avanzado"</strong> → <strong>"Ir a Calendar4JW (no seguro)"</strong>. Esto es normal para apps en desarrollo.</p>`
      }
    ]
  },
  en: {
    helpTitle: 'User Guide',
    sections: [
      {
        title: '🚀 Getting Started',
        content: `<h3>Welcome to Calendar4JW!</h3>
<p>This app allows you to manage your personal calendar by syncing with Google Calendar and CalDAV/Nextcloud servers.</p>
<p><strong>Main features:</strong></p>
<ul>
<li>✅ Sync with multiple Google Calendar accounts</li>
<li>✅ CalDAV/Nextcloud support</li>
<li>✅ Import/Export ICS files</li>
<li>✅ Service hours tracking (SB/CB/BS)</li>
<li>✅ HTML formatted descriptions</li>
<li>✅ Light/Dark mode</li>
</ul>`
      },
      {
        title: '📱 Add Google Account',
        content: `<h3>Connect Google Calendar</h3>
<ol>
<li>Tap <strong>⚙️</strong> (Settings) in the top right</li>
<li>Scroll to <strong>"Google Calendar Accounts"</strong></li>
<li>Tap <strong>"+ Add Google Account"</strong></li>
<li>Sign in with your Google account</li>
<li>Authorize calendar access</li>
<li>The app will automatically sync events</li>
</ol>
<p><strong>💡 Tip:</strong> You can add multiple Google accounts (work, personal, etc.) and sync them separately.</p>`
      },
      {
        title: '🔐 Configure CalDAV/Nextcloud',
        content: `<h3>Setup</h3>
<ol>
<li>Go to Settings → <strong>"CalDAV Accounts"</strong></li>
<li>Enter:
  <ul>
    <li><strong>Server URL:</strong> e.g. https://dav.infomaniak.com/calendars/youruser</li>
    <li><strong>Username:</strong> your username</li>
    <li><strong>Password:</strong> password or app token</li>
    <li><strong>Account Name:</strong> descriptive name (e.g. "Nextcloud Home")</li>
  </ul>
</li>
<li>Tap <strong>"Connect"</strong></li>
<li>Select calendars to sync</li>
</ol>
<p><strong>🔒 Security:</strong> Password is encrypted locally on your device.</p>`
      },
      {
        title: '📥 Import/Export Events',
        content: `<h3>Export Events</h3>
<ol>
<li>Tap <strong>⚙️</strong> → <strong>"Export events (.ics)"</strong></li>
<li>Choose where to save the file</li>
<li>The .ics file contains all your events</li>
</ol>

<h3>Import Events</h3>
<ol>
<li>Tap <strong>⚙️</strong> → <strong>"Import events (.ics)"</strong></li>
<li>Select the .ics file</li>
<li>Events will be added to the local calendar</li>
</ol>
<p><strong>💡 Use this for:</strong> Backup, migration from other apps, sharing with others.</p>`
      },
      {
        title: '⏱️ Service Hours Tracking',
        content: `<p>To log service hours, use the <strong>clock button ⏱️</strong> when creating an event.</p>
<p>Monthly statistics will be displayed automatically in Month view.</p>`
      },
      {
        title: '🎨 Customization',
        content: `<h3>Change Theme</h3>
<p>Go to <strong>Settings</strong> and choose:
<ul>
<li>☀️ <strong>Light:</strong> bright theme</li>
<li>🌙 <strong>Dark:</strong> dark theme (saves battery on OLED)</li>
<li>📱 <strong>System:</strong> follows Android settings</li>
</ul>

<h3>Account Colors</h3>
<p>When adding an account, you can assign it a color. Events from that account will have that color in the calendar.</p>`
      },
      {
        title: '❓ Troubleshooting',
        content: `<h3>Sync not working</h3>
<ul>
<li>✅ Check internet connection</li>
<li>✅ Verify CalDAV username/password</li>
<li>✅ Google: try disconnecting and reconnecting</li>
<li>✅ CalDAV: verify server URL (must start with https://)</li>
</ul>

<h3>Duplicate events</h3>
<p>If you see double events after sync, disconnect and reconnect the account.</p>

<h3>Forgot CalDAV password</h3>
<p>Remove the account and add it again with the correct password.</p>

<h3>"App not verified" error (Google)</h3>
<p>During Google sign-in, click <strong>"Advanced"</strong> → <strong>"Go to Calendar4JW (unsafe)"</strong>. This is normal for apps in development.</p>`
      }
    ]
  }
};
