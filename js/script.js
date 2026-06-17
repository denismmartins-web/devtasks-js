// Ativa um modo mais rigoroso do JavaScript.
// Isso ajuda a evitar alguns erros comuns durante o desenvolvimento.
"use strict";

// Cria uma chave fixa para salvar e buscar os dados no localStorage.
// Essa chave funciona como o "nome da gaveta" onde os registros serão guardados.
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
// Cada um desses elementos representa uma área onde os cards de um dia serão exibidos.
const listasDosDias = document.querySelectorAll("[data-lista-dia]");

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

// Função que busca os registros salvos no localStorage.
// Se não existir nada salvo, ela retorna um array vazio.
function carregarRegistrosDoLocalStorage() {
  // Busca no navegador os dados salvos usando a chave STORAGE_KEY.
  const registrosSalvos = localStorage.getItem(STORAGE_KEY);

  // Se não existir nada salvo, retornamos uma lista vazia.
  if (!registrosSalvos) {
    return [];
  }

  try {
    // JSON.parse transforma o texto JSON de volta em array/objeto JavaScript.
    return JSON.parse(registrosSalvos);
  } catch (erro) {
    // Se acontecer algum erro ao converter o JSON, mostramos no console.
    console.error("Erro ao carregar registros do localStorage:", erro);

    // Remove os dados inválidos para evitar erro repetido.
    localStorage.removeItem(STORAGE_KEY);

    // Retorna uma lista vazia para o app continuar funcionando.
    return [];
  }
}

// Função que salva o array registros no localStorage.
// O localStorage só salva texto, então usamos JSON.stringify.
function salvarRegistrosNoLocalStorage() {
  // JSON.stringify transforma o array de objetos em texto JSON.
  const registrosEmTexto = JSON.stringify(registros);

  // Salva o texto JSON no navegador usando a chave STORAGE_KEY.
  localStorage.setItem(STORAGE_KEY, registrosEmTexto);
}

// Cria o array principal do projeto.
// Agora ele começa carregando os dados salvos no navegador.
// Se não houver dados salvos, começa como array vazio.
let registros = carregarRegistrosDoLocalStorage();

// Função que converte a importância em uma classe CSS.
// Essa classe muda a cor lateral do card.
function obterClasseImportancia(importancia) {
  if (importancia === "Urgente") {
    return "urgent-border";
  }

  if (importancia === "Média") {
    return "medium-border";
  }

  return "low-border";
}

// Função que cria a mensagem exibida quando um dia não possui registros.
function criarMensagemVazia() {
  return '<div class="empty-message">Nenhum registro ainda.</div>';
}

// Função responsável por limpar todas as listas dos dias.
// Fazemos isso antes de redesenhar os cards atualizados.
function limparListasDosDias() {
  listasDosDias.forEach(function (lista) {
    lista.innerHTML = "";
  });
}

// Função que renderiza as mensagens vazias nos dias sem registros.
function renderizarMensagensVazias() {
  listasDosDias.forEach(function (lista) {
    // dataset.listaDia acessa o valor do atributo data-lista-dia.
    // Exemplo: data-lista-dia="segunda" vira lista.dataset.listaDia.
    const diaDaLista = lista.dataset.listaDia;

    // some verifica se existe pelo menos um registro naquele dia.
    const existeRegistroNesseDia = registros.some(function (registro) {
      return registro.diaSemana === diaDaLista;
    });

    // Se não existir registro no dia, mostramos a mensagem vazia.
    if (!existeRegistroNesseDia) {
      lista.innerHTML = criarMensagemVazia();
    }
  });
}

// Função que cria o HTML de um card de registro.
// Ela recebe um objeto registro e transforma esse objeto em um card visual.
function criarCardRegistro(registro) {
  const classeImportancia = obterClasseImportancia(registro.importancia);

  // Se o registro estiver concluído, adicionamos uma classe extra no card.
  const classeConcluido = registro.concluido ? "task-card-completed" : "";

  // Se estiver concluído, o botão mostra "Reabrir".
  // Se não estiver concluído, o botão mostra "Concluir".
  const textoBotaoStatus = registro.concluido ? "Reabrir" : "Concluir";

  // O atributo data-id guarda o id do registro no botão.
  // Assim o JavaScript sabe qual registro deve atualizar ou excluir.
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

// Função principal de renderização.
// Ela lê o array registros e desenha os cards na tela.
function renderizarRegistros() {
  limparListasDosDias();

  registros.forEach(function (registro) {
    const listaDoDia = document.querySelector(
      `[data-lista-dia="${registro.diaSemana}"]`
    );

    if (listaDoDia) {
      listaDoDia.innerHTML += criarCardRegistro(registro);
    }
  });

  renderizarMensagensVazias();
}

// Função que cria um objeto de registro usando os dados do formulário.
function criarRegistroPeloFormulario() {
  const titulo = document.getElementById("titulo").value.trim();
  const materia = document.getElementById("materia").value;
  const diaSemana = document.getElementById("diaSemana").value;
  const importancia = document.getElementById("importancia").value;
  const descricao = document.getElementById("descricao").value.trim();

  const novoRegistro = {
    // Date.now cria um número único baseado no horário atual.
    // Usamos isso como id simples para cada registro.
    id: Date.now(),

    // Dados preenchidos pelo usuário.
    titulo: titulo,
    materia: materia,
    diaSemana: diaSemana,
    importancia: importancia,
    descricao: descricao,

    // Campo usado para controlar se o registro está concluído ou não.
    concluido: false,

    // Guarda a data de criação em formato ISO.
    criadoEm: new Date().toISOString(),
  };

  return novoRegistro;
}

// Função que alterna o status de um registro.
// Se estiver pendente, vira concluído.
// Se estiver concluído, volta para pendente.
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

  // Depois de alterar o array, salvamos no localStorage.
  salvarRegistrosNoLocalStorage();

  // Depois redesenhamos a tela.
  renderizarRegistros();

  mensagemStatus.textContent = "Status do registro atualizado e salvo.";

  console.log("Registro atualizado. Array atual:", registros);
}

// Função que exclui um registro do array.
// Usamos filter para criar uma nova lista sem o item excluído.
function excluirRegistro(idRegistro) {
  registros = registros.filter(function (registro) {
    return registro.id !== idRegistro;
  });

  // Depois de excluir do array, salvamos a nova lista no localStorage.
  salvarRegistrosNoLocalStorage();

  // Depois redesenhamos a tela.
  renderizarRegistros();

  mensagemStatus.textContent = "Registro excluído e alteração salva.";

  console.log("Registro excluído. Array atual:", registros);
}

// Verifica se o formulário existe antes de adicionar eventos.
// Isso evita erro caso o id do formulário esteja diferente no HTML.
if (formularioRegistro) {
  formularioRegistro.addEventListener("submit", function (evento) {
    // Impede o recarregamento da página.
    evento.preventDefault();

    // Cria um objeto com os dados digitados no formulário.
    const novoRegistro = criarRegistroPeloFormulario();

    // Adiciona o novo objeto dentro do array registros.
    registros.push(novoRegistro);

    // Depois de adicionar no array, salvamos no localStorage.
    salvarRegistrosNoLocalStorage();

    // Atualiza a tela com o novo card.
    renderizarRegistros();

    // Limpa os campos do formulário depois do cadastro.
    formularioRegistro.reset();

    // Mostra uma mensagem de confirmação para o usuário.
    mensagemStatus.textContent = "Registro cadastrado e salvo no navegador.";

    // Mostra no console o array atualizado para estudo/debug.
    console.log("Array registros atualizado:", registros);
  });

  formularioRegistro.addEventListener("reset", function () {
    mensagemStatus.textContent = "Campos limpos. Pronto para um novo registro.";
  });
}

// Escuta cliques na página inteira.
// Isso permite capturar cliques nos botões criados dinamicamente pelo JavaScript.
document.addEventListener("click", function (evento) {
  const botaoClicado = evento.target.closest("button");

  // Se o clique não foi em um botão, a função para aqui.
  if (!botaoClicado) {
    return;
  }

  // Lê qual ação está no botão.
  // Exemplo: data-acao="excluir".
  const acao = botaoClicado.dataset.acao;

  // Lê o id do registro e converte para número.
  // No HTML, dataset sempre vem como texto.
  const idRegistro = Number(botaoClicado.dataset.id);

  if (acao === "alternar-status") {
    alternarStatusRegistro(idRegistro);
  }

  if (acao === "excluir") {
    excluirRegistro(idRegistro);
  }
});

// Renderiza o estado inicial da tela.
// Agora, se houver dados salvos no localStorage, eles já aparecem ao abrir a página.
renderizarRegistros();

// Mensagem inicial no console do navegador.
console.log("Study Tasks carregado com localStorage.");
console.log("Registros carregados:", registros);
