# BRAND_GUIDE.md

# AutoMechanica — Brand Identity Guide

This document defines the official brand identity, color system, typography, UI style, iconography, and visual rules for the AutoMechanica platform. All frontend components, UI copy, marketing content, and generated designs must consistently follow this guide.

---

# 1. Brand Essence

**Brand Name:** AutoMechanica  
**Tagline:** “Precision-engineered intelligence for every vehicle.”  
**Core Values:**  
- Accuracy  
- Trust  
- Engineering excellence  
- Transparency  
- Modern intelligence  

AutoMechanica represents a fusion of automotive expertise and intelligent, AI-powered fitment precision.

---

# 2. Color System

The AutoMechanica palette balances technological clarity with automotive grit. Use these colors consistently across UI, marketing materials, and generated content.

## 2.1 Primary Colors

| Name | Hex | Usage |
|------|------|--------|
| **Electric Teal** | `#2EE8C9` | Primary accent, CTA buttons, highlights, focus states |
| **Deep Navy** | `#0D1B2A` | Headers, navigation bars, dark backgrounds |
| **Gunmetal Gray** | `#1F2933` | Cards, panels, general UI surfaces |

---

## 2.2 Secondary Colors

| Name | Hex | Usage |
|------|------|--------|
| **Steel Blue** | `#3A6EA5` | Icons, section dividers, subtle accents |
| **Charcoal Black** | `#0A0A0A` | Primary text, ultra-dark modes |
| **Soft Graphite Gray** | `#4A5568` | Secondary text, muted labels |

---

## 2.3 Status & Signal Colors

| Name | Hex | Meaning |
|------|------|---------|
| **Mint Green** | `#98F6C3` | Success, “Guaranteed Fit” badges |
| **Signal Yellow** | `#FFBE0B` | Warnings, “Likely Fit” badges |
| **Infra Red** | `#FF3B30` | Errors, “Verify Fitment” alerts |

These will be used consistently across Fitment Confidence Indicators.

---

# 3. Typography

AutoMechanica’s typography should evoke precision and clarity.

## 3.1 Fonts

- **Primary Font:** Inter (clean, modern, readable)
- **Secondary Accent Font:** Space Grotesk (used sparingly for headings)

## 3.2 Typography Scale (Tailwind Ready)

- `text-xs` — disclaimers, micro labels  
- `text-sm` — UI labels, metadata  
- `text-base` — paragraphs  
- `text-lg` — product details, medium emphasis  
- `text-xl` — section headers  
- `text-2xl` — page titles  
- `text-4xl` — hero statements  

---

# 4. UI Components — Styling Rules

This section ensures Codex and any engineer can generate consistent, brand-aligned UI components.

## 4.1 Buttons

### Primary Button
- Background: Electric Teal  
- Text: Charcoal Black  
- Border radius: `rounded-md`  
- Padding: `px-4 py-2`  
- Hover: darkened teal  
- Focus: teal ring (`ring-2 ring-teal-400`)  
- Use for: CTAs like “Add to Cart”, “Save Vehicle”

### Secondary Button
- Background: Gunmetal Gray  
- Text: Electric Teal  
- Hover: slight darken  
- Use for: secondary actions, settings

### Danger Button
- Background: Infra Red  
- Text: white  
- Use for: destructive or high-risk actions

---

## 4.2 Cards

- `rounded-lg`  
- Border: `border border-slate-800`  
- Background: `bg-slate-900/30`  
- Inner padding: `p-6`  
- Shadow: subtle (`shadow-md shadow-slate-900/30`)  

Use for product cards, fitment summaries, supplier comparisons.

---

## 4.3 Input Fields

- `rounded-md`  
- Border: `border border-slate-700`  
- Background: `bg-slate-900`  
- Text: white  
- Focus state: `border-teal-400 ring-teal-400`  
- Placeholder: muted gray

---

# 5. Iconography

AutoMechanica uses **outlined, thin-line icons** to evoke engineering diagrams and schematics.

Rules:
- Stroke width: 1.5px  
- No filled icons  
- Color: Steel Blue or Electric Teal depending on context  
- Common icons: vehicle, wrench, shield, checkmark, warning triangle, search, filter, info, arrow pair

---

# 6. Imagery

AutoMechanica’s imagery style is:

- High contrast  
- Neutral backgrounds  
- Sharp 45° angle product photography  
- Avoid clutter  
- No harsh filters  
- Slight vignette allowed  

This applies to:
- Product images  
- Category banners  
- Support illustrations  
- Diagnostic visuals

---

# 7. Layout & Spacing

Standard spacing values (Tailwind):

- `p-4`, `p-6`, `p-8`  
- `space-y-4` for vertical stacks  
- `space-x-4` for horizontal stacks  
- `grid gap-6` for product grids  
- `max-w-7xl mx-auto` for page content width  

Sections should feel airy, clear, and grid-aligned.

---

# 8. Fitment Confidence Badges

These badges appear throughout the app and must follow branding:

### High Confidence (≥ 0.90)
- Background: Mint Green  
- Icon: checkmark  
- Text: “Guaranteed Fit”  
- Tooltip: “Verified across multiple sources and past successful orders.”

### Medium Confidence (0.75–0.89)
- Background: Signal Yellow  
- Icon: warning  
- Text: “Likely Fit”  
- Tooltip: “Confidence is moderate. Double-check brake type or trim.”

### Low Confidence (< 0.75)
- Background: Infra Red  
- Icon: alert-circle  
- Text: “Verify Fitment”  
- Tooltip: “We’re not fully confident. Let’s confirm your vehicle details.”

---

# 9. Example Component Mockups (ASCII)

```
┌───────────────────────────────────────┐
│ 2015 Honda Civic EX 1.8L               │
│                                       │
│  [ Guaranteed Fit ]                   │
│                                       │
│  Front Ceramic Brake Pads             │
│  Brand: ACME                          │
│  $89.99                                │
│                                       │
│  [ Add to Cart ]                      │
└───────────────────────────────────────┘
```

---

# 10. Branding Usage Rules

- Never stretch or warp colors  
- Use Electric Teal sparingly — avoid teal overload  
- Use consistent fitment badge patterns  
- Avoid competing color accents  
- Always preserve information hierarchy (headings → details → metadata)

---

# 11. Future Brand Extensions (Phase 5+)

- Branded packaging designs  
- Printed slips & inserts  
- Vehicle diagnostics dashboards  
- Loyalty system visuals  

---

# End of BRAND_GUIDE.md
