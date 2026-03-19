# List of Movies

Aplicação web para gerenciar sua coleção pessoal de filmes. Cadastre-se, busque filmes, adicione à sua lista, avalie e acompanhe estatísticas.

## Funcionalidades

- **Login e Cadastro** - Autenticação de usuários
- **Meus Filmes** - Lista de filmes com avaliação e remoção
- **Adicionar Filme** - Busca filmes (TMDB) e adiciona à lista
- **Buscar Filmes** - Descobrir filmes para adicionar
- **Estatísticas** - Análise da sua coleção (notas, anos, gêneros)
- **Recomendações** - Filmes populares sugeridos
- **Perfil** - Editar dados e foto
- **Tema** - Modo claro/escuro

## Como Executar

### 1. Backend

```bash
cd filmes/backend/server
npm install
```

Crie um arquivo `.env` na pasta `backend/server` com:

```
PORT=5000
TMDB_API_KEY=sua_chave_api

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=list_of_movies
```

- **TMDB_API_KEY**: Chave gratuita em [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- **MySQL**: Configure host, usuário, senha e nome do banco. O banco e as tabelas serão criados automaticamente se não existirem.

Inicie o servidor:

```bash
npm start
```

### 2. Frontend

```bash
cd filmes/frontend
npm install
npm start
```

A aplicação abrirá em [http://localhost:3000](http://localhost:3000).

### 3. Imagem de fundo (opcional)

Para o fundo da tela de login, copie a imagem para:
`filmes/frontend/public/imagens/fundo-login.avif`

## Estrutura

```
filmes/
├── backend/server/    # API Node.js + Express + SQLite
│   ├── index.js       # Servidor e rotas
│   └── filmes.db      # Banco (criado automaticamente)
└── frontend/          # React + React Router
    └── src/
        ├── components/
        └── contexts/
```

## Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /usuarios/login | Login |
| POST | /usuarios/cadastro | Cadastro |
| GET | /usuarios/:id | Dados do usuário |
| PUT | /usuarios/:id | Atualizar usuário |
| PUT | /usuarios/:id/senha | Alterar senha |
| PUT | /usuarios/:id/foto | Alterar foto |
| PUT | /usuarios/:id/tema | Alterar tema |
| GET | /filmes/buscar?q= | Buscar filmes (TMDB) |
| POST | /filmes | Adicionar filme |
| POST | /filmes/vincular | Vincular filme ao usuário |
| GET | /filmes/usuario/:id/filmes | Filmes do usuário |
| POST | /filmes/avaliar | Avaliar filme |
| DELETE | /filmes/usuario/:id/filmes/:id | Remover da lista |
| GET | /filmes/recomendacoes | Recomendações |
