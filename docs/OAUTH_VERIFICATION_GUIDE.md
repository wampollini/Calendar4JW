# Google OAuth Verification Guide for Calendar4JW https://youtu.be/6KNvCxQH12s

This document contains all the information needed to submit Calendar4JW for Google OAuth verification.

## Application Information

**Application Name**: Calendar4JW  
**Application Type**: Android Mobile App  
**Developer Name**: William Ampollini  
**Developer Email**: wampollini@gmail.com  
**GitHub Repository**: https://github.com/wampollini/Calendar4JW  
**Firebase Console**: https://console.firebase.google.com/project/calendar4jw-prod

## OAuth Scopes Used

### Primary Scope
- **Scope**: `https://www.googleapis.com/auth/calendar`
- **Justification**: Required to read and write user's Google Calendar events for synchronization with the app

### Why This Scope is Necessary
Calendar4JW is a calendar management app that allows users to:
1. View their Google Calendar events in the app
2. Create new events that sync to Google Calendar
3. Edit existing Google Calendar events
4. Delete events from Google Calendar
5. Keep calendar data synchronized between the app and Google Calendar

The app respects user privacy by:
- Storing all data locally on the device
- Google Calendar sync happens directly between the device and Google (no intermediary servers)
- CalDAV sync uses a Cloudflare proxy for technical reasons (CORS), but the proxy does not store data
- Using Google's API only for direct sync between user's device and their Google Calendar

## Application Privacy Policy

**URL**: https://raw.githubusercontent.com/wampollini/Calendar4JW/main/docs/PRIVACY_POLICY.md

Key points:
- All data stored locally on user's device
- Google Calendar sync: direct communication, no intermediary servers
- CalDAV sync: uses a Cloudflare pass-through proxy (required for CORS) that does not log or store data
- No data collection or analytics
- No third-party data sharing
- Full user control over data

## Application Terms of Service

**URL**: https://raw.githubusercontent.com/wampollini/Calendar4JW/main/docs/TERMS_OF_SERVICE.md

## Application Homepage

**URL**: https://github.com/wampollini/Calendar4JW

## How to Demonstrate App Functionality

### Video Script for OAuth Verification

**Duration**: 2-3 minutes

#### Scene 1: App Launch (0:00-0:30)
- Open Calendar4JW app
- Show main calendar view with local events
- Explain: "This is Calendar4JW, a calendar app that stores data locally on your device"

#### Scene 2: Google Sign-In Process (0:30-1:00)
- Tap on System Menu (three lines icon)
- Tap on "Aggiungi Account Google" button
- Show Google OAuth consent screen
- Point out the calendar scope being requested
- Explain: "The app requests access to Google Calendar to sync your events"
- Complete sign-in

#### Scene 3: Data Access (1:00-1:30)
- Show events being synced from Google Calendar
- Create a new event in the app
- Show the event now appears in Google Calendar (open Google Calendar app)
- Explain: "Events are synchronized directly between your device and Google Calendar"

#### Scene 4: Data Control (1:30-2:00)
- Show how to disconnect Google account
- Show export functionality (Export ICS)
- Explain: "Users have full control over their data"

#### Scene 5: Privacy Features (2:00-2:30)
- Open app settings
- Show that no analytics or tracking is enabled
- Explain: "All data stays on your device. We don't collect any information"
- Show GitHub repository: "The app is open source, you can verify everything"

## OAuth Configuration Details

### Current Configuration
```
Project: calendar4jw-prod
OAuth Client ID: 278165724364-f67mcfiuh61qgmjn4qkoiq79q95c7phs.apps.googleusercontent.com
OAuth Consent Screen: External
Publishing Status: Testing (needs to be changed to "In Production")
```

### Steps to Submit for Verification

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/apis/credentials/consent
   - Project: calendar4jw-prod

2. **Update OAuth Consent Screen**
   - Application name: Calendar4JW
   - User support email: wampollini@gmail.com
   - Application logo: (upload the app icon)
   - Application home page: https://github.com/wampollini/Calendar4JW
   - Application privacy policy: https://raw.githubusercontent.com/wampollini/Calendar4JW/main/docs/PRIVACY_POLICY.md
   - Application terms of service: https://raw.githubusercontent.com/wampollini/Calendar4JW/main/docs/TERMS_OF_SERVICE.md
   - Authorized domains: github.com, firebase.google.com

3. **Scopes Configuration**
   - Ensure `https://www.googleapis.com/auth/calendar` is listed
   - Add justification: "Full calendar access is required to synchronize user's calendar events between the mobile app and Google Calendar. Users can view, create, edit, and delete calendar events."

4. **Publish the App**
   - Change status from "Testing" to "In Production"
   - This makes the consent screen available to all users

5. **Submit for Verification**
   - Click "Submit for Verification" button
   - Fill out the verification questionnaire
   - Upload demonstration video
   - Wait for Google's review (2-6 weeks typically)

## Verification Questionnaire Answers

### Why does your app need access to sensitive or restricted user data?
"Calendar4JW is a personal calendar management app that helps users organize their schedules. The app needs access to Google Calendar to provide seamless synchronization between the user's mobile device and their Google Calendar. This allows users to view, create, edit, and delete calendar events from the mobile app while keeping everything in sync with their Google Calendar."

### How does your app enhance user functionality?
"The app enhances user functionality by:
1. Providing an alternative calendar interface optimized for Jehovah's Witnesses' needs
2. Adding field service hour tracking integrated with calendar events
3. Offering offline-first functionality with local data storage
4. Supporting CalDAV/Nextcloud for users who prefer self-hosted solutions
5. Providing Android home screen widgets for quick access to upcoming events"

### Describe the user experience flow
"1. User installs Calendar4JW from Firebase App Distribution
2. User can create and manage calendar events locally
3. Optionally, user taps 'Add Google Account' in the app menu
4. User authorizes the app to access their Google Calendar
5. App syncs existing Google Calendar events to the device
6. Usercalendar data remains on the user's device; Google Calendar data is never sent to our servers (direct API calls only)gle Calendar
7. All data remains on the user's device; no data is sent to our servers"

### Explain how you use the requested scopes
"We use the `https://www.googleapis.com/auth/calendar` scope to:
- Fetch calendar events from the user's primary Google Calendar
- Create new calendar events in Google Calendar when users create events in the app
- Update existing calendar events when users edit them
- Delete calendar events when users remove them from the app
All API calls are made directly from the user's device to Google's servers. We do not store any Google Calendar data on our servers. (Note: CalDAV sync, when used, passes through a Cloudflare proxy for technical reasons, but this does not apply to Google Calendar sync.)"

### What alternatives did you consider?
"We considered using limited scopes like `calendar.readonly`, but this would prevent users from creating or editing events through the app, which is a core feature. We also considered implementing our own cloud sync, but this would require storing user data on our servers, which goes against our privacy-first approach."

### Is your app publicly available?
"The app is currently in beta testing via Firebase App Distribution. The source code is publicly available on GitHub (https://github.com/wampollini/Calendar4JW) as open-source software. We plan to publish to Google Play Store after OAuth verification is approved."

## Data Handling Certification

When asked about data handling, you should certify:

✅ **Limited Use**: We use Google user data only to provide calendar sync functionality  
✅ **No Selling**: We do not sell user data to anyone  
✅ **No Transfer**: We do not transfer user data to third parties  
✅ **No Ads**: We do not use user data for advertising  
✅ **Local Storage**: All data is stored locally on user's device  
✅ **Open Source**: Code is publicly available for audit  

## Expected Timeline

- **Submission**: Immediate (as soon as documents are ready)
- **Initial Review**: 1-2 weeks
- **Verification Process**: 2-6 weeks total
- **Follow-up Questions**: Google may ask for clarifications
- **Approval**: App can be used by unlimited users without "unverified" warning

## Checklist Before Submission

- [x] Privacy Policy created and published
- [x] Terms of Service created and published
- [x] OAuth Consent Screen configured
- [ ] App logo uploaded (use app icon from resources/)
- [ ] Demonstration video recorded
- [ ] Verification form filled out
- [ ] App published from Testing to Production

## Support and Questions

If Google asks follow-up questions during verification, refer to:
- **Source Code**: https://github.com/wampollini/Calendar4JW
- **OAuth Implementation**: src/App.jsx (syncGoogle function)
- **Token Management**: See how tokens are stored in localStorage
- **Google Calendar Sync**: Direct API calls, no server-side component
- **CalDAV Sync**: Uses Cloudflare proxy (cloudflare-worker/caldav-proxy.js) for CORS bypass, but does not apply to Google Calendar

## Tips for Successful Verification

1. **Be Transparent**: Clearly explain that you're an independent developer making a free app
2. **Emphasize Privacy**: Highlight that Google Calendar data syncs directly between device and Google (direct API calls, no intermediary servers)
3. **Show Code**: Reference the open-source repository
4. **Be Patient**: Verification can take several weeks
5. **Respond Quickly**: If Google asks questions, respond within 24-48 hours

---

**Prepared by**: William Ampollini  
**Date**: March 15, 2026  
**Version**: 1.0
