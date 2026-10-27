# SEO Improvement Plan for Watchera

## Executive summary

The app already has a solid technical metadata base: global metadata, sitemap, robots rules, Open Graph, and a social image generator are present in [src/app/layout.tsx](src/app/layout.tsx), [src/app/sitemap.ts](src/app/sitemap.ts), [src/app/robots.ts](src/app/robots.ts), and [src/app/opengraph-image.tsx](src/app/opengraph-image.tsx).

However, the current implementation is still weak from a search visibility standpoint because the app is mostly a content catalog with no dedicated movie/show detail pages, no schema markup, and minimal canonicalized content depth. The strongest opportunity is to convert the app from a catalog homepage into a content-rich, indexable media catalog.

## Audit findings

### Strengths

- Global SEO metadata is configured in [src/app/layout.tsx](src/app/layout.tsx)
- Sitemap exists and includes homepage and a few static routes in [src/app/sitemap.ts](src/app/sitemap.ts)
- Robots rules are configured in [src/app/robots.ts](src/app/robots.ts)
- Social preview image exists in [src/app/opengraph-image.tsx](src/app/opengraph-image.tsx)
- Section pages already add metadata such as [src/app/search/page.tsx](src/app/search/page.tsx), [src/app/animation/layout.tsx](src/app/animation/layout.tsx), and [src/app/popular-series/layout.tsx](src/app/popular-series/layout.tsx)

### Gaps

1. No detail pages for individual movies or series
   - The content layer is dominated by list browsing and player flows.
   - The data layer already includes a movie-details fetch in [src/lib/plexhd.ts](src/lib/plexhd.ts), but there is no route using it for SEO-driven detail pages.

2. No page-level structured data
   - There is no JSON-LD for Movie, TVSeries, or VideoObject markup.
   - This means search engines do not get strong semantic context about titles, genres, ratings, release years, or video content.

3. Thin on-page content
   - The homepage is primarily a large catalog layout and not a content-rich editorial landing page.
   - Search engines favor pages that include descriptive text, specific headings, and relevant keywords in context.

4. Minimal crawl budget optimization
   - Sitemap coverage is narrow and only includes a few routes in [src/app/sitemap.ts](src/app/sitemap.ts)
   - Routes like category pages, genres, and movie detail pages should be dynamically included

5. Search page is intentionally noindexed
   - Search is blocked in [src/app/search/page.tsx](src/app/search/page.tsx), which is valid for a search results page but reduces discoverable indexable content around queries

6. Lack of canonicalized content hierarchy
   - There are several list pages, but no strong information architecture around genre pages, titles, and filters that support ranking and internal linking

## Recommended implementation roadmap

### Phase 1 — Highest-impact improvements (1–2 weeks)

#### 1. Create individual movie and series detail pages

Goal: turn catalog items into indexable pages with unique HTML titles, descriptions, headings, and canonical URLs.

Recommended implementation:
- Add dynamic routes such as:
  - /movie/[slug]/[id]
  - /series/[slug]/[id]
- Use the existing `fetchMovieDetails` logic in [src/lib/plexhd.ts](src/lib/plexhd.ts) to populate rich page data
- Generate metadata with `generateMetadata` and include:
  - unique title
  - unique description
  - canonical URL
  - Open Graph image
  - robots instructions for public pages

Example page structure:
- Title: "The Batman (2022) | Watchera"
- Description: "Watch The Batman online with streaming details, cast info, genre tags, and related titles on Watchera."
- Hero section with title, year, rating, genres, description
- Related content section
- Streaming/watch button area

#### 2. Add structured data

Goal: help search engines understand the media catalog as structured content.

Recommended additions:
- JSON-LD for Movie or TVSeries
- Include fields such as:
  - name
  - image
  - description
  - genre
  - datePublished
  - keywords
  - trailer or video metadata where available
  - aggregateRating if available

Suggested file:
- src/components/structured-data.tsx

#### 3. Expand the sitemap

Goal: increase discoverability and crawl coverage.

Recommended changes:
- Include all public categories and detail pages
- Use dynamic generation for movies and series pages
- Set realistic priorities and change frequencies
- Keep static routes like /search excluded unless intentionally indexed

#### 4. Improve page-level metadata consistency

Goal: avoid duplicate titles and weak descriptions.

Recommended additions:
- per-category metadata using `title` and `description` on all major routes
- unique canonical tags for every indexable page
- consistent `siteName` and `openGraph` usage across all pages

---

### Phase 2 — Content architecture improvements (2–4 weeks)

#### 5. Add genre and collection landing pages

Create dedicated pages for:
- Action
- Drama
- Anime
- Horror
- Comedy
- Romance
- Nollywood
- K-Drama
- Arabic / international titles

These pages should include:
- descriptive intro copy
- category-specific headings
- top picks
- filtered content blocks
- internal links to related genres and titles

#### 6. Add rich editorial text to homepage sections

The homepage should have a brief introduction explaining:
- what Watchera is
- what kinds of content it offers
- the main viewing categories
- location/region or language targeting if relevant

This improves context for search engines without affecting UX.

#### 7. Improve internal linking and crawl paths

Recommended internal link patterns:
- title to related titles
- category pages to top content
- homepage to collections
- series pages to season or episode navigation

This creates a stronger information graph for crawlers.

---

### Phase 3 — Technical SEO hardening (ongoing)

#### 8. Add page speed and Core Web Vitals work

Recommended checks:
- compress poster/banner images
- use `next/image` consistently
- lazy-load below-the-fold media rows
- reduce large client-side render overhead on the homepage
- preload the key hero image and main viewport content

#### 9. Add hreflang and locale strategy if multi-language content is planned

If the audience includes region-specific or language-specific catalogs, add locale-aware routing and alternate language links.

#### 10. Add analytics and search-console monitoring

Track:
- page impressions
- click-through rate
- top landing pages
- index coverage issues
- crawl errors for generated detail pages

---

## File-specific recommendations

### High-priority files to update

- [src/app/layout.tsx](src/app/layout.tsx)
  - continue global metadata improvements
  - ensure every page uses consistent canonical and OG data

- [src/app/page.tsx](src/app/page.tsx)
  - add page-level intro text and stronger keyword context

- [src/app/sitemap.ts](src/app/sitemap.ts)
  - add dynamic detail pages and category pages

- [src/lib/plexhd.ts](src/lib/plexhd.ts)
  - use fetched movie details for SEO pages and richer data

- [src/app/search/page.tsx](src/app/search/page.tsx)
  - consider whether search should be excluded, or whether some search result pages should remain accessible

### New files to add

- src/app/movie/[slug]/[id]/page.tsx
- src/app/series/[slug]/[id]/page.tsx
- src/app/genre/[slug]/page.tsx
- src/components/structured-data.tsx
- src/lib/seo.ts

---

## Suggested implementation order

1. Add unique movie/series detail routes
2. Add JSON-LD schema for each detail page
3. Improve homepage content and metadata
4. Expand sitemap generation
5. Add genre landing pages and stronger internal linking
6. Monitor Google Search Console and search performance

## Expected outcome

After these changes, the app should shift from a purely app-like interface to a discoverable media catalog with:
- indexable pages for each title
- stronger semantic metadata
- improved crawl coverage
- better social preview quality
- more visibility in search engines and media discovery surfaces

## Overall assessment

Current score: 5/10 for SEO readiness

Reason:
- Good technical metadata foundation
- Weak content architecture
- Missing detail pages and structured data
- Needs content-focused SEO strategy to become search-friendly

This is a realistic and valuable optimization path for the codebase without needing a full rebuild.
