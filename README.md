# Rejseguide — Travel Guide

En premium digital rejseguide bygget som et editorial rejsemagasin. Understøtter flere rejser (New York, Barcelona, osv.).

## Kør lokalt

```bash
npm install
npx ng serve
```

Åbn [http://localhost:4200](http://localhost:4200) i din browser.

## Environment Variables (Netlify UI)

| Variable | Required | Description |
|---|---|---|
| `MAPBOX_TOKEN` | Yes | Mapbox GL public token for maps |
| `VAPID_PUBLIC_KEY` | Yes | VAPID key for push notifications |
| `PUSH_SECRET` | Yes | Admin secret for sending push notifications |
| `ACCESS_SECRET` | Yes | Used to HMAC-sign access cookies. Generate with `openssl rand -hex 32`. If unset, auth gate is disabled. |
| `INVITE_SECRET` | No | Admin secret for generating invitations. Falls back to `PUSH_SECRET` if unset. |

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
