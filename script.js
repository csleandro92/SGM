class Product {
  constructor(id, product, category, stock = []) {
    this.id = id;
    this.product = product;
    this.category = category;
    this.stock = stock;
  }
}

const menu = document.getElementById("menu");
const table = document.querySelector("table tbody");
const modal = document.querySelector(".modal-overlay");
const modalTitle = document.querySelector(".modal-title h2");
const form = document.querySelector(".modal-content form");

const checkIfANumberWasTyped = (event) => {
  const isNotANumber = isNaN(event.key);
  if (isNotANumber) {
    event.preventDefault();
  }
};

/* Storage
 * - salvar os dados no armazenamento interno do navegador
 */
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("tb_products")) ?? [];
  },

  set(tb_products) {
    localStorage.setItem("tb_products", JSON.stringify(tb_products));
  },

  clear() {
    localStorage.removeItem("tb_products");
  },
};

/* Database
 * - receber os dados que serão adicionados na tabela
 */
const DB = {
  all: Storage.get(),

  async parseData() {
    const response = await fetch("./db.json");
    const json = response.json();
    return json;
  },

  initialize() {
    this.parseData().then((data) => {
      data.sort((a, b) => (a.produto < b.produto ? -1 : true));
      data.sort((a, b) => (a.categoria < b.categoria ? -1 : true));

      data.forEach(({ id, produto, categoria, estoque }) => {
        this.all.push(new Product(id, produto, categoria, estoque));
        Storage.set(this.all);
        DOM.update();
      });
    });
  },
  reset() {
    Storage.clear();
    this.all = [];
    DOM.update();
  },
};

const Stock = {
  insert(index, close) {
    const products = DB.all;
    const currentStockQuantity = products[index].stock;

    let input = document.getElementById(index).value;
    input = Number(input.replace(",", "."));
    input *= 100;
    currentStockQuantity.push(Math.round(input));

    Storage.set(DB.all);
    DOM.update();
    if (!close) {
      DOM.showModal(index);
    } else {
      DOM.closeModal();
    }
  },
  newItem() {
    const id = document.getElementById("id");
    const produto = document.getElementById("product");
    const categoria = document.getElementById("category");

    const products = DB.all;
    products.push(
      new Product(id.value, produto.value.toLowerCase(), categoria.value)
    );

    products.sort((a, b) => (a.product < b.product ? -1 : true));
    products.sort((a, b) => (a.category < b.category ? -1 : true));

    Storage.set(DB.all);
    DOM.update();
    DOM.closeModal();
  },
  getStock(index) {
    const products = DB.all;
    const currentItemStock = products[index].stock;

    const total = currentItemStock.reduce((acc, next) => acc + next, 0);
    return total / 100;
  },
  getItemName(index) {
    const products = DB.all;
    const { product, id } = products[index];

    return `${id} → ${product}`;
  },
};

/* DOM
 * - manipula os elementos visuais da aplicação
 */
const DOM = {
  showCreateModal() {
    modal.classList.add("active");
    modalTitle.innerText = "Cadastrar Novo Item";

    form.innerHTML = `
      <input class="col-2" type="text" id="id" inputmode="numeric" placeholder="Código">
      <input class="col-2" type="text" id="product" placeholder="Nome do Produto">
      <select class="col-2" name="category" id="category">
        <option value="" selected disabled>Categoria</option>
        <option value="bovinos">Bovinos</option>
        <option value="suinos">Suinos</option>
        <option value="embutidos">Outros</option>
      </select>
      <button class="btn btn-1" onclick="Stock.newItem()">Cadastrar Produto</button>
    `;
  },
  showModal(index) {
    modal.classList.add("active");
    modalTitle.innerText = Stock.getItemName(index);

    form.innerHTML = `
        <input class="only-numbers col-2" id="${index}" type="text" inputmode="numeric" autocomplete="off">
        <button class="btn btn-1" onclick="Stock.insert(${index}, true)">Adicionar um item</button>
        <button class="btn btn-2" onclick="Stock.insert(${index}, false)">Adicionar múltiplos</button>
        `;
    document.getElementById(index).focus();
    
    document
      .querySelector(".only-numbers")
      .addEventListener("keypress", checkIfANumberWasTyped);
  },
  closeModal() {
    modal.classList.remove("active");
  },
  clear() {
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
  },
  update() {
    this.clear();

    const products = Storage.get();
    for (index in products) {
      const { id, product } = products[index];

      const tr = document.createElement("tr");
      tr.id = `item-${index}`;
      tr.innerHTML = `
        <td align="center">${id}</td>
        <td>${product}</td>
        <td>${Stock.getStock(index)}</td>
        <td class="no-print">
          <button onclick="DOM.showModal(${index})">+</button>
        </td>`;

      table.appendChild(tr);
    }
  },
};

const Listeners = {
  init() {
    menu.addEventListener("click", (e) => {
      e.preventDefault();
      const option = e.target.hash;
      switch (option) {
        case "#update":
          DB.reset();
          DB.initialize();
          break;
        case "#save":
          window.print();
          break;
        default:
          break;
      }
    });
  },
};

/* App
 * - núcleo central, contendo as principais funções, essenciais
 * para o funcionamento do sistema.
 */
const App = {
  init() {
    Listeners.init();
    DOM.update();
  },
};

App.init();
