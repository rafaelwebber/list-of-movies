import React from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="dashboardMenu">
      <h1>Dashboard</h1>
      <ul>
        <li><Link to="/dashboard/filmes">🎬 Meus Filmes</Link></li>
        <li><Link to="/dashboard/adicionar">➕ Adicionar Filme</Link></li>
        <li><Link to="/dashboard/perfil">👤 Meu Perfil</Link></li>
        <li><Link to="/dashboard/estatisticas">📊 Estatísticas</Link></li>
        <li><Link to="/dashboard/buscar">🔍 Buscar Filmes</Link></li>
        <li><Link to="/dashboard/recomendacoes">🎯 Recomendações</Link></li>
        <li><Link to="/dashboard/tema">🌓 Alternar Tema</Link></li>
      </ul>
    </div>
  );
}
