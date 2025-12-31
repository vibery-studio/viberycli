# lighthouse-audit

Run Lighthouse performance audit on Astro site.

## Usage

```
/lighthouse-audit [url] [--mobile] [--desktop]
```

## Process

1. Start preview server if needed
2. Run Lighthouse CLI audit
3. Generate HTML report
4. Summarize Core Web Vitals
5. Suggest optimizations

## Commands

```bash
# Audit local preview
npx lighthouse http://localhost:4321 --output html --output-path ./lighthouse.html

# Mobile audit
npx lighthouse http://localhost:4321 --preset=perf --emulated-form-factor=mobile

# Desktop audit
npx lighthouse http://localhost:4321 --preset=perf --emulated-form-factor=desktop

# CI mode (returns exit code)
npx lighthouse http://localhost:4321 --budget-path=budget.json
```

## Target Scores

| Metric         | Target  |
| -------------- | ------- |
| Performance    | > 90    |
| Accessibility  | > 90    |
| Best Practices | > 90    |
| SEO            | > 90    |
| LCP            | < 2.5s  |
| FID            | < 100ms |
| CLS            | < 0.1   |

## Optimization Tips

- Enable image optimization (astro:assets)
- Defer non-critical JS (client:idle, client:visible)
- Preload critical fonts
- Use View Transitions for perceived speed
- Enable Cloudflare caching headers
