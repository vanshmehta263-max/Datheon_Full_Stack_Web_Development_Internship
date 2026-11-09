
/* ==========================================
   SHOPSPHERE
   E-COMMERCE SHOPPING APPLICATION
========================================== */

// 1. API CONFIGURATION

const API_URL = "https://fakestoreapi.com/products";


// 2. APPLICATION STATE

let products = [];

let cart = loadCart();

let activeCategory = "all";

let searchQuery = "";

let sortType = "default";


// 3. HTML ELEMENTS

const productGrid = document.getElementById("product-grid");

const loader = document.getElementById("loader");

const errorMessage = document.getElementById("error-message");

const productCount = document.getElementById("product-count");

const searchInput = document.getElementById("search-input");

const sortSelect = document.getElementById("sort-products");

const cartDrawer = document.getElementById("cart-drawer");

const cartOverlay = document.getElementById("cart-overlay");

const cartItems = document.getElementById("cart-items");

const cartCount = document.getElementById("cart-count");

const checkoutButton = document.getElementById("checkout-btn");


// 4. CURRENCY FORMAT

function formatPrice(price) {

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(price);

}


// 5. LOAD CART FROM LOCAL STORAGE

function loadCart() {

    try {

        const savedCart = JSON.parse(
            localStorage.getItem("shopsphere-cart")
        );

        if (!Array.isArray(savedCart)) return [];

        return savedCart.filter(item =>
            Number.isInteger(item.id) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            Number.isFinite(item.price) &&
            item.price >= 0 &&
            typeof item.title === "string" &&
            typeof item.image === "string"
        );

    }

    catch (error) {

        console.error("Unable to load saved cart:", error);

        return [];

    }

}


// 6. SAVE CART

function saveCart() {

    localStorage.setItem(
        "shopsphere-cart",
        JSON.stringify(cart)
    );

}


// 7. FETCH PRODUCTS FROM API

async function fetchProducts() {

    loader.hidden = false;

    errorMessage.hidden = true;

    productGrid.innerHTML = "";

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Product API request failed.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid product data.");
        }

        products = data;

        loader.hidden = true;
        const addButton = document.createElement("button");

        addButton.className = "add-cart";

        addButton.innerHTML = "🛒 Add to Cart";

        addButton.addEventListener("click", function () {
            addToCart(product.id);
        });

        renderProducts();

        updateCart();

    }

    catch (error) {

        console.error(error);

        loader.hidden = true;

        errorMessage.hidden = false;

        productCount.textContent = "Products unavailable";

    }

}


// 8. RENDER PRODUCTS

function renderProducts() {

    productGrid.innerHTML = "";

    let filteredProducts = [...products];

    // Category filter

    if (activeCategory !== "all") {

        filteredProducts = filteredProducts.filter(product =>
            product.category.toLowerCase() ===
            activeCategory.toLowerCase()
        );

    }

    // Search filter

    if (searchQuery) {

        filteredProducts = filteredProducts.filter(product =>

            product.title.toLowerCase().includes(searchQuery) ||

            product.category.toLowerCase().includes(searchQuery) ||

            product.description.toLowerCase().includes(searchQuery)

        );

    }

    // Sorting

    if (sortType === "low") {

        filteredProducts.sort((a, b) => a.price - b.price);

    }

    else if (sortType === "high") {

        filteredProducts.sort((a, b) => b.price - a.price);

    }

    else if (sortType === "rating") {

        filteredProducts.sort(
            (a, b) => b.rating.rate - a.rating.rate
        );

    }

    // Update count

    productCount.textContent =
        `Showing ${filteredProducts.length} products`;

    // Empty results

    if (filteredProducts.length === 0) {

        const empty = document.createElement("div");

        empty.className = "no-products";

        empty.textContent =
            "No products found. Try another search.";

        productGrid.appendChild(empty);

        return;

    }

    // Create product cards

    filteredProducts.forEach(product => {

        const card = document.createElement("article");

        card.className = "product-card";

        // Image container

        const imageContainer = document.createElement("div");

        imageContainer.className = "product-image";

        const image = document.createElement("img");

        image.src = product.image;

        image.alt = product.title;

        image.loading = "lazy";

        image.onerror = function () {
            this.style.display = "none";
        };

        const badge = document.createElement("span");

        badge.className = "product-badge";

        badge.textContent = "POPULAR";

        imageContainer.append(image, badge);

        // Product information

        const info = document.createElement("div");

        info.className = "product-info";

        const category = document.createElement("span");

        category.className = "product-category";

        category.textContent = product.category;

        const title = document.createElement("h3");

        title.textContent = product.title;

        const rating = document.createElement("div");

        rating.className = "product-rating";

        const stars = Number(product.rating.rate);

        rating.textContent =
            `★ ${stars.toFixed(1)} | ${product.rating.count} reviews`;

        const bottom = document.createElement("div");

        bottom.className = "product-bottom";

        const price = document.createElement("strong");

        price.className = "product-price";

        price.textContent = formatPrice(product.price);

        const addButton = document.createElement("button");

        addButton.className = "add-cart";

        addButton.textContent = "+ Add";

        addButton.addEventListener("click", function () {

            addToCart(product.id);

        });

        bottom.append(price, addButton);

        info.append(category, title, rating, bottom);

        card.append(imageContainer, info);

        productGrid.appendChild(card);

    });

}


// 9. CATEGORY FILTERS

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", function () {

        document.querySelectorAll(".filter-btn").forEach(btn => {

            btn.classList.remove("active");

        });

        this.classList.add("active");

        activeCategory = this.dataset.category;

        renderProducts();

    });

});


// 10. PRODUCT SEARCH

searchInput.addEventListener("input", function () {

    searchQuery = this.value.toLowerCase().trim();

    renderProducts();

});


// 11. PRODUCT SORTING

sortSelect.addEventListener("change", function () {

    sortType = this.value;

    renderProducts();

});


// 12. ADD TO CART

function addToCart(productId) {

    const product = products.find(item =>
        item.id === productId
    );

    if (!product) return;

    const existingItem = cart.find(item =>
        item.id === productId
    );

    if (existingItem) {

        existingItem.quantity++;

    }

    else {

        cart.push({

            id: product.id,

            title: product.title,

            price: product.price,

            image: product.image,

            quantity: 1

        });

    }

    saveCart();

    updateCart();

    openCart();

}


// 13. CHANGE QUANTITY

function changeQuantity(productId, change) {

    const item = cart.find(item =>
        item.id === productId
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;

    }

    saveCart();

    updateCart();

}


// 14. REMOVE PRODUCT

function removeFromCart(productId) {

    cart = cart.filter(item =>
        item.id !== productId
    );

    saveCart();

    updateCart();

}


// 15. UPDATE CART

function updateCart() {

    cartItems.innerHTML = "";

    // Total quantity

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartCount.textContent = totalItems;

    document.getElementById("cart-items-label").textContent =
        `${totalItems} items`;

    // Empty cart

    if (cart.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-cart";

        const icon = document.createElement("span");

        icon.textContent = "🛒";

        const heading = document.createElement("h3");

        heading.textContent = "Your cart is empty";

        const paragraph = document.createElement("p");

        paragraph.textContent =
            "Add some products to get started.";

        empty.append(icon, heading, paragraph);

        cartItems.appendChild(empty);

    }

    // Cart products

    cart.forEach(item => {

        const row = document.createElement("div");

        row.className = "cart-item";

        const image = document.createElement("img");

        image.src = item.image;

        image.alt = item.title;

        const info = document.createElement("div");

        info.className = "cart-item-info";

        const title = document.createElement("h4");

        title.textContent = item.title;

        const price = document.createElement("strong");

        price.textContent =
            formatPrice(item.price * item.quantity);

        // Quantity controls

        const controls = document.createElement("div");

        controls.className = "quantity-controls";

        const minus = document.createElement("button");

        minus.textContent = "−";

        minus.setAttribute("aria-label", "Decrease quantity");

        minus.addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("span");

        quantity.textContent = item.quantity;

        const plus = document.createElement("button");

        plus.textContent = "+";

        plus.setAttribute("aria-label", "Increase quantity");

        plus.addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        controls.append(minus, quantity, plus);

        const remove = document.createElement("button");

        remove.className = "remove-item";

        remove.textContent = "Remove";

        remove.addEventListener("click", () => {
            removeFromCart(item.id);
        });

        info.append(title, price, controls, remove);

        row.append(image, info);

        cartItems.appendChild(row);

    });

    // Calculate bill

    calculateTotal();

}


// 16. CALCULATE SUBTOTAL, TAX AND SHIPPING

function calculateTotal() {

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const tax = subtotal * 0.05;

    const shipping = subtotal === 0 || subtotal >= 100
        ? 0
        : 5;

    const total = subtotal + tax + shipping;

    document.getElementById("subtotal").textContent =
        formatPrice(subtotal);

    document.getElementById("tax").textContent =
        formatPrice(tax);

    document.getElementById("shipping").textContent =
        shipping === 0 && subtotal > 0
            ? "FREE"
            : formatPrice(shipping);

    document.getElementById("total").textContent =
        formatPrice(total);

    checkoutButton.disabled = cart.length === 0;

    checkoutButton.textContent = cart.length === 0
        ? "Your Cart Is Empty"
        : "Proceed to Checkout →";

}


// 17. OPEN CART

function openCart() {

    cartDrawer.classList.add("open");

    cartOverlay.classList.add("open");

    document.body.style.overflow = "hidden";

}


// 18. CLOSE CART

function closeCart() {

    cartDrawer.classList.remove("open");

    cartOverlay.classList.remove("open");

    document.body.style.overflow = "";

}


// Cart button

document.getElementById("open-cart")
    .addEventListener("click", openCart);


// Close button

document.getElementById("close-cart")
    .addEventListener("click", closeCart);


// Overlay click

cartOverlay.addEventListener("click", closeCart);


// 19. CHECKOUT

checkoutButton.addEventListener("click", function () {

    if (cart.length === 0) return;

    const totalText =
        document.getElementById("total").textContent;

    const orderNumber =
        "SS-" + Date.now().toString().slice(-8);

    document.getElementById("order-id").textContent =
        orderNumber;

    document.getElementById("order-total").textContent =
        totalText;

    // Clear cart

    cart = [];

    saveCart();

    updateCart();

    closeCart();

    // Show confirmation

    document.getElementById("checkout-modal")
        .classList.add("show");

});


// 20. CLOSE CHECKOUT MODAL

function closeModal() {

    document.getElementById("checkout-modal")
        .classList.remove("show");

}

document.getElementById("close-modal")
    .addEventListener("click", closeModal);


document.getElementById("continue-shopping")
    .addEventListener("click", closeModal);


// Close modal when clicking outside

document.getElementById("checkout-modal")
    .addEventListener("click", function (event) {

        if (event.target === this) {
            closeModal();
        }

    });


// 21. RETRY API

document.getElementById("retry-btn")
    .addEventListener("click", fetchProducts);


// 22. FOOTER YEAR

document.getElementById("year").textContent =
    new Date().getFullYear();


// 23. INITIALIZE APPLICATION

updateCart();

fetchProducts();
