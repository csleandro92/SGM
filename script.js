console.log("--- INICIANDO SGM ---");

const table = document.querySelector("#app tbody");

const Database = {
  async create() {
    const res = await fetch("./db.json");
    const json = await res.json();
    return json;
  },
};

Database.create().then((dados) => {
  const produtos = dados.map(
    ({ id, produto }, index) =>
      `<tr>
        <td>${id}</td>
        <td>${produto}</td>
        <td id="estoque-${index}"></td>
        <td><button onclick="addEstoque(${index})">+</button>
      </tr>
      `
  );
  table.innerHTML = produtos.join("");
});

function addEstoque(index) {
  const line = document.getElementById(`estoque-${index}`);
  const next = line.innerText || 0;
  line.classList.add("estoque");
  line.innerHTML = `<input type="number" id=${index}><button class="save" onclick="increment(${index}, ${next})">Salvar</button>`;
  document.getElementById(index).focus();
}

function increment(index, next) {
  const line = document.getElementById(`estoque-${index}`);
  const current = document.getElementById(index).value || 0;

  const total = Number.parseInt(next) + Number.parseInt(current);

  line.innerText = total;
  line.classList.remove("estoque");
}
