import React from 'react';
import { X, Wifi, AlertCircle, MessageSquare } from 'lucide-react';

export default function ToastNotifications({ toasts, removeToast }) {
  const getIcon = (type) => {
    switch (type) {
      case 'collab':
        return <Wifi size={18} style={{ color: 'var(--accent-cyan)' }} />;
      case 'comment':
        return <MessageSquare size={18} style={{ color: 'var(--accent-purple)' }} />;
      default:
        return <AlertCircle size={18} style={{ color: 'var(--secondary)' }} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type || 'system'}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getIcon(toast.type)}
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
