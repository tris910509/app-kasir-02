document.addEventListener("DOMContentLoaded", () => {
    const itemForm = document.getElementById("itemForm");
    const itemList = document.getElementById("itemList");
    const totalPriceElement = document.getElementById("totalPrice");
    const resetAllButton = document.getElementById("resetAll");
    const printReceiptButton = document.getElementById("printReceipt");
    const receiptModal = new bootstrap.Modal(document.getElementById("receiptModal"));
    const receiptContent = document.getElementById("receiptContent");

    let totalPrice = 0;

    itemForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const itemName = document.getElementById("itemName").value.trim();
        const itemPrice = parseFloat(document.getElementById("itemPrice").value);
        const itemQuantity = parseInt(document.getElementById("itemQuantity").value);
        const itemDiscount = parseFloat(document.getElementById("itemDiscount").value || 0);

        if (!itemName || itemPrice <= 0 || itemQuantity <= 0 || itemDiscount < 0 || itemDiscount > 100) {
            alert("Harap masukkan data dengan benar.");
            return;
        }

        const discountAmount = (itemPrice * itemQuantity * itemDiscount) / 100;
        const totalItemPrice = itemPrice * itemQuantity - discountAmount;

        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        listItem.innerHTML = `
            ${itemName} (x${itemQuantity}, Diskon: ${itemDiscount}%) - Rp ${totalItemPrice.toLocaleString()}
            <button class="btn btn-sm btn-danger">Hapus</button>
        `;

        listItem.querySelector("button").addEventListener("click", () => {
            totalPrice -= totalItemPrice;
            totalPriceElement.textContent = totalPrice.toLocaleString();
            itemList.removeChild(listItem);
        });

        itemList.appendChild(listItem);

        totalPrice += totalItemPrice;
        totalPriceElement.textContent = totalPrice.toLocaleString();

        itemForm.reset();
    });

    resetAllButton.addEventListener("click", () => {
        if (confirm("Apakah Anda yakin ingin mereset semua item?")) {
            itemList.innerHTML = "";
            totalPrice = 0;
            totalPriceElement.textContent = "0";
        }
    });

    printReceiptButton.addEventListener("click", () => {
        if (itemList.children.length === 0) {
            alert("Tidak ada barang untuk dicetak.");
            return;
        }

        let receiptHTML = "<h5>Struk Belanja</h5><ul>";
        Array.from(itemList.children).forEach((item, index) => {
            receiptHTML += `<li>${index + 1}. ${item.textContent.replace("Hapus", "").trim()}</li>`;
        });
        receiptHTML += `</ul><h5>Total: Rp ${totalPrice.toLocaleString()}</h5>`;

        receiptContent.innerHTML = receiptHTML;
        receiptModal.show();
    });
});
