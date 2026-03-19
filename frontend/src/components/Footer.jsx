import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        <span className="app-footer-credit">
          Desenvolvido por <strong>RLW Desenvolvimento</strong> &copy; {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

