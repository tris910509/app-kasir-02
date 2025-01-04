document.addEventListener("DOMContentLoaded", () => {
    const itemForm = document.getElementById("itemForm");
    const itemList = document.getElementById("itemList");
    const subtotalPriceElement = document.getElementById("subtotalPrice");
    const taxPriceElement = document.getElementById("taxPrice");
    const finalPriceElement = document.getElementById("finalPrice");
    const totalDiscountElement = document.getElementById("totalDiscount");
    const searchItem = document.getElementById("searchItem");
    const receiptPreview = document.getElementById("receiptPreview");
    const transactionHistory = document.getElementById("transactionHistory");
    const exportPDFButton = document.getElementById("exportPDF");
    const saveTransactionButton = document.getElementById("saveTransaction");

    let items = [];
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    const renderItems = () => {
        itemList.innerHTML = items
            .map((item, index) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.name} (${item.quantity}x, ${item.category}) - Rp ${item.totalPrice.toLocaleString()}
                    <button class="btn btn-danger btn-sm" onclick="deleteItem(${index})">Hapus</button>
                </li>
            `).join("");
        updatePrices();
    };

    const deleteItem = (index) => {
        items.splice(index, 1);
        renderItems();
    };

    const updatePrices = () => {
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * 0.1;
        const discount = parseFloat(totalDiscountElement.value || 0) / 100;
        const finalPrice = subtotal + tax - subtotal * discount;

        subtotalPriceElement.textContent = subtotal.toLocaleString();
        taxPriceElement.textContent = tax.toLocaleString();
        finalPriceElement.textContent = finalPrice.toLocaleString();

        updatePreview(finalPrice);
    };

    const updatePreview = (finalPrice) => {
        const previewHTML = `
            <h5>Struk Belanja</h5>
            <ul>
                ${items.map((item, index) => `
                    <li>${index + 1}. ${item.name} (x${item.quantity}, ${item.category}) - Rp ${item.totalPrice.toLocaleString()}</li>
                `).join("")}
            </ul>
            <h5>Total: Rp ${finalPrice.toLocaleString()}</h5>
        `;
        receiptPreview.innerHTML = previewHTML;
    };

    const renderTransactions = () => {
        transactionHistory.innerHTML = transactions.map((transaction, index) => `
            <li class="list-group-item">
                <strong>Transaksi ${index + 1}</strong>: Rp ${transaction.total.toLocaleString()} (${transaction.date})
            </li>
        `).join("");
    };

    itemForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("itemName").value.trim();
        const category = document.getElementById("itemCategory").value;
        const price = parseFloat(document.getElementById("itemPrice").value);
        const quantity = parseInt(document.getElementById("itemQuantity").value);
        const discount = parseFloat(document.getElementById("itemDiscount").value || 0);

        const totalPrice = price * quantity - (price * quantity * discount) / 100;

        items.push({ name, category, quantity, totalPrice });
        renderItems();
        itemForm.reset();
    });

    saveTransactionButton.addEventListener("click", () => {
        const total = parseFloat(finalPriceElement.textContent.replace(/,/g, ""));
        if (items.length === 0) return alert("Tidak ada barang untuk disimpan!");

        transactions.push({ items, total, date: new Date().toLocaleString() });
        localStorage.setItem("transactions", JSON.stringify(transactions));
        items = [];
        renderItems();
        renderTransactions();
        alert("Transaksi berhasil disimpan!");
    });

    exportPDFButton.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Struk Belanja", 10, 10);
        items.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.name} - Rp ${item.totalPrice.toLocaleString()}`, 10, 20 + index * 10);
        });
        doc.text(`Total: Rp ${finalPriceElement.textContent}`, 10, 20 + items.length * 10);
        doc.save("Struk_Belanja.pdf");
    });

    renderTransactions();
});
