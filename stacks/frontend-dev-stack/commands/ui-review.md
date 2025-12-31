# ui-review

Review frontend code for UI/UX quality, accessibility, and best practices.

## Usage

```
/ui-review [file-or-directory]
```

## Process

1. **Visual Quality Check**
   - No emojis as icons
   - Consistent icon set (Heroicons/Lucide)
   - Hover states don't cause layout shift
   - Smooth transitions (150-300ms)

2. **Accessibility Audit**
   - All images have alt text
   - Form inputs have labels
   - Focus states visible
   - Color contrast meets WCAG AA (4.5:1)

3. **Responsive Check**
   - Mobile-first implementation
   - Test at 320px, 768px, 1024px, 1440px
   - No horizontal scroll on mobile

4. **Performance Review**
   - Heavy components lazy loaded
   - No early returns with spinners
   - useMemo/useCallback where needed
   - Bundle size reasonable

5. **Code Quality**
   - TypeScript strict mode
   - No `any` types
   - Proper file organization
   - Import aliases used

## Output

Returns prioritized list of issues with fix suggestions.
