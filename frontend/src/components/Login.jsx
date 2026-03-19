import React, { useRef, useState } from 'react';
import './Login.css';
import { FaEnvelope, FaLock, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [focusField, setFocusField] = useState(null); // null | 'email' | 'password'
  const [charReaction, setCharReaction] = useState(null); // null | '1' | '2'
  const reactionTimerRef = useRef(null);

  const navigate = useNavigate();

  const handleCharacterClick = (id) => {
    setFocusField(null);
    setCharReaction(id);

    if (reactionTimerRef.current) {
      clearTimeout(reactionTimerRef.current);
    }

    reactionTimerRef.current = setTimeout(() => setCharReaction(null), 1600);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setMensagem({ tipo: 'erro', texto: 'Preencha email e senha.' });
      return;
    }

    setCarregando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Resposta inválida do servidor');
      }

      if (response.ok) {
        // Gerar token simples se não existir (para compatibilidade)
        if (!data.token) {
          localStorage.setItem('token', 'token_temporario_' + Date.now());
        } else {
          localStorage.setItem('token', data.token);
        }
        // Salvar informações do usuário se disponíveis
        if (data.dados) {
          localStorage.setItem('userInfo', JSON.stringify(data.dados));
        }
        navigate('/splash');
      } else {
        setMensagem({
          tipo: 'erro',
          texto: data.mensagem || data.message || 'Credenciais inválidas'
        });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <div className="login-orbs" aria-hidden="true">
        <div className="login-orb orb-1" />
        <div className="login-orb orb-2" />
        <div className="login-orb orb-3" />
      </div>

      
    <div className="foregroundContent">
        <div className="login-layout">
          <div className={`login-characters ${focusField ? `mode-${focusField}` : 'mode-idle'}`}>
            <div
              className={`character character-1 ${charReaction === '1' ? 'clicked' : ''}`}
              aria-hidden="true"
              role="button"
              tabIndex={0}
              onClick={() => handleCharacterClick('1')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCharacterClick('1');
              }}
            >
              <div className="char-head">
                <div className="char-eye left">
                  <span className="char-pupil" />
                </div>
                <div className="char-eye right">
                  <span className="char-pupil" />
                </div>
                <div className="char-mouth" />
                <div className="char-hand" />
              </div>
              <div className="char-body" />
            </div>

            <div
              className={`character character-2 ${charReaction === '2' ? 'clicked' : ''}`}
              aria-hidden="true"
              role="button"
              tabIndex={0}
              onClick={() => handleCharacterClick('2')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCharacterClick('2');
              }}
            >
              <div className="char-head">
                <div className="char-eye left">
                  <span className="char-pupil" />
                </div>
                <div className="char-eye right">
                  <span className="char-pupil" />
                </div>
                <div className="char-mouth" />
                <div className="char-hand" />
              </div>
              <div className="char-body" />
            </div>

            <div className="login-characters-caption">
              {focusField === 'password' ? 'Shhh...' : 'Vamos lá!'}
            </div>
          </div>

          <div className="login-panel">
            <div className="loginBox login-panel-box">
              <h1 className="login-title">Acesse sua conta</h1>
              <FaUserCircle className="profileIcon" />

              <div className="inputGroup">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField(null)}
                />
              </div>

              <div className="inputGroup">
                <FaLock className="icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                />
              </div>

              <div className="options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#">Forgot Password?</a>
              </div>

              <button
                className="loginButton"
                onClick={handleLogin}
                disabled={carregando}
              >
                {carregando ? 'Entrando...' : 'LOGIN'}
              </button>

              {mensagem.texto && (
                <div className="login-mensagem erro">{mensagem.texto}</div>
              )}

              <div className="registerPrompt">
                <p>
                  Não tem uma conta? <Link to="/cadastro">Crie uma agora</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}