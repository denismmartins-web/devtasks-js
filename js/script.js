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

// Busca a mensagem que aparece abaixo do formulário.
const mensagemStatus = document.getElementById("mensagemStatus");

// Busca todos os elementos que possuem o atributo data-lista-dia.
const listasDosDias = document.querySelectorAll("[data-lista-dia]");

// Busca os botões de filtro.
const botoesFiltro = document.querySelectorAll("[data-filtro]");

// Busca os elementos dos contadores.
const contadorTotal = document.getElementById("contadorTotal");
const contadorPendentes = document.getElementById("contadorPendentes");
const contadorConcluidos = document.getElementById("contadorConcluidos");
const contadorUrgentes = document.getElementById("contadorUrgentes");

// Guarda qual filtro está ativo no momento.
// Começa mostrando todos.
let filtroAtual = "todos";

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

// Exibe o mês atual na tela, caso o elemento exista.
if (mesAtual) {
  mesAtual.textContent = nomesDosMeses[dataAtual.getMonth()];
}

// Exibe o ano atual na tela, caso o elemento exista.
if (anoAtual) {
  anoAtual.textContent = dataAtual.getFullYear();
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
// Agora ele inicia com os dados salvos no navegador.
let registros = carregarRegistrosDoLocalStorage();

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
function criarMensagemVazia() {
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
      lista.innerHTML = criarMensagemVazia();
    }
  });
}

// Cria o HTML de um card de registro.
function criarCardRegistro(registro) {
  const classeImportancia = obterClasseImportancia(registro.importancia);
  const classeConcluido = registro.concluido ? "task-card-completed" : "";
  const textoBotaoStatus = registro.concluido ? "Reabrir" : "Concluir";

  return `
    <article class="task-card ${classeImportancia} ${classeConcluido}">
      <span class="task-subject">${registro.materia}</span>

      <h4>${registro.titulo}</h4>

      <p>${registro.descricao || "Sem descrição adicionada."}</p>

      <small>${registro.importancia}</small>

      <div class="task-actions">
        <button type="button" data-acao="alternar-status" data-id="${registro.id}">
          ${textoBotaoStatus}
        </button>

        <button type="button" data-acao="excluir" data-id="${registro.id}">
          Excluir
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

  contadorTotal.textContent = total;
  contadorPendentes.textContent = pendentes;
  contadorConcluidos.textContent = concluidos;
  contadorUrgentes.textContent = urgentes;
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
function excluirRegistro(idRegistro) {
  registros = registros.filter(function (registro) {
    return registro.id !== idRegistro;
  });

  salvarRegistrosNoLocalStorage();
  renderizarRegistros();

  mensagemStatus.textContent = "Registro excluído e alteração salva.";

  console.log("Registro excluído. Array atual:", registros);
}

// Evento de cadastro do formulário.
if (formularioRegistro) {
  formularioRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const novoRegistro = criarRegistroPeloFormulario();

    registros.push(novoRegistro);

    salvarRegistrosNoLocalStorage();
    renderizarRegistros();

    formularioRegistro.reset();

    mensagemStatus.textContent = "Registro cadastrado e salvo no navegador.";

    console.log("Array registros atualizado:", registros);
  });

  formularioRegistro.addEventListener("reset", function () {
    mensagemStatus.textContent = "Campos limpos. Pronto para um novo registro.";
  });
}

// Captura cliques nos botões criados dinamicamente.
document.addEventListener("click", function (evento) {
  const botaoClicado = evento.target.closest("button");

  if (!botaoClicado) {
    return;
  }

  const acao = botaoClicado.dataset.acao;
  const idRegistro = Number(botaoClicado.dataset.id);

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

// Renderiza o estado inicial da tela.
renderizarRegistros();

console.log("Study Tasks carregado com filtros e contadores.");
console.log("Registros carregados:", registros);
