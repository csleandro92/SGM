import { Storage } from './Storage.js'
import { FileManager } from './FileManager.js';
import { App } from './App.js';

export class Product {
  constructor(id, name, category, stock = []) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.stock = stock;
  }
}

export const Products = {
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
