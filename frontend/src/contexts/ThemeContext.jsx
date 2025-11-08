import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [tema, setTema] = useState('claro');
  const [loading, setLoading] = useState(true);

  // Carregar tema inicial
  useEffect(() => {
    carregarTemaInicial();
  }, []);

  const carregarTemaInicial = async () => {
    try {
      // Primeiro, verificar localStorage (síncrono para aplicar imediatamente)
      const temaLocal = localStorage.getItem('temaApp');
      if (temaLocal && (temaLocal === 'claro' || temaLocal === 'escuro')) {
        aplicarTema(temaLocal);
        setTema(temaLocal);
        setLoading(false);
        
        // Tentar sincronizar com servidor em background
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          const token = localStorage.getItem('token');
          
          fetch(`http://localhost:5000/usuarios/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              if (data.dados && data.dados.tema && data.dados.tema !== temaLocal) {
                aplicarTema(data.dados.tema);
                setTema(data.dados.tema);
                localStorage.setItem('temaApp', data.dados.tema);
              }
            })
            .catch(error => console.error('Erro ao sincronizar tema:', error));
        }
        return;
      }

      // Se não houver no localStorage, tentar carregar do servidor
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const token = localStorage.getItem('token');
        
        try {
          const res = await fetch(`http://localhost:5000/usuarios/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.dados && data.dados.tema) {
              aplicarTema(data.dados.tema);
              setTema(data.dados.tema);
              localStorage.setItem('temaApp', data.dados.tema);
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Erro ao carregar tema do servidor:', error);
        }
      }

      // Se não houver tema salvo, usar claro como padrão
      aplicarTema('claro');
      setTema('claro');
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      aplicarTema('claro');
      setTema('claro');
      setLoading(false);
    }
  };

  const aplicarTema = (novoTema) => {
    // Remover classes de tema anteriores
    document.documentElement.classList.remove('tema-claro', 'tema-escuro');
    
    // Adicionar nova classe de tema
    document.documentElement.classList.add(`tema-${novoTema}`);
    
    // Aplicar background no body
    if (novoTema === 'claro') {
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

  const alterarTema = async (novoTema) => {
    try {
      aplicarTema(novoTema);
      setTema(novoTema);
      localStorage.setItem('temaApp', novoTema);

      // Salvar no servidor se o usuário estiver logado
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const token = localStorage.getItem('token');

        try {
          await fetch(`http://localhost:5000/usuarios/${user.id}/tema`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tema: novoTema })
          });
        } catch (error) {
          console.error('Erro ao salvar tema no servidor:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao alterar tema:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ tema, alterarTema, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

