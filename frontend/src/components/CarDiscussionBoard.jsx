import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  CornerDownRight,
  User,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

const CarDiscussionBoard = ({ carId, ownerName, isOwner }) => {
  const { user, isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [postNotice, setPostNotice] = useState(null);

  // Active reply box messageId
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/cars/${carId}/messages`);
      setMessages(res.data.data || []);
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [carId]);

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setPosting(true);
    setPostNotice(null);

    try {
      await api.post(`/cars/${carId}/messages`, {
        subject: newSubject.trim() || undefined,
        content: newContent.trim()
      });
      setNewSubject('');
      setNewContent('');
      setPostNotice({ type: 'success', text: 'Inquiry posted! The vehicle host has been notified.' });
      fetchMessages();
    } catch (err) {
      setPostNotice({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to post message'
      });
    } finally {
      setPosting(false);
    }
  };

  const handleReplySubmit = async (messageId) => {
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      await api.post(`/cars/${carId}/messages/${messageId}/reply`, {
        content: replyContent.trim()
      });
      setReplyContent('');
      setReplyingToId(null);
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="li-card" style={{ marginTop: '1.5rem', padding: '1.75rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--li-border)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="var(--li-primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
            Questions & Inquiries with Host
          </h3>
          <span className="li-badge li-badge-category" style={{ fontSize: '0.7rem' }}>
            {messages.length} {messages.length === 1 ? 'Post' : 'Posts'}
          </span>
        </div>
      </div>

      <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
        Have questions about outstation travel, security deposit, or car condition? Post your question below to communicate directly with <strong>{ownerName || 'the host'}</strong>.
      </p>

      {/* Notice */}
      {postNotice && (
        <div className={`li-alert li-alert-${postNotice.type}`} style={{ marginBottom: '1rem' }}>
          {postNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{postNotice.text}</span>
        </div>
      )}

      {/* Post Form (Only if not the owner) */}
      {isAuthenticated ? (
        !isOwner && (
          <form
            onSubmit={handlePostMessage}
            style={{
              backgroundColor: '#f8fafc',
              padding: '1.1rem',
              borderRadius: '8px',
              border: '1px solid var(--li-border)',
              marginBottom: '1.5rem'
            }}
          >
            <div className="li-form-group">
              <label className="li-label" style={{ fontSize: '0.785rem' }}>
                Subject / Topic (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Availability for Pune trip / Child seat request"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="li-input"
              />
            </div>

            <div className="li-form-group">
              <label className="li-label" style={{ fontSize: '0.785rem' }}>
                Your Message / Question for the Host *
              </label>
              <textarea
                rows="2"
                placeholder="Ask about car condition, flexible pickup timings, outstation permits, etc..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="li-textarea"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={posting || !newContent.trim()}
                className="li-btn li-btn-primary li-btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Send size={13} /> {posting ? 'Sending...' : 'Post Question to Host'}
              </button>
            </div>
          </form>
        )
      ) : (
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '1.5rem',
            border: '1px solid var(--li-border)'
          }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--li-text-secondary)', marginBottom: '0.65rem' }}>
            Sign in to send an inquiry or message to the car owner.
          </p>
          <Link to="/login" className="li-btn li-btn-subtle li-btn-sm">
            Sign in to Ask a Question
          </Link>
        </div>
      )}

      {/* Message Threads List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--li-text-secondary)', fontSize: '0.85rem' }}>
            <span>No inquiries posted yet. Be the first to ask the host a question!</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--li-border)',
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              {/* Thread Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="li-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                    {getInitials(msg.senderName)}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--li-text-primary)' }}>
                      {msg.senderName}
                    </strong>
                    <span
                      style={{
                        marginLeft: '6px',
                        fontSize: '0.675rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#f1f5f9',
                        color: 'var(--li-text-secondary)'
                      }}
                    >
                      {msg.senderRole === 'admin' ? 'Admin' : 'Verified Renter'}
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>
                  {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Subject & Content */}
              {msg.subject && (
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--li-primary)', marginBottom: '0.3rem' }}>
                  {msg.subject}
                </h4>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--li-text-primary)', lineHeight: 1.5, margin: 0 }}>
                {msg.content}
              </p>

              {/* Replies Section */}
              {msg.replies && msg.replies.length > 0 && (
                <div style={{ marginTop: '0.85rem', paddingLeft: '1rem', borderLeft: '3px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {msg.replies.map((reply, i) => (
                    <div key={i} style={{ backgroundColor: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--li-text-primary)' }}>
                            {reply.senderName}
                          </strong>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              fontWeight: 700
                            }}
                          >
                            Host / Owner
                          </span>
                        </div>
                        <span style={{ fontSize: '0.675rem', color: 'var(--li-text-secondary)' }}>
                          {new Date(reply.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--li-text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Trigger & Box */}
              {isAuthenticated && (
                <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed #f1f5f9' }}>
                  {replyingToId === msg._id ? (
                    <div style={{ marginTop: '0.5rem' }}>
                      <textarea
                        rows="2"
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="li-textarea"
                        style={{ fontSize: '0.8rem' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyContent('');
                          }}
                          className="li-btn li-btn-subtle li-btn-sm"
                          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingReply || !replyContent.trim()}
                          onClick={() => handleReplySubmit(msg._id)}
                          className="li-btn li-btn-primary li-btn-sm"
                          style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                        >
                          {submittingReply ? 'Replying...' : 'Submit Reply'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReplyingToId(msg._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--li-primary)',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: 0
                      }}
                    >
                      <CornerDownRight size={13} /> Reply to this post
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CarDiscussionBoard;
