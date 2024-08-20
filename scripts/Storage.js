export const Storage = {
  get(database) {
    return JSON.parse(localStorage.getItem(database)) || [];
  },
  set(database, tb_products) {
    localStorage.setItem(database, JSON.stringify(tb_products));
  },
};
