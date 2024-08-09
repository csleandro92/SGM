import { Products } from "./Product.js";
import { ButtonController, DOM, Modal } from "./DOM.js";
import { App } from "./App.js";

function getProductDetails() {
  const { value: idValue } = document.getElementById("id");
  const { value: nameValue } = document.getElementById("name");
  const { value: categoryValue } = document.getElementById("category");

  const id = Number.parseInt(idValue);
  const name = nameValue.trim().toLowerCase();
  const category = categoryValue.trim();

  return { id, name, category };
}

function validateProduct({ id, name, category }) {
  if (!id || !name || !category) {
    alert("Preencha todos os campos corretamente!");
    return false;
  }
  return true;
}

function addOrUpdateProduct(product, index = null) {
  if (index !== null) {
    Products.edit(index, product);
  } else {
    Products.insert(product);
  }

  App.reload();
  Modal.close();
}

function handleInvalidInput(element) {
  alert("Digite um valor válido!");
  element.value = "";
  element.focus();
}

export const Stock = {
  getProductStock(index) {
    return Products.all[index].stock;
  },
  getTotalStock(index) {
    const total = this.getProductStock(index).reduce(
      (acc, next) => acc + next,
      0
    );
    return total ? Number(total.toFixed(3)) : total;
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
    const { id, name, category } = getProductDetails();
    if (!validateProduct({ id, name, category })) {
      return;
    }

    const productExists = Products.all.some(
      (product) => product.id === id || product.name === name
    );
    if (productExists) {
      alert("Este produto já está cadastrado!");
      return;
    }

    const product = { id, name, category };
    addOrUpdateProduct(product);
  },
  editProductDetails(index) {
    const { id, name, category } = getProductDetails();
    const stock = Stock.getProductStock(index);

    if (!validateProduct({ id, name, category })) {
      return;
    }

    const updatedProduct = { id, name, category, stock };
    addOrUpdateProduct(updatedProduct, index);
  },

  insertItem(index, closeWindow) {
    const item = document.getElementById(index);
    const input = Number.parseFloat(item.value.replace(",", "."));

    if (isNaN(input)) {
      handleInvalidInput(item);
      return;
    }

    this.getProductStock(index).push(input);

    if (!closeWindow) {
      DOM.showInsertWindow(index);
    } else {
      Modal.close();
    }

    App.reload();
  },
  removeItem(index, i) {
    if (!ButtonController.isDeleteModeEnabled()) {
      // alert('O modo de exclusão está desativado!')
      return;
    }

    const product = this.getProductStock(index);
    product.splice(i, 1);
    App.reload();
    DOM.showRegisteredItens(index);
  },
};
