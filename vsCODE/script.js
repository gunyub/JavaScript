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

        menuItem.addEventListener("dragstart", onDragStartMenu); // 메뉴 드래그 시작 이벤트
        menuItem.addEventListener("dragend", onDragEndMenu); // 메뉴 드래그 종료 이벤트
        menuContainer.appendChild(menuItem);
    });
}

// Drag and Drop Event Handlers
function onDragStartMenu(event) {
    draggingMenu = this;
    this.classList.add("draggingMenu"); // 드래그 중인 상태 스타일 추가
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", this.getAttribute("menuname"));
}

function onDragEndMenu(event) {
    draggingMenu = null;
    this.classList.remove("draggingMenu"); // 드래그 상태 스타일 제거
}

function onDragOverBox(event) {
    event.preventDefault(); // 기본 드래그 동작 방지
}

function onDropBox(event) {
    event.preventDefault(); // 기본 드롭 동작 방지
    const targetBox = this;

    if (draggingMenu) {
        const menuName = draggingMenu.getAttribute("menuname");
        const menuPrice = parseInt(draggingMenu.getAttribute("price"), 10);

        if (targetBox.id === "cart-container") {
            // 장바구니에 추가
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

            addCartEvents(clonedMenu, menuPrice); // 장바구니 이벤트 추가
            targetBox.querySelector("#cart").appendChild(clonedMenu);

            draggingMenu.style.display = "none"; // 메뉴 숨기기
            updateTotal(menuPrice); // 총액 업데이트
        } else if (targetBox.id === "menu-container") {
            // 메뉴로 다시 이동
            const cartItem = document.querySelector(`.cart-item[menuname="${menuName}"]`);
            if (cartItem) {
                const quantity = parseInt(cartItem.querySelector(".quantity").textContent, 10);
                updateTotal(-menuPrice * quantity);
                cartItem.remove();
            }

            const menuItem = document.querySelector(`.menu[menuname="${menuName}"]`);
            if (menuItem) {
                menuItem.style.display = "block"; // 메뉴 보이기
            }
        }
    }
}

// Utility Functions
function updateTotal(priceChange) {
    totalPrice += priceChange; // 총액 변경
    document.getElementById("total-price").textContent = totalPrice; // 화면에 반영
}

function addCartEvents(cartItem, menuPrice) {
    cartItem.addEventListener("dragstart", onDragStartMenu); // 장바구니 항목 드래그 시작 이벤트
    cartItem.addEventListener("dragend", onDragEndMenu); // 장바구니 항목 드래그 종료 이벤트

    cartItem.querySelector(".increase").addEventListener("click", () => {
        const quantity = cartItem.querySelector(".quantity");
        const subtotal = cartItem.querySelector(".subtotal");
        const count = parseInt(quantity.textContent, 10) + 1;
        quantity.textContent = count;
        subtotal.textContent = count * menuPrice;
        updateTotal(menuPrice); // 증가에 따른 총액 업데이트
    });

    cartItem.querySelector(".decrease").addEventListener("click", () => {
        const quantity = cartItem.querySelector(".quantity");
        const subtotal = cartItem.querySelector(".subtotal");
        const count = parseInt(quantity.textContent, 10) - 1;
        if (count > 0) {
            quantity.textContent = count;
            subtotal.textContent = count * menuPrice;
            updateTotal(-menuPrice); // 감소에 따른 총액 업데이트
        } else {
            const menuName = cartItem.getAttribute("menuname");
            const menuItem = document.querySelector(`.menu[menuname="${menuName}"]`);
            if (menuItem) {
                menuItem.style.display = "block"; // 메뉴 다시 보이기
            }
            cartItem.remove();
            updateTotal(-menuPrice); // 삭제 시 총액 업데이트
        }
    });
}

// Save sales to history
function saveSalesToHistory(cartItems) {
    const date = new Date().toLocaleString();
    const sale = {
        date,
        items: [],
        total: totalPrice, // 총액 기록
    };

    cartItems.forEach(item => {
        const name = item.getAttribute("menuname");
        const quantity = parseInt(item.querySelector(".quantity").textContent, 10);
        const price = parseInt(item.getAttribute("price"), 10);
        const subtotal = price * quantity;

        sale.items.push({ name, quantity, subtotal }); // 판매 내역에 항목 추가
    });

    salesHistory.push(sale);
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory)); // 로컬 스토리지에 저장
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
        total += subtotal; // 총합 계산
    });

    receiptText += `\n총액: ${total}원\n\n결제 완료!`;
    alert(receiptText); // 영수증 출력

    saveSalesToHistory(cartItems); // 판매 기록 저장
    resetCartAndMenu(); // 장바구니 초기화
    location.reload(); // 페이지 새로고침
}

// Reset Cart and Menu
function resetCartAndMenu() {
    const cartItems = document.querySelectorAll(".cart-item");
    cartItems.forEach(item => {
        const menuName = item.getAttribute("menuname");
        const menuItem = document.querySelector(`.menu[menuname="${menuName}"]`);
        if (menuItem) {
            menuItem.style.display = "block"; // 메뉴 다시 보이기
        }
    });

    document.getElementById("cart").innerHTML = ""; // 장바구니 비우기
    totalPrice = 0; // 총액 초기화
    document.getElementById("total-price").textContent = totalPrice;
}

// Admin Page Handlers
function openAdminPage() {
    window.location.href = "admin.html"; // 관리자 페이지 이동
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("currentMenuStorage")) {
        saveCurrentMenu(); // 메뉴 초기화
    }
    renderMenu(); // 메뉴 렌더링

    const boxes = document.querySelectorAll(".box");
    boxes.forEach(box => {
        box.addEventListener("dragover", onDragOverBox); // 박스 드래그 오버 처리
        box.addEventListener("drop", onDropBox); // 박스 드롭 처리
    });

    document.getElementById("pay-button").addEventListener("click", displayReceipt); // 결제 버튼 클릭 이벤트
    const adminButton = document.getElementById("admin-button");
    if (adminButton) {
        adminButton.addEventListener("click", openAdminPage); // 관리자 버튼 클릭 이벤트
    }
});
