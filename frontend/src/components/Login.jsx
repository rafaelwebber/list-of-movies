import React, { useState } from 'react';
import './Login.css';
import { FaEnvelope, FaLock, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();
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
        alert('Login bem-sucedido!');
        navigate('/dashboard');
      } else {
        alert('Erro: ' + (data.mensagem || data.message || 'Credenciais inválidas'));
      }
    } catch (error) {
      alert('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="container">
      <div className="backgroundBlur" />
      
    <div className="foregroundContent">
      <header className="titleBox">

        <h1 className="animatedTitle">
          {'List of Movies'.split('').map((char, i) => (
            <span
              key={i}
              className="letter"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        <p className="animatedTagline">
          {'Seu catálogo pessoal de filmes favoritos'.split('').map((char, i) => (
            <span
              key={i}
              className="letter"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </p>
      </header>


      <div className="loginBox">
        <h1>Acesse sua conta</h1>
        <FaUserCircle className="profileIcon" />
        <div className="inputGroup">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Forgot Password?</a>
        </div>
        <button className="loginButton" onClick={handleLogin}>LOGIN</button>
          <div className="registerPrompt">
            <p>Não tem uma conta? <Link to="/cadastro">Crie uma agora</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}