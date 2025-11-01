import React, { useState, useEffect } from 'react';
import './Perfil.css';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaSave,
  FaArrowLeft,
  FaCamera,
} from 'react-icons/fa';

export default function Perfil() {
  const [usuario, setUsuario] = useState({
    id: null,
    nome: '',
    email: '',
    data_nascimento: '',
    foto_perfil: null
  });
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    data_nascimento: ''
  });
  const [senhaData, setSenhaData] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [salvando, setSalvando] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        navigate('/');
        return;
      }

      const user = JSON.parse(userInfo);
      const userId = user.id;

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/usuarios/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.dados) {
          setUsuario(data.dados);
          setFormData({
            nome: data.dados.nome || '',
            email: data.dados.email || '',
            data_nascimento: data.dados.data_nascimento || ''
          });
          // Se houver foto, criar URL completa
          if (data.dados.foto_perfil) {
            const fotoUrl = data.dados.foto_perfil.startsWith('http') 
              ? data.dados.foto_perfil 
              : `http://localhost:5000${data.dados.foto_perfil}`;
            setFotoPreview(fotoUrl);
          }
        }
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao carregar dados do usuário.' });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setSenhaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalvarDados = async () => {
    if (!formData.nome.trim() || !formData.email.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Nome e email são obrigatórios.' });
      return;
    }

    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setUsuario(prev => ({
          ...prev,
          ...formData
        }));
        
        // Atualizar localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        userInfo.nome = formData.nome;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        setMensagem({ tipo: 'sucesso', texto: data.mensagem || 'Dados atualizados com sucesso!' });
        setEditando(false);
      } else {
        setMensagem({ tipo: 'erro', texto: data.mensagem || 'Erro ao atualizar dados.' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (!senhaData.senha_atual || !senhaData.nova_senha || !senhaData.confirmar_senha) {
      setMensagem({ tipo: 'erro', texto: 'Todos os campos são obrigatórios.' });
      return;
    }

    if (senhaData.nova_senha.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    if (senhaData.nova_senha !== senhaData.confirmar_senha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem.' });
      return;
    }

    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/usuarios/${usuario.id}/senha`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senha_atual: senhaData.senha_atual,
          nova_senha: senhaData.nova_senha
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem({ tipo: 'sucesso', texto: data.mensagem || 'Senha alterada com sucesso!' });
        setSenhaData({
          senha_atual: '',
          nova_senha: '',
          confirmar_senha: ''
        });
        setAlterandoSenha(false);
      } else {
        setMensagem({ tipo: 'erro', texto: data.mensagem || 'Erro ao alterar senha.' });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    } finally {
      setSalvando(false);
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, selecione uma imagem válida.' });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMensagem({ tipo: 'erro', texto: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFotoPreview(base64String);
      fazerUploadFoto(base64String);
    };
    reader.readAsDataURL(file);
  };

  const fazerUploadFoto = async (fotoBase64) => {
    setSalvandoFoto(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/usuarios/${usuario.id}/foto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          foto_base64: fotoBase64
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar URL da foto no estado
        if (data.dados && data.dados.foto_perfil) {
          const fotoUrl = data.dados.foto_perfil.startsWith('http')
            ? data.dados.foto_perfil
            : `http://localhost:5000${data.dados.foto_perfil}`;
          setUsuario(prev => ({ ...prev, foto_perfil: fotoUrl }));
          setFotoPreview(fotoUrl);
        }
        setMensagem({ tipo: 'sucesso', texto: data.mensagem || 'Foto de perfil atualizada com sucesso!' });
      } else {
        setMensagem({ tipo: 'erro', texto: data.mensagem || 'Erro ao atualizar foto de perfil.' });
        setFotoPreview(null);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
      setFotoPreview(null);
    } finally {
      setSalvandoFoto(false);
    }
  };

  const handleRemoverFoto = async () => {
    if (!window.confirm('Deseja realmente remover sua foto de perfil?')) {
      return;
    }

    setSalvandoFoto(true);
    try {
      // Enviar string vazia para remover foto
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/usuarios/${usuario.id}/foto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          foto_base64: ''
        })
      });

      if (response.ok) {
        setUsuario(prev => ({ ...prev, foto_perfil: null }));
        setFotoPreview(null);
        setMensagem({ tipo: 'sucesso', texto: 'Foto de perfil removida com sucesso!' });
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao remover foto de perfil.' });
    } finally {
      setSalvandoFoto(false);
    }
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dados do perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-content">
        <div className="perfil-header">
          <button 
            className="btn-voltar"
            onClick={() => navigate('/dashboard')}
            title="Voltar ao Dashboard"
          >
            <FaArrowLeft /> <span className="btn-voltar-texto">Voltar</span>
          </button>
          <div className="avatar-container">
            <div className="avatar-circle">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto de perfil" className="avatar-image" />
              ) : (
                <FaUser />
              )}
              {salvandoFoto && <div className="avatar-loading">Carregando...</div>}
            </div>
            <div className="avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                style={{ display: 'none' }}
                disabled={salvandoFoto}
              />
              <button
                className="btn-foto"
                onClick={() => fileInputRef.current?.click()}
                disabled={salvandoFoto}
                title="Alterar foto de perfil"
              >
                <FaCamera /> {fotoPreview ? 'Alterar Foto' : 'Adicionar Foto'}
              </button>
              {fotoPreview && (
                <button
                  className="btn-remover-foto"
                  onClick={handleRemoverFoto}
                  disabled={salvandoFoto}
                  title="Remover foto de perfil"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
          <h1>Meu Perfil</h1>
          <p className="perfil-subtitle">Gerencie suas informações pessoais</p>
        </div>

        {mensagem.texto && (
          <div className={`mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="perfil-sections">
          {/* Seção de Informações Pessoais */}
          <section className="perfil-section">
            <div className="section-header">
              <h2>Informações Pessoais</h2>
              {!editando ? (
                <button 
                  className="btn-edit"
                  onClick={() => setEditando(true)}
                >
                  Editar
                </button>
              ) : (
                <div className="section-actions">
                  <button 
                    className="btn-cancel"
                    onClick={() => {
                      setEditando(false);
                      setFormData({
                        nome: usuario.nome || '',
                        email: usuario.email || '',
                        data_nascimento: usuario.data_nascimento || ''
                      });
                      setMensagem({ tipo: '', texto: '' });
                    }}
                    disabled={salvando}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-save"
                    onClick={handleSalvarDados}
                    disabled={salvando}
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                    {!salvando && <FaSave />}
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaUser className="input-icon" />
                Nome Completo
              </label>
              {editando ? (
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  disabled={salvando}
                />
              ) : (
                <div className="info-value">{usuario.nome || 'Não informado'}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" />
                Email
              </label>
              {editando ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  disabled={salvando}
                />
              ) : (
                <div className="info-value">{usuario.email || 'Não informado'}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaCalendarAlt className="input-icon" />
                Data de Nascimento
              </label>
              {editando ? (
                <input
                  type="date"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleInputChange}
                  disabled={salvando}
                />
              ) : (
                <div className="info-value">
                  {usuario.data_nascimento 
                    ? new Date(usuario.data_nascimento).toLocaleDateString('pt-BR')
                    : 'Não informado'}
                  {usuario.data_nascimento && (
                    <span className="idade">({calcularIdade(usuario.data_nascimento)} anos)</span>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Seção de Alterar Senha */}
          <section className="perfil-section">
            <div className="section-header">
              <h2>Segurança</h2>
              {!alterandoSenha ? (
                <button 
                  className="btn-edit"
                  onClick={() => {
                    setAlterandoSenha(true);
                    setSenhaData({
                      senha_atual: '',
                      nova_senha: '',
                      confirmar_senha: ''
                    });
                    setMensagem({ tipo: '', texto: '' });
                  }}
                >
                  Alterar Senha
                </button>
              ) : (
                <div className="section-actions">
                  <button 
                    className="btn-cancel"
                    onClick={() => {
                      setAlterandoSenha(false);
                      setSenhaData({
                        senha_atual: '',
                        nova_senha: '',
                        confirmar_senha: ''
                      });
                      setMensagem({ tipo: '', texto: '' });
                    }}
                    disabled={salvando}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {alterandoSenha ? (
              <>
                <div className="form-group">
                  <label>Senha Atual</label>
                  <input
                    type="password"
                    name="senha_atual"
                    value={senhaData.senha_atual}
                    onChange={handleSenhaChange}
                    placeholder="Digite sua senha atual"
                    disabled={salvando}
                  />
                </div>

                <div className="form-group">
                  <label>Nova Senha</label>
                  <input
                    type="password"
                    name="nova_senha"
                    value={senhaData.nova_senha}
                    onChange={handleSenhaChange}
                    placeholder="Mínimo de 6 caracteres"
                    disabled={salvando}
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input
                    type="password"
                    name="confirmar_senha"
                    value={senhaData.confirmar_senha}
                    onChange={handleSenhaChange}
                    placeholder="Confirme sua nova senha"
                    disabled={salvando}
                  />
                </div>

                <button 
                  className="btn-save full-width"
                  onClick={handleAlterarSenha}
                  disabled={salvando}
                >
                  {salvando ? 'Alterando...' : 'Alterar Senha'}
                  {!salvando && <FaSave />}
                </button>
              </>
            ) : (
              <div className="info-value">
                ********
                <span className="info-hint">Clique em "Alterar Senha" para modificar</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

