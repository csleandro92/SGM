import { Products } from "./Product.js";
import { Storage } from "./Storage.js";

const BALANCE_DATABASE = "tb_balance";

export const Balance = {
  all: Storage.get(BALANCE_DATABASE),

  save() {
    Storage.set(BALANCE_DATABASE, Balance.all);
  },

  reset() {
    Balance.all = []
    Balance.save()
  },

  clearCSVFile(data) {
    const removeCarriageReturn = (line) => line.replace(/\r/g, "");
    const lines = data.split("\n").map(removeCarriageReturn);
    const group = lines[3].split(";").filter(Boolean)[1];

    lines.splice(0, 5);
    lines.splice(-4);

    const total = lines.pop().split(";").filter(Boolean);
    
    const header = lines.shift().split(";");

    const parsedObject = (line) => {
      const values = line.split(";");
      return values.reduce((obj, valor, indice) => {
        obj[header[indice]] = valor;
        return obj;
      }, {});
    }
    
    const finalContent = (item) => {
      const id = parseInt(item["Código"]);
      const saldo = parseFloat(item["Saldo"].replace(",", "."));
      const custo = parseFloat(item["Custo"].replace(",", ".")).toFixed(2);
      return { id, saldo, custo };
    }

    const content = lines.map(parsedObject).map(finalContent);

    return { group, content, total };
  },

  parseContent() {
    const { group, content } = Balance.all;
    const products = Products.all;

    const updatedProduct = products
      .filter(({ category }) => category === group)
      .map((product) => {
        const existentItem = content.find((item) => item.id === product.id);
        if (existentItem) {
          const { saldo, custo } = existentItem;
          return {
            ...product,
            saldo,
            custo,
          };
        }
      });

    return updatedProduct;
  },

  updateBalance() {
    const table = document.querySelector("tbody");
    table.innerHTML = "";

    const fragment = document.createDocumentFragment();

    const item = this.parseContent().filter(Boolean);

    for (const { id, name, stock, saldo, custo } of item) {
      const totalStock = parseFloat(
        stock.reduce((acc, next) => acc + next, 0).toFixed(3)
      );
      const diferenca = parseFloat(totalStock - saldo).toFixed(3);

      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${id}</td>
      <td>${name}</td>
      <td>${totalStock}</td>
      <td>${saldo}</td>
      <td>${diferenca}</td>
      <td class="hide-mobile">${custo}</td>
      `;
      fragment.appendChild(row);
    }

    table.append(fragment);
  },
};
