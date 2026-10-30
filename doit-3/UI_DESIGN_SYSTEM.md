# UI Design System

## Visual direction
A calm, professional, Plane-inspired productivity UI: compact, precise, low-noise, and highly usable. Use the supplied screenshot as general inspiration for hierarchy and navigation density, not as a pixel-perfect reproduction. Do not copy proprietary logos or assets.

## Principles
- Consistent surfaces, typography, spacing and interaction patterns.
- Compact but breathable: avoid excessive horizontal/vertical padding and giant empty areas.
- Prefer subtle separators and surface contrast over many nested cards.
- Use motion only to communicate state; keep it quick and restrained.
- No neon, glow effects, unnecessary gradients or decorative emoji.
- Use a single icon family and consistent stroke weight.
- Primary navigation may use a floating bottom bar, but it must respect device safe areas and keyboard visibility.

## Theme model
- Modes: System, Light, Dark.
- Accent presets (initial): Blue, Violet, Green, Amber, Rose.
- Semantic tokens: `background`, `surface`, `surfaceElevated`, `textPrimary`, `textSecondary`, `border`, `primary`, `onPrimary`, `success`, `warning`, `danger`, `focusRing`.
- Accent colors should be palettes with appropriate foreground/contrast values—not just one color swapped everywhere.
- Persist user preference and apply tokens app-wide.
- Status and priority must include text/icon labels, not color alone.

## Token categories
- Color: semantic tokens for light and dark modes, plus five accent palettes.
- Typography: display/title/body/label/caption styles, consistent line heights.
- Spacing: a small scale (e.g. 4, 8, 12, 16, 20, 24, 32).
- Radius: small, medium, large, pill; use sparingly and consistently.
- Elevation: minimal platform-appropriate elevation; avoid glowing shadows.
- Motion: short transitions; honor reduced-motion preference.
- Touch: comfortable targets and visible pressed/disabled/focus states.

## Core components
Button, IconButton, TextInput, TextArea, SearchField, Checkbox, Radio, Switch, Select/Picker, DatePicker, BottomSheet, Dialog, Toast/Snackbar, Avatar, Badge/Chip, LabelChip, PriorityIndicator, StatusSelector, TaskRow, TaskCard, AttachmentPreview, VoiceRecorder, ScreenHeader, FloatingBottomNavigation, GlobalAddButton, EmptyState, LoadingState, ErrorState, PermissionExplainer.

## Screen patterns
- Consistent page title and optional action area.
- Lists share the same row density, divider rules, swipe/overflow behavior and loading skeletons.
- Empty states explain the next action with one primary CTA.
- Filters use a shared bottom sheet/panel.
- Details use the same metadata order and edit behavior.
- Forms reveal advanced options progressively.
- Quick composer opens with the most likely input focused, but does not unexpectedly open the keyboard over a recording or attachment flow.

## Keyboard behavior
- Focus and scroll the active field into view.
- Use appropriate keyboard type and return-key behavior.
- Multiline descriptions allow newline insertion.
- Do not submit a form on Enter when the user is composing multiline text.
- Keep composer actions visible above the keyboard.
- Dismiss keyboard on explicit action and preserve unsaved content.
- Test Android back button and keyboard transitions.

## Design quality gate
Before approving a screen, compare it against existing screens for typography, margins, row height, component radius, icon weight, focus behavior, dark mode and accent behavior. Any new token or component must be justified and documented.
