import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Car,
  CreditCard,
  MessageSquare,
  Check,
  ChevronRight
} from 'lucide-react';

const NotificationDropdown = ({ onOpenPaymentForRental }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif._id}/read`);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
    } catch (e) {}

    setIsOpen(false);

    // If it's an approved request notification, trigger payment directly if callback provided!
    if (notif.type === 'request_approved' && notif.relatedRental && onOpenPaymentForRental) {
      onOpenPaymentForRental(notif.relatedRental);
      return;
    }

    if (notif.link) {
      navigate(notif.link);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="li-notif-wrap" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="li-notif-btn"
        style={{
          position: 'relative',
          background: isOpen ? 'var(--li-primary-light)' : 'transparent',
          border: 'none',
          padding: '6px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? 'var(--li-primary)' : 'var(--li-text-secondary)'
        }}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 800,
              minWidth: '17px',
              height: '17px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #ffffff'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxHeight: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
            border: '1px solid var(--li-border)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--li-border)',
              backgroundColor: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--li-text-primary)' }}>
                Notifications
              </strong>
              {unreadCount > 0 && (
                <span className="li-badge li-badge-category" style={{ fontSize: '0.65rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: 'var(--li-primary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--li-text-secondary)', fontSize: '0.85rem' }}>
                <Bell size={28} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
                <span>No new notifications</span>
              </div>
            ) : (
              notifications.map((n) => {
                const isApproved = n.type === 'request_approved';
                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      backgroundColor: n.isRead ? '#ffffff' : '#f0f7ff',
                      transition: 'background-color 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {!n.isRead && (
                      <span
                        style={{
                          position: 'absolute',
                          left: '6px',
                          top: '18px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--li-primary)'
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <strong
                        style={{
                          fontSize: '0.825rem',
                          color: isApproved ? '#16a34a' : 'var(--li-text-primary)',
                          display: 'block'
                        }}
                      >
                        {n.title}
                      </strong>
                      <span style={{ fontSize: '0.675rem', color: 'var(--li-text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.775rem', color: 'var(--li-text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                      {n.message}
                    </p>

                    {isApproved && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <span
                          className="li-btn li-btn-primary li-btn-sm"
                          style={{
                            fontSize: '0.725rem',
                            padding: '3px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CreditCard size={12} /> Pay Now <ChevronRight size={12} />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

