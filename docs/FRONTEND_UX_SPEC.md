# FRONTEND_UX_SPEC.md

# AutoMechanica — Frontend & UX Specification

This document defines the complete UX structure, component architecture, interaction flows, and visual rules for the AutoMechanica frontend.  
Codex must use this specification when implementing the React/Tailwind frontend.

---

# 1. UX Principles

AutoMechanica’s frontend must:

- Be vehicle-aware at all times  
- Communicate fitment confidence transparently  
- Feel premium, clean, and engineering‑inspired  
- Minimize friction  
- Prioritize clarity over flash  
- Support scalability for many part categories  

The frontend is composed of reusable components that follow the BRAND_GUIDE.md and VOICE_TONE_GUIDE.md.

---

# 2. Primary User Flows

The system has five essential UX flows:

1. **Vehicle Selection (“Garage”)**
2. **Browsing Categories**
3. **Product Detail Page (Canonical Part Page)**
4. **Search (Vehicle-aware + Global)**
5. **Cart & Checkout**

Each is described below.

---

# 3. Vehicle Selection (“Garage”)

Vehicle context affects everything.  
The user’s active vehicle is displayed in the header at all times.

## 3.1 Garage Component

Located in the site header:

```
[ AutoMechanica ]     [ Your Vehicle: 2015 Honda Civic EX ] ▼
```

Clicking opens a dropdown:

- Current active vehicle
- List of saved vehicles
- Button: “Add Vehicle”
- Ability to switch active vehicle

## 3.2 Add Vehicle Modal

Fields:

- Year (dropdown)
- Make (dropdown)
- Model (dropdown)
- Trim (dropdown)
- Engine (dropdown)

Validation:
- All fields required

UX Notes:
- Show loading states when pulling dependent lists (model → trim)
- Highlight saved vehicle after selection

---

# 4. Category Browsing

Categories depend on vehicle context.

## 4.1 Vehicle-Aware Category Page

URL example:

```
/vehicles/2015/honda/civic/brakes
```

Page elements:

- Page title: “Brakes for 2015 Honda Civic EX 1.8L”
- Filters:
  - Position (front/rear)
  - Material (ceramic, semi-metallic)
  - Price slider
  - Brand
- Product grid (cards)
- Vehicle context banner:
  > “Showing parts that fit your saved vehicle.”

## 4.2 Generic Category Page (No vehicle selected)

URL:

```
/categories/brakes
```

Banner:
> “Select your vehicle to see only parts that fit.”

Products shown:
- All parts in category
- No fitment indicators

---

# 5. Product Detail Page

Canonical part page showing ALL details and ALL supported vehicles.

## 5.1 Layout Overview

Sections:

1. Title + Price + Add to Cart  
2. Fitment Summary (based on active vehicle)  
3. Images  
4. Specs Table  
5. Description (SEO-generated)  
6. “Fits These Vehicles” table  
7. Supplier/Shipping details (optional)  
8. “Why This Fits” modal trigger  
9. “Ask AutoMechanica Support” button  

## 5.2 Fitment Summary Component

Three badge states:

### High Confidence
```
[ Guaranteed Fit ] — Verified for your 2015 Honda Civic EX (confidence: 0.93)
```

### Medium Confidence
```
[ Likely Fit ] — Confidence moderate. Double‑check brake type.
```

### Low Confidence
```
[ Verify Fitment ] — Fitment unclear. Let’s confirm your trim.
```

Uses colors from BRAND_GUIDE.md.

## 5.3 Specs Table

Structured attributes:

| Attribute | Value |
|----------|--------|
| Position | Front |
| Material | Ceramic |
| Hardware Included | Yes |

Specs come from canonical part attributes.

---

# 6. “Fits These Vehicles” Reverse Fitment List

Shows all supported vehicles for the part.

Table columns:

- Year  
- Make  
- Model  
- Trim  
- Engine  
- Confidence  

Vehicle-aware enhancements:
- Highlight active vehicle’s row  
- Tooltip: “Why this fits?”  

Filtering:
- Dropdown filters per column  
- Search bar for filtering vehicles

---

# 7. Global Search

Search box at top of site.

### Two modes:

## 7.1 Vehicle-aware Search (preferred)
If user has active vehicle:
- Return only parts with matching fitment
- Show fitment badge in search results

## 7.2 Vehicle-neutral Search
If no active vehicle:
- Return all canonical parts
- Display prompt:
  > “Set your vehicle to filter results by fitment.”

Search results card fields:
- Part name
- Category
- Price
- Fitment summary (if applicable)
- Thumbnail image

---

# 8. Cart & Checkout UX

## 8.1 Cart Line Items

Each line item displays:

- Part name
- Price
- Quantity
- Fitment badge (using user’s active vehicle)
- Warning if confidence < 0.75

Example:
```
Front Ceramic Brake Pads
[ Likely Fit ] — Confirm rear brake type before ordering.
```

## 8.2 Checkout

Before confirming order:

- Re-check fitment for all items
- Display warning messages if needed
- Offer support:
  > “Need help verifying fitment? Ask AutoMechanica Support.”

---

# 9. Support Agent Integration

## 9.1 “Ask AutoMechanica Support” Button

Appears in:
- Product pages  
- Cart  
- Checkout  

Opens an AI chat window pre-populated with:
- Vehicle
- Part
- Fitment confidence

The Support Agent follows VOICE_TONE_GUIDE.md.

---

# 10. Component Architecture (React)

## 10.1 /components

- `VehiclePicker.tsx`
- `GarageDropdown.tsx`
- `FitmentBadge.tsx`
- `ProductCard.tsx`
- `ProductDetail.tsx`
- `ReverseFitmentTable.tsx`
- `SpecsTable.tsx`
- `SupportChatEntry.tsx`
- `ConfidenceTooltip.tsx`
- `CategoryFilterPanel.tsx`
- `Header.tsx`
- `Footer.tsx`

## 10.2 /pages

- `/` (Home)
- `/add-vehicle`
- `/vehicles/[year]/[make]/[model]/[category]`
- `/parts/[partId]`
- `/search`

Directory structure compatible with Next.js or Vite + React Router.

---

# 11. Accessibility Standards (Important)

All components must follow:

- WCAG AA contrast  
- Proper ARIA roles  
- Focus-visible states  
- Keyboard navigation  
- Skip-to-content link  

---

# 12. Admin UX (Phase 2+)

Admin pages include:

- Fitment Review Queue  
- Content Review Queue  
- Workflow Monitor  
- Task Queue Dashboard  

These will be built later.

---

# End of FRONTEND_UX_SPEC.md
