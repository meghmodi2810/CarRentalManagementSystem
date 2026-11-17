import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, QrCode, CreditCard, Building2, Lock, ArrowRight, Loader2 } from 'lucide-react';

const FakePaymentModal = ({ isOpen, onClose, amount, carTitle, onPaymentSuccess }) => {
  const [method, setMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('driver@oksbi');
  const [cardData, setCardData] = useState({
    number: '4532 8920 1204 8831',
    name: 'Verified Driver',
    expiry: '08/29',
    cvv: '912'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setPaidSuccess(true);

      setTimeout(() => {
        const txnId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
        onPaymentSuccess({
          transactionId: txnId,
          method: method.toUpperCase(),
          paidAt: new Date().toISOString()
        });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="li-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="li-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: 0, overflow: 'hidden', borderRadius: '12px' }}
      >
        {/* Gateway Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} color="#ffffff" />
              <div>
                <strong style={{ fontSize: '1.1rem', letterSpacing: '0.01em' }}>DriveFlow SecurePay</strong>
                <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.9 }}>
                  Simulated Payment Gateway (Test Mode)
                </span>
              </div>
            </div>
            {!processing && !paidSuccess && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              background: 'rgba(0,0,0,0.18)',
              padding: '0.65rem 1rem',
              borderRadius: '8px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Booking Vehicle</span>
              <strong style={{ fontSize: '0.95rem' }}>{carTitle}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Total Payable</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          {paidSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={56} color="var(--li-success)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                Payment Authorized!
              </h3>
              <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                ₹{amount.toLocaleString('en-IN')} confirmed via {method.toUpperCase()}. Submitting rental request to vehicle owner...
              </p>
            </div>
          ) : processing ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
              <Loader2 size={46} color="var(--li-primary)" className="spinner" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Processing Test Transaction...</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--li-text-secondary)', marginTop: '0.35rem' }}>
                Securing payment authorization with bank network. Please do not close this window.
              </p>
            </div>
          ) : (
            <>
              {/* Payment Method Selector Tabs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '1.25rem'
                }}
              >
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${method === 'upi' ? 'var(--li-primary)' : 'var(--li-border)'}`,
                    backgroundColor: method === 'upi' ? 'var(--li-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    color: method === 'upi' ? 'var(--li-primary)' : 'var(--li-text-primary)',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  <QrCode size={20} />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${method === 'card' ? 'var(--li-primary)' : 'var(--li-border)'}`,
                    backgroundColor: method === 'card' ? 'var(--li-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    color: method === 'card' ? 'var(--li-primary)' : 'var(--li-text-primary)',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  <CreditCard size={20} />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${method === 'netbanking' ? 'var(--li-primary)' : 'var(--li-border)'}`,
                    backgroundColor: method === 'netbanking' ? 'var(--li-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    color: method === 'netbanking' ? 'var(--li-primary)' : 'var(--li-text-primary)',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  <Building2 size={20} />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Method Details */}
              {method === 'upi' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--li-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <QrCode size={64} color="#0f172a" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Scan with Any UPI App</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)', display: 'block' }}>
                        Google Pay • PhonePe • Paytm • BHIM
                      </span>
                      <span className="li-badge li-badge-category" style={{ marginTop: '0.4rem', display: 'inline-block' }}>
                        Simulated Instant Approval
                      </span>
                    </div>
                  </div>

                  <div className="li-form-group" style={{ marginBottom: 0 }}>
                    <label className="li-label" style={{ fontSize: '0.78rem' }}>Or Enter Virtual UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="li-input"
                      placeholder="e.g. mobile@upi"
                    />
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--li-border)' }}>
                  <div className="li-form-group">
                    <label className="li-label" style={{ fontSize: '0.78rem' }}>Card Number</label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      className="li-input"
                      placeholder="16-digit card number"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="li-form-group">
                      <label className="li-label" style={{ fontSize: '0.78rem' }}>Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        className="li-input"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="li-form-group">
                      <label className="li-label" style={{ fontSize: '0.78rem' }}>CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        className="li-input"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'netbanking' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--li-border)' }}>
                  <label className="li-label" style={{ fontSize: '0.78rem' }}>Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="li-select"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                    Test gateway automatically approves payments from any selected bank.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                  <Lock size={12} /> 256-bit Simulated Sandbox
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={onClose} className="li-btn li-btn-subtle li-btn-sm">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePay}
                    className="li-btn li-btn-primary"
                    style={{ minWidth: '160px' }}
                  >
                    Pay ₹{amount.toLocaleString('en-IN')} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FakePaymentModal;

