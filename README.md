# Horse Racing

An interactive horse racing game built with **Vue 3**, **TypeScript** and **Pinia**.

Twenty horses, a six-round program, ten runners per round and a live commentator.

![Game screen in the middle of the first round](e2e/visual/__snapshots__/visual-desktop/mid-race.png)

## Getting started

Requirements: Node.js 24 (see `.nvmrc`; 22.18+ also works) and npm.

```bash
npm ci
npm run dev
```

Open http://localhost:5173. Add `?seed=42` (any unsigned 32-bit integer) to replay exactly the same horses, programs and races.

### Scripts

| Script                       | What it does                                                         |
| ---------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                | Vite dev server with hot reload                                      |
| `npm run build`              | Type-check and build for production into `dist/`                     |
| `npm run preview`            | Serve the production build on port 4173                              |
| `npm run type-check`         | `vue-tsc` over app, tests and configs, plus `tsc` over the E2E suite |
| `npm run lint`               | oxlint, then ESLint, with zero warnings allowed                      |
| `npm run lint:fix`           | Same, applying automatic fixes                                       |
| `npm run format`             | Prettier                                                             |
| `npm run test:unit`          | Vitest in watch mode                                                 |
| `npm run test:coverage`      | Vitest once, with coverage thresholds enforced                       |
| `npm run test:e2e`           | Playwright end-to-end tests against the production build             |
| `npm run test:visual:docker` | Visual regression tests inside the official Playwright Linux image   |

A pre-commit hook (husky + lint-staged) lints and formats the staged files.

## How it plays

1. The stable of 20 horses is generated on load. Each horse has a unique name, a unique colour and a condition score from 1 to 100.
2. **Generate Program** draws six rounds: 1200, 1400, 1600, 1800, 2000 and 2200 m. Each round has 10 horses picked at random from the 20.
3. **Start** runs the rounds one at a time. The horses gallop down their lanes, and each round's result appears under **Results** as soon as the last horse crosses the line.
4. **Pause** / **Resume** freezes and continues the race. The speed switch plays it at 1×, 2× or 4×.
5. The commentator calls the start, the early leader, lead changes, the final stretch, photo finishes and the winner.
6. **New horses** brings in a fresh stable when you want a different field.

Progress is saved locally, so reloading the page puts you back where you were, paused.

## Architecture

The code is organised by feature rather than by file type. Each feature owns its model, its store and its UI, and exposes a small public API through its `index.ts`:

```
src/
  app/            Application shell: header, global styles and design tokens
  shared/         Feature-agnostic building blocks
    lib/          Seeded random numbers, seed handling, formatting, logging, DOM helpers
    composables/  useAnimationLoop, useEventListener
    persistence/  Validated localStorage access and type guards
    ui/           BaseButton, BasePanel and a generic, typed DataTable
  features/
    horses/       The stable: generation, store, horse list
    race/         Schedule, race simulation, state machine, track, program and results
    commentary/   Event detection, wording, live feed
    game/         Session orchestration: seeds, save/restore, the game loop, controls
  App.vue         Composition root that lays the features out
```

**Dependency direction.** `horses` ← `race` ← `commentary` ← `game`. Each arrow points from a feature to the one that uses it, and nothing points back. ESLint enforces the public API: one feature may not reach into another's internals (`@/features/race/store/...`); it has to go through `@/features/race`.

**Model / store / UI.**

- `model/` is plain TypeScript with no Vue and no timers: types, constants and pure functions such as `createSchedule`, `planRace`, `progressAt` and `detectEvents`. Most of the logic lives here, and it is the easiest part to test.
- `store/` holds Pinia setup stores that keep state and expose intent-revealing actions.
- `ui/` holds components:
  - Presentational ones (`RaceLane`, `RoundTable`, `DataTable`, ...) take props.
  - A few containers (`RaceTrack`, `ProgramPanel`, `HorseList`, ...) read their own feature's store.
  - Anything that crosses features is passed in by `App.vue`.

### State management

| Store        | Responsibility                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `horses`     | The 20 horses. Immutable once generated, so held in a `shallowRef` and replaced wholesale.          |
| `race`       | The program, race plans, results and the race state machine.                                        |
| `commentary` | The commentary feed, capped at 50 lines.                                                            |
| `game`       | Orchestrates one session: owns the seeds, generates programs, advances time, builds save snapshots. |

The race store is an explicit state machine:

```
idle ──generate──▶ ready ──start──▶ running ⇄ paused
                                      │
                                      └─ six rounds done ─▶ finished ──generate──▶ ready
```

Invalid transitions are no-ops, so a double click can never start two loops or skip a round.

`tick(deltaMs)` is the only way time moves forward:

- `useAnimationLoop` calls it once per `requestAnimationFrame`.
- The frame delta is clamped to 100 ms, so returning to a background tab does not teleport the horses to the finish.
- Tests call `tick` directly with whatever time they need.

### Race simulation

When a program is generated, every round is planned up front:

- Each horse gets a cruising speed of `15 + 3 × condition / 100` m/s.
- A form-on-the-day factor adds ±3%.
- The distance is split into 200 m segments, each with ±8% variation.

This yields realistic times, about 70 s for 1200 m, and lead changes during a race. A 20-point condition gap is worth roughly 3.5% of speed, so better horses usually win but upsets happen. The unit tests check both properties statistically.

Because the whole race is known in advance, a horse's position is a pure function of the race clock (`progressAt(run, distance, elapsedMs)`). Pausing, resuming, changing speed and restoring a saved session all reduce to setting a number.

Every random decision goes through a seeded generator (mulberry32):

- The horses come from the session seed.
- The n-th program comes from `deriveSeed(seed, n)`.

That makes any session reproducible from `?seed=`, which the E2E and visual tests rely on.

### Commentary

`detectEvents(previous, next, plans, memory)` compares two consecutive moments of the race and returns typed events: round start, early lead, lead change, final stretch, photo finish, winner and program complete.

- Lead calls are throttled, so the feed stays readable.
- Wording lives in `formatEvent`, which keeps the events free of copy and ready for translation.
- The feed is an `aria-live="polite"` region, so screen reader users hear the race too.

### Persistence

A saved session is just `{ version, seed, programCount, race progress }`. Horses, rounds and race plans are rebuilt from the seeds on load.

- The payload is a few hundred bytes and holds nothing worth tampering with.
- Stored data is treated as untrusted. It is size-limited, JSON-parsed in a `try`, and checked by type guards and then against the regenerated program.
- Anything that does not fit is discarded.
- Running races come back paused.
- `SNAPSHOT_VERSION` must be bumped whenever generation or the race model changes.

## Testing

| Layer             | Tooling                       | Scope                                                                                                         |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Unit & component  | Vitest, Vue Test Utils        | Models, stores, composables, components (236 tests; coverage ≈ 99% statements, enforced thresholds per layer) |
| End-to-end        | Playwright (Chromium)         | Full game flows, pause/resume, reload & restore, keyboard-only play, CSP and third-party request checks       |
| Visual regression | Playwright `toHaveScreenshot` | Initial, program, mid-race and finished screens at desktop and mobile sizes                                   |

**E2E and visual tests.**

- They run against the production build (`vite preview`), so the Content Security Policy is enforced while they run.
- They use a fixed seed and Playwright's fake clock. Nothing moves until a test advances time, so every race and screenshot is identical between runs.

**Visual baselines.**

- They are rendered on Linux in `mcr.microsoft.com/playwright:v1.64.1-noble`, the same image CI uses, so they don't depend on the OS of whoever runs them.
- Run them with `npm run test:visual:docker`.
- After an intended UI change, refresh them with `npm run test:visual:docker -- --update-snapshots`.

CI (`.github/workflows/ci.yml`) runs lint, format check, type check, unit tests with coverage, build and a production dependency audit, then the E2E and visual suites.

## Security

- **No HTML injection surface.** There is no `v-html` (an ESLint error), no `eval`, and no dynamic `<script>`. Everything is rendered through Vue's escaped interpolation.
- **Strict CSP.** Production builds carry a CSP `<meta>` tag allowing only `'self'`, with no `unsafe-inline` and no `unsafe-eval`. Dynamic styles go through CSSOM (`:style` bindings), which the policy allows. The dev server is exempt because Vite injects inline styles for hot reload.
- **Validated input.** `?seed=` accepts only digits within the uint32 range; anything else is ignored. Saved sessions are validated as described above.
- **No third-party requests.** The app makes none: system font stack, inline SVG, no CDNs. An E2E test asserts this.
- **Production image.** The `Dockerfile` builds the app and serves it from `nginx-unprivileged` as a non-root user. `deploy/nginx` adds the security headers:
  - CSP including `frame-ancestors 'none'`
  - `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP and CORP
  - Immutable caching for hashed assets and `no-cache` for `index.html`

  HSTS belongs on whatever terminates TLS in front of it.

- **Dependencies.** Runtime dependencies are limited to `vue` and `pinia`, and `npm audit --omit=dev` is part of CI.

```bash
docker build -t horse-racing-game .
docker run --rm -p 8080:8080 horse-racing-game
```

## Accessibility

- The page uses semantic landmarks and a single `h1`. Tables have captions, column headers and row headers.
- Colours are always paired with their names, so no information relies on colour alone.
- Everything is reachable by keyboard: native buttons, plus a radio group for speed.
- Focus is clearly visible.
- `prefers-reduced-motion` turns off the gallop and scrolling animations.

## Assumptions

- The brief says the horse list "should contain between 1 to 20 horses" and also that "the game should have a total of 20 horses". I read the first as the numbering shown in the example ("Horse List (1–20)"), so the game always generates 20. The count is a single constant (`HORSE_COUNT`), and `createHorses` accepts any count up to the size of the name and colour pools.
- In the program, the position column is the starting lane. In the results, it is the finishing position, followed by the race time.
- A short break (1.5 s at 1×) separates rounds so each result can be read before the next start.
