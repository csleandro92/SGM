import { DOM } from "./DOM.js";
import { Listeners } from "./Listener.js";
import { Products } from "./Product.js";
import { Balance } from "./Balance.js";

const { pathname } = window.location;
const homepage = pathname === "/" || pathname === "/index.html";

export const App = {
  init() {
    if (homepage) {
      Listeners.attachHomeListeners();
      console.log(window.location.href);

      DOM.updateList();
    } else {
      // Listeners.attachBalanceListeners();
      Balance.updateBalance();
    }
    
    Listeners.initListeners()
  },

  reload() {
    if (homepage) {
      Products.sortProducts(Products.all);
      Products.save(Products.all);

      DOM.updateList();
    } else {
      Balance.save(Balance.all);
      Balance.updateBalance();
    }
  },
};
