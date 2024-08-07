import { DOM } from './DOM.js'
import { Listeners } from './Listener.js'
import { Products } from './Product.js';
import { Storage } from './Storage.js';

export const App = {
  init() {
    Listeners.init();
    DOM.updateList();
  },

  reload() {
    Products.sortProducts(Products.all);
    Storage.set(Products.all);

    DOM.updateList();
  },
};
