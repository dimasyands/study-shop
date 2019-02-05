class Cart {
  constructor() {
    const json = localStorage.getItem('__cart__');
    this.products = (json === null) ? {} : JSON.parse(json);
  }

  getProducts() {
    return Object.values(this.products);
  }

  getProduct(productId) {
    return this.products[productId];
  }

  updateProduct(product) {
    this.products[product.id] = product;
    localStorage.setItem('__cart__', JSON.stringify(this.products));
  }

  addToCart(product) {
    product = this.products[product.id] || product;
    product.amount = product.amount ? product.amount + 1 : 1;
    this.updateProduct(product);
    return product;
  }

  deleteFromCart(product) {
    product = this.products[product.id] || product;
    product.amount = product.amount && product.amount > 0 ? product.amount - 1 : 0;
    this.updateProduct(product);
    return product;
  }

  clear() {
    this.products = {};
    localStorage.setItem('__cart__', JSON.stringify(this.products));
  }

  clearItem(product) {
    delete this.products[product.id];
    localStorage.setItem('__cart__', JSON.stringify(this.products));
  }
}

let data = undefined;
let isContentLoaded = false;

loadData();

document.addEventListener("DOMContentLoaded", () => {
  isContentLoaded = true;
  if (data) {
    render();() => {
      this.products = {};
    }
  }
});

const cart = new Cart();

function loadData() {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'data.json', true);

  xhr.onload = () => {
    if (xhr.status != 200) {
      alert( xhr.status + ': ' + xhr.statusText );
    } else {
      data = JSON.parse(xhr.responseText);
      if (isContentLoaded) {
        render();
      }
    }
  };

  xhr.send();
}

function render() {
  if (document.querySelector('.main-item-list-wrapper')) {
    renderCategory();
  }
  if (document.querySelector('.item-list-wrapper')) {
    renderProductList();
  }
  if (document.querySelector('.cart-wrapper')) {
  renderCart()
  }
}

function renderCategory() {
  const categoryList = document.querySelector('.main-item-list');
  const template = document.querySelector('#categoryTemplate').content;

  for (const category of data) {
    const link = template.querySelector('.main-item-href');
    const categoryTitle = template.querySelector('#categoryTitle');
    const categoryImg = template.querySelector('#categoryImg');

    categoryTitle.textContent = category.title;
    categoryImg.src = category.image;
    link.href = "items.html?id=" + category.id;
    document.getElementById('summAll').textContent = '$' + calculateCartPrice();

    categoryList.appendChild(document.importNode(template, true));
  }
}

function renderProductList() {
  const categoryId = new URLSearchParams(window.location.search).get('id');
  const category = data.find(item => item.id === categoryId);

  if (!category) {
    return;
  }

  document.querySelector('.category-head').textContent = category.title;

  const productList = document.querySelector('.category-item-list');
  const _template = document.querySelector('#productTemplate').content;
  for (let product of category.products) {
    let template = document.importNode(_template, true);

    const itemTitle = template.querySelector('.item-header');
    itemTitle.textContent = product.titleId;

    const image = template.querySelector('.item-photo-src');
    image.src = product.img;

    const price = template.querySelector('.item-price');
    price.textContent = '$' + product.price;

    let amount = template.querySelector('#amount');
    amount.id = product.id;
    const cartItem = cart.getProduct(product.id);
    amount.textContent = cartItem === undefined ? 0 : cartItem.amount;

    const addButton = template.querySelector('.plus-amount');
    addButton.addEventListener("click", () => {
      product = cart.addToCart(product);
      document.getElementById(`${product.id}`).textContent = product.amount;
      document.getElementById('summAll').textContent = '$' + calculateCartPrice();
    });

    const deleteButton = template.querySelector('.minus-amount');
    deleteButton.addEventListener("click", () => {
      product = cart.deleteFromCart(product);
      document.getElementById(`${product.id}`).textContent = product.amount;
      document.getElementById('summAll').textContent = '$' + calculateCartPrice();
    });
    document.getElementById('summAll').textContent = '$' + calculateCartPrice();
    productList.appendChild(template);
  }
}

function renderCart() {
  const cartList = document.querySelector('.cart-table');
  const _template = document.querySelector('#catrTemplate').content;

  const buyButton = document.querySelector('.buy');
  buyButton.addEventListener("click", () => {
    alert ('the purchase amount is $' + calculateCartPrice());
    localStorage.removeItem("__cart__");
  });

  for (let product of cart.getProducts()) {
    let template = document.importNode(_template, true);

    const cartItemTitle = template.querySelector('.cart-item-title');
    cartItemTitle.textContent = product.titleId;

    const sumOfItem = template.querySelector('.item-summ');
    sumOfItem.textContent = '$' + calculateItemPrice(product);

    let amount = template.querySelector('#cart-amount');
    amount.id = product.id;
    const cartItem = cart.getProduct(product.id);
    amount.textContent = cartItem === undefined ? 0 : cartItem.amount;

    const addButton = template.querySelector('.cart-plus-amount');
    addButton.addEventListener("click", () => {
      product = cart.addToCart(product);
      document.getElementById(`${product.id}`).textContent = product.amount;
      document.getElementById('summAll').textContent = calculateCartPrice();
      sumOfItem.textContent = '$' + calculateItemPrice(product);
    });

    const deleteButton = template.querySelector('.cart-minus-amount');
    deleteButton.addEventListener("click", () => {
      product = cart.deleteFromCart(product);
      document.getElementById(`${product.id}`).textContent = product.amount;
      document.getElementById('summAll').textContent = calculateCartPrice();
      sumOfItem.textContent = '$' + calculateItemPrice(product);
    });

    const clearItemButton = template.querySelector('.cart-delete-item');
    const cartItemRow = template.querySelector(".cart-item-row");
    cartItemRow.id = 'row' + product.id;
    clearItemButton.addEventListener("click", () => {
      document.getElementById(`row${product.id}`).remove();
      cart.clearItem(product);
      document.getElementById('summAll').textContent = calculateCartPrice();
    });

    document.getElementById('summAll').textContent = calculateCartPrice()
    cartList.insertBefore(template, cartList.childNodes[3]);
  }

  const clearAllButton = document.querySelector('.cart-clear');
  clearAllButton.addEventListener("click", () => {
    cart.clear();
    const cartItems = document.getElementsByClassName("cart-item-row");
    let k = cartItems.length - 1;
    while (k >= 0) {
      cartItems[k].remove();
      --k;
    }
    document.getElementById('summAll').textContent = calculateCartPrice()
  });
}

function calculateCartPrice() {
  return cart.getProducts().reduce((sum, product) => sum + product.amount * product.price, 0);
}

function calculateItemPrice(product) {
  return product.amount * product.price;
}
