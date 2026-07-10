---
name: SEAPEDIA
version: 1.0.0
colors:
  primary: "#091426"          # Deep Navy Blue (Brand & Primary Text)
  secondary: "#0058be"        # Royal Blue (Primary Buttons & Links)
  tertiary: "#041528"         # Dark Navy Accent
  background: "#f7f9fb"       # Light Slate (Page Background)
  surface: "#f7f9fb"          # Surface Canvas
  surface-container-lowest: "#ffffff"  # Card background & Content Sheets
  surface-container-low: "#f2f4f6"     # Sidebar inputs & low containers
  surface-container-high: "#e6e8ea"    # Borders & Hover states
  surface-container-highest: "#e0e3e5" # Banners & Divider highlights
  on-background: "#191c1e"    # Primary Body Text
  on-surface: "#191c1e"       # Primary Surface Text
  on-surface-variant: "#45474c"  # Secondary Muted Text
  on-primary: "#ffffff"       # White text on Navy Backgrounds
  on-secondary: "#ffffff"     # White text on Royal Blue
  outline: "#75777d"          # Borders and outlines
  outline-variant: "#c5c6cd"  # Light/subtle dividers
  success: "#007a48"          # Forest Green (Positive states / Paid)
  warning: "#b27a00"          # Amber (Pending states / Unpaid)
  error: "#ba1a1a"            # Deep Red (Negative states / Cancelled)
  secondary-fixed: "#d8e2ff"  # Light blue backdrop glow
  on-secondary-fixed-variant: "#004395" # Deep active blue text
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    lineHeight: 56px
    fontWeight: 700
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    lineHeight: 40px
    fontWeight: 600
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    lineHeight: 32px
    fontWeight: 600
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    lineHeight: 28px
    fontWeight: 600
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    lineHeight: 28px
    fontWeight: 400
  body-md:
    fontFamily: Inter
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 400
  label-md:
    fontFamily: Inter
    fontSize: 14px
    lineHeight: 20px
    fontWeight: 500
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    lineHeight: 16px
    fontWeight: 600
spacing:
  xs: 4px
  sm: 12px
  base: 8px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  container-max: 1280px
borderRadius:
  DEFAULT: 4px
  lg: 8px
  xl: 12px
  full: 9999px
---

# SEAPEDIA Design System

SEAPEDIA is a clean, modern, and high-fidelity logistics marketplace and digital transaction platform. The design system uses an administrative light-mode visual language characterized by structural clarity, geometric precision, and an editorial navy-and-blue theme that projects efficiency, speed, and global trust.

## Core Visual Language

### Rationale
- **Color Contrast:** Deep Navy (`#091426`) is used for primary brand elements, headers, and major titles to create visual gravity. Royal Blue (`#0058be`) serves as the action color (buttons, interactive states) to guide focus.
- **Glassmorphic Boundaries:** Elements utilize solid white sheets (`#ffffff`) placed over a clean light slate canvas (`#f7f9fb`) to separate contexts without visual noise.
- **Typography Scaling:** Powered entirely by the **Inter** font family, optimizing text readability from micro-labeling (12px) to hero display headings (48px).

---

## Colors and Theme System
- **Brand Identity:** Deep Navy Blue is the brand identity. Keep layout structures clean, using borders (`#c5c6cd` / `#e0e3e5`) rather than heavy background shades.
- **Success & Status:**
  - `Paid / Completed`: Use Emerald/Forest Green (`#007a48` background tint with dark text).
  - `Pending / Unpaid`: Use Amber/Yellow (`#b27a00` background tint).
  - `Cancelled / Error`: Use Crimson Red (`#ba1a1a`).

---

## Layout Structure
- **Grid Layout:** Global grid maximum width is set to `1280px` (`max-w-container-max`).
- **Sidebar & Filters:** Uses an asymmetric filter placement (left filter column width `64` / `256px` alongside a multi-column catalog grid).
- **Navigation:** A sticky top header (`72px` height) anchors the application, containing system quick-switchers, profile selectors, and digital wallet balances.

---

## Interactive Components & States
- **Buttons (`.btn` / button):**
  - **Primary:** Filled with brand blue/navy, transitioning to hover state brightness (10% darker/brighter).
  - **Secondary:** Transparent with outline border, adding a subtle backdrop fill (`bg-secondary/10`) on hover.
  - **Disabled:** 50% opacity with pointer-events blocked.
- **Inputs:** Standard border radius is `8px` (`rounded-xl` or `rounded-lg`). On focus, inputs draw a 2px royal blue outline (`ring-2 ring-secondary/20`).

---

## Guidelines for Stitch AI Generation
1. **Never use heavy solid backdrops for bodies:** Keep the canvas `#f7f9fb` and place product widgets inside `#ffffff` cards.
2. **Iconography:** Use Google Material Symbols Outlined (`Material Symbols Outlined` font-family) with a filled/unfilled parameter (`font-variation-settings: 'FILL' 0` or `1`).
3. **Card hover micro-animations:** Elevate cards by scaling slightly (`scale-[1.01]`) and increasing shadow size (`shadow-lg`).
