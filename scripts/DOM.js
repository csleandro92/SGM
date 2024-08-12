import { Products } from "./Product.js";
import { Stock } from "./Stock.js";

let isDeleteModeEnabled = false;
let isEditModeEnabled = false;
const deleteBtn = document.querySelector(".modal-delete");
const editBtn = document.querySelector(".modal-edit");

export const ButtonController = {
  toggleButtonVisibility(btn, shouldShow) {
    btn.style.display = shouldShow ? "block" : "none";
  },

  toggleMode(state, btn) {
    state ? btn.classList.add("active") : btn.classList.remove("active");
  },

  isDeleteModeEnabled() {
    return isDeleteModeEnabled;
  },

  setDeleteMode(state) {
    isDeleteModeEnabled = state;
    this.toggleMode(isDeleteModeEnabled, deleteBtn);
  },

  isEditModeEnabled() {
    return isEditModeEnabled;
  },

  setEditMode(state) {
    isEditModeEnabled = state;
    this.toggleMode(isEditModeEnabled, editBtn);
  },
};

const form = document.getElementById("form");

export const Modal = {
  overlay: document.querySelector(".modal-overlay"),
  title: document.getElementById("modal-title"),

  open({ id, title }, func) {
    Modal.overlay.classList.add("active");

    Modal.title.textContent = title;
    form.setAttribute("id", id);

    func();
  },
  close() {
    Modal.overlay.classList.remove("active");

    Modal.title.textContent = "";
    form.removeAttribute("id");
    form.innerHTML = "";

    ButtonController.setDeleteMode(false);
    ButtonController.toggleButtonVisibility(deleteBtn, false);

    ButtonController.setEditMode(false);
    ButtonController.toggleButtonVisibility(editBtn, false);
  },
};

/* DOM
 * - manipula os elementos visuais da aplicação
 */
export const DOM = {
  showEditProduct(index) {
    const { id, name } = Stock.getItemDetails(index);

    const renderCategoryOptions = () => {
      const categories = Stock.getCategories();
      return categories
        .map((category) => `<option value="${category}">${category}</option>`)
        .join("");
    };

    const renderForm = () => {
      return `
        <input type="text" id="id" inputmode="numeric" value="${id}" placeholder="Código" autocomplete="off">
        <input type="text" id="name" value="${name}" placeholder="Nome do Produto" autocomplete="off">
        <select class="col-2" name="category" id="category">
          <option value="" selected disabled>Categoria</option>
          ${renderCategoryOptions()}
        </select>
        <button id="btn-edit" class="btn btn-4">Editar Produto</button>
      `;
    };

    const attachListeners = () => {
      document
        .getElementById("btn-edit")
        .addEventListener("click", () => Stock.editProductDetails(index));
    };

    const handleModal = () => {
      // ButtonController.toggleButtonVisibility(editBtn, true);

      form.innerHTML = renderForm();
      attachListeners();
    };

    const options = {
      id: "add-item",
      title: `${id} → ${name}`,
    };

    Modal.open(options, handleModal);
  },

  showRegisteredItens(index) {
    const { id, name } = Stock.getItemDetails(index);
    const fragment = document.createDocumentFragment();
    const stock = Stock.getProductStock(index);

    stock.forEach((product, i) => {
      const link = document.createElement("a");
      link.className = product > 0 ? "plus" : "minus";
      link.href = "#";
      link.textContent = product;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        Stock.removeItem(index, i);
      });

      fragment.appendChild(link);
    });

    const handleModal = () => {
      ButtonController.toggleButtonVisibility(deleteBtn, stock.length);
      form.innerHTML = "";

      if (stock.length) {
        form.appendChild(fragment);
      } else {
        const message = document.createElement("span");
        message.className = "col-2";
        message.textContent =
          "Não há nenhum item cadastrado para este produto.";
        form.appendChild(message);
      }
    };

    const options = {
      id: "list-item",
      title: `${id} → ${name}`,
    };

    Modal.open(options, handleModal);
  },

  showCreateWindow() {
    const renderCategoryOptions = () => {
      const categories = Stock.getCategories();
      return categories
        .map((category) => `<option value="${category}">${category}</option>`)
        .join("");
    };

    const renderCategoryField = () => {
      return ButtonController.isEditModeEnabled()
        ? `<input type="text" name="category" id="category" class="col-2" placeholder="Categoria">`
        : `<select class="col-2" name="category" id="category">
            <option value="" selected disabled>Categoria</option>
            ${renderCategoryOptions()}
          </select>`;
    };

    const renderForm = () => {
      return `
        <input type="text" id="id" inputmode="numeric" placeholder="Código" autocomplete="off">
        <input type="text" id="name" placeholder="Nome do Produto" autocomplete="off">
        ${renderCategoryField()}
        <button id="btn-register" class="btn btn-4">Cadastrar Produto</button>
      `;
    };

    const attachListeners = () => {
      document
        .getElementById("btn-register")
        .addEventListener("click", () => Stock.newProduct());
    };

    const handleModal = () => {
      ButtonController.toggleButtonVisibility(editBtn, true);

      form.innerHTML = renderForm();
      attachListeners();
    };

    const options = {
      id: "add-item",
      title: "Cadastrar Produto",
    };

    Modal.open(options, handleModal);
  },

  showInsertWindow(index) {
    const { id, name } = Stock.getItemDetails(index);

    const renderInsertForm = () => {
      return `
      <input class="col-2" id="${index}" type="text" inputmode="numeric" autocomplete="off">
      <button id="add-one" class="btn btn-1">Adicionar um item</button>
      <button id="add-multiple" class="btn btn-2">Adicionar múltiplos</button>
    `;
    };

    const attachListeners = () => {
      document
        .getElementById("add-one")
        .addEventListener("click", () => Stock.insertItem(index, true));
      document
        .getElementById("add-multiple")
        .addEventListener("click", () => Stock.insertItem(index, false));
    };

    const handleModal = () => {
      form.innerHTML = renderInsertForm();
      attachListeners();
      document.getElementById(index).focus();
    };

    const options = {
      id: "default",
      title: `${id} → ${name}`,
    };

    Modal.open(options, handleModal);
  },

  updateList() {
    table.innerHTML = "";

    const fragment = document.createDocumentFragment();
    const products = Products.all;
    const categories = Stock.getCategories();

    const createCategoryHeader = (category) => {
      const header = document.createElement("tr");
      header.innerHTML = `<th colspan="4">${category}</th>`;

      const categoryLength = products.filter(
        (product) => product.category === category
      ).length;
      if (categoryLength >= 12) {
        header.classList.add("page-break");
      }
      return header;
    };

    const createProductRow = ({ id, name }, index) => {
      const line = document.createElement("tr");
      const stock = Stock.getTotalStock(index);
      line.id = `item-${index}`;
      // if (!stock) {
      //   line.className = "no-print";
      // }
      line.innerHTML = `
        <td align="center">${id}</td>
        <td>
        <a href="#" class="link edit-product">${name}</a>
      </td>
        <td>
          <a href="#" class="link stock">${stock}</a>
        </td>
        <td class="no-print">
          <a href="#" class="btn btn-table btn-1">+</a>
        </td>`;

      const product = line.querySelector(".link.edit-product");
      const item = line.querySelector(".link.stock");
      const btn = line.querySelector(".btn-table");

      product.addEventListener("click", (e) => {
        e.preventDefault();
        DOM.showEditProduct(index);
      });
      item.addEventListener("click", (e) => {
        e.preventDefault();
        DOM.showRegisteredItens(index);
      });
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        DOM.showInsertWindow(index);
      });
      return line;
    };

    categories.forEach((category) => {
      const header = createCategoryHeader(category);
      fragment.appendChild(header);

      products.forEach((product, index) => {
        if (product.category === category) {
          const line = createProductRow(product, index);
          fragment.appendChild(line);
        }
      });
    });

    table.append(fragment);
  },
};
