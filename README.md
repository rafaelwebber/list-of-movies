# 🎬 List of Movies

<div align="center">
  <h3>Seu catálogo pessoal de filmes favoritos</h3>
  <p>Aplicação web completa para gerenciar sua coleção de filmes com interface moderna e intuitiva</p>
</div>

---

## 📋 Sobre o Projeto

O **List of Movies** é uma aplicação web full-stack desenvolvida para permitir que usuários gerenciem sua coleção pessoal de filmes. Com uma interface moderna e responsiva, os usuários podem cadastrar filmes, avaliá-los, visualizar estatísticas e muito mais.

### 🎯 Objetivo

Criar uma plataforma completa onde usuários possam:
- Organizar sua coleção pessoal de filmes
- Buscar e adicionar filmes através da integração com a API do TMDB
- Avaliar filmes assistidos com sistema de notas
- Visualizar estatísticas sobre seus filmes
- Gerenciar seu perfil e dados pessoais

---

## ✨ Funcionalidades

### 🔐 Autenticação
- **Login**: Sistema de autenticação seguro com validação de credenciais
- **Cadastro**: Criação de conta com validação de dados
- **Proteção de Rotas**: Navegação protegida que requer autenticação

### 📊 Dashboard
- **Estatísticas em Tempo Real**: 
  - Total de filmes na coleção
  - Quantidade de filmes assistidos
  - Nota média dos filmes avaliados
- **Navegação Rápida**: Cards interativos para acesso rápido a todas as funcionalidades
- **Design Moderno**: Interface com gradientes, animações e efeitos visuais

### 🎥 Gerenciamento de Filmes
- **Visualizar Coleção**: Lista completa dos filmes do usuário
- **Adicionar Filmes**: Busca e adição de filmes através da API do TMDB
- **Buscar Filmes**: Pesquisa avançada de filmes na base de dados do TMDB
- **Avaliar Filmes**: Sistema de avaliação com notas de 1 a 5 estrelas
- **Vincular Filmes**: Associar filmes à conta do usuário

### 📈 Estatísticas
- Análise da coleção pessoal
- Visualização de dados agregados sobre os filmes
- Métricas de avaliação

### 👤 Perfil do Usuário
- **Visualizar Dados**: Consulta de informações pessoais
- **Editar Perfil**: Atualização de nome, email e data de nascimento
- **Alterar Senha**: Sistema seguro para mudança de senha com validação
- **Cálculo de Idade**: Exibição automática da idade baseada na data de nascimento

### 🎨 Interface
- **Design Responsivo**: Adaptável a dispositivos móveis, tablets e desktops
- **Animações Suaves**: Transições e efeitos visuais modernos
- **Tema Personalizado**: Sistema de temas (claro/escuro)
- **Recomendações**: Sugestões de filmes baseadas nas preferências

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** (v19.1.1) - Biblioteca JavaScript para construção de interfaces
- **React Router DOM** (v7.8.2) - Roteamento e navegação entre páginas
- **React Icons** (v5.5.0) - Biblioteca de ícones
- **CSS3** - Estilização moderna com animações e gradientes
- **JavaScript (ES6+)** - Lógica e interatividade do frontend
- **Fetch API** - Comunicação HTTP com o backend

### Backend
- **Python 3** - Linguagem de programação
- **Flask** - Framework web para criação da API REST
- **Flask-CORS** - Middleware para permitir requisições cross-origin
- **MySQL** - Banco de dados relacional
- **mysql-connector-python** - Conector para MySQL
- **bcrypt** - Criptografia de senhas
- **python-dotenv** - Gerenciamento de variáveis de ambiente
- **requests** - Cliente HTTP para integração com APIs externas

### Integrações
- **TMDB API** - The Movie Database API para busca e dados de filmes
- **JWT** (futuro) - Autenticação baseada em tokens

### Ferramentas e Bibliotecas
- **Git** - Controle de versão
- **Node.js & npm** - Gerenciamento de pacotes do frontend
- **Create React App** - Ferramenta de construção do projeto React

---

## 📁 Estrutura do Projeto

```
filmes/
│
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── Login.jsx
│   │   │   ├── Cadastro.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Perfil.jsx
│   │   │   ├── MeusFilmes.jsx
│   │   │   ├── AdicionarFilme.jsx
│   │   │   ├── BuscarFilmes.jsx
│   │   │   ├── Estatisticas.jsx
│   │   │   ├── Recomendacoes.jsx
│   │   │   └── Tema.jsx
│   │   ├── App.jsx          # Componente principal
│   │   └── index.js         # Entry point
│   ├── public/              # Arquivos públicos
│   └── package.json         # Dependências do frontend
│
├── backend/                 # API Flask
│   ├── controllers/         # Lógica de negócio
│   │   ├── usuario_controller.py
│   │   └── filmes_controller.py
│   ├── models/             # Modelos e banco de dados
│   │   ├── database.py
│   │   ├── banco.sql
│   │   └── resposta_padrao.py
│   ├── routes/             # Rotas da API
│   │   ├── usuario_routes.py
│   │   └── filmes_routes.py
│   ├── services/           # Serviços externos
│   │   └── tmdb_api.py
│   └── main.py             # Entry point da aplicação
│
└── README.md               # Este arquivo
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Node.js** (v14 ou superior)
- **Python** (v3.8 ou superior)
- **MySQL** (v8.0 ou superior)
- **Git**

### Instalação do Backend

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Instale as dependências Python:
```bash
pip install flask flask-cors mysql-connector-python bcrypt python-dotenv requests
```

3. Configure as variáveis de ambiente no arquivo `.env/.env`:
```
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
TMDB_API_KEY=sua_chave_api_tmdb
```

4. Execute o script SQL (`models/banco.sql`) no MySQL para criar as tabelas

5. Inicie o servidor Flask:
```bash
python main.py
```

O backend estará rodando em `http://localhost:5000`

### Instalação do Frontend

1. Navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

O frontend estará rodando em `http://localhost:3000`

---

## 📡 Endpoints da API

### Usuários
- `POST /usuarios/cadastro` - Criar nova conta
- `POST /usuarios/login` - Autenticar usuário
- `GET /usuarios/<id>` - Buscar dados do usuário
- `PUT /usuarios/<id>` - Atualizar dados do usuário
- `PUT /usuarios/<id>/senha` - Alterar senha

### Filmes
- `GET /filmes` - Listar todos os filmes
- `POST /filmes` - Adicionar novo filme (via TMDB)
- `GET /filmes/usuario/<id>/filmes` - Listar filmes do usuário
- `POST /filmes/vincular` - Vincular filme ao usuário
- `POST /filmes/avaliar` - Avaliar filme (nota 1-5)

---

## 🎨 Características da Interface

- **Design Moderno**: Gradientes, glassmorphism e animações suaves
- **Responsivo**: Adaptável a todos os tamanhos de tela
- **UX Intuitiva**: Navegação clara e fácil de usar
- **Feedback Visual**: Mensagens de sucesso/erro e estados de loading
- **Acessibilidade**: Estrutura semântica e navegação por teclado

---

## 🔒 Segurança

- Senhas criptografadas com **bcrypt**
- Validação de dados no backend
- Proteção contra SQL Injection
- Autenticação de rotas protegidas
- Sanitização de inputs

---

## 📝 Banco de Dados

### Tabelas Principais

- **usuario**: Armazena dados dos usuários (id, nome, email, senha, data_nascimento)
- **filmes**: Armazena informações dos filmes (id, titulo, genero, ano, imagem_url)
- **usuario_filme**: Tabela de relacionamento com avaliações (usuario_id, filme_id, nota)

---

## 🔮 Funcionalidades Futuras

- [ ] Sistema de recomendações inteligente baseado em IA
- [ ] Compartilhamento de listas de filmes
- [ ] Comentários e reviews detalhadas
- [ ] Sistema de tags e categorias personalizadas
- [ ] Exportação de dados (PDF, CSV)
- [ ] Integração com streaming services
- [ ] Modo offline
- [ ] Notificações de novos lançamentos

---

## 👥 Desenvolvimento

Este projeto foi desenvolvido como uma aplicação full-stack completa, demonstrando:
- Integração entre frontend e backend
- Consumo de APIs externas (TMDB)
- Gerenciamento de estado e autenticação
- Design responsivo e moderno
- Boas práticas de desenvolvimento

---

## 📄 Licença

Este projeto é de código aberto e está disponível para fins educacionais.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

<div align="center">
  <p>Desenvolvido com ❤️ para amantes de cinema</p>
</div>
