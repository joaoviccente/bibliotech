'use client';

import { useState, useEffect } from 'react';

/**
 * Componente para exibir mensagens de sucesso, erro, warning e info
 */
export default function Alert({ 
  type = 'info', 
  message, 
  title,
  duration = 5000,
  onClose,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-400',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-400',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className={`rounded-md border p-4 ${currentStyle.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className={`h-5 w-5 ${currentStyle.icon}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentStyle.iconPath} />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook para gerenciar alertas
 */
export function useAlert() {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (alert) => {
    const id = Date.now() + Math.random();
    const newAlert = { ...alert, id };
    
    setAlerts(prev => [...prev, newAlert]);

    // Auto-remove alert após duração especificada
    if (alert.duration !== 0) {
      setTimeout(() => {
        removeAlert(id);
      }, alert.duration || 5000);
    }

    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showSuccess = (message, options = {}) => {
    return addAlert({ ...options, type: 'success', message });
  };

  const showError = (message, options = {}) => {
    return addAlert({ ...options, type: 'error', message });
  };

  const showWarning = (message, options = {}) => {
    return addAlert({ ...options, type: 'warning', message });
  };

  const showInfo = (message, options = {}) => {
    return addAlert({ ...options, type: 'info', message });
  };

  return {
    alerts,
    addAlert,
    removeAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}

/**
 * Container para exibir múltiplos alertas
 */
export function AlertContainer({ alerts, removeAlert }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          title={alert.title}
          duration={0} // Não auto-remove quando está no container
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );
}
