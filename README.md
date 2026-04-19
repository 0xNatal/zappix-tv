# Zappix

IPTV app for LG webOS TVs with a companion web app for pairing and channel management.

## Structure

- **apps/tv** — WebOS TV app (Enact/React)
- **apps/web** — Web app for pairing & channel management (Vite/React)
- **packages/shared** — Shared models, services, and utilities

## Setup

```bash
npm ci
cp .env.example apps/web/.env    # add Firebase values with VITE_ prefix
cp .env.example apps/tv/.env     # add Firebase values with REACT_APP_ prefix
```

## TV Error States

| Screen | Trigger | Display |
|---|---|---|
| Verbindungsfehler | Firebase connection fails on startup | Icon badge "!" with message |
| Sender konnten nicht geladen werden | Xtream API unreachable or credentials invalid | Icon badge "!" with API error detail |
| Keine Sender | Channel list is empty (no channels added via web app) | Icon badge "0" with hint |
| Stream nicht verfügbar | Video element fires `error` event (invalid URL, server down) | Centered badge with pulsing red dot |

## Development

```bash
npm run web       # start web app dev server
npm run tv        # start TV app dev server
npm run build:tv  # build TV app (.ipk)
```
