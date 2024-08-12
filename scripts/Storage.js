export const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("tb_products")) || [];
  },
  set(tb_products) {
    localStorage.setItem("tb_products", JSON.stringify(tb_products));
  },
};
