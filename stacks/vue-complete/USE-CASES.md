# Vue Complete Kit - Use Cases

## Who This Is For

Professional Vue 3 developers building production apps. You need solid state management, component architecture, and styling—all production-ready.

## Use Case 1: Build App with Centralized State

**Scenario:** Multi-page SPA where user profile, cart, settings sync across 10+ components
**Prompt:** `@vue-expert Build a checkout flow with user profile, cart state, and order history using Composition API and Pinia`
**Outcome:** Modular store architecture with computed getters, state mutations, and typed state

## Use Case 2: Complex Form with Real-Time Validation

**Scenario:** Dynamic multi-step form that validates, resets, and syncs partial state to server
**Prompt:** `@tailwind-pro Create a responsive 3-step form component with live validation, field-level state management using composables`
**Outcome:** Reusable form composable, styled form inputs, validation logic

## Use Case 3: Responsive Dashboard with Tailwind

**Scenario:** Data dashboard needing grid layouts, dark mode toggle, responsive breakpoints
**Prompt:** `@tailwind-pro Build a responsive admin dashboard with cards, charts grid, and mobile-first layout`
**Outcome:** Tailwind-based grid system, utility-first components, responsive patterns

## Use Case 4: Shareable State Across Nested Components

**Scenario:** Deep component tree where grandchild needs parent state without prop drilling
**Prompt:** `@vue-expert Refactor this component tree using provide/inject with reactive state and readonly constraints`
**Outcome:** Cleaner component communication, typed inject, readonly enforcement

## Use Case 5: Optimize Bundle with Code Splitting

**Scenario:** Large app loading slow—need route-based lazy loading and dynamic imports
**Prompt:** `@vue-expert Add Vue Router with lazy-loaded route components and code splitting`
**Outcome:** Efficient route loading, chunked bundle, performance optimized

## Quick Start Workflow

1. Use `@vue-expert` for state, composables, lifecycle logic
2. Use `@tailwind-pro` for responsive layouts, theme, utilities
3. Stack both agents for full feature builds
4. Test with real data patterns before scale

## Pro Tips

- **Pinia over Vuex:** Modern, simpler, better TypeScript support
- **Composables > Mixins:** Reuse logic in setup() cleanly without naming conflicts
- **storeToRefs() required:** Destructure Pinia state to keep reactivity when using props
- **Tailwind PurgeCSS:** Ensure unused classes purged in production builds
