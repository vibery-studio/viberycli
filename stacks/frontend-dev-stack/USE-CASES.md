# Frontend Dev Stack - Use Cases

## Who This Is For

Professional React/TypeScript developers building production applications needing expert guidance on component architecture, design patterns, performance optimization, and WCAG 2.2 accessibility compliance. Ideal for teams standardizing code quality and moving beyond boilerplate.

## Use Case 1: Build Design System Components with Confidence

**Scenario:** Your SaaS needs 40+ reusable components (buttons, modals, forms, tables) that work across 5 products. You want them accessible, responsive, and consistently styled—but building and reviewing them manually is slow.

**Prompt:** `/component-gen FormField --type component --with-form && /ui-review components/FormField`

**Outcome:** Auto-generated FormField component with React Hook Form + Zod validation, shadcn/ui styling, proper TypeScript types, and instant review catching missing labels, contrast issues, or touch target violations.

---

## Use Case 2: Audit Existing UI for Accessibility & Performance

**Scenario:** Your app has 200 components built over 2 years by different teams. Some have accessibility debt (poor contrast, missing alt text, focus states). You need to prioritize fixes without touching working code.

**Prompt:** `/ui-review src/components --full-audit`

**Outcome:** Comprehensive scan across all components reporting: missing WCAG AA compliance (color contrast, form labels), responsive breakpoint issues, performance bottlenecks (un-memoized renders, lazy loading gaps), icon consistency (emoji vs SVG), and exact file/line numbers for fixes.

---

## Use Case 3: Scale Mobile-First Responsive Design

**Scenario:** Your web app works great on desktop but mobile experience is broken—hamburger nav doesn't work, touch targets are 20px (should be 44px+), layout shifts on scroll. You have 30 views to fix.

**Prompt:** `@frontend-expert Design mobile-first breakpoints for components at 320px, 768px, 1024px. Check touch targets meet 44x44px Apple guidelines. Test horizontal scroll on mobile.`

**Outcome:** Expert refactoring of Tailwind breakpoints, touch-safe button spacing (using button padding + hover states), verification grid layout doesn't break at any breakpoint, and mobile navigation pattern recommendations.

---

## Use Case 4: Implement Complex Form with Real-Time Validation

**Scenario:** Multi-step checkout form with dependent fields (country → region → postal code). Need client-side validation, server-side error handling, loading states, and accessibility. Can't lose user data on page refresh.

**Prompt:** `/component-gen CheckoutForm --type feature --with-form --with-api && /ui-review`

**Outcome:** Full feature folder with form hooks, API service, error boundaries, Zod schemas, proper focus management on error, and persistent form state. All fields labeled and keyboard-navigable.

---

## Use Case 5: Debug Unexpected Re-renders Killing Performance

**Scenario:** Dashboard with 20 metric cards re-renders entire page when one metric updates. Performance profiler shows 2s+ lag. You need to isolate the problem and fix render thrashing.

**Prompt:** `@frontend-expert Find unnecessary re-renders in Dashboard. Use useMemo, useCallback, and memoization. Ensure TanStack Query doesn't trigger parent re-renders. Test with React DevTools Profiler.`

**Outcome:** Component memoization strategy, proper dependency arrays, useSuspenseQuery implementation for data, and Profiler screenshots proving render count dropped from 47 → 3 per update.

---

## Quick Start Workflow

1. **Generate**: `/component-gen YourComponent --type [feature|component] --with-[form|api]`
2. **Review**: `/ui-review src/components/YourComponent` → Fix flagged issues
3. **Ask Expert**: Describe design/perf challenge → Get specific, actionable refactors
4. **Verify**: Test accessibility (keyboard nav, screen reader), responsive (mobile → desktop), performance (DevTools Profiler)

---

## Pro Tips

- **Before styling anything**: Run `/ui-review` on competitor apps to steal good patterns (button sizes, hover states, spacing).
- **For accessibility**: Use `/ui-review` weekly. Automated tools catch ~40% of issues; the tool spots the rest (focus visibility, consistent help text).
- **For performance**: Profile first (Chrome DevTools → Performance tab), then ask expert about lazy loading, memoization, or state management splits.
- **Component organization**: Use feature-based structure (`features/auth/components`, `features/dashboard/hooks`) instead of flat `components/` folder—scales to 100+ components.
- **Touch design**: Aim for 48x48px minimum (Material Design) or 44x44px (Apple). Test on real devices—fingers are bigger than mice.
