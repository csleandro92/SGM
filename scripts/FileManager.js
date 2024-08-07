import { Products } from "./Product.js";
import { App } from "./App.js";

export const FileManager = {
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

    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (Array.isArray(data)) {
            Products.all = [...data];
            App.reload();
          } else {
            throw new Error("Formato de dados inválido.");
          }
        } catch (e) {
          console.error(e);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Por favor, selecione um arquivo JSON válido.");
    }
  },
  download(e) {
    e.preventDefault();

    const filename = FileManager.formatFileName();

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
