# Ask Mo Landing Page — Full Requirements Specification

A complete requirements document to rebuild this landing page from scratch in any project.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [Custom Animations](#custom-animations)
5. [Component Architecture](#component-architecture)
6. [Section 1: Navigation](#section-1-navigation)
7. [Section 2: Hero](#section-2-hero)
8. [Section 3: Problem / Solution](#section-3-problem--solution)
9. [Section 4: Interactive Demo](#section-4-interactive-demo)
10. [Section 5: How It Works](#section-5-how-it-works)
11. [Section 6: Footer](#section-6-footer)
12. [Reusable Component: DataTable](#reusable-component-datatable)
13. [Typing & Streaming Engine](#typing--streaming-engine)
14. [All Demo Data](#all-demo-data)
15. [Responsiveness](#responsiveness)
16. [Assets](#assets)
17. [File Structure](#file-structure)

---

## Overview

Single-page marketing landing page for **Ask Mo**, an AI-powered venue intelligence assistant by Momentus Technologies. Fully self-contained demo experience — no backend, no real AI, all data hardcoded. Page demonstrates an AI chat interface where venue managers query their data with plain language.

**Page title:** `Ask Mo — AI-Powered Venue Intelligence by Momentus`

---

## Tech Stack

- **Vue 3** via CDN (`https://unpkg.com/vue@3/dist/vue.global.js`) — Composition API (`setup()`)
- **Tailwind CSS** via CDN (`https://cdn.tailwindcss.com`) with inline config extension
- **Font:** Plus Jakarta Sans from Google Fonts — weights 300, 400, 500, 600, 700, 800
- **No build step.** Single `index.html` opened directly in browser
- **No modules/bundler.** Components defined as plain objects in `<script>` blocks
- **Browser support:** Modern (Chrome, Firefox, Safari, Edge)

---

## Design System

### Brand Colors (extend Tailwind `theme.colors.brand`)

| Token | Hex | Usage |
|---|---|---|
| `brand-yellow` | `#F5DA41` | Primary CTA, AI avatar, accents, cursor blink |
| `brand-navy` | `#16184E` | Page background, text on yellow buttons |
| `brand-purple` | `#4146E0` | Gradient start, user chat bubbles, accent dots |
| `brand-violet` | `#B266E4` | Gradient end, decorative spinning borders |
| `brand-cream` | `#F2EEEB` | Defined but unused |

### Typography

- Body: `font-family: 'Plus Jakarta Sans', sans-serif`
- Hero H1: `text-5xl lg:text-6xl font-extrabold leading-tight`
- Section H2s: `text-3xl lg:text-4xl font-bold`
- Body text: `text-sm` to `text-xl` depending on context

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #4146E0, #B266E4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Glassmorphism Pattern (used on chat windows, nav)

```
bg-white/5 (or bg-white/10)
backdrop-blur-xl
border border-white/10
rounded-2xl
shadow-2xl shadow-black/20
```

### Border Radius Conventions

| Element | Radius |
|---|---|
| CTA Buttons | `rounded-[10px]` |
| Chat bubbles | `rounded-2xl` |
| Cards | `rounded-2xl` |
| Avatars | `rounded-full` |
| Pill badges | `rounded-full` |
| Icon containers | `rounded-xl` or `rounded-lg` |

### Global Body

```html
<body class="bg-brand-navy text-white antialiased">
```

### Vue Cloak

```css
[v-cloak] { display: none; }
```

---

## Custom Animations

### CSS Keyframe Animations (defined in `<style>`)

| Class | What it does | Duration / Easing |
|---|---|---|
| `.cursor-blink` | Blinking yellow cursor (`#F5DA41`). Opacity 1 at 0-49%, 0 at 50-100% | 1s ease-in-out infinite |
| `.bounce-dot` | Three dots bounce for AI "thinking". translateY(-6px) at 40% | 1.4s ease-in-out infinite |
| `.bar-grow` | Horizontal bar scales from 0 to 1 width (scaleX). transform-origin: left | 0.6s ease-out forwards |
| `.dashed-line` | SVG dashed line flows. stroke-dasharray: 8 4, stroke-dashoffset animates to -24 | 1.5s linear infinite |

### Tailwind Extended Animations (defined in `tailwind.config`)

| Name | What it does | Duration |
|---|---|---|
| `fade-in` | translateY(10px) + opacity 0 -> translateY(0) + opacity 1 | 0.5s ease-out forwards |
| `spin-slow` | Full 360deg clockwise rotation | 8s linear infinite |
| `spin-reverse` | Full 360deg counter-clockwise rotation | 12s linear infinite |
| `float` | Gentle floating (4 keyframe stops with translateY/translateX variations) | 15s ease-in-out infinite |
| `float-delayed` | Same as float, 5s start delay | 15s ease-in-out 5s infinite |
| `float-slow` | Same as float, 2s start delay, 20s duration | 20s ease-in-out 2s infinite |

### Float Keyframes Detail

```js
float: {
  '0%, 100%': { transform: 'translateY(0) translateX(0)' },
  '25%':      { transform: 'translateY(-20px) translateX(10px)' },
  '50%':      { transform: 'translateY(-10px) translateX(-10px)' },
  '75%':      { transform: 'translateY(-15px) translateX(5px)' },
}
```

---

## Component Architecture

All components are Vue 3 objects defined in separate `<script>` blocks within the single HTML file. Root app mounts to `<div id="app" v-cloak></div>`.

```
App (root — defines Nav + Footer inline in its template)
├── Hero
├── ProblemSolutionSection
├── InteractiveDemo
│   └── DataTable (child component)
└── HandOffToAI
```

**State management:** Each component manages its own state via `setup()`. No shared store. App-level state is only `mobileMenuOpen` (boolean ref).

---

## Section 1: Navigation

### Position & Style

- `fixed top-0 left-0 right-0 z-50`
- `bg-brand-navy/80 backdrop-blur-xl border-b border-white/5`
- Inner container: `max-w-7xl mx-auto px-6 flex items-center justify-between h-16`

### Logo (left side)

- `<a>` wrapping `<img src="momentus-logo.svg">` with `style="height: 2.3rem;"`
- Links to `https://gomomentus.com`

### Desktop Nav Links (hidden below `lg` breakpoint)

Links with `gap-6 text-sm`:

| Label | URL | Style |
|---|---|---|
| Products | `https://gomomentus.com/enterprise-event-management-software` | `text-gray-300 hover:text-white` |
| Ask Mo | `https://gomomentus.com/ask-mo` | `text-white font-medium` (active) |
| Customers | `https://gomomentus.com/customer-stories` | `text-gray-300 hover:text-white` |
| Resources | `https://gomomentus.com/content-hub` | `text-gray-300 hover:text-white` |
| Company | `https://gomomentus.com/about-us` | `text-gray-300 hover:text-white` |

### CTA Button

- "Book Demo" -> `https://gomomentus.com/request-demo`
- `px-5 py-2 bg-brand-yellow text-brand-navy font-bold text-sm rounded-[10px]`
- Hover: `shadow-lg shadow-yellow-500/25 hover:-translate-y-0.5`

### Mobile Menu

- Hamburger icon toggles `mobileMenuOpen` ref (shows 3-line or X icon)
- Dropdown panel: `bg-brand-navy/95 backdrop-blur-xl border-t border-white/5`
- Same links as desktop, stacked vertically with `py-2` spacing

---

## Section 2: Hero

### Component: `Hero`

### Layout

- `min-h-screen` with `pt-16` (offset for fixed nav)
- Two-column grid at `lg` breakpoint: `grid lg:grid-cols-2 gap-12 items-center`
- `max-w-7xl mx-auto px-6 py-20`

### Background

Three floating blobs behind content (absolutely positioned, `z-0`):

1. **Top-left:** `w-72 h-72 bg-brand-purple/20 rounded-full blur-3xl animate-float` at `top-20 -left-20`
2. **Bottom-right:** `w-96 h-96 bg-brand-violet/15 rounded-full blur-3xl animate-float-delayed` at `bottom-20 -right-20`
3. **Center:** `w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl animate-float-slow` at `top-1/2 left-1/3`

### Left Column

1. **Pill badge:** "Powered by Momentus" with pulsing yellow dot
   - `bg-white/10 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-sm`
   - Yellow dot: `w-2 h-2 bg-brand-yellow rounded-full animate-pulse`

2. **H1:** Two lines
   - Line 1: "Ask Mo." (white)
   - Line 2: "Get answers." (`.gradient-text`)
   - `text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6`

3. **Subtitle:** "Ask the question the way you'd ask a teammate. Answers are"
   - `text-xl text-gray-300 mb-2`

4. **Typewriter line:** Cycles through words with blinking cursor `|`
   - Words: `['clear', 'visual', 'instant', 'actionable']`
   - `text-xl font-semibold text-brand-yellow h-8`
   - Typing speed: 90ms + random(0-40ms) per character
   - Hold duration: 2200ms
   - Delete speed: 45ms + random(0-20ms) per character
   - Pause between words: 350ms

5. **Two CTA buttons** (flex row, gap-4, mt-8):
   - "Try the Demo" -> `#interactive-demo` — `bg-brand-yellow text-brand-navy font-bold rounded-[10px] shadow-lg shadow-yellow-500/25` with hover lift
   - "How It Works" -> `#how-it-works` — `border border-white/20 text-white font-semibold rounded-[10px] hover:bg-white/10`

### Right Column: Auto-Playing Chat Window

Glassmorphism card (`max-w-md mx-auto w-full`) containing:

#### Chat Header

- Yellow circle avatar (w-8 h-8) with "Mo" text
- Title: "Ask Mo" (white, semibold)
- Status: green dot (w-1.5 h-1.5) + "Always online" (indigo-200, xs)

#### Chat Body (`h-96 overflow-y-auto p-4 space-y-4`)

Auto-plays through this conversation on loop (starts after 1800ms, restarts after 4000ms pause):

| # | Sender | Content | After response |
|---|---|---|---|
| 1 | User | "Which spaces are booked the most this month?" | — |
| 2 | AI | Multi-line text with emoji bullets listing 4 spaces with utilization % | — |
| 3 | User | "Show me that as a chart" | — |
| 4 | AI | "Here's your space utilization breakdown:" | Shows bar chart |
| 5 | User | "Send me a pacing report every Monday at 8 AM" | — |
| 6 | AI | "Done! I've scheduled that report for you:" | Shows scheduled report card |

#### AI message #2 full text:
```
Here are your top-booked spaces for this month:

🏟️ Space Utilization (This Month):
• Grand Ballroom: 24 events (92% utilized)
• Convention Hall A: 19 events (78% utilized)
• Rooftop Terrace: 16 events (71% utilized)
• Board Room Suite: 28 events (68% utilized)

Grand Ballroom is your highest-demand space.
```

#### Inline Bar Chart (after message #4)

- Title: "Space Utilization This Month" (uppercase, tracking-wider, xs, gray-400)
- 4 horizontal bars with `.bar-grow` animation and staggered delays:

| Label | Width | Gradient | Delay |
|---|---|---|---|
| Grand Ballroom | 92% | `from-brand-purple to-brand-violet` | 0s |
| Convention Hall A | 78% | `from-indigo-400 to-indigo-500` | 0.15s |
| Rooftop Terrace | 71% | `from-blue-400 to-blue-500` | 0.3s |
| Board Room Suite | 68% | `from-sky-400 to-sky-500` | 0.45s |

- Labels: `text-xs text-gray-400 w-24 text-right truncate`
- Percentage values shown to the right of each bar

#### Scheduled Report Card (after message #6)

- Header: pulsing green dot + "Scheduled Report" + "Weekly" yellow badge
- Three rows with SVG icons:
  - Clock (yellow): "Every Monday at 8:00 AM"
  - Checkmark (green): "Pacing Report: Bookings vs. Target"
  - Checkmark (green): "Email to your inbox"

#### Chat Bubble Styling

| Sender | Background | Border | Text | Alignment |
|---|---|---|---|---|
| User | `bg-brand-purple/40` | `border-brand-purple/30` | white | Right |
| AI | `bg-white/10` | `border-white/10` | gray-200 | Left |

- User avatar: navy circle with white person SVG
- AI avatar: yellow circle with "Mo" text (navy, bold, 10px)
- Thinking state: 3 bouncing dots (staggered 0/150/300ms) + "Analyzing..."
- Message text container: `white-space: pre-line` for line breaks

#### Decorative Input Bar

- Disabled text input with placeholder "Ask Mo about your venue data..."
- Disabled yellow send button at 50% opacity

---

## Section 3: Problem / Solution

### Component: `ProblemSolutionSection`

- Section ID: `how-it-works`
- `py-24 border-t border-white/5`
- `max-w-6xl mx-auto px-6`

### Header

- H2: "Stop hunting for reports. Just ask."
- Subtitle: "No more exporting to Excel, building pivot tables, or waiting on IT. Ask Mo gets you answers in seconds." (`max-w-2xl mx-auto`)

### Two-Column Grid (`md:grid-cols-2 gap-8`)

#### Left: "The Old Way"

- Card: `bg-red-500/10 border border-red-500/20 rounded-2xl p-8`
- Icon: red X SVG in `bg-red-500/20 rounded-xl` square
- Title: "The Old Way" in `text-red-400`
- Code block (`font-mono text-xs text-red-300 bg-black/30 p-3`):
  ```
  1. Export bookings to CSV...
  2. Open in Excel, build pivot table...
  3. Cross-reference with space calendar...
  4. Format charts for leadership...
  Total time: 3 hours (and already outdated)
  ```
- Caption: "Export, pivot, format, repeat. Every single week."
- 3 bullet points with warning circle icons (red-400):
  - "Manual exports and pivot tables"
  - "Data stale by the time you share it"
  - "Hours wasted on reporting"

#### Right: "The Ask Mo Way"

- Card: `bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8`
- Icon: green checkmark in `bg-brand-yellow rounded-xl` square
- Title: "The Ask Mo Way" in `text-brand-yellow`
- Mini chat exchange:
  - User (gray circle + person icon): "Which spaces are booked the most?"
  - Mo (yellow circle + "Mo"): "Grand Ballroom: 24 events, 92% utilized ✔" (emerald-400)
  - Caption: "Ask like you would a teammate. Get instant visuals."
- 3 bullet points with checkmark icons (emerald-400):
  - "Plain language questions"
  - "Interactive charts and summaries"
  - "Answers in seconds, not hours"

---

## Section 4: Interactive Demo

### Component: `InteractiveDemo`

- Section ID: `interactive-demo`
- `py-24 border-t border-white/5`
- `max-w-5xl mx-auto px-6`

### Header

- Pill badge: smiley SVG icon + "Interactive Demo" (`bg-white/10 rounded-full`)
- H2: "Try it yourself"
- Subtitle: "Click a scenario below and watch Mo respond in real time."

### Three Query Tiles (`grid md:grid-cols-3 gap-4 mb-8`)

Each tile is a `<button>`:

| Tile | Title | Icon Color | Background | SVG |
|---|---|---|---|---|
| Space Demand | `spaces` | violet | `bg-brand-purple/20` | Building icon |
| Booking Pipeline | `pipeline` | yellow | `bg-brand-yellow/20` | Bar chart icon |
| Event Operations | `operations` | emerald | `bg-emerald-500/20` | Clipboard checkmark icon |

- Base style: `p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm`
- Hover: `border-brand-purple/50 bg-white/10 shadow-lg shadow-brand-purple/10`
- Title hover: changes to `text-brand-yellow`
- Shows italic query preview text
- Disabled while query is processing: `opacity-50 cursor-not-allowed`

### Chat Window

Same visual structure as hero chat but:
- Body height: `h-[28rem]` (taller)
- Padding: `p-5`
- Max bubble width: `max-w-[88%]`
- Empty state: chat bubble SVG (w-12 h-12, gray-600) + "Click a scenario above to start"
- Header subtitle says "Interactive Demo" instead of "Always online"

### Processing/Thinking State

When AI is "thinking":
- Shows bouncing dots + cycling status message text
- Status messages rotate every 500ms

**Per scenario type:**

| Type | Messages |
|---|---|
| `spaces` | "Processing your request..." -> "Querying space data..." -> "Analyzing utilization rates..." -> "Calculating revenue metrics..." -> "Formatting results..." |
| `pipeline` | "Processing your request..." -> "Querying event opportunities..." -> "Analyzing pipeline stages..." -> "Calculating win rates..." -> "Formatting results..." |
| `operations` | "Processing your request..." -> "Querying service orders..." -> "Checking event schedules..." -> "Flagging urgent items..." -> "Formatting results..." |
| `default` | "Processing your request..." -> "Querying Momentus data..." -> "Analyzing results..." -> "Formatting response..." |

- Processing time: `2200 + Math.random() * 800` ms

### Response Metadata

- Shows "Responded in X.Xs" with lightning bolt icon (`text-[10px] text-gray-500`)
- Response time is the actual simulated processing duration

### Follow-Up Questions

After each AI response, 2 follow-up buttons appear:
- `text-xs px-3 py-1.5 bg-brand-purple/20 text-gray-200 border border-brand-purple/30 rounded-full`
- Hover: `bg-brand-purple/30 border-brand-purple/50 text-white`
- Clicking triggers a new typed question + AI response (appended, NOT clearing previous)
- Follow-ups have no further follow-ups
- Disabled while a query is processing
- Appear after 600-900ms delay with `animate-fade-in`

### Interaction Flow

1. User clicks a scenario tile -> chat clears -> user question types out character-by-character
2. Pause 500-800ms
3. AI thinking indicator appears with cycling status messages
4. After 2.2-3s, thinking stops, response streams word-by-word
5. Data table renders below response (if applicable)
6. Follow-up buttons appear after 600-900ms
7. User can click a follow-up -> new question types, new response streams (appended)
8. Only one query can process at a time (tiles + follow-ups disabled during processing)

---

## Section 5: How It Works

### Component: `HandOffToAI`

- `py-24 border-t border-white/5 overflow-hidden`
- `max-w-6xl mx-auto px-6`

### Header

- H2: "Three steps. Instant clarity."
- Subtitle: "Self-serve reporting built right into Momentus Enterprise."

### Three-Step Grid (`md:grid-cols-3 gap-8`)

Connected by animated dashed SVG lines (desktop only, `hidden md:block`):
- Two horizontal lines at `top-16`: 20%-48% and 52%-80%
- `stroke="rgba(255,255,255,0.15)" stroke-width="2"` with `.dashed-line` animation

#### Step 1: Ask

- Icon: `w-20 h-20 bg-brand-yellow rounded-2xl shadow-lg shadow-yellow-500/20` with chat bubble SVG (w-10 h-10)
- Title: "Ask"
- 3 bullets with `bg-brand-purple` dots:
  - "Plain language questions"
  - "No reporting expertise needed"
  - "Ask like you would a teammate"

#### Step 2: Get Answers Fast

- Icon container: `w-20 h-20` with three layers:
  - Outer ring: `border-2 border-dashed border-white/20 rounded-2xl animate-spin-slow`
  - Inner ring: `border-2 border-dashed border-brand-violet/30 rounded-xl animate-spin-reverse` (inset-1)
  - Center: `bg-gradient-to-br from-brand-purple to-brand-violet rounded-2xl shadow-lg shadow-brand-purple/30` with lightning bolt SVG
- Title: "Get Answers Fast"
- 3 bullets with `bg-brand-violet` pulsing dots (staggered: 0s, 0.3s, 0.6s):
  - "Results in seconds"
  - "Interactive visualizations"
  - "Written summaries included"

#### Step 3: Explore & Share

- Icon: `w-20 h-20 bg-emerald-500/20 rounded-2xl shadow-lg shadow-emerald-500/10` with upload/share SVG (emerald-400)
- Title: "Explore & Share"
- 3 bullets with `bg-emerald-400` dots:
  - "Filter and drill into charts"
  - "Download for presentations"
  - "Copy summaries for emails"

### Venue Types Bar (`mt-20`)

- Label: "Built for every venue type" (`text-sm text-gray-500 uppercase tracking-wider font-medium`)
- 5 pill badges (`flex-wrap justify-center gap-4`):

| Label | SVG Icon |
|---|---|
| Convention Centers | Building |
| Stadiums & Arenas | Globe |
| Performing Arts | Clipboard |
| Universities | Book |
| Corporate Campuses | Briefcase |

- Each: `bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm text-gray-400`
- Icons: `w-4 h-4 text-brand-violet`

---

## Section 6: Footer

- `border-t border-white/5 text-gray-400 py-12`
- `max-w-6xl mx-auto px-6 text-center`
- Logo: `h-5 opacity-60`, links to `https://gomomentus.com`
- Text: "AI-powered self-serve reporting for venue and event management." (`text-sm`)
- Disclaimer: "This is a demo experience. No real data or AI is being used." (`text-xs text-gray-600`)

---

## Reusable Component: DataTable

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | String | Yes | Header title shown above table |
| `headers` | Array | Yes | Column definitions |
| `rows` | Array | Yes | Row data objects |
| `totals` | Object | No | Footer totals row |
| `averages` | Object | No | Defined in props but unused |

### Header Object Schema

```js
{
  text: 'Display Name',        // Column header label
  value: 'objectKey',          // Key to access in row data
  align: 'left|right|center',  // Column alignment (default: left)
  format: 'currency|number|percent' // Value formatter (optional)
}
```

### Value Formatting

| Format | Example Output | Method |
|---|---|---|
| `currency` | `$864,000` | `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })` |
| `number` | `1,234` | `Intl.NumberFormat('en-US')` |
| `percent` | `94%` | `value + '%'` |
| (none) | raw value | Pass through |

### Visual Design

- Outer container: `mt-3 bg-white/5 rounded-lg border border-white/10 overflow-hidden animate-fade-in`
- Title bar: title left, decorative "Export" button right (yellow text, download icon)
- Table: `w-full text-sm`, horizontally scrollable (`overflow-x-auto`)
- Thead: `bg-white/5`, `text-xs font-semibold text-gray-400 uppercase tracking-wider`
- Tbody: `border-b border-white/5 hover:bg-white/5 transition-colors`, `text-gray-300`
- Tfoot (when `totals` provided): `border-t-2 border-white/10 bg-white/5 font-semibold text-gray-200`, first cell says "Total"

---

## Typing & Streaming Engine

Performance-critical: all text animations use **direct DOM manipulation** via `textContent`, bypassing Vue reactivity entirely.

### `typeDirect(domId, text, baseMs, varianceMs)` — User messages

- Character-by-character via `el.textContent = text.substring(0, i)`
- Hero uses: baseMs=38, varianceMs=20
- Demo uses: baseMs=35, varianceMs=18
- Extra delays per character type:
  - Space: `+baseMs * 0.12`
  - Comma/semicolon/colon: `+baseMs * 0.5`
  - Period/exclamation/question: `+baseMs * 0.8`
- Minimum delay: 18ms
- Scrolls to bottom after each character

### `streamDirect(domId, text, baseMs, varianceMs)` — AI messages

- Word-by-word via `el.textContent = words.slice(0, i).join('')`
- Text split on spaces and newlines
- Both Hero and Demo use: baseMs=30, varianceMs=16
- Extra delays:
  - Newlines: `+baseMs * 0.4`
  - Colons: `+baseMs * 0.2`
- Minimum delay: 15ms
- Scrolls to bottom after each word

### Timing Between Messages

| Event | Delay |
|---|---|
| After user message typed | 500-800ms (hero: 800-1200ms) |
| AI thinking duration | 1000-1600ms (hero), 2200-3000ms (demo) |
| After AI response complete | 1600-2000ms (hero) |
| Chart/card appearance after AI text | 250ms |
| Follow-up buttons appearance | 600-900ms |
| Conversation loop restart | 4000ms pause, then clear & restart |
| Initial page load to first message | 1800ms |

### Scroll Behavior

`scrollToBottom()` called after every update:
```js
chatBody.scrollTop = chatBody.scrollHeight; // instant, no smooth scroll
```

### Cleanup Pattern

- All `setTimeout` IDs pushed to a `timeouts[]` array
- `onUnmounted`: sets `destroyed = true`, clears all timeouts
- Every animation loop checks `destroyed` before continuing

---

## All Demo Data

### Hero Conversation (auto-looping)

See [Section 2: Hero](#right-column-auto-playing-chat-window) for the full 6-message conversation and rich content blocks.

### Scenario 1: Space Demand

**Query:** "Which spaces are booked the most this quarter?"

**Response:** "Your top 5 most-booked spaces this quarter, ranked by total events and utilization rate:"

**Table: "Space Utilization - This Quarter"**

| Space | Events | Utilization | Revenue |
|---|---|---|---|
| Grand Ballroom | 72 | 94% | $864,000 |
| Convention Hall A | 58 | 82% | $522,000 |
| Rooftop Terrace | 45 | 76% | $405,000 |
| Executive Board Room | 89 | 71% | $178,000 |
| Garden Pavilion | 34 | 65% | $306,000 |
| **Total** | **298** | | **$2,275,000** |

**Follow-up 1:** "Why is the Rooftop Terrace underperforming?"
- Query: "Why is the Rooftop Terrace underperforming compared to the Grand Ballroom?"
- Response: "The Rooftop Terrace had 12 weather-related cancellations this quarter and 8 days blocked for maintenance. Without those disruptions, projected utilization would have been 89%. Consider offering indoor backup options to reduce weather cancellations."
- No table

**Follow-up 2:** "Show me availability for next month"
- Query: "Show open availability for the Grand Ballroom next month"
- Response: "The Grand Ballroom has 4 open dates next month. Two are weekday slots and two are prime weekend evenings:"
- **Table: "Grand Ballroom - Open Dates Next Month"**

| Date | Day | Time Slot | Demand |
|---|---|---|---|
| Mar 5 | Wednesday | Full Day | 🟡 Moderate |
| Mar 11 | Tuesday | Evening | 🟢 Low |
| Mar 22 | Saturday | Evening | 🔴 High |
| Mar 29 | Saturday | Full Day | 🔴 High |

### Scenario 2: Booking Pipeline

**Query:** "How are we pacing against our booking targets?"

**Response:** "You are 8% ahead of target for Q1. Event opportunities in the pipeline total $1.8M. Here is the breakdown by stage:"

**Table: "Booking Pipeline - Q1"**

| Stage | Opportunities | Value | Win Rate |
|---|---|---|---|
| Inquiry | 34 | $612,000 | 25% |
| Proposal Sent | 18 | $486,000 | 55% |
| Contract Pending | 12 | $420,000 | 85% |
| Confirmed | 22 | $308,000 | 100% |
| **Total** | **86** | **$1,826,000** | |

**Follow-up 1:** "Which proposals are at risk of expiring?"
- Query: "Which proposals are at risk of expiring this week?"
- Response (includes newlines and bullet points):
  ```
  3 proposals are expiring within the next 7 days, totaling $142,000 in potential revenue:

  • Meridian Corp Gala - Expires in 2 days ($68,000)
  • Tech Summit 2025 - Expires in 4 days ($52,000)
  • Alumni Reunion Dinner - Expires in 6 days ($22,000)

  I recommend following up with Meridian Corp first, as it has the highest value.
  ```
- No table

**Follow-up 2:** "Compare pacing to last year"
- Query: "Compare our booking pace to the same period last year"
- Response: "You are pacing 12% ahead of the same period last year. Confirmed bookings are up $185K, and average deal size has increased from $14,200 to $16,800. The biggest growth is in corporate events (+22%), while social events are flat."
- No table

### Scenario 3: Event Operations

**Query:** "What service orders are still outstanding for this week?"

**Response:** "There are 14 outstanding service orders across 6 events this week. 3 are flagged as urgent:"

**Table: "Outstanding Service Orders - This Week"**

| Event | Service | Due | Status |
|---|---|---|---|
| Meridian Corp Gala | AV Setup (Full Stage) | Tomorrow | 🔴 Urgent |
| Meridian Corp Gala | Catering (250 guests) | Tomorrow | 🔴 Urgent |
| Tech Summit Day 1 | WiFi Upgrade (500 users) | Wed | 🔴 Urgent |
| Board Meeting | Room Config (U-shape) | Thu | 🟡 Pending |
| Wedding Reception | Floral Arrangements | Fri | 🟡 Pending |
| Wedding Reception | Lighting Package | Fri | 🟢 On Track |

**Follow-up 1:** "Details on the Meridian Corp Gala"
- Query: "Give me the full details on the Meridian Corp Gala setup"
- Response:
  ```
  Meridian Corp Gala - Grand Ballroom, Tomorrow 6:00 PM

  • Guest Count: 250 (confirmed)
  • Setup: Banquet rounds with stage and dance floor
  • AV: Full stage with 2 screens, wireless mics, house sound
  • Catering: 3-course plated dinner + cocktail hour
  • Bar: Premium open bar, 6 hours
  • Parking: Valet arranged for 80 vehicles
  • Event Manager: Sarah Chen (on-site from 3 PM)

  All vendors confirmed except the florist, who is pending delivery time.
  ```
- No table

**Follow-up 2:** "Flag the WiFi upgrade as critical"
- Query: "Flag the Tech Summit WiFi upgrade as critical and notify the ops team"
- Response: "✅ Done! The WiFi Upgrade for Tech Summit has been escalated to critical priority. The operations team has been notified via email and the task is now pinned at the top of the daily ops board."
- No table

---

## Responsiveness

| Breakpoint | Behavior |
|---|---|
| Default (mobile) | Single-column stacked layouts, hamburger menu |
| `md` (768px) | Problem/Solution 2-col, query tiles 3-col, How It Works 3-col, dashed connector lines visible |
| `lg` (1024px) | Hero 2-col, desktop nav visible, H1 bumps to `text-6xl`, section H2s bump to `text-4xl` |

### Key Details

- Chat windows: always full-width of their container, `max-w-md` in hero only
- Venue type pills: `flex-wrap justify-center` (wraps naturally on narrow screens)
- All sections use `px-6` horizontal padding at all sizes
- Content containers: `max-w-5xl`, `max-w-6xl`, or `max-w-7xl` depending on section

---

## Assets

### `momentus-logo.svg`

- White SVG on transparent background
- Viewport: `185 x 37`
- Contains: Momentus asterisk/star logo mark (geometric intersecting lines forming a diamond center) + "momentus" wordmark + "technologies" subtext
- All paths use `fill="white"`

---

## File Structure

```
project-root/
├── index.html          # Single-page app with all components inline
├── momentus-logo.svg   # White Momentus logo (185x37)
└── SPEC.md             # This specification file
```
