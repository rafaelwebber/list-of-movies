import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaFilm, 
  FaPlusCircle, 
  FaUser, 
  FaChartBar, 
  FaSearch, 
  FaLightbulb, 
  FaMoon,
  FaSignOutAlt,
  FaClock,
  FaStar
} from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFilmes: 0,
    filmesAssistidos: 0,
    notaMedia: 0,
    ultimosFilmes: []
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuário');
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      // Buscar informações do usuário
      const userInfo = localStorage.getItem('userInfo');
      let userId = null;
      
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setUserName(user.nome || 'Usuário');
        userId = user.id;
      }

      // Buscar filmes do usuário se tiver ID
      if (userId) {
        const response = await fetch(`http://localhost:5000/filmes/usuario/${userId}/filmes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.dados && Array.isArray(data.dados)) {
            setStats({
              totalFilmes: data.dados.length,
              filmesAssistidos: data.dados.length, // Todos os filmes vinculados são considerados assistidos
              notaMedia: calcularNotaMedia(data.dados),
              ultimosFilmes: data.dados.slice(-3)
            });
          }
        }
      } else {
        // Se não tiver ID do usuário, buscar todos os filmes
        const response = await fetch('http://localhost:5000/filmes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.dados && Array.isArray(data.dados)) {
            setStats({
              totalFilmes: data.dados.length,
              filmesAssistidos: data.dados.length,
              notaMedia: calcularNotaMedia(data.dados),
              ultimosFilmes: data.dados.slice(-3)
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularNotaMedia = (filmes) => {
    if (!filmes || filmes.length === 0) return '0.0';
    const filmesComNota = filmes.filter(f => f.nota && f.nota > 0);
    if (filmesComNota.length === 0) return '0.0';
    const soma = filmesComNota.reduce((acc, f) => acc + (parseFloat(f.nota) || 0), 0);
    return (soma / filmesComNota.length).toFixed(1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const menuItems = [
    {
      path: '/dashboard/filmes',
      icon: <FaFilm />,
      title: 'Meus Filmes',
      description: 'Gerencie sua coleção',
      color: '#e60505'
    },
    {
      path: '/dashboard/adicionar',
      icon: <FaPlusCircle />,
      title: 'Adicionar Filme',
      description: 'Adicione novos filmes',
      color: '#28a745'
    },
    {
      path: '/dashboard/buscar',
      icon: <FaSearch />,
      title: 'Buscar Filmes',
      description: 'Encontre novos filmes',
      color: '#17a2b8'
    },
    {
      path: '/dashboard/estatisticas',
      icon: <FaChartBar />,
      title: 'Estatísticas',
      description: 'Veja suas análises',
      color: '#ffc107'
    },
    {
      path: '/dashboard/recomendacoes',
      icon: <FaLightbulb />,
      title: 'Recomendações',
      description: 'Filmes sugeridos',
      color: '#6f42c1'
    },
    {
      path: '/dashboard/perfil',
      icon: <FaUser />,
      title: 'Meu Perfil',
      description: 'Edite suas informações',
      color: '#fd7e14'
    },
    {
      path: '/dashboard/tema',
      icon: <FaMoon />,
      title: 'Tema',
      description: 'Alterar aparência',
      color: '#343a40'
    }
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              <FaFilm className="title-icon" />
              List of Movies
            </h1>
            <p className="welcome-text">Bem-vindo, <span>{userName}</span>!</p>
          </div>
          <div className="header-right">
            <button className="logout-btn" onClick={handleLogout} title="Sair">
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            <section className="stats-section">
              <div className="stat-card">
                <div className="stat-icon total">
                  <FaFilm />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalFilmes}</h3>
                  <p>Total de Filmes</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon watched">
                  <FaClock />
                </div>
                <div className="stat-info">
                  <h3>{stats.filmesAssistidos}</h3>
                  <p>Assistidos</p>
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
            </section>

            <section className="menu-section">
              <h2 className="section-title">Navegação Rápida</h2>
              <div className="menu-grid">
                {menuItems.map((item, index) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className="menu-card"
                    style={{ '--delay': `${index * 0.1}s`, '--card-color': item.color }}
                  >
                    <div className="menu-icon" style={{ color: item.color }}>
                      {item.icon}
                    </div>
                    <div className="menu-content">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                    <div className="menu-arrow">→</div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
