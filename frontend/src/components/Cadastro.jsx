import React, { useState } from 'react';
import './Cadastro.css';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');

  const handleCadastro = async () => {
    try {
      const response = await fetch('http://localhost:5000/usuarios/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, data_nascimento: dataNascimento, senha }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        // redirecionar para login
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor');
    }
  };

  return (
  <>
    <div className="logoFixed">
      <img src="/LOGO_RLW.png" alt="Logo RLW" className="logo" />
    </div>
    
    <div className="cadastroContainer">
      <h1>Crie sua conta</h1>
      <div className="inputs">
      <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="date" placeholder="Data de nascimento" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
      <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
      </div>
      <button onClick={handleCadastro}>Cadastrar</button>
    </div>
  </>
  );
}
