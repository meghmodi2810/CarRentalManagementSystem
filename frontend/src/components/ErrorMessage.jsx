import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorMessage = ({ message = 'Unable to complete this request.', onRetry }) => {
  return (
    <div className="li-card li-state-card" style={{ borderLeft: '4px solid var(--li-danger)' }}>
      <AlertCircle size={36} color="var(--li-danger)" style={{ marginBottom: '0.5rem' }} />
      <h3 className="li-state-title">Something went wrong</h3>
      <p className="li-state-desc">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="li-btn li-btn-subtle li-btn-sm">
          <RotateCcw size={14} /> Try again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
