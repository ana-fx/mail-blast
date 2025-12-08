# Performance Optimization Strategy

## Overview

This document outlines the performance optimization strategy for MailBlast frontend, focusing on reducing TTFB, LCP, TBT, and improving Lighthouse scores.

## 1. Server Components (RSC) Decision Rules

### Convert to Server Components:
- **Dashboard Overview** (`/dashboard/page.tsx`) - Data-heavy, minimal interactivity
- **Analytics Overview** (`/analytics/page.tsx`) - Initial data fetch, charts are client
- **Templates List** (`/templates/page.tsx`) - Static list rendering
- **Campaign Details** (`/campaigns/[id]/page.tsx`) - Read-only preview
- **Settings Pages** - Form data fetching

### Keep as Client Components:
- **Editors** (Quill, TipTap) - Heavy interactivity, browser APIs
- **Drag & Drop Builder** - DnD Kit requires client-side
- **Charts** (Recharts) - Interactive visualizations
- **Forms with validation** - React Hook Form, real-time validation
- **Modals & Dialogs** - State management, animations

### Pattern:
```typescript
// Server Component (page.tsx)
async function Page() {
  const data = await fetchData()
  return (
    <div>
      <ServerDataDisplay data={data} />
      <Suspense fallback={<Skeleton />}>
        <ClientInteractiveComponent />
      </Suspense>
    </div>
  )
}
```

## 2. Streaming SSR Plan

### Suspense Boundary Locations:

1. **Analytics Page**
   - Primary: Overview cards (fast)
   - Secondary: Timeline chart (Suspense)
   - Tertiary: Top links table (Suspense)

2. **Dashboard Page**
   - Primary: Stats cards (fast)
   - Secondary: Charts (Suspense)

3. **Campaign Builder**
   - Primary: Form fields (fast)
   - Secondary: Editor (Suspense, dynamic import)

4. **Templates Page**
   - Primary: Template list (fast)
   - Secondary: Preview modals (Suspense)

### Implementation:
- Use `loading.tsx` per route group
- Stream critical content first
- Defer heavy components behind Suspense

## 3. Code Splitting Rules

### Heavy Libraries → Dynamic Imports:

| Library | Component | Strategy |
|---------|-----------|----------|
| React Quill | Email Editor | `dynamic(() => import(), { ssr: false })` |
| DnD Kit | Drag & Drop Builder | `dynamic(() => import(), { ssr: false })` |
| Recharts | Charts | `dynamic(() => import(), { ssr: false })` |
| React Flow | Automation Canvas | `dynamic(() => import(), { ssr: false })` |
| CodeMirror | HTML Editor | `dynamic(() => import(), { ssr: false })` |

### Bundle Size Targets:
- Initial JS: < 200KB (gzipped)
- Route chunks: < 100KB each
- Editor chunks: < 150KB (lazy-loaded)

## 4. Caching Strategy

### React Query StaleTime Mapping:

| Endpoint | staleTime | Backend TTL | Reason |
|----------|-----------|-------------|--------|
| `/analytics/overview` | 5m | 5m | Matches backend cache |
| `/analytics/timeline` | 2m | 2m | More frequent updates |
| `/analytics/top-links` | 10m | 10m | Rarely changes |
| `/campaigns` | 30s | N/A | User may create new |
| `/contacts` | 30s | N/A | User may import |
| `/templates` | 1m | N/A | User may create |

### Server Cache (Next.js):
- Static pages: `force-cache` (revalidate: 3600)
- Dynamic pages: `no-store` (fetch on demand)
- API routes: `revalidate: 60` (1 minute)

### CDN Headers:
```
Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400
ETag: enabled
Surrogate-Key: page-specific keys
```

## 5. Prefetching Heuristics

### Hover Prefetch:
- **Debounce**: 120ms delay
- **Targets**: Main navigation links, CTA buttons
- **Limit**: Max 3 concurrent prefetches

### Viewport Prefetch:
- Prefetch when element is 200px from viewport
- Use Intersection Observer
- Prefetch code-split chunks for likely-next routes

### Route Prefetch Priority:
1. **High**: Dashboard, Campaigns, Analytics (main nav)
2. **Medium**: Templates, Contacts (secondary nav)
3. **Low**: Settings, Admin (rarely accessed)

## 6. Measurement & Monitoring

### Web Vitals Tracked:
- **LCP** (Largest Contentful Paint) - Target: < 2.5s
- **FID/INP** (Interaction to Next Paint) - Target: < 100ms
- **CLS** (Cumulative Layout Shift) - Target: < 0.1
- **TTFB** (Time to First Byte) - Target: < 600ms

### Custom Metrics:
- Component mount time
- API response time
- Bundle load time
- Route transition time

### Monitoring Integration:
- Send to `/api/metrics` endpoint
- Optional: Prometheus, StatsD, Datadog
- Console logging for development

## 7. Asset Optimization

### Images:
- Use `next/image` for all images
- Lazy load below-the-fold
- WebP format with fallback
- Responsive sizes

### Fonts:
- Use `next/font` with `display: swap`
- Preload critical fonts
- Subset fonts (Latin only)

### CSS:
- Critical CSS inlined
- Tailwind purged for production
- Split CSS per route

## 8. Performance Budgets

### Lighthouse Targets:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Bundle Size Limits:
- Initial JS: < 200KB
- Total JS: < 500KB
- CSS: < 50KB
- Images: Optimized per route

## 9. CI/CD Integration

### Lighthouse CI:
- Run on every PR
- Block merge if budgets fail
- Generate reports
- Track trends

### Bundle Analysis:
- Track bundle size changes
- Alert on size increases > 10%
- Visualize chunk sizes

## Implementation Checklist

- [x] RSC migration for data-heavy pages
- [x] Streaming SSR with Suspense
- [x] Dynamic imports for heavy libs
- [x] Prefetching hooks
- [x] Caching strategy
- [x] Performance measurement
- [x] Asset optimization
- [x] CI/CD integration

