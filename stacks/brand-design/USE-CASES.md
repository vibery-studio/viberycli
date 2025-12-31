# Brand & Design Kit - Use Cases

## Who This Is For

Developers building multi-page apps or teams that need consistent, maintainable design systems. Avoid inconsistent colors, typography mismatches, and manual style duplication across components.

## Use Case 1: Establishing Brand Color System

**Scenario:** You're starting a SaaS app with brand colors (primary, secondary, accents) but components use random hex values scattered across files.

**Prompt:** `/design Extract brand colors from our Figma and create a Tailwind config with CSS variables for primary (#0066FF), secondary (#7C3AED), accent (#FF6B35), and semantic colors (success, warning, error). Generate a color palette reference doc.`

**Outcome:** Tailwind config with theme colors, dark mode variants, and a colors.md guide. Change primary in one place; all components update.

## Use Case 2: Typography Consistency Across Pages

**Scenario:** Landing page uses Inter, dashboard uses Plex Sans, modals have undefined font sizes. No visual hierarchy.

**Prompt:** `/design Design a typography system using Inter for sans (headings, UI) and Lora for serif (body, featured text). Define scale: H1-H6, Body, Caption. Generate Tailwind @layer utilities for font sizes, weights, line heights.`

**Outcome:** Tailwind typography utilities (text-h1, text-body, text-caption) + Google Fonts imports. Consistent look across all pages.

## Use Case 3: Component Styling Patterns (Dark Mode)

**Scenario:** Dark mode colors inconsistent—some cards use bg-gray-800, others bg-slate-900. Borders and text contrast fail accessibility checks.

**Prompt:** `/design Audit our dark mode theming and create shadcn/ui-compatible color tokens: backgrounds (elevated, surface, muted), text (primary, secondary, muted), borders with 4.5:1 contrast ratios. Build CSS variable system for light/dark toggle.`

**Outcome:** CSS variables file, Tailwind config update, accessibility checklist. Dark mode toggles work across all components.

## Use Case 4: Responsive Design Consistency

**Scenario:** Mobile spacing is cramped (4px gaps), tablet breakpoints missing, desktop is 1440px max-width in some places, 1280px in others.

**Prompt:** `/design Design responsive grid system: mobile (320px), tablet (768px), desktop (1024px), wide (1440px). Define spacing scale (8px base). Create mobile-first Tailwind container classes with padding strategy.`

**Outcome:** Tailwind spacing utilities + container config. Responsive layouts auto-adjust; no responsive class duplication.

## Use Case 5: Design System Documentation

**Scenario:** New team members don't know which colors/fonts/spacing to use. Figma design system exists but code doesn't match.

**Prompt:** `/design Create comprehensive design system docs: color palette (hex, CSS vars, usage rules), typography (fonts, sizes, weights, line heights), spacing scale (padding/margin presets), component patterns (buttons, cards, forms with hover/focus states).`

**Outcome:** DESIGN-SYSTEM.md with visual examples, color contrast checker, spacing grid. Single source of truth for design decisions.

## Quick Start Workflow

1. **Define Brand** - Extract colors, fonts, spacing from brand guidelines or Figma
2. **Configure Tailwind** - Create tailwind.config.js with theme tokens (colors, typography, spacing)
3. **Implement Tokens** - Convert to CSS variables or Tailwind classes (@layer utilities)
4. **Document Rules** - Write DESIGN-SYSTEM.md with usage examples and constraints
5. **Audit Components** - Check existing components against system; refactor inconsistencies

## Pro Tips

- Use `@layer` in Tailwind to organize custom utilities (colors, typography, spacing) separately from component styles
- Store theme values as CSS variables (--color-primary, --font-sans) so developers can switch themes without rebuilding
- Always test dark mode; use opacity utilities (bg-white/80) instead of lighter hex values for glass effects in light mode
- Create a "color contraints" rule: never use gray-400+ for body text (fails 4.5:1 accessibility ratio)
- Define spacing scale (8px, 16px, 24px) and stick to it—no random 11px or 27px margins
