// Declaração de variáveis
const table = document.querySelector("#app tbody");

/* Objeto Database
 * - responsável por receber os dados que serão semeados na tabela
 */
const Database = {
  async readData() {
    const response = await fetch("./db.json");
    const json = await response.json();
    return json;
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
  line.innerHTML = `<input type="number" id=${index}><button class="save" onclick="increment(${index}, ${next})">Salvar</button>`;
  document.getElementById(index).focus();
}

function increment(index, next) {
  const line = document.querySelector(`#item-${index} td:nth-child(3n)`);

  const current = document.getElementById(index).value || 0;

  const total = Number.parseInt(next) + Number.parseInt(current);

  line.innerText = total;
  line.classList.remove("d-flex");
}
