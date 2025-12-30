import './style.css';
import { calculateTotals, calculateTaxes } from './calculator.js';
import { generatePDF } from './pdf-generator.js';
import { saveData, loadData } from './storage.js';

function updateUI() {
    const totals = calculateTotals();
    document.getElementById('totalTransferencia').textContent = totals.totalTransferencia.toFixed(2);
    document.getElementById('totalGeneralConceptos').textContent = totals.totalConceptos.toFixed(2);
    document.getElementById('totalGeneral').textContent = totals.totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Logic to update taxes based on "Valor Lote"
function updateTaxes() {
    const valorLoteInput = document.getElementById('valorLote');
    const valorLote = parseFloat(valorLoteInput.value) || 0;

    // Only calculate if there's a valid value or if we want to reset (0 is valid)
    const taxes = calculateTaxes(valorLote);

    document.getElementById('arancel').value = taxes.arancel.toFixed(2);
    document.getElementById('impuesto').value = taxes.impuesto.toFixed(2);
}

function handleInput(e) {
    // If "Valor Lote" triggers the input, update taxes
    if (e.target.id === 'valorLote') {
        updateTaxes();
    }

    updateUI();
    saveData();
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateTaxes(); // Force calculation on initial load to ensure consistency
    updateUI(); // Initial totaling

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', handleInput);
    });

    // Add listener for select (Empresa)
    const empresaSelect = document.getElementById('empresa');
    if (empresaSelect) {
        empresaSelect.addEventListener('change', () => {
            saveData();
        });
    }

    const pdfBtn = document.getElementById('generate-pdf-btn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generatePDF);
    }
});
