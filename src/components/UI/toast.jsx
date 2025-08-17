// components/UI/Toast.js
import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className="fixed top-4 right-4 z-[1000] animate-slide-in-right">
      <div className={`${typeStyles[type]} text-white px-4 py-3 rounded-lg shadow-lg border-l-4 flex items-center gap-3 min-w-[300px] max-w-[500px]`}>
        <span className="text-lg">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Hook for managing toast notifications
export const useToast = () => {
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ isVisible: true, message, type, duration });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const ToastComponent = () => (
    <Toast 
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
      duration={toast.duration}
    />
  );

  return { showToast, ToastComponent };
};

export default Toast;

// Add this CSS to your global styles for the animation:
/*
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
*/