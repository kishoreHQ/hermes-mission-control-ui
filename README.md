# Hermes Mission Control UI

**IDE for agent systems** — a Host Interface client for the AESP / Hermes Agent OS.

This UI sits **above** the kernel (INV-11). It never talks to provider SDKs or databases directly.

```
Mission Control UI  →  Host Interface (/api/v1/…)  →  Agent OS kernel (aespd)
```

## Quick start (P2 local, mocks)

```bash
cd hermes-mission-control-ui
npm install
npm run dev
# open http://localhost:5173
```

Mocks implement the full §6 API contract via MSW (default on localhost).

### Live against Agent OS

```bash
# terminal 1 — Agent OS with Host API
cd ../AESP-Reference-Implementation
make build && ./bin/aespd serve :8080

# terminal 2 — UI (proxy /api → :8080). Force live:
cd ../hermes-mission-control-ui
VITE_USE_MOCKS=0 npm run dev
```

## Profiles

| Profile | How |
|---------|-----|
| P2 Local-first | `npm run dev` on localhost (mocks by default) |
| P1 Platform | static `dist/` behind Mission Control / any static host |
| P3 Embedded | `mountHermesUI(el, { baseUrl, token })` from `src/embed.ts` |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production bundle → `dist/` |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript |

## Design

Flight-operations console. Signature **Mission Spine** rail. Tokens in `src/shared/tokens.css` (no raw hex in components).

## Spec

See UI specification companion doc (UI-ARCH … UI-GATE-5). Gate artifacts under `docs/gates/`.
