-- =====================================================
-- DASHBOARD / KPIs
-- =====================================================

-- =====================================================
-- KPI 1 - RECEITAS POR TIPO DE SERVIÇO E MÊS
-- Usa INNER JOIN + SUM + GROUP BY
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_receitas_servico_mes CASCADE;

CREATE VIEW vw_kpi_receitas_servico_mes AS
SELECT
    TO_CHAR(f.data, 'YYYY-MM') AS mes,
    ts.nome_servico AS tipo_servico,
    COUNT(f.id_fatura) AS total_faturas,
    SUM(f.valor_total) AS receita_total
FROM fatura f
INNER JOIN consulta c
    ON f.id_consulta = c.id_consulta
INNER JOIN tipo_servico ts
    ON c.id_servico = ts.id_servico
GROUP BY
    TO_CHAR(f.data, 'YYYY-MM'),
    ts.nome_servico;

-- =====================================================
-- KPI 2 - RECEITAS POR VETERINÁRIO
-- Usa INNER JOIN + SUM + GROUP BY
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_receitas_veterinario CASCADE;

CREATE VIEW vw_kpi_receitas_veterinario AS
SELECT
    func.nome_completo AS veterinario,
    v.especialidade,
    COUNT(c.id_consulta) AS total_consultas,
    SUM(f.valor_total) AS receita_total
FROM fatura f
INNER JOIN consulta c
    ON f.id_consulta = c.id_consulta
INNER JOIN veterinario v
    ON c.id_veterinario = v.id_veterinario
INNER JOIN funcionario func
    ON v.id_veterinario = func.id_funcionario
GROUP BY
    func.nome_completo,
    v.especialidade;

-- =====================================================
-- KPI 3 - CONSULTAS POR ESTADO
-- Usa GROUP BY simples
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_consultas_estado CASCADE;

CREATE VIEW vw_kpi_consultas_estado AS
SELECT
    estado_consulta,
    COUNT(*) AS total_consultas
FROM consulta
GROUP BY
    estado_consulta;

-- ====================================================
-- KPI 4 - CONSULTAS CANCELADAS, REMARCADAS E FALTAS POR MÊS
-- Usa FILTER
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_canceladas_remarcadas_mes CASCADE;

CREATE VIEW vw_kpi_canceladas_remarcadas_mes AS
SELECT
    TO_CHAR(data, 'YYYY-MM') AS mes,
    COUNT(*) FILTER (WHERE estado_consulta = 'Cancelada') AS consultas_canceladas,
    COUNT(*) FILTER (WHERE estado_consulta = 'Remarcada') AS consultas_remarcadas,
    COUNT(*) FILTER (WHERE estado_consulta = 'Faltou') AS consultas_com_falta,
    COUNT(*) FILTER (WHERE estado_consulta = 'Concluida') AS consultas_concluidas,
    COUNT(*) FILTER (WHERE estado_consulta = 'Marcada') AS consultas_marcadas,
    COUNT(*) FILTER (WHERE estado_consulta = 'Confirmada') AS consultas_confirmadas
FROM consulta
GROUP BY
    TO_CHAR(data, 'YYYY-MM');

-- =====================================================
-- KPI 5 - CLASSIFICAÇÃO DOS SERVIÇOS POR PREÇO
-- Usa CASE
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_classificacao_servicos CASCADE;

CREATE VIEW vw_kpi_classificacao_servicos AS
SELECT
    nome_servico,
    preco_base,
    CASE
        WHEN preco_base >= 100 THEN 'Serviço caro'
        WHEN preco_base >= 40 THEN 'Serviço médio'
        ELSE 'Serviço económico'
    END AS classificacao_preco
FROM tipo_servico;

-- =====================================================
-- KPI 6 - PAGAMENTOS POR MÉTODO
-- Usa GROUP BY + SUM + AVG
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_pagamentos_metodo CASCADE;

CREATE VIEW vw_kpi_pagamentos_metodo AS
SELECT
    metodo_pagamento,
    COUNT(id_pagamento) AS total_pagamentos,
    SUM(valor) AS valor_total,
    AVG(valor) AS valor_medio
FROM pagamento
GROUP BY
    metodo_pagamento;

-- =====================================================
-- KPI 7 - EXAMES MAIS PRESCRITOS
-- Usa INNER JOIN + GROUP BY + HAVING
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_exames_mais_prescritos CASCADE;

CREATE VIEW vw_kpi_exames_mais_prescritos AS
SELECT
    e.nome_exame,
    COUNT(pe.id_exame) AS total_prescricoes
FROM exame e
INNER JOIN prescricao_exame pe
    ON e.id_exame = pe.id_exame
GROUP BY
    e.nome_exame
HAVING
    COUNT(pe.id_exame) >= 1;

-- =====================================================
-- KPI 8 - MEDICAMENTOS PRESCRITOS POR ANIMAL
-- Usa INNER JOIN + STRING_AGG
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_medicamentos_por_animal CASCADE;

CREATE VIEW vw_kpi_medicamentos_por_animal AS
SELECT
    a.nome AS animal,
    STRING_AGG(m.nome_comercial, ', ') AS medicamentos_prescritos
FROM animal a
INNER JOIN consulta c
    ON a.id_animal = c.id_animal
INNER JOIN receita_medica rm
    ON c.id_consulta = rm.id_consulta
INNER JOIN medicamento m
    ON rm.id_medicamento = m.id_medicamento
GROUP BY
    a.nome;

-- =====================================================
-- KPI 9 - ANIMAIS SEM CONSULTAS
-- Usa LEFT JOIN
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_animais_sem_consultas CASCADE;

CREATE VIEW vw_kpi_animais_sem_consultas AS
SELECT
    a.id_animal,
    a.nome,
    a.especie,
    a.raca,
    a.estado
FROM animal a
LEFT JOIN consulta c
    ON a.id_animal = c.id_animal
WHERE c.id_consulta IS NULL;

-- =====================================================
-- KPI 10 - CLIENTES COM MAIS CONSULTAS
-- Usa INNER JOIN + GROUP BY
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_clientes_mais_consultas CASCADE;

CREATE VIEW vw_kpi_clientes_mais_consultas AS
SELECT
    cl.nome_completo AS cliente,
    COUNT(c.id_consulta) AS total_consultas
FROM cliente cl
INNER JOIN animal a
    ON cl.id_cliente = a.id_cliente
INNER JOIN consulta c
    ON a.id_animal = c.id_animal
GROUP BY
    cl.nome_completo;

-- =====================================================
-- KPI 11 - ADOÇÕES POR MÊS
-- Usa GROUP BY
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_adocoes_mes CASCADE;

CREATE VIEW vw_kpi_adocoes_mes AS
SELECT
    TO_CHAR(data_adocao, 'YYYY-MM') AS mes,
    COUNT(id_adocao) AS total_adocoes
FROM adocao
GROUP BY
    TO_CHAR(data_adocao, 'YYYY-MM');

-- =====================================================
-- KPI 12 - RESUMO GERAL DO DASHBOARD
-- Usa subqueries
-- =====================================================
DROP VIEW IF EXISTS vw_kpi_resumo_geral CASCADE;

CREATE VIEW vw_kpi_resumo_geral AS
SELECT
    (SELECT COUNT(*) FROM cliente) AS total_clientes,
    (SELECT COUNT(*) FROM animal) AS total_animais,
    (SELECT COUNT(*) FROM animal WHERE estado = 'Domestico') AS animais_domesticos,
    (SELECT COUNT(*) FROM animal WHERE estado = 'Resgatado') AS animais_resgatados,
    (SELECT COUNT(*) FROM consulta) AS total_consultas,
    (SELECT COUNT(*) FROM consulta WHERE estado_consulta = 'Concluida') AS consultas_concluidas,
    (SELECT COUNT(*) FROM consulta WHERE estado_consulta = 'Cancelada') AS consultas_canceladas,
    (SELECT COUNT(*) FROM consulta WHERE estado_consulta = 'Remarcada') AS consultas_remarcadas,
    (SELECT COUNT(*) FROM adocao) AS total_adocoes,
    (SELECT COUNT(*) FROM exame) AS total_tipos_exame,
    (SELECT COUNT(*) FROM medicamento) AS total_medicamentos,
    (SELECT COALESCE(SUM(valor_total), 0) FROM fatura) AS receita_total_faturada,
    (SELECT COALESCE(SUM(valor), 0) FROM pagamento WHERE estado_pagamento = 'Pago') AS receita_total_paga;

-- =====================================================
-- CONFIRMAR VIEWS CRIADAS
-- =====================================================
SELECT 
    table_name AS view_criada
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'vw_kpi_%'
ORDER BY table_name;