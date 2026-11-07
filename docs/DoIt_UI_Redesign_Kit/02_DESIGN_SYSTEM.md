# DoIt — Design System Specification

This is the single source of truth for the redesign. If the repository already contains a token or component system, audit and consolidate it rather than creating a parallel system.

## 1. Visual direction

**Style:** minimal, professional, neutral, product-focused.

Use a restrained neutral foundation with one configurable accent color. The app should feel closer to a high-quality work tool than a playful consumer to-do list.

Avoid:
- Neon/glowing effects
- Large decorative gradients
- Heavy drop shadows
- Excessive outlines and nested cards
- Random corner radii
- Emoji as interface icons
- Different visual treatments for the same component

## 2. Token model

Define tokens centrally. Values below are starting guidance; inspect the existing app and tune them against actual device screenshots.

### Spacing scale
Use a 4-point base grid:
- `space.1 = 4`
- `space.2 = 8`
- `space.3 = 12`
- `space.4 = 16`
- `space.5 = 20`
- `space.6 = 24`
- `space.8 = 32`
- `space.10 = 40`
- `space.12 = 48`

Use consistent horizontal screen padding, normally 20–24 dp on phones. Avoid arbitrary per-screen offsets.

### Shape scale
- Small controls/chips: 8–10 dp
- Inputs/buttons: 10–12 dp
- Standard cards/sheets: 14–18 dp
- Floating navigation: fully rounded capsule only if it remains visually balanced
- Avoid rounding every nested element.

### Typography
Create a small, consistent type scale:
- Large page title: 28–32, semibold
- Screen title: 24–28, semibold
- Section title: 16–18, semibold
- Body: 14–16, regular
- Supporting/meta: 12–13, regular
- Button/field label: 14–15, medium

Use the existing font if it is legible and consistent. Avoid using many weights or tiny metadata. Support system font scaling without clipping.

### Color semantics
Create named semantic tokens, not raw hex values scattered through components:
- `background`
- `surface`
- `surfaceElevated`
- `surfaceSubtle`
- `textPrimary`
- `textSecondary`
- `textTertiary`
- `borderSubtle`
- `borderStrong`
- `accent`
- `accentForeground`
- `success`
- `warning`
- `danger`
- `info`
- `overlay`
- `disabled`

Create explicit light and dark palettes. Check contrast for text, icons, borders, focus/selected states, and disabled states. Accent selection must work in both themes.

### Elevation
Prefer surface contrast and subtle borders over shadows. Use elevation only for floating elements, menus, and modal sheets. Do not create a shadow around every card.

## 3. Component standards

Build or consolidate reusable components for:
- Screen scaffold / safe-area handling
- Page header and section header
- Floating bottom navigation
- Primary, secondary, ghost, and destructive buttons
- Icon button
- Text input, multiline input, search input
- Select/dropdown and searchable picker
- Filter chip and segmented control
- Task row / task card
- Bug row / bug card
- Status and priority indicator
- Avatar and member row
- Empty state
- Loading skeleton
- Error/retry state
- Bottom sheet / modal
- Confirmation dialog
- Toast/snackbar
- Sticky note
- Voice recording control and upload status
- Attachment/telemetry section

Each component must have:
- Consistent dimensions and spacing
- Light and dark theme support
- Disabled, pressed, focused, selected, and error states where applicable
- Accessible labels and adequate touch targets (aim for 44–48 dp)
- No hidden business logic that belongs in feature/domain layers

## 4. Layout rules

- Use safe-area insets on all screens.
- Keep a consistent content width and horizontal padding.
- Align headers, lists, forms, and floating navigation to the same layout grid.
- Keep list rows compact but comfortably tappable.
- Use dividers sparingly; whitespace should do most of the grouping.
- Keep primary actions reachable and never underneath the keyboard or navigation.
- For sheets, use consistent corner radius, handle, padding, backdrop, and dismissal behavior.
- Use platform-appropriate keyboard avoidance and scroll-to-focused-field behavior.

## 5. Navigation requirements

- Keep the existing navigation architecture unless it is demonstrably broken.
- Preserve all routes and deep links.
- Floating bottom navigation should visually float above the page content with transparent surrounding space.
- Do not render a full-width opaque rectangle behind the floating capsule.
- Ensure correct bottom inset on devices with gesture navigation and traditional navigation bars.
- Hide or adapt navigation on flows where it conflicts with focused data entry, if current product behavior supports that.

## 6. Motion

- Use short, purposeful transitions.
- Prefer subtle opacity/position transitions for sheets and screen changes.
- Avoid springy or bouncy movement for routine business workflows.
- Do not animate list layout in a way that causes visual instability.
- Respect reduced-motion preferences.

## 7. Accessibility and localization

- Maintain readable contrast.
- Support dynamic type/font scaling.
- Provide accessibility labels for icon-only controls.
- Ensure status is not communicated by color alone.
- Avoid text clipping for longer project names, task titles, and translated labels.
- Ensure controls remain usable with screen readers.
