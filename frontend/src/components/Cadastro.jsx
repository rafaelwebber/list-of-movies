import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import './Cadastro.css';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const passos = useMemo(() => {
    const okNome = nome.trim().length >= 2;
    const okEmail = /\S+@\S+\.\S+/.test(email);
    const okData = !!dataNascimento;
    const okSenha = senha.trim().length >= 4;

    return [
      { key: 'nome', label: 'Nome', ok: okNome },
      { key: 'email', label: 'Email', ok: okEmail },
      { key: 'data', label: 'Nascimento', ok: okData },
      { key: 'senha', label: 'Senha', ok: okSenha }
    ];
  }, [nome, email, dataNascimento, senha]);

  const passoAtivoIndex = useMemo(() => {
    const idx = passos.findIndex((p) => !p.ok);
    return idx === -1 ? passos.length - 1 : Math.max(0, idx);
  }, [passos]);

  const handleCadastro = async () => {
    if (!nome || !email || !dataNascimento || !senha) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos.' });
      return;
    }

    setCarregando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const response = await fetch(`${API_URL}/usuarios/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, data_nascimento: dataNascimento, senha }),
      });

      const data = await response.json();
      if (response.ok) {
        // Mock: o backend retorna um código para validação.
        const codigoMock = data?.dados?.codigo || null;

        localStorage.setItem('emailVerificacaoPendente', email);
        if (codigoMock) localStorage.setItem('codigoMockPendente', codigoMock);

        setMensagem({ tipo: '', texto: '' });
        navigate('/verificar-email', { state: { codigo: codigoMock } });
      } else {
        setMensagem({
          tipo: 'erro',
          texto: data.mensagem || data.message || 'Não foi possível cadastrar'
        });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao conectar com o servidor' });
    } finally {
      setCarregando(false);
    }
  };

  return (
  <>
      <div className="cadastro-shell">
        <div className="cadastro-orb orb-a" />
        <div className="cadastro-orb orb-b" />
        <div className="cadastro-orb orb-c" />

        <div className="logoFixed">
          <img src="/LOGO_RLW.png" alt="Logo RLW" className="logo" />
        </div>

        <div className="cadastro-layout">
          <aside className="cadastro-side">
            <h2 className="cadastro-side-title">Crie sua conta</h2>
            <div className="cadastro-steps">
              {passos.map((p, idx) => (
                <div
                  key={p.key}
                  className={`cadastro-step ${p.ok ? 'ok' : ''} ${idx === passoAtivoIndex ? 'active' : ''}`}
                >
                  <div className="cadastro-step-number">{idx + 1}</div>
                  <div className="cadastro-step-label">{p.label}</div>
                </div>
              ))}
            </div>

            <div className="cadastro-side-tip">
              {passos[passoAtivoIndex]?.label ? (
                <>
                  Agora: <strong>{passos[passoAtivoIndex].label}</strong>
                </>
              ) : null}
            </div>
          </aside>

          <div className="cadastroContainer">
            <div className="cadastro-progress">
              <div
                className="cadastro-progress-bar"
                style={{ width: `${((passoAtivoIndex + 1) / passos.length) * 100}%` }}
              />
            </div>

            <div className="cadastro-h1-wrap">
              <h1>Vamos começar</h1>
              <p className="cadastro-subtitle">Leva só alguns segundos</p>
            </div>

            <div className="inputs">
              <input
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="date"
                placeholder="Data de nascimento"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <button onClick={handleCadastro} disabled={carregando}>
              {carregando ? 'Cadastrando...' : 'Cadastrar'}
            </button>

            <p className="login-prompt">
              Já tem conta? <Link to="/">Fazer login</Link>
            </p>

            {mensagem.texto && (
              <div className={`cadastro-mensagem erro`} style={{ marginTop: 14 }}>
                {mensagem.texto}
              </div>
            )}
          </div>
        </div>
      </div>
  </>
  );
}
