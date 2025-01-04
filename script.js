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

    let items = JSON.parse(localStorage.getItem("items")) || [];
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let subtotal = 0;

    const updatePrices = () => {
        subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * 0.1;
        const discount = parseFloat(totalDiscountElement.value || 0) / 100;
        const finalPrice = subtotal + tax - subtotal * discount;

        subtotalPriceElement.textContent = subtotal.toLocaleString();
        taxPriceElement.textContent = tax.toLocaleString();
        finalPriceElement.textContent = finalPrice.toLocaleString();

        updatePreview(finalPrice);
    };

    const updatePreview = (finalPrice) => {
        let previewHTML = "<h5>Struk Belanja</h5><ul>";
        items.forEach((item, index) => {
            previewHTML += `<li>${index + 1}. ${item.name} (x${item.quantity}, ${item.category}, Diskon: ${item.discount}%) - Rp ${item.totalPrice.toLocaleString()}</li>`;
        });
        previewHTML += `</ul><h5>Total: Rp ${finalPrice.toLocaleString()}</h5>`;
        receiptPreview.innerHTML = previewHTML;
    };

    const renderItems = () => {
        itemList.innerHTML = "";
        items.forEach((item, index) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";
            listItem.innerHTML = `
                ${item.name} (x${item.quantity}, ${item.category}, Diskon: ${item.discount}%) - Rp ${item.totalPrice.toLocaleString()}
                <button class="btn btn-sm btn-danger">Hapus</button>
            `;
            listItem.querySelector("button").addEventListener("click", () => {
                items.splice(index, 1);
                renderItems();
                updatePrices();
            });
            itemList.appendChild(listItem);
        });
        updatePrices();
    };

    const renderTransactions = () => {
        transactionHistory.innerHTML = "";
        transactions.forEach((transaction, index) => {
            const historyItem = document.createElement("li");
            historyItem.className = "list-group-item";
            historyItem.innerHTML = `
                <strong>Transaksi ${index + 1}</strong>: Rp ${transaction.total.toLocaleString()} (${transaction.date})
            `;
            transactionHistory.appendChild(historyItem);
        });
    };

    itemForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("itemName").value.trim();
        const category = document.getElementById("itemCategory").value;
        const price = parseFloat(document.getElementById("itemPrice").value);
        const quantity = parseInt(document.getElementById("itemQuantity").value);
        const discount = parseFloat(document.getElementById("itemDiscount").value || 0);

        const discountAmount = (price * quantity * discount) / 100;
        const totalPrice = price * quantity - discountAmount;

        items.push({ name, category, price, quantity, discount, totalPrice });
        renderItems();

        itemForm.reset();
    });

    searchItem.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filteredItems = items.filter((item) =>
            item.name.toLowerCase().includes(query)
        );
        itemList.innerHTML = "";
        filteredItems.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.textContent = `${item.name} - Rp ${item.totalPrice.toLocaleString()}`;
            itemList.appendChild(listItem);
        });
    });

    saveTransactionButton.addEventListener("click", () => {
        if (items.length === 0) {
            alert("Tidak ada barang untuk disimpan.");
            return;
        }

        const total = parseFloat(finalPriceElement.textContent.replace(/,/g, ""));
        const date = new Date().toLocaleString();
        transactions.push({ items, total, date });
        localStorage.setItem("transactions", JSON.stringify(transactions));

        items = [];
        renderItems();
        renderTransactions();
        alert("Transaksi berhasil disimpan!");
    });

    exportPDFButton.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let y = 10;
        doc.text("Struk Belanja", 10, y);
        y += 10;

        items.forEach((item, index) => {
            doc.text(
                `${index + 1}. ${item.name} (x${item.quantity}, ${item.category}, Diskon: ${item.discount}%) - Rp ${item.totalPrice.toLocaleString()}`,
                10,
                y
            );
            y += 10;
        });

        const total = finalPriceElement.textContent;
        doc.text(`Total: Rp ${total}`, 10, y);
        doc.save("Struk_Belanja.pdf");
    });

    renderItems();
    renderTransactions();
});
