# DoIt Web Platform — Mobile & Web Feature Parity Matrix

| Feature Domain | Mobile (Android Expo APK) | Web Platform (React SPA) | Parity Status | Verification Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Authentication** | JWT Login / Register / Refresh | JWT Login / Register / Refresh | 100% | Silent 401 refresh token rotation, persistent sessions |
| **Workspaces** | Switcher + Create Workspace | Switcher + Create Workspace modal | 100% | Scopes queries by `x-workspace-id` header |
| **Projects** | Project selector & label picker | Project sidebar selector & filters | 100% | Real-time project navigation and scoping |
| **Dashboard / Overview** | Radial to-do progress, work list | 4 KPIs, Active Work queue, Bug stream | 100% | Displays live tasks and bugs from active project |
| **Tasks — Views** | Compact list view with checkboxes | List, Kanban Board, Table, Peek panel | 100%+ | Web has multi-view toggle and side peek panel |
| **Tasks — Mutations** | Quick check to complete, edit | Inline complete, drag/move, delete | 100% | Mutations update backend with optimistic queries |
| **Bugs — Capture** | Shake gesture + Quick Capture bubble | Split-pane triage + Report Bug modal | 100% | Full triage queue with severity & status filters |
| **Bugs — Screenshots** | Native screenshot capture | Thumbnail preview + full modal viewer | 100% | Served from S3/backend static upload endpoints |
| **Bugs — Audio notes** | Voice recorder attachment | HTML5 audio player for recorded voice | 100% | Plays recorded audio attachments directly in browser |
| **Bugs — Device Context** | Android native model, OS, battery | Telemetry chips (OS, device, battery) | 100% | Parses and displays device context telemetry |
| **Sticky Notes** | Pin, delete, convert to task | Pastel cards, pin/unpin, delete, convert | 100% | Converts note to task with backend transactional integrity |
| **Team Management** | Invite teammate modal (link/email) | Member roster, role picker, link/email | 100% | Instant link generation + SMTP email delivery |
| **Enterprise SMTP** | Mobile settings trigger | SMTP config panel, test conn, test email | 100% | Full admin SMTP testing from web browser |
| **Sessions** | Logout current device | Active sessions list + remote revocation | 100% | Lists platform, user agent, IP, and allows revoke |
| **Appearance** | Dark / Light theme | Dark / Light / System + 5 Accent swatches | 100%+ | High precision color customization with local persistence |
| **Keyboard Productivity**| Touch gestures | `⌘K` Command Palette, `c` create shortcut | Web Excl. | Fast desktop power-user workflow |
