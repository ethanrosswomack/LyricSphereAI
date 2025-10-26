# Design Guidelines: Music & Lyrics AutoRAG Chatbot

## Design Approach

**Selected Approach:** Hybrid - Material Design foundation with Spotify/Apple Music-inspired aesthetics for music elements

**Justification:** The chatbot interface requires clarity and efficiency (Material Design), while the music/lyrics context demands emotional engagement and visual appeal (music app inspiration). This creates a unique experience that feels both functional and artistic.

**Key Design Principles:**
- Conversational clarity: Chat must be instantly readable and accessible
- Music-first personality: Interface celebrates the artistic content
- Seamless interaction: No friction between asking and discovering
- Visual rhythm: Design mirrors musicality through balanced spacing and typography

---

## Core Design Elements

### A. Typography

**Primary Font Family:** Inter (via Google Fonts CDN)
- Display/Headers: 700 weight, tracking-tight
- Chat Messages: 400-500 weight for readability
- Lyrics Display: 400 weight, leading-relaxed for poetry-like spacing

**Type Scale:**
- Hero Title: text-5xl md:text-6xl font-bold
- Section Headers: text-2xl md:text-3xl font-bold
- Chat Messages: text-base md:text-lg
- Timestamps/Meta: text-sm text-opacity-70
- Lyrics: text-lg md:text-xl leading-relaxed

### B. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16 (p-2, h-8, gap-6, etc.)

**Grid Structure:**
- Single-column mobile (base)
- Chat interface: max-w-4xl centered container
- Optional sidebar for song/album context: 2-column split on lg: (sidebar 320px fixed, chat flex-1)

**Vertical Rhythm:**
- Message spacing: gap-4 between messages
- Section padding: py-8 md:py-12
- Component internal: p-6 md:p-8

### C. Component Library

**Core Chat Components:**

1. **Chat Container**
   - Fixed header with app branding and current context (song/album playing)
   - Scrollable message area with auto-scroll to latest
   - Fixed footer with input field
   - Glassmorphism effect for header/footer (backdrop-blur-lg)

2. **Message Bubbles**
   - User messages: Right-aligned, rounded-2xl, with subtle shadow
   - AI responses: Left-aligned, rounded-2xl, with lyrics/content cards embedded when relevant
   - Typing indicator: Animated dots for AI thinking state
   - Message actions: Copy button, timestamp on hover

3. **Input Field**
   - Large textarea with auto-resize (min-h-12, max-h-32)
   - Send button (Heroicons: paper-airplane)
   - Voice input option (microphone icon)
   - File upload for song reference (optional)

4. **Lyrics/Content Cards** (embedded in AI responses)
   - Album art thumbnail (64x64)
   - Song title + artist
   - Lyrics excerpt with scroll
   - Play button integration
   - Full lyrics expansion button

5. **Music Player Bar** (sticky bottom or integrated in chat)
   - Album art (48x48)
   - Song title + artist scrolling marquee if needed
   - Play/pause, previous, next controls (Heroicons)
   - Progress bar with seek capability
   - Volume control (collapsed on mobile)

**Navigation:**
- Minimal top nav: Logo/Title + optional hamburger menu
- Mobile: Bottom navigation with Chat, Library, Profile tabs
- Desktop: Persistent sidebar with Recent Chats, Favorite Songs, Albums

**Forms:**
- Single primary input: Chat textarea
- Secondary: Search bar for direct song/lyric lookup
- Consistent rounded-xl borders, focus states with ring-2

**Data Displays:**
- Song/Album Grid: 2-3 columns on desktop, 1 on mobile
- Lyric excerpts: Monospace-adjacent font for poetry feel
- Commentary snippets: Blockquote styling with left border accent

**Overlays:**
- Full-screen lyrics view: Modal with close button, scroll, dark backdrop
- Album details: Slide-up panel on mobile, modal on desktop

### D. Animations

**Minimal, Purposeful Only:**
- Message send: Subtle slide-up fade-in (100ms)
- AI typing: Pulsing dots animation
- Player controls: Micro-interactions on click (scale-95 active state)
- NO scroll animations, NO complex transitions

---

## Page Structure

### Main Chat Interface

**Hero Section (Compact, 40vh max):**
- Centered app title: "Explore My Music Through Conversation"
- Subtle tagline: "Ask about lyrics, meanings, or discover songs"
- Background: Blurred album art mosaic or gradient
- Quick start prompts: 3-4 suggested questions as clickable chips

**Chat Area (Primary Focus):**
- Clean white/dark background with messages in contrasting containers
- Welcome message from AI pre-loaded
- Example queries visible before first interaction
- Infinite scroll upward for history

**Sidebar/Context Panel (Desktop lg:):**
- Now Playing card at top
- Recent searches/queries
- Quick access to albums/songs
- Your commentary articles as expandable list

**Footer:**
- Persistent input bar
- Keyboard shortcuts hint (desktop)
- Credits/links

---

## Images

**Hero Background:**
- Mosaic of album covers (4x4 grid) with heavy blur (blur-3xl) and opacity-30
- Or: Abstract musical visualization (waveform, spectrum)

**Album Art:**
- Required throughout: 48x48 (player), 64x64 (cards), 256x256 (modals)
- Always use rounded corners (rounded-lg)
- Fallback: Musical note icon placeholder

**Background Treatment:**
- Hero: Blurred album mosaic behind glassmorphic overlay
- If buttons on hero: backdrop-blur-md bg-opacity-90 for button backgrounds

**Note:** Large hero image is NOT used - this is a functional app prioritizing the chat interface. Hero is compact (40vh) with blurred treatment to set mood without dominating.

---

## Accessibility

- ARIA labels on all interactive elements
- Focus indicators: ring-2 ring-offset-2
- Color contrast minimum 4.5:1 for text
- Keyboard navigation: Tab through messages, Enter to send, Escape to close modals
- Screen reader announcements for new AI messages
- Consistent form input styling across all text fields

---

This design creates a distinctive music exploration experience where conversation feels natural and discovering lyrics/commentary is delightful. The interface balances functional chat with artistic music presentation, avoiding generic chatbot patterns while maintaining usability.