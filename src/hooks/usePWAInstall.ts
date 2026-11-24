import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/** Broad OS / form-factor grouping */
export type InstallPlatform = 'ios' | 'android' | 'windows' | 'macos' | 'linux';

/** Browser identity */
export type InstallBrowser =
  | 'chrome'
  | 'edge'
  | 'safari'
  | 'firefox'
  | 'opera'
  | 'samsung'
  | 'other';

/**
 * Why the native prompt is unavailable on a desktop/Android browser that
 * normally supports it. Used to show targeted help instead of a generic hint.
 */
export type InstallBlockReason =
  | 'http'          // Not a secure context (LAN IP over HTTP)
  | 'already'       // Already installed / running standalone
  | 'dismissed'     // User previously dismissed the prompt
  | 'unsupported'   // Browser fundamentally doesn't support beforeinstallprompt
  | 'waiting'       // Browser hasn't fired the event yet (too early / criteria not met)
  | null;           // Native prompt IS available (no block)

// ─── Secure-context detection ─────────────────────────────────────────────────

function isSecureContext(): boolean {
  // window.isSecureContext is the canonical API
  if (typeof window.isSecureContext === 'boolean') return window.isSecureContext;
  const { protocol, hostname } = window.location;
  return (
    protocol === 'https:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost')
  );
}

// ─── Platform detection ───────────────────────────────────────────────────────

export function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  const uaLow = ua.toLowerCase();

  // iOS: iPhone / iPad / iPod, or iPadOS 13+ (reports MacIntel with touch)
  const isIOS =
    (/iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
  if (isIOS) return 'ios';

  if (/android/i.test(ua)) return 'android';

  if (/win/i.test(navigator.platform) || /windows/i.test(uaLow)) return 'windows';

  // macOS — must come after iOS check (both can say "Mac")
  if (/mac/i.test(navigator.platform) || /macintosh/i.test(uaLow)) return 'macos';

  if (/linux/i.test(navigator.platform) || /linux/i.test(uaLow)) return 'linux';

  return 'windows'; // safe fallback for unknown desktop
}

// ─── Browser detection ────────────────────────────────────────────────────────

export function detectBrowser(): InstallBrowser {
  const ua = navigator.userAgent;

  // Order matters: more specific patterns must come before generic ones.

  // Samsung Internet (must precede Chrome check — it also has "Chrome" in its UA)
  if (/samsungbrowser/i.test(ua)) return 'samsung';

  // Opera (modern Opera has "OPR/"; older has "Opera")
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'opera';

  // Edge (Chromium-based; always has "Edg/" or "EdgA/" or "EdgiOS/")
  if (/edg(e|\/|a\/|ios\/)/i.test(ua)) return 'edge';

  // Firefox (also covers Firefox for iOS: "FxiOS")
  if (/firefox|fxios/i.test(ua)) return 'firefox';

  // Chrome / Chromium (must come after Edge, Opera, Samsung)
  // Also covers Chrome for iOS ("CriOS")
  if (/chrome|crios|chromium/i.test(ua)) return 'chrome';

  // Safari — only if no other Chromium fingerprint matched
  if (/safari/i.test(ua)) return 'safari';

  return 'other';
}

// ─── Eagerly capture beforeinstallprompt at module load time ──────────────────
// Chrome fires this very early — often before React has mounted any component.
let _deferredPrompt: BeforeInstallPromptEvent | null = null;
let _promptWasFired = false;          // tracks whether the event ever fired
let _promptWasDismissed = false;      // tracks whether user dismissed
const _promptListeners = new Set<(e: BeforeInstallPromptEvent | null) => void>();

function notifyListeners(e: BeforeInstallPromptEvent | null) {
  _deferredPrompt = e;
  _promptListeners.forEach((fn) => fn(e));
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _promptWasFired = true;
  notifyListeners(e as BeforeInstallPromptEvent);
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    _deferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // These are stable (computed once at mount from navigator); no need to re-detect.
  const platform = detectPlatform();
  const browser = detectBrowser();

  useEffect(() => {
    // ── Standalone / already-installed detection ──────────────────────────────
    const mq = window.matchMedia('(display-mode: standalone)');
    const isStandalone =
      mq.matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.startsWith('android-app://');

    if (isStandalone) setIsInstalled(true);

    // Listen for future display-mode changes (e.g. user installs while page is open)
    const onDisplayModeChange = (ev: MediaQueryListEvent) => {
      if (ev.matches) setIsInstalled(true);
    };
    mq.addEventListener('change', onDisplayModeChange);

    // ── Keep in sync with future prompt events ────────────────────────────────
    const onPrompt = (e: BeforeInstallPromptEvent | null) => setDeferredPrompt(e);
    _promptListeners.add(onPrompt);

    // ── Track app installation ────────────────────────────────────────────────
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallModalOpen(false);
      notifyListeners(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mq.removeEventListener('change', onDisplayModeChange);
      _promptListeners.delete(onPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // ── Determine why native prompt is unavailable ────────────────────────────
  const computeBlockReason = useCallback((): InstallBlockReason => {
    if (deferredPrompt) return null; // prompt IS available

    if (isInstalled) return 'already';

    // Only desktop/Android browsers support beforeinstallprompt
    if (platform === 'ios') return 'unsupported'; // iOS never fires it

    // HTTP LAN IP — most common dev-environment cause
    if (!isSecureContext()) return 'http';

    // Browser doesn't implement the API at all (Firefox desktop, etc.)
    if (!('BeforeInstallPromptEvent' in window) && !_promptWasFired) {
      return 'unsupported';
    }

    if (_promptWasDismissed) return 'dismissed';

    // Event hasn't fired yet (browser criteria not fully met, or will fire later)
    return 'waiting';
  }, [deferredPrompt, isInstalled, platform]);

  // ── Whether to show the Install button ───────────────────────────────────
  // Show when: not already installed AND (native prompt ready OR manual guide makes sense)
  const showInstallButton = !isInstalled && (
    !!deferredPrompt ||
    platform === 'ios' ||
    platform === 'android' ||
    platform === 'macos' // macOS Safari has a manual path
  );

  // ── Main install action ───────────────────────────────────────────────────
  const triggerInstall = useCallback(async () => {
    if (isInstalled) return;

    if (deferredPrompt) {
      // Native prompt available — fire it directly, never open the modal
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        } else {
          _promptWasDismissed = true;
        }
        notifyListeners(null);
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
      return;
    }

    // No native prompt — open the modal with contextual instructions
    setIsInstallModalOpen(true);
  }, [deferredPrompt, isInstalled]);

  return {
    isInstalled,
    platform,
    browser,
    canInstall: !!deferredPrompt,
    blockReason: computeBlockReason(),
    showInstallButton,
    isInstallModalOpen,
    setIsInstallModalOpen,
    triggerInstall,
  };
}
