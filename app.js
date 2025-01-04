// Helper functions
const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = "alert";
    notification.textContent = message;
    document.body.prepend(notification);
    setTimeout(() => {
        notification.classList.remove('show');
        notification.remove();
    }, 3000);
};

// Supplier Management
let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
const renderSupplierList = () => {
    const supplierList = document.getElementById("supplierList");
    supplierList.innerHTML = suppliers.map((supplier, index) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${supplier}
            <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${index})">Hapus</button>
        </li>
    `).join('');
};

document.getElementById("addSupplierButton").addEventListener("click", () => {
    const name = document.getElementById("supplierName").value.trim();
    if (!name) {
        showNotification("Silakan isi nama supplier dengan benar.", "danger");
        return;
    }
    suppliers.push(name);
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
    renderSupplierList();
    showNotification("Supplier berhasil ditambahkan.", "success");
    document.getElementById("supplierName").value = "";
});

function deleteSupplier(index) {
    suppliers.splice(index, 1);
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
    renderSupplierList();
    showNotification("Supplier berhasil dihapus.", "success");
}

// Category Management
let categories = JSON.parse(localStorage.getItem("categories")) || [];
const renderCategoryList = () => {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = categories.map((category, index) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${category}
            <button class="btn btn-danger btn-sm" onclick="deleteCategory(${index})">Hapus</button>
        </li>
    `).join('');
};

document.getElementById("addCategoryButton").addEventListener("click", () => {
    const name = document.getElementById("categoryName").value.trim();
    if (!name) {
        showNotification("Silakan isi nama kategori dengan benar.", "danger");
        return;
    }
    categories.push(name);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategoryList();

    // Populate product category select dropdown
    const productCategorySelect = document.getElementById("productCategory");
    productCategorySelect.innerHTML = `<option value="">Pilih Kategori</option>` + 
    categories.map(category => `<option value="${category}">${category}</option>`).join('');

    showNotification("Kategori berhasil ditambahkan.", "success");
    document.getElementById("categoryName").value = "";
});

function deleteCategory(index) {
    categories.splice(index, 1);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategoryList();
    showNotification("Kategori berhasil dihapus.", "success");
}

// Product Management
let products = JSON.parse(localStorage.getItem("products")) || [];
const renderProductSelect = () => {
    const productSelect = document.getElementById("selectProduct");
    productSelect.innerHTML = products.map((product, index) => `
        <option value="${index}">${product.name} - ${product.category} - Rp${product.price.toFixed(2)}</option>
    `).join('');
};

const renderProductList = () => {
    const productList = document.getElementById("productList");
    productList.innerHTML = products.map((product, index) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${product.name} - ${product.category} - Rp${product.price.toFixed(2)} - Stok: ${product.quantity}
            <button class="btn btn-warning btn-sm" onclick="editProduct(${index})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">Hapus</button>
        </li>
    `).join('');
};

document.getElementById("addProductButton").addEventListener("click", () => {
    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value, 10);

    if (!name || !category || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
        showNotification("Mohon isi semua field dengan benar.", "danger");
        return;
    }

    const existingProduct = products.find(p => p.name === name);
    if (existingProduct) {
        showNotification("Produk dengan nama ini sudah ada.", "danger");
        return;
    }

    products.push({ name, category, price, quantity });
    localStorage.setItem("products", JSON.stringify(products));
    renderProductSelect();
    renderProductList();
    showNotification("Produk berhasil ditambahkan.", "success");

    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productQuantity").value = "";
});

function editProduct(index) {
    const product = products[index];
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productQuantity").value = product.quantity;

    document.getElementById("addProductButton").innerText = "Update Produk";
    document.getElementById("addProductButton").onclick = () => {
        const name = document.getElementById("productName").value.trim();
        const category = document.getElementById("productCategory").value;
        const price = parseFloat(document.getElementById("productPrice").value);
        const quantity = parseInt(document.getElementById("productQuantity").value, 10);

        if (!name || !category || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            showNotification("Mohon isi semua field dengan benar.", "danger");
            return;
        }

        products[index] = { name, category, price, quantity };
        localStorage.setItem("products", JSON.stringify(products));
        renderProductSelect();
        renderProductList();
        showNotification("Produk berhasil diperbarui.", "success");

        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productQuantity").value = "";
        document.getElementById("addProductButton").innerText = "Tambah Produk";
        document.getElementById("addProductButton").onclick = addProduct;
    };
}

function deleteProduct(index) {
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    renderProductSelect();
    renderProductList();
    showNotification("Produk berhasil dihapus.", "success");
}

// Transaction Management
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.getElementById("processTransactionButton").addEventListener("click", () => {
    const productIndex = parseInt(document.getElementById("selectProduct").value);
    const quantity = parseInt(document.getElementById("transactionQuantity").value, 10);
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (isNaN(productIndex) || isNaN(quantity) || quantity <= 0 || !paymentMethod) {
        showNotification("Mohon isi semua field dengan benar.", "danger");
        return;
    }

    const product = products[productIndex];
    if (product.quantity < quantity) {
        showNotification("Stok tidak mencukupi.", "danger");
        return;
    }

    const totalPrice = product.price * quantity;
    cart.push({ product, quantity, totalPrice });

    product.quantity -= quantity;
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("cart", JSON.stringify(cart));

    showNotification("Transaksi berhasil.", "success");
    renderCart();
});

function renderCart() {
    const cartList = document.getElementById("cartList");
    cartList.innerHTML = cart.map((item, index) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${item.product.name} - Qty: ${item.quantity} - Total: Rp${item.totalPrice.toFixed(2)}
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Hapus</button>
        </li>
    `).join('');
}

function removeFromCart(index) {
    const item = cart.splice(index, 1)[0];
    products.find(p => p.name === item.product.name).quantity += item.quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("products", JSON.stringify(products));
    renderCart();
    showNotification("Item berhasil dihapus dari keranjang.", "success");
}

document.getElementById("checkoutButton").addEventListener("click", () => {
    transactions.push({ cart, totalAmount: cart.reduce((acc, item) => acc + item.totalPrice, 0), paymentMethod: document.getElementById("paymentMethod").value, date: new Date().toLocaleString() });
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    showNotification("Checkout berhasil.", "success");
    renderCart();
    renderTransactionList();
});

const renderTransactionList = () => {
    const transactionList = document.getElementById("transactionList");
    transactionList.innerHTML = transactions.map((transaction, index) => `
        <li class="list-group-item">
            <p><strong>Tanggal:</strong> ${transaction.date}</p>
            <p><strong>Total:</strong> Rp${transaction.totalAmount.toFixed(2)}</p>
            <p><strong>Metode Pembayaran:</strong> ${transaction.paymentMethod}</p>
            <button class="btn btn-primary btn-sm" onclick="generateInvoice(${index})">Lihat Invoice</button>
        </li>
    `).join('');
};

function generateInvoice(index) {
    const transaction = transactions[index];
    const invoiceHtml = `
        <h4>Invoice</h4>
        <p><strong>Tanggal:</strong> ${transaction.date}</p>
        <p><strong>Total:</strong> Rp${transaction.totalAmount.toFixed(2)}</p>
        <p><strong>Metode Pembayaran:</strong> ${transaction.paymentMethod}</p>
        <h5>Detail Produk</h5>
        <ul>
            ${transaction.cart.map(item => `<li>${item.product.name} - Qty: ${item.quantity} - Total: Rp${item.totalPrice.toFixed(2)}</li>`).join('')}
        </ul>
    `;
    document.getElementById("invoiceContainer").innerHTML = invoiceHtml;
}

// Reports
document.getElementById("generateReportButton").addEventListener("click", () => {
    const category = document.getElementById("reportByCategory").value;
    let filteredProducts = products;

    if (category !== "all") {
        filteredProducts = products.filter(p => p.category === category);
    }

    let reportHtml = `<h4>Laporan Produk</h4>`;
    reportHtml += `<ul>`;
    filteredProducts.forEach(product => {
        reportHtml += `
            <li>${product.name} - ${product.category} - Rp${product.price.toFixed(2)} - Stok: ${product.quantity}</li>
        `;
    });
    reportHtml += `</ul>`;

    document.getElementById("invoiceContainer").innerHTML = reportHtml;
});

// Print Receipt
document.getElementById("printReceiptButton").addEventListener("click", () => {
    const invoiceContent = document.getElementById("invoiceContainer").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = invoiceContent;
    window.print();
    document.body.innerHTML = originalContent;
});

// Initial render
renderSupplierList();
renderCategoryList();
renderProductSelect();
renderProductList();
renderTransactionList();
