# Privacy Policy for Calendar4JW

**Effective Date**: March 15, 2026  
**Last Updated**: March 16, 2026

## Introduction

Calendar4JW ("we", "our", or "the app") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.

## Developer Information

**Developer**: William Ampollini  
**Contact Email**: wampollini@gmail.com  
**Application**: Calendar4JW  
**Platform**: Android

## Information We Collect

### Information You Provide
- **Calendar Events**: Event titles, dates, times, locations, and descriptions that you create or sync
- **Service Hours**: Field service hours and visit counts that you manually enter
- **Google Account**: When you choose to sync with Google Calendar, we access your email address to identify your account

### Automatically Collected Information
- **Local Storage**: All data is stored locally on your device using browser localStorage
- **No Analytics**: We do not collect usage statistics, crash reports, or any telemetry data
- **No Tracking**: We do not use cookies, tracking pixels, or any tracking mechanisms

## How We Use Your Information

### Google Calendar Integration
When you connect your Google account:
- We request read and write access to your Google Calendar (`https://www.googleapis.com/auth/calendar` scope)
- We sync your calendar events between Google Calendar and the local app
- We store your Google Calendar events locally on your device
- We use OAuth 2.0 tokens to access your calendar data

### Data Storage
- **All data is stored locally** on your device
- We do NOT store any data on remote servers
- We do NOT have access to your data
- Data remains on your device until you uninstall the app or clear app data

### CalDAV/Nextcloud Integration
When you connect a CalDAV/Nextcloud account:
- You provide the server URL, username, and password
- Credentials are stored locally on your device in encrypted form
- **CalDAV requests are proxied through a Cloudflare Worker** to bypass CORS restrictions
- The Cloudflare proxy (`caldav-proxy.cal4jw-backend.workers.dev`) acts as a pass-through:
  - It receives your CalDAV server URL, credentials, and event data
  - It forwards the request to your CalDAV server
  - It returns the response to your device
  - **No data is logged or stored on the Cloudflare server**
- The proxy is necessary for technical reasons (CORS and WebDAV protocol support)
- You can review the proxy source code at: `cloudflare-worker/caldav-proxy.js` in our GitHub repository

## Data Sharing and Third Parties

### We Do NOT:
- Sell your data to third parties
- Share your data with advertisers
- Transfer your data to external servers (except direct sync with Google/CalDAV)
- Use your data for marketing purposes
- Access your data remotely

### Third-Party Services:
- **Google Calendar API**: Used only when you explicitly choose to sync with Google Calendar
- **Firebase Console**: Used only for app distribution (not for data collection)
- **CalDAV Servers**: Your calendar data syncs with your self-hosted CalDAV server
- **Cloudflare Workers**: CalDAV requests pass through a Cloudflare proxy server to resolve technical limitations (CORS). The proxy does not store or log your data

## Your Data Rights

You have the right to:
- **Access**: View all your data within the app
- **Modify**: Edit or delete any calendar events or service hours
- **Export**: Export your events in ICS format
- **Delete**: Disconnect Google/CalDAV accounts at any time
- **Complete Removal**: Uninstall the app to remove all local data

## Data Security

### Security Measures:
- OAuth 2.0 tokens are stored locally w in encrypted form using AES-256-GCM
- All communications with Google/CalDAV use HTTPS encryption
- CalDAV requests pass through a Cloudflare proxy that acts as a pass-through without logging or storing data
- No remote database or cloud storage is used for permanent data storageTTPS encryption
- No remote database or cloud storage is used

### Token Management:
- Google OAuth tokens expire after 55 minutes and are automatically refreshed
- Tokens are stored locally in browser localStorage
- You can revoke access at any time through your Google Account settings

## Children's Privacy

Calendar4JW is suitable for users of all ages. We do not knowingly collect personal information from children. Since all data is stored locally and we do not collect any information remotely, there is no risk of unauthorized data collection.

## Changes to Privacy Policy

We may update this Privacy Policy from time to time. We will notify users of any material changes by:
- Updating the "Last Updated" date
- Including change notes in app release notes
- Posting the updated policy in the app repository

## Data Retention

- **Local Data**: Retained on your device until you delete it or uninstall the app
- **Google Calendar Data**: Governed by Google's retention policies
- **CalDAV Data**: Governed by your CalDAV server's policies

## Your Consent

By using Calendar4JW and connecting your Google Calendar or CalDAV account, you consent to this Privacy Policy.

## Open Source

Calendar4JW is open source software. You can review the source code at:
**GitHub Repository**: https://github.com/wampollini/Calendar4JW

## Contact Us

If you have questions or concerns about this Privacy Policy or our data practices, please contact us:

**Email**: wampollini@gmail.com  
**GitHub**: https://github.com/wampollini/Calendar4JW/issues

## Google API Services User Data Policy Compliance

Calendar4JW's use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

Specifically:
- We only request the minimum scopes necessary (`calendar` scope)
- We use Google user data only to provide and improve user-facing features
- We do not transfer Google user data to third parties
- We do not use Google user data for serving advertisements
- We do not allow humans to read Google user data unless:
  - We have your explicit consent
  - It's necessary for security purposes
  - It's required to comply with applicable law

---

**Last Review Date**: March 15, 2026
