import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="state-container not-found-page">
      <Compass size={64} className="empty-icon" />
      <h1>404 - Page Not Found</h1>
      <p className="state-text">
        The route you are trying to visit does not exist or has been relocated.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

