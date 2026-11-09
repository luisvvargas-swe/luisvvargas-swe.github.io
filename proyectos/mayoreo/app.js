"use strict";

const levels = {
  starter: { label: "Inicial", min: 6, max: 11 },
  restaurant: { label: "Restaurante", min: 12, max: 23 },
  hospitality: { label: "Hotelería", min: 24, max: 999 }
};
const volumeFormat = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const form = document.getElementById("order-form");
const quantity = document.getElementById("quantity");
const account = document.getElementById("account");
const receipt = document.getElementById("receipt");
const summary = document.getElementById("receipt-summary");
const getLevel = () => levels[form.elements.tier.value];
const liters = () => volumeFormat.format(quantity.valueAsNumber * 0.7) + " L";

function refresh() {
  receipt.hidden = true;
  document.getElementById("liters").textContent = quantity.validity.valid ? liters() : "—";
}

form.addEventListener("input", (event) => {
  if (event.target.name === "tier") {
    const { min, max } = getLevel();
    quantity.min = min;
    quantity.max = max;
    quantity.value = min;
    document.getElementById("quantity-hint").textContent = "De " + min + " a " + max + " en este nivel.";
  }
  refresh();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  summary.textContent = account.value + " · Nivel " + getLevel().label +
    " · " + quantity.valueAsNumber + " botellas de 700 ml (" + liters() + ").";
  receipt.hidden = false;
  document.getElementById("receipt-title").focus();
});

document.getElementById("download").addEventListener("click", () => {
  const contents = [
    "MERAKI B2B · BORRADOR DE DEMOSTRACIÓN", "",
    "Producto: Vinagreta de tequila (MRK-700)", summary.textContent,
    "Precio mayorista bajo petición.", "",
    "Simulación local. Este archivo no registra un pedido."
  ].join("\n");
  const url = URL.createObjectURL(new Blob([contents], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "meraki-borrador.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

refresh();
