'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions & { open: boolean } | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert({
      ...options,
      open: true,
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      showCancel: options.showCancel ?? false,
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert({
      message,
      title: title || 'Success',
      type: 'success',
    });
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert({
      message,
      title: title || 'Error',
      type: 'error',
    });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert({
      message,
      title: title || 'Warning',
      type: 'warning',
    });
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert({
      message,
      title: title || 'Information',
      type: 'info',
    });
  }, [showAlert]);

  const handleClose = useCallback(() => {
    if (alert?.onCancel) {
      alert.onCancel();
    }
    setAlert(null);
  }, [alert]);

  const handleConfirm = useCallback(() => {
    if (alert?.onConfirm) {
      alert.onConfirm();
    }
    setAlert(null);
  }, [alert]);

  const getIcon = () => {
    if (!alert) return null;
    
    const iconClass = 'h-5 w-5';
    switch (alert.type) {
      case 'success':
        return <CheckCircle2 className={`${iconClass} text-green-600`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-600`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-600`} />;
      default:
        return <Info className={`${iconClass} text-blue-600`} />;
    }
  };

  const getTitleColor = () => {
    if (!alert) return '';
    
    switch (alert.type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {alert && (
        <AlertDialog open={alert.open} onOpenChange={(open) => !open && handleClose()}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                {getIcon()}
                <AlertDialogTitle className={getTitleColor()}>
                  {alert.title}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="pt-2">
                {alert.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {alert.showCancel && (
                <AlertDialogCancel onClick={handleClose}>
                  {alert.cancelText || 'Cancel'}
                </AlertDialogCancel>
              )}
              <AlertDialogAction onClick={handleConfirm}>
                {alert.confirmText || 'OK'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

