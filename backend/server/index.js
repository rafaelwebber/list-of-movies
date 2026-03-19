require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuração MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'catalago',
  waitForConnections: true,
  connectionLimit: 10,
};

let pool;

async function initDb() {
  const dbName = dbConfig.database;
  const configSemDb = { ...dbConfig };
  delete configSemDb.database;

  const connInicial = await mysql.createConnection(configSemDb);
  await connInicial.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connInicial.end();

  pool = mysql.createPool(dbConfig);

  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        data_nascimento DATE,
        foto_perfil VARCHAR(500),
        tema VARCHAR(20) DEFAULT 'claro',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS filmes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        ano VARCHAR(10),
        genero VARCHAR(255),
        imagem_url VARCHAR(500),
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_titulo (titulo)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuario_filme (
        usuario_id INT NOT NULL,
        filme_id INT NOT NULL,
        nota DECIMAL(2,1),
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (usuario_id, filme_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE
      )
    `);

  } finally {
    connection.release();
  }
}

// Helpers
const hashSenha = (senha) => crypto.createHash('sha256').update(senha).digest('hex');
const gerarToken = () => crypto.randomBytes(32).toString('hex');
const resPadrao = (res, dados, mensagem = 'OK', status = 200) => {
  res.status(status).json({ sucesso: status >= 200 && status < 300, dados, mensagem });
};

const authOptional = (req, res, next) => {
  const auth = req.headers.authorization;
  req.token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;
  next();
};

// ========== USUÁRIOS ==========

app.post('/usuarios/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ sucesso: false, mensagem: 'Email e senha obrigatórios' });
    }

    const senhaHash = hashSenha(senha);
    const [rows] = await pool.query(
      'SELECT id, nome, email, data_nascimento, foto_perfil, tema FROM usuarios WHERE email = ? AND senha_hash = ?',
      [email, senhaHash]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas' });
    }

    const token = gerarToken();
    resPadrao(res, {
      id: user.id,
      nome: user.nome,
      email: user.email,
      data_nascimento: user.data_nascimento ? user.data_nascimento.toISOString().split('T')[0] : null,
      foto_perfil: user.foto_perfil,
      tema: user.tema,
      token
    });
  } catch (err) {
    console.error('Erro login:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.post('/usuarios/cadastro', async (req, res) => {
  try {
    const { nome, email, data_nascimento, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome, email e senha são obrigatórios' });
    }
    if (senha.length < 4) {
      return res.status(400).json({ sucesso: false, mensagem: 'Senha deve ter no mínimo 4 caracteres' });
    }

    const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(409).json({ sucesso: false, mensagem: 'Email já cadastrado' });
    }

    const senhaHash = hashSenha(senha);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, data_nascimento) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, data_nascimento || null]
    );

    resPadrao(res, { id: result.insertId }, 'Cadastro realizado com sucesso');
  } catch (err) {
    console.error('Erro cadastro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.get('/usuarios/:id', authOptional, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, email, data_nascimento, foto_perfil, tema FROM usuarios WHERE id = ?',
      [req.params.id]
    );

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    const dados = {
      ...user,
      data_nascimento: user.data_nascimento ? user.data_nascimento.toISOString().split('T')[0] : null
    };
    resPadrao(res, dados);
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.put('/usuarios/:id', authOptional, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, data_nascimento } = req.body;

    const [existente] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    if (email) {
      const [outro] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
      if (outro.length > 0) {
        return res.status(409).json({ sucesso: false, mensagem: 'Email já em uso' });
      }
    }

    await pool.query(
      'UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email), data_nascimento = COALESCE(?, data_nascimento) WHERE id = ?',
      [nome || null, email || null, data_nascimento || null, id]
    );

    resPadrao(res, null, 'Dados atualizados com sucesso');
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.put('/usuarios/:id/senha', authOptional, async (req, res) => {
  try {
    const { id } = req.params;
    const { senha_atual, nova_senha } = req.body;

    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ sucesso: false, mensagem: 'Senha atual e nova senha obrigatórias' });
    }

    const [rows] = await pool.query('SELECT senha_hash FROM usuarios WHERE id = ?', [id]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    const hashAtual = hashSenha(senha_atual);
    if (hashAtual !== user.senha_hash) {
      return res.status(401).json({ sucesso: false, mensagem: 'Senha atual incorreta' });
    }

    await pool.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [hashSenha(nova_senha), id]);
    resPadrao(res, null, 'Senha alterada com sucesso');
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.put('/usuarios/:id/foto', authOptional, async (req, res) => {
  try {
    const { id } = req.params;
    const { foto_base64 } = req.body || {};

    const [existente] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    const fotoUrl = foto_base64 ? `/uploads/perfil_${id}.jpg` : null;
    await pool.query('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [fotoUrl, id]);
    resPadrao(res, { foto_perfil: fotoUrl }, 'Foto atualizada');
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.put('/usuarios/:id/tema', authOptional, async (req, res) => {
  try {
    const { id } = req.params;
    const { tema } = req.body || {};

    if (!['claro', 'escuro'].includes(tema)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Tema inválido' });
    }

    await pool.query('UPDATE usuarios SET tema = ? WHERE id = ?', [tema, id]);
    resPadrao(res, { tema }, 'Tema atualizado');
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

// ========== FILMES ==========

app.get('/filmes/buscar', authOptional, async (req, res) => {
  const { q } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  if (!q || !q.trim()) {
    return res.status(400).json({ sucesso: false, mensagem: 'Termo de busca obrigatório' });
  }

  if (!apiKey) {
    return res.status(502).json({ sucesso: false, mensagem: 'TMDB_API_KEY não configurada' });
  }

  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=pt-BR`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ sucesso: false, mensagem: 'Erro ao buscar no TMDB' });
    }

    const resultados = (data.results || []).slice(0, 20);
    resPadrao(res, resultados);
  } catch (err) {
    console.error('Erro TMDB:', err);
    res.status(502).json({ sucesso: false, mensagem: 'Erro ao buscar filmes' });
  }
});

app.post('/filmes', authOptional, async (req, res) => {
  try {
    const { titulo, ano, genero, imagem_url } = req.body || {};

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ sucesso: false, mensagem: 'Título obrigatório' });
    }

    const [existente] = await pool.query('SELECT id FROM filmes WHERE titulo = ?', [titulo.trim()]);

    if (existente.length > 0) {
      return res.status(409).json({
        sucesso: false,
        status: 409,
        dados: { filme_id: existente[0].id },
        mensagem: 'Filme já existe'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO filmes (titulo, ano, genero, imagem_url) VALUES (?, ?, ?, ?)',
      [titulo.trim(), ano || null, genero || null, imagem_url || null]
    );

    resPadrao(res, { filme_id: result.insertId });
  } catch (err) {
    console.error('Erro adicionar filme:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.post('/filmes/vincular', authOptional, async (req, res) => {
  try {
    const { filme_id, usuario_id } = req.body || {};

    if (!filme_id || !usuario_id) {
      return res.status(400).json({ sucesso: false, mensagem: 'filme_id e usuario_id obrigatórios' });
    }

    const [existente] = await pool.query(
      'SELECT 1 FROM usuario_filme WHERE usuario_id = ? AND filme_id = ?',
      [usuario_id, filme_id]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        sucesso: false,
        status_http: 409,
        mensagem: 'Filme já está na sua lista'
      });
    }

    await pool.query('INSERT INTO usuario_filme (usuario_id, filme_id) VALUES (?, ?)', [usuario_id, filme_id]);
    resPadrao(res, null, 'Filme adicionado à lista');
  } catch (err) {
    console.error('Erro vincular:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.get('/filmes/usuario/:userId/filmes', authOptional, async (req, res) => {
  try {
    const { userId } = req.params;

    const [filmes] = await pool.query(`
      SELECT f.id, f.titulo, f.ano, f.genero, f.imagem_url, uf.nota
      FROM filmes f
      INNER JOIN usuario_filme uf ON uf.filme_id = f.id
      WHERE uf.usuario_id = ?
      ORDER BY uf.criado_em DESC
    `, [userId]);

    resPadrao(res, filmes);
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.post('/filmes/avaliar', authOptional, async (req, res) => {
  try {
    const { filme_id, usuario_id, nota } = req.body || {};

    if (!filme_id || !usuario_id) {
      return res.status(400).json({ sucesso: false, mensagem: 'filme_id e usuario_id obrigatórios' });
    }

    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nota deve ser entre 1 e 5' });
    }

    const [result] = await pool.query(
      'UPDATE usuario_filme SET nota = ? WHERE usuario_id = ? AND filme_id = ?',
      [notaNum, usuario_id, filme_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Vínculo não encontrado' });
    }

    resPadrao(res, null, 'Avaliação registrada');
  } catch (err) {
    console.error('Erro avaliar:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.delete('/filmes/usuario/:userId/filmes/:filmeId', authOptional, async (req, res) => {
  try {
    const { userId, filmeId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM usuario_filme WHERE usuario_id = ? AND filme_id = ?',
      [userId, filmeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Filme não encontrado na lista' });
    }

    resPadrao(res, null, 'Filme removido da lista');
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.get('/filmes/recomendacoes', authOptional, async (req, res) => {
  const { usuario_id } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  if (!usuario_id) {
    return res.status(400).json({ sucesso: false, mensagem: 'usuario_id obrigatório' });
  }

  try {
    const [meusFilmes] = await pool.query(`
      SELECT f.genero, f.titulo FROM filmes f
      INNER JOIN usuario_filme uf ON uf.filme_id = f.id
      WHERE uf.usuario_id = ?
    `, [usuario_id]);

    if (!apiKey) {
      return resPadrao(res, []);
    }

    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return resPadrao(res, []);
    }

    const popular = (data.results || []).slice(0, 10);
    const meusTitulos = new Set(meusFilmes.map(f => (f.titulo || '').toLowerCase()));

    const recomendacoes = popular
      .filter(m => !meusTitulos.has((m.title || '').toLowerCase()))
      .map(m => ({
        id: m.id,
        titulo: m.title,
        ano: m.release_date ? m.release_date.split('-')[0] : null,
        imagem_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        motivo: 'Filme popular'
      }));

    resPadrao(res, recomendacoes);
  } catch (err) {
    console.error('Erro recomendações:', err);
    resPadrao(res, []);
  }
});

app.get('/filmes', authOptional, async (req, res) => {
  try {
    const [filmes] = await pool.query(`
      SELECT f.id, f.titulo, f.ano, f.genero, f.imagem_url, uf.nota
      FROM filmes f
      LEFT JOIN usuario_filme uf ON uf.filme_id = f.id
      LIMIT 100
    `);

    resPadrao(res, filmes);
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

// Inicialização
async function start() {
  try {
    await initDb();
    console.log('Banco MySQL conectado e tabelas verificadas.');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      if (!process.env.TMDB_API_KEY) {
        console.log('AVISO: TMDB_API_KEY não configurada. Configure no .env para buscar filmes.');
      }
    });
  } catch (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    console.log('\nVerifique as variáveis no .env:');
    console.log('  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
  }
}

start();
