# Astro Production Kit - Use Cases

## Who This Is For

Developers shipping fast, content-rich Astro 5 sites to Cloudflare Pages. Teams that need SSG/SSR hybrid setups with performance guarantees and deployment confidence.

## Use Case 1: Launch Static Marketing Site with 90+ Lighthouse Score

**Scenario:** Blog, docs, or marketing site that must load fast globally. No dynamic content needed.

**Prompt:** `@astro-expert set up a fully optimized static Astro site with Content Collections, Image optimization, and View Transitions. Target: 90+ Lighthouse score.`

**Outcome:**

- Type-safe content schema (Zod)
- Auto-optimized images with responsive formats
- Smooth page transitions
- Prerendered HTML at build time

## Use Case 2: Hybrid App (Static Pages + Dynamic Features)

**Scenario:** Marketing site with a real-time contact form, dynamic pricing calculator, or admin dashboard. Some pages prerendered, some server-rendered.

**Prompt:** `@astro-expert design an Astro hybrid site with prerendered marketing pages and on-demand SSR routes for dynamic features. Configure for Cloudflare Pages adapter.`

**Outcome:**

- Mixed `prerender: true` + SSR routes
- Islands architecture (Vue/React components only where needed)
- Ready for deployment to Cloudflare Workers
- Client JS kept minimal

## Use Case 3: Performance Crisis Recovery

**Scenario:** Existing Astro site has slow Core Web Vitals. Need to audit, identify bottlenecks, and optimize before production launch.

**Prompt:** `/lighthouse-audit then @astro-expert optimize images, defer non-critical JS with client:idle directives, and identify rendering issues.`

**Outcome:**

- Detailed Lighthouse report (Performance, Accessibility, SEO, Best Practices)
- Core Web Vitals metrics (LCP, FID, CLS)
- Specific optimization recommendations
- Actionable fixes ranked by impact

## Use Case 4: Deployment Pipeline Setup

**Scenario:** Need automated builds, previews, and deployments to Cloudflare Pages on every commit.

**Prompt:** `Configure Cloudflare Pages CI/CD for Astro: set build command to 'npm run build', output dir to 'dist', disable Auto Minify, and document deployment checklist.`

**Outcome:**

- GitHub/GitLab integration ready
- Auto-preview on pull requests
- Production deploy on merge
- Hydration mismatch issues prevented

## Use Case 5: Content at Scale (500+ Pages)

**Scenario:** Large documentation site, content marketplace, or blog with hundreds of pages. Need fast builds and maintainable content structure.

**Prompt:** `@astro-expert design Astro Content Collections with Zod schemas for blog posts, docs, and metadata. Include glob patterns for bulk imports and frontmatter validation.`

**Outcome:**

- Type-safe frontmatter validation
- Bulk content imports
- Auto-generated routes
- Built-in RSS/feeds support

## Quick Start Workflow

1. Install kit templates: `vibery install --stack astro-production`
2. Review Astro Expert agent with `/astro-expert list your recommendations for this project structure`
3. Build with `/astro-build` to catch errors pre-deploy
4. Audit with `/lighthouse-audit` to verify Core Web Vitals
5. Deploy via Cloudflare Pages CI/CD

## Pro Tips

- **Prerender aggressive:** `export const prerender = true` in `astro.config.mjs` for 99% of sites—builds once, serves globally instantly
- **Image format strategy:** Use `<Picture />` component to serve AVIF to modern browsers, WebP to mid-tier, JPG fallback—saves 30-40% bandwidth
- **Client directives are your friend:** `client:idle` for non-critical widgets, `client:visible` for below-fold content—Astro only hydrates what's needed
- **Cloudflare Auto Minify gotcha:** Disable it if you see hydration mismatches in console—Cloudflare's minification can break client-side rendering
- **Monitor build size:** Use `astro build --analyze` to find JS bloat—keep total JS under 100KB per page
