// Ativa um modo mais rigoroso do JavaScript.
// Isso ajuda a evitar alguns erros comuns durante o desenvolvimento.
"use strict";

// Busca no HTML o elemento onde será exibido o mês atual.
const mesAtual = document.getElementById("mesAtual");

// Busca no HTML o elemento onde será exibido o ano atual.
const anoAtual = document.getElementById("anoAtual");

// Busca o formulário de cadastro visual.
const formularioRegistro = document.getElementById("registroForm");

// Busca a mensagem que aparece abaixo do formulário.
const mensagemStatus = document.getElementById("mensagemStatus");

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

// Cria uma data com o dia atual do sistema.
const dataAtual = new Date();

// Verifica se o elemento do mês existe antes de alterar o texto.
if (mesAtual) {
  // Mostra o nome do mês atual na tela.
  mesAtual.textContent = nomesDosMeses[dataAtual.getMonth()];
}

// Verifica se o elemento do ano existe antes de alterar o texto.
if (anoAtual) {
  // Mostra o ano atual na tela.
  anoAtual.textContent = dataAtual.getFullYear();
}

// Verifica se o formulário existe antes de adicionar eventos nele.
if (formularioRegistro) {
  // Escuta o evento de envio do formulário.
  formularioRegistro.addEventListener("submit", function (evento) {
    // Impede que a página recarregue ao enviar o formulário.
    evento.preventDefault();

    // Mostra uma mensagem temporária para confirmar que o formulário está conectado.
    mensagemStatus.textContent =
      "Formulário conectado com sucesso. Na próxima etapa, este registro será transformado em um card dinâmico.";

    // Mostra no console que o JavaScript está funcionando.
    console.log("Teste de envio do formulário realizado com sucesso.");
  });

  // Escuta o evento de limpar os campos do formulário.
  formularioRegistro.addEventListener("reset", function () {
    // Atualiza a mensagem ao limpar o formulário.
    mensagemStatus.textContent = "Campos limpos. Pronto para um novo teste.";
  });
}

// Mensagem inicial no console do navegador.
console.log("DevTasks JS carregado com layout de planner semanal.");
