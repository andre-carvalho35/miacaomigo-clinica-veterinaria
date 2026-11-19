# MiACaoMiGo — Gestão Clínica Veterinária e Adoção Animal

Aplicação web full-stack para gestão de uma clínica veterinária e processo de adoção de animais resgatados, desenvolvida com **Node.js**, **Express**, **PostgreSQL** e **JavaScript/HTML/CSS**.

## Funcionalidades Principais
- **Autenticação e Perfis:** Registo e login com controlo de acessos para Clientes, Veterinários e Administradores.
- **Gestão Clínica:** Agendamento de consultas por serviço e veterinário, prescrição de exames/receitas médicas e emissão automática de faturas e pagamentos.
- **Processo de Adoção:** Listagem de animais disponíveis, submissão de candidaturas por clientes e aprovação/rejeição pelo administrador com atualização automática do estado do animal.
- **Base de Dados Relacional (PostgreSQL):** Modelo normalizado com 17 tabelas, vistas (`VIEW`s) de consulta e triggers PL/pgSQL para sincronização e validação de integridade.

## Tecnologias Utilizadas
- **Backend:** Node.js, Express, `pg` (node-postgres)
- **Base de Dados:** PostgreSQL (PL/pgSQL triggers, views, constraints)
- **Frontend:** HTML5, CSS3, JavaScript (arquitetura SPA)

## Como Executar Localmente

### 1. Base de Dados (PostgreSQL)
1. Cria uma base de dados no PostgreSQL (ex.: `miacaomigo`).
2. Executa o script `tabelas.sql` para criar a estrutura, triggers e vistas.
3. Executa o script `dados.sql` para carregar os dados iniciais.

### 2. Configuração e Arranque
1. Copia o ficheiro `.env.example` para `.env` e preenche com os teus dados do PostgreSQL.
2. Instala as dependências e arranca o servidor:
   ```bash
   npm install
   npm start