---
name: Kinetic Enterprise
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#515e7e'
  primary: '#04122e'
  on-primary: '#ffffff'
  primary-container: '#1a2744'
  on-primary-container: '#828eb1'
  inverse-primary: '#b9c6eb'
  secondary: '#2560a0'
  on-secondary: '#ffffff'
  secondary-container: '#86b9fe'
  on-secondary-container: '#004884'
  tertiary: '#051422'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b2938'
  on-tertiary-container: '#8290a2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b9c6eb'
  on-primary-fixed: '#0d1b37'
  on-primary-fixed-variant: '#3a4665'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#d5e4f8'
  tertiary-fixed-dim: '#b9c8db'
  on-tertiary-fixed: '#0e1d2b'
  on-tertiary-fixed-variant: '#3a4858'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for high-density enterprise environments where clarity, speed of cognition, and professional trust are paramount. The aesthetic follows a **Corporate Modern** direction—balancing the rigorous structure of traditional finance and technology platforms with the clean, airy openness of contemporary SaaS.

The visual language emphasizes:
- **Precision:** Perfect alignment and consistent spacing to reduce cognitive load.
- **Authority:** A heavy reliance on the primary navy to anchor the navigation and key actions.
- **Focus:** Extensive use of whitespace and a restrained color palette to direct attention toward data and decision-making workflows.

## Colors

The palette is rooted in a "Navy and Steel" foundation to evoke stability and technical competence.

- **Primary Navy (#1a2744):** Used for structural elements like the sidebar, global header, and primary "Call to Action" buttons. It provides the strongest visual weight.
- **Steel Blue (#4a7fc1):** Functions as the interactive accent. Use this for links, active navigation states, and secondary actions.
- **Functional Grays:** The background is set to a cool-toned gray (#f4f6f9) to allow white cards (#ffffff) to "pop" via subtle contrast rather than heavy shadows.
- **Semantic Colors:** Reserved strictly for status and validation. Success Green, Warning Orange, and Danger Red are used in high-chroma variants to ensure accessibility against light backgrounds.

## Typography

The design system utilizes **Inter** across all levels to leverage its exceptional legibility and systematic feel. 

- **Scale:** A modular scale is used to ensure hierarchy in data-heavy views. 
- **Tracking:** Headlines use slightly tighter tracking (-0.01em to -0.02em) to appear more cohesive, while small labels use increased tracking (0.05em) for readability in UI chrome.
- **Weight:** Medium (500) and Semi-Bold (600) weights are used frequently to distinguish between interactive labels and static metadata.
- **Mobile Adaptation:** For screens smaller than 768px, `display` type scales down to `28px/36px` to maintain comfortable reading proportions.

## Layout & Spacing

This design system employs a **Fixed-Fluid Hybrid Grid** built on a 4px baseline.

- **Desktop (1280px+):** A 12-column grid with a fixed maximum width of 1440px. Gutters are fixed at 24px.
- **Tablet (768px - 1279px):** An 8-column fluid grid with 16px gutters.
- **Mobile (Below 768px):** A 4-column fluid grid. Sidebars transform into bottom sheets or overlay drawers.
- **Rhythm:** Spacing follows a geometric progression (4, 8, 16, 24, 32, 48, 64). Components like cards and input fields should standardise on `16px` (md) for internal padding.

## Elevation & Depth

To maintain a professional and "flat" corporate feel, depth is communicated primarily through **Tonal Layering** and **Low-Contrast Outlines** rather than dramatic shadows.

- **Level 0 (Background):** Background Gray (#f4f6f9). No shadow.
- **Level 1 (Cards/Content):** White (#ffffff) with a 1px solid Border (#e5e7eb). This is the default state for workspace tiles.
- **Level 2 (Hover/Active):** White (#ffffff) with a very soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) and a 1px border.
- **Level 3 (Overlays/Modals):** White (#ffffff) with a 1px border and a crisp shadow (0px 10px 25px rgba(26, 39, 68, 0.1)) to separate the dialog from the backdrop.

## Shapes

The design system adopts a **Soft (Level 1)** roundedness profile. This 4px (0.25rem) standard provides a subtle modern touch without sacrificing the "serious" architectural feel required by enterprise software.

- **Standard Elements (Buttons, Inputs, Cards):** 4px radius.
- **Large Containers (Modals):** 8px (0.5rem) radius.
- **Status Pills:** Fully rounded (capsule) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Primary Navy (#1a2744) with White text.
- **Secondary:** Outlined Steel Blue (#4a7fc1) with 1px border.
- **Ghost:** No background, Steel Blue text, Light Blue (#dbeafe) background on hover.

### Form Fields
- **Inputs:** White background, 1px Border (#e5e7eb), 4px radius.
- **Focus State:** 1px Steel Blue border with a 2px Light Blue outer glow (soft ring).
- **Labels:** Text Secondary (#6b7280) in `label-sm` or `body-md`.

### Status Chips
- Use the capsule shape (pill).
- Backgrounds should be 10-15% opacity versions of the semantic colors (e.g., Light Green for Success) with high-contrast bold text for accessibility.

### Cards
- Use for grouping related data points.
- Always include a 1px border. Header areas within cards should have a subtle bottom border to separate titles from content.

### Tables (Enterprise Critical)
- **Header:** Background Gray (#f4f6f9) with `label-md` typography.
- **Rows:** White background with 1px bottom border. Hover state uses Light Blue (#dbeafe) at 50% opacity.