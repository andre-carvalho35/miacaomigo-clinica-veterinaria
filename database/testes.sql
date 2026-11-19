-- =====================================================
-- TESTES GERAIS DAS TABELAS
-- =====================================================

SELECT * FROM utilizador;
SELECT * FROM cliente;
SELECT * FROM funcionario;
SELECT * FROM veterinario;
SELECT * FROM animal;
SELECT * FROM consulta;
SELECT * FROM medicamento;
SELECT * FROM exame;
SELECT * FROM receita_medica;
SELECT * FROM prescricao_exame;
SELECT * FROM fatura;
SELECT * FROM pagamento;
SELECT * FROM notificacao;
SELECT * FROM adocao;
SELECT * FROM sessao;

-- =====================================================
-- TESTES LOGIN / LOGOUT / ALTERAR SENHA
-- =====================================================

-- Alterar senha corretamente
SELECT alterar_palavra_passe(
    'luis.silva@email.com',
    'senha789',
    'novasenha123'
);

-- Confirmar que a senha foi alterada
SELECT 
    id_utilizador,
    nome,
    mail,
    senha
FROM utilizador
WHERE mail = 'luis.silva@email.com';

-- Tentar alterar senha com senha antiga errada
DO $$
DECLARE
    v_resultado BOOLEAN;
BEGIN
    SELECT alterar_palavra_passe(
        'luis.silva@email.com',
        'senha789',
        'outrasenha'
    ) IS NULL
    INTO v_resultado;

    RAISE NOTICE 'ERRO: o sistema deixou alterar a senha com senha antiga errada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: senha antiga incorreta bloqueada: %', SQLERRM;
END;
$$;

-- Voltar a colocar a senha original para os testes de login
SELECT alterar_palavra_passe(
    'luis.silva@email.com',
    'novasenha123',
    'senha789'
);

-- Login correto do utilizador 3
DO $$
BEGIN
    CALL fazer_login(
        'luis.silva@email.com',
        'senha789'
    );

    RAISE NOTICE 'OK: login efetuado com sucesso';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO NO LOGIN: %', SQLERRM;
END;
$$;

-- Tentar abrir segunda sessão do mesmo utilizador
DO $$
BEGIN
    CALL fazer_login(
        'luis.silva@email.com',
        'senha789'
    );

    RAISE NOTICE 'ERRO: o sistema deixou abrir duas sessões';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: segunda sessão bloqueada: %', SQLERRM;
END;
$$;

-- Terminar sessão aberta do utilizador 3
DO $$
DECLARE
    v_id_sessao INT;
BEGIN
    SELECT id_sessao
    INTO v_id_sessao
    FROM sessao
    WHERE id_utilizador = 3
      AND data_hora_fim IS NULL
    ORDER BY id_sessao DESC
    LIMIT 1;

    CALL terminar_sessao(v_id_sessao);

    RAISE NOTICE 'OK: sessão terminada';
END;
$$;

-- Tentar terminar a mesma sessão outra vez
DO $$
DECLARE
    v_id_sessao INT;
BEGIN
    SELECT id_sessao
    INTO v_id_sessao
    FROM sessao
    WHERE id_utilizador = 3
    ORDER BY id_sessao DESC
    LIMIT 1;

    CALL terminar_sessao(v_id_sessao);

    RAISE NOTICE 'ERRO: o sistema deixou terminar uma sessão já fechada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: sessão já terminada bloqueada: %', SQLERRM;
END;
$$;

-- Ver sessões após testes
SELECT *
FROM sessao
ORDER BY id_sessao;

-- =====================================================
-- PREPARAÇÃO EXTRA PARA TESTES DE CONSULTAS
-- =====================================================

-- Horário para o veterinário no dia +3
INSERT INTO horario_trabalho (
    id_horario,
    id_funcionario,
    dia_semana,
    hora_inicio,
    hora_fim
)
VALUES (
    100,
    2,
    TO_CHAR(CURRENT_DATE + 3, 'FMDay'),
    '09:00:00',
    '18:00:00'
)
ON CONFLICT (id_horario)
DO UPDATE SET
    dia_semana = EXCLUDED.dia_semana,
    hora_inicio = EXCLUDED.hora_inicio,
    hora_fim = EXCLUDED.hora_fim;

-- =====================================================
-- TESTES DA MARCAÇÃO DE CONSULTA
-- =====================================================

-- Teste correto
DO $$
BEGIN
    CALL marcar_consulta(
        CURRENT_DATE + 1,
        '11:00:00',
        'Consulta de rotina',
        1,
        2
    );

    RAISE NOTICE 'OK: consulta marcada com sucesso';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO AO MARCAR CONSULTA: %', SQLERRM;
END;
$$;

-- Teste consulta repetida para o mesmo veterinário
DO $$
BEGIN
    CALL marcar_consulta(
        CURRENT_DATE + 1,
        '11:00:00',
        'Consulta repetida',
        1,
        2
    );

    RAISE NOTICE 'ERRO: o sistema deixou marcar consulta repetida';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: consulta repetida bloqueada: %', SQLERRM;
END;
$$;

-- Teste fora do horário
DO $$
BEGIN
    CALL marcar_consulta(
        CURRENT_DATE + 1,
        '20:00:00',
        'Consulta fora do horário',
        1,
        2
    );

    RAISE NOTICE 'ERRO: o sistema deixou marcar fora do horário';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: fora do horário bloqueado: %', SQLERRM;
END;
$$;

-- Teste férias
DO $$
BEGIN
    CALL marcar_consulta(
        CURRENT_DATE + 2,
        '11:00:00',
        'Consulta em férias',
        1,
        2
    );

    RAISE NOTICE 'ERRO: o sistema deixou marcar consulta em férias';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: férias bloqueadas: %', SQLERRM;
END;
$$;

-- Teste animal inexistente
DO $$
BEGIN
    CALL marcar_consulta(
        CURRENT_DATE + 1,
        '12:00:00',
        'Consulta animal inexistente',
        999,
        2
    );

    RAISE NOTICE 'ERRO: o sistema aceitou animal inexistente';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: animal inexistente bloqueado: %', SQLERRM;
END;
$$;

-- Teste veterinário inexistente
DO $$
BEGIN
    CALL marcar_consulta(
        CURRENT_DATE + 1,
        '12:00:00',
        'Consulta veterinário inexistente',
        1,
        999
    );

    RAISE NOTICE 'ERRO: o sistema aceitou veterinário inexistente';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: veterinário inexistente bloqueado: %', SQLERRM;
END;
$$;

-- Teste motivo vazio
DO $$
BEGIN
    CALL marcar_consulta(
        CURRENT_DATE + 1,
        '12:00:00',
        '',
        1,
        2
    );

    RAISE NOTICE 'ERRO: o sistema aceitou motivo vazio';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: motivo vazio bloqueado: %', SQLERRM;
END;
$$;

-- Verificar se a consulta criada ficou com tipo de serviço
SELECT 
    c.id_consulta,
    c.data,
    c.hora,
    c.motivo,
    c.estado_consulta,
    c.resposta_cliente,
    c.id_servico,
    ts.nome_servico
FROM consulta c
LEFT JOIN tipo_servico ts
    ON c.id_servico = ts.id_servico
WHERE c.motivo = 'Consulta de rotina';

-- Verificar disponibilidade
SELECT verificar_disponibilidade_veterinario(2, CURRENT_DATE + 1, '11:00:00') AS disponibilidade_11h;
SELECT verificar_disponibilidade_veterinario(2, CURRENT_DATE + 1, '15:00:00') AS disponibilidade_15h;
SELECT verificar_disponibilidade_veterinario(2, CURRENT_DATE + 2, '11:00:00') AS disponibilidade_ferias;
SELECT verificar_disponibilidade_veterinario(2, CURRENT_DATE + 1, '20:00:00') AS disponibilidade_fora_horario;

-- =====================================================
-- TESTES REMARCAR / DESMARCAR / CANCELAR CONSULTA
-- =====================================================

-- Criar consulta para testar remarcação
DO $$
BEGIN
    CALL marcar_consulta(
        CURRENT_DATE + 3,
        '12:00:00',
        'Consulta para testar remarcação',
        1,
        2
    );

    RAISE NOTICE 'OK: consulta criada para remarcação';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO AO CRIAR CONSULTA PARA REMARCAR: %', SQLERRM;
END;
$$;

-- Remarcar consulta recém-criada
DO $$
DECLARE
    v_id_consulta INT;
BEGIN
    SELECT MAX(id_consulta)
    INTO v_id_consulta
    FROM consulta
    WHERE motivo = 'Consulta para testar remarcação';

    CALL remarcar_consulta(
        v_id_consulta,
        CURRENT_DATE + 3,
        '15:00:00'
    );

    RAISE NOTICE 'OK: consulta remarcada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO AO REMARCAR: %', SQLERRM;
END;
$$;

-- Tentar remarcar para data passada
DO $$
DECLARE
    v_id_consulta INT;
BEGIN
    SELECT MAX(id_consulta)
    INTO v_id_consulta
    FROM consulta
    WHERE motivo = 'Consulta para testar remarcação';

    CALL remarcar_consulta(
        v_id_consulta,
        CURRENT_DATE - 1,
        '15:00:00'
    );

    RAISE NOTICE 'ERRO: o sistema deixou remarcar para data passada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: remarcação para data passada bloqueada: %', SQLERRM;
END;
$$;

-- Cancelar consulta
DO $$
DECLARE
    v_id_consulta INT;
BEGIN
    SELECT MAX(id_consulta)
    INTO v_id_consulta
    FROM consulta
    WHERE motivo = 'Consulta para testar remarcação';

    CALL cancelar_consulta(v_id_consulta);

    RAISE NOTICE 'OK: consulta cancelada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO AO CANCELAR: %', SQLERRM;
END;
$$;

-- Tentar cancelar a mesma consulta outra vez
DO $$
DECLARE
    v_id_consulta INT;
BEGIN
    SELECT MAX(id_consulta)
    INTO v_id_consulta
    FROM consulta
    WHERE motivo = 'Consulta para testar remarcação';

    CALL cancelar_consulta(v_id_consulta);

    RAISE NOTICE 'ERRO: o sistema deixou cancelar duas vezes';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: cancelamento duplicado bloqueado: %', SQLERRM;
END;
$$;

-- Ver consultas após remarcação/cancelamento
SELECT 
    id_consulta,
    data,
    hora,
    motivo,
    estado_consulta,
    id_servico
FROM consulta
ORDER BY id_consulta;

-- =====================================================
-- TESTES FATURAÇÃO E PAGAMENTO
-- =====================================================

-- Alterar consulta 3 para concluída
CALL alterar_estado_consulta(3, 'Concluida');

-- Gerar fatura correta
DO $$
BEGIN
    CALL gerar_fatura(3, 25.00);

    RAISE NOTICE 'OK: fatura gerada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO AO GERAR FATURA: %', SQLERRM;
END;
$$;

-- Tentar gerar fatura duplicada
DO $$
BEGIN
    CALL gerar_fatura(3, 25.00);

    RAISE NOTICE 'ERRO: o sistema deixou gerar fatura duplicada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: fatura duplicada bloqueada: %', SQLERRM;
END;
$$;

-- Tentar gerar fatura com valor negativo
DO $$
BEGIN
    CALL gerar_fatura(3, -10.00);

    RAISE NOTICE 'ERRO: o sistema deixou gerar fatura negativa';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: fatura com valor negativo bloqueada: %', SQLERRM;
END;
$$;

-- Registar pagamento correto
DO $$
BEGIN
    CALL registar_pagamento(3, 25.00, 'MB WAY');

    RAISE NOTICE 'OK: pagamento registado';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO AO REGISTAR PAGAMENTO: %', SQLERRM;
END;
$$;

-- Tentar pagamento duplicado
DO $$
BEGIN
    CALL registar_pagamento(3, 25.00, 'MB WAY');

    RAISE NOTICE 'ERRO: o sistema deixou pagar a mesma fatura duas vezes';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: pagamento duplicado bloqueado: %', SQLERRM;
END;
$$;

-- Tentar método inválido
DO $$
BEGIN
    CALL registar_pagamento(3, 25.00, 'MBWay');

    RAISE NOTICE 'ERRO: o sistema aceitou método inválido';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: método inválido bloqueado: %', SQLERRM;
END;
$$;


-- Tentar pagamento inferior à fatura
DO $$
BEGIN
    CALL registar_pagamento(2, 5.00, 'Dinheiro');

    RAISE NOTICE 'ERRO: o sistema aceitou pagamento inferior';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: pagamento inferior bloqueado: %', SQLERRM;
END;
$$;

-- =====================================================
-- TESTES RECEITAS MÉDICAS E PRESCRIÇÃO DE EXAMES
-- =====================================================

-- Emitir receita médica válida
DO $$
BEGIN
    CALL emitir_receita_medica(
        2,
        1,
        'Tomar durante 5 dias após refeição'
    );

    RAISE NOTICE 'OK: receita médica emitida';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO / OU RECEITA JÁ EXISTIA: %', SQLERRM;
END;
$$;

-- Tentar receita duplicada
DO $$
BEGIN
    CALL emitir_receita_medica(
        2,
        1,
        'Receita duplicada'
    );

    RAISE NOTICE 'ERRO: o sistema deixou emitir receita duplicada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: receita duplicada bloqueada: %', SQLERRM;
END;
$$;

-- Tentar medicamento inexistente
DO $$
BEGIN
    CALL emitir_receita_medica(
        2,
        999,
        'Medicamento inexistente'
    );

    RAISE NOTICE 'ERRO: o sistema aceitou medicamento inexistente';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: medicamento inexistente bloqueado: %', SQLERRM;
END;
$$;

-- Emitir prescrição de exame válida
DO $$
BEGIN
    CALL emitir_prescricao_exame(
        1,
        2,
        'Realizar análise para confirmação do diagnóstico'
    );

    RAISE NOTICE 'OK: prescrição de exame emitida';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO / OU EXAME JÁ EXISTIA: %', SQLERRM;
END;
$$;

-- Tentar prescrição de exame duplicada
DO $$
BEGIN
    CALL emitir_prescricao_exame(
        1,
        2,
        'Prescrição duplicada'
    );

    RAISE NOTICE 'ERRO: o sistema deixou emitir prescrição duplicada';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: prescrição de exame duplicada bloqueada: %', SQLERRM;
END;
$$;

-- Tentar exame inexistente
DO $$
BEGIN
    CALL emitir_prescricao_exame(
        1,
        999,
        'Exame inexistente'
    );

    RAISE NOTICE 'ERRO: o sistema aceitou exame inexistente';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: exame inexistente bloqueado: %', SQLERRM;
END;
$$;

-- =====================================================
-- TESTES ADOÇÃO
-- =====================================================

-- Limpar teste anterior, se existir
DELETE FROM adocao
WHERE id_animal = 10;

DELETE FROM animal
WHERE id_animal = 10;

-- Criar animal resgatado para teste de adoção
INSERT INTO animal (
    id_animal,
    nome,
    especie,
    raca,
    data_nascimento,
    sexo,
    estado,
    data_recolha,
    local_encontrado,
    estado_clinico_inicial,
    id_entidade
)
VALUES (
    10,
    'Bobby Teste',
    'Cão',
    'Sem raça definida',
    '2021-02-10',
    'M',
    'Resgatado',
    CURRENT_DATE - 5,
    'Vila Nova de Famalicão',
    'Bom estado geral',
    1
);

-- Registar adoção válida
SELECT registar_adocao(
    CURRENT_DATE,
    1,
    10,
    2
);

-- Verificar adoção
SELECT 
    ad.id_adocao,
    ad.data_adocao,
    c.nome_completo AS cliente,
    a.nome AS animal,
    a.estado,
    f.nome_completo AS funcionario_responsavel
FROM adocao ad
INNER JOIN cliente c
    ON ad.id_cliente = c.id_cliente
INNER JOIN animal a
    ON ad.id_animal = a.id_animal
INNER JOIN funcionario f
    ON ad.id_funcionario = f.id_funcionario
WHERE ad.id_animal = 10;

-- Tentar adotar o mesmo animal outra vez
DO $$
DECLARE
    v_resultado BOOLEAN;
BEGIN
    SELECT registar_adocao(
        CURRENT_DATE,
        1,
        10,
        2
    ) IS NULL
    INTO v_resultado;

    RAISE NOTICE 'ERRO: o sistema deixou adotar o mesmo animal duas vezes';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: adoção duplicada bloqueada: %', SQLERRM;
END;
$$;

-- =====================================================
-- TESTES NOTIFICAÇÕES / LEMBRETES
-- =====================================================

CALL enviar_lembretes_consultas();

SELECT *
FROM notificacao
ORDER BY id_notificacao;

-- =====================================================
-- TESTES RESUMO DE PRESCRIÇÕES MENSAIS
-- =====================================================

CALL gerar_resumo_prescricoes_mensal();

SELECT *
FROM resumo_prescricoes_mensal
ORDER BY ano, mes, nome_animal;

-- =====================================================
-- TESTE HISTÓRICO DO ANIMAL
-- =====================================================

SELECT *
FROM consultar_historico_animal(1);

-- Animal inexistente
DO $$
DECLARE
    v_total INT;
BEGIN
    SELECT COUNT(*)
    INTO v_total
    FROM consultar_historico_animal(999);

    RAISE NOTICE 'ERRO: o sistema mostrou histórico de animal inexistente';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: histórico de animal inexistente bloqueado: %', SQLERRM;
END;
$$;

-- =====================================================
-- TESTES TRIGGERS / LOGS
-- =====================================================

-- Alterar cliente para gerar log
UPDATE cliente
SET telefone = '919999999'
WHERE id_cliente = 1;

-- Alterar animal para gerar log
UPDATE animal
SET estado_clinico_inicial = 'Estado atualizado em teste'
WHERE id_animal = 2;

-- Ver logs gerados
SELECT *
FROM log_acao
ORDER BY data_hora DESC;

-- =====================================================
-- TESTES DASHBOARD / KPIs
-- =====================================================

-- KPI 1 - Receitas por tipo de serviço e mês
SELECT *
FROM vw_kpi_receitas_servico_mes
ORDER BY mes, tipo_servico;

-- KPI 2 - Receitas por veterinário
SELECT *
FROM vw_kpi_receitas_veterinario
ORDER BY receita_total DESC;

-- KPI 3 - Consultas por estado
SELECT *
FROM vw_kpi_consultas_estado
ORDER BY total_consultas DESC;

-- KPI 4 - Consultas canceladas, remarcadas e faltas por mês
SELECT *
FROM vw_kpi_canceladas_remarcadas_mes
ORDER BY mes;

-- KPI 5 - Classificação dos serviços por preço
SELECT *
FROM vw_kpi_classificacao_servicos
ORDER BY preco_base DESC;

-- KPI 6 - Pagamentos por método
SELECT *
FROM vw_kpi_pagamentos_metodo
ORDER BY valor_total DESC;

-- KPI 7 - Exames mais prescritos
SELECT *
FROM vw_kpi_exames_mais_prescritos
ORDER BY total_prescricoes DESC;

-- KPI 8 - Medicamentos prescritos por animal
SELECT *
FROM vw_kpi_medicamentos_por_animal
ORDER BY animal;

-- KPI 9 - Animais sem consultas
SELECT *
FROM vw_kpi_animais_sem_consultas
ORDER BY nome;

-- KPI 10 - Clientes com mais consultas
SELECT *
FROM vw_kpi_clientes_mais_consultas
ORDER BY total_consultas DESC;

-- KPI 11 - Adoções por mês
SELECT *
FROM vw_kpi_adocoes_mes
ORDER BY mes;

-- KPI 12 - Resumo geral do dashboard
SELECT *
FROM vw_kpi_resumo_geral;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT * FROM consulta ORDER BY id_consulta;
SELECT * FROM fatura ORDER BY id_fatura;
SELECT * FROM pagamento ORDER BY id_pagamento;
SELECT * FROM receita_medica;
SELECT * FROM prescricao_exame;
SELECT * FROM adocao;
SELECT * FROM notificacao;
SELECT * FROM resumo_prescricoes_mensal;

BEGIN;

-- 1. Permite que o trigger automático insira um valor padrão sem dar erro de NOT NULL
ALTER TABLE veterinario
    ALTER COLUMN especialidade SET DEFAULT 'Clínica Geral';

-- 2. Garante os 4 veterinários na tabela utilizador (o trigger cria logo a linha em veterinario)
INSERT INTO utilizador (nome, email, mail, numero_telemovel, nacionalidade, profissao, password_hash, senha, ativo, tipo_utilizador, ultimo_login)
SELECT v.nome, v.email, v.email, v.tel, 'Portuguesa', 'Médico Veterinário', 'vet123', 'vet123', true, 'Veterinario', NOW()
FROM (VALUES
    ('Dra. Ana Costa',      'ana.costa@miacaomigo.pt',      '910111222'),
    ('Dr. João Martins',    'joao.martins@miacaomigo.pt',   '910333444'),
    ('Dra. Mariana Silva',  'mariana.silva@miacaomigo.pt',  '910555666'),
    ('Dr. Miguel Ferreira', 'miguel.ferreira@miacaomigo.pt','910777888')
) AS v(nome, email, tel)
WHERE NOT EXISTS (SELECT 1 FROM utilizador u WHERE u.email = v.email);

-- 3. Garante que existem na tabela veterinario (caso não exista trigger) e atualiza a especialidade certa de cada um
INSERT INTO veterinario (id_utilizador, especialidade)
SELECT u.id_utilizador, v.especialidade
FROM (VALUES
    ('ana.costa@miacaomigo.pt',       'Clínica geral e vacinação'),
    ('joao.martins@miacaomigo.pt',    'Cirurgia e consultas gerais'),
    ('mariana.silva@miacaomigo.pt',   'Dermatologia e exames'),
    ('miguel.ferreira@miacaomigo.pt', 'Urgências e desparasitação')
) AS v(email, especialidade)
JOIN utilizador u ON u.email = v.email
WHERE NOT EXISTS (SELECT 1 FROM veterinario vet WHERE vet.id_utilizador = u.id_utilizador);

UPDATE veterinario vet
SET especialidade = v.especialidade
FROM (VALUES
    ('ana.costa@miacaomigo.pt',       'Clínica geral e vacinação'),
    ('joao.martins@miacaomigo.pt',    'Cirurgia e consultas gerais'),
    ('mariana.silva@miacaomigo.pt',   'Dermatologia e exames'),
    ('miguel.ferreira@miacaomigo.pt', 'Urgências e desparasitação')
) AS v(email, especialidade)
JOIN utilizador u ON u.email = v.email
WHERE vet.id_utilizador = u.id_utilizador;

COMMIT;