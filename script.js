class Product {
  constructor(id, name, category, stock = []) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.stock = stock;
  }
}

const table = document.querySelector("table tbody");

const modal = document.querySelector(".modal-overlay");
const modalTitle = document.getElementById("modal-title");

const form = document.querySelector("form");

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
    this.parseData().then((data) => {
      data.sort((a, b) => (a.category < b.category ? -1 : true));
      data.forEach(({ category, products }) => {
        products.sort((a, b) => (a.name < b.name ? -1 : true));
        products.forEach(({ id, name, stock }) => {
          this.all.push(new Product(id, name, category, stock));
        });
      });
      Storage.set(this.all);
      DOM.updateList();
    });
  },

  reset() {
    Storage.clear();
    this.all = [];
    DOM.updateList();
  },

  restart() {
    this.reset();
    this.initialize();
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
    const { id, name } = Products.all[index];
    return { id, name };
  },

  newProduct() {
    const id = Number(document.getElementById("id").value);
    const name = document.getElementById("name").value.toLowerCase();
    const category = document.getElementById("category").value;

    const products = Products.all;
    const idExists = products.find((product) => product.id === id);
    const nameExists = products.find((product) => product.name === name);
    if (idExists || nameExists) {
      alert("Este produto já foi cadastrado!");
      return;
    } else if (!id || !name || !category) {
      alert("Preencha todos os campos corretamente!");
      return;
    } else {
      products.push(new Product(id, name, category));
      products.sort((a, b) => (a.name < b.name ? -1 : true));
      products.sort((a, b) => (a.category < b.category ? -1 : true));
    }
    Storage.set(products);
    DOM.updateList();
    Modal.close();
  },
  insertItem(index, closeWindow) {
    const input = Number(document.getElementById(index).value.replace(",", "."));
    if (input && !isNaN(input)) {
      this.getProductStock(index).push(input);
      if (!closeWindow) {
        DOM.showInsertWindow(index);
      } else {
        Modal.close();
      }
    } else {
      alert("Digite um valor válido!");
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
  open(template) {
    const { id, title, func } = template;

    modal.classList.add("active");

    modalTitle.textContent = title;
    form.setAttribute("id", id);

    func();
  },
  close() {
    modal.classList.remove("active");

    modalTitle.textContent = "";
    form.removeAttribute("id");
    form.innerHTML = "";
  },
};
/* DOM
 * - manipula os elementos visuais da aplicação
 */
const DOM = {
  showRegisteredItens(index) {
    Modal.open({
      id: "list-item",
      title: "Listando itens",
      func: () => {
        const stock = Stock.getProductStock(index);
        if (stock.length) {
          const items = stock.map((product, i) => {
            const btnColor = product > 0 ? "plus" : "minus";
            return `<a href="javascript:void(0);" class="${btnColor}" onclick="Stock.removeItem(${index}, ${i})">${product}</a>`;
          });
          form.innerHTML = items.join("");
        } else {
          form.innerHTML =
            '<span class="col-2">Não há nenhum item cadastrado para este produto.</span>';
        }
      },
    });
  },
  showCreateWindow() {
    Modal.open({
      id: "add-item",
      title: "Cadastrar Produto",
      func: () => {
        form.innerHTML = `
          <input type="text" id="id" inputmode="numeric" placeholder="Código" autocomplete="off">
          <input type="text" id="name" placeholder="Nome do Produto" autocomplete="off">
          <select class="col-2" name="category" id="category">
            <option value="" selected disabled>Categoria</option>
            <option value="bovinos">Bovinos</option>
            <option value="suinos">Suinos</option>
            <option value="embutidos">Outros</option>
          </select>
          <button class="btn btn-4" onclick="Stock.newProduct()">Cadastrar Produto</button>`;
      },
    });
  },
  showInsertWindow(index) {
    const { id, name } = Stock.getItemDetails(index);
    Modal.open({
      id: "default",
      title: `${id} → ${name}`,
      func: () => {
        form.innerHTML = `
          <input class="only-numbers col-2" id="${index}" type="text" inputmode="numeric" autocomplete="off">
          <button class="btn btn-1" onclick="Stock.insertItem(${index}, true)">Adicionar um item</button>
          <button class="btn btn-2" onclick="Stock.insertItem(${index}, false)">Adicionar múltiplos</button>`;
        document.getElementById(index).focus();
      },
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
      const { id, name } = products[index];

      const tr = document.createElement("tr");
      tr.id = `item-${index}`;
      tr.innerHTML = `
        <td align="center">${id}</td>
        <td><a href="javascript:void(0);" class="link" onclick="DOM.showRegisteredItens(${index})">${name}</a></td>
        <td>${Stock.getTotalStock(index)}</td>
        <td class="no-print">
          <a href="javascript:void(0);" class="btn btn-table btn-1" onclick="DOM.showInsertWindow(${index})">+</a>
        </td>`;

      table.appendChild(tr);
    }
  },
};

const Listeners = {
  modalCloseBtn: document.getElementById("modal-close-btn"),
  addItemBtn: document.getElementById("add-item-btn"),

  init() {
    menu.addEventListener("click", (e) => {
      e.preventDefault();
      const option = e.target.hash;
      switch (option) {
        case "#update":
          const message =
            "Esta ação apagará todos os dados armazenados. Deseja continuar?";
          if (confirm(message)) {
            Products.restart();
          }
          break;
        case "#save":
          print();
          break;
        default:
          alert("Função desativada no momento.");
          break;
      }
    });
    form.addEventListener("submit", (e) => e.preventDefault());
    this.modalCloseBtn.addEventListener("click", Modal.close);
    this.addItemBtn.addEventListener("click", DOM.showCreateWindow);
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
