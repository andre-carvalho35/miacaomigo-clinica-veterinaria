const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==========================================
// REGISTAR NOVO CLIENTE (utilizador + cliente)
// ==========================================
router.post('/register', async (req, res) => {
  const { nome, dataNascimento, nif, telemovel, morada, email, senha } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificar se o email já existe
    const existe = await client.query(
      'SELECT id_utilizador FROM utilizador WHERE email = $1 OR mail = $1',
      [email]
    );
    if (existe.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Este email já está registado.' });
    }

    // 2. Inserir na tabela utilizador com todos os campos preenchidos
    const userRes = await client.query(
      `INSERT INTO utilizador (
         nome, email, mail, numero_telemovel, nacionalidade, profissao,
         password_hash, senha, ativo, tipo_utilizador, ultimo_login
       )
       VALUES ($1, $2, $2, $3, 'Portuguesa', 'Cliente', $4, $4, true, 'Cliente', NOW())
       RETURNING id_utilizador, nome, email`,
      [nome, email, telemovel, senha]
    );
    const novoUser = userRes.rows[0];

    // 3. Inserir na tabela cliente
    await client.query(
      `INSERT INTO cliente (id_utilizador, nome_completo, email, nif, telefone, morada, data_nascimento)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [novoUser.id_utilizador, nome, email, nif, telemovel, morada, dataNascimento]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id: novoUser.id_utilizador,
      nome: novoUser.nome,
      email: novoUser.email,
      dataNascimento,
      nif,
      telemovel,
      morada,
      tipo: 'cliente'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro no registo:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ==========================================
// LOGIN DE CLIENTE
// ==========================================
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query(
      `SELECT u.id_utilizador, u.nome, COALESCE(u.email, u.mail) AS email,
              COALESCE(u.password_hash, u.senha) AS pass,
              c.nif, c.telefone, c.morada, c.data_nascimento
       FROM utilizador u
       LEFT JOIN cliente c ON u.id_utilizador = c.id_utilizador
       WHERE (u.email = $1 OR u.mail = $1) AND u.ativo = true`,
      [email]
    );

    if (result.rows.length === 0 || result.rows[0].pass !== senha) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const user = result.rows[0];

    await pool.query(
      'UPDATE utilizador SET ultimo_login = NOW() WHERE id_utilizador = $1',
      [user.id_utilizador]
    );

    res.json({
      id: user.id_utilizador,
      nome: user.nome,
      email: user.email,
      nif: user.nif || '',
      telemovel: user.telefone || '',
      morada: user.morada || '',
      dataNascimento: user.data_nascimento ? user.data_nascimento.toISOString().split('T')[0] : '',
      tipo: 'cliente'
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;