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
const form = document.querySelector(".modal-content form");

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

      data.forEach(({ id, produto, estoque, categoria }) => {
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
  insert(index) {
    const products = DB.all;
    const currentItemStock = products[index].stock;

    let input = document.getElementById(index).value;
    input *= 100;
    currentItemStock.push(Math.round(input));

    Storage.set(DB.all);
    DOM.update();
    DOM.closeInput();
  },
  getStock(index) {
    const products = DB.all;
    const currentItemStock = products[index].stock;

    const total = currentItemStock.reduce((acc, next) => acc + next, 0);
    return total / 100;
  },
};

/* DOM
 * - manipula os elementos visuais da aplicação
 */
const DOM = {
  showInput(index) {
    modal.classList.add("active");
    form.innerHTML = `
      <input id="${index}" type="text" inputmode="numeric" autocomplete="off">
      <button class="btn submit" onclick="Stock.insert(${index})">Salvar</button>`;

    document.getElementById(index).focus();
  },
  closeInput() {
    modal.classList.toggle("active");
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
          <button onclick="DOM.showInput(${index})">+</button>
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
