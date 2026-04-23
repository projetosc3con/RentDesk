---
name: AgroTech Modern
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#414844'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#7a5649'
  on-secondary: '#ffffff'
  secondary-container: '#fdcdbc'
  on-secondary-container: '#795548'
  tertiary: '#755b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#d2a500'
  on-tertiary-container: '#4f3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ebbcac'
  on-secondary-fixed: '#2e150b'
  on-secondary-fixed-variant: '#603f33'
  tertiary-fixed: '#ffdf90'
  tertiary-fixed-dim: '#f0c12c'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
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
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is engineered for the high-stakes environment of agricultural logistics and heavy machinery management. The brand personality is grounded, authoritative, and technologically advanced, bridging the gap between traditional farming values and modern data-driven efficiency. It aims to evoke a sense of reliability and "industrial precision" through a structured, highly organized interface.

The chosen style is **Corporate / Modern** with a focus on high-density information architecture. It utilizes a refined card-based system to modularize complex workflows—such as fleet tracking, maintenance scheduling, and rental agreements—ensuring that users feel in control of their operations at all times.

## Colors

The palette is rooted in the natural environment of the agricultural sector but elevated for a professional software context.

- **Primary (Deep Forest Green):** Used for navigation, primary actions, and brand identification. It represents growth and stability.
- **Secondary (Earth Brown):** Reserved for subtle accents, secondary buttons, and grouping related to soil or groundwork tasks.
- **Tertiary (Golden Wheat):** High-visibility highlight color used for warnings, attention-required states, and significant metrics.
- **Neutral (Slate Grays):** A comprehensive range of grays used to manage hierarchy in data-heavy tables and dashboard surfaces.
- **Semantic Accents:** Specific shades are designated for machinery status: Green for 'Available', Slate for 'Rented', and Amber for 'Maintenance'.

## Typography

The typography system prioritizes legibility and data density. **Inter** is utilized across all levels for its exceptional clarity on screens and its neutral, utilitarian character. 

For the ERP's many tables and dashboards, "Tabular Figures" must be enabled to ensure numerical data aligns vertically for easier scanning. Heading weights are kept robust to provide clear section breaks in long-form administrative pages, while labels use a slightly tighter, uppercase tracking to distinguish them from editable data.

## Layout & Spacing

The design system employs a **Fixed Grid** model for desktop views (max-width 1440px) to maintain a consistent density that professional users can muscle-memorize. 

- **Grid:** 12-column system with 16px gutters.
- **Margins:** 24px outer margins for dashboard containers.
- **Rhythm:** A strict 4px base-unit scale ensures mathematical harmony between components. 
- **Density:** High-density layout is preferred. Content-heavy tables should utilize condensed vertical padding (8px) to maximize the amount of information visible above the fold.

## Elevation & Depth

To maintain a professional and organized feel, this design system uses **Tonal Layers** combined with **Low-Contrast Outlines**.

- **Level 0 (Background):** Slate-50 surface for the main application canvas.
- **Level 1 (Cards/Containers):** Pure white background with a 1px border in Slate-200. No shadow or very subtle (2px blur, 2% opacity) to keep the UI flat and focused.
- **Level 2 (Modals/Popovers):** Standard elevation with a more pronounced, diffused ambient shadow to separate it from the workspace.

Depth is primarily communicated through color-blocking rather than shadows, ensuring the interface feels light and fast.

## Shapes

The shape language is **Soft (Level 1)**. This offers a professional balance—the subtle rounding (4px-8px) softens the industrial nature of the data without appearing too "consumer" or "playful." 

- Small components (Checkboxes, Inputs): 4px radius.
- Medium components (Buttons, Chips): 6px radius.
- Large components (Cards, Modals): 8px radius.
- Status Badges: Use a higher radius (12px) to distinguish them as interactive or informative pills within square-heavy tables.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Deep Forest Green with white text.
- **Secondary Action:** Ghost style with Slate-600 text and Slate-200 borders.
- **Input Fields:** Inset appearance with 1px Slate-300 borders, turning Deep Forest Green on focus. Labels must always be visible above the field.

### Chips & Badges (Machinery Status)
- **Status Indicators:** Use high-contrast background tints with bold text. 
    - *Available:* Green tint with Deep Forest Green text + "Check" icon.
    - *Rented:* Slate tint with Dark Slate text + "Clock" icon.
    - *Maintenance:* Amber tint with Brown text + "Wrench" icon.

### Cards
- Standardize all machinery listings into cards featuring a top-aligned photo, a bold title, and a 2-column key-value list for technical specs (e.g., Horsepower, Daily Rate).

### Iconography
- Use functional, stroke-based icons (2px weight). Focus on machinery-specific metaphors: tractor outlines, fuel gauges, GPS markers, and logistics crates.

### Additional Components
- **Data Tables:** Striped rows (Slate-50) to assist eye-tracking across wide displays.
- **Equipment Timeline:** A custom horizontal gantt-style component for viewing rental schedules and maintenance windows.