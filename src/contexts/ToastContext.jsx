import { createContext, useContext, useState, useCallback } from 'react';

const TOAST_DURATION_MS = 4000;
const TOAST_TYPE_ERROR = 'error';
const TOAST_TYPE_SUCCESS = 'success';
const TOAST_TYPE_INFO = 'info';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = TOAST_TYPE_INFO) => {
    const id = Date.now();
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const showError = useCallback((message) => {
    showToast(message, TOAST_TYPE_ERROR);
  }, [showToast]);

  const showSuccess = useCallback((message) => {
    showToast(message, TOAST_TYPE_SUCCESS);
  }, [showToast]);

  const showInfo = useCallback((message) => {
    showToast(message, TOAST_TYPE_INFO);
  }, [showToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
