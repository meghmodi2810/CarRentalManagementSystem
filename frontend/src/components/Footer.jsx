import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="li-footer">
      <div className="li-footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Car size={18} color="var(--li-primary)" />
          <strong style={{ color: 'var(--li-text-primary)', fontSize: '0.95rem' }}>DriveFlow</strong>
          <span style={{ color: 'var(--li-text-secondary)', fontSize: '0.8rem' }}>• On-Demand Vehicle Rental</span>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem' }}>
          <Link to="/fleet" style={{ color: 'var(--li-text-secondary)', textDecoration: 'none' }}>Fleet</Link>
          <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: 'var(--li-text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: 'var(--li-text-secondary)', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#support" onClick={(e) => e.preventDefault()} style={{ color: 'var(--li-text-secondary)', textDecoration: 'none' }}>Support</a>
        </div>

        <div style={{ color: 'var(--li-text-secondary)', fontSize: '0.8rem' }}>
          DriveFlow Mobility © {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
