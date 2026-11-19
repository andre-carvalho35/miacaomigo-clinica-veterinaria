-- =====================================================
-- INSERIR UTILIZADORES (Site + Académico)
-- =====================================================
INSERT INTO utilizador (
    id_utilizador, nome, email, mail, numero_telemovel, nacionalidade, profissao, senha, password_hash, tipo_utilizador, ultimo_login
)
VALUES
(1, 'Administrador',       'admin@miacaomigo.pt',        'admin@miacaomigo.pt',        '939812872', 'Portuguesa', 'Administrador',      'admin123', 'admin123', 'Administrador', CURRENT_TIMESTAMP(0)),
(2, 'Dra. Ana Costa',      'ana.costa@miacaomigo.pt',    'ana.costa@miacaomigo.pt',    '910111222', 'Portuguesa', 'Médica Veterinária', 'vet123',   'vet123',   'Veterinario',   CURRENT_TIMESTAMP(0)),
(3, 'Dr. João Martins',    'joao.martins@miacaomigo.pt', 'joao.martins@miacaomigo.pt', '910333444', 'Portuguesa', 'Médico Veterinário', 'vet123',   'vet123',   'Veterinario',   CURRENT_TIMESTAMP(0)),
(4, 'Dra. Mariana Silva',  'mariana.silva@miacaomigo.pt','mariana.silva@miacaomigo.pt','910555666', 'Portuguesa', 'Médica Veterinária', 'vet123',   'vet123',   'Veterinario',   CURRENT_TIMESTAMP(0)),
(5, 'Dr. Miguel Ferreira', 'miguel.ferreira@miacaomigo.pt','miguel.ferreira@miacaomigo.pt','910777888','Portuguesa','Médico Veterinário','vet123',   'vet123',   'Veterinario',   CURRENT_TIMESTAMP(0)),
(6, 'Luís Silva',          'luis.silva@email.com',       'luis.silva@email.com',       '934567890', 'Portuguesa', 'Funcionário',        'senha789', 'senha789', 'Funcionario',   CURRENT_TIMESTAMP(0)),
(7, 'João Silva',          'joao.silva@email.com',       'joao.silva@email.com',       '918765432', 'Portuguesa', 'Cliente',            'senha123', 'senha123', 'Cliente',       CURRENT_TIMESTAMP(0))
ON CONFLICT (id_utilizador) DO NOTHING;

-- =====================================================
-- INSERIR CLIENTES
-- =====================================================
INSERT INTO cliente (
    id_cliente, id_utilizador, nome_completo, morada, telefone, email, nif, data_nascimento
)
VALUES
(1, 7,    'João Silva',      'Rua do Sol, 456',         '918765432', 'joao.silva@email.com',      '987654321', '1990-04-12'),
(2, NULL, 'Mariana Costa',   'Rua das Oliveiras, 25',   '914567890', 'mariana.costa@email.com',   '123456780', '1992-08-20'),
(3, NULL, 'Pedro Almeida',   'Avenida Central, 102',    '925678901', 'pedro.almeida@email.com',   '234567891', '1988-11-03'),
(4, NULL, 'Sofia Ferreira',  'Rua de São João, 78',     '936789012', 'sofia.ferreira@email.com',  '345678902', '1995-02-17'),
(5, NULL, 'Ricardo Martins', 'Rua da Escola, 14',       '947890123', 'ricardo.martins@email.com', '456789013', '1985-07-29'),
(6, NULL, 'Inês Rodrigues',  'Travessa do Monte, 9',    '958901234', 'ines.rodrigues@email.com',  '567890124', '1998-09-10')
ON CONFLICT (id_cliente) DO NOTHING;

-- =====================================================
-- INSERIR FUNCIONÁRIOS
-- =====================================================
INSERT INTO funcionario (
    id_funcionario, nome_completo, morada, email, nif, contacto_profissional, id_utilizador
)
VALUES
(1, 'Dra. Ana Costa',      'Rua dos Bichinhos, 123 - Lisboa', 'ana.costa@miacaomigo.pt',       '210000001', '910111222', 2),
(2, 'Dr. João Martins',    'Rua dos Bichinhos, 123 - Lisboa', 'joao.martins@miacaomigo.pt',    '210000002', '910333444', 3),
(3, 'Dra. Mariana Silva',  'Rua dos Bichinhos, 123 - Lisboa', 'mariana.silva@miacaomigo.pt',   '210000003', '910555666', 4),
(4, 'Dr. Miguel Ferreira', 'Rua dos Bichinhos, 123 - Lisboa', 'miguel.ferreira@miacaomigo.pt', '210000004', '910777888', 5),
(5, 'Luís Silva',          'Rua das Flores, 123',             'luis.silva@email.com',          '123456789', '934567890', 6)
ON CONFLICT (id_funcionario) DO NOTHING;

-- =====================================================
-- INSERIR VETERINÁRIOS (Especialidades iguais às do site)
-- =====================================================
INSERT INTO veterinario (
    id_veterinario, especialidade
)
VALUES
(1, 'Clínica geral e vacinação'),
(2, 'Cirurgia e consultas gerais'),
(3, 'Dermatologia e exames'),
(4, 'Urgências e desparasitação')
ON CONFLICT (id_veterinario) DO NOTHING;

-- =====================================================
-- INSERIR SESSÕES
-- =====================================================
INSERT INTO sessao (
    id_utilizador, data_hora_inicio, data_hora_fim
)
VALUES
(1, CURRENT_TIMESTAMP(0) - INTERVAL '2 hours', CURRENT_TIMESTAMP(0) - INTERVAL '1 hour'),
(2, CURRENT_TIMESTAMP(0), NULL);

-- =====================================================
-- INSERIR ENTIDADE DE RECOLHA
-- =====================================================
INSERT INTO entidade_recolha (
    id_entidade, nome, contacto, localizacao
)
VALUES
(1, 'Associação Patinhas Felizes', '912000111', 'Braga')
ON CONFLICT (id_entidade) DO NOTHING;

-- =====================================================
-- INSERIR TIPOS DE SERVIÇO (Alinhados com o site)
-- =====================================================
INSERT INTO tipo_servico (
    id_servico, nome_servico, descricao, preco_base
)
VALUES
(1, 'Consulta Geral',        'Consulta clínica de rotina',                         25.00),
(2, 'Vacinação',             'Administração de vacina',                            18.00),
(3, 'Desparasitação',        'Administração de desparasitante interno ou externo', 12.00),
(4, 'Cirurgia',              'Procedimento cirúrgico veterinário',                 75.00),
(5, 'Dermatologia e Exames', 'Consultas dermatológicas e exames complementares',   40.00),
(6, 'Urgências',             'Atendimento veterinário urgente',                    45.00),
(7, 'Microchip',             'Aplicação de microchip de identificação animal',     30.00),
(8, 'Análise Clínica',       'Recolha e análise laboratorial',                     22.50),
(9, 'Raio-X',                'Exame de imagem para diagnóstico',                   35.00),
(10, 'Esterilização',        'Procedimento cirúrgico de esterilização',            90.00)
ON CONFLICT (id_servico) DO NOTHING;

-- =====================================================
-- INSERIR ANIMAIS (IDs 1, 2 e 3 = Max, Luna e Bobby do site)
-- =====================================================
INSERT INTO animal (
    id_animal, nome, especie, raca, idade, data_nascimento, sexo, porte, estado, estado_adocao,
    data_recolha, local_encontrado, estado_clinico_inicial, id_entidade
)
VALUES
(1, 'Max',   'Cão',  'Labrador Retriever', '2 anos', '2024-05-01', 'M', 'Médio/Grande', 'Resgatado', 'Disponível',
 '2026-04-15', 'Rua das Flores, Braga', 'Bom estado geral', 1),

(2, 'Luna',  'Gato', 'Angorá',             '1 ano',  '2025-05-01', 'F', 'Pequeno',      'Resgatado', 'Disponível',
 '2026-04-20', 'Rua de São João, Braga', 'Magreza ligeira', 1),

(3, 'Bobby', 'Cão',  'Rafeiro',            '4 anos', '2022-05-01', 'M', 'Médio',        'Resgatado', 'Disponível',
 '2026-04-25', 'Vila Nova de Famalicão', 'Bom estado geral', 1)
ON CONFLICT (id_animal) DO NOTHING;

-- Animais domésticos associados ao cliente João Silva (id_cliente = 1)
INSERT INTO animal (
    id_animal, nome, especie, raca, idade, data_nascimento, sexo, porte, estado, estado_adocao, id_cliente
)
VALUES
(4, 'Manel', 'Cão',  'Beagle',        '6 anos', '2020-06-01', 'M', 'Médio',   'Domestico', 'Não aplicável', 1),
(5, 'Mia',   'Gato', 'Europeu Comum', '3 anos', '2023-03-10', 'F', 'Pequeno', 'Domestico', 'Não aplicável', 1)
ON CONFLICT (id_animal) DO NOTHING;

-- =====================================================
-- INSERIR HORÁRIO DE TRABALHO
-- =====================================================
INSERT INTO horario_trabalho (
    id_horario, id_funcionario, dia_semana, hora_inicio, hora_fim
)
VALUES
(1, 1, 'Monday',    '09:00:00', '17:00:00'),
(2, 1, 'Tuesday',   '09:00:00', '17:00:00'),
(3, 1, 'Wednesday', '09:00:00', '17:00:00'),
(4, 2, 'Monday',    '10:00:00', '18:00:00'),
(5, 2, 'Wednesday', '10:00:00', '18:00:00'),
(6, 2, 'Friday',    '10:00:00', '18:00:00'),
(7, 3, 'Tuesday',   '09:30:00', '17:30:00'),
(8, 3, 'Thursday',  '09:30:00', '17:30:00'),
(9, 4, 'Saturday',  '09:00:00', '16:00:00')
ON CONFLICT (id_horario) DO NOTHING;

-- =====================================================
-- INSERIR FÉRIAS DO FUNCIONÁRIO
-- =====================================================
INSERT INTO ferias_funcionario (
    id_ferias, id_funcionario, data_inicio, data_fim
)
VALUES
(1, 2, CURRENT_DATE + 10, CURRENT_DATE + 15)
ON CONFLICT (id_ferias) DO NOTHING;

-- =====================================================
-- INSERIR CONFIGURAÇÃO
-- =====================================================
INSERT INTO configuracao (
    id_configuracao, chave, valor, descricao
)
VALUES
(1, 'antecedencia_aviso_consulta_horas', '48', 'Número de horas antes da consulta para enviar aviso ao cliente')
ON CONFLICT (id_configuracao) DO NOTHING;

-- =====================================================
-- INSERIR CONSULTAS HISTÓRICAS
-- =====================================================
INSERT INTO consulta (
    id_consulta, data, hora, data_hora, motivo, observacoes, estado, estado_consulta,
    resposta_cliente, consulta_origem, id_animal, id_veterinario, id_servico
)
VALUES
(1, '2026-05-10', '10:00:00', '2026-05-10 10:00:00', 'Consulta Geral',
 'Consulta com Dra. Ana Costa - Check-up realizado sem complicações.',
 'Confirmada', 'Concluida', 'Confirmada', NULL, 4, 1, 1),

(2, '2026-05-12', '10:00:00', '2026-05-12 10:00:00', 'Vacinação',
 'Consulta com Dra. Ana Costa - Administração de vacina anual.',
 'Confirmada', 'Concluida', 'Confirmada', NULL, 4, 1, 2)
ON CONFLICT (id_consulta) DO NOTHING;

-- =====================================================
-- INSERIR EXAMES E PRESCRIÇÕES DE EXAME
-- =====================================================
INSERT INTO exame (
    id_exame, nome_exame, descricao, preco
)
VALUES
(1, 'Raio-X',            'Exame de imagem para avaliação de fraturas ou alterações ósseas', 35.00),
(2, 'Análise ao sangue', 'Exame laboratorial para avaliação geral do estado de saúde',       22.50)
ON CONFLICT (id_exame) DO NOTHING;

INSERT INTO prescricao_exame (
    id_consulta, id_exame, observacoes
)
VALUES
(1, 1, 'Realizar Raio-X para despiste de lesão óssea'),
(2, 2, 'Realizar análise ao sangue após vacinação')
ON CONFLICT (id_consulta, id_exame) DO NOTHING;

-- =====================================================
-- INSERIR MEDICAMENTOS E RECEITAS MÉDICAS
-- =====================================================
INSERT INTO medicamento (
    id_medicamento, nome_comercial, descricao, dosagem_recomendada
)
VALUES
(1,  'Amoxicilina',          'Antibiótico',                                      '500mg 2x ao dia'),
(2,  'Bravecto',             'Antiparasitário',                                  'Conforme peso do animal'),
(3,  'Meloxicam',            'Anti-inflamatório usado para dor e inflamação',    '1x ao dia'),
(4,  'Metronidazol',         'Antibiótico e antiparasitário gastrointestinal',   '250mg 2x ao dia'),
(5,  'Omeprazol',            'Protetor gástrico usado em problemas digestivos',  'Antes da refeição'),
(6,  'Prednisolona',         'Corticosteroide usado em inflamações e alergias',  'Conforme indicação'),
(7,  'Enrofloxacina',        'Antibiótico usado em infeções urinárias/cutâneas', '1x ao dia'),
(8,  'Drontal',              'Desparasitante interno para cães e gatos',         'Conforme peso do animal'),
(9,  'Apoquel',              'Medicamento usado no controlo de alergias',        'Conforme prescrição'),
(10, 'Suplemento Articular', 'Suplemento para apoio das articulações',           'Diariamente com alimento')
ON CONFLICT (id_medicamento) DO NOTHING;

INSERT INTO receita_medica (
    id_consulta, id_medicamento, instrucoes
)
VALUES
(1, 1, 'Tomar após 15 minutos das refeições'),
(2, 2, 'Administrar após a refeição principal'),
(1, 3, 'Administrar em caso de dor ou inflamação, conforme indicação veterinária'),
(1, 5, 'Administrar antes da refeição para proteção gástrica'),
(2, 8, 'Administrar como desparasitação interna após a consulta')
ON CONFLICT (id_consulta, id_medicamento) DO NOTHING;

-- =====================================================
-- INSERIR FATURAS E PAGAMENTOS (Ligados a consulta + fatura)
-- =====================================================
INSERT INTO fatura (
    id_fatura, data, valor_total, id_consulta
)
VALUES
(1, '2026-05-10', 25.00, 1),
(2, '2026-05-12', 18.00, 2)
ON CONFLICT (id_fatura) DO NOTHING;

INSERT INTO pagamento (
    id_pagamento, id_consulta, id_fatura, data_pagamento, valor, metodo_pagamento, estado_pagamento
)
VALUES
(1, 1, 1, '2026-05-10 10:30:00', 25.00, 'Cartão',   'Pago'),
(2, 2, 2, '2026-05-12 10:30:00', 18.00, 'MB WAY',   'Pago')
ON CONFLICT (id_pagamento) DO NOTHING;

-- =====================================================
-- INSERIR NOTIFICAÇÕES E ADOÇÃO HISTÓRICA
-- =====================================================
INSERT INTO notificacao (
    id_notificacao, id_consulta, id_cliente, data_hora_envio,
    mensagem, antecedencia_horas, resposta_cliente
)
VALUES
(1, 1, 1, '2026-05-08 10:00:00',
 'Consulta agendada para o dia 10/05/2026 às 10:00. Por favor confirme a sua presença.', 48, 'Confirmada'),
(2, 2, 1, '2026-05-10 10:00:00',
 'Consulta agendada para o dia 12/05/2026 às 10:00. Por favor confirme a sua presença.', 48, 'Confirmada')
ON CONFLICT (id_notificacao) DO NOTHING;

INSERT INTO adocao (
    id_adocao, data_adocao, id_cliente, id_animal, id_funcionario
)
VALUES
(1, '2026-05-15', 1, 5, 1)
ON CONFLICT (id_adocao) DO NOTHING;

-- =====================================================
-- ATUALIZAR SEQUÊNCIAS DE IDS AUTOMÁTICOS (CRÍTICO!)
-- =====================================================
SELECT setval(pg_get_serial_sequence('utilizador', 'id_utilizador'), COALESCE((SELECT MAX(id_utilizador) FROM utilizador), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('cliente', 'id_cliente'), COALESCE((SELECT MAX(id_cliente) FROM cliente), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('funcionario', 'id_funcionario'), COALESCE((SELECT MAX(id_funcionario) FROM funcionario), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('horario_trabalho', 'id_horario'), COALESCE((SELECT MAX(id_horario) FROM horario_trabalho), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('ferias_funcionario', 'id_ferias'), COALESCE((SELECT MAX(id_ferias) FROM ferias_funcionario), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('configuracao', 'id_configuracao'), COALESCE((SELECT MAX(id_configuracao) FROM configuracao), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('tipo_servico', 'id_servico'), COALESCE((SELECT MAX(id_servico) FROM tipo_servico), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('entidade_recolha', 'id_entidade'), COALESCE((SELECT MAX(id_entidade) FROM entidade_recolha), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('animal', 'id_animal'), COALESCE((SELECT MAX(id_animal) FROM animal), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('pedido_adocao', 'id_pedido'), COALESCE((SELECT MAX(id_pedido) FROM pedido_adocao), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('adocao', 'id_adocao'), COALESCE((SELECT MAX(id_adocao) FROM adocao), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('consulta', 'id_consulta'), COALESCE((SELECT MAX(id_consulta) FROM consulta), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('exame', 'id_exame'), COALESCE((SELECT MAX(id_exame) FROM exame), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('medicamento', 'id_medicamento'), COALESCE((SELECT MAX(id_medicamento) FROM medicamento), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('fatura', 'id_fatura'), COALESCE((SELECT MAX(id_fatura) FROM fatura), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('pagamento', 'id_pagamento'), COALESCE((SELECT MAX(id_pagamento) FROM pagamento), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('notificacao', 'id_notificacao'), COALESCE((SELECT MAX(id_notificacao) FROM notificacao), 0) + 1, false);