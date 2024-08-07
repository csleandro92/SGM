import { ButtonController, DOM, Modal } from './DOM.js'
import { FileManager } from './FileManager.js'
import { Products } from './Product.js';

export const Listeners = {
  toggleDarkMode: () => document.documentElement.classList.toggle("dark"),
  handleMenu(event) {
    event.preventDefault();
    const option = event.target.hash;
    switch (option) {
      case "#update":
        const message =
          "Esta ação apagará todos os dados armazenados. Deseja continuar?";
        if (confirm(message)) {
          Products.restart();
        }
        break;
      case "#save":
        print();
        break;
      default:
        alert("Função desativada no momento.");
        break;
    }
  },

  init() {
    title.addEventListener("click", this.toggleDarkMode);

    const theme = window.matchMedia("(prefers-color-scheme: dark)");
    const listenTheme = () => {
      document.documentElement.classList.toggle("dark", theme.matches);
    };
    window.addEventListener("load", listenTheme);
    theme.addEventListener("change", listenTheme);

    menu.addEventListener("click", this.handleMenu);
    form.addEventListener("submit", (event) => event.preventDefault());

    const modalCloseBtn = document.getElementById("modal-close-btn");
    modalCloseBtn.addEventListener("click", Modal.close);

    const deleteBtn = document.querySelector(".modal-delete");
    deleteBtn.addEventListener("click", (event) => {
      event.preventDefault();
      ButtonController.setDeleteMode(!ButtonController.isDeleteModeEnabled());
    });
    
    const editBtn = document.querySelector(".modal-edit");
    editBtn.addEventListener("click", (event) => {
      event.preventDefault();
      ButtonController.setEditMode(!ButtonController.isEditModeEnabled());
      DOM.showCreateWindow();
    });

    upload.addEventListener("change", FileManager.upload);
    download.addEventListener("click", FileManager.download);

    const addItemBtn = document.getElementById("add-item-btn");
    addItemBtn.addEventListener("click", DOM.showCreateWindow);
  },
};
