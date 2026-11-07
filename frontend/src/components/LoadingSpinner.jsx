import React from 'react';

const LoadingSpinner = ({ message = 'Loading fleet information...' }) => {
  return (
    <div className="li-card li-state-card">
      <div className="li-spinner"></div>
      <h3 className="li-state-title">{message}</h3>
      <p className="li-state-desc">Fetching real-time updates from DriveFlow servers</p>
    </div>
  );
};

export default LoadingSpinner;
