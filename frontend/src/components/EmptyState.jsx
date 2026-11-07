import React from 'react';
import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  message = 'There is no data matching your current selection.',
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="li-card li-state-card">
      <Icon size={40} color="var(--li-text-tertiary)" style={{ marginBottom: '0.65rem' }} />
      <h3 className="li-state-title">{title}</h3>
      <p className="li-state-desc">{message}</p>
      {actionLink && actionText && (
        <Link to={actionLink} className="li-btn li-btn-primary li-btn-sm">
          {actionText}
        </Link>
      )}
      {onAction && actionText && !actionLink && (
        <button onClick={onAction} className="li-btn li-btn-primary li-btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
