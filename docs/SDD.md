# Fitness Trainer Pro — Software Design Document (SDD)

Working title: Fitness Trainer Pro

Tech: React Native (0.73+ or 0.81+), TypeScript, React Navigation, Reanimated 3, Gesture Handler, MMKV (storage), react-native-svg (progress ring), Lottie (exercise animations), Haptics, KeepAwake, Sound (short local SFX).

Key constraints: 100% offline, JS-first implementation, no server dependency, production-ready.

## 1) Executive Summary

A compact, offline fitness app:

- Home: a grid of training types (e.g., Push-ups, Plank, Squats, Burpees).
- Setup: choose Duration (3 / 5 / 10 min + custom optional) and Difficulty (Light, Easy, Middle, Stunt, Hardcore, Pro).
- Training: big countdown timer on top, animated exercise preview (looped), Pause/Resume, Skip/Change (optional), Haptics, SFX on completion.
- Done: celebratory finish screen with summary and replay option.

Design language: bold, crisp, modern fitness UI with gradient backgrounds, glass-like cards, and micro-interactions.

Performance target: 60 FPS animations, <100 ms input latency, timer drift < ±200 ms over a 10-minute session.

## 2) Product Scope & Principles

- Offline-first: all animations (Lottie JSON), icons, and sounds are bundled assets.
- Simplicity-first UX: minimum screens, one clear path to “Start”.
- One-hand usage: primary actions reachable with thumb.
- No accounts, no analytics in v1 (can be added later, still optional to keep offline).
- Accessibility: VoiceOver labels, dynamic type, haptics, high contrast option.

## 3) Information Architecture

- Splash → Home (Training Types Grid)
  → Setup (Duration & Difficulty)
  → Training (Timer + Animation)
  → Done (Summary, Replay, Back to Home)

Auxiliary modals:

- Pause Sheet (Resume, Restart, Exit)
- Settings (optional): Sounds on/off, Haptics on/off, Theme (Light/Dark/System), Keep Screen Awake toggle, Language.

## 4) Visual Design System

### 4.1 Color & Theme Tokens

- Primary: #5B9BFF (blue)
- Accent: #FF6B6B (red)
- Success: #22C55E (green)
- Warning: #F59E0B
- Background (Light): radial gradient #0F172A → #111827 with subtle noise overlay at 8% opacity (gives depth).
- Background (Dark): #0B1020 → #0E1326, same noise overlay (6%).
- Card/Surface: translucent white/black with blur (iOS) — glassmorphism:
  - Light: rgba(255,255,255,0.10), border rgba(255,255,255,0.2)
  - Dark: rgba(255,255,255,0.06), border rgba(255,255,255,0.12)

### 4.2 Typography

- iOS: SF Pro (system).
- Weights: Regular (400), Semibold (600), Bold (700).
- Sizes:
  - H1 (Timer): 64–88
  - H2 (Titles): 28
  - Body: 16–17
  - Label: 13–14
- Tracking: Slight negative for large numerals (−1%).

### 4.3 Radius, Elevation, Effects

- Radius: 16 on cards, 20 on buttons, 28 on chips.
- Shadows: soft colored glows (primary hue) at 12–18 blur; never harsh.
- Borders: 1 px hairline with 30% opacity to define glass surfaces.

### 4.4 Iconography

- Simple line icons (24 px), bold silhouettes for exercises.
- Consistent stroke width (2 px).

## 5) Motion & Micro-Interactions (Reanimated)

- Physics: Spring (damping 18–22), mass 1, stiffness medium.
- Page transitions:
  - Home → Setup: shared element for card → setup header; scale 0.96 → 1, opacity 0 → 1 (220 ms).
  - Setup → Training: slide up + fade (280 ms), haptic light.
- Grid hover: card lift (scale 1.03), shadow bloom, 120 ms.
- Chip select: press ripple, scale 0.96 → 1, haptic selection.
- Start button: press down 0.98, release spring to 1 with glow pulse.
- Timer tick: subtle scale 1.00 → 1.01 → 1.00 each second; keep minimal to avoid noise.
- Completion: confetti or ring burst (Lottie), success haptic, short SFX (gong/chime ≤ 1s).

## 6) Screens (Detailed)

### 6.1 Animated Splash (0.8–1.2s)

- Layout: centered logo mark (simple dumbbell + pulse), app title below.
- Background: brand gradient with noise.
- Animation:
  - Logo: scale 0.7 → 1, slight y-bounce.
  - Title: fade + letter-spacing tighten.
- Edge cases:
  - Cold start only; warm resume goes straight to Home.
  - Timeout fallback at 2s.

### 6.2 Home — Training Types Grid

- Header: “Choose Training” (H2), Settings icon on right.
- Search (optional): inline input with icon; filters instantly.
- Grid: 2 columns, glass cards ≈ 160–180 px height, Lottie loop thumbnail or static SVG.
- Each card shows title (e.g., Push-ups), short tag (“Upper body”), and duration chips preview (“3 • 5 • 10”).
- Tap: expands to Setup with shared element transition.
- Animations: staggered fade-up for first load (60 ms per card).
- Empty/error: never happens offline; assets bundled.
- Content examples (v1):
  - Push-ups, Squats, Plank, Mountain Climbers, Jumping Jacks, Burpees, Lunges, Crunches.

### 6.3 Setup — Duration & Difficulty

- Header: Back arrow, training type title, mini animation on the right (loop, muted).
- Duration Section:
  - Predefined Chips: 3 / 5 / 10 min.
  - Custom (optional toggle): opens a horizontal wheel (1–30 min) or numeric stepper.
  - Animation: chip selection = spring scale + glow; only one active.
- Difficulty Section:
  - Chips: Light, Easy, Middle, Stunt, Hardcore, Pro.
  - Tooltips (on long-press): briefly explain intensity mapping (see §8).
- Start Button: Full-width rounded, gradient fill, Start label + right arrow.
- Press feedback: scale + haptic.
- Auxiliary: “Preview moves” link opens a sheet with miniature animation and a 5-sec preview timer (optional).

### 6.4 Training — Timer + Animation

- Top Bar:
  - Timer as large numeric countdown (e.g., 09:58).
  - Secondary: progress ring (SVG arc) encircling the animation OR under the timer as a thick ring.
- Exercise Animation:
  - Large Lottie loop (e.g., push-ups), centered, ~40–50% height.
  - Hint text below (1–2 lines): “Keep back straight”, “Breathe steadily”.
- Controls (bottom safe area):
  - Pause/Resume primary pill.
  - Restart and Exit as small ghost buttons.
- Micro-interactions:
  - Every 60s: gentle pulse on the ring; optional soft tick each 10s (user-toggle in Settings).
  - Pause opens a bottom sheet with Resume (primary), Restart, Exit. Sheet has spring from bottom.
- Edge behavior:
  - KeepAwake enabled; screen won’t lock.
  - Backgrounding: auto-pause, show “Paused while in background” toast on return.
  - Phone call or audio focus loss: pause and mute SFX.

### 6.5 Done — Completion

- Header: celebratory Lottie confetti.
- Summary Card:
  - Training type, duration, chosen difficulty.
  - “Great job!” message with Success color.
- Actions:
  - Replay (same parameters).
  - Change Setup (back to Setup).
  - Home (grid).

### 6.6 Settings (Optional but recommended)

- Toggles:
  - Sounds (on/off)
  - Haptics (on/off)
  - Tick every 10s (on/off)
  - Keep Screen Awake (on/off)
  - Theme (Light / Dark / System)
  - Language (EN / RU …)
- About: version, offline statement, acknowledgements.

## 7) Interaction Details

- Gestures:
  - Pull down on Training to open Pause sheet (in addition to button).
  - Long-press on difficulty to see intensity note (e.g., recommended pace).
- Haptics:
  - Selection on chip pick.
  - Light on Start.
  - Success at completion; Warning on restart confirmation.
- Sound (short, local files):
  - On complete: gong/chime (500–700 ms).
  - Optional tick or bell per minute (user setting).
  - Respect system mute switch (iOS).

## 8) Difficulty Model (Offline Logic)

Difficulty affects intensity hints and optional pacing cues (visual only by default).

- Light: relaxed, “Move with comfort.”
- Easy: steady, “Focus on form.”
- Middle: moderate, “Maintain pace.”
- Stunt: challenging, “Explosive reps.”
- Hardcore: high intensity, “Minimal rest, strong push.”
- Pro: performance, “Tight tempo, strict form.”

For v1 simplicity, the exercise remains the same (e.g., push-ups) for the entire chosen duration; Difficulty only alters copywriting and minor pacing cues (like subtle pulse frequency). Interval logic can be added later.

## 9) Timer Engine (Accuracy & Performance)

Goals: Drift < ±200 ms over 10 min; smooth progress ring; resilient to JS event loop pauses.

Approach:

- Reanimated worklet clock to maintain a high-precision timestamp on UI thread.
- SharedValue for elapsedMs; render remaining = targetMs - elapsedMs each frame.
- SVG arc progress = 2π * (elapsed / total).
- AppState detection: when backgrounded, store timestamp; on resume, correct elapsedMs from system time to avoid drift.
- Haptics/Sound triggered via runOnJS from worklet at completion threshold with guard to avoid multiple fires.

Pause/Resume:

- Store pauseAt = elapsedMs; on resume, continue from that offset; keep timeline monotonic.

## 10) Data & Storage

### 10.1 Bundled Content

```
[
  {
    "id": "pushups",
    "title": "Push-ups",
    "tags": ["Upper body", "Bodyweight"],
    "thumbnail": "lottie/pushups_thumb.json",
    "animation": "lottie/pushups_large.json",
    "hints": ["Keep back straight", "Even breathing"]
  },
  { "id": "plank", "title": "Plank", "tags": ["Core"] }
]
```

### 10.2 User Preferences (MMKV)

```
{
  soundsEnabled: true,
  hapticsEnabled: true,
  tickEvery10s: false,
  keepAwake: true,
  theme: "system",
  language: "en",
  lastTraining: { typeId: "pushups", durationMin: 5, difficulty: "Middle" }
}
```

No PII, no network, no analytics.

## 11) Architecture

- App shell:
  - NavigationContainer (React Navigation).
  - Stacks: RootStack(Splash→Home→Setup→Training→Done).
- State:
  - Zustand or React Context for session setup and preferences.
  - MMKV for persistence.
- Modules:
  - reanimated, gesture-handler, svg, lottie-react-native, react-native-haptic-feedback, react-native-keep-awake, react-native-sound (or expo-av), react-native-safe-area-context.
- Assets:
  - All Lottie JSON + SFX in assets/ and preloaded at startup.

Session State Machine:

```
idle → running → paused → running → completed
Events: START, PAUSE, RESUME, RESTART, EXIT, COMPLETE.
```

## 12) Performance

- Preload Lottie for chosen training on Setup entry.
- Keep Training screen components pure; use memo + worklets.
- SVG ring updated on UI thread; no JS timers for visual progress.
- Avoid expensive state updates per second; only update text every 250–500 ms while animating ring at 60 FPS (computed on UI thread).

## 13) Accessibility

- VoiceOver: labels on all actionable elements; timer announced every minute (optional toggle).
- Dynamic Type: scale text up to 120–130% without layout break; timer font uses responsive clamp.
- Contrast: ensure WCAG AA; offer High Contrast mode (thicker ring, brighter labels).
- Haptics for non-visual cues.

## 14) Error & Edge Handling

- Low Power Mode: warn that performance may be reduced; still functional.
- Audio focus: if another app grabs focus, mute ticks; completion gong still plays if allowed.
- App background during training: auto-pause with toast on return.
- Asset failure (rare): fallback to static PNG sequence or silhouette vector.

## 15) Testing Plan

- Unit:
  - Timer math (pause/resume, background resume correction).
  - Difficulty mapping text.
  - Settings persistence (MMKV).
- Integration:
  - Navigation flows; shared element transitions.
  - Sound/Haptics trigger exactly once on complete.
- UI/UX:
  - 1-hand reachability (44 px min touch targets).
  - 60 FPS check with Flipper/Perf Monitor.
- Manual scenarios:
  - Start 10-min session, background at 2:30, return at 4:00 → timer paused, correct remaining shown.
  - Toggle sound off → no chime at end.
  - Orientation changes (lock portrait by default).

## 16) Build & Delivery

- iOS: minimum iOS 13+; build with Hermes; bitcode off; Provisional and Release schemes.
- Android (if planned): minSdk 24; identical feature set; test on 60/90/120 Hz displays.
- App Size: keep Lottie compact (<300 KB each); SFX compressed (AAC/CAF).

## 17) Security & Privacy

- No network calls.
- No third-party analytics.
- No PII stored.

## 18) Roadmap (Optional Enhancements)

- Intervals (work/rest) derived from difficulty.
- Multi-exercise circuits per training type.
- Local history (streaks, total minutes).
- Custom durations fully enabled with wheel picker.
- Theming packs (additional gradients/backgrounds).

## 19) Acceptance Criteria (MVP)

- App launches with animated splash (<1.2s).
- Home shows grid of at least 8 training types with bundled thumbnails.
- Setup allows selecting one duration (3/5/10) and one difficulty.
- Training shows large countdown, animated exercise, Pause/Resume, Restart, Exit.
- On completion, haptic + chime play exactly once; Done screen appears.
- All functionality works offline; screen stays awake during training.
- No visible frame drops during normal usage on mid-range devices.

## 20) Example Content Mapping (v1)

- Push-ups: hints “Back straight”, “Full range”.
- Plank: “Tight core”, “Even breathing”.
- Squats: “Heels down”, “Knees track toes”.
- Burpees: “Explode up”, “Land soft”.
- Lunges: “Upright torso”, “90° knees”.
- Crunches: “Chin up”, “Slow control”.
- Mountain Climbers: “Hips level”, “Rhythmic pace”.
- Jumping Jacks: “Full extension”, “Steady tempo”.

## Final Notes

The app intentionally stays simple and focused: pick a training type → set duration & difficulty → run a clean, reliable timer with beautiful animation and celebratory finish.

All elements are implementable with React Native + JS-first tooling and ship fully offline.
