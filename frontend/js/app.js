// ===================== DADOS PERSISTENTES =====================
let marcacoes = JSON.parse(localStorage.getItem("marcacoes")) || [];

let medicamentos = JSON.parse(localStorage.getItem("medicamentos")) || [
  { id: 1, nome: "Antipulgas NexGard", indicacao: "Proteção mensal contra pulgas e carraças", quantidade: 50, preco: "32,50 €" },
  { id: 2, nome: "Vermífugo Drontal", indicacao: "Tratamento de vermes intestinais", quantidade: 120, preco: "18,00 €" },
  { id: 3, nome: "Antibiótico Amoxicilina", indicacao: "Infeções bacterianas", quantidade: 80, preco: "24,00 €" }
];

let exames = JSON.parse(localStorage.getItem("exames")) || [
  { id: 1, nome: "Hemograma Completo", descricao: "Avaliação de células sanguíneas", duracao: "24h", preco: "45,00 €" },
  { id: 2, nome: "Raio-X Digital", descricao: "Diagnóstico por imagem de ossos e tórax", duracao: "Imediato", preco: "65,00 €" },
  { id: 3, nome: "Ultrassonografia", descricao: "Avaliação de órgãos internos", duracao: "48h", preco: "85,00 €" }
];

let funcionariosClinica = JSON.parse(localStorage.getItem("funcionariosClinica")) || [
  { id: 1, nome: "Dra. Ana Costa", cargo: "Veterinária", especialidade: "Clínica geral e vacinação", email: "ana.costa@miacaomigo.pt", telemovel: "910 111 222" },
  { id: 2, nome: "Dr. João Martins", cargo: "Veterinário", especialidade: "Cirurgia e consultas gerais", email: "joao.martins@miacaomigo.pt", telemovel: "910 333 444" },
  { id: 3, nome: "Dra. Mariana Silva", cargo: "Veterinária", especialidade: "Dermatologia e exames", email: "mariana.silva@miacaomigo.pt", telemovel: "910 555 666" },
  { id: 4, nome: "Dr. Miguel Ferreira", cargo: "Veterinário", especialidade: "Urgências e desparasitação", email: "miguel.ferreira@miacaomigo.pt", telemovel: "910 777 888" }
];

let prescricoes = JSON.parse(localStorage.getItem("prescricoes")) || [
  { id: 1, funcionario: "Dra. Ana Costa", tutor: "Joana Pereira", animal: "Kiko", consulta: "Vacinação", medicamento: "Vacina anual", posologia: "Dose única administrada em consulta", duracao: "1 dia", data: "2026-05-10", observacoes: "Reforço anual recomendado." },
  { id: 2, funcionario: "Dr. João Martins", tutor: "Pedro Silva", animal: "Tobias", consulta: "Consulta Geral", medicamento: "Amoxicilina", posologia: "1 comprimido de 12 em 12 horas", duracao: "7 dias", data: "2026-05-12", observacoes: "Controlar evolução dos sintomas." },
  { id: 3, funcionario: "Dra. Mariana Silva", tutor: "Carla Mendes", animal: "Luna", consulta: "Dermatologia", medicamento: "Champô dermatológico", posologia: "Aplicar 2 vezes por semana", duracao: "3 semanas", data: "2026-05-15", observacoes: "Evitar banhos com outros produtos." }
];

let pedidosAdocao = JSON.parse(localStorage.getItem("pedidosAdocao")) || [];

function salvarMarcacoes() { localStorage.setItem("marcacoes", JSON.stringify(marcacoes)); }
function salvarMedicamentos() { localStorage.setItem("medicamentos", JSON.stringify(medicamentos)); }
function salvarExames() { localStorage.setItem("exames", JSON.stringify(exames)); }
function salvarFuncionarios() { localStorage.setItem("funcionariosClinica", JSON.stringify(funcionariosClinica)); }
function salvarPrescricoes() { localStorage.setItem("prescricoes", JSON.stringify(prescricoes)); }
function salvarPedidosAdocao() { localStorage.setItem("pedidosAdocao", JSON.stringify(pedidosAdocao)); }

// ===================== FUNÇÕES UTILITÁRIAS =====================
function adicionarMarcacao(dados) {
  const novaMarcacao = {
    id: Date.now(),
    nomeDono: dados.nomeDono,
    email: dados.email,
    nomeAnimal: dados.nomeAnimal,
    especie: dados.especie || "Cão",
    raca: dados.raca || "Sem raça definida",
    sexo: dados.sexo || "",
    servico: dados.servico,
    medico: dados.medico || "A definir",
    hora: dados.hora || "A definir",
    dataPref: dados.dataPref || "A definir",
    dataCriacao: new Date().toLocaleDateString('pt-PT'),
    valor: dados.valor || "25,00 €",
    status: "pendente"
  };
  marcacoes.push(novaMarcacao);
  salvarMarcacoes();
  return novaMarcacao;
}

function buscarMarcacoesPorEmail(email) {
  return marcacoes.filter(m => m.email.toLowerCase() === email.toLowerCase());
}

function atualizarMarcacao(id, novosDados) {
  marcacoes = marcacoes.map(m => m.id === id ? { ...m, ...novosDados } : m);
  salvarMarcacoes();
}

function obterUtilizadorLogado() { return JSON.parse(localStorage.getItem("utilizadorLogado")); }

function obterUtilizadores() {
  const utilizadores = JSON.parse(localStorage.getItem("utilizadores")) || [];
  const utilizadorAntigo = JSON.parse(localStorage.getItem("utilizadorCriado"));
  if (utilizadorAntigo && !utilizadores.some(u => u.email === utilizadorAntigo.email)) {
    utilizadores.push(utilizadorAntigo);
    localStorage.setItem("utilizadores", JSON.stringify(utilizadores));
  }
  return utilizadores;
}

function salvarUtilizadores(utilizadores) { localStorage.setItem("utilizadores", JSON.stringify(utilizadores)); }
function utilizadorAdmin() { const u = obterUtilizadorLogado(); return u && u.tipo === "admin"; }

function converterValorParaNumero(valor) {
  if (!valor) return 0;
  if (typeof valor === "number") return valor;
  return Number(String(valor).replace("€", "").replace(",", ".").trim());
}

function formatarEuro(valor) { return Number(valor).toFixed(2).replace(".", ",") + " €"; }

function obterClasseStatus(status) {
  if (status === "confirmado" || status === "Confirmada") return "status-confirmado";
  if (status === "cancelado" || status === "Cancelada") return "status-cancelado";
  return "status-pendente";
}

function obterClasseEstadoAdocao(estado) {
  if (estado === "Aprovado") return "status-confirmado";
  if (estado === "Recusado" || estado === "Rejeitado") return "status-cancelado";
  return "status-pendente";
}

function obterValorServico(servico) {
  if (servico === "Vacinação") return "18,00 €";
  if (servico === "Desparasitação") return "12,00 €";
  if (servico === "Cirurgia") return "75,00 €";
  if (servico === "Dermatologia e Exames") return "40,00 €";
  if (servico === "Urgências") return "45,00 €";
  return "25,00 €";
}

// Helper para chamadas API de clínica (/api/clinica/... com fallback para /api/...)
async function fetchClinicaApi(subpath, options = undefined) {
  let resp = await fetch(`/api/clinica${subpath}`, options).catch(() => null);
  if (!resp || resp.status === 404) {
    resp = await fetch(`/api${subpath}`, options).catch(() => null);
  }
  return resp;
}

// ===================== SINCRONIZAÇÃO COM POSTGRESQL =====================
async function sincronizarConsultasComBD(idUtilizador = null) {
  try {
    const url = idUtilizador ? `/api/consultas?id_utilizador=${idUtilizador}` : `/api/consultas`;
    const resp = await fetch(url);
    if (!resp.ok) return;
    const rows = await resp.json();

    rows.forEach(r => {
      const dt = r.data_hora ? new Date(r.data_hora) : null;
      const dataPref = dt && !isNaN(dt) ? dt.toISOString().split('T')[0] : "A definir";
      const hora = dt && !isNaN(dt) ? dt.toTimeString().slice(0, 5) : "A definir";
      const statusMap = r.estado === "Confirmada" ? "confirmado" : r.estado === "Cancelada" ? "cancelado" : "pendente";

      const existente = marcacoes.find(m => m.id_consulta_db === r.id_consulta);
      if (existente) {
        existente.status = statusMap;
        if (r.metodo_pagamento) existente.metodoPagamento = r.metodo_pagamento;
        if (r.estado_pagamento) existente.estadoPagamento = r.estado_pagamento;
        if (r.id_fatura) existente.id_fatura_db = r.id_fatura;
      } else {
        marcacoes.push({
          id: r.id_consulta,
          id_consulta_db: r.id_consulta,
          id_fatura_db: r.id_fatura || null,
          nomeDono: r.tutor_nome || "Cliente",
          email: r.tutor_email || "",
          nomeAnimal: r.animal_nome || "Animal",
          especie: r.especie || "Cão",
          raca: r.raca || "Sem raça definida",
          sexo: r.sexo || "",
          servico: r.motivo || "Consulta Geral",
          medico: r.observacoes?.startsWith("Consulta com ") ? r.observacoes.replace("Consulta com ", "") : "Dra. Ana Costa",
          hora,
          dataPref,
          dataCriacao: new Date().toLocaleDateString('pt-PT'),
          valor: r.valor ? formatarEuro(r.valor) : "25,00 €",
          status: statusMap,
          metodoPagamento: r.metodo_pagamento || "",
          estadoPagamento: r.estado_pagamento || ""
        });
      }
    });
    salvarMarcacoes();
  } catch (err) {
    console.warn("Sincronização de consultas em modo offline:", err.message);
  }
}

async function sincronizarAdocoesComBD() {
  try {
    const respAnimais = await fetchClinicaApi("/adocao/animais");
    if (respAnimais && respAnimais.ok) {
      const animaisDb = await respAnimais.json();
      Object.values(perfisAnimais).forEach(perfil => {
        const encontrado = animaisDb.find(a => a.id_animal === perfil.id_db);
        if (encontrado) {
          perfil.estado = encontrado.estado_adocao === "Adotado" ? "Adotado" : "Disponível para adoção";
        }
      });
    }

    const resp = await fetchClinicaApi("/adocao/pedidos");
    if (!resp || !resp.ok) return;
    const rows = await resp.json();

    const pedidosDb = rows.map(r => {
      const obs = r.observacoes || "";
      const habMatch = obs.match(/Habitação:\s*([^|]+)/);
      const outMatch = obs.match(/Outros animais:\s*([^|]+)/);
      const expMatch = obs.match(/Experiência:\s*([^|]+)/);
      const motMatch = obs.match(/Motivo:\s*(.+)$/);

      if (r.estado === "Aprovado" || r.animal_estado === "Adotado") {
        const perfil = Object.values(perfisAnimais).find(p => p.id_db === r.id_animal);
        if (perfil) perfil.estado = "Adotado";
      }

      return {
        id: r.id_pedido,
        id_pedido_db: r.id_pedido,
        id_animal: r.id_animal,
        animal: r.animal_nome,
        especie: r.especie || "",
        raca: r.raca || "",
        animalEstado: r.animal_estado || (r.estado === "Aprovado" ? "Adotado" : "Disponível"),
        nome: r.candidato_nome,
        email: r.candidato_email,
        telefone: r.candidato_telefone || "-",
        tipoHabitacao: r.tipo_habitacao || (habMatch ? habMatch[1].trim() : "-"),
        outrosAnimais: r.outros_animais || (outMatch ? outMatch[1].trim() : "-"),
        experiencia: r.experiencia_animais || (expMatch ? expMatch[1].trim() : "-"),
        motivo: r.motivo || (motMatch ? motMatch[1].trim() : (obs || "-")),
        estado: r.estado === "Pendente" ? "Em análise" : r.estado,
        funcionarioResponsavel: r.funcionario_nome || "-",
        dataPedido: r.data_pedido ? new Date(r.data_pedido).toLocaleDateString('pt-PT') : "-"
      };
    });

    pedidosAdocao = pedidosDb;
    salvarPedidosAdocao();
  } catch (err) {
    console.warn("Sincronização de adoções em modo offline:", err.message);
  }
}

// ===================== ESPECIALIDADES E HORÁRIOS =====================
const veterinariosPorServico = {
  "Consulta Geral": ["Dra. Ana Costa", "Dr. João Martins"],
  "Vacinação": ["Dra. Ana Costa"],
  "Desparasitação": ["Dr. Miguel Ferreira"],
  "Cirurgia": ["Dr. João Martins"],
  "Dermatologia e Exames": ["Dra. Mariana Silva"],
  "Urgências": ["Dr. Miguel Ferreira"]
};

const horariosVeterinarios = {
  "Dra. Ana Costa":      { dias: ["Segunda","Terça","Quarta"],   horas: ["09:00","10:00","11:00","14:00","15:00","16:00"] },
  "Dr. João Martins":    { dias: ["Segunda","Quarta","Sexta"],   horas: ["10:00","11:00","12:00","15:00","16:00","17:00"] },
  "Dra. Mariana Silva":  { dias: ["Terça","Quinta","Sexta"],     horas: ["09:30","10:30","11:30","14:30","15:30","16:30"] },
  "Dr. Miguel Ferreira": { dias: ["Segunda","Quinta","Sábado"],  horas: ["09:00","10:00","11:00","12:00","14:00","15:00"] }
};

function atualizarVeterinariosPorServico() {
  const servico = document.getElementById("servicoMarcacao")?.value;
  const selectMedico = document.getElementById("medicoMarcacao");
  if (!selectMedico) return;

  selectMedico.innerHTML = '<option value="">Selecione o veterinário</option>';
  const lista = veterinariosPorServico[servico] || [];

  lista.forEach(nomeMed => {
    const opt = document.createElement("option");
    opt.value = nomeMed;
    opt.textContent = nomeMed;
    selectMedico.appendChild(opt);
  });

  selectMedico.disabled = lista.length === 0;
  atualizarCamposHorario();
}

function obterDiaSemana(data) {
  if (!data) return "";
  const dias = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  return dias[new Date(data + "T00:00:00").getDay()];
}

function atualizarCamposHorario() {
  const servico = document.getElementById("servicoMarcacao")?.value;
  const medico = document.getElementById("medicoMarcacao")?.value;
  const data = document.getElementById("dataPref")?.value;
  const selectHora = document.getElementById("horaMarcacao");
  const infoHorario = document.getElementById("infoHorarioMedico");
  if (!selectHora || !infoHorario) return;
  selectHora.innerHTML = '<option value="">Selecione a hora</option>';
  selectHora.disabled = true;
  if (!servico) {
    infoHorario.innerHTML = '<div class="alert alert-info mb-0">Escolhe primeiro o serviço para veres os veterinários com essa especialidade.</div>';
    return;
  }
  if (!medico) {
    infoHorario.innerHTML = '<div class="alert alert-info mb-0">Escolhe agora o veterinário especialista para veres o horário disponível.</div>';
    return;
  }
  const horario = horariosVeterinarios[medico];
  const textoHorario = `<strong>${medico}</strong> está disponível em: <strong>${horario.dias.join(", ")}</strong>.`;
  if (!data) {
    infoHorario.innerHTML = `<div class="alert alert-info mb-0">${textoHorario} Escolhe uma data para aparecerem as horas disponíveis.</div>`;
    return;
  }
  const diaSemana = obterDiaSemana(data);
  if (!horario.dias.includes(diaSemana)) {
    infoHorario.innerHTML = `<div class="alert alert-warning mb-0">${medico} não está disponível à <strong>${diaSemana}</strong>. Horário: <strong>${horario.dias.join(", ")}</strong>.</div>`;
    return;
  }
  horario.horas.forEach(hora => {
    const ocupado = marcacoes.some(m => m.medico === medico && m.dataPref === data && m.hora === hora && m.status !== "cancelado");
    const option = document.createElement("option");
    option.value = hora;
    option.textContent = ocupado ? `${hora} - ocupado` : hora;
    option.disabled = ocupado;
    selectHora.appendChild(option);
  });
  selectHora.disabled = false;
  infoHorario.innerHTML = `<div class="alert alert-success mb-0">${textoHorario} Horas disponíveis para <strong>${diaSemana}</strong>: ${horario.horas.join(", ")}.</div>`;
}

// ===================== PERFIS ANIMAIS =====================
const perfisAnimais = {
  max: {
    id_db: 1,
    nome: "Max", especie: "Cão", raca: "Labrador", idade: "2 anos", sexo: "Macho", porte: "Médio/Grande",
    estado: "Disponível para adoção", imagemPrincipal: "img/cao1.png",
    fotos: ["img/cao2.png","img/cao3.png","img/cao4.png"],
    historia: "O Max chegou à MiACaoMiGo depois de ter sido encontrado numa zona movimentada, assustado e com muita fome. Apesar do início difícil, revelou-se rapidamente um cão muito meigo, brincalhão e cheio de vontade de confiar novamente nas pessoas. Gosta muito de passeios, adora receber festas e fica especialmente feliz quando tem alguém por perto para brincar. É um animal sociável, ideal para uma família ativa, paciente e com vontade de lhe dar estabilidade, carinho e uma nova oportunidade.",
    personalidade: "Carinhoso, brincalhão, sociável e muito fiel.",
    cuidados: "Precisa de passeios diários, espaço para gastar energia e acompanhamento veterinário regular."
  },
  luna: {
    id_db: 2,
    nome: "Luna", especie: "Gata", raca: "Angorá", idade: "1 ano", sexo: "Fêmea", porte: "Pequeno",
    estado: "Disponível para adoção", imagemPrincipal: "img/dsd.jpg",
    fotos: ["img/gato.jpg","img/gatoop.jpg","img/gatalç.jpg"],
    historia: "A Luna é uma gatinha jovem que chegou à clínica muito tímida, mas com o tempo mostrou o seu lado doce e curioso. No início observava tudo à distância, mas agora aproxima-se para pedir festas e gosta de descansar em locais calmos e confortáveis. É uma excelente companhia para quem procura uma gata tranquila, limpa e afetuosa. Precisa de uma família que respeite o seu tempo de adaptação e que lhe dê um ambiente seguro, com carinho e paciência.",
    personalidade: "Calma, curiosa, meiga e muito observadora.",
    cuidados: "Precisa de um ambiente tranquilo, alimentação adequada e caixa de areia sempre limpa."
  },
  bobby: {
    id_db: 3,
    nome: "Bobby", especie: "Cão", raca: "Rafeiro", idade: "4 anos", sexo: "Macho", porte: "Médio",
    estado: "Disponível para adoção", imagemPrincipal: "img/cao7.png",
    fotos: ["img/cao8.png","img/cao9.png","img/cao10.png"],
    historia: "O Bobby é um cão adulto, muito simpático e com um olhar cheio de ternura. Foi acolhido pela MiACaoMiGo após ter passado algum tempo sem uma casa estável. Mesmo assim, manteve uma personalidade dócil e muito ligada às pessoas. Gosta de companhia, aprecia passeios calmos e adapta-se bem a rotinas. Por ser adulto, já tem uma energia mais equilibrada, sendo uma ótima escolha para quem procura um companheiro fiel, tranquilo e muito agradecido.",
    personalidade: "Fiel, tranquilo, afetuoso e protetor.",
    cuidados: "Precisa de passeios moderados, carinho diário e uma rotina estável."
  }
};

// ===================== PÁGINAS HTML =====================
const paginas = {
  inicio: `
    <section class="hero">
      <div class="hero-content container">
        <h1>Clínica Veterinária MiACaoMiGo</h1>
        <p>Cuidamos dos seus animais com amor, ética e excelência</p>
        <button class="btn btn-success btn-lg px-4 py-2 fw-bold rounded-pill shadow" data-pagina="adocao" id="btnHeroAdocao">
          <i class="fas fa-paw me-2"></i>Conheça quem espera um lar
        </button>
      </div>
    </section>
    <section class="container py-5">
      <h2 class="secao-titulo">Sobre a Clínica</h2>
      <div class="bloco-info">
        <div class="row align-items-center g-4">
          <div class="col-md-6">
            <p class="fs-5">A <strong>Clínica Veterinária MiACaoMiGo</strong> nasceu do amor pelos animais e do compromisso com a saúde e bem-estar.</p>
            <p class="mb-0">Aqui, cada animal é tratado com carinho, atenção e cuidado, como se fosse parte da nossa família.</p>
          </div>
          <div class="col-md-6">
            <img src="img/animal.jpeg" class="imagem-inicio-fofa" alt="Animal fofo na clínica">
          </div>
        </div>
        <div class="row mt-4 text-center">
          <div class="col-md-4"><i class="fas fa-trophy fa-2x text-success"></i><br><strong>+10 anos</strong><br>de experiência</div>
          <div class="col-md-4"><i class="fas fa-smile fa-2x text-success"></i><br><strong>98%</strong><br>de satisfação</div>
          <div class="col-md-4"><i class="fas fa-dog fa-2x text-success"></i><br><strong>Adoções</strong><br>conscientes</div>
        </div>
      </div>
    </section>
    <section class="container pb-5">
      <h2 class="secao-titulo">Onde Estamos</h2>
      <div class="mapa-final">
        <iframe src="https://www.google.com/maps?q=Rua%20dos%20Bichinhos%20123%20Lisboa&output=embed" width="100%" height="400" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
      </div>
    </section>
  `,

  adocao: `
    <section class="container py-5">
      <h2 class="secao-titulo">Amigos à Espera de um Lar</h2>
      <p class="text-center fs-5 mb-5">Clique no animal para conhecer a sua história e ver mais fotografias.</p>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card card-animal animal-click" data-animal="max">
            <img src="img/cao5.png" class="card-img-top" alt="Max">
            <div class="card-body">
              <h3 class="card-title fw-bold">Max</h3>
              <span class="badge-custom">Disponível</span>
              <p><strong>Raça:</strong> Labrador<br><strong>Idade:</strong> 2 anos</p>
              <button class="btn btn-success rounded-pill w-100 mt-2">Ver perfil</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card card-animal animal-click" data-animal="luna">
            <img src="img/gatinha.png" class="card-img-top" alt="Luna">
            <div class="card-body">
              <h3 class="card-title fw-bold">Luna</h3>
              <span class="badge-custom">Disponível</span>
              <p><strong>Raça:</strong> Europeu Comum<br><strong>Idade:</strong> 1 ano</p>
              <button class="btn btn-success rounded-pill w-100 mt-2">Ver perfil</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card card-animal animal-click" data-animal="bobby">
            <img src="img/cao6.png" class="card-img-top" alt="Bobby">
            <div class="card-body">
              <h3 class="card-title fw-bold">Bobby</h3>
              <span class="badge-custom">Disponível</span>
              <p><strong>Raça:</strong> Rafeiro<br><strong>Idade:</strong> 4 anos</p>
              <button class="btn btn-success rounded-pill w-100 mt-2">Ver perfil</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,

  "processo-adocao": `
    <section class="container py-5">
      <button class="btn btn-outline-success rounded-pill mb-4" id="btnVoltarPerfilAdocao">
        <i class="fas fa-arrow-left me-2"></i>Voltar ao perfil
      </button>

      <h2 class="secao-titulo">Processo de Adoção</h2>

      <div id="resumoAnimalAdocao"></div>

      <div class="passos-adocao">
        <div class="passo-adocao">
          <div class="numero-passo">1</div>
          <h5 class="fw-bold text-success">Pedido</h5>
          <p class="mb-0">O interessado preenche o formulário com os seus dados e motivo da adoção.</p>
        </div>
        <div class="passo-adocao">
          <div class="numero-passo">2</div>
          <h5 class="fw-bold text-success">Análise</h5>
          <p class="mb-0">A clínica analisa se existem condições adequadas para receber o animal.</p>
        </div>
        <div class="passo-adocao">
          <div class="numero-passo">3</div>
          <h5 class="fw-bold text-success">Contacto</h5>
          <p class="mb-0">A equipa entra em contacto com o adotante para confirmar informações.</p>
        </div>
        <div class="passo-adocao">
          <div class="numero-passo">4</div>
          <h5 class="fw-bold text-success">Conclusão</h5>
          <p class="mb-0">O pedido pode ser aprovado ou recusado pelo administrador.</p>
        </div>
      </div>

      <div class="box-formulario">
        <h4 class="fw-bold text-success mb-3"><i class="fas fa-heart me-2"></i>Formulário de Pedido de Adoção</h4>
        <div id="avisoAdocaoLogin" class="mb-3"></div>

        <form id="formPedidoAdocao">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Nome completo</label>
              <input type="text" id="nomeAdotante" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Email</label>
              <input type="email" id="emailAdotante" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Telemóvel</label>
              <input type="tel" id="telefoneAdotante" class="form-control" maxlength="9" placeholder="912345678" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Tipo de habitação</label>
              <select id="tipoHabitacaoAdocao" class="form-select" required>
                <option value="">Selecione</option>
                <option>Apartamento</option>
                <option>Moradia</option>
                <option>Moradia com quintal</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Morada</label>
              <input type="text" id="moradaAdotante" class="form-control" placeholder="Rua, Nº, Cidade, Código-Postal" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Tem outros animais?</label>
              <select id="outrosAnimaisAdocao" class="form-select" required>
                <option value="">Selecione</option>
                <option>Sim</option>
                <option>Não</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Experiência com animais</label>
              <select id="experienciaAdocao" class="form-select" required>
                <option value="">Selecione</option>
                <option>Nunca tive animais</option>
                <option>Já tive animais anteriormente</option>
                <option>Tenho animais atualmente</option>
                <option>Tenho bastante experiência</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Porque quer adotar este animal?</label>
              <textarea id="motivoAdocao" class="form-control" rows="4" placeholder="Explique brevemente o motivo da adoção..." required></textarea>
            </div>
            <div class="col-12">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="aceitarResponsabilidadeAdocao" required>
                <label class="form-check-label" for="aceitarResponsabilidadeAdocao">
                  Confirmo que tenho condições para cuidar do animal e aceito ser contactado pela clínica.
                </label>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-success w-100 mt-4 py-2 fw-bold rounded-pill">
            <i class="fas fa-paper-plane me-2"></i>Enviar Pedido de Adoção
          </button>
        </form>

        <div id="mensagemPedidoAdocao" class="mt-3"></div>
      </div>
    </section>
  `,

  consultas: `
    <section class="container py-5">
      <h2 class="secao-titulo">Marcar Consulta ou Vacinação</h2>
      <div class="box-formulario">
        <div id="avisoLoginConsulta" class="mb-3"></div>
        <form id="formMarcacao">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Nome do tutor</label>
              <input type="text" id="nomeDono" class="form-control" required>
            </div>
            <div class="col-md-6" id="campoEmailConsulta">
              <label class="form-label fw-semibold">Email</label>
              <input type="email" id="emailDono" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Nome do animal</label>
              <input type="text" id="nomeAnimal" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Espécie do animal</label>
              <select id="especieAnimal" class="form-select" required>
                <option value="">Selecione a espécie</option>
                <option value="Cão">Cão</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Coelho">Coelho</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Raça</label>
              <input type="text" id="racaAnimal" class="form-control" placeholder="Ex: Labrador, Rafeiro...">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Sexo</label>
              <select id="sexoAnimal" class="form-select" required>
                <option value="">Selecione o sexo</option>
                <option value="M">Macho</option>
                <option value="F">Fêmea</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Serviço</label>
              <select id="servicoMarcacao" class="form-select" required>
                <option value="">Selecione</option>
                <option>Consulta Geral</option>
                <option>Vacinação</option>
                <option>Desparasitação</option>
                <option>Cirurgia</option>
                <option>Dermatologia e Exames</option>
                <option>Urgências</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Veterinário pretendido</label>
              <select id="medicoMarcacao" class="form-select" required disabled>
                <option value="">Escolhe primeiro o serviço</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Data preferencial</label>
              <input type="date" id="dataPref" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Hora disponível</label>
              <select id="horaMarcacao" class="form-select" required disabled>
                <option value="">Escolhe primeiro o médico e a data</option>
              </select>
            </div>
            <div class="col-12" id="infoHorarioMedico">
              <div class="alert alert-info mb-0">Escolhe primeiro o serviço para veres os veterinários com essa especialidade.</div>
            </div>
          </div>
          <div id="mensagemMarcacao" class="mt-3"></div>
          <button type="submit" class="btn btn-success w-100 mt-4 py-2 fw-bold rounded-pill">Submeter Pedido</button>
        </form>
      </div>
    </section>
  `,

  "minhas-marcacoes": `
    <section class="container py-5">
      <h2 class="secao-titulo">As Minhas Marcações</h2>
      <div class="box-formulario">
        <div id="avisoMinhasMarcacoes" class="mb-3"></div>
        <div id="resultadoMarcacoes"></div>
      </div>
    </section>
  `,

  pagamento: `
    <section class="container py-5">
      <h2 class="secao-titulo">Pagamento</h2>
      <div class="box-formulario">
        <div id="resumoPagamento"></div>
        <form id="formPagamento">
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="opcao-pagamento d-block">
                <input type="radio" name="metodoPagamento" value="MB WAY" required>
                <strong><i class="fas fa-mobile-alt me-2 text-success"></i>MB WAY</strong>
                <p class="mb-0 mt-2 small text-muted">Pagamento através do número de telemóvel.</p>
              </label>
            </div>
            <div class="col-md-4">
              <label class="opcao-pagamento d-block">
                <input type="radio" name="metodoPagamento" value="Multibanco" required>
                <strong><i class="fas fa-university me-2 text-success"></i>Multibanco</strong>
                <p class="mb-0 mt-2 small text-muted">Geração de entidade, referência e valor.</p>
              </label>
            </div>
            <div class="col-md-4">
              <label class="opcao-pagamento d-block">
                <input type="radio" name="metodoPagamento" value="Cartão" required>
                <strong><i class="fas fa-credit-card me-2 text-success"></i>Cartão</strong>
                <p class="mb-0 mt-2 small text-muted">Pagamento simulado com cartão bancário.</p>
              </label>
            </div>
          </div>
          <div id="camposPagamento" class="mb-4"></div>
          <button type="submit" class="btn btn-success w-100 py-2 fw-bold rounded-pill">Confirmar Pagamento</button>
        </form>
        <div id="mensagemPagamento" class="mt-3"></div>
      </div>
    </section>
  `,

  admin: `
    <section class="container py-5">
      <h2 class="secao-titulo">Painel de Administração</h2>
      <div id="avisoAdmin"></div>
      <div id="conteudoAdmin">
        <div class="row g-4 mb-4">
          <div class="col-md-3"><div class="admin-card"><i class="fas fa-calendar-check"></i><h3 id="totalMarcacoesAdmin">0</h3><p>Total de Marcações</p></div></div>
          <div class="col-md-3"><div class="admin-card"><i class="fas fa-clock"></i><h3 id="marcacoesPendentesAdmin">0</h3><p>Pendentes</p></div></div>
          <div class="col-md-3"><div class="admin-card"><i class="fas fa-check-circle"></i><h3 id="marcacoesConfirmadasAdmin">0</h3><p>Confirmadas</p></div></div>
          <div class="col-md-3"><div class="admin-card"><i class="fas fa-euro-sign"></i><h3 id="receitaAdmin">0,00 €</h3><p>Receita Confirmada</p></div></div>
        </div>

        <ul class="nav nav-tabs-custom d-flex flex-wrap" id="adminTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#funcionariosPanel" type="button" role="tab">👨‍⚕️ Funcionários</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#adocoesPanel" type="button" role="tab">🐾 Adoções</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#marcacoesPanel" type="button" role="tab">📋 Consultas</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#prescricoesPanel" type="button" role="tab">🧾 Prescrições</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#medicamentosPanel" type="button" role="tab">💊 Medicamentos</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#examesPanel" type="button" role="tab">🔬 Exames</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#clientesPanel" type="button" role="tab">👥 Clientes</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#pagamentosPanel" type="button" role="tab">💰 Pagamentos</button>
          </li>
        </ul>

        <div class="tab-content">
          <div class="tab-pane fade show active box-formulario mb-4" id="funcionariosPanel" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h4 class="fw-bold text-success mb-0"><i class="fas fa-user-md me-2"></i>Gestão por Funcionário</h4>
              <button id="btnNovaPrescricaoFuncionario" class="btn btn-success rounded-pill btn-sm px-3">
                <i class="fas fa-plus me-1"></i> Nova Prescrição
              </button>
            </div>
            <div class="funcionario-select-box">
              <label class="form-label fw-bold">Escolher funcionário</label>
              <select id="selectFuncionarioAdmin" class="form-select"></select>
              <small class="text-muted">Ao escolher um funcionário, o admin vê logo o horário, as consultas e as prescrições associadas.</small>
            </div>
            <div id="detalheFuncionarioAdmin"></div>
          </div>

          <div class="tab-pane fade box-formulario mb-4" id="adocoesPanel" role="tabpanel">
            <h4 class="fw-bold text-success mb-3"><i class="fas fa-paw me-2"></i>Pedidos de Adoção</h4>
            <div id="tabelaAdminAdocoes"></div>
          </div>

          <div class="tab-pane fade box-formulario mb-4" id="marcacoesPanel" role="tabpanel">
            <h4 class="fw-bold text-success mb-3"><i class="fas fa-list me-2"></i>Todas as Consultas / Marcações</h4>
            <div id="tabelaAdminMarcacoes"></div>
          </div>

          <div class="tab-pane fade box-formulario mb-4" id="prescricoesPanel" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h4 class="fw-bold text-success mb-0"><i class="fas fa-file-prescription me-2"></i>Prescrições Clínicas</h4>
              <button id="btnNovaPrescricao" class="btn btn-success rounded-pill btn-sm px-3">
                <i class="fas fa-plus me-1"></i> Nova Prescrição
              </button>
            </div>
            <div id="tabelaAdminPrescricoes"></div>
          </div>

          <div class="tab-pane fade box-formulario mb-4" id="medicamentosPanel" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="fw-bold text-success mb-0"><i class="fas fa-pills me-2"></i>Medicamentos</h4>
              <button id="btnNovoMedicamento" class="btn btn-success rounded-pill btn-sm px-3">
                <i class="fas fa-plus me-1"></i> Novo Medicamento
              </button>
            </div>
            <div id="tabelaAdminMedicamentos"></div>
          </div>

          <div class="tab-pane fade box-formulario mb-4" id="examesPanel" role="tabpanel">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="fw-bold text-success mb-0"><i class="fas fa-microscope me-2"></i>Exames</h4>
              <button id="btnNovoExame" class="btn btn-success rounded-pill btn-sm px-3">
                <i class="fas fa-plus me-1"></i> Novo Exame
              </button>
            </div>
            <div id="tabelaAdminExames"></div>
          </div>

          <div class="tab-pane fade box-formulario mb-4" id="clientesPanel" role="tabpanel">
            <h4 class="fw-bold text-success mb-3"><i class="fas fa-users me-2"></i>Clientes Registados</h4>
            <div id="tabelaAdminClientes"></div>
          </div>

          <div class="tab-pane fade box-formulario mb-4" id="pagamentosPanel" role="tabpanel">
            <h4 class="fw-bold text-success mb-3"><i class="fas fa-money-bill-wave me-2"></i>Pagamentos</h4>
            <div id="tabelaAdminPagamentos"></div>
          </div>
        </div>
      </div>
    </section>
  `,

  contactos: `
    <section class="container py-5">
      <h2 class="secao-titulo">Fale Connosco</h2>
      <div class="row g-4">
        <div class="col-md-4"><div class="info-card"><i class="fas fa-phone-alt"></i><h4>Telefone</h4><p>939 812 872</p></div></div>
        <div class="col-md-4"><div class="info-card"><i class="fas fa-envelope"></i><h4>Email</h4><p>miacaomigo@clinica.pt</p></div></div>
        <div class="col-md-4"><div class="info-card"><i class="fas fa-map-marker-alt"></i><h4>Morada</h4><p>Rua dos Bichinhos, 123 - Lisboa</p></div></div>
      </div>
    </section>
  `
};

// ===================== RENDER ADMIN: MEDICAMENTOS =====================
function renderAdminMedicamentos() {
  const el = document.getElementById("tabelaAdminMedicamentos");
  if (!el) return;
  if (medicamentos.length === 0) {
    el.innerHTML = `<div class="alert alert-info">Sem medicamentos registados.</div>`;
    return;
  }
  let html = `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
    <th>ID</th><th>Nome</th><th>Indicação</th><th>Stock</th><th>Preço</th><th>Ações</th>
  </tr></thead><tbody>`;
  medicamentos.forEach(m => {
    html += `<tr>
      <td>${m.id}</td>
      <td><strong>${m.nome}</strong></td>
      <td>${m.indicacao}</td>
      <td>${m.quantidade} unidades</td>
      <td>${m.preco}</td>
      <td>
        <button class="btn-acao-admin btn-editar-med me-1" data-id="${m.id}">✏️ Editar</button>
        <button class="btn-acao-admin btn-danger-admin btn-excluir-med" data-id="${m.id}">🗑️ Excluir</button>
      </td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  el.innerHTML = html;

  document.querySelectorAll(".btn-editar-med").forEach(btn =>
    btn.addEventListener("click", () => editarMedicamento(parseInt(btn.dataset.id)))
  );
  document.querySelectorAll(".btn-excluir-med").forEach(btn =>
    btn.addEventListener("click", () => {
      if (confirm("Tem a certeza que quer excluir este medicamento?")) {
        medicamentos = medicamentos.filter(m => m.id !== parseInt(btn.dataset.id));
        salvarMedicamentos();
        renderAdminMedicamentos();
      }
    })
  );
}

function editarMedicamento(id) {
  const med = medicamentos.find(m => m.id === id);
  if (!med) return;
  const novoNome = prompt("Nome do medicamento:", med.nome);
  if (novoNome !== null && novoNome.trim()) med.nome = novoNome.trim();
  const novaIndic = prompt("Indicação:", med.indicacao);
  if (novaIndic !== null && novaIndic.trim()) med.indicacao = novaIndic.trim();
  const novoStock = prompt("Stock (quantidade):", med.quantidade);
  if (novoStock !== null && !isNaN(novoStock) && novoStock.trim() !== "") med.quantidade = parseInt(novoStock);
  const novoPreco = prompt("Preço (ex: 25,00 €):", med.preco);
  if (novoPreco !== null && novoPreco.trim()) med.preco = novoPreco.trim();
  salvarMedicamentos();
  renderAdminMedicamentos();
}

// ===================== RENDER ADMIN: EXAMES =====================
function renderAdminExames() {
  const el = document.getElementById("tabelaAdminExames");
  if (!el) return;
  if (exames.length === 0) {
    el.innerHTML = `<div class="alert alert-info">Sem exames registados.</div>`;
    return;
  }
  let html = `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
    <th>ID</th><th>Nome</th><th>Descrição</th><th>Duração</th><th>Preço</th><th>Ações</th>
  </tr></thead><tbody>`;
  exames.forEach(e => {
    html += `<tr>
      <td>${e.id}</td>
      <td><strong>${e.nome}</strong></td>
      <td>${e.descricao}</td>
      <td>${e.duracao}</td>
      <td>${e.preco}</td>
      <td>
        <button class="btn-acao-admin btn-editar-exame me-1" data-id="${e.id}">✏️ Editar</button>
        <button class="btn-acao-admin btn-danger-admin btn-excluir-exame" data-id="${e.id}">🗑️ Excluir</button>
      </td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  el.innerHTML = html;

  document.querySelectorAll(".btn-editar-exame").forEach(btn =>
    btn.addEventListener("click", () => editarExame(parseInt(btn.dataset.id)))
  );
  document.querySelectorAll(".btn-excluir-exame").forEach(btn =>
    btn.addEventListener("click", () => {
      if (confirm("Tem a certeza que quer excluir este exame?")) {
        exames = exames.filter(e => e.id !== parseInt(btn.dataset.id));
        salvarExames();
        renderAdminExames();
      }
    })
  );
}

function editarExame(id) {
  const ex = exames.find(e => e.id === id);
  if (!ex) return;
  const novoNome = prompt("Nome do exame:", ex.nome);
  if (novoNome !== null && novoNome.trim()) ex.nome = novoNome.trim();
  const novaDesc = prompt("Descrição:", ex.descricao);
  if (novaDesc !== null && novaDesc.trim()) ex.descricao = novaDesc.trim();
  const novaDur = prompt("Duração estimada:", ex.duracao);
  if (novaDur !== null && novaDur.trim()) ex.duracao = novaDur.trim();
  const novoPreco = prompt("Preço (ex: 65,00 €):", ex.preco);
  if (novoPreco !== null && novoPreco.trim()) ex.preco = novoPreco.trim();
  salvarExames();
  renderAdminExames();
}

// ===================== RENDER ADMIN: FUNCIONÁRIOS / HORÁRIOS / CONSULTAS / PRESCRIÇÕES =====================
function renderAdminFuncionarios() {
  const select = document.getElementById("selectFuncionarioAdmin");
  const detalhe = document.getElementById("detalheFuncionarioAdmin");
  if (!select || !detalhe) return;

  select.innerHTML = funcionariosClinica.map(f => `<option value="${f.nome}">${f.nome} — ${f.cargo}</option>`).join("");

  const funcionarioGuardado = localStorage.getItem("funcionarioSelecionadoAdmin");
  if (funcionarioGuardado && funcionariosClinica.some(f => f.nome === funcionarioGuardado)) {
    select.value = funcionarioGuardado;
  }

  function desenharDetalheFuncionario(nomeFuncionario) {
    localStorage.setItem("funcionarioSelecionadoAdmin", nomeFuncionario);
    const f = funcionariosClinica.find(func => func.nome === nomeFuncionario);
    if (!f) return;

    const horario = horariosVeterinarios[nomeFuncionario] || { dias: [], horas: [] };
    const consultasFuncionario = marcacoes.filter(m => m.medico === nomeFuncionario);
    const prescricoesFuncionario = prescricoes.filter(p => p.funcionario === nomeFuncionario);

    const consultasHtml = consultasFuncionario.length === 0
      ? `<div class="alert alert-info mb-0">Este funcionário ainda não tem consultas marcadas.</div>`
      : `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
          <th>Data</th><th>Hora</th><th>Tutor</th><th>Animal</th><th>Serviço</th><th>Status</th>
        </tr></thead><tbody>
        ${consultasFuncionario.map(c => `<tr>
          <td>${c.dataPref}</td><td>${c.hora || "A definir"}</td><td>${c.nomeDono}</td><td>${c.nomeAnimal}</td>
          <td>${c.servico}</td><td><span class="${obterClasseStatus(c.status)}">${c.status}</span></td>
        </tr>`).join("")}
      </tbody></table></div>`;

    const prescricoesHtml = prescricoesFuncionario.length === 0
      ? `<div class="alert alert-info mb-0">Este funcionário ainda não tem prescrições registadas.</div>`
      : prescricoesFuncionario.map(p => `<div class="prescricao-card">
          <div class="d-flex justify-content-between flex-wrap gap-2">
            <div><strong>${p.medicamento}</strong> — ${p.animal}</div>
            <span class="badge bg-success">${p.data}</span>
          </div>
          <p class="mb-1 mt-2"><strong>Tutor:</strong> ${p.tutor}</p>
          <p class="mb-1"><strong>Consulta:</strong> ${p.consulta}</p>
          <p class="mb-1"><strong>Posologia:</strong> ${p.posologia}</p>
          <p class="mb-1"><strong>Duração:</strong> ${p.duracao}</p>
          <p class="mb-0"><strong>Observações:</strong> ${p.observacoes || "-"}</p>
        </div>`).join("");

    detalhe.innerHTML = `
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="funcionario-resumo-card">
            <h5><i class="fas fa-user-md me-2"></i>${f.nome}</h5>
            <p class="mb-1"><strong>Cargo:</strong> ${f.cargo}</p>
            <p class="mb-1"><strong>Especialidade:</strong> ${f.especialidade}</p>
            <p class="mb-1"><strong>Email:</strong> ${f.email}</p>
            <p class="mb-0"><strong>Telemóvel:</strong> ${f.telemovel}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="funcionario-resumo-card">
            <h5><i class="fas fa-calendar-alt me-2"></i>Horários</h5>
            <p class="mb-2"><strong>Dias:</strong></p>
            ${horario.dias.length ? horario.dias.map(d => `<span class="horario-chip">${d}</span>`).join("") : `<span class="text-muted">Sem dias definidos</span>`}
            <p class="mb-2 mt-3"><strong>Horas:</strong></p>
            ${horario.horas.length ? horario.horas.map(h => `<span class="horario-chip">${h}</span>`).join("") : `<span class="text-muted">Sem horas definidas</span>`}
          </div>
        </div>
        <div class="col-md-4">
          <div class="funcionario-resumo-card">
            <h5><i class="fas fa-chart-pie me-2"></i>Resumo</h5>
            <p class="mb-1"><strong>Consultas:</strong> ${consultasFuncionario.length}</p>
            <p class="mb-1"><strong>Prescrições:</strong> ${prescricoesFuncionario.length}</p>
            <p class="mb-0"><strong>Confirmadas:</strong> ${consultasFuncionario.filter(c => c.status === "confirmado").length}</p>
          </div>
        </div>
      </div>

      <h5 class="fw-bold text-success mb-3"><i class="fas fa-notes-medical me-2"></i>Consultas deste funcionário</h5>
      ${consultasHtml}

      <h5 class="fw-bold text-success mt-4 mb-3"><i class="fas fa-file-prescription me-2"></i>Prescrições deste funcionário</h5>
      ${prescricoesHtml}
    `;
  }

  select.onchange = () => desenharDetalheFuncionario(select.value);
  if (select.options.length > 0) desenharDetalheFuncionario(select.value);

  document.getElementById("btnNovaPrescricaoFuncionario")?.addEventListener("click", () => {
    novaPrescricao(select.value);
  });
}

function renderAdminPrescricoes() {
  const el = document.getElementById("tabelaAdminPrescricoes");
  if (!el) return;

  if (prescricoes.length === 0) {
    el.innerHTML = `<div class="alert alert-info">Ainda não existem prescrições registadas.</div>`;
  } else {
    let html = `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
      <th>Data</th><th>Funcionário</th><th>Tutor</th><th>Animal</th><th>Consulta</th><th>Medicamento</th><th>Posologia</th><th>Duração</th><th>Ações</th>
    </tr></thead><tbody>`;

    prescricoes.forEach(p => {
      html += `<tr>
        <td>${p.data}</td>
        <td>${p.funcionario}</td>
        <td>${p.tutor}</td>
        <td>${p.animal}</td>
        <td>${p.consulta}</td>
        <td><strong>${p.medicamento}</strong></td>
        <td>${p.posologia}</td>
        <td>${p.duracao}</td>
        <td>
          <button class="btn-acao-admin btn-editar-prescricao me-1" data-id="${p.id}">✏️ Editar</button>
          <button class="btn-acao-admin btn-danger-admin btn-excluir-prescricao" data-id="${p.id}">🗑️ Excluir</button>
        </td>
      </tr>`;
    });

    html += `</tbody></table></div>`;
    el.innerHTML = html;

    document.querySelectorAll(".btn-editar-prescricao").forEach(btn =>
      btn.addEventListener("click", () => editarPrescricao(parseInt(btn.dataset.id)))
    );

    document.querySelectorAll(".btn-excluir-prescricao").forEach(btn =>
      btn.addEventListener("click", () => {
        if (confirm("Tem a certeza que quer excluir esta prescrição?")) {
          prescricoes = prescricoes.filter(p => p.id !== parseInt(btn.dataset.id));
          salvarPrescricoes();
          renderAdminPrescricoes();
          renderAdminFuncionarios();
        }
      })
    );
  }

  document.getElementById("btnNovaPrescricao")?.addEventListener("click", () => novaPrescricao());
}

function novaPrescricao(funcionarioPreDefinido = "") {
  const nomesFuncionarios = funcionariosClinica.map(f => f.nome).join(", ");
  let funcionario = funcionarioPreDefinido || prompt(`Funcionário responsável:\n${nomesFuncionarios}`, funcionariosClinica[0]?.nome || "");
  if (!funcionario) return;
  funcionario = funcionario.trim();
  if (!funcionariosClinica.some(f => f.nome === funcionario)) {
    alert("Funcionário inválido. Escreve exatamente um dos nomes apresentados.");
    return;
  }

  const tutor = prompt("Nome do tutor:", "");
  if (!tutor || !tutor.trim()) return;
  const animal = prompt("Nome do animal:", "");
  if (!animal || !animal.trim()) return;
  const consulta = prompt("Tipo de consulta:", "Consulta Geral");
  if (!consulta || !consulta.trim()) return;
  const medicamento = prompt("Medicamento / prescrição:", "");
  if (!medicamento || !medicamento.trim()) return;
  const posologia = prompt("Posologia:", "Ex: 1 comprimido de 12 em 12 horas");
  if (!posologia || !posologia.trim()) return;
  const duracao = prompt("Duração:", "Ex: 7 dias");
  if (!duracao || !duracao.trim()) return;
  const observacoes = prompt("Observações:", "");

  prescricoes.push({
    id: Date.now(),
    funcionario,
    tutor: tutor.trim(),
    animal: animal.trim(),
    consulta: consulta.trim(),
    medicamento: medicamento.trim(),
    posologia: posologia.trim(),
    duracao: duracao.trim(),
    data: new Date().toISOString().slice(0, 10),
    observacoes: observacoes ? observacoes.trim() : "-"
  });

  salvarPrescricoes();
  renderAdminPrescricoes();
  renderAdminFuncionarios();
}

function editarPrescricao(id) {
  const p = prescricoes.find(pr => pr.id === id);
  if (!p) return;

  const funcionario = prompt("Funcionário responsável:", p.funcionario);
  if (funcionario !== null && funcionario.trim() && funcionariosClinica.some(f => f.nome === funcionario.trim())) p.funcionario = funcionario.trim();
  const tutor = prompt("Tutor:", p.tutor);
  if (tutor !== null && tutor.trim()) p.tutor = tutor.trim();
  const animal = prompt("Animal:", p.animal);
  if (animal !== null && animal.trim()) p.animal = animal.trim();
  const consulta = prompt("Consulta:", p.consulta);
  if (consulta !== null && consulta.trim()) p.consulta = consulta.trim();
  const medicamento = prompt("Medicamento / prescrição:", p.medicamento);
  if (medicamento !== null && medicamento.trim()) p.medicamento = medicamento.trim();
  const posologia = prompt("Posologia:", p.posologia);
  if (posologia !== null && posologia.trim()) p.posologia = posologia.trim();
  const duracao = prompt("Duração:", p.duracao);
  if (duracao !== null && duracao.trim()) p.duracao = duracao.trim();
  const observacoes = prompt("Observações:", p.observacoes || "");
  if (observacoes !== null) p.observacoes = observacoes.trim() || "-";

  salvarPrescricoes();
  renderAdminPrescricoes();
  renderAdminFuncionarios();
}

// ===================== RENDER ADMIN: PEDIDOS DE ADOÇÃO =====================
function renderAdminAdocoes() {
  const el = document.getElementById("tabelaAdminAdocoes");
  if (!el) return;

  if (pedidosAdocao.length === 0) {
    el.innerHTML = `<div class="alert alert-info mb-0">Ainda não existem pedidos de adoção.</div>`;
    return;
  }

  let html = `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
    <th>Data</th><th>Animal</th><th>Adotante</th><th>Email</th><th>Telemóvel</th><th>Habitação</th><th>Outros animais</th><th>Experiência</th><th>Motivo</th><th>Estado</th><th>Ações</th>
  </tr></thead><tbody>`;

  pedidosAdocao.forEach(p => {
    const animalJaAdotado = p.animalEstado === "Adotado" || pedidosAdocao.some(outro => outro.animal === p.animal && outro.estado === "Aprovado");
    const pedidoFechado = p.estado === "Aprovado" || p.estado === "Recusado" || p.estado === "Rejeitado";
    const bloquearAprovar = pedidoFechado || animalJaAdotado;

    html += `<tr>
      <td>${p.dataPedido}</td>
      <td><strong>${p.animal}</strong><br><small>${p.especie} · ${p.raca}</small></td>
      <td>${p.nome}</td>
      <td>${p.email}</td>
      <td>${p.telefone}</td>
      <td>${p.tipoHabitacao}</td>
      <td>${p.outrosAnimais}</td>
      <td>${p.experiencia}</td>
      <td style="max-width:260px; white-space:normal;">${p.motivo}</td>
      <td><span class="${obterClasseEstadoAdocao(p.estado)}">${p.estado}</span></td>
      <td>
        ${bloquearAprovar
          ? `<span class="text-muted small d-block mb-1">${p.estado === "Aprovado" ? "✅ Adotado" : "Encerrado"}</span>`
          : `<button class="btn btn-success btn-sm rounded-pill mb-1" data-aprovar-adocao="${p.id}">Aprovar</button>
             <button class="btn btn-warning btn-sm rounded-pill mb-1" data-recusar-adocao="${p.id}">Recusar</button>`
        }
        <button class="btn btn-danger btn-sm rounded-pill" data-apagar-adocao="${p.id}">Apagar</button>
      </td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  el.innerHTML = html;

  document.querySelectorAll("[data-aprovar-adocao]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-aprovar-adocao"));
      const pedido = pedidosAdocao.find(p => p.id === id);
      if (!pedido) return;

      if (pedido.id_pedido_db) {
        const resp = await fetchClinicaApi(`/adocao/pedidos/${pedido.id_pedido_db}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Aprovado", id_funcionario: 1 })
        });
        if (resp) {
          const dados = await resp.json();
          if (!resp.ok) {
            alert(dados.error || "Não foi possível aprovar este pedido.");
          }
        }
        await sincronizarAdocoesComBD();
      } else {
        pedidosAdocao = pedidosAdocao.map(p => {
          if (p.id === id) return { ...p, estado: "Aprovado", animalEstado: "Adotado" };
          if (p.animal === pedido.animal && p.estado === "Em análise") return { ...p, estado: "Recusado" };
          return p;
        });
        salvarPedidosAdocao();
      }
      renderAdminAdocoes();
    })
  );

  document.querySelectorAll("[data-recusar-adocao]").forEach(btn =>
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-recusar-adocao"));
      const pedido = pedidosAdocao.find(p => p.id === id);
      if (pedido?.id_pedido_db) {
        await fetchClinicaApi(`/adocao/pedidos/${pedido.id_pedido_db}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Rejeitado" })
        });
        await sincronizarAdocoesComBD();
      } else {
        pedidosAdocao = pedidosAdocao.map(p => p.id === id ? { ...p, estado: "Recusado" } : p);
        salvarPedidosAdocao();
      }
      renderAdminAdocoes();
    })
  );

  document.querySelectorAll("[data-apagar-adocao]").forEach(btn =>
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-apagar-adocao"));
      if (confirm("Tem a certeza que quer apagar este pedido de adoção?")) {
        pedidosAdocao = pedidosAdocao.filter(p => p.id !== id);
        salvarPedidosAdocao();
        renderAdminAdocoes();
      }
    })
  );
}

// ===================== PAINEL ADMIN =====================
async function carregarPainelAdmin() {
  const avisoAdmin = document.getElementById("avisoAdmin");
  const conteudoAdmin = document.getElementById("conteudoAdmin");
  if (!avisoAdmin) return;

  if (!utilizadorAdmin()) {
    avisoAdmin.innerHTML = `<div class="alert alert-danger">Acesso negado. Esta área é exclusiva do administrador da clínica.</div>`;
    if (conteudoAdmin) conteudoAdmin.classList.add("hidden");
    return;
  }

  if (conteudoAdmin) conteudoAdmin.classList.remove("hidden");

  await sincronizarConsultasComBD();
  await sincronizarAdocoesComBD();

  const utilizadores = obterUtilizadores();
  const totalMarcacoes = marcacoes.length;
  const pendentes = marcacoes.filter(m => m.status === "pendente").length;
  const confirmadas = marcacoes.filter(m => m.status === "confirmado").length;
  const receita = marcacoes.filter(m => m.status === "confirmado").reduce((t, m) => t + converterValorParaNumero(m.valor), 0);

  document.getElementById("totalMarcacoesAdmin").textContent = totalMarcacoes;
  document.getElementById("marcacoesPendentesAdmin").textContent = pendentes;
  document.getElementById("marcacoesConfirmadasAdmin").textContent = confirmadas;
  document.getElementById("receitaAdmin").textContent = formatarEuro(receita);

  const elMarcacoes = document.getElementById("tabelaAdminMarcacoes");
  if (elMarcacoes) {
    if (marcacoes.length === 0) {
      elMarcacoes.innerHTML = `<div class="alert alert-info mb-0">Ainda não existem marcações registadas.</div>`;
    } else {
      let html = `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
        <th>ID</th><th>Tutor</th><th>Email</th><th>Animal</th><th>Serviço</th>
        <th>Veterinário</th><th>Data</th><th>Hora</th><th>Valor</th><th>Status</th><th>Ações</th>
      </tr></thead><tbody>`;
      marcacoes.forEach(m => {
        html += `<tr>
          <td>${m.id}</td><td>${m.nomeDono}</td><td>${m.email}</td><td>${m.nomeAnimal}</td>
          <td>${m.servico}</td><td>${m.medico}</td><td>${m.dataPref}</td><td>${m.hora}</td>
          <td>${m.valor || "25,00 €"}</td>
          <td><span class="${obterClasseStatus(m.status)}">${m.status}</span></td>
          <td>
            <button class="btn btn-success btn-sm rounded-pill mb-1" data-confirmar="${m.id}">Confirmar</button>
            <button class="btn btn-danger btn-sm rounded-pill" data-cancelar="${m.id}">Cancelar</button>
          </td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      elMarcacoes.innerHTML = html;

      document.querySelectorAll("[data-confirmar]").forEach(btn =>
        btn.addEventListener("click", async () => {
          const id = Number(btn.getAttribute("data-confirmar"));
          const m = marcacoes.find(x => x.id === id);
          if (m?.id_consulta_db) {
            await fetch(`/api/consultas/${m.id_consulta_db}/estado`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: "Confirmada" })
            }).catch(() => {});
          }
          atualizarMarcacao(id, { status: "confirmado" });
          carregarPainelAdmin();
        })
      );
      document.querySelectorAll("[data-cancelar]").forEach(btn =>
        btn.addEventListener("click", async () => {
          const id = Number(btn.getAttribute("data-cancelar"));
          const m = marcacoes.find(x => x.id === id);
          if (m?.id_consulta_db) {
            await fetch(`/api/consultas/${m.id_consulta_db}/estado`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: "Cancelada" })
            }).catch(() => {});
          }
          const novoEstadoPag = m?.metodoPagamento ? "Reembolsado" : "";
          atualizarMarcacao(id, { status: "cancelado", estadoPagamento: novoEstadoPag });
          carregarPainelAdmin();
        })
      );
    }
  }

  const elClientes = document.getElementById("tabelaAdminClientes");
  if (elClientes) {
    if (utilizadores.length === 0) {
      elClientes.innerHTML = `<div class="alert alert-info mb-0">Ainda não existem clientes registados.</div>`;
    } else {
      let html = `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
        <th>Nome</th><th>Email</th><th>Telemóvel</th><th>NIF</th><th>Data Nascimento</th><th>Morada</th>
      </tr></thead><tbody>`;
      utilizadores.forEach(u => {
        html += `<tr>
          <td>${u.nome}</td><td>${u.email}</td><td>${u.telemovel || "-"}</td>
          <td>${u.nif || "-"}</td><td>${u.dataNascimento || "-"}</td><td>${u.morada || "-"}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      elClientes.innerHTML = html;
    }
  }

  const pagamentos = marcacoes.filter(m => m.metodoPagamento);
  const elPagamentos = document.getElementById("tabelaAdminPagamentos");
  if (elPagamentos) {
    if (pagamentos.length === 0) {
      elPagamentos.innerHTML = `<div class="alert alert-info mb-0">Ainda não existem pagamentos registados.</div>`;
    } else {
      let html = `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
        <th>Fatura</th><th>Data Pagamento</th><th>Tutor</th><th>Animal</th><th>Serviço</th><th>Método</th><th>Estado</th><th>Valor</th>
      </tr></thead><tbody>`;
      pagamentos.forEach(p => {
        const estadoPag = p.estadoPagamento || (p.status === "cancelado" ? "Reembolsado" : "Pago");
        const badgePag = estadoPag === "Reembolsado"
          ? `<span class="status-cancelado">Reembolsado</span>`
          : `<span class="status-confirmado">${estadoPag}</span>`;
        html += `<tr>
          <td>${p.id_fatura_db ? "N.º " + p.id_fatura_db : "-"}</td>
          <td>${p.dataPagamento || "-"}</td><td>${p.nomeDono}</td><td>${p.nomeAnimal}</td>
          <td>${p.servico}</td><td>${p.metodoPagamento}</td>
          <td>${badgePag}</td><td>${p.valor || "25,00 €"}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      elPagamentos.innerHTML = html;
    }
  }

  renderAdminFuncionarios();
  renderAdminPrescricoes();
  renderAdminAdocoes();
  renderAdminMedicamentos();
  renderAdminExames();

  document.getElementById("btnNovoMedicamento")?.addEventListener("click", () => {
    const novoMed = { id: Date.now(), nome: "Novo Medicamento", indicacao: "Indicação...", quantidade: 10, preco: "15,00 €" };
    medicamentos.push(novoMed);
    salvarMedicamentos();
    renderAdminMedicamentos();
    const tab = document.querySelector('[data-bs-target="#medicamentosPanel"]');
    if (tab) bootstrap.Tab.getOrCreateInstance(tab).show();
  });

  document.getElementById("btnNovoExame")?.addEventListener("click", () => {
    const novoEx = { id: Date.now(), nome: "Novo Exame", descricao: "Descrição...", duracao: "24h", preco: "40,00 €" };
    exames.push(novoEx);
    salvarExames();
    renderAdminExames();
    const tab = document.querySelector('[data-bs-target="#examesPanel"]');
    if (tab) bootstrap.Tab.getOrCreateInstance(tab).show();
  });
}

// ===================== PERFIL ANIMAL =====================
async function carregarPerfilAnimal(idAnimal) {
  await sincronizarAdocoesComBD();
  const animal = perfisAnimais[idAnimal];
  if (!animal) return;

  const jaAdotado = animal.estado === "Adotado";

  document.getElementById("conteudoPrincipal").innerHTML = `
    <section class="container py-5">
      <button class="btn btn-outline-success rounded-pill mb-4" id="btnVoltarAdocao">
        <i class="fas fa-arrow-left me-2"></i>Voltar à adoção
      </button>
      <div class="perfil-animal-topo mb-5">
        <img src="${animal.imagemPrincipal}" alt="${animal.nome}">
        <div class="perfil-animal-info">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h1 class="fw-bold text-success mb-1">${animal.nome}</h1>
              <span class="badge-custom" style="${jaAdotado ? 'background:#6c757d;' : ''}">${animal.estado}</span>
            </div>
            ${jaAdotado
              ? `<button class="btn btn-secondary btn-lg rounded-pill" disabled><i class="fas fa-check me-2"></i>Já Adotado</button>`
              : `<button class="btn btn-success btn-lg rounded-pill" id="btnQueroAdotar"><i class="fas fa-heart me-2"></i>Quero adotar</button>`
            }
          </div>
          <div class="row g-4">
            <div class="col-md-6">
              <ul class="lista-detalhes-animal">
                <li><strong>Espécie:</strong> ${animal.especie}</li>
                <li><strong>Raça:</strong> ${animal.raca}</li>
                <li><strong>Idade:</strong> ${animal.idade}</li>
                <li><strong>Sexo:</strong> ${animal.sexo}</li>
                <li><strong>Porte:</strong> ${animal.porte}</li>
              </ul>
            </div>
            <div class="col-md-6">
              <p><strong>Personalidade:</strong><br>${animal.personalidade}</p>
              <p class="mb-0"><strong>Cuidados principais:</strong><br>${animal.cuidados}</p>
            </div>
          </div>
        </div>
      </div>
      <h2 class="secao-titulo">A História de ${animal.nome}</h2>
      <div class="caixa-historia mb-5"><p class="fs-5 mb-0">${animal.historia}</p></div>
      <h2 class="secao-titulo">Mais Fotografias</h2>
      <div class="row g-4 galeria-animal">
        ${animal.fotos.map(foto => `<div class="col-md-4"><img src="${foto}" alt="Fotografia de ${animal.nome}"></div>`).join('')}
      </div>
    </section>
  `;

  document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
  document.querySelector('.menu-link[data-pagina="adocao"]')?.classList.add('active');
  document.getElementById("btnVoltarAdocao")?.addEventListener("click", () => carregarPagina("adocao"));
  document.getElementById("btnQueroAdotar")?.addEventListener("click", () => {
    localStorage.setItem("animalParaAdocao", idAnimal);
    carregarPagina("processo-adocao");
  });
}

// ===================== CARREGAR PÁGINA =====================
async function carregarPagina(pagina) {
  if (!paginas[pagina]) return;

  if (utilizadorAdmin() && pagina !== "admin") {
    pagina = "admin";
  }

  document.getElementById("conteudoPrincipal").innerHTML = paginas[pagina];
  document.querySelectorAll('.menu-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-pagina') === pagina) link.classList.add('active');
  });

  // ---- PROCESSO DE ADOÇÃO (GRAVA NO POSTGRESQL) ----
  if (pagina === "processo-adocao") {
    await sincronizarAdocoesComBD();
    const animalId = localStorage.getItem("animalParaAdocao");
    const animal = perfisAnimais[animalId];
    const user = obterUtilizadorLogado();

    const resumo = document.getElementById("resumoAnimalAdocao");
    const form = document.getElementById("formPedidoAdocao");
    const aviso = document.getElementById("avisoAdocaoLogin");

    if (!animal) {
      if (resumo) resumo.innerHTML = `<div class="alert alert-warning">Nenhum animal foi selecionado para adoção. Volta à página de adoção e escolhe um animal.</div>`;
      if (form) form.classList.add("hidden");
      return;
    }

    if (resumo) {
      resumo.innerHTML = `
        <div class="animal-adocao-resumo">
          <img src="${animal.imagemPrincipal}" alt="${animal.nome}">
          <div>
            <h4 class="fw-bold text-success mb-1">${animal.nome}</h4>
            <p class="mb-1"><strong>Espécie:</strong> ${animal.especie} · <strong>Raça:</strong> ${animal.raca}</p>
            <p class="mb-1"><strong>Idade:</strong> ${animal.idade} · <strong>Sexo:</strong> ${animal.sexo}</p>
            <p class="mb-0"><strong>Estado:</strong> ${animal.estado}</p>
          </div>
        </div>
      `;
    }

    if (animal.estado === "Adotado") {
      if (aviso) aviso.innerHTML = `<div class="alert alert-warning mb-0">Este animal já foi adotado e não aceita novos pedidos.</div>`;
      if (form) form.classList.add("hidden");
      document.getElementById("btnVoltarPerfilAdocao")?.addEventListener("click", () => carregarPerfilAnimal(animalId));
      return;
    }

    if (user && user.tipo !== "admin") {
      if (aviso) aviso.innerHTML = `<div class="alert alert-success mb-0">Sessão iniciada. Alguns dados foram preenchidos automaticamente.</div>`;
      document.getElementById("nomeAdotante").value = user.nome || "";
      document.getElementById("emailAdotante").value = user.email || "";
      document.getElementById("telefoneAdotante").value = user.telemovel || "";
      document.getElementById("moradaAdotante").value = user.morada || "";
    } else if (user && user.tipo === "admin") {
      if (aviso) aviso.innerHTML = `<div class="alert alert-warning mb-0">Estás com sessão de administrador. Para simular um pedido de adoção como cliente, preenche os dados manualmente.</div>`;
    } else {
      if (aviso) aviso.innerHTML = `<div class="alert alert-info mb-0">Podes enviar o pedido mesmo sem login, preenchendo os teus dados.</div>`;
    }

    document.getElementById("btnVoltarPerfilAdocao")?.addEventListener("click", () => carregarPerfilAnimal(animalId));

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const telefone = document.getElementById("telefoneAdotante").value.trim();
      if (telefone.length !== 9 || isNaN(telefone)) {
        alert("Insere um número de telemóvel válido com 9 dígitos.");
        return;
      }

      const tipoHabitacao = document.getElementById("tipoHabitacaoAdocao").value;
      const outrosAnimais = document.getElementById("outrosAnimaisAdocao").value;
      const experiencia = document.getElementById("experienciaAdocao").value;
      const motivo = document.getElementById("motivoAdocao").value.trim();

      const novoPedido = {
        id: Date.now(),
        animalId,
        animal: animal.nome,
        especie: animal.especie,
        raca: animal.raca,
        nome: document.getElementById("nomeAdotante").value.trim(),
        email: document.getElementById("emailAdotante").value.trim(),
        telefone,
        morada: document.getElementById("moradaAdotante").value.trim(),
        tipoHabitacao,
        outrosAnimais,
        experiencia,
        motivo,
        estado: "Em análise",
        dataPedido: new Date().toLocaleDateString('pt-PT'),
        dataResposta: "-"
      };

      const resp = await fetchClinicaApi("/adocao/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_utilizador: user && user.id ? user.id : null,
          id_animal: animal.id_db || 1,
          nome: novoPedido.nome,
          email: novoPedido.email,
          telefone: novoPedido.telefone,
          morada: novoPedido.morada,
          motivo,
          tipoHabitacao,
          outrosAnimais,
          experienciaAnimais: experiencia
        })
      });

      if (!resp) {
        document.getElementById("mensagemPedidoAdocao").innerHTML = `
          <div class="alert alert-danger">Erro de ligação ao servidor ao submeter o pedido de adoção.</div>
        `;
        return;
      }

      const data = await resp.json();

      if (!resp.ok) {
        document.getElementById("mensagemPedidoAdocao").innerHTML = `
          <div class="alert alert-danger">${data.error || "Não foi possível registar o pedido de adoção."}</div>
        `;
        return;
      }

      await sincronizarAdocoesComBD();

      document.getElementById("mensagemPedidoAdocao").innerHTML = `
        <div class="alert alert-success">
          Pedido de adoção enviado com sucesso!<br>
          <strong>Animal:</strong> ${animal.nome}<br>
          <strong>Estado:</strong> Em análise
        </div>
      `;

      form.reset();

      if (user && user.tipo !== "admin") {
        document.getElementById("nomeAdotante").value = user.nome || "";
        document.getElementById("emailAdotante").value = user.email || "";
        document.getElementById("telefoneAdotante").value = user.telemovel || "";
        document.getElementById("moradaAdotante").value = user.morada || "";
      }
    });
  }

  // ---- CONSULTAS ----
  if (pagina === 'consultas') {
    const user = obterUtilizadorLogado();
    if (user && user.tipo === "admin") {
      document.getElementById("avisoLoginConsulta").innerHTML = `<div class="alert alert-warning mb-0">Estás com sessão de administrador. Para fazer marcações como cliente, usa uma conta normal.</div>`;
    } else if (user) {
      document.getElementById("avisoLoginConsulta").innerHTML = `<div class="alert alert-success mb-0">Sessão iniciada. O teu nome e email serão usados automaticamente.</div>`;
      document.getElementById("nomeDono").value = user.nome;
      document.getElementById("nomeDono").readOnly = true;
      document.getElementById("emailDono").value = user.email;
      document.getElementById("campoEmailConsulta").classList.add("hidden");
    } else {
      document.getElementById("avisoLoginConsulta").innerHTML = `<div class="alert alert-warning mb-0">Ainda não tens sessão iniciada. Podes preencher os dados manualmente ou iniciar sessão.</div>`;
    }
    document.getElementById("servicoMarcacao")?.addEventListener("change", atualizarVeterinariosPorServico);
    document.getElementById("medicoMarcacao")?.addEventListener("change", atualizarCamposHorario);
    document.getElementById("dataPref")?.addEventListener("change", atualizarCamposHorario);
    atualizarCamposHorario();

    document.getElementById("formMarcacao")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const servicoEscolhido = document.getElementById("servicoMarcacao").value;
      const medicoEscolhido = document.getElementById("medicoMarcacao").value;
      const horaEscolhida = document.getElementById("horaMarcacao").value;
      const dataEscolhida = document.getElementById("dataPref").value;
      const emailFinal = user && user.tipo !== "admin" ? user.email : document.getElementById("emailDono").value;
      const nomeFinal = user && user.tipo !== "admin" ? user.nome : document.getElementById("nomeDono").value;
      const nomeAnimal = document.getElementById("nomeAnimal").value;
      const especieAnimal = document.getElementById("especieAnimal").value;
      const racaAnimal = document.getElementById("racaAnimal").value.trim() || "Sem raça definida";
      const sexoAnimal = document.getElementById("sexoAnimal").value;
      const valorServico = obterValorServico(servicoEscolhido);

      const nova = adicionarMarcacao({
        nomeDono: nomeFinal,
        email: emailFinal,
        nomeAnimal,
        especie: especieAnimal,
        raca: racaAnimal,
        sexo: sexoAnimal,
        servico: servicoEscolhido,
        medico: medicoEscolhido,
        hora: horaEscolhida,
        dataPref: dataEscolhida,
        valor: valorServico
      });

      localStorage.setItem("marcacaoPendentePagamento", JSON.stringify(nova));
      carregarPagina("pagamento");
    });
  }

  // ---- MINHAS MARCAÇÕES ----
  if (pagina === "minhas-marcacoes") {
    const user = obterUtilizadorLogado();
    if (!user) {
      document.getElementById("avisoMinhasMarcacoes").innerHTML = `<div class="alert alert-warning">Para veres as tuas marcações, tens de iniciar sessão.</div>`;
      document.getElementById("resultadoMarcacoes").innerHTML = '';
    } else if (user.tipo === "admin") {
      document.getElementById("avisoMinhasMarcacoes").innerHTML = `<div class="alert alert-info">Estás com sessão de administrador. Usa o painel de administração para veres todas as marcações.</div>`;
      document.getElementById("resultadoMarcacoes").innerHTML = `<button class="btn btn-success rounded-pill" onclick="carregarPagina('admin')">Ir para Administração</button>`;
    } else {
      if (user.id) await sincronizarConsultasComBD(user.id);
      document.getElementById("avisoMinhasMarcacoes").innerHTML = `<div class="alert alert-success">A mostrar automaticamente as marcações de <strong>${user.nome}</strong>.</div>`;
      const resultados = buscarMarcacoesPorEmail(user.email);
      if (resultados.length === 0) {
        document.getElementById("resultadoMarcacoes").innerHTML = `<div class="alert alert-info">Ainda não tens marcações registadas.</div>`;
      } else {
        let html = `<div class="tabela-marcacoes"><table class="table mb-0"><thead><tr>
          <th>Data Pedido</th><th>Data Pretendida</th><th>Hora</th><th>Animal</th><th>Serviço</th><th>Veterinário</th><th>Valor</th><th>Pagamento</th><th>Status</th>
        </tr></thead><tbody>`;
        resultados.forEach(m => {
          const infoPag = m.status === "cancelado" && m.metodoPagamento
            ? "Reembolsado"
            : (m.estadoPagamento || (m.metodoPagamento ? "Pago" : "Pendente"));
          html += `<tr>
            <td>${m.dataCriacao}</td><td>${m.dataPref}</td><td>${m.hora || "A definir"}</td>
            <td>${m.nomeAnimal}</td><td>${m.servico}</td><td>${m.medico || "A definir"}</td>
            <td>${m.valor || "25,00 €"}</td>
            <td>${infoPag}</td>
            <td><span class="${obterClasseStatus(m.status)}">${m.status}</span></td>
          </tr>`;
        });
        html += `</tbody></table></div>`;
        document.getElementById("resultadoMarcacoes").innerHTML = html;
      }
    }
  }

  // ---- PAGAMENTO ----
  if (pagina === "pagamento") {
    const marcacaoPagamento = JSON.parse(localStorage.getItem("marcacaoPendentePagamento"));
    const user = obterUtilizadorLogado();
    const resumo = document.getElementById("resumoPagamento");
    const formPagamento = document.getElementById("formPagamento");
    const camposPagamento = document.getElementById("camposPagamento");

    function mostrarCamposPagamento(metodo) {
      if (!camposPagamento) return;
      if (metodo === "MB WAY") {
        camposPagamento.innerHTML = `<div class="resumo-pagamento"><h5 class="fw-bold mb-3"><i class="fas fa-mobile-alt me-2"></i>Dados MB WAY</h5><div class="row g-3"><div class="col-md-6"><label class="form-label fw-semibold">Número de telemóvel</label><input type="tel" id="numeroMbway" class="form-control" placeholder="912345678" maxlength="9" value="${user && user.telemovel ? user.telemovel : ""}" required></div></div></div>`;
      }
      if (metodo === "Cartão") {
        camposPagamento.innerHTML = `<div class="resumo-pagamento"><h5 class="fw-bold mb-3"><i class="fas fa-credit-card me-2"></i>Dados do Cartão</h5><div class="row g-3"><div class="col-md-6"><label class="form-label fw-semibold">Nome no cartão</label><input type="text" id="nomeCartao" class="form-control" placeholder="Nome completo" required></div><div class="col-md-6"><label class="form-label fw-semibold">Número do cartão</label><input type="text" id="numeroCartao" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19" required></div><div class="col-md-6"><label class="form-label fw-semibold">Validade</label><input type="month" id="validadeCartao" class="form-control" required></div><div class="col-md-6"><label class="form-label fw-semibold">CVV</label><input type="password" id="cvvCartao" class="form-control" placeholder="123" maxlength="3" required></div></div></div>`;
      }
      if (metodo === "Multibanco") {
        const ref = Math.floor(100000000 + Math.random() * 900000000);
        camposPagamento.innerHTML = `<div class="resumo-pagamento"><h5 class="fw-bold mb-3"><i class="fas fa-university me-2"></i>Dados Multibanco</h5><p class="mb-1"><strong>Entidade:</strong> <span id="entidadeMultibanco">12345</span></p><p class="mb-1"><strong>Referência:</strong> <span id="referenciaMultibanco">${ref}</span></p><p class="mb-0"><strong>Valor:</strong> ${marcacaoPagamento ? marcacaoPagamento.valor : "25,00 €"}</p></div>`;
      }
    }

    if (!marcacaoPagamento) {
      resumo.innerHTML = `<div class="alert alert-info">Ainda não existe nenhuma marcação pendente para pagamento.</div>`;
      formPagamento.classList.add("hidden");
    } else {
      resumo.innerHTML = `<div class="resumo-pagamento"><h4 class="fw-bold mb-3"><i class="fas fa-receipt me-2"></i>Resumo da Marcação</h4>
        <p class="mb-1"><strong>Tutor:</strong> ${marcacaoPagamento.nomeDono}</p>
        <p class="mb-1"><strong>Email:</strong> ${user && user.tipo !== "admin" ? user.email : marcacaoPagamento.email}</p>
        <p class="mb-1"><strong>Animal:</strong> ${marcacaoPagamento.nomeAnimal} (${marcacaoPagamento.especie || "Cão"}${marcacaoPagamento.raca ? " · " + marcacaoPagamento.raca : ""})</p>
        <p class="mb-1"><strong>Serviço:</strong> ${marcacaoPagamento.servico}</p>
        <p class="mb-1"><strong>Veterinário:</strong> ${marcacaoPagamento.medico || "A definir"}</p>
        <p class="mb-1"><strong>Data pretendida:</strong> ${marcacaoPagamento.dataPref}</p>
        <p class="mb-1"><strong>Hora:</strong> ${marcacaoPagamento.hora || "A definir"}</p>
        <p class="mb-0 fs-5"><strong>Valor a pagar:</strong> ${marcacaoPagamento.valor || "25,00 €"}</p>
      </div>`;
    }

    document.querySelectorAll('input[name="metodoPagamento"]').forEach(radio =>
      radio.addEventListener("change", () => mostrarCamposPagamento(radio.value))
    );

    formPagamento?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const metodo = document.querySelector('input[name="metodoPagamento"]:checked')?.value;
      if (!metodo || !marcacaoPagamento) return;
      let detalhesPagamento = "";
      if (metodo === "MB WAY") {
        const n = document.getElementById("numeroMbway").value.trim();
        if (n.length !== 9 || isNaN(n)) { alert("Insere um número MB WAY válido com 9 dígitos."); return; }
        detalhesPagamento = `MB WAY: ${n}`;
      }
      if (metodo === "Cartão") {
        const nome = document.getElementById("nomeCartao").value.trim();
        const num = document.getElementById("numeroCartao").value.split(" ").join("");
        const val = document.getElementById("validadeCartao").value;
        const cvv = document.getElementById("cvvCartao").value.trim();
        if (!nome || num.length < 13 || isNaN(num) || !val || cvv.length !== 3 || isNaN(cvv)) { alert("Preenche corretamente os dados do cartão."); return; }
        detalhesPagamento = `Cartão terminado em ${num.slice(-4)}`;
      }
      if (metodo === "Multibanco") {
        const entidade = document.getElementById("entidadeMultibanco")?.textContent;
        const ref = document.getElementById("referenciaMultibanco")?.textContent;
        detalhesPagamento = `Entidade: ${entidade} | Referência: ${ref}`;
      }

      let idConsultaDb = null;
      let idFaturaDb = null;
      if (user && user.id) {
        try {
          const dataHoraISO = `${marcacaoPagamento.dataPref} ${marcacaoPagamento.hora || "10:00"}:00`;
          const resp = await fetch("/api/consultas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_utilizador: user.id,
              animalNome: marcacaoPagamento.nomeAnimal,
              especie: marcacaoPagamento.especie || "Cão",
              raca: marcacaoPagamento.raca || "Sem raça definida",
              sexo: marcacaoPagamento.sexo || null,
              dataHora: dataHoraISO,
              motivo: marcacaoPagamento.servico,
              observacoes: `Consulta com ${marcacaoPagamento.medico}`,
              valor: converterValorParaNumero(marcacaoPagamento.valor),
              metodoPagamento: metodo
            })
          });
          const resDb = await resp.json();
          if (resp.ok) {
            idConsultaDb = resDb.id_consulta;
            idFaturaDb = resDb.id_fatura;
          }
        } catch (err) {
          console.warn("Erro ao gravar consulta/pagamento na BD:", err);
        }
      }

      atualizarMarcacao(marcacaoPagamento.id, {
        id_consulta_db: idConsultaDb,
        id_fatura_db: idFaturaDb,
        status: "pendente",
        metodoPagamento: metodo,
        estadoPagamento: "Pago",
        detalhesPagamento,
        dataPagamento: new Date().toLocaleDateString('pt-PT')
      });
      localStorage.removeItem("marcacaoPendentePagamento");
      const emailDestino = user && user.email ? user.email : marcacaoPagamento.email;
      const textoFatura = idFaturaDb ? ` (Fatura N.º <strong>${idFaturaDb}</strong>)` : "";
      document.getElementById("mensagemPagamento").innerHTML = `
        <div class="alert alert-success">
          Pagamento registado com sucesso através de <strong>${metodo}</strong>.<br>
          <small>${detalhesPagamento}</small><br>
          O teu pedido de consulta foi submetido e aguarda confirmação pela clínica. A fatura${textoFatura} será enviada para <strong>${emailDestino}</strong>.<br>
          <small class="text-muted">Nota: Caso a consulta seja desmarcada pela clínica, o valor pago será reembolsado automaticamente.</small>
        </div>`;
      formPagamento.classList.add("hidden");
    });
  }

  // ---- ADMIN ----
  if (pagina === "admin") {
    carregarPainelAdmin();
  }

  // ---- ADOÇÃO ----
  if (pagina === "adocao") {
    await sincronizarAdocoesComBD();
    document.querySelectorAll(".animal-click").forEach(card => {
      const key = card.getAttribute("data-animal");
      const perfil = perfisAnimais[key];
      if (perfil && perfil.estado === "Adotado") {
        const badge = card.querySelector(".badge-custom");
        if (badge) {
          badge.textContent = "Adotado";
          badge.style.background = "#6c757d";
        }
      }
      card.addEventListener("click", () => carregarPerfilAnimal(key));
    });
  }

  // ---- INÍCIO ----
  if (pagina === "inicio") {
    document.getElementById("btnHeroAdocao")?.addEventListener("click", () => carregarPagina("adocao"));
  }
}

// ===================== INTERFACE DO UTILIZADOR =====================
function atualizarInterface() {
  const user = obterUtilizadorLogado();
  const ehAdmin = Boolean(user && user.tipo === "admin");

  document.querySelectorAll(".nav-cliente").forEach(item => {
    item.classList.toggle("hidden", ehAdmin);
  });

  const rodapeLinks = document.getElementById("rodapeLinksRapidos");
  if (rodapeLinks) {
    rodapeLinks.classList.toggle("hidden", ehAdmin);
  }

  if (user) {
    document.getElementById("textoUtilizador").innerHTML = `Olá, ${user.nome.split(' ')[0]}`;
    document.getElementById("btnAbrirLogin").classList.add("hidden");
    document.getElementById("btnAbrirConta").classList.add("hidden");
    document.getElementById("btnLogout").classList.remove("hidden");
    document.getElementById("menuAdmin").classList.toggle("hidden", !ehAdmin);
  } else {
    document.getElementById("textoUtilizador").innerHTML = "";
    document.getElementById("btnAbrirLogin").classList.remove("hidden");
    document.getElementById("btnAbrirConta").classList.remove("hidden");
    document.getElementById("btnLogout").classList.add("hidden");
    document.getElementById("menuAdmin").classList.add("hidden");
  }
}

// ===================== EVENTOS: CRIAR CONTA =====================
document.getElementById("formCriarConta")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nomeConta").value.trim();
  const dataNascimento = document.getElementById("dataNascimentoConta").value;
  const nif = document.getElementById("nifConta").value.trim();
  const telemovel = document.getElementById("telemovelConta").value.trim();
  const morada = document.getElementById("moradaConta").value.trim();
  const email = document.getElementById("emailConta").value.trim();
  const senha = document.getElementById("senhaConta").value;

  if (!dataNascimento) { alert("Por favor, insira a sua data de nascimento."); return; }
  if (nif.length !== 9 || isNaN(nif)) { alert("Por favor, insira um NIF válido com 9 dígitos."); return; }
  if (telemovel.length !== 9 || isNaN(telemovel)) { alert("Por favor, insira um número de telemóvel válido com 9 dígitos."); return; }
  if (!morada) { alert("Por favor, insira a sua morada."); return; }
  if (email === "admin@miacaomigo.pt") { alert("Este email está reservado para o administrador."); return; }

  try {
    const resp = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, dataNascimento, nif, telemovel, morada, email, senha })
    });
    const dados = await resp.json();

    if (!resp.ok) {
      alert(dados.error || "Erro ao criar conta.");
      return;
    }

    alert("Conta criada com sucesso na base de dados! Agora pode fazer login.");
    bootstrap.Modal.getInstance(document.getElementById("modalCriarConta")).hide();
    document.getElementById("formCriarConta").reset();
  } catch (err) {
    alert("Erro de ligação ao servidor: " + err.message);
  }
});

// ===================== EVENTOS: LOGIN =====================
document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailLogin = document.getElementById("emailLogin").value.trim();
  const senhaLogin = document.getElementById("passwordLogin").value;

  if (emailLogin === "admin@miacaomigo.pt" && senhaLogin === "admin123") {
    localStorage.setItem("utilizadorLogado", JSON.stringify({ nome: "Administrador", email: "admin@miacaomigo.pt", tipo: "admin" }));
    alert("Sessão iniciada como administrador.");
    bootstrap.Modal.getInstance(document.getElementById("modalLogin")).hide();
    atualizarInterface();
    carregarPagina("admin");
    document.getElementById("formLogin").reset();
    return;
  }

  try {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailLogin, senha: senhaLogin })
    });
    const userEncontrado = await resp.json();

    if (!resp.ok) {
      alert(userEncontrado.error || "Email ou senha incorretos.");
      return;
    }

    localStorage.setItem("utilizadorLogado", JSON.stringify(userEncontrado));
    alert(`Bem-vindo de volta, ${userEncontrado.nome}!`);
    bootstrap.Modal.getInstance(document.getElementById("modalLogin")).hide();
    atualizarInterface();
    carregarPagina("inicio");
    document.getElementById("formLogin").reset();
  } catch (err) {
    alert("Erro de ligação ao servidor.");
  }
});

// ===================== EVENTOS: LOGOUT / NAVEGAÇÃO =====================
document.getElementById("btnLogout")?.addEventListener("click", () => {
  localStorage.removeItem("utilizadorLogado");
  atualizarInterface();
  carregarPagina("inicio");
});

document.querySelectorAll('.menu-link, .link-navegacao').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pagina = link.getAttribute('data-pagina');
    if (pagina) carregarPagina(pagina);
  });
});

document.getElementById("logoLink")?.addEventListener("click", (e) => {
  e.preventDefault();
  carregarPagina(utilizadorAdmin() ? "admin" : "inicio");
});

// ===================== IMAGEM DE FUNDO (LADO ESQUERDO) =====================
function definirBgEsquerdo(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const url = e.target.result;
    const bg = document.getElementById("splashLeftBg");
    bg.style.background = `linear-gradient(160deg, rgba(10,27,15,0.72) 0%, rgba(20,70,35,0.38) 60%, rgba(10,27,15,0.85) 100%), url('${url}') center/cover no-repeat`;
    try { localStorage.setItem("splashBgEsquerdo", url); } catch(e) {}
  };
  reader.readAsDataURL(input.files[0]);
}

function restaurarBgLogin() {
  try {
    const url = localStorage.getItem("splashBgEsquerdo");
    if (url) {
      const bg = document.getElementById("splashLeftBg");
      bg.style.background = `linear-gradient(160deg, rgba(10,27,15,0.72) 0%, rgba(20,70,35,0.38) 60%, rgba(10,27,15,0.85) 100%), url('${url}') center/cover no-repeat`;
    }
  } catch(e) {}
}

// ===================== SPLASH SCREEN LOGIC =====================
function mudarTabSplash(tab) {
  document.getElementById("tabEntrar").classList.toggle("active", tab === "entrar");
  document.getElementById("tabRegistar").classList.toggle("active", tab === "registar");
  document.getElementById("painelEntrar").classList.toggle("active", tab === "entrar");
  document.getElementById("painelRegistar").classList.toggle("active", tab === "registar");
  document.getElementById("erroLogin").style.display = "none";
  document.getElementById("erroRegisto").style.display = "none";
}

function fecharSplash() {
  const splash = document.getElementById("splashScreen");
  splash.classList.add("splash-exit");
  setTimeout(() => { splash.style.display = "none"; }, 600);
}

async function tentarLoginSplash() {
  const email = document.getElementById("splashEmail").value.trim();
  const senha = document.getElementById("splashSenha").value;
  const erroEl = document.getElementById("erroLogin");
  erroEl.style.display = "none";

  if (!email || !senha) {
    erroEl.textContent = "Preencha o email e a senha.";
    erroEl.style.display = "block";
    return;
  }

  if (email === "admin@miacaomigo.pt" && senha === "admin123") {
    localStorage.setItem("utilizadorLogado", JSON.stringify({ nome: "Administrador", email: "admin@miacaomigo.pt", tipo: "admin" }));
    fecharSplash();
    atualizarInterface();
    carregarPagina("admin");
    return;
  }

  try {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });
    const user = await resp.json();

    if (resp.ok) {
      localStorage.setItem("utilizadorLogado", JSON.stringify(user));
      fecharSplash();
      atualizarInterface();
      carregarPagina("inicio");
    } else {
      erroEl.textContent = user.error || "Email ou senha incorretos. Verifique os seus dados.";
      erroEl.style.display = "block";
    }
  } catch (err) {
    erroEl.textContent = "Erro de ligação ao servidor.";
    erroEl.style.display = "block";
  }
}

async function tentarRegistoSplash() {
  const erroEl = document.getElementById("erroRegisto");
  erroEl.style.display = "none";

  const nome = document.getElementById("splashNome").value.trim();
  const dataNasc = document.getElementById("splashDataNasc").value;
  const nif = document.getElementById("splashNif").value.trim();
  const tel = document.getElementById("splashTelemovel").value.trim();
  const morada = document.getElementById("splashMorada").value.trim();
  const email = document.getElementById("splashEmailReg").value.trim();
  const senha = document.getElementById("splashSenhaReg").value;

  if (!nome || !dataNasc || !nif || !tel || !morada || !email || !senha) {
    erroEl.textContent = "Por favor, preencha todos os campos.";
    erroEl.style.display = "block";
    return;
  }
  if (nif.length !== 9 || isNaN(nif)) {
    erroEl.textContent = "NIF inválido. Deve ter 9 dígitos.";
    erroEl.style.display = "block";
    return;
  }
  if (tel.length !== 9 || isNaN(tel)) {
    erroEl.textContent = "Telemóvel inválido. Deve ter 9 dígitos.";
    erroEl.style.display = "block";
    return;
  }
  if (senha.length < 4) {
    erroEl.textContent = "A senha deve ter pelo menos 4 caracteres.";
    erroEl.style.display = "block";
    return;
  }
  if (email === "admin@miacaomigo.pt") {
    erroEl.textContent = "Este email está reservado.";
    erroEl.style.display = "block";
    return;
  }

  try {
    const resp = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, dataNascimento: dataNasc, nif, telemovel: tel, morada, email, senha })
    });
    const novoUser = await resp.json();

    if (!resp.ok) {
      erroEl.textContent = novoUser.error || "Erro ao criar conta.";
      erroEl.style.display = "block";
      return;
    }

    localStorage.setItem("utilizadorLogado", JSON.stringify(novoUser));
    fecharSplash();
    atualizarInterface();
    carregarPagina("inicio");
  } catch (err) {
    erroEl.textContent = "Erro de ligação ao servidor.";
    erroEl.style.display = "block";
  }
}

function entrarSemLogin() {
  fecharSplash();
  atualizarInterface();
  carregarPagina("inicio");
}

// Permitir Enter nos campos da splash
document.getElementById("splashSenha")?.addEventListener("keydown", e => { if (e.key === "Enter") tentarLoginSplash(); });
document.getElementById("splashEmail")?.addEventListener("keydown", e => { if (e.key === "Enter") tentarLoginSplash(); });

// ===================== ARRANQUE =====================
restaurarBgLogin();
atualizarInterface();
const userAtual = obterUtilizadorLogado();
if (userAtual) {
  document.getElementById("splashScreen").style.display = "none";
  carregarPagina(userAtual.tipo === "admin" ? "admin" : "inicio");
} else {
  carregarPagina("inicio");
}