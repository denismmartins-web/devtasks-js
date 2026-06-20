"use strict";

// Chave fixa usada para salvar e buscar os registros principais no localStorage.
// Pense nela como o nome da gaveta onde guardamos os registros da semana.
const STORAGE_KEY = "study-tasks-registros";

// Chave fixa usada para salvar e buscar os lembretes no localStorage.
// Criamos outra gaveta para não misturar registros da semana com lembretes rápidos.
const LEMBRETES_STORAGE_KEY = "study-tasks-lembretes";

// Chave usada para salvar as anotações rápidas por dia.
// Agora ela guarda um objeto, por exemplo: { segunda: "...", terca: "..." }.
const ANOTACAO_STORAGE_KEY = "study-tasks-anotacoes-por-dia";

// Chave antiga, usada antes quando existia apenas uma anotação geral.
// Mantemos para migrar o texto antigo para o dia atual, sem perder conteúdo.
const ANOTACAO_STORAGE_KEY_ANTIGA = "study-tasks-anotacao-rapida";

// Chave usada para salvar o desenho do mini-paint como imagem em texto.
const PAINT_STORAGE_KEY = "study-tasks-mini-paint";

// Busca no HTML o painel onde ficam os cards de Mês, Dia e Ano.
const painelDataCalendario = document.getElementById("painelDataCalendario") || document.querySelector(".date-panel");

// Busca no HTML o elemento onde será exibido o mês atual.
const mesAtual = document.getElementById("mesAtual");

// Busca no HTML o elemento onde será exibido o ano atual.
const anoAtual = document.getElementById("anoAtual");

// Busca no HTML o elemento onde será exibido o dia atual do mês.
let diaAtualCalendario = document.getElementById("diaAtualCalendario");

// Busca o formulário de cadastro pelo id.
const formularioRegistro = document.getElementById("registroForm");

// Busca o card visual onde o formulário está dentro.
// Usaremos esse card para destacar quando o usuário estiver editando.
const cardFormulario = document.querySelector(".form-card");

// Busca a mensagem que aparece abaixo do formulário.
const mensagemStatus = document.getElementById("mensagemStatus");

// Busca os elementos do CRUD de lembretes.
const formularioLembrete = document.getElementById("lembreteForm");
const inputTextoLembrete = document.getElementById("textoLembrete");
const listaLembretes = document.getElementById("listaLembretes");
const listaLembretesAgendados = document.getElementById("listaLembretesAgendados");
const contadorLembretesAgendados = document.getElementById("contadorLembretesAgendados");
const mensagemLembrete = document.getElementById("mensagemLembrete");

// Busca a plaquinha flutuante que sinaliza quando existe lembrete ativo.
const atalhoLembreteAtivo = document.getElementById("atalhoLembreteAtivo");

// Busca o card de lembretes para poder rolar até ele ao clicar na plaquinha.
const cardLembretes = document.getElementById("lembretes");

// Busca os elementos das anotações rápidas.
const campoAnotacaoRapida = document.getElementById("anotacaoRapida");
const mensagemAnotacao = document.getElementById("mensagemAnotacao");
const diaAnotacaoTitulo = document.getElementById("diaAnotacaoTitulo");

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
const carrosselSemana = document.querySelector("[data-carrossel-semana]") || document.querySelector(".week-grid");

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

// Guarda o dia selecionado no bloco de anotações rápidas.
// Ele começa em segunda só como valor temporário; depois será trocado para o dia atual.
let diaAnotacaoSelecionado = "segunda";

// Guarda as anotações por dia da semana.
let anotacoesPorDia = {};

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

// Garante que o card "Dia" exista visualmente no HTML.
// Esta proteção ajuda se, por engano, o card do dia não tiver sido copiado no index.html.
function garantirCardDiaAtualNoHTML() {
  // Se o elemento do dia já existe, não precisamos criar nada.
  if (diaAtualCalendario || !painelDataCalendario) {
    return;
  }

  // Cria o card visual do dia usando JavaScript.
  // Analogia: se a gaveta "Dia" não existe no armário, o JS monta essa gaveta antes de guardar o valor.
  const cardDia = document.createElement("article");
  cardDia.classList.add("date-day-card");
  cardDia.dataset.dateCard = "dia";

  cardDia.innerHTML = `
    <span>Dia</span>
    <strong id="diaAtualCalendario">Hoje</strong>
  `;

  // Tenta colocar o card Dia antes do card Ano para ficar: Mês | Dia | Ano.
  const cardAno = anoAtual ? anoAtual.closest("article") : null;

  if (cardAno) {
    painelDataCalendario.insertBefore(cardDia, cardAno);
  } else {
    painelDataCalendario.appendChild(cardDia);
  }

  // Atualiza a variável para apontar para o elemento recém-criado.
  diaAtualCalendario = document.getElementById("diaAtualCalendario");
}

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

// A anotação também começa no dia atual.
diaAnotacaoSelecionado = diaAtualDaSemana;

// Nomes usados para exibir mensagens mais amigáveis.
const nomesDosDias = {
  domingo: "Domingo",
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
};

// Garante que o card visual do dia exista antes de preencher o valor.
garantirCardDiaAtualNoHTML();

// Exibe o mês atual na tela, caso o elemento exista.
if (mesAtual) {
  mesAtual.textContent = nomesDosMeses[dataAtual.getMonth()];
}

// Exibe o dia atual do mês na tela, caso o elemento exista.
if (diaAtualCalendario) {
  diaAtualCalendario.textContent = String(dataAtual.getDate()).padStart(2, "0");
  diaAtualCalendario.title = "Dia atual do mês";
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
      centralizarElementoNoCarrossel(carrosselDiasMobile, botao, "smooth");
    } else {
      botao.classList.remove("mobile-day-selected");
    }
  });
}

// Centraliza um elemento dentro de um carrossel horizontal.
// Analogia: o carrossel é uma régua comprida, e esta função empurra a régua
// até o item escolhido ficar no meio da tela.
function centralizarElementoNoCarrossel(carrossel, elemento, comportamento) {
  if (!carrossel || !elemento) {
    return;
  }

  const posicaoCentral =
    elemento.offsetLeft - (carrossel.clientWidth - elemento.clientWidth) / 2;

  carrossel.scrollTo({
    left: Math.max(0, posicaoCentral),
    behavior: comportamento || "smooth",
  });
}

// Centraliza o dia atual no carrossel principal da semana.
// Essa é a correção importante: o foco visual deve ser o box real dos dias,
// por exemplo: | Quinta | SEXTA | Sábado | com o dia atual no centro.
function centralizarDiaAtualNosCarrosseis(comportamento) {
  const blocoSemanaHoje = document.querySelector(
    `[data-dia-coluna="${diaAtualDaSemana}"]`
  );

  centralizarElementoNoCarrossel(carrosselSemana, blocoSemanaHoje, comportamento || "auto");
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

  // Primeiro centralizamos o card dentro do carrossel horizontal.
  // Isso é mais preciso no mobile do que depender apenas do scrollIntoView.
  centralizarElementoNoCarrossel(carrosselSemana, blocoDoDia, "smooth");

  // Depois levamos a tela até a área da semana.
  // Assim o usuário não fica perdido caso esteja mais abaixo na página.
  blocoDoDia.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
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

// Busca os lembretes salvos no localStorage.
// Se não existir nada salvo, retorna array vazio.
function carregarLembretesDoLocalStorage() {
  const lembretesSalvos = localStorage.getItem(LEMBRETES_STORAGE_KEY);

  if (!lembretesSalvos) {
    return [];
  }

  try {
    return JSON.parse(lembretesSalvos);
  } catch (erro) {
    console.error("Erro ao carregar lembretes do localStorage:", erro);
    localStorage.removeItem(LEMBRETES_STORAGE_KEY);
    return [];
  }
}

// Salva o array lembretes no localStorage.
// É o mesmo conceito usado nos registros: array vira texto JSON.
function salvarLembretesNoLocalStorage() {
  const lembretesEmTexto = JSON.stringify(lembretes);
  localStorage.setItem(LEMBRETES_STORAGE_KEY, lembretesEmTexto);
}

// Array separado para os lembretes rápidos.
// Assim praticamos outro CRUD sem misturar com os registros da semana.
let lembretes = carregarLembretesDoLocalStorage();

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


// Calcula amanhã às 05:00.
// Essa função é usada pelo botão de relógio do lembrete.
function calcularProximoDiaAsCinco() {
  const proximaAtivacao = new Date();

  proximaAtivacao.setDate(proximaAtivacao.getDate() + 1);
  proximaAtivacao.setHours(5, 0, 0, 0);

  return proximaAtivacao.toISOString();
}

// Formata a data de retorno do lembrete agendado.
// Mantemos curto para não poluir o card.
function formatarHorarioAgendado(dataISO) {
  const data = new Date(dataISO);

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Verifica se um lembrete está ativo agora.
// Sem pausadoAte = ativo.
// Com pausadoAte no futuro = agendado/pausado.
// Com pausadoAte já vencido = volta a ser ativo.
function lembreteEstaAtivo(lembrete) {
  if (!lembrete.pausadoAte) {
    return true;
  }

  return new Date(lembrete.pausadoAte).getTime() <= Date.now();
}

// Limpa pausas vencidas.
// Se já passou de 05:00, o lembrete volta a ficar ativo automaticamente quando o app abre/atualiza.
function atualizarLembretesAgendados() {
  let houveAtualizacao = false;

  lembretes = lembretes.map(function (lembrete) {
    if (lembrete.pausadoAte && lembreteEstaAtivo(lembrete)) {
      houveAtualizacao = true;

      return {
        ...lembrete,
        pausadoAte: null,
      };
    }

    return lembrete;
  });

  if (houveAtualizacao) {
    salvarLembretesNoLocalStorage();
  }
}

// Retorna apenas os lembretes que devem aparecer no checklist de agora.
function obterLembretesAtivos() {
  atualizarLembretesAgendados();

  return lembretes.filter(function (lembrete) {
    return lembreteEstaAtivo(lembrete);
  });
}

// Retorna os lembretes pausados para o próximo dia às 05:00.
function obterLembretesAgendados() {
  atualizarLembretesAgendados();

  return lembretes.filter(function (lembrete) {
    return lembrete.pausadoAte && !lembreteEstaAtivo(lembrete);
  });
}

// Atualiza a plaquinha flutuante dos lembretes.
// Regra: só aparece se existir lembrete ativo.
// Lembrete agendado/pausado não ativa a plaquinha.
function atualizarPlaquinhaLembrete() {
  if (!atalhoLembreteAtivo) {
    return;
  }

  const existemLembretesAtivos = obterLembretesAtivos().length > 0;

  atalhoLembreteAtivo.classList.toggle("hidden", !existemLembretesAtivos);
  atalhoLembreteAtivo.setAttribute("aria-hidden", String(!existemLembretesAtivos));
}

// Rola a tela até o checklist de lembretes.
// Essa função é usada quando a pessoa clica na plaquinha flutuante.
function rolarAteLembretes() {
  if (!cardLembretes) {
    return;
  }

  cardLembretes.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  cardLembretes.classList.add("remember-card-focus");

  setTimeout(function () {
    cardLembretes.classList.remove("remember-card-focus");
  }, 1200);
}

// Cria o HTML exibido quando não existe nenhum lembrete ativo.
function criarMensagemVaziaDeLembretes() {
  return `
    <li class="remember-empty">
      Nenhum lembrete ativo.
    </li>
  `;
}

// Cria o HTML exibido quando não existe lembrete agendado.
function criarMensagemVaziaDeAgendados() {
  return `
    <li class="remember-scheduled-empty">
      Nenhum lembrete agendado.
    </li>
  `;
}

// Cria o HTML de um lembrete ativo.
// O check conclui e remove.
// O relógio agenda para o próximo dia às 05:00.
function criarItemLembrete(lembrete) {
  const textoSeguro = escaparHTML(lembrete.texto);

  return `
    <li class="remember-item">
      <span class="remember-item-text">${textoSeguro}</span>

      <div class="remember-item-actions">
        <button
          class="remember-check-button"
          type="button"
          data-acao="check-lembrete"
          data-id="${lembrete.id}"
          aria-label="Marcar lembrete como feito"
          title="Marcar como feito"
        >
          ✓
        </button>

        <button
          class="remember-clock-button"
          type="button"
          data-acao="adiar-lembrete"
          data-id="${lembrete.id}"
          aria-label="Agendar lembrete para amanhã às 05:00"
          title="Agendar para amanhã às 05:00"
        >
          ⏰
        </button>
      </div>
    </li>
  `;
}

// Cria o HTML de um lembrete agendado.
// Ele aparece embaixo do checklist, sem ativar a plaquinha.
function criarItemLembreteAgendado(lembrete) {
  const textoSeguro = escaparHTML(lembrete.texto);
  const horarioSeguro = escaparHTML(formatarHorarioAgendado(lembrete.pausadoAte));

  return `
    <li class="remember-scheduled-item">
      <div>
        <span>${textoSeguro}</span>
        <small>Volta em ${horarioSeguro}</small>
      </div>

      <button
        class="remember-scheduled-delete"
        type="button"
        data-acao="excluir-lembrete-agendado"
        data-id="${lembrete.id}"
        aria-label="Remover lembrete agendado"
        title="Remover lembrete agendado"
      >
        🗑️
      </button>
    </li>
  `;
}

// Renderiza a lista de lembretes agendados.
function renderizarLembretesAgendados() {
  if (!listaLembretesAgendados) {
    return;
  }

  const lembretesAgendados = obterLembretesAgendados();

  if (contadorLembretesAgendados) {
    contadorLembretesAgendados.textContent = lembretesAgendados.length;
  }

  if (lembretesAgendados.length === 0) {
    listaLembretesAgendados.innerHTML = criarMensagemVaziaDeAgendados();
    return;
  }

  listaLembretesAgendados.innerHTML = lembretesAgendados
    .map(function (lembrete) {
      return criarItemLembreteAgendado(lembrete);
    })
    .join("");
}

// Renderiza todos os lembretes na tela.
function renderizarLembretes() {
  if (!listaLembretes) {
    atualizarPlaquinhaLembrete();
    renderizarLembretesAgendados();
    return;
  }

  const lembretesAtivos = obterLembretesAtivos();

  if (lembretesAtivos.length === 0) {
    listaLembretes.innerHTML = criarMensagemVaziaDeLembretes();

    if (mensagemLembrete) {
      mensagemLembrete.textContent = "Nenhum lembrete ativo.";
    }
  } else {
    listaLembretes.innerHTML = lembretesAtivos
      .map(function (lembrete) {
        return criarItemLembrete(lembrete);
      })
      .join("");

    if (mensagemLembrete) {
      mensagemLembrete.textContent = `${lembretesAtivos.length} lembrete(s) ativo(s).`;
    }
  }

  renderizarLembretesAgendados();
  atualizarPlaquinhaLembrete();
}

// Cria um objeto de lembrete usando o texto digitado no formulário.
function criarLembretePeloFormulario() {
  return {
    id: Date.now(),
    texto: inputTextoLembrete.value.trim(),
    criadoEm: new Date().toISOString(),
    pausadoAte: null,
  };
}

// Adiciona um novo lembrete no array, salva e renderiza novamente.
function adicionarLembrete() {
  const novoLembrete = criarLembretePeloFormulario();

  lembretes.push(novoLembrete);

  salvarLembretesNoLocalStorage();
  renderizarLembretes();

  if (formularioLembrete) {
    formularioLembrete.reset();
  }

  if (mensagemLembrete) {
    mensagemLembrete.textContent = "Lembrete adicionado.";
  }

  console.log("Lembretes atualizados:", lembretes);
}

// Marca o lembrete como feito.
// O check remove da lista e também desativa a plaquinha caso não exista outro ativo.
function marcarCheckLembrete(idLembrete) {
  lembretes = lembretes.filter(function (lembrete) {
    return lembrete.id !== idLembrete;
  });

  salvarLembretesNoLocalStorage();
  renderizarLembretes();

  if (mensagemLembrete) {
    mensagemLembrete.textContent = "Check feito. Lembrete removido.";
  }

  console.log("Lembrete marcado como feito. Array atual:", lembretes);
}

// Agenda o lembrete para amanhã às 05:00.
// Ele sai do checklist ativo e aparece em "Agendados".
function adiarLembreteParaAmanha(idLembrete) {
  lembretes = lembretes.map(function (lembrete) {
    if (lembrete.id === idLembrete) {
      return {
        ...lembrete,
        pausadoAte: calcularProximoDiaAsCinco(),
      };
    }

    return lembrete;
  });

  salvarLembretesNoLocalStorage();
  renderizarLembretes();

  if (mensagemLembrete) {
    mensagemLembrete.textContent = "Lembrete agendado para amanhã às 05:00.";
  }

  console.log("Lembrete agendado para amanhã às 05:00. Array atual:", lembretes);
}

// Remove um lembrete que estava agendado para o próximo dia.
// Usei uma função separada para deixar claro que a lixeira remove o agendamento inteiro.
function excluirLembreteAgendado(idLembrete) {
  lembretes = lembretes.filter(function (lembrete) {
    return lembrete.id !== idLembrete;
  });

  salvarLembretesNoLocalStorage();
  renderizarLembretes();

  if (mensagemLembrete) {
    mensagemLembrete.textContent = "Lembrete agendado removido.";
  }

  console.log("Lembrete agendado removido. Array atual:", lembretes);
}



// Inicializa o mini-paint com canvas.
// Ele usa Pointer Events, então funciona com mouse, caneta touch e toque no celular.
function inicializarMiniPaint() {
  const canvasPaint = document.getElementById("paintCanvas");
  const botaoLimparPaint = document.getElementById("botaoLimparPaint");
  const botaoSalvarPrintPaint = document.getElementById("botaoSalvarPrintPaint");
  const mensagemPaint = document.getElementById("mensagemPaint");
  const galeriaPrintsPaint = document.getElementById("galeriaPrintsPaint");
  const contadorPrintsPaint = document.getElementById("contadorPrintsPaint");
  const paintModal = document.getElementById("paintModal");
  const imagemPaintModal = document.getElementById("imagemPaintModal");
  const botaoFecharPaintModal = document.getElementById("botaoFecharPaintModal");

  if (!canvasPaint) {
    return;
  }

  const contextoPaint = canvasPaint.getContext("2d");
  let desenhando = false;
  let resizeTimer = null;

  // Busca a lista de prints salvos.
  function carregarPrintsDoPaint() {
    const printsSalvos = localStorage.getItem(PAINT_PRINTS_STORAGE_KEY);

    if (!printsSalvos) {
      return [];
    }

    try {
      return JSON.parse(printsSalvos);
    } catch (erro) {
      console.error("Erro ao carregar prints do mini-paint:", erro);
      localStorage.removeItem(PAINT_PRINTS_STORAGE_KEY);
      return [];
    }
  }

  // Salva a lista de prints no localStorage.
  function salvarPrintsDoPaint(prints) {
    localStorage.setItem(PAINT_PRINTS_STORAGE_KEY, JSON.stringify(prints));
  }

  // Renderiza até 3 miniaturas salvas embaixo do quadro.
  // Clicar em uma miniatura abre a imagem em tamanho maior no modal.
  function renderizarPrintsDoPaint() {
    if (!galeriaPrintsPaint) {
      return;
    }

    const prints = carregarPrintsDoPaint();

    if (contadorPrintsPaint) {
      contadorPrintsPaint.textContent = prints.length;
    }

    if (prints.length === 0) {
      galeriaPrintsPaint.innerHTML =
        '<div class="paint-gallery-empty">Nenhum print salvo ainda.</div>';
      return;
    }

    galeriaPrintsPaint.innerHTML = prints
      .slice(0, 3)
      .map(function (print, indice) {
        return `
          <button
            class="paint-print-card"
            type="button"
            data-print-id="${print.id}"
            aria-label="Abrir print salvo ${indice + 1}"
          >
            <img src="${print.imagem}" alt="Print salvo do mini-paint ${indice + 1}" />
            <small>${print.criadoEm}</small>
          </button>
        `;
      })
      .join("");
  }

  // Abre o print salvo em tamanho maior.
  function abrirPrintDoPaint(idPrint) {
    if (!paintModal || !imagemPaintModal) {
      return;
    }

    const prints = carregarPrintsDoPaint();

    const printEncontrado = prints.find(function (print) {
      return String(print.id) === String(idPrint);
    });

    if (!printEncontrado) {
      return;
    }

    imagemPaintModal.src = printEncontrado.imagem;
    paintModal.classList.remove("hidden");
    paintModal.setAttribute("aria-hidden", "false");
  }

  // Fecha o modal do print.
  function fecharPrintDoPaint() {
    if (!paintModal || !imagemPaintModal) {
      return;
    }

    imagemPaintModal.src = "";
    paintModal.classList.add("hidden");
    paintModal.setAttribute("aria-hidden", "true");
  }

  // Pinta o fundo branco e configura a caneta preta.
  function prepararQuadroBranco(largura, altura) {
    contextoPaint.fillStyle = "#ffffff";
    contextoPaint.fillRect(0, 0, largura, altura);

    contextoPaint.strokeStyle = "#111111";
    contextoPaint.lineWidth = 3;
    contextoPaint.lineCap = "round";
    contextoPaint.lineJoin = "round";
  }

  // Ajusta o canvas para ficar nítido em telas com DPR alto, como celular.
  function ajustarTamanhoDoPaint() {
    const retangulo = canvasPaint.getBoundingClientRect();
    const largura = Math.max(1, retangulo.width);
    const altura = Math.max(1, retangulo.height);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const desenhoSalvo = localStorage.getItem(PAINT_STORAGE_KEY);

    canvasPaint.width = Math.floor(largura * dpr);
    canvasPaint.height = Math.floor(altura * dpr);

    contextoPaint.setTransform(dpr, 0, 0, dpr, 0, 0);
    prepararQuadroBranco(largura, altura);

    if (!desenhoSalvo) {
      return;
    }

    const imagem = new Image();

    imagem.onload = function () {
      contextoPaint.drawImage(imagem, 0, 0, largura, altura);
    };

    imagem.src = desenhoSalvo;
  }

  // Calcula a posição do mouse/toque dentro do canvas.
  function obterPosicaoNoPaint(evento) {
    const retangulo = canvasPaint.getBoundingClientRect();

    return {
      x: evento.clientX - retangulo.left,
      y: evento.clientY - retangulo.top,
    };
  }

  // Salva o rascunho atual para não perder se atualizar a página.
  function salvarDesenhoDoPaint() {
    try {
      localStorage.setItem(PAINT_STORAGE_KEY, canvasPaint.toDataURL("image/png"));

      if (mensagemPaint) {
        mensagemPaint.textContent = "Rascunho salvo automaticamente.";
      }
    } catch (erro) {
      console.error("Erro ao salvar rascunho do mini-paint:", erro);

      if (mensagemPaint) {
        mensagemPaint.textContent = "Não foi possível salvar o rascunho.";
      }
    }
  }

  // Salva um print do desenho atual na galeria.
  function salvarPrintDoPaint() {
    try {
      const prints = carregarPrintsDoPaint();
      const agora = new Date();

      prints.unshift({
        id: Date.now(),
        imagem: canvasPaint.toDataURL("image/png"),
        criadoEm: agora.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Mantemos no máximo 3 prints para evitar excesso de uso do localStorage.
      salvarPrintsDoPaint(prints.slice(0, 3));
      renderizarPrintsDoPaint();

      if (mensagemPaint) {
        mensagemPaint.textContent = "Print salvo na galeria.";
      }
    } catch (erro) {
      console.error("Erro ao salvar print do mini-paint:", erro);

      if (mensagemPaint) {
        mensagemPaint.textContent = "Não foi possível salvar o print.";
      }
    }
  }

  // Começa o traço.
  function iniciarDesenho(evento) {
    evento.preventDefault();
    desenhando = true;

    const posicao = obterPosicaoNoPaint(evento);

    canvasPaint.setPointerCapture(evento.pointerId);
    contextoPaint.beginPath();
    contextoPaint.moveTo(posicao.x, posicao.y);
  }

  // Continua o traço enquanto o usuário move o mouse ou o dedo.
  function desenhar(evento) {
    if (!desenhando) {
      return;
    }

    evento.preventDefault();

    const posicao = obterPosicaoNoPaint(evento);

    contextoPaint.lineTo(posicao.x, posicao.y);
    contextoPaint.stroke();
  }

  // Finaliza o traço e salva o rascunho.
  function pararDesenho(evento) {
    if (!desenhando) {
      return;
    }

    desenhando = false;

    try {
      canvasPaint.releasePointerCapture(evento.pointerId);
    } catch (erro) {
      // Se o ponteiro já tiver sido solto pelo navegador, seguimos normalmente.
    }

    salvarDesenhoDoPaint();
  }

  // Limpa apenas o quadro atual.
  // Os prints já salvos continuam na galeria.
  function limparPaint() {
    const retangulo = canvasPaint.getBoundingClientRect();

    prepararQuadroBranco(retangulo.width, retangulo.height);
    localStorage.removeItem(PAINT_STORAGE_KEY);

    if (mensagemPaint) {
      mensagemPaint.textContent = "Quadro limpo. Prints salvos continuam abaixo.";
    }
  }

  canvasPaint.addEventListener("pointerdown", iniciarDesenho);
  canvasPaint.addEventListener("pointermove", desenhar);
  canvasPaint.addEventListener("pointerup", pararDesenho);
  canvasPaint.addEventListener("pointercancel", pararDesenho);
  canvasPaint.addEventListener("pointerleave", pararDesenho);

  if (botaoLimparPaint) {
    botaoLimparPaint.addEventListener("click", limparPaint);
  }

  if (botaoSalvarPrintPaint) {
    botaoSalvarPrintPaint.addEventListener("click", salvarPrintDoPaint);
  }

  if (galeriaPrintsPaint) {
    galeriaPrintsPaint.addEventListener("click", function (evento) {
      const cardPrint = evento.target.closest("[data-print-id]");

      if (!cardPrint) {
        return;
      }

      abrirPrintDoPaint(cardPrint.dataset.printId);
    });
  }

  if (botaoFecharPaintModal) {
    botaoFecharPaintModal.addEventListener("click", fecharPrintDoPaint);
  }

  if (paintModal) {
    paintModal.addEventListener("click", function (evento) {
      if (evento.target === paintModal) {
        fecharPrintDoPaint();
      }
    });
  }

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
      ajustarTamanhoDoPaint();
    }, 250);
  });

  ajustarTamanhoDoPaint();
  renderizarPrintsDoPaint();
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

// Evento de cadastro dos lembretes rápidos.
if (formularioLembrete) {
  formularioLembrete.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!inputTextoLembrete.value.trim()) {
      if (mensagemLembrete) {
        mensagemLembrete.textContent = "Digite um lembrete antes de adicionar.";
      }

      return;
    }

    adicionarLembrete();
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

  if (acao === "ir-lembretes") {
    rolarAteLembretes();
    return;
  }


  const idRegistro = Number(botaoClicado.dataset.id);

  if (acao === "check-lembrete") {
    marcarCheckLembrete(idRegistro);
    return;
  }

  if (acao === "adiar-lembrete") {
    adiarLembreteParaAmanha(idRegistro);
    return;
  }

  if (acao === "excluir-lembrete-agendado") {
    excluirLembreteAgendado(idRegistro);
    return;
  }

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

    const nomeDoFiltro = botao.querySelector(".filter-stat-label")
      ? botao.querySelector(".filter-stat-label").textContent.trim()
      : botao.textContent.trim();

    mensagemStatus.textContent = `Filtro aplicado: ${nomeDoFiltro}.`;

    console.log("Filtro atual:", filtroAtual);
  });
});

// Marca o dia atual assim que a página carrega.
marcarDiaAtualNaSemana();

// Centraliza o dia atual nos carrosséis depois que a tela termina de montar.
// Usamos setTimeout curto porque o navegador precisa calcular larguras antes de rolar.
setTimeout(function () {
  centralizarDiaAtualNosCarrosseis("auto");
}, 120);

// Liga o mini-paint.
inicializarMiniPaint();

// Renderiza o estado inicial da tela.
renderizarRegistros();

// Renderiza os lembretes salvos no navegador.
renderizarLembretes();

console.log("Study Tasks carregado com CRUD completo.");
console.log("Registros carregados:", registros);
console.log("Lembretes carregados:", lembretes);

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
