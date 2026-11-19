-- =====================================================
-- 1. APAGAR TABELAS E VISTAS EXISTENTES
-- =====================================================
DROP VIEW IF EXISTS vw_adocoes_completas CASCADE;
DROP VIEW IF EXISTS vw_faturacao_pagamentos CASCADE;
DROP VIEW IF EXISTS vw_consultas_completas CASCADE;
DROP VIEW IF EXISTS vw_veterinarios_completos CASCADE;
DROP VIEW IF EXISTS vw_funcionario CASCADE;

DROP TABLE IF EXISTS resumo_prescricoes_mensal CASCADE;
DROP TABLE IF EXISTS log_acao CASCADE;
DROP TABLE IF EXISTS notificacao CASCADE;
DROP TABLE IF EXISTS pagamento CASCADE;
DROP TABLE IF EXISTS fatura CASCADE;
DROP TABLE IF EXISTS receita_medica CASCADE;
DROP TABLE IF EXISTS prescricao_exame CASCADE;
DROP TABLE IF EXISTS exame CASCADE;
DROP TABLE IF EXISTS medicamento CASCADE;
DROP TABLE IF EXISTS consulta CASCADE;
DROP TABLE IF EXISTS tipo_servico CASCADE;
DROP TABLE IF EXISTS adocao CASCADE;
DROP TABLE IF EXISTS pedido_adocao CASCADE;
DROP TABLE IF EXISTS animal CASCADE;
DROP TABLE IF EXISTS entidade_recolha CASCADE;
DROP TABLE IF EXISTS ferias_funcionario CASCADE;
DROP TABLE IF EXISTS horario_trabalho CASCADE;
DROP TABLE IF EXISTS sessao CASCADE;
DROP TABLE IF EXISTS veterinario CASCADE;
DROP TABLE IF EXISTS funcionario CASCADE;
DROP TABLE IF EXISTS configuracao CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS utilizador CASCADE;

-- =====================================================
-- 2. UTILIZADOR (Compatível com App Web + Procedures BD)
-- =====================================================
CREATE TABLE utilizador (
    id_utilizador SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    mail VARCHAR(100) UNIQUE,
    numero_telemovel VARCHAR(20) DEFAULT '910000000',
    nacionalidade VARCHAR(50) DEFAULT 'Portuguesa',
    profissao VARCHAR(80) DEFAULT 'Cliente',
    password_hash VARCHAR(255),
    senha VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    tipo_utilizador VARCHAR(30) NOT NULL DEFAULT 'Cliente'
        CHECK (tipo_utilizador IN ('Administrador', 'Funcionario', 'Veterinario', 'Cliente')),
    ultimo_login TIMESTAMP(0) DEFAULT NOW()
);

-- =====================================================
-- 3. CLIENTE (Compatível com App Web + Inserts BD)
-- =====================================================
CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    id_utilizador INT UNIQUE,
    nome_completo VARCHAR(100),
    morada VARCHAR(150) NOT NULL DEFAULT 'Morada por definir',
    telefone VARCHAR(20) NOT NULL DEFAULT '910000000',
    email VARCHAR(100),
    nif CHAR(9) UNIQUE NOT NULL,
    data_nascimento DATE,

    FOREIGN KEY (id_utilizador)
        REFERENCES utilizador(id_utilizador)
        ON DELETE CASCADE
);

-- =====================================================
-- 4. FUNCIONARIO & VETERINARIO
-- =====================================================
CREATE TABLE funcionario (
    id_funcionario SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    morada VARCHAR(150) NOT NULL DEFAULT 'Clínica MiACaoMiGo - Lisboa',
    email VARCHAR(100) UNIQUE NOT NULL,
    nif CHAR(9) UNIQUE NOT NULL,
    contacto_profissional VARCHAR(20) NOT NULL,
    id_utilizador INT UNIQUE,

    FOREIGN KEY (id_utilizador)
        REFERENCES utilizador(id_utilizador)
        ON DELETE RESTRICT
);

CREATE TABLE veterinario (
    id_veterinario INT PRIMARY KEY,
    especialidade VARCHAR(80) NOT NULL DEFAULT 'Clínica Geral',

    FOREIGN KEY (id_veterinario)
        REFERENCES funcionario(id_funcionario)
        ON DELETE RESTRICT
);

-- =====================================================
-- 5. SESSAO, LOGS, HORARIOS, FERIAS & CONFIGURACAO
-- =====================================================
CREATE TABLE sessao (
    id_sessao SERIAL PRIMARY KEY,
    id_utilizador INT NOT NULL,
    data_hora_inicio TIMESTAMP(0) NOT NULL DEFAULT NOW(),
    data_hora_fim TIMESTAMP(0),

    FOREIGN KEY (id_utilizador)
        REFERENCES utilizador(id_utilizador)
        ON DELETE RESTRICT
);

CREATE TABLE log_acao (
    id_log SERIAL PRIMARY KEY,
    id_sessao INT NOT NULL,
    tabela_afetada VARCHAR(50) NOT NULL,
    tipo_acao VARCHAR(20) NOT NULL
        CHECK (tipo_acao IN ('ALTERACAO', 'ELIMINACAO')),
    chave_registo VARCHAR(100),
    data_hora TIMESTAMP(0) NOT NULL DEFAULT NOW(),
    descricao TEXT,

    FOREIGN KEY (id_sessao)
        REFERENCES sessao(id_sessao)
        ON DELETE RESTRICT
);

CREATE TABLE horario_trabalho (
    id_horario SERIAL PRIMARY KEY,
    id_funcionario INT NOT NULL,
    dia_semana VARCHAR(15) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    CHECK (hora_inicio < hora_fim),

    FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario)
        ON DELETE CASCADE
);

CREATE TABLE ferias_funcionario (
    id_ferias SERIAL PRIMARY KEY,
    id_funcionario INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    CHECK (data_inicio <= data_fim),

    FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario)
        ON DELETE CASCADE
);

CREATE TABLE configuracao (
    id_configuracao SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor VARCHAR(100) NOT NULL,
    descricao VARCHAR(200)
);

-- =====================================================
-- 6. TIPO DE SERVIÇO & ENTIDADE RECOLHA
-- =====================================================
CREATE TABLE tipo_servico (
    id_servico SERIAL PRIMARY KEY,
    nome_servico VARCHAR(80) UNIQUE NOT NULL,
    descricao VARCHAR(200),
    preco_base DECIMAL(8,2) NOT NULL CHECK (preco_base > 0)
);

CREATE TABLE entidade_recolha (
    id_entidade SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    contacto VARCHAR(20),
    localizacao VARCHAR(100) NOT NULL
);

-- =====================================================
-- 7. ANIMAL (Compatível com App Web + Procedures BD)
-- =====================================================
CREATE TABLE animal (
    id_animal SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(50) DEFAULT 'Sem raça definida',
    idade VARCHAR(30),
    data_nascimento DATE,
    sexo VARCHAR(15),
    porte VARCHAR(30),
    descricao TEXT,
    foto_url TEXT,
    estado VARCHAR(20) DEFAULT 'Domestico'
        CHECK (estado IN ('Domestico', 'Resgatado')),
    estado_adocao VARCHAR(30) NOT NULL DEFAULT 'Não aplicável'
        CHECK (estado_adocao IN ('Disponível', 'Adotado', 'Não aplicável')),
    data_recolha DATE,
    local_encontrado VARCHAR(100),
    estado_clinico_inicial VARCHAR(100),
    id_cliente INT,
    id_entidade INT,

    FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON DELETE SET NULL,

    FOREIGN KEY (id_entidade)
        REFERENCES entidade_recolha(id_entidade)
        ON DELETE SET NULL
);

-- =====================================================
-- 8. PEDIDOS DE ADOÇÃO & ADOÇÃO (ENRIQUECIDA)
-- =====================================================
CREATE TABLE pedido_adocao (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_animal INT NOT NULL,
    data_pedido TIMESTAMP NOT NULL DEFAULT NOW(),
    estado VARCHAR(30) NOT NULL DEFAULT 'Pendente'
        CHECK (estado IN ('Pendente', 'Aprovado', 'Rejeitado')),
    tipo_habitacao VARCHAR(80),
    outros_animais VARCHAR(20),
    experiencia_animais VARCHAR(120),
    motivo TEXT,
    observacoes TEXT,

    FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON DELETE CASCADE,

    FOREIGN KEY (id_animal)
        REFERENCES animal(id_animal)
        ON DELETE CASCADE
);

CREATE TABLE adocao (
    id_adocao SERIAL PRIMARY KEY,
    data_adocao DATE NOT NULL DEFAULT CURRENT_DATE,
    id_cliente INT NOT NULL,
    id_animal INT UNIQUE NOT NULL,
    id_funcionario INT,
    id_pedido INT UNIQUE,
    tipo_habitacao VARCHAR(80),
    outros_animais VARCHAR(20),
    experiencia_animais VARCHAR(120),
    motivo TEXT,
    estado_acompanhamento VARCHAR(40) NOT NULL DEFAULT 'Concluída'
        CHECK (estado_acompanhamento IN ('Concluída', 'Em Acompanhamento', 'Cancelada')),

    FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON DELETE RESTRICT,

    FOREIGN KEY (id_animal)
        REFERENCES animal(id_animal)
        ON DELETE RESTRICT,

    FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario)
        ON DELETE SET NULL,

    FOREIGN KEY (id_pedido)
        REFERENCES pedido_adocao(id_pedido)
        ON DELETE SET NULL
);

-- =====================================================
-- 9. CONSULTA (Compatível com App Web + Procedures BD)
-- =====================================================
CREATE TABLE consulta (
    id_consulta SERIAL PRIMARY KEY,
    data DATE,
    hora TIME,
    data_hora TIMESTAMP,
    motivo VARCHAR(150) NOT NULL,
    observacoes VARCHAR(250),
    estado VARCHAR(30) DEFAULT 'Agendada',
    estado_consulta VARCHAR(30) NOT NULL DEFAULT 'Agendada'
        CHECK (estado_consulta IN ('Agendada', 'Marcada', 'Confirmada', 'Concluida', 'Cancelada', 'Remarcada', 'Faltou')),
    resposta_cliente VARCHAR(20)
        CHECK (resposta_cliente IS NULL OR resposta_cliente IN ('Pendente', 'Confirmada', 'Nao Confirmada')),
    consulta_origem INT,
    id_animal INT NOT NULL,
    id_veterinario INT,
    id_servico INT,

    FOREIGN KEY (consulta_origem)
        REFERENCES consulta(id_consulta)
        ON DELETE SET NULL,

    FOREIGN KEY (id_animal)
        REFERENCES animal(id_animal)
        ON DELETE CASCADE,

    FOREIGN KEY (id_veterinario)
        REFERENCES veterinario(id_veterinario)
        ON DELETE SET NULL,

    FOREIGN KEY (id_servico)
        REFERENCES tipo_servico(id_servico)
        ON DELETE SET NULL
);

-- =====================================================
-- 10. EXAMES, MEDICAMENTOS & RECEITAS
-- =====================================================
CREATE TABLE exame (
    id_exame SERIAL PRIMARY KEY,
    nome_exame VARCHAR(100) NOT NULL,
    descricao VARCHAR(200),
    preco DECIMAL(8,2) NOT NULL CHECK (preco > 0)
);

CREATE TABLE prescricao_exame (
    id_consulta INT,
    id_exame INT,
    observacoes VARCHAR(200),
    PRIMARY KEY (id_consulta, id_exame),

    FOREIGN KEY (id_consulta) REFERENCES consulta(id_consulta) ON DELETE CASCADE,
    FOREIGN KEY (id_exame) REFERENCES exame(id_exame) ON DELETE RESTRICT
);

CREATE TABLE medicamento (
    id_medicamento SERIAL PRIMARY KEY,
    nome_comercial VARCHAR(100) NOT NULL,
    descricao VARCHAR(150),
    dosagem_recomendada VARCHAR(50) NOT NULL
);

CREATE TABLE receita_medica (
    id_consulta INT,
    id_medicamento INT,
    instrucoes VARCHAR(200) NOT NULL,
    PRIMARY KEY (id_consulta, id_medicamento),

    FOREIGN KEY (id_consulta) REFERENCES consulta(id_consulta) ON DELETE CASCADE,
    FOREIGN KEY (id_medicamento) REFERENCES medicamento(id_medicamento) ON DELETE RESTRICT
);

-- =====================================================
-- 11. FATURA & PAGAMENTO (Compatível com App Web + Reembolsos)
-- =====================================================
CREATE TABLE fatura (
    id_fatura SERIAL PRIMARY KEY,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    valor_total DECIMAL(8,2) NOT NULL CHECK (valor_total > 0),
    id_consulta INT UNIQUE NOT NULL,

    FOREIGN KEY (id_consulta)
        REFERENCES consulta(id_consulta)
        ON DELETE CASCADE
);

CREATE TABLE pagamento (
    id_pagamento SERIAL PRIMARY KEY,
    id_consulta INT,
    id_fatura INT,
    data_pagamento TIMESTAMP NOT NULL DEFAULT NOW(),
    valor DECIMAL(8,2) NOT NULL CHECK (valor > 0),
    metodo_pagamento VARCHAR(40) NOT NULL,
    estado_pagamento VARCHAR(20) NOT NULL DEFAULT 'Pendente'
        CHECK (estado_pagamento IN ('Pendente', 'Pago', 'Anulado', 'Reembolsado')),

    FOREIGN KEY (id_consulta)
        REFERENCES consulta(id_consulta)
        ON DELETE CASCADE,

    FOREIGN KEY (id_fatura)
        REFERENCES fatura(id_fatura)
        ON DELETE SET NULL
);

-- =====================================================
-- 12. NOTIFICACAO & RESUMO PRESCRIÇÕES
-- =====================================================
CREATE TABLE notificacao (
    id_notificacao SERIAL PRIMARY KEY,
    id_consulta INT NOT NULL,
    id_cliente INT NOT NULL,
    data_hora_envio TIMESTAMP(0) NOT NULL DEFAULT NOW(),
    mensagem VARCHAR(200) NOT NULL,
    antecedencia_horas INT CHECK (antecedencia_horas IS NULL OR antecedencia_horas > 0),
    resposta_cliente VARCHAR(20)
        CHECK (resposta_cliente IS NULL OR resposta_cliente IN ('Pendente', 'Confirmada', 'Nao Confirmada')),

    FOREIGN KEY (id_consulta) REFERENCES consulta(id_consulta) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE
);

CREATE TABLE resumo_prescricoes_mensal (
    id_resumo SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_animal INT NOT NULL,
    nome_cliente VARCHAR(100) NOT NULL,
    nome_animal VARCHAR(50) NOT NULL,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano INT NOT NULL CHECK (ano >= 2000),
    lista_prescricoes TEXT NOT NULL,

    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_animal) REFERENCES animal(id_animal) ON DELETE CASCADE
);

-- =====================================================
-- 13. TRIGGERS DE SINCRONIZAÇÃO AUTOMÁTICA (CORRIGIDOS)
-- =====================================================
CREATE OR REPLACE FUNCTION fn_sincronizar_utilizador()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email := COALESCE(NEW.email, NEW.mail);
    NEW.mail := COALESCE(NEW.mail, NEW.email);
    NEW.password_hash := COALESCE(NEW.password_hash, NEW.senha);
    NEW.senha := COALESCE(NEW.senha, NEW.password_hash);
    NEW.nacionalidade := COALESCE(NEW.nacionalidade, 'Portuguesa');
    NEW.profissao := COALESCE(NEW.profissao, 'Cliente');
    NEW.numero_telemovel := COALESCE(NEW.numero_telemovel, '910000000');
    NEW.ultimo_login := COALESCE(NEW.ultimo_login, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sincronizar_utilizador
BEFORE INSERT OR UPDATE ON utilizador
FOR EACH ROW
EXECUTE FUNCTION fn_sincronizar_utilizador();

CREATE OR REPLACE FUNCTION fn_sincronizar_consulta()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_hora IS NOT NULL THEN
        NEW.data := COALESCE(NEW.data, NEW.data_hora::date);
        NEW.hora := COALESCE(NEW.hora, NEW.data_hora::time);
    ELSIF NEW.data IS NOT NULL AND NEW.hora IS NOT NULL THEN
        NEW.data_hora := (NEW.data + NEW.hora);
    END IF;

    NEW.estado := COALESCE(NEW.estado, NEW.estado_consulta, 'Agendada');
    NEW.estado_consulta := COALESCE(NEW.estado, NEW.estado_consulta, 'Agendada');

    IF NEW.id_servico IS NULL AND NEW.motivo IS NOT NULL THEN
        SELECT id_servico INTO NEW.id_servico
        FROM tipo_servico
        WHERE LOWER(nome_servico) = LOWER(NEW.motivo)
        LIMIT 1;
    END IF;

    IF NEW.id_veterinario IS NULL AND NEW.observacoes IS NOT NULL THEN
        SELECT v.id_veterinario INTO NEW.id_veterinario
        FROM veterinario v
        JOIN funcionario f ON v.id_veterinario = f.id_funcionario
        WHERE NEW.observacoes ILIKE '%' || f.nome_completo || '%'
        LIMIT 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sincronizar_consulta
BEFORE INSERT OR UPDATE ON consulta
FOR EACH ROW
EXECUTE FUNCTION fn_sincronizar_consulta();

-- Trigger de Adoção: valida na própria tabela adocao (sem conflito com o UPDATE de estado_adocao no animal)
CREATE OR REPLACE FUNCTION fn_sincronizar_adocao()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF EXISTS (SELECT 1 FROM adocao WHERE id_animal = NEW.id_animal) THEN
            RAISE EXCEPTION 'O animal com ID % já foi adotado e não pode ter segunda adoção.', NEW.id_animal;
        END IF;
    END IF;

    IF NEW.id_funcionario IS NULL THEN
        SELECT id_funcionario INTO NEW.id_funcionario
        FROM funcionario
        ORDER BY id_funcionario ASC
        LIMIT 1;
    END IF;

    IF NEW.id_pedido IS NOT NULL THEN
        SELECT
            COALESCE(NEW.tipo_habitacao, tipo_habitacao),
            COALESCE(NEW.outros_animais, outros_animais),
            COALESCE(NEW.experiencia_animais, experiencia_animais),
            COALESCE(NEW.motivo, motivo, observacoes)
        INTO
            NEW.tipo_habitacao,
            NEW.outros_animais,
            NEW.experiencia_animais,
            NEW.motivo
        FROM pedido_adocao
        WHERE id_pedido = NEW.id_pedido;
    END IF;

    NEW.estado_acompanhamento := COALESCE(NEW.estado_acompanhamento, 'Concluída');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sincronizar_adocao
BEFORE INSERT OR UPDATE ON adocao
FOR EACH ROW
EXECUTE FUNCTION fn_sincronizar_adocao();

-- =====================================================
-- 14. DADOS INICIAIS DA CLÍNICA (SEEDS BASE)
-- =====================================================
INSERT INTO utilizador (nome, email, numero_telemovel, profissao, senha, tipo_utilizador)
VALUES ('Administrador', 'admin@miacaomigo.pt', '939812872', 'Administrador de Clínica', 'admin123', 'Administrador');

INSERT INTO utilizador (nome, email, numero_telemovel, profissao, senha, tipo_utilizador) VALUES
('Dra. Ana Costa',      'ana.costa@miacaomigo.pt',      '910111222', 'Médica Veterinária', 'vet123', 'Veterinario'),
('Dr. João Martins',    'joao.martins@miacaomigo.pt',   '910333444', 'Médico Veterinário', 'vet123', 'Veterinario'),
('Dra. Mariana Silva',  'mariana.silva@miacaomigo.pt',  '910555666', 'Médica Veterinária', 'vet123', 'Veterinario'),
('Dr. Miguel Ferreira', 'miguel.ferreira@miacaomigo.pt','910777888', 'Médico Veterinário', 'vet123', 'Veterinario');

INSERT INTO funcionario (nome_completo, morada, email, nif, contacto_profissional, id_utilizador)
SELECT u.nome, 'Rua dos Bichinhos, 123 - Lisboa', u.email,
       LPAD((210000000 + u.id_utilizador)::text, 9, '0'),
       u.numero_telemovel, u.id_utilizador
FROM utilizador u
WHERE u.tipo_utilizador = 'Veterinario';

INSERT INTO veterinario (id_veterinario, especialidade)
SELECT f.id_funcionario,
       CASE f.email
           WHEN 'ana.costa@miacaomigo.pt'       THEN 'Clínica geral e vacinação'
           WHEN 'joao.martins@miacaomigo.pt'    THEN 'Cirurgia e consultas gerais'
           WHEN 'mariana.silva@miacaomigo.pt'   THEN 'Dermatologia e exames'
           WHEN 'miguel.ferreira@miacaomigo.pt' THEN 'Urgências e desparasitação'
           ELSE 'Clínica Geral'
       END
FROM funcionario f;

INSERT INTO tipo_servico (nome_servico, descricao, preco_base) VALUES
('Consulta Geral',        'Avaliação clínica geral do animal',             25.00),
('Vacinação',             'Administração de vacinas anuais e reforços',    18.00),
('Desparasitação',        'Desparasitação interna e externa',              12.00),
('Cirurgia',              'Intervenções cirúrgicas programadas',           75.00),
('Dermatologia e Exames', 'Consultas dermatológicas e exames complementares', 40.00),
('Urgências',             'Atendimento clínico urgente',                   45.00);

INSERT INTO entidade_recolha (nome, contacto, localizacao)
VALUES ('Canil Municipal de Lisboa', '210000111', 'Lisboa');

INSERT INTO animal (nome, especie, raca, idade, sexo, porte, estado, estado_adocao, id_entidade) VALUES
('Max',   'Cão',  'Labrador', '2 anos', 'Macho', 'Médio/Grande', 'Resgatado', 'Disponível', 1),
('Luna',  'Gata', 'Angorá',   '1 ano',  'Fêmea', 'Pequeno',      'Resgatado', 'Disponível', 1),
('Bobby', 'Cão',  'Rafeiro',  '4 anos', 'Macho', 'Médio',        'Resgatado', 'Disponível', 1);

-- =====================================================
-- 15. VISTAS (VIEWS) PARA OS SELECTS FICAREM DIREITINHOS
-- =====================================================
CREATE OR REPLACE VIEW vw_funcionario AS
SELECT
    f.id_funcionario,
    f.nome_completo AS nome,
    COALESCE(u.tipo_utilizador, 'Funcionario') AS cargo,
    COALESCE(v.especialidade, 'Não aplicável') AS especialidade,
    f.email,
    f.contacto_profissional AS telefone,
    f.nif,
    f.morada,
    COALESCE(u.ativo, TRUE) AS ativo
FROM funcionario f
LEFT JOIN utilizador u ON f.id_utilizador = u.id_utilizador
LEFT JOIN veterinario v ON f.id_funcionario = v.id_veterinario
ORDER BY f.id_funcionario;

CREATE OR REPLACE VIEW vw_veterinarios_completos AS
SELECT
    v.id_veterinario,
    f.nome_completo AS nome,
    v.especialidade,
    f.email,
    f.contacto_profissional AS telefone,
    f.nif
FROM veterinario v
JOIN funcionario f ON v.id_veterinario = f.id_funcionario;

CREATE OR REPLACE VIEW vw_consultas_completas AS
SELECT
    c.id_consulta,
    c.data,
    c.hora,
    c.motivo AS servico,
    c.estado,
    a.nome AS animal,
    a.especie,
    a.raca,
    cl.nome_completo AS tutor,
    cl.email AS email_tutor,
    cl.telefone AS telefone_tutor,
    COALESCE(f.nome_completo, 'Por atribuir') AS veterinario,
    v.especialidade,
    fat.id_fatura,
    COALESCE(p.valor, fat.valor_total) AS valor,
    COALESCE(p.metodo_pagamento, 'Pendente') AS metodo_pagamento,
    COALESCE(p.estado_pagamento, 'Pendente') AS estado_pagamento
FROM consulta c
JOIN animal a ON c.id_animal = a.id_animal
LEFT JOIN cliente cl ON a.id_cliente = cl.id_cliente
LEFT JOIN veterinario v ON c.id_veterinario = v.id_veterinario
LEFT JOIN funcionario f ON v.id_veterinario = f.id_funcionario
LEFT JOIN fatura fat ON c.id_consulta = fat.id_consulta
LEFT JOIN pagamento p ON c.id_consulta = p.id_consulta
ORDER BY c.data_hora DESC;

CREATE OR REPLACE VIEW vw_faturacao_pagamentos AS
SELECT
    fat.id_fatura,
    fat.data AS data_fatura,
    c.id_consulta,
    c.motivo AS servico,
    c.estado AS estado_consulta,
    cl.nome_completo AS cliente,
    cl.nif,
    a.nome AS animal,
    fat.valor_total,
    p.metodo_pagamento,
    p.estado_pagamento,
    p.data_pagamento
FROM fatura fat
JOIN consulta c ON fat.id_consulta = c.id_consulta
JOIN animal a ON c.id_animal = a.id_animal
LEFT JOIN cliente cl ON a.id_cliente = cl.id_cliente
LEFT JOIN pagamento p ON fat.id_fatura = p.id_fatura
ORDER BY fat.id_fatura DESC;

CREATE OR REPLACE VIEW vw_adocoes_completas AS
SELECT
    pa.id_pedido,
    ad.id_adocao,
    pa.data_pedido,
    ad.data_adocao,
    pa.estado AS estado_pedido,
    a.id_animal,
    a.nome AS animal,
    a.especie,
    a.raca,
    a.estado_adocao AS estado_animal,
    cl.nome_completo AS adotante,
    cl.email,
    cl.telefone,
    cl.nif,
    COALESCE(ad.tipo_habitacao, pa.tipo_habitacao) AS tipo_habitacao,
    COALESCE(ad.outros_animais, pa.outros_animais) AS outros_animais,
    COALESCE(ad.experiencia_animais, pa.experiencia_animais) AS experiencia_animais,
    COALESCE(ad.motivo, pa.motivo) AS motivo,
    COALESCE(f.nome_completo, 'Por atribuir') AS funcionario_responsavel,
    COALESCE(ad.estado_acompanhamento, 'A aguardar decisão') AS estado_acompanhamento
FROM pedido_adocao pa
JOIN animal a ON pa.id_animal = a.id_animal
JOIN cliente cl ON pa.id_cliente = cl.id_cliente
LEFT JOIN adocao ad ON ad.id_pedido = pa.id_pedido
LEFT JOIN funcionario f ON ad.id_funcionario = f.id_funcionario
ORDER BY pa.data_pedido DESC;

-- =====================================================
-- 16. REALINHAR TODAS AS SEQUÊNCIAS
-- =====================================================
SELECT setval(pg_get_serial_sequence('utilizador', 'id_utilizador'), COALESCE((SELECT MAX(id_utilizador) FROM utilizador), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('cliente', 'id_cliente'), COALESCE((SELECT MAX(id_cliente) FROM cliente), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('funcionario', 'id_funcionario'), COALESCE((SELECT MAX(id_funcionario) FROM funcionario), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('animal', 'id_animal'), COALESCE((SELECT MAX(id_animal) FROM animal), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('tipo_servico', 'id_servico'), COALESCE((SELECT MAX(id_servico) FROM tipo_servico), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('consulta', 'id_consulta'), COALESCE((SELECT MAX(id_consulta) FROM consulta), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('fatura', 'id_fatura'), COALESCE((SELECT MAX(id_fatura) FROM fatura), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('pagamento', 'id_pagamento'), COALESCE((SELECT MAX(id_pagamento) FROM pagamento), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('pedido_adocao', 'id_pedido'), COALESCE((SELECT MAX(id_pedido) FROM pedido_adocao), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('adocao', 'id_adocao'), COALESCE((SELECT MAX(id_adocao) FROM adocao), 0) + 1, false);