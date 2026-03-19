import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './VerificarEmail.css';

export default function VerificarEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [codigo, setCodigo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const [emailPendente, setEmailPendente] = useState(null);
  const [codigoMock, setCodigoMock] = useState(null);
  const [cooldownReenvio, setCooldownReenvio] = useState(0);

  useEffect(() => {
    const email = localStorage.getItem('emailVerificacaoPendente');
    const codigoLocalMock = localStorage.getItem('codigoMockPendente');

    const stateCodigo = location.state?.codigo;

    setEmailPendente(email);
    setCodigoMock(stateCodigo || codigoLocalMock || null);

    if (!email) {
      navigate('/cadastro');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (cooldownReenvio <= 0) return;
    const interval = setInterval(() => {
      setCooldownReenvio((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownReenvio]);

  const handleValidarCodigo = async () => {
    if (!codigo.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe o código de validação.' });
      return;
    }

    setCarregando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const response = await fetch(`${API_URL}/usuarios/verificar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailPendente,
          codigo
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        // Mock: token temporário para ser compatível com o Dashboard.
        localStorage.setItem('token', 'token_temporario_' + Date.now());
        localStorage.setItem('userInfo', JSON.stringify(data.dados || {}));

        localStorage.removeItem('emailVerificacaoPendente');
        localStorage.removeItem('codigoMockPendente');

        navigate('/dashboard');
        return;
      }

      setMensagem({
        tipo: 'erro',
        texto: data.mensagem || 'Falha ao validar o código. Tente novamente.'
      });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarCodigo = async () => {
    if (!emailPendente) return;
    if (carregando || cooldownReenvio > 0) return;

    setCarregando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const response = await fetch(`${API_URL}/usuarios/reenviar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailPendente })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const novoCodigo = data?.dados?.codigo || null;
        setCodigoMock(novoCodigo);
        if (novoCodigo) localStorage.setItem('codigoMockPendente', novoCodigo);
        setCooldownReenvio(30);
        setMensagem({ tipo: 'sucesso', texto: 'Código reenviado com sucesso!' });
      } else {
        setMensagem({
          tipo: 'erro',
          texto: data.mensagem || 'Falha ao reenviar o código.'
        });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="verificar-container">
      <div className="verificar-card">
        <h1>Verifique seu email</h1>
        <p className="verificar-subtitle">
          Enviamos um código de validação para <strong>{emailPendente}</strong>.
        </p>

        {codigoMock && (
          <div className="verificar-mock-code">
            Código para teste (mock): <strong>{codigoMock}</strong>
          </div>
        )}

        <div className="verificar-input-group">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Digite o código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            disabled={carregando}
          />
        </div>

        <button
          className="verificar-button"
          onClick={handleValidarCodigo}
          disabled={carregando}
        >
          {carregando ? 'Validando...' : 'Validar código'}
        </button>

        {mensagem.texto && (
          <div className={`verificar-mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="verificar-resend">
          <span className="verificar-resend-text">
            Não recebeu o código?
          </span>
          <button
            className="verificar-resend-btn"
            onClick={handleReenviarCodigo}
            disabled={carregando || cooldownReenvio > 0}
            type="button"
          >
            {cooldownReenvio > 0 ? `Reenviar em ${cooldownReenvio}s` : 'Reenviar código'}
          </button>
        </div>
      </div>
    </div>
  );
}

