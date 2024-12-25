// 관리자 로그인에 필요한 상수
const ADMIN_ID = "gunyub1120"; // 관리자 ID
const ADMIN_PASSWORD = "kim121426!"; // 관리자 비밀번호

// 메뉴 스토리지를 초기화
let currentMenuStorage = JSON.parse(localStorage.getItem("currentMenuStorage")) || [
    { name: "밀면", price: 7000, image: "./image/Wheat_Noodles.jpg" }, // 기본 메뉴: 밀면
    { name: "밀면 곱빼기", price: 8000, image: "./image/doubleWheatNodkes.jpeg" }, // 기본 메뉴: 밀면 곱빼기
    { name: "비빔밀면", price: 7000, image: "./image/bibim_Noodles.jpg" }, // 기본 메뉴: 비빔밀면
    { name: "비빔밀면 곱빼기", price: 8000, image: "./image/doubleBibimNodels.png" }, // 기본 메뉴: 비빔밀면 곱빼기
];

// 메뉴 데이터를 localStorage에 저장
function saveCurrentMenu() {
    localStorage.setItem("currentMenuStorage", JSON.stringify(currentMenuStorage));
}

// 관리자 페이지에서 메뉴를 렌더링
function renderMenus() {
    const currentMenuContainer = document.getElementById("current-menu"); // 현재 메뉴 컨테이너
    currentMenuContainer.innerHTML = ""; // 컨테이너 초기화

    currentMenuStorage.forEach(menu => {
        const menuItem = document.createElement("div"); // 메뉴 항목 생성
        menuItem.className = "menu-item"; // 클래스 설정
        menuItem.innerHTML = `
            <img src="${menu.image}" alt="${menu.name}"> <!-- 메뉴 이미지 -->
            <p>${menu.name}</p> <!-- 메뉴 이름 -->
            <p>${menu.price}원</p> <!-- 메뉴 가격 -->
        `;
        currentMenuContainer.appendChild(menuItem); // 컨테이너에 추가
    });
}

// 새 메뉴 추가 (이벤트 리스너)
document.getElementById("add-menu-button").addEventListener("click", () => {
    const name = document.getElementById("menu-name").value.trim(); // 입력된 메뉴 이름
    const price = parseInt(document.getElementById("menu-price").value.trim(), 10); // 입력된 가격
    const image = document.getElementById("menu-image").value.trim(); // 입력된 이미지 경로

    if (!name || !price || !image) {
        alert("모든 정보를 입력해주세요."); // 모든 입력값 확인
        return;
    }

    currentMenuStorage.push({ name, price, image }); // 메뉴 추가
    saveCurrentMenu(); // 저장
    alert(`${name} 메뉴가 추가되었습니다.`); // 성공 메시지
    renderMenus(); // 메뉴 다시 렌더링
});

// 메뉴 삭제 (이벤트 리스너)
document.getElementById("delete-menu-button").addEventListener("click", () => {
    const name = document.getElementById("menu-name").value.trim(); // 입력된 메뉴 이름

    if (!name) {
        alert("삭제할 메뉴 이름을 입력하세요."); // 이름 입력 요청
        return;
    }

    const index = currentMenuStorage.findIndex(menu => menu.name === name); // 메뉴 인덱스 찾기
    if (index !== -1) {
        currentMenuStorage.splice(index, 1); // 메뉴 삭제
        saveCurrentMenu(); // 저장
        alert(`${name} 메뉴가 삭제되었습니다.`); // 성공 메시지
        renderMenus(); // 메뉴 다시 렌더링
    } else {
        alert(`${name} 메뉴를 찾을 수 없습니다.`); // 실패 메시지
    }
});

// 관리자 로그인 (이벤트 리스너)
document.getElementById("login-button").addEventListener("click", () => {
    const adminId = document.getElementById("admin-id").value.trim(); // 입력된 ID
    const adminPassword = document.getElementById("admin-password").value.trim(); // 입력된 비밀번호

    if (adminId === ADMIN_ID && adminPassword === ADMIN_PASSWORD) {
        document.getElementById("login-page").classList.add("hidden"); // 로그인 페이지 숨기기
        document.getElementById("admin-page").classList.remove("hidden"); // 관리자 페이지 표시
        renderMenus(); // 메뉴 렌더링
    } else {
        alert("로그인 실패: ID 또는 비밀번호를 확인하세요."); // 로그인 실패 메시지
    }
});

// 메인 페이지로 이동 (이벤트 리스너)
document.getElementById("main-page-button").addEventListener("click", () => {
    window.location.href = "index.html"; // 메인 페이지로 이동
});

// 판매 내역 초기화
let salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || []; // 판매 기록 로드 또는 초기화

// 판매 내역을 localStorage에 저장
function saveSalesHistory() {
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
}

// 관리자 페이지에서 판매 내역 렌더링
function renderSalesHistory() {
    const salesHistoryContainer = document.getElementById("sales-history"); // 판매 내역 컨테이너
    const totalSalesElement = document.getElementById("total-sales"); // 총 매출 표시 요소

    salesHistoryContainer.innerHTML = ""; // 컨테이너 초기화

    if (salesHistory.length === 0) {
        salesHistoryContainer.innerHTML = "<p>판매 내역이 없습니다.</p>"; // 판매 내역 없을 때 메시지
        totalSalesElement.textContent = "0"; // 총 매출 0으로 표시
        return;
    }

    const table = document.createElement("table"); // 테이블 생성
    table.innerHTML = `
        <thead>
            <tr>
                <th>날짜</th>
                <th>메뉴</th>
                <th>수량</th>
                <th>소계</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody"); // 테이블 본문
    let totalSales = 0; // 총 매출 초기화

    salesHistory.forEach(sale => {
        sale.items.forEach(item => {
            const row = document.createElement("tr"); // 테이블 행 생성
            row.innerHTML = `
                <td>${sale.date}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.subtotal}원</td>
            `;
            tbody.appendChild(row); // 테이블 본문에 행 추가
            totalSales += item.subtotal; // 총 매출 계산
        });
    });

    salesHistoryContainer.appendChild(table); // 컨테이너에 테이블 추가
    totalSalesElement.textContent = totalSales; // 총 매출 표시
}

// 판매 내역 초기화 (이벤트 리스너)
document.getElementById("reset-sales-button").addEventListener("click", () => {
    if (confirm("판매 내역을 초기화하시겠습니까?")) {
        salesHistory = []; // 판매 내역 초기화
        saveSalesHistory(); // 저장
        renderSalesHistory(); // 다시 렌더링
        alert("판매 내역이 초기화되었습니다."); // 성공 메시지
    }
});

// 초기화 작업 (DOMContentLoaded)
document.addEventListener("DOMContentLoaded", () => {
    renderMenus(); // 메뉴 렌더링
    renderSalesHistory(); // 판매 내역 렌더링
});
