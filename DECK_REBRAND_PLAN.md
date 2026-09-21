# Deck rebrand plan (Rowboat → Deck)

Stashed 2026-09-21. Status: Phase 1 partially started — only minimal cosmetic
surfaces done (window title, in-app logo, tray glyphs/tooltip, productName,
app.setName, Dock icon override, notification default). Everything below is
still Rowboat.

Scale: ~544 files hit `rowboat` (case-insensitive, excl. node_modules/dist/
lockfiles). Internal npm packages are already `@x/*` (neutral) — no workspace
renames needed there.

## Phase 0 — Decisions (needed before Phase 2+)

1. **Org identity**: what replaces `rowboatlabs`? (`BridgelabsHQ`? updater feed,
   publisher, iconUrl, homepage, maintainer, OAuth owner, test email domains.)
   Domains: `api.x.rowboatlabs.com`, `spaces.x.rowboatlabs.com`,
   `spaces.rowboatlabs.com` — keep or stand up Deck's?
2. **Scope**: desktop only, or also mobile (`app.json`, SecureStore keys, EAS)
   and Harbor?
3. **Compatibility**: clean break (fresh `~/.deck`) or migrate
   (copy `~/.rowboat` → `~/.deck`, dual-read old keys/links)? Recommend migrate.

## Phase 1 — Cosmetic UI strings (safe, no behavior change)

~70–80 files + tests in the same pass:

- **Renderer (~42 files)**: `about-dialog.tsx`, `welcome-step.tsx`,
  `product-tour.tsx`, `settings-dialog.tsx`, `permission-dialog.tsx`,
  `account-settings.tsx`, `providers-section.tsx`, `App.tsx` toasts, spaces
  components (`Your Rowboat is working…`, `Ask @rowboat…`), `model-selector.tsx`
  (`Rowboat default`), `quick-ask-bar.tsx`, email/todo/apps components.
- **Main**: `menu.ts` ("About Rowboat", "Rowboat on GitHub"), `tray.ts`
  ("Open Rowboat"), `text-insert.ts` accessibility copy, NS usage descriptions
  in `forge.config.cjs`.
- **Core-surfaced copy**: `oauth-flows.ts`, `tokens.ts`, gateway/billing errors,
  copilot system prompt (`instructions.ts`), OAuth consent `clientName`,
  `.pptx` creator metadata.
- **Mobile** (~8 files + `app.json` permission strings).
- **Harbor user-facing**: `CONTRACT.md`, `MENTIONS_PLAN.md`, landing HTML
  (`server/src/http.ts:227,230,542`), `welcomeReadme()` (`apex.ts:159`), seed
  org name (`main.ts:156`), mention-grammar text (`protocol/src/mentions.ts:139`).
- **Tests**: `about-dialog.test.tsx`, `model-selection-section.test.tsx`,
  `model-selector.test.tsx`, spaces `activity-view`/`server-switcher` tests,
  `compose-instructions.test.ts.snap`.
- ⚠️ Do NOT rename the `@rowboat` mention token here — it's wire protocol
  (`mentionsRowboat` field, `mentions_rowboat` DB column). Phase 3.

## Phase 2 — Build & packaging identity

- `forge.config.cjs`: `executableName: rowboat` → `deck`,
  `appBundleId: com.rowboat.app` → yours, maker names, `authors`/`maintainer`/
  `homepage`, Squirrel `iconUrl` (still rowboatlabs raw!), `publisher-github`
  owner/name → `BridgelabsHQ/Deck`, Linux `mimeType`.
- `apps/main/package.json`: `"name": "rowboat"` → `deck`.
- `apps/mobile/app.json`: name/slug/scheme/bundleIdentifier/owner/EAS projectId.
- Chrome extension manifest name; `.rowboat-app` extension + `rowboat-app.json`
  (back-compat readers needed).
- Tripwires: `detector.ts` `SELF_BUNDLE_PREFIXES`, `login_item.ts` Squirrel
  paths, `maker-pacman.cjs` — changing bundle/exe IDs strands auto-update +
  login items for existing installs.

## Phase 3 — Functional identifiers (breaking; ship migrations)

1. **Workdir** `~/.rowboat` → `~/.deck` (`core/src/config/config.ts:8`) +
   first-boot migrator (follow `models/repo.ts` v1→v2 / `migrations/` patterns).
   Fix hardcoded `engine-provisioner.ts:24` (`~/.rowboat/engines` ignores
   `ROWBOAT_WORKDIR`), `eas.json` absolute path, `dev-sandbox.mjs` seeds,
   `~/.rowboat-dev` prefix.
2. **`ROWBOAT_*` envs (~18)** → `DECK_*`, keep old names as fallback one release.
   (`ROWBOAT_SPACES` is dead — delete.)
3. **Deep links** `rowboat://` → `deck://` (`deeplink.ts:6`, forge protocols,
   `setAsDefaultProtocolClient`, Linux mime, iOS scheme, all producers/parsers).
   Dual-register in transition; re-register Google/Microsoft OAuth, Supabase DCR
   allowlist; ChatGPT port 1455 stays.
4. **localStorage/SecureStore keys** (`rowboat-theme`, `rowboat.*.v1`): dual-read
   old → write new → GC.
5. **npm scopes** `@rowboat/spaces-protocol`, `@rowboat/harbor` → `@deck/*`
   (harbor package.jsons, `link:` deps, ~20 imports, CI workflow).
6. **Protocol fields** `mentionsRowboat`/`mentions_rowboat`: real Harbor DB
   migration + versioning; or alias `@deck` to the same stamp (cheaper).

## Phase 4 — Services & externals (incremental, post-rename OK)

Updater feed (`updater.ts:8`, `RELEASES_URL` ×4 renderer files) → new repo;
`User-Agent: Rowboat*`; `x-rowboat-*` headers; gateway/API discovery URLs;
OAuth client IDs (GitHub `Ov23…`, Entra `d3f3…`, DCR names); PostHog.

## Phase 5 — Verify

`pnpm -r typecheck` + `test` (both workspaces), Harbor conformance, packaged
`make` install test, migration test (old `~/.rowboat` → new install).

Order: 1 → 2 → 4 (shippable, interop-compatible) → 3 (breaking) → 5 throughout.

## Already done (2026-09-21, dev only)

- `logo-only.png` → Deck/catamaran artwork; `<title>Deck</title>`.
- Tray glyphs → Deck compass, then catamaran; tooltip/quit → Deck.
- `productName: Deck`, `app.setName("Deck")`, notification default "Deck".
- Dev Dock override (`app.dock.setIcon`, `icons/icon.png`).
- `Electron.app` Info.plist display name → Deck (node_modules-local; backup at
  `.../T/opencode/Electron-Info-backup.plist`; re-apply after clean installs).
- `icons/{icon.icns,icon.ico,icon.png}` → catamaran set (Rowboat originals in
  `.../T/opencode/icon-backups/`).
