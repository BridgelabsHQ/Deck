import { app, Menu, Tray, nativeImage } from "electron";
import {
  getQuickAskShortcutState,
  onQuickAskShortcutChanged,
  toggleQuickAsk,
} from "./quick-ask.js";

/**
 * Menu bar / system tray presence (Granola-style resident app).
 *
 * The icon is the Deck catamaran glyph pre-rendered as a macOS "template" image
 * (pure black + alpha). Embedded as base64 so the
 * tray never depends on asset paths that differ between dev and
 * packaged layouts. Template rendering makes macOS tint it correctly
 * in light/dark menu bars and while highlighted.
 */
const TRAY_ICON_18 =
  "iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAAPoAAAD6AG1e1JrAAABnElEQVQ4jZXSTauNURjG8R/J+8vhOPY5nNd9znFskaEiSklRhpSZLyApdQZeytjIQFEiZoSUMmLElA+gDHwT3du19LRH9lNXa617rf/1XM+9Hv4+mzCDNQz+U4fDFPvPpI9jY5gMomKWm9k0jmI1bxlHq2F7ZbSUwkrUna+MQN169/x8M+p3NLqew0EsBOqPaDlnLAZuGmSz5rO4hps4nua2vaZ+zg1jLWZxFldwBntxG1/wEj9wIf1YSsKFsJV4aDCXsd52GReT5Ds+4xZ+xfRIwPlw80k6LB6KZrNxAh/wLeMNfMVP3MVkTBrTa9c/E9XGzqR5ET3EOt7jFZ7n03phKsiUFKY7hvV5d/ARj/EIT/AMn3A/P+KBToCh0VTM2vg2/XjXqU1m/hq/8aZTa/v2p7Ant/IU99LwS+nP1fTtetI9wLkOWzdsX0driVrQ+fwOCzgZ01NJUP/U6Q43IUkmomr0bmzHlmgXtmJzxjrf9oupNMXYlkIdaGrGrd6AUnfd5uVhI3bEtd4+jooptjyGz4ZELedxVEyx/gArAzr4Bv+XLwAAAABJRU5ErkJggg==";
const TRAY_ICON_36 =
  "iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAEGklEQVRYhcWXWWhcVRjHfxqtNs02yZ1pMpPpJGmmrS3iAloQLNQFcaMPrqCi1F3pg0hxe1DrRhX1QQQVxaWipSKWRrFqtYi0qBV98UFFcX1XBBGflHP5HTlObybRmMyB/7l3zvb9v/XcgYNbFzAINIAVwKr/GSs8e0hZbVu/G44G1gCr5wlrlNFUZmHLEhJRm6PmCfH8SC4rskxKZKGxOrVU8ONyJ1Z2CKvkkMfUgANN46cTaMohcKEmy2aHsRKoBkJjDkx2GE3LAeP6by6Y9MC5ntGIFpqYA5rAqIiW/i/nLI+EGlqpFXFRiomC+VBxzwPOBUrGQSQ1/i8Q1i/DbqwAdaDSgrqb45qw9xLgFeAx4FHJZc6na2fCuOfnXaMFdYvV5cAtwK3A1cAxzk0oNIx/CkwBm4H3gT+BrVoqKtuYBcZ0+0GExiwFJwJXAGcA64ELgeOcKwOXAV8BHwN7gE3A3cDvktoGjCRnzprQqJqkaCh4yLsmEDoVOMWN64CPgM+A/cA+4AbgSuAA8B7wK/CIXw7Rve0QZeZdvQCxYF4DXA9cC9wInANsl0wg8gHwIXAVcB3wh3Nv+LxAxWIoTIdlsTBWk7QtQsXsCZp2A3cAnwDvGjN7fG4ENgDfAT8C3wJ7gccVVptBTl0X512tDUbVrmw8BQJvArvF68Au4y1Y4y2zLrjuS117kUrVZ5AzjF21DWqSDoc9IYmdkphS+AsGecjIr4F3DOopA/9ZYOks5IQ1eTfSBjVjIGTZ88CTwDPA08BzwP3AncDFwAMGdLRgUOBVXXeSpaI6jZyq4ZETGm6DCtBrXboJuA24HbgXeNhUD8SeAh6yQIY6dBewxfp0vGdlCi+SMxIJVSRVhLLXwFrgdDU9YFYFzV8EXgZeSrBNN+533V7LxQnedZkEWmUNKy/vKgUIjI+0lvwG/AB8AXxv4JbMuh6xRHT7ofW2e0IM/eQZwYKLE2ukWBq/rYsIRevUFf6NCOn8i8Hbp9/7dWmMj7oEw7Xys0p8Lrl93lllZRQSylyQIsbNJHCf8XKpbjvLzV2uC1X7TG/+I7TQYhNhg+QftLierQLd7m2VGfbkXZYgkglXxW5TOmTXa8DNZsvJ3l27LAHbddFWya2zLoW9O8zKnbpss3tb5ZYtvnk3lCAzBsK1cazvA/6x26TF7vHgtc71+AWw0czaYkU/TQX7LK7nm6nrjcGhFoSx/MBSCwa10hLfBxXapTvC+KG+p+u7TISe5D0KDq5a5L443or8v1n/NJORSPo7S8azgvlU0yx5T+db96XzwZK5NqXENZ1CScvnZhzQUp3EgFw4RP/3dRi9csnb4clgJ9Anh3+0RcmCngVCr8hdVdQOM7AWilC3Mtu24MewKNSKUGfmA+HsIOPvmIntL8fp7GqEuVFMAAAAAElFTkSuQmCC";

interface TrayActions {
  openApp: () => void;
  toggleMeetingNotes: () => void;
}

let tray: Tray | null = null;
let actions: TrayActions | null = null;
let recording = false;

// Tray commands issued while the renderer wasn't ready to receive them
// (window closed or still loading). Drained by the renderer on mount via
// app:consumePendingTrayCommand — same pull pattern as pending deep links.
let pendingToggleMeetingNotes = false;

export function markPendingToggleMeetingNotes(): void {
  pendingToggleMeetingNotes = true;
}

export function consumePendingToggleMeetingNotes(): boolean {
  const value = pendingToggleMeetingNotes;
  pendingToggleMeetingNotes = false;
  return value;
}

function buildTrayIcon() {
  const icon = nativeImage.createEmpty();
  icon.addRepresentation({
    scaleFactor: 1,
    buffer: Buffer.from(TRAY_ICON_18, "base64"),
  });
  icon.addRepresentation({
    scaleFactor: 2,
    buffer: Buffer.from(TRAY_ICON_36, "base64"),
  });
  icon.setTemplateImage(true);
  return icon;
}

export function createAppTray(trayActions: TrayActions): void {
  if (tray) return;
  actions = trayActions;

  try {
    tray = new Tray(buildTrayIcon());
  } catch (error) {
    // Tray support can be missing (some Linux environments). The app just
    // behaves as before: no resident presence.
    console.error("[Tray] Failed to create tray:", error);
    return;
  }

  rebuildMenu();
  // The menu shows the quick-ask chord — follow rebinds live.
  onQuickAskShortcutChanged(() => rebuildMenu());

  // macOS opens the context menu on any click. On Windows/Linux a plain
  // left-click should open the app; the menu stays on right-click.
  if (process.platform !== "darwin") {
    tray.on("click", () => actions?.openApp());
  }
}

export function hasTray(): boolean {
  return tray !== null;
}

export function isRecordingActive(): boolean {
  return recording;
}

export function setTrayRecordingState(isRecording: boolean): void {
  if (recording === isRecording) return;
  recording = isRecording;
  rebuildMenu();
  if (isRecording) startWaveAnimation();
  else stopWaveAnimation();
}

// --- Recording indicator: animated mini-waveform beside the tray icon ---
// macOS renders tray titles to the right of the icon. Braille cells give
// 1-dot-wide bars (two bars per character, four height steps each) — a slim
// waveform, an unmissable "Rowboat is capturing this meeting" signal.

const WAVE_FRAME_MS = 300;
const WAVE_BAR_COUNT = 5;
// Dot bits for a bar of height 1–4 (index 0–3), built bottom-up. Two bars
// per braille cell (left column: dots 7,3,2,1 — right column: dots 8,6,5,4)
// keeps the columns tightly packed; the sine wave keeps every bar ≥1 dot so
// no column ever reads as missing.
const WAVE_LEFT_BITS = [0x40, 0x44, 0x46, 0x47];
const WAVE_RIGHT_BITS = [0x80, 0xa0, 0xb0, 0xb8];
// Radians per bar / per frame: together they make the crest travel smoothly
// leftward across the five bars.
const WAVE_SPATIAL_STEP = 1.1;
const WAVE_PHASE_STEP = 0.9;

let waveTimer: NodeJS.Timeout | null = null;
let wavePhase = 0;

function waveString(phase: number): string {
  const levels: number[] = [];
  for (let i = 0; i < WAVE_BAR_COUNT; i++) {
    const level = Math.round(1.5 + 1.5 * Math.sin(phase + i * WAVE_SPATIAL_STEP));
    levels.push(Math.min(3, Math.max(0, level)));
  }
  let out = "";
  for (let i = 0; i < levels.length; i += 2) {
    const left = WAVE_LEFT_BITS[levels[i]];
    const right = levels[i + 1] !== undefined ? WAVE_RIGHT_BITS[levels[i + 1]] : 0;
    out += String.fromCharCode(0x2800 + left + right);
  }
  return out;
}

function startWaveAnimation(): void {
  if (!tray || process.platform !== "darwin") return;
  stopWaveAnimation();
  waveTimer = setInterval(() => {
    if (!tray) return;
    wavePhase += WAVE_PHASE_STEP;
    tray.setTitle(` ${waveString(wavePhase)}`, { fontType: "monospaced" });
  }, WAVE_FRAME_MS);
}

function stopWaveAnimation(): void {
  if (waveTimer) {
    clearInterval(waveTimer);
    waveTimer = null;
  }
  if (tray && process.platform === "darwin") tray.setTitle("");
}

function rebuildMenu(): void {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    { label: "Open Rowboat", click: () => actions?.openApp() },
    // Permanent discoverability for the global quick-ask shortcut — the
    // accelerator renders next to the label (display only; the real binding
    // is the globalShortcut in quick-ask.ts). Hidden while the chord is
    // unregistered (another app owns it) — showing a dead chord would lie.
    {
      label: "Quick Ask",
      ...(getQuickAskShortcutState().registered
        ? { accelerator: getQuickAskShortcutState().accelerator }
        : {}),
      registerAccelerator: false,
      // The same summon the chord performs.
      click: () => toggleQuickAsk(),
    },
    recording
      ? {
          label: "Stop recording and generate notes",
          click: () => actions?.toggleMeetingNotes(),
        }
      : {
          label: "Start meeting notes",
          click: () => actions?.toggleMeetingNotes(),
        },
    { type: "separator" },
    { label: "Quit Deck", click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
  tray.setToolTip(recording ? "Deck — recording meeting" : "Deck");
}
