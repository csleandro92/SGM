import { Product, Products } from "./Product.js";
import { ButtonController, DOM, Modal } from "./DOM.js";
import { App } from "./App.js";

export const Stock = {
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
    if (ButtonController.isDeleteModeEnabled()) {
      const product = Products.all[index].stock;
      product.splice(i, 1);
      App.reload();
      DOM.showRegisteredItens(index);
    }
  },
};
