import { Products } from "./Product.js";
import { Balance } from "./Balance.js";
import { App } from "./App.js";

function generateFileName() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const invertedDate = `${year}${month}${day}`;
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${invertedDate}-${hours}${minutes}`;
}

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

function handleJSONFile(file) {
  const parseJSONData = (result) => {
    const data = JSON.parse(result);
    if (Array.isArray(data)) {
      Products.all = [...data];
      App.reload();
    } else {
      throw new Error("Formato de dados inválido.");
    }
  };

  readFile(file, "UTF-8").then(parseJSONData);
}

function handleCSVFile(file) {
  const parseCSVData = (result) => {
    const data = Balance.clearCSVFile(result);
    Balance.all = data;
    App.reload();
  };

  readFile(file, "ISO-8859-1").then(parseCSVData);
}

export const FileManager = {
  async parseData(filename) {
    const res = await fetch(filename);
    return res.json();
  },

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === "application/json") {
      handleJSONFile(file);
    } else if (file.type === "text/csv") {
      handleCSVFile(file);
    }
  },
  
  downloadFileData() {
    const filename = generateFileName();

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
