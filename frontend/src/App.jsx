import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Dashboard from './components/Dashboard';
import MeusFilmes from './components/MeusFilmes';
import AdicionarFilme from './components/AdicionarFilme';
import Perfil from './components/Perfil';
import Estatisticas from './components/Estatisticas';
import BuscarFilmes from './components/BuscarFilmes';
import Recomendacoes from './components/Recomendacoes';
import Tema from './components/Tema';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/filmes" element={<MeusFilmes />} />
        <Route path="/dashboard/adicionar" element={<AdicionarFilme />} />
        <Route path="/dashboard/perfil" element={<Perfil />} />
        <Route path="/dashboard/estatisticas" element={<Estatisticas />} />
        <Route path="/dashboard/buscar" element={<BuscarFilmes />} />
        <Route path="/dashboard/recomendacoes" element={<Recomendacoes />} />
        <Route path="/dashboard/tema" element={<Tema />} />
      </Routes>
    </BrowserRouter>
  );
}
