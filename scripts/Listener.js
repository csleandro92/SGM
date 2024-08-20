import { ButtonController, DOM, Modal } from "./DOM.js";
import { FileManager } from "./FileManager.js";
import { Products } from "./Product.js";
import { Balance } from "./Balance.js";

export const Listeners = {
  toggleDarkMode: () => document.documentElement.classList.toggle("dark"),
  handleMenu(event) {
    const option = event.target.hash;
    switch (option) {
      case "#update":
        const message =
          "Esta ação apagará todos os dados armazenados. Deseja continuar?";
        if (confirm(message)) {
          Products.restart();
          Balance.reset();
        }
        break;
      case "#save":
        print();
        break;
      case "#balance":
        window.location = "leitura.html";
        break;
      default:
        break;
    }
  },

  initListeners() {
    title.addEventListener("click", this.toggleDarkMode);

    const theme = window.matchMedia("(prefers-color-scheme: dark)");
    const listenTheme = () => {
      document.documentElement.classList.toggle("dark", theme.matches);
    };
    window.addEventListener("load", listenTheme);
    theme.addEventListener("change", listenTheme);

    upload.addEventListener("change", FileManager.handleFileUpload);
  },

  attachHomeListeners() {
    document.addEventListener("DOMContentLoaded", () => {
      const links = document.querySelectorAll("a[href^='#']");
      links.forEach((link) => {
        link.addEventListener("click", (e) => e.preventDefault());
      });
    });

    menu.addEventListener("click", this.handleMenu);
    form.addEventListener("submit", (event) => event.preventDefault());

    const modalCloseBtn = document.getElementById("modal-close-btn");
    modalCloseBtn.addEventListener("click", Modal.close);

    const deleteBtn = document.querySelector(".modal-delete");
    deleteBtn.addEventListener("click", () => {
      ButtonController.setDeleteMode(!ButtonController.isDeleteModeEnabled());
    });

    const editBtn = document.querySelector(".modal-edit");
    editBtn.addEventListener("click", () => {
      ButtonController.setEditMode(!ButtonController.isEditModeEnabled());
      DOM.showCreateWindow();
    });

    download.addEventListener("click", FileManager.downloadFileData);

    const addItemBtn = document.getElementById("add-item-btn");
    addItemBtn.addEventListener("click", DOM.showCreateWindow);
  },
};
