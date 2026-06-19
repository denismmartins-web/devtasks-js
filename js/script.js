"use strict";

// Chave fixa usada para salvar e buscar os dados no localStorage.
// Pense nela como o nome da gaveta onde guardamos os registros.
const STORAGE_KEY = "study-tasks-registros";

// Busca no HTML o elemento onde será exibido o mês atual.
const mesAtual = document.getElementById("mesAtual");

// Busca no HTML o elemento onde será exibido o ano atual.
const anoAtual = document.getElementById("anoAtual");

// Busca o formulário de cadastro pelo id.
const formularioRegistro = document.getElementById("registroForm");

// Busca o card visual onde o formulário está dentro.
// Usaremos esse card para destacar quando o usuário estiver editando.
const cardFormulario = document.querySelector(".form-card");

// Busca a mensagem que aparece abaixo do formulário.
const mensagemStatus = document.getElementById("mensagemStatus");

// Busca os botões do formulário.
const botaoSubmit = document.getElementById("botaoSubmit");
const botaoCancelarEdicao = document.getElementById("botaoCancelarEdicao");

// Busca todos os elementos que possuem o atributo data-lista-dia.
// Esses elementos são as listas onde os cards serão renderizados.
const listasDosDias = document.querySelectorAll("[data-lista-dia]");

// Busca todos os blocos que representam dias da semana.
// O JavaScript usará essa lista para marcar automaticamente o dia atual.
const colunasDosDias = document.querySelectorAll("[data-dia-coluna]");

// Busca os botões do mini calendário mobile.
// Eles usam data-dia-alvo para indicar para qual dia a página deve rolar.
const botoesDiasMobile = document.querySelectorAll("[data-dia-alvo]");

// Busca os botões de filtro.
const botoesFiltro = document.querySelectorAll("[data-filtro]");

// Busca os elementos dos contadores.
const contadorTotal = document.getElementById("contadorTotal");
const contadorPendentes = document.getElementById("contadorPendentes");
const contadorConcluidos = document.getElementById("contadorConcluidos");
const contadorUrgentes = document.getElementById("contadorUrgentes");

// Guarda qual filtro está ativo no momento.
let filtroAtual = "todos";

// Guarda o id do registro que está sendo editado.
// Quando for null, significa que estamos cadastrando um novo registro.
let idRegistroEmEdicao = null;

// Cria uma lista com os nomes dos meses em português.
const nomesDosMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Cria um objeto Date com a data atual do sistema.
const dataAtual = new Date();

// Relaciona o número retornado pelo getDay() com o nome usado no nosso HTML.
// No JavaScript: 0 = domingo, 1 = segunda, 2 = terça, e assim por diante.
const diasDaSemanaPeloIndice = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

// Guarda o dia atual usando o mesmo padrão dos data attributes do HTML.
const diaAtualDaSemana = diasDaSemanaPeloIndice[dataAtual.getDay()];

// Exibe o mês atual na tela, caso o elemento exista.
if (mesAtual) {
  mesAtual.textContent = nomesDosMeses[dataAtual.getMonth()];
}

// Exibe o ano atual na tela, caso o elemento exista.
if (anoAtual) {
  anoAtual.textContent = dataAtual.getFullYear();
}

// Marca automaticamente o dia atual na semana.
// Analogia: o HTML deixa uma "etiqueta" com data-dia-coluna,
// e o JavaScript compara essa etiqueta com o dia real do calendário.
function marcarDiaAtualNaSemana() {
  colunasDosDias.forEach(function (coluna) {
    const diaDaColuna = coluna.dataset.diaColuna;
    const seloAntigo = coluna.querySelector(".today-badge");

    // Remove selo antigo para evitar duplicação caso a função rode novamente.
    if (seloAntigo) {
      seloAntigo.remove();
    }

    // Se a coluna não representa o dia atual, garante que ela fique normal.
    if (diaDaColuna !== diaAtualDaSemana) {
      coluna.classList.remove("dia-atual");
      return;
    }

    // Se chegou aqui, essa coluna é o dia atual.
    coluna.classList.add("dia-atual");

    // Cria o selo visual "Hoje" que aparece na ponta do card/coluna.
    const seloHoje = document.createElement("span");
    seloHoje.classList.add("today-badge");
    seloHoje.textContent = "Hoje";
    seloHoje.setAttribute("aria-label", "Dia atual da semana");

    coluna.appendChild(seloHoje);
  });

  // Também marca o botão do mini calendário que representa o dia atual.
  botoesDiasMobile.forEach(function (botao) {
    if (botao.dataset.diaAlvo === diaAtualDaSemana) {
      botao.classList.add("mobile-day-today");
      botao.classList.add("mobile-day-selected");
      botao.setAttribute("aria-label", botao.textContent.trim() + " - hoje");
    } else {
      botao.classList.remove("mobile-day-today");
      botao.classList.remove("mobile-day-selected");
      botao.removeAttribute("aria-label");
    }
  });
}

// Atualiza qual botão do mini calendário está selecionado.
// Isso cria a sensação de carrossel: o dia escolhido ganha destaque no centro.
function selecionarDiaNoMiniCalendario(diaAlvo) {
  botoesDiasMobile.forEach(function (botao) {
    if (botao.dataset.diaAlvo === diaAlvo) {
      botao.classList.add("mobile-day-selected");

      botao.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    } else {
      botao.classList.remove("mobile-day-selected");
    }
  });
}

// Faz a rolagem suave até o bloco de um dia da semana.
// Essa função é usada pelos botões do mini calendário mobile.
function rolarAteDiaDaSemana(diaAlvo) {
  const blocoDoDia = document.querySelector(`[data-dia-coluna="${diaAlvo}"]`);

  // Se o dia não for encontrado, mostramos uma mensagem simples e paramos a função.
  if (!blocoDoDia) {
    mensagemStatus.textContent = "Não encontrei esse dia na semana.";
    return;
  }

  // Primeiro destacamos o botão do mini calendário.
  selecionarDiaNoMiniCalendario(diaAlvo);

  // scrollIntoView é como dizer para o navegador:
  // "leve a tela suavemente até esse bloco".
  // No celular, inline: "center" também centraliza o card no carrossel horizontal.
  blocoDoDia.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "center",
  });

  // Aplica uma classe temporária para dar um pulso visual no dia escolhido.
  blocoDoDia.classList.add("mobile-focus");

  setTimeout(function () {
    blocoDoDia.classList.remove("mobile-focus");
  }, 1200);

  mensagemStatus.textContent = `Dia selecionado: ${blocoDoDia.textContent.trim().split("\n")[0]}.`;
}

// Busca os registros salvos no localStorage.
// Se não existir nada salvo, retorna array vazio.
function carregarRegistrosDoLocalStorage() {
  const registrosSalvos = localStorage.getItem(STORAGE_KEY);

  if (!registrosSalvos) {
    return [];
  }

  try {
    return JSON.parse(registrosSalvos);
  } catch (erro) {
    console.error("Erro ao carregar registros do localStorage:", erro);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

// Salva o array registros no localStorage.
// O localStorage guarda texto, então usamos JSON.stringify.
function salvarRegistrosNoLocalStorage() {
  const registrosEmTexto = JSON.stringify(registros);
  localStorage.setItem(STORAGE_KEY, registrosEmTexto);
}

// Array principal do projeto.
// Ele inicia com os dados salvos no navegador.
let registros = carregarRegistrosDoLocalStorage();

// Função simples para evitar que textos digitados pelo usuário sejam interpretados como HTML.
function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Converte a importância em uma classe CSS.
function obterClasseImportancia(importancia) {
  if (importancia === "Urgente") {
    return "urgent-border";
  }

  if (importancia === "Média") {
    return "medium-border";
  }

  return "low-border";
}

// Cria a mensagem exibida quando um dia não possui registros.
// Sábado e domingo recebem uma mensagem diferente para representar descanso/folga.
function criarMensagemVazia(diaDaLista) {
  if (diaDaLista === "sabado" || diaDaLista === "domingo") {
    return `
      <div class="empty-message rest-message">
        <strong>🌙 Dia livre</strong>
        Sem tarefa cadastrada. Se precisar estudar, adicione um registro normalmente.
      </div>
    `;
  }

  return '<div class="empty-message">Nenhum registro neste filtro.</div>';
}

// Limpa todas as listas dos dias antes de redesenhar os cards.
function limparListasDosDias() {
  listasDosDias.forEach(function (lista) {
    lista.innerHTML = "";
  });
}

// Recebe um registro e decide se ele deve aparecer no filtro atual.
function registroPassaNoFiltro(registro) {
  if (filtroAtual === "todos") {
    return true;
  }

  if (filtroAtual === "pendentes") {
    return !registro.concluido;
  }

  if (filtroAtual === "concluidos") {
    return registro.concluido;
  }

  if (filtroAtual === "urgentes") {
    return registro.importancia === "Urgente";
  }

  if (filtroAtual === "media") {
    return registro.importancia === "Média";
  }

  if (filtroAtual === "baixa") {
    return registro.importancia === "Baixa";
  }

  return true;
}

// Retorna uma nova lista apenas com os registros que passam no filtro atual.
function obterRegistrosFiltrados() {
  return registros.filter(function (registro) {
    return registroPassaNoFiltro(registro);
  });
}

// Renderiza as mensagens vazias nos dias sem registros filtrados.
function renderizarMensagensVazias(registrosFiltrados) {
  listasDosDias.forEach(function (lista) {
    const diaDaLista = lista.dataset.listaDia;

    const existeRegistroNesseDia = registrosFiltrados.some(function (registro) {
      return registro.diaSemana === diaDaLista;
    });

    if (!existeRegistroNesseDia) {
      lista.innerHTML = criarMensagemVazia(diaDaLista);
    }
  });
}

// Cria o HTML de um card de registro.
function criarCardRegistro(registro) {
  const classeImportancia = obterClasseImportancia(registro.importancia);
  const classeConcluido = registro.concluido ? "task-card-completed" : "";
  const textoBotaoStatus = registro.concluido ? "🔄 Reabrir" : "✅ Concluir";

  const materiaSegura = escaparHTML(registro.materia);
  const tituloSeguro = escaparHTML(registro.titulo);
  const descricaoSegura = escaparHTML(
    registro.descricao || "Sem descrição adicionada."
  );
  const importanciaSegura = escaparHTML(registro.importancia);

  return `
    <article class="task-card ${classeImportancia} ${classeConcluido}">
      <span class="task-subject">${materiaSegura}</span>

      <h4>${tituloSeguro}</h4>

      <p>${descricaoSegura}</p>

      <small>${importanciaSegura}</small>

      <div class="task-actions">
        <button type="button" data-acao="editar" data-id="${registro.id}">
          ✏️ Editar
        </button>

        <button type="button" data-acao="alternar-status" data-id="${registro.id}">
          ${textoBotaoStatus}
        </button>

        <button type="button" data-acao="excluir" data-id="${registro.id}">
          🗑️ Excluir
        </button>
      </div>
    </article>
  `;
}

// Atualiza os contadores superiores do projeto.
function atualizarContadores() {
  const total = registros.length;

  const pendentes = registros.filter(function (registro) {
    return !registro.concluido;
  }).length;

  const concluidos = registros.filter(function (registro) {
    return registro.concluido;
  }).length;

  const urgentes = registros.filter(function (registro) {
    return registro.importancia === "Urgente";
  }).length;

  if (contadorTotal) {
    contadorTotal.textContent = total;
  }

  if (contadorPendentes) {
    contadorPendentes.textContent = pendentes;
  }

  if (contadorConcluidos) {
    contadorConcluidos.textContent = concluidos;
  }

  if (contadorUrgentes) {
    contadorUrgentes.textContent = urgentes;
  }
}

// Atualiza qual botão de filtro aparece como ativo.
function atualizarBotaoFiltroAtivo() {
  botoesFiltro.forEach(function (botao) {
    if (botao.dataset.filtro === filtroAtual) {
      botao.classList.add("active");
    } else {
      botao.classList.remove("active");
    }
  });
}

// Função principal de renderização.
function renderizarRegistros() {
  limparListasDosDias();

  const registrosFiltrados = obterRegistrosFiltrados();

  registrosFiltrados.forEach(function (registro) {
    const listaDoDia = document.querySelector(
      `[data-lista-dia="${registro.diaSemana}"]`
    );

    if (listaDoDia) {
      listaDoDia.innerHTML += criarCardRegistro(registro);
    }
  });

  renderizarMensagensVazias(registrosFiltrados);
  atualizarContadores();
  atualizarBotaoFiltroAtivo();
}

// Cria um objeto de registro usando os dados do formulário.
function criarRegistroPeloFormulario() {
  const titulo = document.getElementById("titulo").value.trim();
  const materia = document.getElementById("materia").value;
  const diaSemana = document.getElementById("diaSemana").value;
  const importancia = document.getElementById("importancia").value;
  const descricao = document.getElementById("descricao").value.trim();

  const novoRegistro = {
    id: Date.now(),
    titulo: titulo,
    materia: materia,
    diaSemana: diaSemana,
    importancia: importancia,
    descricao: descricao,
    concluido: false,
    criadoEm: new Date().toISOString(),
  };

  return novoRegistro;
}

// Preenche o formulário com os dados de um registro existente.
function preencherFormularioParaEdicao(idRegistro) {
  const registroEncontrado = registros.find(function (registro) {
    return registro.id === idRegistro;
  });

  if (!registroEncontrado) {
    mensagemStatus.textContent = "Registro não encontrado para edição.";
    return;
  }

  document.getElementById("titulo").value = registroEncontrado.titulo;
  document.getElementById("materia").value = registroEncontrado.materia;
  document.getElementById("diaSemana").value = registroEncontrado.diaSemana;
  document.getElementById("importancia").value = registroEncontrado.importancia;
  document.getElementById("descricao").value = registroEncontrado.descricao;

  idRegistroEmEdicao = idRegistro;

  if (botaoSubmit) {
    botaoSubmit.textContent = "💾 Salvar alteração";
  }

  if (cardFormulario) {
    cardFormulario.classList.add("editing-mode");
  }

  if (botaoCancelarEdicao) {
    botaoCancelarEdicao.classList.remove("hidden");
  }

  mensagemStatus.textContent =
    "Editando registro. Altere os campos e clique em Salvar alteração.";

  formularioRegistro.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

// Atualiza um registro existente com os dados atuais do formulário.
function salvarEdicaoRegistro() {
  const titulo = document.getElementById("titulo").value.trim();
  const materia = document.getElementById("materia").value;
  const diaSemana = document.getElementById("diaSemana").value;
  const importancia = document.getElementById("importancia").value;
  const descricao = document.getElementById("descricao").value.trim();

  registros = registros.map(function (registro) {
    if (registro.id === idRegistroEmEdicao) {
      return {
        ...registro,
        titulo: titulo,
        materia: materia,
        diaSemana: diaSemana,
        importancia: importancia,
        descricao: descricao,
        atualizadoEm: new Date().toISOString(),
      };
    }

    return registro;
  });

  salvarRegistrosNoLocalStorage();
  renderizarRegistros();
  cancelarModoEdicao();

  mensagemStatus.textContent = "Registro editado e salvo com sucesso.";

  console.log("Registro editado. Array atual:", registros);
}

// Cancela o modo de edição e volta o formulário para cadastro normal.
function cancelarModoEdicao() {
  idRegistroEmEdicao = null;

  if (formularioRegistro) {
    formularioRegistro.reset();
  }

  if (botaoSubmit) {
    botaoSubmit.textContent = "➕ Adicionar registro";
  }

  if (cardFormulario) {
    cardFormulario.classList.remove("editing-mode");
  }

  if (botaoCancelarEdicao) {
    botaoCancelarEdicao.classList.add("hidden");
  }
}

// Alterna o status de um registro.
function alternarStatusRegistro(idRegistro) {
  registros = registros.map(function (registro) {
    if (registro.id === idRegistro) {
      return {
        ...registro,
        concluido: !registro.concluido,
      };
    }

    return registro;
  });

  salvarRegistrosNoLocalStorage();
  renderizarRegistros();

  mensagemStatus.textContent = "Status do registro atualizado e salvo.";

  console.log("Registro atualizado. Array atual:", registros);
}

// Exclui um registro.
// Antes de apagar, pedimos confirmação para evitar exclusão por clique errado.
function excluirRegistro(idRegistro) {
  const confirmouExclusao = confirm(
    "Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita."
  );

  if (!confirmouExclusao) {
    mensagemStatus.textContent = "Exclusão cancelada. Nenhum registro foi apagado.";
    return;
  }

  registros = registros.filter(function (registro) {
    return registro.id !== idRegistro;
  });

  salvarRegistrosNoLocalStorage();
  renderizarRegistros();

  if (idRegistroEmEdicao === idRegistro) {
    cancelarModoEdicao();
  }

  mensagemStatus.textContent = "Registro excluído e alteração salva.";

  console.log("Registro excluído. Array atual:", registros);
}

// Evento de cadastro/edição do formulário.
if (formularioRegistro) {
  formularioRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (idRegistroEmEdicao !== null) {
      salvarEdicaoRegistro();
      return;
    }

    const novoRegistro = criarRegistroPeloFormulario();

    registros.push(novoRegistro);

    salvarRegistrosNoLocalStorage();
    renderizarRegistros();

    formularioRegistro.reset();

    mensagemStatus.textContent = "Registro cadastrado e salvo no navegador.";

    console.log("Array registros atualizado:", registros);
  });

  formularioRegistro.addEventListener("reset", function () {
    if (idRegistroEmEdicao === null) {
      mensagemStatus.textContent = "Campos limpos. Pronto para um novo registro.";
    }
  });
}

// Botão para cancelar edição.
if (botaoCancelarEdicao) {
  botaoCancelarEdicao.addEventListener("click", function () {
    cancelarModoEdicao();
    mensagemStatus.textContent = "Edição cancelada. Pronto para novo registro.";
  });
}

// Captura cliques nos botões criados dinamicamente.
document.addEventListener("click", function (evento) {
  const botaoClicado = evento.target.closest("button");

  // Aqui estava o erro principal no seu arquivo.
  // O return precisa ficar dentro do if.
  // Assim, o código só para quando o clique NÃO foi em um botão.
  if (!botaoClicado) {
    return;
  }

  const acao = botaoClicado.dataset.acao;

  // Se o botão não tiver data-acao, ele não pertence às ações controladas por este listener.
  // Isso evita conflito com botões de filtro e botões do formulário.
  if (!acao) {
    return;
  }

  // Ação especial dos botões do mini calendário mobile.
  // Ela não usa id de registro, usa apenas o dia escolhido.
  if (acao === "ir-dia") {
    rolarAteDiaDaSemana(botaoClicado.dataset.diaAlvo);
    return;
  }

  const idRegistro = Number(botaoClicado.dataset.id);

  if (acao === "editar") {
    preencherFormularioParaEdicao(idRegistro);
  }

  if (acao === "alternar-status") {
    alternarStatusRegistro(idRegistro);
  }

  if (acao === "excluir") {
    excluirRegistro(idRegistro);
  }
});

// Captura cliques nos botões de filtro.
botoesFiltro.forEach(function (botao) {
  botao.addEventListener("click", function () {
    filtroAtual = botao.dataset.filtro;

    renderizarRegistros();

    mensagemStatus.textContent = `Filtro aplicado: ${botao.textContent.trim()}.`;

    console.log("Filtro atual:", filtroAtual);
  });
});

// Marca o dia atual assim que a página carrega.
marcarDiaAtualNaSemana();

// Renderiza o estado inicial da tela.
renderizarRegistros();

console.log("Study Tasks carregado com CRUD completo.");
console.log("Registros carregados:", registros);

/* ===== Starfield + Meteors animation (canvas) ===== */
(function () {
  // Busca o canvas do fundo espacial.
  const canvas = document.getElementById("space-canvas");

  // Se o canvas não existir no HTML, a animação não roda.
  if (!canvas) {
    return;
  }

  // Cria o contexto 2D para desenhar no canvas.
  const ctx = canvas.getContext("2d");

  // Largura e altura internas usadas pela animação.
  let w = 0;
  let h = 0;

  // Considera a densidade de pixels da tela para melhorar nitidez.
  const DPR = Math.max(1, window.devicePixelRatio || 1);

  // Ajusta o tamanho do canvas quando a tela muda.
  function resize() {
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);

    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // Escuta o redimensionamento da janela.
  window.addEventListener("resize", resize, { passive: true });

  // Chama a função uma vez ao carregar.
  resize();

  // Quantidade de camadas de estrelas.
  const STAR_LAYERS = 3;

  // Lista de estrelas.
  const stars = [];

  // Cria as estrelas do fundo.
  function generateStars() {
    stars.length = 0;

    for (let layer = 0; layer < STAR_LAYERS; layer++) {
      const factor = 0.5 + layer * 0.9;
      const count = Math.floor((w * h) / (9000 / factor));

      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * (0.9 + layer * 0.8) + 0.2,
          baseA: Math.random() * 0.9 + 0.06,
          twinkle: 0.4 + Math.random() * 1.6,
          layer: layer,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  // Gera as estrelas iniciais.
  generateStars();

  // Lista de meteoros.
  const meteors = [];

  // Limite máximo de meteoros na tela.
  const MAX_METEORS = 8;

  // Cria um meteoro novo.
  function spawnMeteor() {
    if (meteors.length >= MAX_METEORS) {
      return;
    }

    const side = Math.random();
    let x;
    let y;
    let angleBase;

    if (side < 0.7) {
      x = Math.random() * w * 0.95 + w * 0.025;
      y = -20 - Math.random() * 60;
      angleBase = Math.PI / 8 + Math.random() * (Math.PI / 5);
    } else {
      if (Math.random() < 0.5) {
        x = -40;
        y = Math.random() * h * 0.6;
        angleBase = Math.PI / 12 + Math.random() * (Math.PI / 6);
      } else {
        x = w + 40;
        y = Math.random() * h * 0.6;
        angleBase = Math.PI - (Math.PI / 12 + Math.random() * (Math.PI / 6));
      }
    }

    const speed = 420 + Math.random() * 1200;
    const spread = (Math.random() - 0.5) * 0.45;
    const angle = angleBase + spread;
    const life = 0.6 + Math.random() * 1.4;
    const length = 60 + Math.random() * 180;
    const huePick = Math.random();

    const color =
      huePick < 0.45 ? "#9fe8ff" : huePick < 0.8 ? "#cfa3ff" : "#ffd0e0";

    meteors.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: life,
      age: 0,
      length: length,
      alpha: 1,
      color: color,
      sparks: [],
    });
  }

  // Atualiza posição dos meteoros e partículas.
  function update(dt) {
    if (Math.random() < 0.02 + dt * 0.6) {
      spawnMeteor();
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];

      m.age += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.alpha = Math.max(0, 1 - m.age / m.life);

      if (Math.random() < 0.22 && m.sparks.length < 18) {
        m.sparks.push({
          x: m.x - m.vx * 0.02 + (Math.random() - 0.5) * 8,
          y: m.y - m.vy * 0.02 + (Math.random() - 0.5) * 8,
          vx: -m.vx * (0.02 + Math.random() * 0.12) + (Math.random() - 0.5) * 80,
          vy: -m.vy * (0.02 + Math.random() * 0.12) + (Math.random() - 0.5) * 80,
          age: 0,
          life: 0.18 + Math.random() * 0.36,
          size: 0.6 + Math.random() * 2.6,
        });
      }

      for (let j = m.sparks.length - 1; j >= 0; j--) {
        const s = m.sparks[j];

        s.age += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        if (s.age >= s.life) {
          m.sparks.splice(j, 1);
        }
      }

      if (m.age >= m.life || m.x < -300 || m.x > w + 300 || m.y > h + 300) {
        meteors.splice(i, 1);
      }
    }
  }

  // Converte uma cor hexadecimal para rgba.
  function hexToRgba(hex, a) {
    const c = hex.replace("#", "");
    const num = parseInt(
      c.length === 3
        ? c
            .split("")
            .map(function (ch) {
              return ch + ch;
            })
            .join("")
        : c,
      16
    );

    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    return `rgba(${r},${g},${b},${a})`;
  }

  // Desenha estrelas, nebulosas, meteoros e partículas.
  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    const g1 = ctx.createRadialGradient(
      w * 0.15,
      h * 0.2,
      40,
      w * 0.2,
      h * 0.25,
      Math.max(w, h)
    );

    g1.addColorStop(0, "rgba(92,200,255,0.06)");
    g1.addColorStop(1, "rgba(92,200,255,0.0)");

    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(
      w * 0.85,
      h * 0.75,
      30,
      w * 0.8,
      h * 0.7,
      Math.max(w, h)
    );

    g2.addColorStop(0, "rgba(168,85,247,0.05)");
    g2.addColorStop(1, "rgba(168,85,247,0.0)");

    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = Math.sin((t / 1000) * s.twinkle + s.phase) * 0.45 + 0.55;

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, s.baseA * tw)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < meteors.length; i++) {
      const m = meteors[i];

      const hx = m.x;
      const hy = m.y;
      const tx = m.x - (m.vx / 100) * m.length;
      const ty = m.y - (m.vy / 100) * m.length;

      const grad = ctx.createLinearGradient(tx, ty, hx, hy);

      grad.addColorStop(0, "rgba(255,255,255,0.0)");
      grad.addColorStop(0.4, `rgba(200,230,255,${0.06 * m.alpha})`);
      grad.addColorStop(0.75, hexToRgba(m.color, 0.18 * m.alpha));
      grad.addColorStop(1, hexToRgba(m.color, 0.95 * m.alpha));

      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1.2, (m.length / 40) * (1 + m.alpha * 0.6));
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 36);

      glow.addColorStop(0, hexToRgba(m.color, 0.95 * m.alpha));
      glow.addColorStop(0.3, hexToRgba(m.color, 0.28 * m.alpha));
      glow.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(hx, hy, 22 * Math.min(1, m.alpha + 0.2), 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = hexToRgba("#ffffff", 0.95 * m.alpha);
      ctx.arc(hx, hy, Math.max(1.6, ctx.lineWidth * 0.9), 0, Math.PI * 2);
      ctx.fill();

      for (let j = 0; j < m.sparks.length; j++) {
        const s = m.sparks[j];
        const sa = Math.max(0, 1 - s.age / s.life);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,230,230,${0.9 * sa})`;
        ctx.arc(s.x, s.y, s.size * (0.6 + sa), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = "source-over";
  }

  // Controle de tempo entre frames.
  let last = performance.now();

  // Função executada a cada frame da animação.
  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000);

    last = t;

    update(dt);
    draw(t);

    requestAnimationFrame(frame);
  }

  // Recria estrelas se a tela mudar muito.
  let lastW = w;
  let lastH = h;

  setInterval(function () {
    if (Math.abs(lastW - w) > 120 || Math.abs(lastH - h) > 120) {
      generateStars();
      lastW = w;
      lastH = h;
    }
  }, 1300);

  // Cria meteoros iniciais.
  for (let i = 0; i < 2; i++) {
    spawnMeteor();
  }

  // Inicia a animação.
  requestAnimationFrame(frame);
})();
