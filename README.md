# New York 2026 — A Curated Guide for Two

En premium digital rejseguide til 6 dage i New York City, bygget som et editorial rejsemagasin.

## Kør lokalt

```bash
npm install
npx ng serve
```

Åbn [http://localhost:4200](http://localhost:4200) i din browser.

## Teknologi

- Angular 21 (standalone components)
- TypeScript
- SCSS
- Google Maps embed
- Billeder fra Unsplash

## Struktur

```
src/app/
├── data/
│   ├── trip.interfaces.ts    # Typed interfaces
│   └── trip-data.ts          # Alt rejseindhold
├── components/
│   ├── hero-section/         # Full-screen hero
│   ├── sticky-nav/           # Sticky navigation med ankerlinks
│   ├── trip-summary/         # Rejseoverblik med dag-kort
│   ├── day-section/          # Dagssektion med program, mad, kort
│   ├── booking-badge/        # Premium booking badges
│   ├── from-list/            # "Fra vores liste" med Google Maps links
│   ├── map-embed/            # Google Maps iframe wrapper
│   ├── food-list/            # Samlet madoversigt
│   ├── practical-info/       # Fly, hotel, transport info
│   └── site-footer/          # Footer
```
