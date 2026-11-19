-- =====================================================
-- PROCEDURA FAZER LOGIN
-- =====================================================
CREATE OR REPLACE PROCEDURE fazer_login(
    IN p_mail VARCHAR,
    IN p_senha VARCHAR
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_utilizador INTEGER;
    v_sessao_aberta INTEGER;
BEGIN
    SELECT id_utilizador
    INTO v_id_utilizador
    FROM utilizador
    WHERE COALESCE(mail, email) = p_mail
      AND COALESCE(senha, password_hash) = p_senha;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Email ou senha incorretos';
    END IF;

    SELECT COUNT(*)
    INTO v_sessao_aberta
    FROM sessao
    WHERE id_utilizador = v_id_utilizador
      AND data_hora_fim IS NULL;

    IF v_sessao_aberta > 0 THEN
        RAISE EXCEPTION 'Este utilizador já tem uma sessão aberta';
    END IF;

    UPDATE utilizador
    SET ultimo_login = CURRENT_TIMESTAMP
    WHERE id_utilizador = v_id_utilizador;

    INSERT INTO sessao (
        id_utilizador,
        data_hora_inicio
    )
    VALUES (
        v_id_utilizador,
        CURRENT_TIMESTAMP
    );
END;
$$;

-- =====================================================
-- PROCEDURA TERMINAR SESSÃO
-- =====================================================
CREATE OR REPLACE PROCEDURE terminar_sessao(
    IN p_id_sessao INT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE sessao
    SET data_hora_fim = CURRENT_TIMESTAMP
    WHERE id_sessao = p_id_sessao
      AND data_hora_fim IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sessão não encontrada ou já terminada';
    END IF;
END;
$$;

-- =====================================================
-- FUNÇÃO PARA ALTERAR SENHA
-- =====================================================
CREATE OR REPLACE FUNCTION alterar_palavra_passe(
    p_email_utilizador VARCHAR,
    p_senha_atual VARCHAR,
    p_nova_palavra_passe VARCHAR
)
RETURNS VOID AS $$
DECLARE
    v_id_utilizador INTEGER;
BEGIN
    SELECT id_utilizador
    INTO v_id_utilizador
    FROM utilizador
    WHERE COALESCE(mail, email) = p_email_utilizador
      AND COALESCE(senha, password_hash) = p_senha_atual;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Senha atual incorreta';
    END IF;

    UPDATE utilizador
    SET senha = p_nova_palavra_passe,
        password_hash = p_nova_palavra_passe
    WHERE id_utilizador = v_id_utilizador;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PROCEDURA MARCAR CONSULTA (USA SERIAL AUTOMÁTICO)
-- =====================================================
CREATE OR REPLACE PROCEDURE marcar_consulta(
    IN p_data DATE,
    IN p_hora TIME,
    IN p_motivo VARCHAR,
    IN p_id_animal INT,
    IN p_id_veterinario INT,
    IN p_id_servico INT DEFAULT 1
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
BEGIN
    IF p_data < CURRENT_DATE THEN
        RAISE EXCEPTION 'Não é possível marcar consulta para uma data passada';
    END IF;

    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'O motivo da consulta é obrigatório';
    END IF;

    SELECT COUNT(*) INTO v_existe FROM animal WHERE id_animal = p_id_animal;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Animal não existe';
    END IF;

    SELECT COUNT(*) INTO v_existe FROM veterinario WHERE id_veterinario = p_id_veterinario;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Veterinário não existe';
    END IF;

    SELECT COUNT(*) INTO v_existe FROM tipo_servico WHERE id_servico = p_id_servico;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Tipo de serviço não existe';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM ferias_funcionario
    WHERE id_funcionario = p_id_veterinario
      AND p_data BETWEEN data_inicio AND data_fim;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Veterinário encontra-se de férias nessa data';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM horario_trabalho
    WHERE id_funcionario = p_id_veterinario
      AND dia_semana = TO_CHAR(p_data, 'FMDay')
      AND p_hora >= hora_inicio
      AND p_hora < hora_fim;

    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Veterinário não trabalha nesse dia ou nessa hora';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM consulta
    WHERE id_veterinario = p_id_veterinario
      AND data = p_data
      AND hora = p_hora
      AND estado_consulta IN ('Agendada', 'Marcada', 'Confirmada');

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Já existe consulta neste horário';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM consulta
    WHERE id_animal = p_id_animal
      AND data = p_data
      AND hora = p_hora
      AND estado_consulta IN ('Agendada', 'Marcada', 'Confirmada');

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'O animal já tem uma consulta marcada nessa data e hora';
    END IF;

    INSERT INTO consulta (
        data,
        hora,
        data_hora,
        motivo,
        estado,
        estado_consulta,
        resposta_cliente,
        observacoes,
        id_animal,
        id_veterinario,
        id_servico
    )
    VALUES (
        p_data,
        p_hora,
        (p_data + p_hora),
        p_motivo,
        'Agendada',
        'Marcada',
        'Pendente',
        'Consulta marcada através do sistema',
        p_id_animal,
        p_id_veterinario,
        p_id_servico
    );
END;
$$;

-- =====================================================
-- FUNÇÃO VERIFICAR DISPONIBILIDADE DO VETERINÁRIO
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_disponibilidade_veterinario(
    p_id_veterinario INT,
    p_data DATE,
    p_hora TIME
)
RETURNS VARCHAR AS $$
DECLARE
    v_existe INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_existe
    FROM ferias_funcionario
    WHERE id_funcionario = p_id_veterinario
      AND p_data BETWEEN data_inicio AND data_fim;

    IF v_existe > 0 THEN
        RETURN 'Veterinário indisponível: encontra-se de férias';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM horario_trabalho
    WHERE id_funcionario = p_id_veterinario
      AND dia_semana = TO_CHAR(p_data, 'FMDay')
      AND p_hora >= hora_inicio
      AND p_hora < hora_fim;

    IF v_existe = 0 THEN
        RETURN 'Veterinário indisponível: fora do horário de trabalho';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM consulta
    WHERE id_veterinario = p_id_veterinario
      AND data = p_data
      AND hora = p_hora
      AND estado_consulta IN ('Agendada', 'Marcada', 'Confirmada');

    IF v_existe > 0 THEN
        RETURN 'Veterinário indisponível: já tem consulta marcada';
    END IF;

    RETURN 'Veterinário disponível';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PROCEDURA DESMARCAR CONSULTA PELO CLIENTE (COM REEMBOLSO)
-- =====================================================
CREATE OR REPLACE PROCEDURE desmarcar_consulta_cliente(
    IN p_id_consulta INT,
    IN p_id_cliente INT,
    IN p_nova_data DATE DEFAULT NULL,
    IN p_nova_hora TIME DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_animal INT;
    v_id_veterinario INT;
    v_estado VARCHAR;
    v_motivo VARCHAR;
    v_observacoes VARCHAR;
    v_id_servico INT;
    v_disponibilidade VARCHAR;
    v_existe INT;
BEGIN
    SELECT
        c.id_animal,
        c.id_veterinario,
        c.estado_consulta,
        c.motivo,
        c.observacoes,
        c.id_servico
    INTO
        v_id_animal,
        v_id_veterinario,
        v_estado,
        v_motivo,
        v_observacoes,
        v_id_servico
    FROM consulta c
    INNER JOIN animal a ON c.id_animal = a.id_animal
    WHERE c.id_consulta = p_id_consulta
      AND a.id_cliente = p_id_cliente;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Consulta não encontrada ou não pertence ao cliente indicado';
    END IF;

    IF v_estado IN ('Cancelada', 'Concluida', 'Remarcada', 'Faltou') THEN
        RAISE EXCEPTION 'Esta consulta já não pode ser desmarcada';
    END IF;

    IF p_nova_data IS NULL AND p_nova_hora IS NULL THEN
        UPDATE consulta
        SET estado = 'Cancelada',
            estado_consulta = 'Cancelada'
        WHERE id_consulta = p_id_consulta;

        -- Reembolsa automaticamente se a consulta já tivesse sido paga
        UPDATE pagamento
        SET estado_pagamento = 'Reembolsado'
        WHERE id_consulta = p_id_consulta
          AND estado_pagamento = 'Pago';

    ELSIF p_nova_data IS NOT NULL AND p_nova_hora IS NOT NULL THEN
        IF p_nova_data < CURRENT_DATE THEN
            RAISE EXCEPTION 'Não é possível remarcar para uma data passada';
        END IF;

        v_disponibilidade := verificar_disponibilidade_veterinario(
            v_id_veterinario,
            p_nova_data,
            p_nova_hora
        );

        IF v_disponibilidade <> 'Veterinário disponível' THEN
            RAISE EXCEPTION '%', v_disponibilidade;
        END IF;

        SELECT COUNT(*)
        INTO v_existe
        FROM consulta
        WHERE id_animal = v_id_animal
          AND data = p_nova_data
          AND hora = p_nova_hora
          AND estado_consulta IN ('Agendada', 'Marcada', 'Confirmada');

        IF v_existe > 0 THEN
            RAISE EXCEPTION 'O animal já tem consulta nesse horário';
        END IF;

        UPDATE consulta
        SET estado = 'Remarcada',
            estado_consulta = 'Remarcada'
        WHERE id_consulta = p_id_consulta;

        INSERT INTO consulta (
            data,
            hora,
            data_hora,
            motivo,
            observacoes,
            estado,
            estado_consulta,
            resposta_cliente,
            consulta_origem,
            id_animal,
            id_veterinario,
            id_servico
        )
        VALUES (
            p_nova_data,
            p_nova_hora,
            (p_nova_data + p_nova_hora),
            v_motivo,
            v_observacoes,
            'Agendada',
            'Marcada',
            'Pendente',
            p_id_consulta,
            v_id_animal,
            v_id_veterinario,
            v_id_servico
        );
    ELSE
        RAISE EXCEPTION 'Para remarcar deve indicar nova data e nova hora';
    END IF;
END;
$$;

-- =====================================================
-- PROCEDURA CANCELAR CONSULTA (COM REEMBOLSO AUTOMÁTICO)
-- =====================================================
CREATE OR REPLACE PROCEDURE cancelar_consulta(
    IN p_id_consulta INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_estado VARCHAR;
BEGIN
    SELECT estado_consulta
    INTO v_estado
    FROM consulta
    WHERE id_consulta = p_id_consulta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Consulta não encontrada';
    END IF;

    IF v_estado = 'Cancelada' THEN
        RAISE EXCEPTION 'A consulta já se encontra cancelada';
    END IF;

    UPDATE consulta
    SET estado = 'Cancelada',
        estado_consulta = 'Cancelada'
    WHERE id_consulta = p_id_consulta;

    UPDATE pagamento
    SET estado_pagamento = 'Reembolsado'
    WHERE id_consulta = p_id_consulta
      AND estado_pagamento = 'Pago';
END;
$$;

-- =====================================================
-- PROCEDURA GERAR FATURA (COMPATÍVEL COM SITE E BD)
-- =====================================================
CREATE OR REPLACE PROCEDURE gerar_fatura(
    IN p_id_consulta INT,
    IN p_valor_total DECIMAL(8,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
    v_estado VARCHAR;
BEGIN
    SELECT estado_consulta
    INTO v_estado
    FROM consulta
    WHERE id_consulta = p_id_consulta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Consulta não encontrada';
    END IF;

    IF v_estado = 'Cancelada' THEN
        RAISE EXCEPTION 'Não é possível gerar fatura para consultas canceladas';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM fatura
    WHERE id_consulta = p_id_consulta;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Esta consulta já tem fatura associada';
    END IF;

    IF p_valor_total <= 0 THEN
        RAISE EXCEPTION 'O valor da fatura deve ser superior a zero';
    END IF;

    INSERT INTO fatura (
        data,
        valor_total,
        id_consulta
    )
    VALUES (
        CURRENT_DATE,
        p_valor_total,
        p_id_consulta
    );
END;
$$;

-- =====================================================
-- PROCEDURA REGISTAR PAGAMENTO (COMPATÍVEL COM SITE E BD)
-- =====================================================
CREATE OR REPLACE PROCEDURE registar_pagamento(
    IN p_id_fatura INT,
    IN p_valor DECIMAL(8,2),
    IN p_metodo_pagamento VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
    v_valor_fatura DECIMAL(8,2);
    v_id_consulta INT;
BEGIN
    SELECT valor_total, id_consulta
    INTO v_valor_fatura, v_id_consulta
    FROM fatura
    WHERE id_fatura = p_id_fatura;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Fatura não encontrada';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM pagamento
    WHERE id_fatura = p_id_fatura
      AND estado_pagamento = 'Pago';

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Esta fatura já se encontra paga';
    END IF;

    IF p_valor <= 0 THEN
        RAISE EXCEPTION 'O valor do pagamento deve ser superior a zero';
    END IF;

    IF p_valor < v_valor_fatura THEN
        RAISE EXCEPTION 'O valor pago é inferior ao valor da fatura';
    END IF;

    IF p_metodo_pagamento NOT IN (
        'Cartão',
        'Cartão de Crédito',
        'Multibanco',
        'Dinheiro',
        'MB WAY',
        'Transferência'
    ) THEN
        RAISE EXCEPTION 'Método de pagamento inválido';
    END IF;

    INSERT INTO pagamento (
        id_consulta,
        id_fatura,
        data_pagamento,
        valor,
        metodo_pagamento,
        estado_pagamento
    )
    VALUES (
        v_id_consulta,
        p_id_fatura,
        CURRENT_TIMESTAMP,
        p_valor,
        p_metodo_pagamento,
        'Pago'
    );
END;
$$;

-- =====================================================
-- FUNÇÃO REGISTAR ADOÇÃO
-- =====================================================
CREATE OR REPLACE FUNCTION registar_adocao(
    p_data_adocao DATE,
    p_id_cliente INT,
    p_id_animal INT,
    p_id_funcionario INT
)
RETURNS VOID AS $$
DECLARE
    v_existe INTEGER;
    v_estado_animal VARCHAR;
    v_data_recolha DATE;
BEGIN
    SELECT COUNT(*) INTO v_existe FROM cliente WHERE id_cliente = p_id_cliente;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Cliente não existe';
    END IF;

    SELECT estado, data_recolha
    INTO v_estado_animal, v_data_recolha
    FROM animal
    WHERE id_animal = p_id_animal;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Animal não existe';
    END IF;

    IF v_estado_animal <> 'Resgatado' THEN
        RAISE EXCEPTION 'Apenas animais resgatados podem ser adotados';
    END IF;

    IF v_data_recolha IS NOT NULL AND p_data_adocao < v_data_recolha THEN
        RAISE EXCEPTION 'A data de adoção não pode ser anterior à data de recolha';
    END IF;

    SELECT COUNT(*) INTO v_existe FROM funcionario WHERE id_funcionario = p_id_funcionario;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Funcionário não existe';
    END IF;

    SELECT COUNT(*) INTO v_existe FROM adocao WHERE id_animal = p_id_animal;
    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Este animal já foi adotado';
    END IF;

    INSERT INTO adocao (
        data_adocao,
        id_cliente,
        id_animal,
        id_funcionario
    )
    VALUES (
        p_data_adocao,
        p_id_cliente,
        p_id_animal,
        p_id_funcionario
    );

    UPDATE animal
    SET estado = 'Domestico',
        estado_adocao = 'Adotado',
        id_cliente = p_id_cliente
    WHERE id_animal = p_id_animal;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PROCEDURA ENVIAR LEMBRETES DE CONSULTAS
-- =====================================================
CREATE OR REPLACE PROCEDURE enviar_lembretes_consultas()
LANGUAGE plpgsql
AS $$
DECLARE
    reg RECORD;
    v_existe INTEGER;
BEGIN
    FOR reg IN
        SELECT
            c.id_consulta,
            cl.id_cliente,
            cl.nome_completo,
            a.nome AS nome_animal
        FROM consulta c
        INNER JOIN animal a ON c.id_animal = a.id_animal
        INNER JOIN cliente cl ON a.id_cliente = cl.id_cliente
        WHERE c.data = CURRENT_DATE + 1
          AND c.estado_consulta IN ('Agendada', 'Marcada', 'Confirmada')
    LOOP
        SELECT COUNT(*)
        INTO v_existe
        FROM notificacao
        WHERE id_consulta = reg.id_consulta
          AND id_cliente = reg.id_cliente;

        IF v_existe = 0 THEN
            INSERT INTO notificacao (
                id_consulta,
                id_cliente,
                data_hora_envio,
                mensagem,
                antecedencia_horas,
                resposta_cliente
            )
            VALUES (
                reg.id_consulta,
                reg.id_cliente,
                CURRENT_TIMESTAMP,
                'Bom dia cliente ' || reg.nome_completo ||
                ', relembro que amanhã tem uma consulta marcada para o seu animal ' ||
                reg.nome_animal || '.',
                24,
                NULL
            );
        END IF;
    END LOOP;
END;
$$;

-- =====================================================
-- PROCEDURA GERAR RESUMO DE PRESCRIÇÕES MENSAIS
-- =====================================================
CREATE OR REPLACE PROCEDURE gerar_resumo_prescricoes_mensal()
LANGUAGE plpgsql
AS $$
DECLARE
    v_registo RECORD;
    v_prescricoes TEXT;

    cursor_consultas CURSOR FOR
        SELECT DISTINCT
            cl.id_cliente,
            cl.nome_completo AS nome_cliente,
            a.id_animal,
            a.nome AS nome_animal,
            EXTRACT(MONTH FROM c.data)::INT AS mes,
            EXTRACT(YEAR FROM c.data)::INT AS ano
        FROM consulta c
        INNER JOIN animal a ON c.id_animal = a.id_animal
        INNER JOIN cliente cl ON a.id_cliente = cl.id_cliente
        LEFT JOIN receita_medica rm ON c.id_consulta = rm.id_consulta
        LEFT JOIN prescricao_exame pe ON c.id_consulta = pe.id_consulta
        WHERE rm.id_consulta IS NOT NULL
           OR pe.id_consulta IS NOT NULL;
BEGIN
    DELETE FROM resumo_prescricoes_mensal;

    OPEN cursor_consultas;

    LOOP
        FETCH cursor_consultas INTO v_registo;
        EXIT WHEN NOT FOUND;

        SELECT STRING_AGG(descricao_prescricao, ', ')
        INTO v_prescricoes
        FROM (
            SELECT medicamento.nome_comercial || ' - ' || receita_medica.instrucoes AS descricao_prescricao
            FROM consulta
            INNER JOIN receita_medica ON consulta.id_consulta = receita_medica.id_consulta
            INNER JOIN medicamento ON receita_medica.id_medicamento = medicamento.id_medicamento
            WHERE consulta.id_animal = v_registo.id_animal
              AND EXTRACT(MONTH FROM consulta.data)::INT = v_registo.mes
              AND EXTRACT(YEAR FROM consulta.data)::INT = v_registo.ano

            UNION ALL

            SELECT exame.nome_exame || ' - ' || prescricao_exame.observacoes AS descricao_prescricao
            FROM consulta
            INNER JOIN prescricao_exame ON consulta.id_consulta = prescricao_exame.id_consulta
            INNER JOIN exame ON prescricao_exame.id_exame = exame.id_exame
            WHERE consulta.id_animal = v_registo.id_animal
              AND EXTRACT(MONTH FROM consulta.data)::INT = v_registo.mes
              AND EXTRACT(YEAR FROM consulta.data)::INT = v_registo.ano
        ) prescricoes;

        INSERT INTO resumo_prescricoes_mensal (
            id_cliente,
            id_animal,
            nome_cliente,
            nome_animal,
            mes,
            ano,
            lista_prescricoes
        )
        VALUES (
            v_registo.id_cliente,
            v_registo.id_animal,
            v_registo.nome_cliente,
            v_registo.nome_animal,
            v_registo.mes,
            v_registo.ano,
            v_prescricoes
        );

        v_prescricoes := NULL;
    END LOOP;

    CLOSE cursor_consultas;
END;
$$;

-- =====================================================
-- PROCEDURA REMARCAR CONSULTA
-- =====================================================
CREATE OR REPLACE PROCEDURE remarcar_consulta(
    IN p_id_consulta INT,
    IN p_nova_data DATE,
    IN p_nova_hora TIME
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
    v_id_animal INTEGER;
    v_id_veterinario INTEGER;
    v_estado VARCHAR;
BEGIN
    SELECT id_animal, id_veterinario, estado_consulta
    INTO v_id_animal, v_id_veterinario, v_estado
    FROM consulta
    WHERE id_consulta = p_id_consulta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Consulta não encontrada';
    END IF;

    IF v_estado = 'Cancelada' THEN
        RAISE EXCEPTION 'Não é possível remarcar uma consulta cancelada';
    END IF;

    IF p_nova_data < CURRENT_DATE THEN
        RAISE EXCEPTION 'Não é possível remarcar consulta para uma data passada';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM ferias_funcionario
    WHERE id_funcionario = v_id_veterinario
      AND p_nova_data BETWEEN data_inicio AND data_fim;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Veterinário encontra-se de férias nessa data';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM horario_trabalho
    WHERE id_funcionario = v_id_veterinario
      AND dia_semana = TO_CHAR(p_nova_data, 'FMDay')
      AND p_nova_hora >= hora_inicio
      AND p_nova_hora < hora_fim;

    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Veterinário não trabalha nesse dia ou nessa hora';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM consulta
    WHERE id_veterinario = v_id_veterinario
      AND data = p_nova_data
      AND hora = p_nova_hora
      AND estado_consulta IN ('Agendada', 'Marcada', 'Confirmada')
      AND id_consulta <> p_id_consulta;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Veterinário já tem consulta nesse horário';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM consulta
    WHERE id_animal = v_id_animal
      AND data = p_nova_data
      AND hora = p_nova_hora
      AND estado_consulta IN ('Agendada', 'Marcada', 'Confirmada')
      AND id_consulta <> p_id_consulta;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'O animal já tem consulta nesse horário';
    END IF;

    UPDATE consulta
    SET data = p_nova_data,
        hora = p_nova_hora,
        data_hora = (p_nova_data + p_nova_hora)
    WHERE id_consulta = p_id_consulta;
END;
$$;

-- =====================================================
-- PROCEDURA REGISTAR HORÁRIO DE TRABALHO
-- =====================================================
CREATE OR REPLACE PROCEDURE registar_horario_trabalho(
    IN p_id_funcionario INT,
    IN p_dia_semana VARCHAR,
    IN p_hora_inicio TIME,
    IN p_hora_fim TIME
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_existe FROM funcionario WHERE id_funcionario = p_id_funcionario;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Funcionário não existe';
    END IF;

    IF p_hora_inicio >= p_hora_fim THEN
        RAISE EXCEPTION 'A hora de início deve ser inferior à hora de fim';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM horario_trabalho
    WHERE id_funcionario = p_id_funcionario
      AND dia_semana = p_dia_semana;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Já existe horário registado para este funcionário nesse dia';
    END IF;

    INSERT INTO horario_trabalho (
        id_funcionario,
        dia_semana,
        hora_inicio,
        hora_fim
    )
    VALUES (
        p_id_funcionario,
        p_dia_semana,
        p_hora_inicio,
        p_hora_fim
    );
END;
$$;

-- =====================================================
-- PROCEDURA REGISTAR FÉRIAS DO FUNCIONÁRIO
-- =====================================================
CREATE OR REPLACE PROCEDURE registar_ferias_funcionario(
    IN p_id_funcionario INT,
    IN p_data_inicio DATE,
    IN p_data_fim DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_existe FROM funcionario WHERE id_funcionario = p_id_funcionario;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Funcionário não existe';
    END IF;

    IF p_data_inicio > p_data_fim THEN
        RAISE EXCEPTION 'A data de início não pode ser superior à data de fim';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM ferias_funcionario
    WHERE id_funcionario = p_id_funcionario
      AND (
          p_data_inicio BETWEEN data_inicio AND data_fim
          OR p_data_fim BETWEEN data_inicio AND data_fim
          OR data_inicio BETWEEN p_data_inicio AND p_data_fim
      );

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Já existem férias registadas nesse período';
    END IF;

    INSERT INTO ferias_funcionario (
        id_funcionario,
        data_inicio,
        data_fim
    )
    VALUES (
        p_id_funcionario,
        p_data_inicio,
        p_data_fim
    );
END;
$$;

-- =====================================================
-- PROCEDURA EMITIR RECEITA MÉDICA
-- =====================================================
CREATE OR REPLACE PROCEDURE emitir_receita_medica(
    IN p_id_consulta INT,
    IN p_id_medicamento INT,
    IN p_instrucoes VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
    v_estado VARCHAR;
BEGIN
    SELECT estado_consulta INTO v_estado FROM consulta WHERE id_consulta = p_id_consulta;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Consulta não existe';
    END IF;

    IF v_estado NOT IN ('Concluida', 'Confirmada') THEN
        RAISE EXCEPTION 'Só é possível emitir receitas para consultas realizadas';
    END IF;

    SELECT COUNT(*) INTO v_existe FROM medicamento WHERE id_medicamento = p_id_medicamento;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Medicamento não existe';
    END IF;

    IF p_instrucoes IS NULL OR TRIM(p_instrucoes) = '' THEN
        RAISE EXCEPTION 'As instruções da receita são obrigatórias';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM receita_medica
    WHERE id_consulta = p_id_consulta
      AND id_medicamento = p_id_medicamento;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Este medicamento já está associado a esta consulta';
    END IF;

    INSERT INTO receita_medica (
        id_consulta,
        id_medicamento,
        instrucoes
    )
    VALUES (
        p_id_consulta,
        p_id_medicamento,
        p_instrucoes
    );
END;
$$;

-- =====================================================
-- PROCEDURA EMITIR PRESCRIÇÃO DE EXAME
-- =====================================================
CREATE OR REPLACE PROCEDURE emitir_prescricao_exame(
    IN p_id_consulta INT,
    IN p_id_exame INT,
    IN p_observacoes VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
    v_estado VARCHAR;
BEGIN
    SELECT estado_consulta INTO v_estado FROM consulta WHERE id_consulta = p_id_consulta;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Consulta não existe';
    END IF;

    IF v_estado NOT IN ('Concluida', 'Confirmada') THEN
        RAISE EXCEPTION 'Só é possível prescrever exames em consultas válidas';
    END IF;

    SELECT COUNT(*) INTO v_existe FROM exame WHERE id_exame = p_id_exame;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Exame não existe';
    END IF;

    SELECT COUNT(*)
    INTO v_existe
    FROM prescricao_exame
    WHERE id_consulta = p_id_consulta
      AND id_exame = p_id_exame;

    IF v_existe > 0 THEN
        RAISE EXCEPTION 'Este exame já está associado à consulta';
    END IF;

    IF p_observacoes IS NULL OR TRIM(p_observacoes) = '' THEN
        RAISE EXCEPTION 'As observações do exame são obrigatórias';
    END IF;

    INSERT INTO prescricao_exame (
        id_consulta,
        id_exame,
        observacoes
    )
    VALUES (
        p_id_consulta,
        p_id_exame,
        p_observacoes
    );
END;
$$;

-- =====================================================
-- PROCEDURA ALTERAR ESTADO DA CONSULTA (+ REEMBOLSO SE CANCELADA)
-- =====================================================
CREATE OR REPLACE PROCEDURE alterar_estado_consulta(
    IN p_id_consulta INT,
    IN p_novo_estado VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_existe FROM consulta WHERE id_consulta = p_id_consulta;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Consulta não encontrada';
    END IF;

    IF p_novo_estado NOT IN (
        'Agendada',
        'Marcada',
        'Confirmada',
        'Concluida',
        'Cancelada',
        'Remarcada',
        'Faltou'
    ) THEN
        RAISE EXCEPTION 'Estado da consulta inválido';
    END IF;

    UPDATE consulta
    SET estado = p_novo_estado,
        estado_consulta = p_novo_estado
    WHERE id_consulta = p_id_consulta;

    IF p_novo_estado = 'Cancelada' THEN
        UPDATE pagamento
        SET estado_pagamento = 'Reembolsado'
        WHERE id_consulta = p_id_consulta
          AND estado_pagamento = 'Pago';
    END IF;
END;
$$;

-- =====================================================
-- FUNÇÃO CONSULTAR HISTÓRICO DO ANIMAL
-- =====================================================
DROP FUNCTION IF EXISTS consultar_historico_animal(INT);

CREATE OR REPLACE FUNCTION consultar_historico_animal(
    p_id_animal INT
)
RETURNS TABLE (
    id_consulta INT,
    data_consulta DATE,
    hora_consulta TIME,
    motivo VARCHAR,
    estado_consulta VARCHAR,
    medicamento VARCHAR,
    instrucoes VARCHAR,
    exame VARCHAR,
    observacoes_exame VARCHAR
)
AS $$
DECLARE
    v_existe INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_existe FROM animal WHERE id_animal = p_id_animal;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Animal não encontrado';
    END IF;

    RETURN QUERY
    SELECT
        c.id_consulta,
        c.data,
        c.hora,
        c.motivo,
        c.estado_consulta,
        m.nome_comercial,
        rm.instrucoes,
        e.nome_exame,
        pe.observacoes
    FROM consulta c
    LEFT JOIN receita_medica rm ON c.id_consulta = rm.id_consulta
    LEFT JOIN medicamento m ON rm.id_medicamento = m.id_medicamento
    LEFT JOIN prescricao_exame pe ON c.id_consulta = pe.id_consulta
    LEFT JOIN exame e ON pe.id_exame = e.id_exame
    WHERE c.id_animal = p_id_animal
    ORDER BY c.data DESC, c.hora DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO AUTOMÁTICA PARA REGISTAR LOGS (USA SERIAL)
-- =====================================================
CREATE OR REPLACE FUNCTION registar_log_automatico()
RETURNS TRIGGER AS $$
DECLARE
    v_id_sessao INT;
    v_registo JSONB;
    v_chave TEXT;
BEGIN
    SELECT id_sessao
    INTO v_id_sessao
    FROM sessao
    WHERE data_hora_fim IS NULL
    ORDER BY data_hora_inicio DESC
    LIMIT 1;

    IF v_id_sessao IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'DELETE' THEN
        v_registo := to_jsonb(OLD);
    ELSE
        v_registo := to_jsonb(NEW);
    END IF;

    v_chave := COALESCE(
        v_registo ->> 'id_consulta',
        v_registo ->> 'id_animal',
        v_registo ->> 'id_cliente',
        v_registo ->> 'id_fatura',
        v_registo ->> 'id_pagamento',
        v_registo ->> 'id_adocao',
        v_registo ->> 'id_exame',
        'sem chave identificada'
    );

    INSERT INTO log_acao (
        id_sessao,
        tabela_afetada,
        tipo_acao,
        chave_registo,
        data_hora,
        descricao
    )
    VALUES (
        v_id_sessao,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'UPDATE' THEN 'ALTERACAO'
            WHEN TG_OP = 'DELETE' THEN 'ELIMINACAO'
        END,
        v_chave,
        CURRENT_TIMESTAMP,
        'Operação ' || TG_OP || ' realizada na tabela ' || TG_TABLE_NAME
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS DE LOG
-- =====================================================
DROP TRIGGER IF EXISTS trg_log_cliente ON cliente;
DROP TRIGGER IF EXISTS trg_log_animal ON animal;
DROP TRIGGER IF EXISTS trg_log_consulta ON consulta;
DROP TRIGGER IF EXISTS trg_log_fatura ON fatura;
DROP TRIGGER IF EXISTS trg_log_pagamento ON pagamento;
DROP TRIGGER IF EXISTS trg_log_adocao ON adocao;
DROP TRIGGER IF EXISTS trg_log_exame ON exame;

CREATE TRIGGER trg_log_cliente
AFTER UPDATE OR DELETE ON cliente
FOR EACH ROW EXECUTE FUNCTION registar_log_automatico();

CREATE TRIGGER trg_log_animal
AFTER UPDATE OR DELETE ON animal
FOR EACH ROW EXECUTE FUNCTION registar_log_automatico();

CREATE TRIGGER trg_log_consulta
AFTER UPDATE OR DELETE ON consulta
FOR EACH ROW EXECUTE FUNCTION registar_log_automatico();

CREATE TRIGGER trg_log_fatura
AFTER UPDATE OR DELETE ON fatura
FOR EACH ROW EXECUTE FUNCTION registar_log_automatico();

CREATE TRIGGER trg_log_pagamento
AFTER UPDATE OR DELETE ON pagamento
FOR EACH ROW EXECUTE FUNCTION registar_log_automatico();

CREATE TRIGGER trg_log_adocao
AFTER UPDATE OR DELETE ON adocao
FOR EACH ROW EXECUTE FUNCTION registar_log_automatico();

CREATE TRIGGER trg_log_exame
AFTER UPDATE OR DELETE ON exame
FOR EACH ROW EXECUTE FUNCTION registar_log_automatico();