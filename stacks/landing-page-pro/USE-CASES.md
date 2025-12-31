# Landing Page Pro Kit - Use Cases

## Who This Is For

Technical founders, solopreneurs, and product teams shipping landing pages in days—not weeks. You need beautiful, SEO-ready pages that convert without hiring designers or spending hours on setup.

## Use Case 1: SaaS Product Launch

**Scenario:** Ship a landing page for your new project management tool before beta signup deadline. Need hero section, feature highlights, pricing tiers, testimonials, CTAs.

**Prompt:** `"Create a SaaS landing page for [ProductName], a [problem-solving tool]. Include: hero with headline + CTA, 5-6 key features with icons, pricing comparison table, 3 customer testimonials with photos, FAQ section, and footer. Design should be modern, clean, conversion-focused. Use Next.js for SEO metadata."`

**Outcome:** Production-ready landing page with Core Web Vitals optimized, dynamic meta tags per page, form API integration ready, mobile-perfect conversion funnel.

---

## Use Case 2: Agency Service Showcase

**Scenario:** Freelancer/agency needs portfolio site to land high-value clients. Show 3-4 case studies with measurable results, services breakdown, clear pricing, social proof from past clients.

**Prompt:** `"Build a landing page showcasing [AgencyType] services. Features: case studies with before/after metrics, services grid (3-4 offerings), client logos, team bios, booking/contact form, testimonial carousel. Brand color: [color]. Make it portfolio-grade."`

**Outcome:** Client-winning page with rich media support, Schema markup for Local Business SEO, embedded booking widget ready, image optimization pre-configured.

---

## Use Case 3: Event Registration

**Scenario:** Virtual conference in 2 weeks needs registration page. Urgent timeline, medium traffic expected. Need speaker lineup, agenda, pricing tiers, urgency messaging (limited spots), attendee testimonials.

**Prompt:** `"Design event landing page for [EventName] on [date]. Include: hero with event date countdown timer, speaker profiles with headshots, agenda timeline, 3 ticket tiers with features, testimonials from past attendees, registration form (name/email/company), sponsor logos. Make it visually engaging and urgency-driven."`

**Outcome:** Fast-loading event page with countdown logic, form validation + email confirmation hooks, sponsor integration, mobile-optimized for social shares.

---

## Use Case 4: Lead Magnet / B2B Conversion

**Scenario:** Distribute gated whitepaper, e-book, or demo access. Need clean form, benefit copy, credibility signals, and qualified lead capture without friction.

**Prompt:** `"Create lead capture landing page for [ResourceName]: a [resource-type] that solves [problem]. Components: compelling headline explaining value, 3-4 bullet points of benefits, high-quality mockup/preview image, simple form (5 fields max), trust badges, thank-you page redirect. Make conversion-first."`

**Outcome:** High-converting lead page with form submission API hooks, thank-you page with email confirmation, field validation, conversion tracking ready.

---

## Use Case 5: Creator Portfolio / Service Booking

**Scenario:** Designer/developer needs personal brand site. Showcase best work, set rates clearly, make booking friction-free. Build authority fast.

**Prompt:** `"Build a creator portfolio: headline 'I'm [name], a [specialty] who helps [audience]', showcase 4-5 best projects with descriptions, services + pricing section, simple inquiry form, testimonials from clients, social links, SEO-optimized for '[keyword]'."`

**Outcome:** Portfolio page with image gallery optimization, contact form + Calendly/booking embed ready, Schema markup for Person SEO, performance-tuned for visual-heavy content.

---

## Quick Start Workflow

1. **Choose Your Use Case** → Pick which scenario matches your need (SaaS, event, portfolio, lead magnet, agency)
2. **Customize the Prompt** → Adapt template above with your product/company details
3. **Activate Kit Agents** → Use `/nextjs-developer` for builds, `/seo-specialist` for meta tags, `/tailwind-pro` for design refinement
4. **Form Integration** → Specify your backend (Slack, email, Stripe, webhook) during development
5. **Deploy & Monitor** → Ship to Vercel, track conversions with GA4, iterate based on metrics

---

## Pro Tips

- **Hero Section Rule:** Your value proposition should be clear in first 5 seconds without scrolling. Test with team members.
- **CTA Button Placement:** Put primary CTA above fold and repeat every 2-3 sections. Use action verbs ("Get Demo," "Join Free," not "Submit").
- **Form Field Friction:** Each form field = 5-10% drop-off. Minimum: email. Optional: company, budget, timeline.
- **Social Proof Placement:** Put strongest testimonial/stat right after hero section. Client logos near CTAs for trust.
- **Image Optimization:** Next.js Image component handles sizing/formats automatically. Don't skip—Core Web Vitals depend on it.
- **Mobile Testing:** Landing pages live or die on mobile. Test CTAs are easy-to-tap, form isn't zoomed-in, no horizontal scroll.
- **SEO Metadata:** Use `/seo-specialist` agent to generate meta titles (50-60 chars) + descriptions (155-160 chars) with keywords early.
- **Conversion Tracking:** Add `gtag.js` for GA4 conversion events (form submit, CTA click, scroll depth). Measure what matters.
