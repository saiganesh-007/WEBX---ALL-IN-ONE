---
name: Kinetic Glass
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#ffb3af'
  on-tertiary: '#650911'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '450'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  section-gap: 80px
  glass-padding: 32px
---

## Brand & Style
The design system targets a sophisticated developer audience, prioritizing technical precision with a high-end editorial feel. It utilizes a **Glassmorphic** style layered over a **Minimalist** foundation. The aesthetic is defined by depth, transparency, and luminous accents that guide the user's eye toward interactive elements. 

The emotional response should be one of "effortless power"—a workspace that feels both futuristic and dependable. High-quality whitespace is used to prevent the dark theme from feeling cramped, while backdrop blurs maintain context across layered interfaces.

## Colors
The palette is rooted in a deep charcoal base (#0f172a) to provide maximum contrast for syntax highlighting and glass effects. 
- **Primary:** Emerald (#10b981) is used for "Commit" actions and success states.
- **Secondary:** Sky Blue (#38bdf8) is reserved for links, tags, and informational highlights.
- **Surface:** Glass layers use a semi-transparent slate to allow background gradients to bleed through subtly.
- **Accents:** Use a 1px "inner glow" border on cards to simulate light catching the edge of a glass pane.

## Typography
The typography system balances the humanist qualities of **Inter** for reading-heavy content with the technical rigor of **JetBrains Mono** for data and labels. 

- Use `display-lg` for project titles and hero sections.
- Use `code-sm` for all terminal snippets, file paths, and technical metadata.
- Use `label-caps` for small tags or category markers to add a "utility" feel to the interface.
- Keep line lengths for body text between 60-75 characters for optimal readability on dark backgrounds.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a strictly enforced 8px rhythm. 
- **Desktop:** 12-column grid with a 1280px max-width container. 
- **Mobile:** 4-column grid with 16px side margins.
- **Rhythm:** Use large vertical gaps (`section-gap`) to separate major portfolio pieces, ensuring the glass containers have room to "breathe" without visual overlap.
- **Internal Spacing:** Components like cards should use `glass-padding` (32px) to ensure content doesn't feel crowded against the blurred edges.

## Elevation & Depth
Depth is created through a combination of **Backdrop Blurs** and **Tonal Layering**, rather than traditional heavy shadows.
- **Level 0 (Background):** Solid #0f172a.
- **Level 1 (Cards/Sections):** `backdrop-filter: blur(12px)` with a 1px solid border of `rgba(255, 255, 255, 0.08)`.
- **Level 2 (Modals/Popovers):** Higher blur (20px) and a subtle outer glow using the primary color at 10% opacity.
- **Interactions:** On hover, glass elements should increase their border opacity and slightly shift the background-color lightness to signify lift.

## Shapes
This design system uses a pronounced **rounded-xl** (1.5rem / 24px) aesthetic for main containers and project cards to contrast the sharp, technical nature of the code. 
- **Large Components:** 24px (rounded-xl) for cards and main glass panels.
- **Standard Components:** 12px (rounded-md) for buttons and input fields.
- **Small Components:** 6px for checkboxes and small tags.

## Components
- **Buttons:** 
    - *Primary:* Solid Emerald fill with white text. Apply a subtle outer glow (`box-shadow`) of the same color.
    - *Secondary (Utility):* Glass background with white text and a 1px border.
    - *Ghost:* No background, secondary color text, only appearing on hover.
- **Project Cards:** Feature a background-blur surface with a top-down gradient stroke. Content inside should follow the 32px padding rule.
- **Input Fields:** Darker than the background (#0a0f1d) with a 1px border that glows Emerald on focus. Use JetBrains Mono for the input text.
- **Chips/Tags:** Rounded-pill shape using `code-sm` typography. Use a subtle secondary color background at 15% opacity.
- **Code Block:** A distinct container with a darker, non-transparent background to ensure syntax highlighting colors remain accurate and accessible.