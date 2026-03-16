# Calendar4JW

<div align="center">
  <img src="resources/icon.png" alt="Calendar4JW Icon" width="128" height="128">
  
  **A privacy-focused calendar app for Jehovah's Witnesses**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Platform](https://img.shields.io/badge/Platform-Android-green.svg)](https://www.android.com/)
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-6.2.1-orange.svg)](https://capacitorjs.com/)
</div>

---

## 📱 Overview

Calendar4JW is a free, open-source calendar and field service hour tracking application for Android devices. Built with privacy in mind, all data is stored locally on your device.

### ✨ Key Features

- **📅 Calendar Management**: Create, edit, and manage calendar events
- **🔄 Google Calendar Sync**: Optional synchronization with Google Calendar
- **☁️ CalDAV/Nextcloud Support**: Self-hosted calendar integration
- **⏱️ Field Service Tracking**: Track hours and visits for field ministry
- **🔔 Notifications**: Smart event reminders
- **📊 Monthly Statistics**: Visual graphs of monthly service totals
- **🏠 Home Screen Widgets**: Quick access to upcoming events
- **🔒 Privacy First**: All data stored locally, no external servers
- **🌐 Multi-language**: Italian and English support
- **📤 Import/Export**: ICS file support for data portability

---

## 🚀 Quick Start

### Installation

1. Download the latest APK from [Firebase App Distribution](https://console.firebase.google.com/project/calendar4jw-prod/appdistribution)
2. Enable "Install from unknown sources" on your Android device
3. Install the APK
4. Grant necessary permissions (calendar, notifications)

### Building from Source

```bash
# Clone the repository
git clone https://github.com/wampollini/Calendar4JW.git
cd Calendar4JW

# Install dependencies
npm install

# Build for development
npm run dev

# Build for Android
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

---

## 📚 Documentation

### Legal Documents
- **[Privacy Policy](docs/PRIVACY_POLICY.md)** - How we handle your data
- **[Terms of Service](docs/TERMS_OF_SERVICE.md)** - Terms of use

### Developer Resources
- **[OAuth Verification Guide](docs/OAUTH_VERIFICATION_GUIDE.md)** - Guide for Google OAuth verification
- **[Video Script](docs/VIDEO_SCRIPT.md)** - Script for demonstration video
- **[Distribution Guide](DISTRIBUTION.md)** - How to distribute via Firebase

---

## 🔐 Privacy & Security

Calendar4JW is built with privacy as a core principle:

- ✅ **Local Storage**: All data stored on your device
- ✅ **No Tracking**: No analytics or telemetry
- ✅ **No Ads**: Completely ad-free
- ✅ **Open Source**: Full code transparency
- ✅ **Optional Cloud Sync**: You control what syncs
- ✅ **No Data Collection**: No backend database or data collection infrastructure

When you choose to sync with Google Calendar or CalDAV:
- **Google Calendar**: Data flows directly between your device and Google (no intermediary servers)
- **CalDAV**: Uses a Cloudflare proxy for technical reasons (CORS), but the proxy does not log or store data
- We never see or store your calendar data
- You can disconnect at any time

Read our full [Privacy Policy](docs/PRIVACY_POLICY.md).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 4, Tailwind CSS
- **Mobile**: Capacitor 6 (Android)
- **Authentication**: Google OAuth 2.0
- **Storage**: LocalStorage (client-side)
- **APIs**: Google Calendar API v3, CalDAV
- **Build**: Gradle 8.11.1, Java 21
- **Distribution**: Firebase App Distribution

---

## 🔑 Google OAuth Scope

Calendar4JW requests the following Google API scope:

- **`https://www.googleapis.com/auth/calendar`**
  - **Purpose**: Read and write access to user's Google Calendar
  - **Usage**: Sync calendar events between app and Google Calendar
  - **Data Handling**: All data remains on user's device; no server storage

This scope is necessary to provide:
1. View Google Calendar events in the app
2. Create new events in Google Calendar
3. Edit existing events
4. Delete events from Google Calendar
5. Bidirectional synchronization

Calendar4JW complies with [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

---

## 📖 Usage

### Connecting Google Calendar

1. Open Calendar4JW
2. Tap the menu icon (☰)
3. Tap "Aggiungi Account Google"
4. Sign in with your Google account
5. Grant calendar access
6. Events will sync automatically

### Adding CalDAV/Nextcloud

1. Open Settings
2. Tap "Aggiungi Account CalDAV"
3. Enter server URL, username, and password
4. Tap "Connetti"
5. Select calendars to sync

### Tracking Field Service

1. Tap on a day in the calendar
2. Enter hours in hh:mm format (e.g., 2:30)
3. Use `:`, `.`, `,`, or `;` as separator
4. Enter number of visits
5. Tap "Salva"

### Exporting Data

1. Open menu
2. Tap "Esporta ICS"
3. Choose location
4. Save file for backup or import elsewhere

---

## 🤝 Contributing

Contributions are welcome! This project is open source under the MIT License.

### Development Setup

```bash
npm install
npm run dev
```

### Code Structure

```
src/
├── App.jsx           # Main app component
├── main.jsx          # Entry point
├── translations.js   # Localization
├── lib/
│   ├── caldavSync.js    # CalDAV integration
│   ├── encryption.js    # Credential encryption
│   ├── icsUtils.js      # ICS file handling
│   ├── notifications.js # Push notifications
│   └── widgetSync.js    # Android widget sync
└── services/
    └── api.js           # API utilities
```

---

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025-2026 William Ampollini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👤 Author

**William Ampollini**
- Email: wampollini@gmail.com
- GitHub: [@wampollini](https://github.com/wampollini)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/wampollini/Calendar4JW/issues)
- **Email**: wampollini@gmail.com

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Capacitor](https://capacitorjs.com/)
- Icons from app resources
- Thanks to the Jehovah's Witnesses community for feedback

---

<div align="center">
  Made with ❤️ for the JW community
</div>
