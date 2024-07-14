// Declaração de variáveis
const table = document.querySelector("table tbody");

/* Database
 * - responsável por receber os dados que serão semeados na tabela
 */
const Database = {
  async readData() {
    const response = await fetch("./db.json");
    const json = await response.json();
    return json;
  },
};

/* Storage
 * - responsável por armazenar os dados no armazenamento do navegador
 */
const Storage = {
  get: function () {
    return JSON.parse(localStorage.getItem("tb_produtos")) ?? [];
  },

  set: function (tb_produtos) {
    localStorage.setItem("tb_produtos", JSON.stringify(tb_produtos));
  },

  clear: function () {
    localStorage.removeItem("tb_produtos");
  },
};

Database.readData().then((data) => {
  // Agrupar itens por ordem alfabética e por categoria
  data.sort((a, b) => (a.produto < b.produto ? -1 : true));
  data.sort((a, b) => (a.categoria < b.categoria ? -1 : true));

  // Mapear os dados para exibir na tabela
  const products = data.map(({ id, produto, estoque }, index) => {
    return `<tr id="item-${index}">
        <td>${id}</td>
        <td>${produto}</td>
        <td>${estoque || ""}</td>
        <td><button onclick="addEstoque(${index})">+</button></td>
      </tr>`; //FIX estoque
  });

  // Exibir os dados no browser
  table.innerHTML = products.join("");
});

function addEstoque(index) {
  const line = document.querySelector(`#item-${index} td:nth-child(3n)`);

  const next = line.innerText || 0;

  line.classList.add("d-flex");
  line.innerHTML = `<input class="input" type="text" inputmode="numeric" id=${index}><button class="save" onclick="increment(${index}, ${next})">Salvar</button>`;
  document.getElementById(index).focus();
}

function increment(index, next) {
  const line = document.querySelector(`#item-${index} td:nth-child(3n)`);

  const current = document.getElementById(index).value || 0;

  const total = Number.parseFloat(next) + Number.parseFloat(current);

  line.innerText = total;
  line.classList.remove("d-flex");
}
