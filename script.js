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
    const invertedDate = date.toISOString().split("T")[0].replaceAll("-", "");
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

  initialize() {
    FileManager.parseData("./db.json").then((data) => {
      data.sort(
        (a, b) =>
          a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
      data.forEach(({ id, name, category, stock }) => {
        Products.all.push(new Product(id, name, category, stock));
      });

      App.reload();
    });
  },

  reset() {
    this.all = [];
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
      Products.all.sort(
        (a, b) =>
          a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
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
    // const products = Products.all.reduce((acc, item) => {
    //   const { category } = item;
    //   if (!acc[category]) {
    //     acc[category] = [];
    //   }

    //   acc[category].push(item);
    //   return acc;
    // }, {});

    // for (const category in products) {
    //   const header = document.createElement("tr");
    //   header.innerHTML = `<th class='header' colspan='4'>${category}</th>`;
    //   table.append(header);

    //   products[category].forEach((product, index) => {
    //     const { id, name } = product;

    //     //
    //     const getProductStock = Products.all.find(
    //       (item) => item.id === id
    //     ).stock;
    //     let total = getProductStock.reduce((acc, next) => acc + next, 0);
    //     //

    //     const tr = document.createElement("tr");
    //     tr.setAttribute("id", `item-${index}`);
    //     tr.innerHTML = `
    //         <td align="center">${id}</td>
    //         <td><a href="javascript:void(0);" class="link" onclick="DOM.showRegisteredItens(${index})">${name}</a></td>
    //         <td>${total !== 0 ? total.toFixed(3) : total}</td>
    //         <td class="no-print">
    //           <a href="javascript:void(0);" class="btn btn-table btn-1" onclick="DOM.showInsertWindow(${index})">+</a>
    //         </td>`;

    //     table.append(tr);
    //   });
    // }

    const products = Products.all;
    const fragment = document.createDocumentFragment();

    products.forEach((product, index) => {
      const { id, name } = product;

      const tr = document.createElement("tr");
      tr.id = `item-${index}`;
      tr.innerHTML = `
        <td align="center">${id}</td>
        <td><a href="javascript:void(0);" class="link" onclick="DOM.showRegisteredItens(${index})">${name}</a></td>
        <td>${Stock.getTotalStock(index)}</td>
        <td class="no-print">
          <a href="javascript:void(0);" class="btn btn-table btn-1" onclick="DOM.showInsertWindow(${index})">+</a>
        </td>
        `;
      fragment.appendChild(tr);
    });
    table.append(fragment);
  },
};

const Listeners = {
  toggleDarkMode: () => document.documentElement.classList.toggle("light"),
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

    App.init();
  },
};

App.init();
