// Elemen Total
const subtotalPriceElement = document.getElementById("subtotalPrice");
const taxPriceElement = document.getElementById("taxPrice");
const finalPriceElement = document.getElementById("finalPrice");
const totalDiscountInput = document.getElementById("totalDiscount");

// Update Total
function updateTotal() {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.1; // 10% PPN
    const totalDiscount = parseFloat(totalDiscountInput.value) || 0;
    const total = subtotal + tax - (subtotal * totalDiscount / 100);

    subtotalPriceElement.textContent = subtotal.toLocaleString();
    taxPriceElement.textContent = tax.toLocaleString();
    finalPriceElement.textContent = total.toLocaleString();
}

// Update Total Saat Diskon Total Diubah
totalDiscountInput.addEventListener("input", updateTotal);


//Fungsi ini digunakan untuk membuat laporan transaksi dalam bentuk PDF.
const exportPDFButton = document.getElementById("exportPDF");

exportPDFButton.addEventListener("click", () => {
    if (items.length === 0) return alert("Tidak ada transaksi untuk dicetak!");

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Laporan Transaksi Kasir", 10, 10);
    doc.setFontSize(12);

    let y = 20;

    doc.text("Daftar Barang:", 10, y);
    y += 10;

    items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name} (${item.category}) - ${currencySymbol}${item.price.toLocaleString()} x ${item.quantity}`, 10, y);
        doc.text(`Diskon: ${item.discount}% - Total: ${currencySymbol}${item.totalPrice.toLocaleString()}`, 10, y + 5);
        y += 10;
    });

    doc.text(`\nSubtotal: ${currencySymbol}${subtotalPriceElement.textContent}`, 10, y);
    doc.text(`PPN (10%): ${currencySymbol}${taxPriceElement.textContent}`, 10, y + 10);
    doc.text(`Diskon Total: ${totalDiscountInput.value}%`, 10, y + 20);
    doc.text(`Total Akhir: ${currencySymbol}${finalPriceElement.textContent}`, 10, y + 30);

    doc.save("laporan_transaksi.pdf");
});

// Fungsi ini digunakan untuk mencetak struk transaksi langsung dari browser.

const printReceiptButton = document.getElementById("printReceipt");

printReceiptButton.addEventListener("click", () => {
    if (items.length === 0) return alert("Tidak ada transaksi untuk dicetak!");

    let receiptContent = "<h3>Laporan Transaksi Kasir</h3>";
    receiptContent += "<ul>";

    items.forEach((item) => {
        receiptContent += `<li>${item.name} (${item.category}) - ${currencySymbol}${item.price.toLocaleString()} x ${item.quantity} = ${currencySymbol}${item.totalPrice.toLocaleString()}</li>`;
    });

    receiptContent += `</ul>`;
    receiptContent += `<p>Subtotal: ${currencySymbol}${subtotalPriceElement.textContent}</p>`;
    receiptContent += `<p>PPN (10%): ${currencySymbol}${taxPriceElement.textContent}</p>`;
    receiptContent += `<p>Diskon Total: ${totalDiscountInput.value}%</p>`;
    receiptContent += `<p>Total Akhir: ${currencySymbol}${finalPriceElement.textContent}</p>`;

    const newWindow = window.open("", "_blank");
    newWindow.document.write(receiptContent);
    newWindow.document.write("<script>window.print(); window.close();</script>");
});


// Tambahkan opsi konversi mata uang agar harga dapat diubah sesuai dengan kurs tertentu.

const currencySelector = document.getElementById("currencySelector");

currencySelector.addEventListener("change", () => {
    const selectedCurrency = currencySelector.value;
    const rate = currencySelector.options[currencySelector.selectedIndex].dataset.rate;

    if (selectedCurrency === "IDR") {
        currencySymbol = "Rp";
    } else if (selectedCurrency === "USD") {
        currencySymbol = "$";
    } else if (selectedCurrency === "EUR") {
        currencySymbol = "€";
    }

    items.forEach(item => {
        item.totalPrice = item.price * item.quantity * (1 - item.discount / 100) * rate;
    });

    updateTotal();
    renderItems();
});





//Fungsi ini digunakan untuk menghapus semua transaksi dan mengosongkan daftar barang.
const resetAllButton = document.getElementById("resetAll");

resetAllButton.addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua data transaksi?")) {
        items = [];
        renderItems();
        updateTotal();
    }
});




// Elemen untuk statistik
const totalItemsSoldElement = document.getElementById("totalItemsSold");
const totalIncomeElement = document.getElementById("totalIncome");

// Hitung statistik
function updateStatistics() {
    const totalItemsSold = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalIncome = items.reduce((sum, item) => sum + item.totalPrice, 0);

    totalItemsSoldElement.textContent = totalItemsSold.toLocaleString();
    totalIncomeElement.textContent = `${currencySymbol}${totalIncome.toLocaleString()}`;
}

// Panggil updateStatistics setiap kali transaksi berubah
updateStatistics();


// Menghitung kategori terpopuler
function getMostPopularCategory() {
    const categoryCounts = {};

    items.forEach((item) => {
        if (!categoryCounts[item.category]) {
            categoryCounts[item.category] = 0;
        }
        categoryCounts[item.category] += item.quantity;
    });

    let mostPopularCategory = "N/A";
    let maxCount = 0;

    for (const category in categoryCounts) {
        if (categoryCounts[category] > maxCount) {
            mostPopularCategory = category;
            maxCount = categoryCounts[category];
        }
    }

    return mostPopularCategory;
}

// Tampilkan kategori terpopuler
document.getElementById("mostPopularCategory").textContent = getMostPopularCategory();



// Fitur ini memungkinkan pengguna untuk mengunduh semua transaksi dalam format CSV.

const importCSVButton = document.createElement("button");
importCSVButton.id = "importCSV";
importCSVButton.textContent = "Import CSV";
importCSVButton.className = "btn btn-info w-100 mt-2";
document.querySelector(".container").appendChild(importCSVButton);

importCSVButton.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.click();

    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = e.target.result.split("\n").map(row => row.split(","));
            data.shift(); // Remove header
            data.forEach(row => {
                const [name, category, price, quantity, discount] = row;
                items.push({
                    name,
                    category,
                    price: parseFloat(price),
                    quantity: parseInt(quantity),
                    discount: parseFloat(discount),
                    totalPrice: parseFloat(price) * parseInt(quantity) * (1 - parseFloat(discount) / 100)
                });
            });
            renderItems();
            updateTotal();
            updateStatistics();
        };

        reader.readAsText(file);
    });
});


//Fungsi ini memungkinkan pengguna untuk memfilter barang berdasarkan kategori.

const searchItemInput = document.getElementById("searchItem");

searchItemInput.addEventListener("input", () => {
    const query = searchItemInput.value.toLowerCase();

    const filteredItems = items.filter(item => item.name.toLowerCase().includes(query));
    renderFilteredItems(filteredItems);
});

function renderFilteredItems(filteredItems) {
    itemList.innerHTML = "";
    filteredItems.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";

        listItem.innerHTML = `
            <span>
                <strong>${item.name}</strong> (${item.category}) - ${currencySymbol} ${item.price.toLocaleString()} x ${item.quantity} 
                <br> Diskon: ${item.discount}% 
                <br> Total: ${currencySymbol} ${item.totalPrice.toLocaleString()}
            </span>
            <div>
                <button class="btn btn-warning btn-sm me-2" onclick="editItem(${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem(${index})">Hapus</button>
            </div>
        `;

        itemList.appendChild(listItem);
    });
}

//Fitur ini memungkinkan pengguna untuk beralih antara tema terang dan gelap.
const toggleDarkMode = document.getElementById("toggleDarkMode");

toggleDarkMode.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", toggleDarkMode.checked);
    localStorage.setItem("darkMode", toggleDarkMode.checked);
});

// Muat preferensi dark mode dari lokal storage
if (localStorage.getItem("darkMode") === "true") {
    toggleDarkMode.checked = true;
    document.body.classList.add("dark-mode");
}





// Simulasi data pengguna
let currentUser = { username: "admin", password: "password" };

// Elemen login form
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const logoutButton = document.getElementById("logoutButton");
const userInfoElement = document.getElementById("userInfo");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === currentUser.username && password === currentUser.password) {
        localStorage.setItem("loggedIn", "true");
        updateUserInfo();
    } else {
        alert("Username atau password salah.");
    }
});

// Logout
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    updateUserInfo();
});

// Memuat status login
function updateUserInfo() {
    if (localStorage.getItem("loggedIn") === "true") {
        userInfoElement.textContent = `Halo, ${currentUser.username}!`;
        logoutButton.style.display = "inline-block";
    } else {
        userInfoElement.textContent = "Silakan login.";
        logoutButton.style.display = "none";
    }
}

updateUserInfo();



//Restore Data Transaksi

const backupDataButton = document.getElementById("backupData");

backupDataButton.addEventListener("click", () => {
    const data = JSON.stringify(items);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "transaksi_backup.json";

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
});


//  Fitur Kalender untuk Input Tanggal

$(function () {
    $("#transactionDate").datepicker();
});


