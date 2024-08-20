import { Storage } from "./Storage.js";
import { FileManager } from "./FileManager.js";
import { App } from "./App.js";

export const PRODUCT_DB = "tb_products";

class Product {
  constructor(id, name, category, stock = []) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.stock = stock;
  }
}

export const Products = {
  all: Storage.get(PRODUCT_DB),

  save(data) {
    Storage.set(PRODUCT_DB, data);
  },

  insert(product) {
    const { id, name, category, stock } = product;
    Products.all.push(new Product(id, name, category, stock));
  },
  edit(index, product) {
    const { id, name, category, stock } = product;
    Products.all.splice(index, 1, new Product(id, name, category, stock));
  },

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
