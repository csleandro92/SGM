import { ButtonController, DOM, Modal } from "./DOM.js";
import { FileManager } from "./FileManager.js";
import { Products } from "./Product.js";

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
        }
        break;
      case "#save":
        print();
        break;
      default:
        break;
    }
  },

  init() {
    document.addEventListener("DOMContentLoaded", async () => {
      if (window.location.pathname === "/open-file") {
        if ("launchQueue" in window) {
          window.launchQueue.seConsumer(async (launchParams) => {
            if (!launchParams.files.length) {
              return;
            }
          });
        }

        for (const fileHandle of launchParams.files) {
          const file = await fileHandle.getFile();

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const contents = event.target.result;
              const data = JSON.parse(contents);
              console.log("Dados Importados", data);
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
        }
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
      const links = document.querySelectorAll("a[href^='#']");
      links.forEach((link) => {
        link.addEventListener("click", (e) => e.preventDefault());
      });
    });

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
    deleteBtn.addEventListener("click", () => {
      ButtonController.setDeleteMode(!ButtonController.isDeleteModeEnabled());
    });

    const editBtn = document.querySelector(".modal-edit");
    editBtn.addEventListener("click", () => {
      ButtonController.setEditMode(!ButtonController.isEditModeEnabled());
      DOM.showCreateWindow();
    });

    upload.addEventListener("change", FileManager.upload);
    download.addEventListener("click", FileManager.download);

    const addItemBtn = document.getElementById("add-item-btn");
    addItemBtn.addEventListener("click", DOM.showCreateWindow);
  },
};
