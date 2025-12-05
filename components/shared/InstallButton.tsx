'use client';

import { useEffect, useState } from 'react';
import { Download, Share, Check } from 'lucide-react';
import { useAlert } from './AlertProvider';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function InstallButton({ className = '', variant = 'default', size = 'md' }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { showInfo, showWarning } = useAlert();

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          showInfo('App installation started!');
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Installation error:', error);
        showWarning('Failed to install app. Please try again.');
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      // Show iOS instructions
      showInfo(
        'To install: Tap the Share button, then "Add to Home Screen"',
        'Install on iPhone'
      );
    } else {
      showWarning('Installation is not available on this device or browser.');
    }
  };

  // Don't show if already installed
  if (isStandalone) {
    return (
      <button
        disabled
        className={`${className} flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed`}
        title="App is already installed"
      >
        <Check className="h-4 w-4" />
        <span>Installed</span>
      </button>
    );
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    default: 'text-white bg-blue-600 hover:bg-blue-700',
    outline: 'text-blue-600 bg-white border border-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 bg-transparent hover:bg-blue-50',
  };

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling || (!deferredPrompt && !isIOS)}
      className={`
        ${className}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        flex items-center justify-center gap-2 font-medium rounded-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={isIOS ? 'Install on iPhone' : 'Install app'}
    >
      {isInstalling ? (
        <>
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Installing...</span>
        </>
      ) : isIOS ? (
        <>
          <Share className="h-4 w-4" />
          <span>Install</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Install App</span>
        </>
      )}
    </button>
  );
}

