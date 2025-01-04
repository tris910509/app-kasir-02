// Store Data
let products = [];
let categories = [];
let cart = [];
let transactions = [];

// Helper Function to show notifications
const showNotification = (message, type) => {
    alert(`${type.toUpperCase()}: ${message}`);
};

// Render Category List
const renderCategoryList = () => {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = categories.map((category, index) => `
        <li class="list-group-item">
            ${category.name}
            <button class="btn btn-danger btn-sm float-right" onclick="deleteCategory(${index})">Hapus</button>
        </li>
    `).join('');
};

// Render Product List
const renderProductList = () => {
    const productList = document.getElementById("productList");
    productList.innerHTML = products.map((product, index) => `
        <li class="list-group-item">
            ${product.name} - ${product.category} - Rp${product.price.toFixed(2)} - Stok: ${product.quantity}
            <button class="btn btn-warning btn-sm float-right" onclick="editProduct(${index})">Edit</button>
            <button class="btn btn-danger btn-sm float-right ml-2" onclick="deleteProduct(${index})">Hapus</button>
        </li>
    `).join('');
};

// Render Product Select for Transaction Form
const renderProductSelect = () => {
    const selectProduct = document.getElementById("selectProduct");
    selectProduct.innerHTML = products.map(product => `
        <option value="${product.id}">${product.name} - Rp${product.price.toFixed(2)} (Stok: ${product.quantity})</option>
    `).join('');
};

// Render Cart
const renderCart = () => {
    const cartList = document.getElementById("cartList");
    cartList.innerHTML = cart.map(item => `
        <li class="list-group-item">
            ${item.product.name} - Qty: ${item.quantity} - Total: Rp${item.totalPrice.toFixed(2)}
            <button class="btn btn-danger btn-sm float-right" onclick="removeFromCart(${cart.indexOf(item)})">Hapus</button>
        </li>
    `).join('');
};

// Add Product
document.getElementById("addProductButton").addEventListener("click", () => {
    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value);

    if (!name || !category || !price || !quantity) {
        showNotification("Semua input harus diisi!", "error");
        return;
    }

    const product = { id: Date.now(), name, category, price, quantity };
    products.push(product);
    showNotification("Produk berhasil ditambahkan.", "success");
    renderProductList();
    renderProductSelect();
    document.getElementById("productForm").reset();
});

// Edit Product
function editProduct(index) {
    const product = products[index];
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productQuantity").value = product.quantity;

    document.getElementById("addProductButton").innerText = "Update Produk";
    document.getElementById("addProductButton").onclick = () => {
        updateProduct(index);
    };
}

// Update Product
function updateProduct(index) {
    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value);

    if (!name || !category || !price || !quantity) {
        showNotification("Semua input harus diisi!", "error");
        return;
    }

    products[index] = { id: products[index].id, name, category, price, quantity };
    showNotification("Produk berhasil diperbarui.", "success");
    renderProductList();
    renderProductSelect();
    document.getElementById("productForm").reset();
    document.getElementById("addProductButton").innerText = "Tambah Produk";
    document.getElementById("addProductButton").onclick = addProduct;
}

// Delete Product
function deleteProduct(index) {
    products.splice(index, 1);
    showNotification("Produk berhasil dihapus.", "success");
    renderProductList();
    renderProductSelect();
}

// Add Category
document.getElementById("addCategoryButton").addEventListener("click", () => {
    const categoryName = document.getElementById("categoryName").value;
    if (!categoryName) {
        showNotification("Nama kategori harus diisi!", "error");
        return;
    }

    categories.push({ name: categoryName });
    showNotification("Kategori berhasil ditambahkan.", "success");
    renderCategoryList();
    document.getElementById("categoryName").value = "";
});

// Delete Category
function deleteCategory(index) {
    categories.splice(index, 1);
    showNotification("Kategori berhasil dihapus.", "success");
    renderCategoryList();
}

// Add Supplier
document.getElementById("addSupplierButton").addEventListener("click", () => {
    const supplierName = document.getElementById("supplierName").value;
    if (!supplierName) {
        showNotification("Nama supplier harus diisi!", "error");
        return;
    }

    // Add supplier logic here (if needed)
    showNotification("Supplier berhasil ditambahkan.", "success");
    document.getElementById("supplierName").value = "";
});

// Add to Cart
document.getElementById("processTransactionButton").addEventListener("click", () => {
    const selectedProductId = parseInt(document.getElementById("selectProduct").value);
    const selectedProduct = products.find(product => product.id === selectedProductId);
    const quantity = parseInt(document.getElementById("transactionQuantity").value);
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!selectedProduct || quantity <= 0 || quantity > selectedProduct.quantity) {
        showNotification("Jumlah produk tidak valid!", "error");
        return;
    }

    const cartItem = {
        product: selectedProduct,
        quantity,
        totalPrice: selectedProduct.price * quantity
    };

    cart.push(cartItem);
    selectedProduct.quantity -= quantity;
    showNotification("Produk berhasil ditambahkan ke keranjang.", "success");
    renderCart();
});

// Render Transaction List
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

// Generate Invoice
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
renderCategoryList();
renderProductSelect();
renderProductList();
renderTransactionList();
