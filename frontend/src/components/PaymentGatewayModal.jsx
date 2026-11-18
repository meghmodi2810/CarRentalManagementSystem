import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  Loader2,
  Smartphone,
  Check
} from 'lucide-react';

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak Mahindra', code: 'KOTAK' }
];

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', handle: 'okhdfcbank' },
  { id: 'phonepe', name: 'PhonePe', handle: 'ybl' },
  { id: 'paytm', name: 'Paytm UPI', handle: 'paytm' },
  { id: 'cred', name: 'CRED UPI', handle: 'axisbank' }
];

const PaymentGatewayModal = ({ isOpen, onClose, amount, carTitle, bookingId, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 8920 1204 8831');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('912');
  const [cardName, setCardName] = useState('Authorized Cardholder');

  // Bank
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Transaction states
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'authorizing' | 'success'
  const [txnRef, setTxnRef] = useState('');

  if (!isOpen) return null;

  const orderId = `DF-${bookingId ? bookingId.slice(-6).toUpperCase() : Math.floor(100000 + Math.random() * 900000)}`;

  const handlePay = () => {
    setProcessingState('authorizing');

    setTimeout(() => {
      const generatedTxn = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
      setTxnRef(generatedTxn);
      setProcessingState('success');

      setTimeout(() => {
        onPaymentSuccess({
          transactionId: generatedTxn,
          method: activeTab.toUpperCase(),
          paidAt: new Date().toISOString()
        });
      }, 1200);
    }, 1800);
  };

  return (
    <div className="li-modal-overlay" onClick={processingState === 'idle' ? onClose : undefined} style={{ zIndex: 9999 }}>
      <div
        className="li-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
          border: '1px solid #e2e8f0'
        }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0a66c2',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem'
                }}
              >
                DF
              </div>
              <div>
                <strong style={{ fontSize: '1.1rem', letterSpacing: '0.02em', display: 'block' }}>
                  DriveFlow Secure Checkout
                </strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> RBI Authorized & 256-Bit SSL Encrypted
                </span>
              </div>
            </div>

            {processingState === 'idle' && (
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
                title="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Amount Badge */}
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.18)',
              padding: '0.75rem 1rem',
              borderRadius: '8px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Vehicle Reservation</span>
              <strong style={{ fontSize: '0.95rem' }}>{carTitle}</strong>
              <span style={{ fontSize: '0.725rem', opacity: 0.8, display: 'block' }}>Order Ref: {orderId}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Amount to Pay</span>
              <span style={{ fontSize: '1.45rem', fontWeight: 800 }}>₹{Number(amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          {processingState === 'success' ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={56} color="var(--li-success)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                Payment Successful!
              </h3>
              <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                ₹{Number(amount || 0).toLocaleString('en-IN')} paid via {activeTab.toUpperCase()}. Ref: <code>{txnRef}</code>.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '1rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <Check size={14} /> Confirmed with Bank
              </div>
            </div>
          ) : processingState === 'authorizing' ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
              <Loader2 size={46} color="var(--li-primary)" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                Authorizing Payment...
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--li-text-secondary)', marginTop: '0.35rem' }}>
                Communicating with payment gateway and issuing bank. Please do not refresh.
              </p>
            </div>
          ) : (
            <>
              {/* Method Selector Tabs */}
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
                  onClick={() => setActiveTab('upi')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${activeTab === 'upi' ? 'var(--li-primary)' : 'var(--li-border)'}`,
                    backgroundColor: activeTab === 'upi' ? 'var(--li-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    color: activeTab === 'upi' ? 'var(--li-primary)' : 'var(--li-text-primary)',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  <QrCode size={18} />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${activeTab === 'card' ? 'var(--li-primary)' : 'var(--li-border)'}`,
                    backgroundColor: activeTab === 'card' ? 'var(--li-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    color: activeTab === 'card' ? 'var(--li-primary)' : 'var(--li-text-primary)',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  <CreditCard size={18} />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${activeTab === 'netbanking' ? 'var(--li-primary)' : 'var(--li-border)'}`,
                    backgroundColor: activeTab === 'netbanking' ? 'var(--li-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    color: activeTab === 'netbanking' ? 'var(--li-primary)' : 'var(--li-text-primary)',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  <Building2 size={18} />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Tab 1: UPI */}
              {activeTab === 'upi' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1.1rem', borderRadius: '8px', border: '1px solid var(--li-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <QrCode size={70} color="#0f172a" />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--li-text-primary)', display: 'block' }}>
                        Scan & Pay via UPI
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--li-text-secondary)', display: 'block', marginTop: '2px' }}>
                        Scan using Google Pay, PhonePe, Paytm, or any UPI app.
                      </span>
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '6px',
                          fontSize: '0.725rem',
                          color: '#0284c7',
                          fontWeight: 600
                        }}
                      >
                        Zero convenience fee applied
                      </span>
                    </div>
                  </div>

                  {/* App Chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.85rem' }}>
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp(app.id);
                          setUpiId(`user@${app.handle}`);
                        }}
                        style={{
                          padding: '0.4rem 0.2rem',
                          borderRadius: '6px',
                          border: `1px solid ${selectedUpiApp === app.id ? 'var(--li-primary)' : 'var(--li-border)'}`,
                          backgroundColor: selectedUpiApp === app.id ? 'var(--li-primary-light)' : '#ffffff',
                          color: selectedUpiApp === app.id ? 'var(--li-primary)' : 'var(--li-text-primary)',
                          fontSize: '0.725rem',
                          fontWeight: selectedUpiApp === app.id ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {app.name}
                      </button>
                    ))}
                  </div>

                  <div className="li-form-group" style={{ marginBottom: 0 }}>
                    <label className="li-label" style={{ fontSize: '0.78rem' }}>Or Enter Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="li-input"
                      placeholder="e.g. mobile@upi / name@okhdfcbank"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Credit / Debit Cards */}
              {activeTab === 'card' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1.1rem', borderRadius: '8px', border: '1px solid var(--li-border)' }}>
                  <div className="li-form-group">
                    <label className="li-label" style={{ fontSize: '0.78rem' }}>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="li-input"
                      placeholder="4532 •••• •••• 8831"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="li-form-group">
                      <label className="li-label" style={{ fontSize: '0.78rem' }}>Valid Thru (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="li-input"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="li-form-group">
                      <label className="li-label" style={{ fontSize: '0.78rem' }}>CVV / CVC</label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="li-input"
                        placeholder="•••"
                      />
                    </div>
                  </div>

                  <div className="li-form-group" style={{ marginBottom: 0 }}>
                    <label className="li-label" style={{ fontSize: '0.78rem' }}>Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="li-input"
                      placeholder="Name on card"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Net Banking */}
              {activeTab === 'netbanking' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1.1rem', borderRadius: '8px', border: '1px solid var(--li-border)' }}>
                  <label className="li-label" style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }}>Popular Banks</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginBottom: '0.85rem' }}>
                    {POPULAR_BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        style={{
                          padding: '0.5rem 0.35rem',
                          borderRadius: '6px',
                          border: `1px solid ${selectedBank === bank.id ? 'var(--li-primary)' : 'var(--li-border)'}`,
                          backgroundColor: selectedBank === bank.id ? 'var(--li-primary-light)' : '#ffffff',
                          color: selectedBank === bank.id ? 'var(--li-primary)' : 'var(--li-text-primary)',
                          fontSize: '0.75rem',
                          fontWeight: selectedBank === bank.id ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>

                  <label className="li-label" style={{ fontSize: '0.78rem' }}>All Other Supported Banks</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="li-select"
                  >
                    <option value="hdfc">HDFC Bank</option>
                    <option value="sbi">State Bank of India (SBI)</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                    <option value="bob">Bank of Baroda</option>
                    <option value="yes">Yes Bank</option>
                    <option value="indusind">IndusInd Bank</option>
                  </select>
                </div>
              )}

              {/* Security & Action Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--li-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>
                  <Lock size={12} color="#16a34a" />
                  <span>256-Bit Bank Grade SSL Encrypted</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={onClose} className="li-btn li-btn-subtle li-btn-sm">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePay}
                    className="li-btn li-btn-primary"
                    style={{ minWidth: '170px' }}
                  >
                    Pay ₹{Number(amount || 0).toLocaleString('en-IN')} <ArrowRight size={14} />
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

export default PaymentGatewayModal;

