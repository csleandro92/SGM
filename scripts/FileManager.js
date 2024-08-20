import { Products } from "./Product.js";
import { Balance } from "./Balance.js";
import { App } from "./App.js";

function readFile(file, encoding) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const { result } = reader;
        resolve(result);
      } catch (error) {
        reject("Formato de dados inválido.");
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file, encoding);
  });
}

function processJSONFile(file) {
  const parseData = (result) => {
    const data = JSON.parse(result);
    if (Array.isArray(data)) {
      Products.all = [...data];
      App.reload();
    } else {
      throw new Error("Formato de dados inválido.");
    }
  };

  readFile(file, "UTF-8").then(parseData);
}

function processCSVFile(file) {
  const parseData = (result) => {
    const data = Balance.clearCSVFile(result);
    Balance.all = data;
    App.reload()
  };

  readFile(file, "ISO-8859-1").then(parseData);
}

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
    if (file) {
      if (file.type === "application/json") {
        processJSONFile(file);
      } else if (file.type === "text/csv") {
        processCSVFile(file);
      }
    }
  },
  download() {
    const filename = FileManager.formatFileName();

    const data = JSON.stringify(Products.all, null, 2);
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
