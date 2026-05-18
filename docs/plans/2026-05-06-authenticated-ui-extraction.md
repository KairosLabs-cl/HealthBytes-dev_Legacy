# Authenticated UI Extraction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Playwright extractor that captures the app while reusing the local Google Chrome session for authenticated Clerk state.

**Architecture:** Keep the existing unauthenticated `capture.mjs` unchanged. Add `capture-auth.mjs`, which uses a persistent Chromium context pointed at a Chrome profile copy/source, writes authenticated screenshots under an `authenticated/` subfolder, and writes separate authenticated metadata.

**Tech Stack:** Node ESM, Playwright Chromium, Expo web at `http://localhost:8081`.

---

### Task 1: Authenticated Capture Script

**Files:**
- Create: `capture-auth.mjs`

**Steps:**
1. Define the same routes, viewports, themes, base URL, and output root as `capture.mjs`.
2. Resolve Chrome profile settings from env vars:
   - `CHROME_USER_DATA_DIR`, default `/Users/benja/Library/Application Support/Google/Chrome`
   - `CHROME_PROFILE`, default `Default`
3. Launch Playwright with `chromium.launchPersistentContext(CHROME_USER_DATA_DIR, { channel: 'chrome' })`.
4. For each viewport/theme/route, set viewport and color scheme, navigate, wait for rendering, and screenshot to `healthbytes-ui-extraction/screenshots/{viewport}/{theme}/authenticated/{route}.png`.
5. Write metadata to `healthbytes-ui-extraction/metadata/screens-authenticated.json` and bugs to `script-bugs-authenticated.json`.
6. Print clear instructions if Chrome profile is locked or auth appears missing.

### Task 2: Verification

**Files:**
- Verify: `capture-auth.mjs`

**Steps:**
1. Run `node --check capture-auth.mjs`.
2. Do not run the full capture unless Chrome is closed and Expo web is running at `http://localhost:8081`.
3. Optionally run `node capture-auth.mjs --dry-run` to validate paths and profile existence without taking screenshots.
