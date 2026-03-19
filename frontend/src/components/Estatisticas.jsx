import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaStar, FaFilm, FaCalendarAlt, FaTag } from 'react-icons/fa';
import './Estatisticas.css';

export default function Estatisticas() {
  const [filmes, setFilmes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      
      if (!token || !userInfo) {
        navigate('/');
        return;
      }

      const user = JSON.parse(userInfo);
      const response = await fetch(`${API_URL}/filmes/usuario/${user.id}/filmes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFilmes(data.dados && Array.isArray(data.dados) ? data.dados : []);
      } else {
        setFilmes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setFilmes([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = () => {
    const total = filmes.length;
    const comNota = filmes.filter(f => f.nota && f.nota > 0);
    const notaMedia = comNota.length > 0 
      ? (comNota.reduce((acc, f) => acc + parseFloat(f.nota), 0) / comNota.length).toFixed(1)
      : '0.0';
    
    const porNota = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    comNota.forEach(f => {
      const n = Math.round(parseFloat(f.nota));
      if (n >= 1 && n <= 5) porNota[n]++;
    });

    const anos = {};
    filmes.forEach(f => {
      const ano = f.ano || 'Sem ano';
      anos[ano] = (anos[ano] || 0) + 1;
    });
    const topAnos = Object.entries(anos).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const generos = {};
    filmes.forEach(f => {
      const gen = (f.genero || 'Sem gênero').split(',').map(g => g.trim());
      gen.forEach(g => {
        generos[g] = (generos[g] || 0) + 1;
      });
    });
    const topGeneros = Object.entries(generos).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { total, comNota: comNota.length, notaMedia, porNota, topAnos, topGeneros };
  };

  if (loading) {
    return (
      <div className="estatisticas-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  const stats = calcularEstatisticas();

  return (
    <div className="estatisticas-container">
      <div className="estatisticas-content">
        <div className="estatisticas-header">
          <button className="btn-voltar" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> <span className="btn-voltar-texto">Voltar</span>
          </button>
          <h1>Estatísticas</h1>
          <p className="subtitle">Análise da sua coleção de filmes</p>
        </div>

        {filmes.length === 0 ? (
          <div className="empty-state">
            <FaChartBar className="empty-icon" />
            <h2>Nenhum filme na coleção</h2>
            <p>Adicione filmes para ver suas estatísticas</p>
            <button className="btn-adicionar" onClick={() => navigate('/dashboard/adicionar')}>
              Adicionar Filme
            </button>
          </div>
        ) : (
          <div className="estatisticas-grid">
            <section className="stat-cards">
              <div className="stat-card">
                <div className="stat-icon total">
                  <FaFilm />
                </div>
                <div className="stat-info">
                  <h3>{stats.total}</h3>
                  <p>Total de Filmes</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon rating">
                  <FaStar />
                </div>
                <div className="stat-info">
                  <h3>{stats.notaMedia}</h3>
                  <p>Nota Média</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon evaluated">
                  <FaChartBar />
                </div>
                <div className="stat-info">
                  <h3>{stats.comNota}/{stats.total}</h3>
                  <p>Filmes Avaliados</p>
                </div>
              </div>
            </section>

            <section className="chart-section">
              <h2>Distribuição por Nota</h2>
              <div className="bar-chart">
                {[5, 4, 3, 2, 1].map(nota => {
                  const maxBar = Math.max(...Object.values(stats.porNota), 1);
                  const width = (stats.porNota[nota] / maxBar) * 100;
                  return (
                    <div key={nota} className="bar-row">
                      <span className="bar-label">{nota} ★</span>
                      <div className="bar-track">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${width}%` }}
                        />
                        <span className="bar-value">{stats.porNota[nota]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="chart-section">
              <h2>Filmes por Ano</h2>
              <div className="list-chart">
                {stats.topAnos.map(([ano, count]) => (
                  <div key={ano} className="list-row">
                    <FaCalendarAlt className="list-icon" />
                    <span className="list-label">{ano}</span>
                    <span className="list-value">{count} filmes</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="chart-section">
              <h2>Gêneros Mais Assistentes</h2>
              <div className="list-chart">
                {stats.topGeneros.map(([genero, count]) => (
                  <div key={genero} className="list-row">
                    <FaTag className="list-icon" />
                    <span className="list-label">{genero}</span>
                    <span className="list-value">{count} filmes</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
