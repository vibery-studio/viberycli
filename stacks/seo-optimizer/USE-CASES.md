# SEO Optimizer Kit - Use Cases

## Who This Is For

Developers managing web properties who need to improve search rankings and user experience. Perfect for those building Next.js sites, SPAs, or performance-critical applications struggling with Core Web Vitals or technical SEO.

---

## Use Case 1: Fixing Core Web Vitals to Improve Rankings

**Scenario:** Your site ranks #3-5 but slower competitors rank higher. Google Search Console shows poor Core Web Vitals (LCP >3s, CLS >0.15).

**Prompt:** `/optimize-bundle-size` - Analyze current bundle, identify unused code, and apply tree-shaking.

**Outcome:** Reduce bundle size, faster LCP (<2.5s), improve rankings as a tie-breaker factor. Studies show 31% LCP improvement = 8% more sales.

---

## Use Case 2: Performance Audit for Technical SEO Compliance

**Scenario:** You're launching a new product site and need to meet technical SEO baseline before promotion.

**Prompt:** `/performance-audit` - Run Core Web Vitals analysis, check mobile-first indexing readiness, scan for Core Web Vital violations.

**Outcome:** Report on LCP, INP (<200ms), CLS (<0.1), mobile responsiveness, and structured data readiness for search engines.

---

## Use Case 3: Next.js SSR/SSG Performance Analysis

**Scenario:** Your Next.js app uses dynamic routes and you're unsure if SSR is hurting page speed or if SSG would be better.

**Prompt:** `/nextjs-performance-audit` - Analyze SSR/SSG impact, identify slow rendering paths, check hydration performance.

**Outcome:** Specific recommendations (enable ISR, switch routes to SSG, optimize image loading) tied to Core Web Vitals improvements.

---

## Quick Start Workflow

1. Run `/performance-audit` to establish baseline metrics and identify bottlenecks
2. Use `/optimize-bundle-size` to reduce JavaScript payload (major LCP factor)
3. For Next.js sites, run `/nextjs-performance-audit` to optimize rendering strategy
4. Monitor results: expect 28-day lag before ranking improvements appear in Google Search Console
5. Document changes—meta tags, schema markup improvements, structured data additions

---

## Pro Tips

- **Structured Data Matters:** Implement JSON-LD schema (Article, Product, FAQ) to rank in rich results and help AI search engines understand your content.
- **Meta Tags Still Count:** Title tags and descriptions influence CTR from SERPs; 37% better CTR with optimization. Use 55-60 characters for titles.
- **Mobile-First is Real:** Google ranks mobile performance first. Optimize viewport tags and test on mobile devices—each 100ms delay = 7% conversion loss.
- **28-Day Window:** Core Web Vitals improvements take ~28 days to impact rankings. Use Search Console to track changes.
- **Relevance > Speed:** Content quality matters most. Speed acts as a tie-breaker between pages of similar quality/relevance.
