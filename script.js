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
    return JSON.parse(localStorage.getItem("tb_products")) || [];
  },
  set(tb_products) {
    localStorage.setItem("tb_products", JSON.stringify(tb_products));
  },
};

const FileManager = {
  async parseData(filename) {
    const res = await fetch(filename);
    return res.json();
  },

  formatFileName() {
    const date = new Date();
    const invertedDate = date.toISOString().slice(0, 10).replace(/-/g, "");
    const hours = `${date.getHours().toString().padStart(2, "0")}`;
    const minutes = `${date.getMinutes().toString().padStart(2, "0")}`;

    return `${invertedDate}-${hours}${minutes}`;
  },

  upload(event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          Products.all.splice(0, Products.all.length, ...data);
          App.reload();
        } catch (e) {
          console.log(e);
        }
      };
      reader.readAsText(file);
    }
  },
  download(e) {
    e.preventDefault();

    const filename = this.formatFileName();

    const data = JSON.stringify(Products.all);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = `sgm-${filename}.json`;
    link.href = url;
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  },
};

/* Products
 * - receber os dados que serão adicionados na tabela
 */
const Products = {
  all: Storage.get(),

  async initialize() {
    await FileManager.parseData("./db.json").then((data) => {
      data.forEach(({ id, name, category, stock }) => {
        Products.all.push(new Product(id, name, category, stock));
      });
    });
  },

  restart() {
    this.all = [];
    this.initialize().then(() => {
      App.reload();
    });
  },

  sortProducts(data) {
    return data.sort(
      (a, b) =>
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
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
  getCategories() {
    const products = Products.all;
    const categories = products.reduce((acc, { category }) => {
      if (!acc) {
        acc = [];
      }
      const check = acc.find((cat) => cat === category);
      if (!check) acc.push(category);
      return acc;
    }, []);

    return categories;
  },

  newProduct() {
    const id = Number.parseInt(document.getElementById("id").value);
    const name = document.getElementById("name").value.toLowerCase();
    const category = document.getElementById("category").value;

    const product = Products.all.some(
      (product) => product.id === id || product.name === name
    );
    if (product) {
      alert("Este produto já foi cadastrado!");
      return;
    } else if (!id || !name || !category) {
      alert("Preencha todos os campos corretamente!");
      return;
    } else {
      Products.all.push(new Product(id, name, category));
    }
    App.reload();
    Modal.close();
  },
  insertItem(index, closeWindow) {
    const input = Number.parseFloat(
      document.getElementById(index).value.replace(",", ".")
    );
    if (!isNaN(input)) {
      this.getProductStock(index).push(input);
      if (!closeWindow) {
        DOM.showInsertWindow(index);
      } else {
        Modal.close();
      }
    } else {
      alert("Digite um valor válido!");
      document.getElementById(index).value = "";
      document.getElementById(index).focus();
    }
    App.reload();
  },
  removeItem(index, i) {
    if (confirm("Deseja remover o item selecionado?")) {
      const product = Products.all[index].stock;
      product.splice(i, 1);
      App.reload();
      DOM.showRegisteredItens(index);
    }
  },
};

const Modal = {
  open({ id, title, func }) {
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
    const { id, name } = Stock.getItemDetails(index);
    Modal.open({
      id: "list-item",
      title: `${id} → ${name}`,
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
        const categories = Stock.getCategories();
        const categoryList = categories.map((category) => {
          return `<option value="${category}">${category}</option>`;
        });

        form.innerHTML = `
          <input type="text" id="id" inputmode="numeric" placeholder="Código" autocomplete="off">
          <input type="text" id="name" placeholder="Nome do Produto" autocomplete="off">
          <select class="col-2" name="category" id="category">
            <option value="" selected disabled>Categoria</option>
            ${categoryList.join("")}
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
    table.innerHTML = "";
  },
  updateList() {
    const fragment = document.createDocumentFragment();
    const products = Products.all;

    const categories = Stock.getCategories();
    categories.forEach((category) => {
      const header = document.createElement("tr");
      header.innerHTML = `<th colspan="4">${category}</th>`;
      fragment.appendChild(header);

      const categoryLength = products.filter(
        (product) => product.category === category
      ).length;
      if (categoryLength > 12) {
        header.classList.add("page-break");
      }

      products.forEach((product, index) => {
        if (product.category === category) {
          const line = document.createElement("tr");
          line.id = `item-${index}`;
          line.innerHTML = `
            <td align="center">${product.id}</td>
            <td><a href="javascript:void(0);" class="link" onclick="DOM.showRegisteredItens(${index})">${
            product.name
          }</a></td>
            <td>${Stock.getTotalStock(index)}</td>
            <td class="no-print">
              <a href="javascript:void(0);" class="btn btn-table btn-1" onclick="DOM.showInsertWindow(${index})">+</a>
            </td>
         `;
          fragment.appendChild(line);
        }
      });
    });

    table.append(fragment);
  },
};

const Listeners = {
  toggleDarkMode: () => document.documentElement.classList.toggle("dark"),
  handleMenu(event) {
    event.preventDefault();
    const option = event.target.hash;
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
  },

  init() {
    title.addEventListener("click", this.toggleDarkMode);

    menu.addEventListener("click", this.handleMenu);
    document
      .getElementById("upload")
      .addEventListener("change", FileManager.upload);
    // exportBtn.addEventListener("click", FileManager.export);

    form.addEventListener("submit", (event) => event.preventDefault());

    const modalCloseBtn = document.getElementById("modal-close-btn");
    modalCloseBtn.addEventListener("click", Modal.close);

    const addItemBtn = document.getElementById("add-item-btn");
    addItemBtn.addEventListener("click", DOM.showCreateWindow);

    const theme = window.matchMedia("(prefers-color-scheme: dark)");
    const listenTheme = () => {
      document.documentElement.classList.toggle("dark", theme.matches);
    };
    window.addEventListener("load", listenTheme);
    theme.addEventListener("change", listenTheme);
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

    Storage.set(Products.all);
  },

  reload() {
    DOM.clearList();

    Products.sortProducts(Products.all);
    App.init();
  },
};

App.init();
