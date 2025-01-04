document.addEventListener("DOMContentLoaded", () => {
    const itemForm = document.getElementById("itemForm");
    const itemList = document.getElementById("itemList");
    const totalPriceElement = document.getElementById("totalPrice");
    const printReceiptButton = document.getElementById("printReceipt");

    let totalPrice = 0;

    itemForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const itemName = document.getElementById("itemName").value.trim();
        const itemPrice = parseFloat(document.getElementById("itemPrice").value);
        const itemQuantity = parseInt(document.getElementById("itemQuantity").value);

        if (!itemName || itemPrice <= 0 || itemQuantity <= 0) {
            alert("Harap masukkan data dengan benar.");
            return;
        }

        const totalItemPrice = itemPrice * itemQuantity;

        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        listItem.innerHTML = `
            ${itemName} (x${itemQuantity}) - Rp ${totalItemPrice.toLocaleString()}
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

    printReceiptButton.addEventListener("click", () => {
        if (itemList.children.length === 0) {
            alert("Tidak ada barang untuk dicetak.");
            return;
        }

        let receipt = "Struk Belanja:\n";
        Array.from(itemList.children).forEach((item, index) => {
            receipt += `${index + 1}. ${item.textContent.replace("Hapus", "").trim()}\n`;
        });
        receipt += `\nTotal: Rp ${totalPrice.toLocaleString()}`;
        alert(receipt);
    });
});
