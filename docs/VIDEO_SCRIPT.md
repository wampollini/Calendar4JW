# Video Demonstration Script for Google OAuth Verification

## Equipment Needed
- Android device with Calendar4JW installed
- Screen recording app (e.g., AZ Screen Recorder, Samsung Game Launcher)
- Google account for testing

## Recording Settings
- **Resolution**: 1080p (minimum 720p)
- **Duration**: 2-3 minutes
- **Audio**: Optional but helpful for explanations
- **Orientation**: Portrait mode

## Video Script

### Introduction (0:00-0:20)
**Action**: Show app icon on home screen, open the app
**Narration**: 
> "This is Calendar4JW, an open-source calendar app for Android. The app stores all data locally on your device and optionally syncs with Google Calendar."

**Show**:
- App icon
- Main calendar view
- Some existing local events

---

### Feature Overview (0:20-0:40)
**Action**: Navigate through the calendar interface
**Show**:
- Monthly calendar view
- Event details
- Field service hours section
- Menu options

**Narration**:
> "Users can manage calendar events, track field service hours, and organize their schedule entirely offline."

---

### Google OAuth Flow (0:40-1:20)
**Action**: Connect Google account (THIS IS THE CRITICAL PART)

**Steps**:
1. Tap hamburger menu (☰)
2. Tap "Aggiungi Account Google"
3. **PAUSE and HIGHLIGHT**: Show the Google OAuth consent screen
4. **POINT OUT**: "The app requests access to Google Calendar scope"
5. Review permissions screen
6. Tap "Allow" / "Consenti"
7. Show loading/syncing indicator

**Narration**:
> "When users choose to sync with Google Calendar, they see the standard OAuth consent screen. The app requests only the Google Calendar scope, which is necessary to read and write calendar events. Users can revoke this access at any time from their Google Account settings."

**IMPORTANT**: Make sure to capture the entire OAuth consent screen clearly, showing:
- App name
- Requested permissions
- Google's verification notice
- Allow/Deny buttons

---

### Data Synchronization (1:20-1:50)
**Action**: Demonstrate that sync works

**Steps**:
1. Show events appearing from Google Calendar in the app
2. Create a NEW event in Calendar4JW
   - Add title: "Demo Event"
   - Set date and time
   - Save
3. Open Google Calendar app (or web browser)
4. **Show the same event now exists in Google Calendar**
5. Edit the event in Calendar4JW
6. Show the edit reflected in Google Calendar

**Narration**:
> "Events are synchronized directly between the user's device and their Google Calendar. When I create an event here, it immediately appears in Google Calendar. All communication happens directly through Google's API - we don't store any data on our servers."

---

### Privacy and Control (1:50-2:20)
**Action**: Show user control features

**Steps**:
1. Open app menu
2. Show the connected Google account
3. Tap to show account options
4. Point to "Disconnetti" (Disconnect) option
5. Show Export ICS feature
6. Navigate to app info/settings (optional)

**Narration**:
> "Users have complete control over their data. They can disconnect their Google account at any time, export their calendar to ICS format, or simply uninstall the app to remove all local data."

---

### Open Source & Privacy (2:20-2:40)
**Action**: Show GitHub repository (optional - can use screen from PC)

**Steps**:
1. Open browser to https://github.com/wampollini/Calendar4JW
2. Scroll through the code
3. Show src/App.jsx with OAuth implementation
4. Show docs/PRIVACY_POLICY.md

**Narration**:
> "Calendar4JW is completely open source. Anyone can review the code to verify that we only use Google Calendar data for synchronization and that no data is sent to third-party servers. Our privacy policy is transparent and available publicly."

---

### Conclusion (2:40-3:00)
**Action**: Return to app, show calendar with synced events

**Narration**:
> "Calendar4JW provides a privacy-focused calendar experience with optional Google Calendar sync. All data remains under user control."

**Show**:
- Final view of the working calendar
- App name and version
- End screen

---

## Recording Tips

### DO:
✅ Use a clean test account without personal events
✅ Hold device steady or use a phone stand
✅ Ensure good lighting
✅ Show the entire OAuth consent screen clearly
✅ Demonstrate actual functionality (create event → shows in Google)
✅ Keep video under 3 minutes
✅ Record in quiet environment
✅ Show app responding to user actions

### DON'T:
❌ Rush through the OAuth consent screen
❌ Use personal/sensitive calendar data
❌ Edit or speed up the OAuth flow
❌ Show unrelated apps or notifications
❌ Include personal information
❌ Make the video too long (>5 minutes)

---

## Post-Recording Checklist

- [ ] Video clearly shows OAuth consent screen
- [ ] Requested scope (`calendar`) is visible
- [ ] Video demonstrates actual data flow (create event → sync to Google)
- [ ] Video is under 5 minutes
- [ ] Audio is clear (if included)
- [ ] No personal data visible
- [ ] Video format is MP4 or WebM
- [ ] File size is under 100MB

---

## Upload Instructions

1. **Save video** with descriptive filename: `Calendar4JW_OAuth_Demo.mp4`
2. **Upload to YouTube** as "Unlisted" video (not Private or Public)
3. **Title**: "Calendar4JW - Google OAuth Verification Demo"
4. **Description**:
   ```
   OAuth verification demonstration for Calendar4JW
   
   Calendar4JW is an open-source calendar app that optionally syncs with Google Calendar.
   This video demonstrates how the app uses the Google Calendar API scope.
   
   Source code: https://github.com/wampollini/Calendar4JW
   Privacy Policy: https://raw.githubusercontent.com/wampollini/Calendar4JW/main/docs/PRIVACY_POLICY.md
   ```
5. **Copy YouTube URL** and paste it in the OAuth verification form

---

## Alternative: Screen Recording Apps

### Recommended Apps:
1. **AZ Screen Recorder** (Free, no watermark)
2. **Screen Recorder - XRecorder** (Free)
3. **Samsung Game Launcher** (Built-in for Samsung devices)
4. **Google Play Games** (Built-in screen recording)

### Recording on Device:
- Open the screen recorder app
- Configure quality settings (1080p)
- Start recording
- Follow the script above
- Stop recording
- Transfer video to PC for upload

---

## Questions During Review?

If Google has questions about the video, refer to:
- **Source code**: https://github.com/wampollini/Calendar4JW/blob/main/src/App.jsx
- **OAuth implementation**: Search for `syncGoogle` function
- **Privacy policy**: docs/PRIVACY_POLICY.md
- **No backend**: Explain the app is purely client-side

---

**Created**: March 15, 2026  
**For**: Google OAuth Verification  
**App**: Calendar4JW v1.1
