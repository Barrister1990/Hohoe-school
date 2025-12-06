'use client';

import { useEffect, useState } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { useAlert } from './AlertProvider';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { showInfo } = useAlert();

  useEffect(() => {
    // Defer initialization to avoid blocking navigation
    // Use requestIdleCallback if available, otherwise setTimeout
    const initPrompt = () => {
    // Check if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if prompt was dismissed before (localStorage)
    const promptDismissed = localStorage.getItem('install-prompt-dismissed');
    const promptDismissedTime = promptDismissed ? parseInt(promptDismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - promptDismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if:
    // 1. Not in standalone mode
    // 2. Prompt wasn't dismissed in last 7 days
    // 3. Either iOS or Android/Chrome
    if (!isStandaloneMode && (daysSinceDismissed > 7 || !promptDismissed)) {
      // Delay showing prompt by 3 seconds after page load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

        return () => clearTimeout(timer);
      }
    };

    // Use requestIdleCallback to defer initialization until browser is idle
    if ('requestIdleCallback' in window) {
      const idleCallback = (window as any).requestIdleCallback(initPrompt, { timeout: 1000 });
      return () => (window as any).cancelIdleCallback(idleCallback);
    } else {
      // Fallback to setTimeout for browsers without requestIdleCallback
      const timer = setTimeout(initPrompt, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Check if we should show the prompt
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      const promptDismissed = localStorage.getItem('install-prompt-dismissed');
      const promptDismissedTime = promptDismissed ? parseInt(promptDismissed, 10) : 0;
      const daysSinceDismissed = (Date.now() - promptDismissedTime) / (1000 * 60 * 60 * 24);
      
      // Only prevent default if we're going to show our custom prompt
      if (!isStandaloneMode && (daysSinceDismissed > 7 || !promptDismissed)) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Ensure prompt will be shown (either immediately or after delay)
        // If showPrompt is already scheduled, it will show; otherwise deferredPrompt will trigger render
      }
      // If we're not showing the prompt, let the browser handle it normally
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        showInfo('App installation started!');
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // If we have a deferred prompt, show it even if showPrompt is false (user might have dismissed before)
  // This ensures we show the prompt when we prevented the default
  const shouldShow = showPrompt || deferredPrompt !== null;

  if (!shouldShow) {
    return null;
  }

  // iOS Safari instructions
  if (isIOS && !deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Install App</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Install Hohoe LMS on your iPhone for quick access.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Follow these steps:</p>
            <ol className="text-xs text-blue-800 space-y-1.5 list-decimal list-inside">
              <li>Tap the <Share className="h-3 w-3 inline" /> Share button at the bottom</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> in the top right</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome install prompt
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Install App</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Install Hohoe LMS on your device for quick access and offline capabilities.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Install Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

