# Design Guidelines: High vs Low Sound Music Game

## Design Approach

**Selected Approach**: Reference-Based (Educational Gaming)

**Primary References**: 
- Duolingo's gamified learning interface and character-driven interactions
- Khan Academy Kids' child-friendly visual language and large touch targets
- ABCmouse's colorful, engaging educational aesthetics

**Key Design Principles**:
- Playful accessibility: Every element should be immediately understandable by kindergarteners
- Touch-first interaction: All interactive elements designed for small fingers on large screens
- Joyful feedback: Celebrate learning through vibrant colors and clear visual responses
- Consistent characters: Animal personalities that become familiar friends throughout gameplay

---

## Core Design Elements

### A. Color Palette

**Light Mode (Primary)**:
- Primary Brand: 220 85% 55% (Friendly blue - main UI elements)
- Success Green: 145 70% 50% (Correct answer feedback)
- Error Red: 0 75% 60% (Incorrect answer feedback)
- Background: 40 30% 98% (Warm off-white)
- Surface: 0 0% 100% (Pure white for cards)
- Text Primary: 220 20% 20% (Soft black for readability)
- Text Secondary: 220 15% 45% (Muted for secondary info)

**Dark Mode (For low-light classrooms)**:
- Primary Brand: 220 75% 60% (Brighter blue)
- Success Green: 145 65% 55%
- Error Red: 0 70% 65%
- Background: 220 25% 12%
- Surface: 220 20% 18%
- Text Primary: 40 30% 95%
- Text Secondary: 220 10% 70%

**Character Accent Colors** (for visual variety):
- Character A: 280 65% 60% (Purple tones)
- Character B: 35 75% 55% (Orange tones)

---

### B. Typography

**Font Families** (via Google Fonts):
- Primary: 'Fredoka' - Friendly, rounded sans-serif for headings and UI
- Body: 'Nunito' - Soft, highly legible for instructions
- Score/Numbers: 'Poppins' - Clean and clear for numerical displays

**Type Scale**:
- Hero/Game Title: text-5xl to text-7xl, font-bold (Fredoka)
- Question Prompt: text-3xl to text-4xl, font-semibold (Fredoka)
- Score Counter: text-2xl to text-3xl, font-bold (Poppins)
- Instructions: text-lg to text-xl, font-medium (Nunito)
- Feedback Messages: text-xl to text-2xl, font-semibold (Fredoka)

---

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16, 20** for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: gap-8 to gap-12
- Touch target minimum: 16 units (64px minimum)
- Screen padding: px-4 on mobile, px-8 on tablet, px-12 on desktop

**Grid Structure**:
- Main game area: Centered container, max-w-6xl
- Character placement: 2-column grid with generous gap-12 to gap-16
- Vertical stacking on mobile with gap-8

---

### D. Component Library

**Game Characters (Primary Interactive Elements)**:
- Large rounded containers (rounded-3xl) with min-h-80 on desktop, min-h-64 on mobile
- Character illustrations prominently centered
- Instrument images clearly visible below character
- Active state: scale-105 transform with subtle shadow-2xl
- Feedback overlay: Absolute positioned full-width banner (green/red) with opacity-90

**Score Display**:
- Fixed top-right position with backdrop-blur-sm background
- Large, bold numerical display with icon (star or trophy)
- Subtle border with shadow for depth
- Rounded-2xl container with p-6

**Question Prompt**:
- Centered, full-width banner above characters
- Contrasting background (surface color) with shadow-lg
- Generous padding (py-8, px-6)
- Rounded-xl with clear visual hierarchy

**Reset Button**:
- Secondary style (variant="outline") positioned bottom-center or top-left
- Medium size with rounded-full
- Clear icon (refresh/restart) with label

**Sound Playback Indicators**:
- Animated visual feedback when sound plays (pulsing border or glow effect on active character)
- Simple wave icon or speaker symbol during playback

**Feedback Overlays**:
- Full-width colored banners (green/red) with high opacity
- Large checkmark or X icon
- Brief encouraging message ("Great job!" / "Try again!")
- Rounded corners matching character containers

---

### E. Animations

**Use Sparingly - Only for Feedback**:
- Correct answer: Gentle bounce animation on character (animate-bounce, duration-500)
- Incorrect answer: Subtle shake animation (animate-shake, duration-300)
- Sound playback: Pulsing border or scale effect (animate-pulse)
- Score increment: Brief scale-up transition (transition-transform duration-200)
- NO background animations, NO constant motion
- All animations should complete within 500ms to maintain engagement

---

## Layout Specifications

**Game Screen Structure**:
1. Header bar with app title and score display
2. Question prompt banner (full-width, centered)
3. Two-column character grid (main interaction area)
4. Reset button (bottom or top-left corner)

**Responsive Breakpoints**:
- Mobile (< 768px): Single column, stacked characters with gap-8
- Tablet (768px - 1024px): Side-by-side characters with gap-12
- Desktop/TV (> 1024px): Optimized spacing with gap-16, larger touch targets

**Touch Target Sizing**:
- Character buttons: Minimum 240px × 320px on mobile, 320px × 400px on tablet/desktop
- Reset button: Minimum 56px × 56px
- All interactive elements: Minimum 48px for any dimension

---

## Images

**Character Illustrations**:
- Two distinct, friendly animal characters (e.g., elephant and giraffe, bear and rabbit)
- Colorful, cartoon style with high contrast against backgrounds
- Characters should be expressive and engaging
- Position: Centered within character containers, approximately 60% of container height

**Instrument Images**:
- Simple, recognizable orchestra instruments (violin, trumpet, drums, piano, etc.)
- Positioned below characters, smaller scale (30% of character size)
- Clear silhouettes for easy recognition

**Icons**:
- Use Heroicons (CDN) for UI elements: speaker, refresh, star, checkmark, X
- Large sizes (h-12 to h-16) for visibility

**No Hero Image**: This is a game interface, not a landing page - full focus on gameplay area.