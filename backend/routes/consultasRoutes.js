const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==========================================
// 1. LISTAR CONSULTAS (Por cliente ou todas para admin)
// ==========================================
router.get('/', async (req, res) => {
  const { id_utilizador } = req.query;

  try {
    let query = `
      SELECT c.id_consulta, c.data, c.hora, c.data_hora, c.motivo, c.observacoes, c.estado,
             a.nome AS animal_nome, a.especie, a.raca, a.sexo,
             u.nome AS tutor_nome, COALESCE(u.email, u.mail) AS tutor_email,
             p.id_pagamento, p.id_fatura, p.valor, p.metodo_pagamento, p.estado_pagamento
      FROM consulta c
      JOIN animal a ON c.id_animal = a.id_animal
      JOIN cliente cl ON a.id_cliente = cl.id_cliente
      JOIN utilizador u ON cl.id_utilizador = u.id_utilizador
      LEFT JOIN pagamento p ON c.id_consulta = p.id_consulta
    `;
    const params = [];

    if (id_utilizador) {
      query += ` WHERE u.id_utilizador = $1`;
      params.push(id_utilizador);
    }

    query += ` ORDER BY c.data_hora DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar consultas:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. MARCAR NOVA CONSULTA + FATURA + PAGAMENTO
// ==========================================
router.post('/', async (req, res) => {
  const {
    id_utilizador,
    animalNome,
    especie,
    raca,
    sexo,
    dataHora,
    motivo,
    observacoes,
    valor,
    metodoPagamento
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obter id_cliente a partir do id_utilizador
    const clienteRes = await client.query(
      'SELECT id_cliente FROM cliente WHERE id_utilizador = $1',
      [id_utilizador]
    );
    if (clienteRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cliente não encontrado na base de dados.' });
    }
    const idCliente = clienteRes.rows[0].id_cliente;

    // 2. Verificar se o animal já existe para este cliente; se não existir, cria-o
    let animalRes = await client.query(
      'SELECT id_animal FROM animal WHERE id_cliente = $1 AND LOWER(nome) = LOWER($2)',
      [idCliente, animalNome]
    );

    let idAnimal;
    if (animalRes.rows.length > 0) {
      idAnimal = animalRes.rows[0].id_animal;
    } else {
      const novoAnimal = await client.query(
        `INSERT INTO animal (id_cliente, nome, especie, raca, sexo, estado_adocao)
         VALUES ($1, $2, $3, $4, $5, 'Não aplicável')
         RETURNING id_animal`,
        [
          idCliente,
          animalNome,
          especie || 'Cão',
          raca || 'Sem raça definida',
          sexo || null
        ]
      );
      idAnimal = novoAnimal.rows[0].id_animal;
    }

    const [dataParte, horaParte] = dataHora.split(' ');
    const valorFinal = valor || 25.00;

    // 3. Criar a consulta com estado 'Agendada' (aguarda confirmação do admin)
    const consultaRes = await client.query(
      `INSERT INTO consulta (id_animal, data, hora, data_hora, motivo, observacoes, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'Agendada')
       RETURNING id_consulta, data_hora, motivo, estado`,
      [
        idAnimal,
        dataParte,
        horaParte,
        dataHora,
        motivo,
        observacoes || 'Consulta marcada através do site'
      ]
    );
    const novaConsulta = consultaRes.rows[0];

    // 4. Emitir a fatura sempre
    const faturaRes = await client.query(
      `INSERT INTO fatura (data, valor_total, id_consulta)
       VALUES (CURRENT_DATE, $1, $2)
       RETURNING id_fatura`,
      [valorFinal, novaConsulta.id_consulta]
    );
    const idFatura = faturaRes.rows[0].id_fatura;

    // 5. Registar o pagamento associado à consulta e à fatura
    const estadoPag = metodoPagamento === 'Na Clínica' ? 'Pendente' : 'Pago';
    await client.query(
      `INSERT INTO pagamento (id_consulta, id_fatura, valor, metodo_pagamento, estado_pagamento, data_pagamento)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [novaConsulta.id_consulta, idFatura, valorFinal, metodoPagamento || 'Na Clínica', estadoPag]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id_consulta: novaConsulta.id_consulta,
      id_fatura: idFatura,
      mensagem: 'Consulta agendada, fatura emitida e pagamento registado!'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao marcar consulta:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ==========================================
// 3. CONFIRMAR OU CANCELAR CONSULTA (+ REEMBOLSO AUTOMÁTICO)
// ==========================================
router.patch('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE consulta SET estado = $1 WHERE id_consulta = $2',
      [estado, id]
    );

    if (estado === 'Cancelada') {
      await client.query(
        `UPDATE pagamento
         SET estado_pagamento = 'Reembolsado'
         WHERE id_consulta = $1 AND estado_pagamento = 'Pago'`,
        [id]
      );
    }

    await client.query('COMMIT');
    res.json({
      mensagem: estado === 'Cancelada'
        ? 'Consulta cancelada e pagamento marcado como reembolsado.'
        : 'Estado da consulta atualizado.'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar consulta:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;