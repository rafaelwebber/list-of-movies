import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/themes.css';

// Aplicar tema inicial antes de renderizar para evitar flash
const aplicarTemaInicial = () => {
  const temaLocal = localStorage.getItem('temaApp');
  const tema = (temaLocal && (temaLocal === 'claro' || temaLocal === 'escuro')) ? temaLocal : 'claro';
  
  // Remover classes de tema anteriores
  document.documentElement.classList.remove('tema-claro', 'tema-escuro');
  
  // Adicionar nova classe de tema
  document.documentElement.classList.add(`tema-${tema}`);
  
  // Aplicar background no body
  if (tema === 'claro') {
    document.body.style.backgroundImage = "url('/imagens/fundo-login.avif')";
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundColor = 'transparent';
  } else {
    document.body.style.backgroundImage = 'linear-gradient(135deg, #0f172a 0%, #020617 100%)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundColor = '#020617';
  }
};

// Aplicar tema imediatamente
aplicarTemaInicial();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
