# Store Listing & Permission Justifications — Samyukt Doit

**Application Package Name:** `com.samyukt.doit`  
**App Name:** Samyukt Doit  
**Category:** Productivity / Developer Tools  

---

## 1. Google Play Store Listing

### App Title
`Samyukt Doit: QA & Task Tracker` (31/30 chars -> `Samyukt Doit: Task & QA Track`)

### Short Description (80 characters)
`Fast bug capture, instant task management, and offline test sessions for teams.`

### Full Description
Samyukt Doit is the high-velocity issue reporting and task tracking system built for modern product and QA teams. Report bugs without ever switching apps, capture rich device telemetry automatically, and turn voice notes into structured tickets in under 5 seconds.

**Key Features:**
• **Quick Capture Overlay:** Floating action bubble lets you report bugs directly over any third-party app under test.
• **Shake to Report:** Trigger instant screen capture and audio dictation with a quick wrist shake.
• **Offline Outbox:** Works anywhere. Mutations queue locally and sync with zero duplicates using idempotent replay.
• **Contextual Keyboard Bar:** Pick due dates, priorities, severity, and labels without leaving your text input.
• **Intelligent Voice Structuring:** Speak naturally in English or Hindi; AI parses your voice note into concise reproduction steps and titles.
• **WCAG AA/AAA Design System:** 5 refined brand accents (Indigo, Teal, Amber, Rose, Violet) with native dark mode support.
• **Kanban Board & My Day:** Manage tasks, stickies, and bug queues across multiple workspaces with zero latency.

---

## 2. Store Permission Justifications

### Overlay Permission (`android.permission.SYSTEM_ALERT_WINDOW`)
> Samyukt Doit is a defect-reporting and QA testing application. The floating capture button allows a tester to document a software issue without switching away from the third-party application being tested, which is the product's primary functionality. The overlay displays a single, small draggable button and an input sheet; it does not read, intercept, or modify other applications' content.

### Foreground Service (`FOREGROUND_SERVICE_TYPE_SPECIAL_USE`)
> The foreground service keeps the capture button accessible while the tester interacts with an external app under test, and hosts the active timed test session. It is always accompanied by a persistent notification featuring an immediate "Stop" action and battery-conscious execution.

### Screen Capture / MediaProjection
> Used strictly during an active test session explicitly initiated by the user, to automatically attach a frame screenshot of the defect being reported. MediaProjection stops immediately upon session termination.

### Microphone (`android.permission.RECORD_AUDIO` / `NSMicrophoneUsageDescription`)
> Used solely when the user taps or holds the microphone button to dictate bug descriptions or voice notes for transcription.

### Notifications (`android.permission.POST_NOTIFICATIONS`)
> Used to alert testers when tasks are assigned, when issues are resolved, and to maintain the foreground test session status indicator.

---

## 3. Screenshots Specification
1. **Screen 1 (Home / My Day):** Dark mode overview with project metrics, pinned stickies, and floating navbar.
2. **Screen 2 (Kanban Board):** 4-column board with To Do, In Progress, Blocked, and Done task cards.
3. **Screen 3 (Quick Capture Bubble):** Floating bubble over third-party app with instant bug report sheet.
4. **Screen 4 (Bug Detail & Auto-Context):** Telemetry card displaying device model, OS, app under test, and build number.
5. **Screen 5 (Contextual Keyboard Bar):** Composer showing single-tap chips (Today, Tomorrow, Priority, Voice, Send).
