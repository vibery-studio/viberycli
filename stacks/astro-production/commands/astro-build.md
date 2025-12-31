# astro-build

Run production build with pre-flight checks.

## Usage

```
/astro-build [--check] [--preview]
```

## Process

1. Run type checking (`astro check`)
2. Validate Content Collections
3. Build for production (`astro build`)
4. Report bundle size and page count
5. Optionally preview (`astro preview`)

## Commands

```bash
# Full build with checks
astro check && astro build

# Preview after build
astro preview

# Analyze bundle
npx astro build --analyze
```

## Pre-build Checklist

- [ ] No TypeScript errors
- [ ] Content Collections valid
- [ ] Images optimized
- [ ] Environment variables set
- [ ] Adapter configured (cloudflare/vercel/node)

## Common Issues

### Build fails on Content Collection

Check `src/content/config.ts` schema matches content files.

### Images not optimizing

Use `import` for local images, not string paths.

### SSR routes not working

Ensure `output: 'hybrid'` or `'server'` in astro.config.
