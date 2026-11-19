const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==========================================
// 1. LISTAR ANIMAIS PARA ADOÇÃO (Disponíveis e Adotados)
// ==========================================
router.get('/adocao/animais', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_animal, nome, especie, raca, idade, sexo, porte, descricao, foto_url, estado_adocao
       FROM animal
       WHERE estado_adocao IN ('Disponível', 'Adotado')
       ORDER BY id_animal ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar animais para adoção:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. SUBMETER PEDIDO DE ADOÇÃO
// ==========================================
router.post('/adocao/pedidos', async (req, res) => {
  const {
    id_utilizador,
    id_animal,
    nome,
    email,
    telefone,
    morada,
    motivo,
    tipoHabitacao,
    outrosAnimais,
    experienciaAnimais
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Bloquear pedido se o animal já tiver sido adotado
    const animalCheck = await client.query(
      'SELECT nome, estado_adocao FROM animal WHERE id_animal = $1',
      [id_animal || 1]
    );
    if (animalCheck.rows.length > 0 && animalCheck.rows[0].estado_adocao === 'Adotado') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `O animal ${animalCheck.rows[0].nome} já foi adotado.` });
    }

    let idCliente = null;

    if (id_utilizador) {
      const clienteRes = await client.query(
        'SELECT id_cliente FROM cliente WHERE id_utilizador = $1',
        [id_utilizador]
      );
      if (clienteRes.rows.length > 0) idCliente = clienteRes.rows[0].id_cliente;
    }

    if (!idCliente && email) {
      const emailRes = await client.query(
        'SELECT id_cliente FROM cliente WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      if (emailRes.rows.length > 0) idCliente = emailRes.rows[0].id_cliente;
    }

    if (!idCliente) {
      const nifTemp = String(Math.floor(200000000 + Math.random() * 700000000));
      const novoCliente = await client.query(
        `INSERT INTO cliente (nome_completo, morada, telefone, email, nif)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_cliente`,
        [
          nome || 'Candidato Adoção',
          morada || 'Morada por definir',
          telefone || '910000000',
          email || `candidato_${Date.now()}@miacaomigo.pt`,
          nifTemp
        ]
      );
      idCliente = novoCliente.rows[0].id_cliente;
    }

    const dupRes = await client.query(
      `SELECT id_pedido FROM pedido_adocao
       WHERE id_cliente = $1 AND id_animal = $2 AND estado = 'Pendente'`,
      [idCliente, id_animal || 1]
    );
    if (dupRes.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Já tem um pedido pendente para este animal.' });
    }

    const observacoes = `Habitação: ${tipoHabitacao || 'N/A'} | Outros animais: ${outrosAnimais || 'N/A'} | Experiência: ${experienciaAnimais || 'N/A'} | Motivo: ${motivo || ''}`;

    const insertRes = await client.query(
      `INSERT INTO pedido_adocao (
         id_cliente, id_animal, data_pedido, estado,
         tipo_habitacao, outros_animais, experiencia_animais, motivo, observacoes
       )
       VALUES ($1, $2, NOW(), 'Pendente', $3, $4, $5, $6, $7)
       RETURNING id_pedido`,
      [
        idCliente,
        id_animal || 1,
        tipoHabitacao || null,
        outrosAnimais || null,
        experienciaAnimais || null,
        motivo || null,
        observacoes
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({
      id_pedido: insertRes.rows[0].id_pedido,
      mensagem: 'Pedido de adoção registado com sucesso!'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao submeter pedido de adoção:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ==========================================
// 3. LISTAR PEDIDOS DE ADOÇÃO (Cliente ou Admin)
// ==========================================
router.get('/adocao/pedidos', async (req, res) => {
  const { id_utilizador } = req.query;

  try {
    let query = `
      SELECT pa.id_pedido, pa.data_pedido, pa.estado,
             pa.tipo_habitacao, pa.outros_animais, pa.experiencia_animais, pa.motivo, pa.observacoes,
             a.id_animal, a.nome AS animal_nome, a.especie, a.raca, a.estado_adocao AS animal_estado,
             COALESCE(u.nome, cl.nome_completo) AS candidato_nome,
             COALESCE(u.email, cl.email) AS candidato_email,
             cl.telefone AS candidato_telefone,
             ad.id_adocao, ad.data_adocao,
             f.nome_completo AS funcionario_nome
      FROM pedido_adocao pa
      JOIN animal a ON pa.id_animal = a.id_animal
      JOIN cliente cl ON pa.id_cliente = cl.id_cliente
      LEFT JOIN utilizador u ON cl.id_utilizador = u.id_utilizador
      LEFT JOIN adocao ad ON ad.id_pedido = pa.id_pedido
      LEFT JOIN funcionario f ON ad.id_funcionario = f.id_funcionario
    `;
    const params = [];

    if (id_utilizador) {
      query += ` WHERE u.id_utilizador = $1`;
      params.push(id_utilizador);
    }

    query += ` ORDER BY pa.data_pedido DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar pedidos de adoção:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. APROVAR / REJEITAR PEDIDO DE ADOÇÃO (Admin)
// ==========================================
router.patch('/adocao/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  const { estado, id_funcionario } = req.body; // 'Aprovado' ou 'Rejeitado'
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Bloqueia o registo durante a transação para impedir aprovações simultâneas
    const infoRes = await client.query(
      `SELECT pa.id_pedido, pa.id_animal, pa.id_cliente,
              pa.tipo_habitacao, pa.outros_animais, pa.experiencia_animais, pa.motivo, pa.observacoes,
              a.estado_adocao, a.nome AS animal_nome
       FROM pedido_adocao pa
       JOIN animal a ON pa.id_animal = a.id_animal
       WHERE pa.id_pedido = $1
       FOR UPDATE`,
      [id]
    );

    if (infoRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido de adoção não encontrado.' });
    }

    const pedido = infoRes.rows[0];

    if (estado === 'Aprovado' && pedido.estado_adocao === 'Adotado') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `O animal ${pedido.animal_nome} já foi adotado e não permite nova aprovação.` });
    }

    await client.query(
      'UPDATE pedido_adocao SET estado = $1 WHERE id_pedido = $2',
      [estado, id]
    );

    if (estado === 'Aprovado') {
      await client.query(
        `UPDATE animal
         SET estado_adocao = 'Adotado', estado = 'Domestico', id_cliente = $1
         WHERE id_animal = $2`,
        [pedido.id_cliente, pedido.id_animal]
      );

      await client.query(
        `INSERT INTO adocao (
           data_adocao, id_cliente, id_animal, id_funcionario, id_pedido,
           tipo_habitacao, outros_animais, experiencia_animais, motivo, estado_acompanhamento
         )
         VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, $6, $7, $8, 'Concluída')`,
        [
          pedido.id_cliente,
          pedido.id_animal,
          id_funcionario || 1,
          pedido.id_pedido,
          pedido.tipo_habitacao,
          pedido.outros_animais,
          pedido.experiencia_animais,
          pedido.motivo || pedido.observacoes
        ]
      );

      // Rejeita automaticamente quaisquer outros pedidos pendentes para o mesmo animal
      await client.query(
        `UPDATE pedido_adocao
         SET estado = 'Rejeitado'
         WHERE id_animal = $1 AND id_pedido <> $2 AND estado = 'Pendente'`,
        [pedido.id_animal, id]
      );
    }

    await client.query('COMMIT');
    res.json({ mensagem: `Pedido atualizado para ${estado}.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar pedido de adoção:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ==========================================
// 5. ANIMAIS DO CLIENTE (Perfil)
// ==========================================
router.get('/meus-animais/:id_utilizador', async (req, res) => {
  const { id_utilizador } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.id_animal, a.nome, a.especie, a.raca, a.idade, a.sexo, a.estado_adocao
       FROM animal a
       JOIN cliente cl ON a.id_cliente = cl.id_cliente
       WHERE cl.id_utilizador = $1
       ORDER BY a.id_animal DESC`,
      [id_utilizador]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar animais do cliente:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;