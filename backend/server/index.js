const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Validação simples
  if (email === 'rafael@email.com' && password === '1234') {
    res.json({ message: 'Login OK', token: 'abc123' });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

app.listen(5000, () => console.log('Servidor rodando na porta 5000'));
