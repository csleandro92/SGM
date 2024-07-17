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

const modalTitle = document.getElementById("modal-title");
const modalCloseBtn = document.getElementById("modal-close-btn");

const form = document.querySelector(".modal-content form");

const addItemBtn = document.getElementById("add-item-btn");

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
    if (input && !isNaN(input)) {
      input = Number(input.replace(",", "."));
      currentStockQuantity.push(input);

      Storage.set(DB.all);
      DOM.update();
      if (!close) {
        DOM.showModal(index);
      } else {
        DOM.closeModal();
      }
    } else {
      window.alert("Digite um valor válido");
    }
  },
  newItem() {
    const id = document.getElementById("id");
    const produto = document.getElementById("product");
    const categoria = document.getElementById("category");
    if (id.value && produto.value && categoria.value) {
      const products = DB.all;
      products.push(
        new Product(id.value, produto.value.toLowerCase(), categoria.value)
      );

      products.sort((a, b) => (a.product < b.product ? -1 : true));
      products.sort((a, b) => (a.category < b.category ? -1 : true));

      Storage.set(DB.all);
      DOM.update();
      DOM.closeModal();
      console.log(!!id.value);
    } else {
      window.alert("Preencha todos os campos");
    }
  },
  getItemDetails(index) {
    const products = DB.all;
    const currentItemStock = products[index].stock;

    return currentItemStock;
  },
  getStockTotal(index) {
    const products = DB.all;
    const currentItemStock = products[index].stock;

    const total = currentItemStock.reduce((acc, next) => acc + next, 0);
    // return total / 100;
    return total;
  },
  getItemName(index) {
    const products = DB.all;
    const { product, id } = products[index];

    return `${id} → ${product}`;
  },
  removeItem(index, i) {
    const product = DB.all[index].stock;
    product.splice(i, 1)
    Storage.set(DB.all);
    DOM.update();
    DOM.showDetailsModal(index)
  }
};

/* DOM
 * - manipula os elementos visuais da aplicação
 */
const DOM = {
  showDetailsModal(index) {
    modal.classList.add("active");
    form.classList.add("list-item");
    modalTitle.innerText = "Listando itens";

    const stock = Stock.getItemDetails(index);
    if(stock.length) {
      const products = stock.map((product, i) => `<a href="#" onclick="Stock.removeItem(${index}, ${i})">${product}</a>`)
      form.innerHTML = products.join('')
    }
    else {
      form.innerHTML = '<span class="col-2">Não há nenhum item cadastrado para este produto</span>'
    }
    
  },
  showCreateModal() {
    modal.classList.add("active");
    form.classList.add("add-item");

    modalTitle.innerText = "Cadastrar Novo Item";

    form.innerHTML = `
      <input type="text" id="id" inputmode="numeric" placeholder="Código">
      <input type="text" id="product" placeholder="Nome do Produto">
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
    form.classList.add("default");

    modalTitle.innerText = Stock.getItemName(index);

    form.innerHTML = `
        <input class="only-numbers col-2" id="${index}" type="text" inputmode="numeric" autocomplete="off">
        <button class="btn btn-1" onclick="Stock.insert(${index}, true)">Adicionar um item</button>
        <button class="btn btn-2" onclick="Stock.insert(${index}, false)">Adicionar múltiplos</button>
        `;
    document.getElementById(index).focus();
  },
  closeModal() {
    modal.classList.remove("active");
    form.classList = "";
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
        <td><a href="#" onclick="DOM.showDetailsModal(${index})">${product}</a></td>
        <td>${Stock.getStockTotal(index)}</td>
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
          if (
            confirm(
              "Esta ação apagará todos os dados armazenados. Deseja continuar?"
            )
          ) {
            DB.reset();
            DB.initialize();
          }
          break;
        case "#save":
          window.print();
          break;
        default:
          break;
      }
    });
    modalCloseBtn.addEventListener("click", DOM.closeModal);
    addItemBtn.addEventListener("click", DOM.showCreateModal);
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
