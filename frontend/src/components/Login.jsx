import React, { useState } from 'react';
import './Login.css';
import { FaEnvelope, FaLock, FaUserCircle } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Login bem-sucedido!');
        // redirecionar ou navegar
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (error) {
      alert('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="container">
      <div className="loginBox">
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
      </div>
    </div>
  );
}
