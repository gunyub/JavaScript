// Global variables
let draggingMenu = null; // 드래그 중인 메뉴
let totalPrice = 0; // 총액
let salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || []; // 판매 기록
let currentMenuStorage = JSON.parse(localStorage.getItem("currentMenuStorage")) || [
    { name: "밀면", price: 7000, image: "./image/Wheat_Noodles.jpg" },
    { name: "밀면 곱빼기", price: 8000, image: "./image/doubleWheatNodkes.jpeg" },
    { name: "비빔밀면", price: 7000, image: "./image/bibim_Noodles.jpg" },
    { name: "비빔밀면 곱빼기", price: 8000, image: "./image/doubleBibimNodels.png" },
];

// Save menu to localStorage
function saveCurrentMenu() {
    localStorage.setItem("currentMenuStorage", JSON.stringify(currentMenuStorage));
}

// Render menu in the main page
function renderMenu() {
    const menuContainer = document.getElementById("menu");
    if (!menuContainer) return; // menuContainer가 없는 경우 처리

    menuContainer.innerHTML = "";
    const menuData = JSON.parse(localStorage.getItem("currentMenuStorage")) || [];

    menuData.forEach(menu => {
        const menuItem = document.createElement("div");
        menuItem.className = "menu";
        menuItem.setAttribute("menuname", menu.name);
        menuItem.setAttribute("price", menu.price);
        menuItem.setAttribute("draggable", "true");
        menuItem.innerHTML = `
            <img src="${menu.image}" alt="${menu.name}">
            <p>${menu.name}</p>
            <p>${menu.price}원</p>
        `;

        menuItem.addEventListener("dragstart", onDragStartMenu);
        menuItem.addEventListener("dragend", onDragEndMenu);
        menuContainer.appendChild(menuItem);
    });
}

// Drag and Drop Event Handlers
function onDragStartMenu(event) {
    draggingMenu = this;
    this.classList.add("draggingMenu");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", this.getAttribute("menuname"));
}

function onDragEndMenu(event) {
    draggingMenu = null;
    this.classList.remove("draggingMenu");
}

function onDragOverBox(event) {
    event.preventDefault();
}

function onDropBox(event) {
    event.preventDefault();
    const targetBox = this;

    if (draggingMenu) {
        const menuName = draggingMenu.getAttribute("menuname");
        const menuPrice = parseInt(draggingMenu.getAttribute("price"), 10);

        if (targetBox.id === "cart-container") {
            const existingItem = targetBox.querySelector(`.cart-item[menuname="${menuName}"]`);
            if (existingItem) return;

            const clonedMenu = draggingMenu.cloneNode(true);
            clonedMenu.setAttribute("draggable", "true");
            clonedMenu.classList.remove("draggingMenu");
            clonedMenu.classList.add("cart-item");

            const controls = document.createElement("div");
            controls.className = "cart-controls";
            controls.innerHTML = `
                <button class="decrease">-</button>
                <span class="quantity">1</span>
                <button class="increase">+</button>
                <p>소계: <span class="subtotal">${menuPrice}</span>원</p>
            `;
            clonedMenu.appendChild(controls);

            addCartEvents(clonedMenu, menuPrice);
            targetBox.querySelector("#cart").appendChild(clonedMenu);

            draggingMenu.style.display = "none";
            updateTotal(menuPrice);
        } else if (targetBox.id === "menu-container") {
            const cartItem = document.querySelector(`.cart-item[menuname="${menuName}"]`);
            if (cartItem) {
                const quantity = parseInt(cartItem.querySelector(".quantity").textContent, 10);
                updateTotal(-menuPrice * quantity);
                cartItem.remove();
            }

            const menuItem = document.querySelector(`.menu[menuname="${menuName}"]`);
            if (menuItem) {
                menuItem.style.display = "block";
            }
        }
    }
}

// Utility Functions
function updateTotal(priceChange) {
    totalPrice += priceChange;
    document.getElementById("total-price").textContent = totalPrice;
}

function addCartEvents(cartItem, menuPrice) {
    cartItem.addEventListener("dragstart", onDragStartMenu);
    cartItem.addEventListener("dragend", onDragEndMenu);

    cartItem.querySelector(".increase").addEventListener("click", () => {
        const quantity = cartItem.querySelector(".quantity");
        const subtotal = cartItem.querySelector(".subtotal");
        const count = parseInt(quantity.textContent, 10) + 1;
        quantity.textContent = count;
        subtotal.textContent = count * menuPrice;
        updateTotal(menuPrice);
    });

    cartItem.querySelector(".decrease").addEventListener("click", () => {
        const quantity = cartItem.querySelector(".quantity");
        const subtotal = cartItem.querySelector(".subtotal");
        const count = parseInt(quantity.textContent, 10) - 1;
        if (count > 0) {
            quantity.textContent = count;
            subtotal.textContent = count * menuPrice;
            updateTotal(-menuPrice);
        } else {
            const menuName = cartItem.getAttribute("menuname");
            const menuItem = document.querySelector(`.menu[menuname="${menuName}"]`);
            if (menuItem) {
                menuItem.style.display = "block";
            }
            cartItem.remove();
            updateTotal(-menuPrice);
        }
    });
}

// Save sales to history
function saveSalesToHistory(cartItems) {
    const date = new Date().toLocaleString();
    const sale = {
        date,
        items: [],
        total: totalPrice,
    };

    cartItems.forEach(item => {
        const name = item.getAttribute("menuname");
        const quantity = parseInt(item.querySelector(".quantity").textContent, 10);
        const price = parseInt(item.getAttribute("price"), 10);
        const subtotal = price * quantity;

        sale.items.push({ name, quantity, subtotal });
    });

    salesHistory.push(sale);
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
}

// Display Receipt
function displayReceipt() {
    const cartItems = document.querySelectorAll(".cart-item");
    if (cartItems.length === 0) {
        alert("장바구니가 비어 있습니다.");
        return;
    }

    let receiptText = "=== 영수증 ===\n";
    let total = 0;

    cartItems.forEach(item => {
        const name = item.getAttribute("menuname");
        const quantity = parseInt(item.querySelector(".quantity").textContent, 10);
        const price = parseInt(item.getAttribute("price"), 10);
        const subtotal = price * quantity;

        receiptText += `${name} x ${quantity} = ${subtotal}원\n`;
        total += subtotal;
    });

    receiptText += `\n총액: ${total}원\n\n결제 완료!`;
    alert(receiptText);

    saveSalesToHistory(cartItems);
    resetCartAndMenu();
    location.reload();
}

// Reset Cart and Menu
function resetCartAndMenu() {
    const cartItems = document.querySelectorAll(".cart-item");
    cartItems.forEach(item => {
        const menuName = item.getAttribute("menuname");
        const menuItem = document.querySelector(`.menu[menuname="${menuName}"]`);
        if (menuItem) {
            menuItem.style.display = "block";
        }
    });

    document.getElementById("cart").innerHTML = "";
    totalPrice = 0;
    document.getElementById("total-price").textContent = totalPrice;
}

// Admin Page Handlers
function openAdminPage() {
    window.location.href = "admin.html";
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("currentMenuStorage")) {
        saveCurrentMenu();
    }
    renderMenu();

    const boxes = document.querySelectorAll(".box");
    boxes.forEach(box => {
        box.addEventListener("dragover", onDragOverBox);
        box.addEventListener("drop", onDropBox);
    });

    document.getElementById("pay-button").addEventListener("click", displayReceipt);
    const adminButton = document.getElementById("admin-button");
    if (adminButton) {
        adminButton.addEventListener("click", openAdminPage);
    }
});
