import React from 'react';
import { Car } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="li-footer">
      <div className="li-footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Car size={16} color="var(--li-primary)" />
          <strong style={{ color: 'var(--li-text-primary)' }}>DriveFlow Car Rental System</strong>
          <span>• IT7050 Full Stack Web Development</span>
        </div>
        <div>
          <span>M.Sc.(IT) Sem 1 • React (Vite) + Express + MongoDB</span>
        </div>
        <div>
          <span>DriveFlow Corporation © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
