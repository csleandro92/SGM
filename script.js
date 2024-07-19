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

/* Products
 * - receber os dados que serão adicionados na tabela
 */
const Products = {
  all: Storage.get(),

  async parseData() {
    const response = await fetch("./db.json");
    const json = response.json();
    return json;
  },

  initialize() {
    this.parseData().then((categorias) => {
      categorias.sort((a, b) => (a.categoria < b.categoria ? -1 : true));
      categorias.forEach(({categoria, produtos}) => {
        produtos.sort((a, b) => (a.produto < b.produto ? -1 : true));
        produtos.forEach(({id, produto}) => {
        this.all.push(new Product(id, produto, categoria, estoque = []));
        Storage.set(this.all);
        DOM.updateList();
        })
      })
    });
  },
  reset() {
    Storage.clear();
    this.all = [];
    DOM.updateList();
  },
};

const Stock = {
  getProductStock(index) {
    return Products.all[index].stock;
  },
  getTotalStock(index) {
    const total = this.getProductStock(index).reduce(
      (acc, next) => acc + next,
      0
    );
    return total !== 0 ? total.toFixed(3) : total;
  },
  getItemDetails(index) {
    const { id, product } = Products.all[index];
    return { id, product };
  },

  newProduct() {
    const id = document.getElementById("id");
    const produto = document.getElementById("product");
    const categoria = document.getElementById("category");

    if (!id.value || !produto.value || !categoria.value) {
      window.alert("Preencha todos os campos");
    } else {
      const products = Products.all;
      products.push(
        new Product(id.value, produto.value.toLowerCase(), categoria.value)
      );

      products.sort((a, b) => (a.product < b.product ? -1 : true));
      products.sort((a, b) => (a.category < b.category ? -1 : true));

      Storage.set(products);
      DOM.updateList();
      Modal.close();
    }
  },
  insertItem(index, close) {
    let input = document.getElementById(index).value;
    input = Number(input.replace(",", "."));
    if (input && !isNaN(input)) {
      this.getProductStock(index).push(input);
      if (!close) {
        DOM.showInsertWindow(index);
      } else {
        Modal.close();
      }
    } else {
      window.alert("Digite um valor válido");
    }
    Storage.set(Products.all);
    DOM.updateList();
  },
  removeItem(index, i) {
    const product = Products.all[index].stock;
    product.splice(i, 1);
    Storage.set(Products.all);
    DOM.updateList();
    DOM.showRegisteredItens(index);
  },
};

const Modal = {
  open(modalType, title, func) {
    modal.classList.add("active");
    form.classList.add(modalType);
    modalTitle.innerText = title;

    func();
  },
  close() {
    modal.classList.remove("active");
    form.classList = "";
  },
};
/* DOM
 * - manipula os elementos visuais da aplicação
 */
const DOM = {
  showRegisteredItens(index) {
    Modal.open("list-item", "Listando itens", () => {
      const stock = Stock.getProductStock(index);
      if (stock.length) {
        const products = stock.map(
          (product, i) =>
            `<a class="${
              product > 0 ? "btn-2" : "btn-3"
            }" href="#" onclick="Stock.removeItem(${index}, ${i})">${product}</a>`
        );
        form.innerHTML = products.join("");
      } else {
        form.innerHTML =
          '<span class="col-2">Não há nenhum item cadastrado para este produto</span>';
      }
    });
  },
  showCreateWindow() {
    Modal.open("add-item", "Cadastrar Produto", () => {
      form.innerHTML = `
      <input type="text" id="id" inputmode="numeric" placeholder="Código" autocomplete="off">
      <input type="text" id="product" placeholder="Nome do Produto" autocomplete="off">
      <select class="col-2" name="category" id="category">
        <option value="" selected disabled>Categoria</option>
        <option value="bovinos">Bovinos</option>
        <option value="suinos">Suinos</option>
        <option value="embutidos">Outros</option>
      </select>
      <button class="btn btn-4" onclick="Stock.newProduct()">Cadastrar Produto</button>
    `;
    });
  },
  showInsertWindow(index) {
    const { id, product } = Stock.getItemDetails(index);
    Modal.open("default", `${id} → ${product}`, () => {
      form.innerHTML = `
      <input class="only-numbers col-2" id="${index}" type="text" inputmode="numeric" autocomplete="off">
      <button class="btn btn-1" onclick="Stock.insertItem(${index}, true)">Adicionar um item</button>
      <button class="btn btn-2" onclick="Stock.insertItem(${index}, false)">Adicionar múltiplos</button>
      `;
      document.getElementById(index).focus();
    });
  },
  clearList() {
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
  },
  updateList() {
    this.clearList();

    const products = Products.all;
    for (index in products) {
      const { id, product } = products[index];

      const tr = document.createElement("tr");
      tr.id = `item-${index}`;
      tr.innerHTML = `
        <td align="center">${id}</td>
        <td><a href="#" onclick="DOM.showRegisteredItens(${index})">${product}</a></td>
        <td>${Stock.getTotalStock(index)}</td>
        <td class="no-print">
          <button onclick="DOM.showInsertWindow(${index})">+</button>
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
            Products.reset();
            Products.initialize();
          }
          break;
        case "#save":
          window.print();
          break;
        default:
          break;
      }
    });
    modalCloseBtn.addEventListener("click", Modal.close);
    addItemBtn.addEventListener("click", DOM.showCreateWindow);
  },
};

/* App
 * - núcleo central, contendo as principais funções, essenciais
 * para o funcionamento do sistema.
 */
const App = {
  init() {
    Listeners.init();
    DOM.updateList();
  },
};

App.init();