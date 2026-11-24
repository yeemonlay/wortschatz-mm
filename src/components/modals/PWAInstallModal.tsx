import React from 'react';
import {
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  ArrowDownToLine,
  Smartphone,
  Info,
  AlertTriangle,
  MoreHorizontal,
  BookMarked,
  Globe,
} from 'lucide-react';
import type { InstallPlatform, InstallBrowser, InstallBlockReason } from '@/hooks/usePWAInstall';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: InstallPlatform;
  browser: InstallBrowser;
  canInstall: boolean;
  isInstalled: boolean;
  blockReason: InstallBlockReason;
  onDirectInstall: () => void;
}

// ─── Step list helper ─────────────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ className?: string }>;

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const StepList: React.FC<{ label: string; steps: Step[] }> = ({ label, steps }) => (
  <div className="space-y-2.5">
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    {steps.map(({ icon: Icon, title, desc }) => (
      <div key={title} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
    ))}
  </div>
);

const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
    <div className="text-xs text-slate-700 leading-relaxed">{children}</div>
  </div>
);

const WarnBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
    <div className="text-xs text-slate-700 leading-relaxed">{children}</div>
  </div>
);

// ─── Platform × Browser bodies ────────────────────────────────────────────────

const IosSafariBody: React.FC = () => (
  <StepList
    label="Safari on iPhone / iPad"
    steps={[
      { icon: Share, title: 'Tap the Share button', desc: "In Safari's bottom toolbar (or top-right on iPad)." },
      { icon: PlusSquare, title: "Tap 'Add to Home Screen'", desc: 'Scroll down in the share sheet and tap the option.' },
      { icon: CheckCircle2, title: "Tap 'Add'", desc: 'The app icon appears on your Home Screen.' },
    ]}
  />
);

const IosChromeBody: React.FC = () => (
  <StepList
    label="Chrome on iPhone / iPad"
    steps={[
      { icon: MoreHorizontal, title: 'Tap the menu (…)', desc: 'Tap the three-dot menu at the bottom of the screen.' },
      { icon: PlusSquare, title: "Tap 'Add to Home Screen'", desc: "Select 'Add to Home Screen' from the menu." },
      { icon: CheckCircle2, title: "Tap 'Add'", desc: 'The app icon appears on your Home Screen.' },
    ]}
  />
);

const IosEdgeBody: React.FC = () => (
  <StepList
    label="Edge on iPhone / iPad"
    steps={[
      { icon: MoreHorizontal, title: 'Tap the menu (…)', desc: 'Tap the three-dot menu at the bottom of the screen.' },
      { icon: Share, title: "Tap 'Share'", desc: "Select 'Share' from the Edge menu." },
      { icon: PlusSquare, title: "Tap 'Add to Home Screen'", desc: "Scroll the share sheet and tap 'Add to Home Screen'." },
      { icon: CheckCircle2, title: "Tap 'Add'", desc: 'The app icon appears on your Home Screen.' },
    ]}
  />
);

const IosFirefoxBody: React.FC = () => (
  <div className="space-y-2.5">
    <StepList
      label="Firefox on iPhone / iPad"
      steps={[
        { icon: Share, title: 'Tap the Share button', desc: "Tap the Share icon in the address bar or toolbar." },
        { icon: PlusSquare, title: "Tap 'Add to Home Screen'", desc: "Select 'Add to Home Screen' from the iOS share sheet." },
        { icon: CheckCircle2, title: "Tap 'Add'", desc: 'The app shortcut appears on your Home Screen.' },
      ]}
    />
    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
      Note: Firefox for iOS opens the native iOS share sheet — look for <strong>Add to Home Screen</strong> there.
    </p>
  </div>
);

const IosOtherBody: React.FC<{ browser: InstallBrowser }> = ({ browser }) => (
  <div className="space-y-2.5">
    <InfoBox>
      <strong>{browser === 'other' ? 'Your browser' : browser.charAt(0).toUpperCase() + browser.slice(1)}</strong>{' '}
      on iOS may not support direct installation. For the best experience, open this page in <strong>Safari</strong> and use the Share → Add to Home Screen flow.
    </InfoBox>
    <IosSafariBody />
  </div>
);

const MacosSafariBody: React.FC = () => (
  <StepList
    label="Safari on macOS (Sonoma or later)"
    steps={[
      { icon: Globe, title: 'Open the page in Safari', desc: 'Make sure you are using Safari 17+ on macOS Sonoma or later.' },
      { icon: Share, title: "Click File → 'Add to Dock…'", desc: "In the menu bar choose File, then 'Add to Dock…'." },
      { icon: CheckCircle2, title: "Click 'Add'", desc: 'The app opens in its own window and appears in your Dock.' },
    ]}
  />
);

const AndroidManualBody: React.FC<{ browser: InstallBrowser }> = ({ browser }) => {
  const menuLabel =
    browser === 'firefox'
      ? 'three-dot menu (⋮) or the Firefox menu'
      : browser === 'samsung'
        ? 'three-line menu (≡) in the bottom bar'
        : browser === 'opera'
          ? 'Opera menu icon'
          : 'three-dot menu (⋮)';

  return (
    <div className="space-y-2.5">
      <StepList
        label={`${browser === 'other' ? 'Android browser' : browser.charAt(0).toUpperCase() + browser.slice(1)} on Android`}
        steps={[
          { icon: Smartphone, title: `Open the ${menuLabel}`, desc: 'Tap it in the top-right (or bottom bar on some browsers).' },
          { icon: BookMarked, title: "Select 'Add to Home screen'", desc: "Look for 'Install app', 'Add to Home screen', or similar." },
          { icon: CheckCircle2, title: 'Confirm installation', desc: 'Follow any on-screen prompts to complete installation.' },
        ]}
      />
      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        If the option is missing, reload the page — the browser will offer it when ready.
      </p>
    </div>
  );
};

// ─── Desktop block-reason bodies ──────────────────────────────────────────────

const DesktopHttpBody: React.FC = () => (
  <div className="space-y-3">
    <WarnBox>
      <strong>PWA installation is blocked on HTTP.</strong> Chrome and Edge only allow installation on <strong>HTTPS</strong> or <strong>localhost</strong>.
    </WarnBox>
    <InfoBox>
      <strong>Your dev URL</strong> (<code className="font-mono text-indigo-700">http://192.168.0.116:3000</code>) uses a plain HTTP LAN address, which is not a secure context.
      <ul className="mt-2 space-y-1 list-disc list-inside">
        <li>Open <code className="font-mono text-indigo-700">http://localhost:3000</code> on this machine — Chrome treats <em>localhost</em> as secure.</li>
        <li>Or configure HTTPS in Vite: add <code className="font-mono text-indigo-700">server: {'{ https: true }'}</code> and use a self-signed cert.</li>
        <li>Or use <code className="font-mono text-indigo-700">vite --host --https</code> with a tool like <em>mkcert</em> for LAN testing.</li>
      </ul>
    </InfoBox>
  </div>
);

const DesktopUnsupportedBody: React.FC<{ browser: InstallBrowser; platform: InstallPlatform }> = ({
  browser,
  platform,
}) => {
  if (browser === 'firefox') {
    return (
      <InfoBox>
        <strong>Firefox does not support PWA installation</strong> from the browser prompt. To install this app, open it in <strong>Chrome</strong> or <strong>Edge</strong>.
      </InfoBox>
    );
  }
  if (browser === 'safari' && platform === 'macos') {
    return <MacosSafariBody />;
  }
  return (
    <InfoBox>
      <strong>Your browser ({browser})</strong> doesn't support the PWA install prompt. Try opening this page in <strong>Chrome</strong> or <strong>Edge</strong> for a one-click install.
    </InfoBox>
  );
};

const DesktopWaitingBody: React.FC<{ browser: InstallBrowser }> = ({ browser }) => (
  <div className="space-y-3">
    <InfoBox>
      {browser === 'chrome' || browser === 'edge' ? (
        <>
          <strong>The install button will appear shortly.</strong> {browser === 'chrome' ? 'Chrome' : 'Edge'} shows an{' '}
          <ArrowDownToLine className="w-3 h-3 inline text-indigo-600" /> install icon in the address bar once all PWA criteria are met. If you don't see it, try reloading the page.
        </>
      ) : (
        <>
          <strong>Installation is not available right now.</strong> Try reloading the page. If that doesn't help, open this page in <strong>Chrome</strong> or <strong>Edge</strong>.
        </>
      )}
    </InfoBox>
    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
      You can also click the install icon{' '}
      <ArrowDownToLine className="w-3 h-3 inline text-indigo-500" /> in the browser's address bar directly.
    </p>
  </div>
);

const DesktopDismissedBody: React.FC = () => (
  <InfoBox>
    <strong>You previously dismissed the install prompt.</strong> The install icon{' '}
    <ArrowDownToLine className="w-3 h-3 inline text-indigo-600" /> in the browser's address bar is still available — click it to install the app.
  </InfoBox>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  platform,
  browser,
  canInstall,
  isInstalled,
  blockReason,
  onDirectInstall,
}) => {
  if (!isOpen) return null;

  const renderBody = () => {
    // Already installed — this branch should rarely be reached (button is hidden),
    // but guard it defensively.
    if (isInstalled) {
      return (
        <InfoBox>
          <strong>App is already installed.</strong> Look for the Wortschatz icon on your Home Screen or desktop.
        </InfoBox>
      );
    }

    // Native prompt is available — the button in the modal fires it directly
    if (canInstall) {
      return (
        <div className="text-center space-y-3 py-1">
          <p className="text-sm text-slate-600">Your browser is ready to install this app.</p>
          <button
            onClick={() => { onDirectInstall(); onClose(); }}
            className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Install Now
          </button>
        </div>
      );
    }

    // ── iOS — per-browser manual instructions ─────────────────────────────────
    if (platform === 'ios') {
      switch (browser) {
        case 'safari': return <IosSafariBody />;
        case 'chrome': return <IosChromeBody />;
        case 'edge': return <IosEdgeBody />;
        case 'firefox': return <IosFirefoxBody />;
        default: return <IosOtherBody browser={browser} />;
      }
    }

    // ── Android — native prompt was unavailable ───────────────────────────────
    if (platform === 'android') {
      return <AndroidManualBody browser={browser} />;
    }

    // ── macOS Safari ──────────────────────────────────────────────────────────
    if (platform === 'macos' && browser === 'safari') {
      return <MacosSafariBody />;
    }

    // ── Desktop / Windows / Linux — show reason-specific message ─────────────
    switch (blockReason) {
      case 'http': return <DesktopHttpBody />;
      case 'unsupported': return <DesktopUnsupportedBody browser={browser} platform={platform} />;
      case 'dismissed': return <DesktopDismissedBody />;
      case 'already': return <InfoBox><strong>App is already installed.</strong></InfoBox>;
      default: return <DesktopWaitingBody browser={browser} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-b border-indigo-100/60 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Wortschatz MM" className="w-10 h-10 rounded-2xl shadow-xs object-cover border border-indigo-200" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-900">Install Wortschatz MM</h3>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">PWA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {renderBody()}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
