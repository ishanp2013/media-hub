# Voices of GSG · GIIS Abu Dhabi Campus Media Hub

A web app where **parents share stories, photos and videos from school events**, a **coordinator reviews them**, and the **marketing team publishes** the approved ones to the school's social media. Every story goes through an automatic safety check before anyone at the school sees it.

The login page shows the GIIS **Nine Gems™** framework as an animated, interactive wheel.

> This is a front-end demo. All data is stored in the browser (`localStorage`), so it needs no database or backend server apart from the small moderation endpoint built into the Vite dev server.

---

## Contents

- [Features](#features)
- [Demo accounts](#demo-accounts)
- [Getting started](#getting-started)
- [How a story moves through the app](#how-a-story-moves-through-the-app)
- [Event listing windows](#event-listing-windows)
- [Story safety check](#story-safety-check)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Data and storage](#data-and-storage)
- [Deploying](#deploying)
- [Known limitations](#known-limitations)

---

## Features

### Login page
- An animated **Nine Gems wheel**, traced from the official artwork. Each blade is a separate vector shape.
  - Blades sweep in on load, and the wheel floats gently.
  - It cycles through the nine gems on its own. The active blade lifts out with a glow, and a coloured halo behind the wheel follows it.
  - Hovering or clicking a label or blade jumps to that gem and pauses the cycle. The labels also work with the keyboard.
  - A detail card shows the active gem's icon, name, description and a progress bar.
- The **GIIS swirl logo** (also used as the browser-tab icon).
- On phones, the wheel is replaced by the logo and a strip of gem colours above the form.

### Parent console
- **Submit Feedback.** Pick a school event, give it 1–5 stars, add an optional title, write the story and attach photos or videos.
- **AI safety check.** Runs before submitting. Unsuitable words are replaced with `[removed]` and the parent sees exactly what changed.
- **My Submissions.** Each story with its status timeline: *Pending → Approved → Published*, or *Rejected* with the reason.
- **Notifications.** The bell shows unread updates (published or needs revision). Clicking one opens **My Submissions**, scrolls to that story and highlights it.
- Only events the admin has **currently opened for feedback** appear in the event list.

### Admin (coordinator) console
- Event folders with submission and pending counts.
- **Add, edit, close or delete events** and choose how long each one is listed for parents. See [Event listing windows](#event-listing-windows).
- Open a folder to review each story with its media, rating, text and safety-check result.
- **Approve** a story, which sends it to Marketing.
- **Reject** a story with a required reason. The parent is notified with that reason.

### Marketing console
- The queue of approved stories.
- **Publish** a story by adding the link to the social media post. The parent is notified that their story is live.
- Counts of stories waiting and published.

### General
- Each role sees its own console after signing in.
- Changes sync live between open browser tabs (`BroadcastChannel`).
- **Reset Demo Data** in the footer restores the original sample data.
- Toast confirmations for every action.

---

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Parent | `parent@voicesofgsg.demo` | `Parent@2026` |
| Admin (coordinator) | `admin@voicesofgsg.demo` | `Admin@2026` |
| Marketing | `marketing@voicesofgsg.demo` | `Marketing@2026` |

The accounts are defined in `src/store.ts` (`USERS`). These are **demo credentials only**. Sign-in happens in the browser and is not secure; see [Known limitations](#known-limitations).

---

## Getting started

**Requirements:** Node.js 20.19+ or 22.12+ (required by Vite 7) and npm.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173 and sign in with one of the [demo accounts](#demo-accounts).

To try the full flow, use three browser tabs, one per role. They stay in sync:

1. As the **parent**, submit a story for an event.
2. As the **admin**, open that event's folder and approve the story, or reject it.
3. As **marketing**, publish it.
4. Back as the **parent**, click the new notification.

---

## How a story moves through the app

```
 Parent submits ──► safety check ──► PENDING
                                        │
                     Admin ─────────────┤
                        approve         │ reject (with reason)
                           ▼            ▼
                       APPROVED      REJECTED ──► parent notified
                           │
                Marketing publishes
                           ▼
                      PUBLISHED ──► parent notified
```

Each step is recorded in the story's history and shown to the parent as a timeline.

---

## Event listing windows

Each event has an optional **listing window** that controls when parents can choose it in the feedback form:

| Field | Meaning |
|---|---|
| `listFrom` | First day parents can pick the event (inclusive). Empty means straight away. |
| `listUntil` | Last day parents can pick the event (inclusive). Empty means no end date. |

In the admin's **Add event / Edit event** form, the admin picks:
- **Show to parents from**, which defaults to today and can be set later to schedule ahead.
- **For how long**: 1 week, 2 weeks, 1 month, 3 months, until a specific date, or no end date.

The form previews the result, for example *"Parents can pick this event from Nov 19, 2026 to Nov 25, 2026 (7 days)."*

Each event card in the admin console shows its status: **Open · closes in N days**, **Opens <date>**, or **Closed <date>**.

- An event with **no submissions** can be deleted.
- An event that **has submissions** can be **closed now** instead. It disappears from the parent form, and its stories stay available for review.

The listing logic is in `src/lib/eventListing.ts`.

---

## Story safety check

When a parent runs the check, the browser sends the title, story and video transcript (if any) to `POST /api/moderate-story`. This endpoint is a small piece of middleware inside the Vite dev server (`vite.config.ts` calls `server/moderate.ts`), so no API key ever reaches the browser.

**Built-in word filter** (`server/wordFilter.ts`, always on, no key needed):
- Replaces profanity, insults, threats and bullying phrases with `[removed]`. This covers English plus common Hindi/Urdu abuse.
- Catches disguised spellings: look-alike characters (`sh1t`, `@ss`), masking (`f**k`), repeated letters (`stuuupid`) and separators (`i.d.i.o.t`).
- Matches whole words only, so normal words like *class*, *assembly* or *dumbbell* are left alone.
- **Flags sensitive topics** for the admin without removing them, for example bullying, abuse, self-harm, drugs or weapons.

**Optional AI check:** if an API key is configured (see [Configuration](#configuration)), the story also goes through OpenAI's moderation model and a `gpt-4o-mini` clean-up pass, and the results are combined. If the AI service fails, the app falls back to the word filter, so submitting is never blocked.

The result is saved with the story and shown to the admin when reviewing.

---

## Project structure

```
├── index.html                 Page shell, title and favicon
├── public/
│   └── favicon.svg            GIIS swirl logo
├── server/                    Runs inside the Vite dev server only
│   ├── moderate.ts            Moderation: word filter plus optional AI check
│   └── wordFilter.ts          Word lists, look-alike handling, sensitive topics
├── src/
│   ├── main.tsx               React entry point
│   ├── App.tsx                Header, notifications, role routing, reset modal
│   ├── store.ts               App state, seed data, demo accounts, actions
│   ├── types.ts               Shared TypeScript types
│   ├── index.css              Tailwind layers and custom utilities
│   ├── lib/
│   │   ├── eventListing.ts    Event listing-window helpers
│   │   └── moderation.ts      Browser client for /api/moderate-story
│   └── components/
│       ├── LoginScreen.tsx    Login page with the Nine Gems panel
│       ├── NineGems.tsx       Interactive Nine Gems wheel, title and strip
│       ├── GiisLogo.tsx       Swirl logo and brand colours
│       ├── giisShapes.ts      Traced SVG paths for the wheel and logo
│       ├── ParentConsole.tsx  Submit form, safety-check card, My Submissions
│       ├── AdminConsole.tsx   Event folders and review / approve / reject
│       ├── EventFormModal.tsx Add / edit event and listing window
│       ├── MarketingConsole.tsx  Publishing queue
│       ├── MediaUploader.tsx  Photo/video picker with previews
│       ├── Timeline.tsx       Status timeline
│       ├── Toast.tsx          Shared toast notifications
│       ├── Modal.tsx          Accessible modal dialog
│       ├── StarRating.tsx     Star rating input and display
│       └── Common.tsx         Status badge, media preview, small shared parts
├── tailwind.config.js         Brand colours, fonts, animations
└── vite.config.ts             Vite config plus the moderation endpoint
```

---

## Tech stack

- **React 18** and **TypeScript**
- **Vite 7** for the dev server and build. It also hosts the moderation endpoint.
- **Tailwind CSS 3** with custom GIIS brand colours and animations
- **lucide-react** for icons
- Browser `localStorage` and `BroadcastChannel` for data and live tab sync

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server at http://localhost:5173, including the moderation endpoint |
| `npm run build` | Builds the production files into `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally |
| `npm run typecheck` | Type-checks the app with TypeScript |
| `npm run lint` | Runs ESLint |

---

## Configuration

Everything works without configuration. To turn on the optional AI check, create a `.env` file in the project root:

```env
# Either name works
AI_API_KEY=your-key-here
# OPENAI_API_KEY=your-key-here

# Optional: any OpenAI-compatible API (defaults to https://api.openai.com/v1)
# AI_API_BASE_URL=https://api.openai.com/v1
```

`.env` is git-ignored. The key is read on the server only and never sent to the browser. Restart `npm run dev` after changing it.

---

## Data and storage

- All state is kept in `localStorage` under the key `gsg_state_v2`: events, submissions, notifications and who is signed in.
- Uploaded photos and videos are kept as in-browser object URLs, so they last only for the current browser session.
- Demo accounts always load from code, so changing them in `src/store.ts` takes effect on the next reload.
- **Reset Demo Data** in the footer restores the sample events, stories and notifications.
- Each browser has its own separate data. Nothing is shared between devices.

---

## Deploying

`npm run build` produces static files in `dist/` that can be hosted anywhere, for example Netlify, Vercel or GitHub Pages.

**Note:** `/api/moderate-story` exists only in the Vite **dev** server. A static deployment has no moderation endpoint. To keep the safety check in production, host `server/moderate.ts` as a serverless function (for example a Netlify or Vercel function) at `/api/moderate-story`. It is plain TypeScript with no Vite dependency, so it can be reused as it is.

---

## Known limitations

This is a demo and prototype, not a production system:

- **Authentication is client-side.** Passwords are stored in the source and checked in the browser. A real deployment needs a proper sign-in system, such as school SSO or a backend with hashed passwords.
- **No shared database.** Data lives in each browser's `localStorage`. A real deployment needs a backend database and file storage for media.
- **Media files are not stored permanently.** Uploads disappear when the browser session ends.
- **Moderation endpoint is dev-only.** See [Deploying](#deploying).
- **Videos are not analysed.** They are checked only through their transcript if one is provided. Otherwise the admin is asked to review them manually.

---

© 2026 Global Indian International School, Abu Dhabi · Voices of GSG
