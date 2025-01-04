document.addEventListener("DOMContentLoaded", () => {
    const itemForm = document.getElementById("itemForm");
    const itemList = document.getElementById("itemList");
    const subtotalPriceElement = document.getElementById("subtotalPrice");
    const taxPriceElement = document.getElementById("taxPrice");
    const finalPriceElement = document.getElementById("finalPrice");
    const totalDiscountElement = document.getElementById("totalDiscount");
    const resetAllButton = document.getElementById("resetAll");
    const printReceiptButton = document.getElementById("printReceipt");
    const exportPDFButton = document.getElementById("exportPDF");
    const receiptModal = new bootstrap.Modal(document.getElementById("receiptModal"));
    const receiptContent = document.getElementById("receiptContent");

    let items = JSON.parse(localStorage.getItem("items")) || [];
    let subtotal = 0;

    const updatePrices = () => {
        subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * 0.1;
        const discount = parseFloat(totalDiscountElement.value || 0) / 100;
        const finalPrice = subtotal + tax - subtotal * discount;

        subtotalPriceElement.textContent = subtotal.toLocaleString();
        taxPriceElement.textContent = tax.toLocaleString();
        finalPriceElement.textContent = finalPrice.toLocaleString();

        localStorage.setItem("items", JSON.stringify(items));
    };

    const renderItems = () => {
        itemList.innerHTML = "";
        items.forEach((item, index) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";
            listItem.innerHTML = `
                ${item.name} (x${item.quantity}, Diskon: ${item.discount}%) - Rp ${item.totalPrice.toLocaleString()}
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

    itemForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("itemName").value.trim();
        const price = parseFloat(document.getElementById("itemPrice").value);
        const quantity = parseInt(document.getElementById("itemQuantity").value);
        const discount = parseFloat(document.getElementById("itemDiscount").value || 0);

        const discountAmount = (price * quantity * discount) / 100;
        const totalPrice = price * quantity - discountAmount;

        items.push({ name, price, quantity, discount, totalPrice });
        renderItems();

        itemForm.reset();
    });

    resetAllButton.addEventListener("click", () => {
        if (confirm("Apakah Anda yakin ingin mereset semua item?")) {
            items = [];
            renderItems();
        }
    });

    printReceiptButton.addEventListener("click", () => {
        if (items.length === 0) {
            alert("Tidak ada barang untuk dicetak.");
            return;
        }

        let receiptHTML = "<h5>Struk Belanja</h5><ul>";
        items.forEach((item, index) => {
            receiptHTML += `<li>${index + 1}. ${item.name} (x${item.quantity}, Diskon: ${item.discount}%) - Rp ${item.totalPrice.toLocaleString()}</li>`;
        });
        receiptHTML += `</ul><h5>Subtotal: Rp ${subtotal.toLocaleString()}</h5>`;
        receiptHTML += `<h5>PPN (10%): Rp ${(subtotal * 0.1).toLocaleString()}</h5>`;
        receiptHTML += `<h5>Total Akhir: Rp ${finalPriceElement.textContent}</h5>`;

        receiptContent.innerHTML = receiptHTML;
        receiptModal.show();
    });

    exportPDFButton.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let y = 10;
        doc.text("Struk Belanja", 10, y);
        y += 10;

        items.forEach((item, index) => {
            doc.text(
                `${index + 1}. ${item.name} (x${item.quantity}, Diskon: ${item.discount}%) - Rp ${item.totalPrice.toLocaleString()}`,
                10,
                y
            );
            y += 10;
        });

        doc.text(`Subtotal: Rp ${subtotal.toLocaleString()}`, 10, y);
        y += 10;
        doc.text(`PPN (10%): Rp ${(subtotal * 0.1).toLocaleString()}`, 10, y);
        y += 10;
        doc.text(`Total Akhir: Rp ${finalPriceElement.textContent}`, 10, y);

        doc.save("Struk_Belanja.pdf");
    });

    renderItems();
});
