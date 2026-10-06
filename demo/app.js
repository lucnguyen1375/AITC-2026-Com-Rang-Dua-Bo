"use strict";

const products = [
  { id: "mango", name: "Xoài cát Hòa Lộc", origin: "TIỀN GIANG · MIỀN TÂY", description: "Thơm dịu, ngọt đậm, thịt vàng mịn.", price: 95000, unit: "kg", image: "mango.jpg", seasonal: true, favorite: true },
  { id: "orange", name: "Cam vàng mọng nước", origin: "TRÁI NGON · VỊ THANH MÁT", description: "Tươi mọng, chua ngọt hài hòa.", price: 65000, unit: "kg", image: "orange.jpg", seasonal: true, favorite: false },
  { id: "avocado", name: "Bơ sáp Tây Nguyên", origin: "ĐẮK LẮK · TÂY NGUYÊN", description: "Dẻo béo tự nhiên, mịn từng miếng.", price: 75000, unit: "kg", image: "avocado.jpg", seasonal: true, favorite: true },
  { id: "strawberry", name: "Dâu tây Đà Lạt", origin: "LÂM ĐỒNG · CAO NGUYÊN", description: "Đỏ xinh, thơm mát, chua ngọt nhẹ.", price: 120000, unit: "hộp 500 g", image: "strawberry.jpg", seasonal: false, favorite: true },
];
const formatPrice = value => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const $ = selector => document.querySelector(selector);
const cartStorageKey = "bon-mua-demo-cart-v1";
let cart = {};
let currentFilter = "all";
let searchQuery = "";
let toastTimeout;

// Only known product IDs and bounded integer quantities are accepted from storage.
try {
  const saved = JSON.parse(localStorage.getItem(cartStorageKey) || "{}");
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    for (const product of products) {
      if (Number.isInteger(saved[product.id]) && saved[product.id] > 0) cart[product.id] = Math.min(saved[product.id], 99);
    }
  }
} catch { cart = {}; }

function notify(message) {
  clearTimeout(toastTimeout);
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  toastTimeout = setTimeout(() => { $("#toast").hidden = true; }, 3500);
}

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
}

function renderProducts() {
  const visible = products.filter(product => {
    const matchesCategory = currentFilter === "all" || product[currentFilter];
    const matchesSearch = normalize(`${product.name} ${product.origin}`).includes(normalize(searchQuery));
    return matchesCategory && matchesSearch;
  });
  $("#product-grid").innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img src="assets/${product.image}" alt="${product.name}" width="700" height="700" loading="lazy">
        <span class="product-badge ${product.seasonal ? "" : "favorite"}">${product.seasonal ? "Đang vào mùa" : "Được yêu thích"}</span>
      </div>
      <span class="product-origin">${product.origin}</span>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="product-bottom"><span class="product-price">${formatPrice(product.price)} <small>/ ${product.unit}</small></span><button class="add-button" data-add="${product.id}" aria-label="Thêm ${product.name} vào giỏ hàng"><svg class="icon" aria-hidden="true"><use href="#plus"/></svg></button></div>
    </article>`).join("");
  $("#product-count").textContent = `${visible.length} trái ngon dành cho bạn`;
  $("#empty-state").hidden = visible.length !== 0;
}

function updateCart() {
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  $("#cart-count").textContent = count > 99 ? "99+" : count;
  $("#cart-toggle").setAttribute("aria-label", `Mở giỏ hàng, ${count} sản phẩm`);
  const selected = products.filter(product => cart[product.id]);
  $("#cart-items").innerHTML = selected.length ? selected.map(product => `
    <div class="cart-item">
      <img src="assets/${product.image}" alt="${product.name}" width="66" height="66">
      <div class="cart-item-info"><strong>${product.name}</strong><small>${formatPrice(product.price)} / ${product.unit}</small></div>
      <div class="quantity-controls"><button data-quantity="${product.id}" data-change="-1" aria-label="Giảm số lượng ${product.name}">−</button><span aria-label="Số lượng">${cart[product.id]}</span><button data-quantity="${product.id}" data-change="1" aria-label="Tăng số lượng ${product.name}" ${cart[product.id] >= 99 ? "disabled" : ""}>+</button></div>
    </div>`).join("") : '<p class="cart-empty">Giỏ hàng còn trống.<br>Chọn một chút ngọt lành cho hôm nay nhé!</p>';
  $("#cart-total").textContent = formatPrice(selected.reduce((sum, product) => sum + product.price * cart[product.id], 0));
  try { localStorage.setItem(cartStorageKey, JSON.stringify(cart)); } catch { /* Cart remains usable when browser storage is unavailable. */ }
}

$("#product-grid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find(item => item.id === button.dataset.add);
  if ((cart[product.id] || 0) >= 99) { notify("Mỗi sản phẩm tối đa 99 đơn vị trong bản demo."); return; }
  cart[product.id] = (cart[product.id] || 0) + 1;
  updateCart();
  notify(`Đã thêm ${product.name} vào giỏ hàng.`);
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle("active", selected);
      filter.setAttribute("aria-pressed", selected);
    });
    renderProducts();
  });
});

const searchToggle = $("#search-toggle");
function closeSearch() {
  $("#search-panel").hidden = true;
  searchToggle.setAttribute("aria-expanded", "false");
}
searchToggle.addEventListener("click", () => {
  const willOpen = $("#search-panel").hidden;
  $("#search-panel").hidden = !willOpen;
  searchToggle.setAttribute("aria-expanded", willOpen);
  if (willOpen) { closeMenu(); $("#search-input").focus(); }
});
$("#search-panel").addEventListener("submit", event => {
  event.preventDefault();
  searchQuery = $("#search-input").value;
  renderProducts();
  closeSearch();
  $("#products").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  $(".filter.active").focus({ preventScroll: true });
});
$("#reset-search").addEventListener("click", () => {
  searchQuery = "";
  $("#search-input").value = "";
  $("[data-filter='all']").click();
  $("[data-filter='all']").focus();
});

const menuToggle = $("#menu-toggle");
function closeMenu() {
  $("#main-nav").classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Mở menu");
}
menuToggle.addEventListener("click", () => {
  const open = !$("#main-nav").classList.contains("open");
  $("#main-nav").classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  if (open) closeSearch();
});
document.querySelectorAll("#main-nav a").forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (!$("#search-panel").hidden) { closeSearch(); searchToggle.focus(); }
  if ($("#main-nav").classList.contains("open")) { closeMenu(); menuToggle.focus(); }
});
matchMedia("(min-width: 851px)").addEventListener("change", event => { if (event.matches) closeMenu(); });

const cartDialog = $("#cart-dialog");
$("#cart-toggle").addEventListener("click", () => { closeMenu(); closeSearch(); cartDialog.showModal(); });
$("#cart-close").addEventListener("click", () => cartDialog.close());
$("#continue-shopping").addEventListener("click", () => { cartDialog.close(); $("#products").scrollIntoView(); });
cartDialog.addEventListener("click", event => {
  if (event.target !== cartDialog) return;
  const bounds = cartDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) cartDialog.close();
});
$("#cart-items").addEventListener("click", event => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const id = button.dataset.quantity;
  const change = Number(button.dataset.change);
  cart[id] = Math.min(99, cart[id] + change);
  if (cart[id] <= 0) { delete cart[id]; notify("Đã xóa sản phẩm khỏi giỏ hàng."); }
  updateCart();
  // Rendering replaces the controls; restore keyboard focus to the same action.
  const nextButton = document.querySelector(`[data-quantity="${id}"][data-change="${change}"]:not(:disabled)`)
    || document.querySelector(`[data-quantity="${id}"]`)
    || $("#cart-close");
  nextButton.focus({ preventScroll: true });
});

$("#newsletter-form").addEventListener("submit", async event => {
  event.preventDefault();
  const input = $("#email");
  const message = $("#email-message");
  const button = event.currentTarget.querySelector("button");
  message.classList.remove("success");
  input.value = input.value.trim();
  if (!input.validity.valid) {
    input.setAttribute("aria-invalid", "true");
    message.textContent = "Vui lòng nhập một địa chỉ email hợp lệ.";
    input.focus();
    return;
  }
  input.removeAttribute("aria-invalid");
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  const originalContent = button.innerHTML;
  button.textContent = "Đang xử lý…";
  await new Promise(resolve => setTimeout(resolve, 650));
  message.classList.add("success");
  message.textContent = "Đã mô phỏng đăng ký thành công. Cảm ơn bạn đã ghé thăm!";
  button.innerHTML = originalContent;
  button.disabled = false;
  button.removeAttribute("aria-busy");
  input.value = "";
});
$("#email").addEventListener("input", () => {
  $("#email").removeAttribute("aria-invalid");
  $("#email-message").textContent = "";
});

renderProducts();
updateCart();
