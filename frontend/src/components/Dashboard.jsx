import React from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const filmes = [
    { id: 1, titulo: 'O Poderoso Chefão', genero: 'Drama' },
    { id: 2, titulo: 'Interestelar', genero: 'Ficção Científica' },
    { id: 3, titulo: 'Parasita', genero: 'Suspense' },
  ];

  return (
    <div className="dashboardContainer">
      <header className="dashboardHeader">
        <h1>🎬 List of Movies</h1>
        <p>Bem-vindo ao seu catálogo pessoal</p>
      </header>

      <section className="filmesSection">
        {filmes.map(filme => (
          <div key={filme.id} className="filmeCard">
            <h2>{filme.titulo}</h2>
            <p>Gênero: {filme.genero}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
