import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSplash.css';
import { FaFilm } from 'react-icons/fa';

export default function LoginSplash() {
  const navigate = useNavigate();
  const frases = useMemo(
    () => [
      'Prepare-se para uma aventura com os melhores filmes',
      'Qual vai ser a ação de hoje?',
      'Hoje ta pedindo um terrorzinho!',
      'Sua maratona começa agora: vamos escolher!',
      'Novos filmes estão esperando por você',
      'Hora de dar play nos seus favoritos'
    ],
    []
  );

  const [frase, setFrase] = useState(frases[0]);

  useEffect(() => {
    const indiceAleatorio = Math.floor(Math.random() * frases.length);
    setFrase(frases[indiceAleatorio]);

    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [frases, navigate]);

  return (
    <div className="splash-container">
      <div className="splash-bg-orb orb-1" />
      <div className="splash-bg-orb orb-2" />
      <div className="splash-bg-orb orb-3" />

      <div className="splash-card">
        <div className="splash-icon-wrap">
          <FaFilm className="splash-icon" />
        </div>
        <h1 className="splash-title">List of Movies</h1>
        <p className="splash-phrase">{frase}</p>

        <div className="splash-progress">
          <div className="splash-progress-bar" />
        </div>

        <p className="splash-hint">Carregando sua experiência...</p>
      </div>
    </div>
  );
}

