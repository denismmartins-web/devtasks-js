// Ativa um modo mais rigoroso do JavaScript.
// Isso ajuda a evitar alguns erros comuns durante o desenvolvimento.
"use strict";

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

// Cria o array principal do projeto.
// Nesta branch, ele funciona como uma "mini tabela temporária" em memória.
// Quando a página é atualizada, esse array volta vazio.
// Nas próximas etapas, vamos salvar esse array no localStorage.
let registros = [];

// Função que converte o valor da importância em uma classe CSS.
// Essa classe muda a cor da borda do card.
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
// Ela remove os cards antigos antes de renderizar os cards atualizados.
function limparListasDosDias() {
  listasDosDias.forEach(function (lista) {
    lista.innerHTML = "";
  });
}

// Função que renderiza as mensagens vazias nos dias sem registros.
function renderizarMensagensVazias() {
  listasDosDias.forEach(function (lista) {
    const diaDaLista = lista.dataset.listaDia;

    const existeRegistroNesseDia = registros.some(function (registro) {
      return registro.diaSemana === diaDaLista;
    });

    if (!existeRegistroNesseDia) {
      lista.innerHTML = criarMensagemVazia();
    }
  });
}

// Função que cria o HTML de um card de registro.
// Ela recebe um objeto registro e transforma esse objeto em um card visual.
function criarCardRegistro(registro) {
  const classeImportancia = obterClasseImportancia(registro.importancia);

  return `
    <article class="task-card ${classeImportancia}">
      <span class="task-subject">${registro.materia}</span>

      <h4>${registro.titulo}</h4>

      <p>${registro.descricao || "Sem descrição adicionada."}</p>

      <small>${registro.importancia}</small>
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
    id: Date.now(),
    titulo: titulo,
    materia: materia,
    diaSemana: diaSemana,
    importancia: importancia,
    descricao: descricao,
    criadoEm: new Date().toISOString(),
  };

  return novoRegistro;
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

    // Atualiza a tela com o novo card.
    renderizarRegistros();

    // Limpa os campos do formulário depois do cadastro.
    formularioRegistro.reset();

    // Mostra uma mensagem de confirmação para o usuário.
    mensagemStatus.textContent = "Registro cadastrado com sucesso nesta sessão.";

    // Mostra no console o array atualizado para estudo/debug.
    console.log("Array registros atualizado:", registros);
  });

  formularioRegistro.addEventListener("reset", function () {
    mensagemStatus.textContent = "Campos limpos. Pronto para um novo registro.";
  });
}

// Renderiza o estado inicial da tela.
// Como o array começa vazio, todos os dias mostram "Nenhum registro ainda".
renderizarRegistros();

// Mensagem inicial no console do navegador.
console.log("DevTasks JS carregado. Cadastro de registros iniciado.");
