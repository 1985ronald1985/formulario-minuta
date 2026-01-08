import './style.css';
import { calculateTotals, calculateTaxes } from './calculator.js';
import { generatePDF } from './pdf-generator.js';
import { saveData, loadData } from './storage.js';

function updateUI() {
    const totals = calculateTotals();
    const visibleSection = document.querySelector('.company-section:not(.d-none)');

    if (visibleSection) {
        // Update totals within the visible section
        const totalTransElem = visibleSection.querySelector('.totalTransferencia');
        const totalConceptsElem = visibleSection.querySelector('.totalGeneralConceptos');

        if (totalTransElem) totalTransElem.textContent = totals.totalTransferencia.toFixed(2);
        if (totalConceptsElem) totalConceptsElem.textContent = totals.totalConceptos.toFixed(2);
    }

    document.getElementById('totalGeneral').textContent = totals.totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Logic to update taxes based on "Valor Lote"
// Logic to update taxes based on "Valor Lote"
function updateTaxes() {
    const valorLoteInput = document.getElementById('valorLote');
    const valorLote = parseFloat(valorLoteInput.value) || 0;

    // Only calculate if there's a valid value or if we want to reset (0 is valid)
    const taxes = calculateTaxes(valorLote);

    const visibleSection = document.querySelector('.company-section:not(.d-none)');
    if (visibleSection) {
        const arancelInput = visibleSection.querySelector('[data-tax-type="arancel"]');
        const impuestoInput = visibleSection.querySelector('[data-tax-type="impuesto"]');

        if (arancelInput) arancelInput.value = taxes.arancel.toFixed(2);
        if (impuestoInput) impuestoInput.value = taxes.impuesto.toFixed(2);
    }
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
    // Add listener for select (Empresa)
    const empresaSelect = document.getElementById('empresa');
    if (empresaSelect) {
        empresaSelect.addEventListener('change', (e) => {
            const selectedCompany = e.target.value;
            const kantutaniSection = document.getElementById('kantutani-section');
            const misionesSection = document.getElementById('misiones-section');

            if (selectedCompany === 'INMOBILIARIA LAS MISIONES S.A.') {
                kantutaniSection.classList.add('d-none');
                misionesSection.classList.remove('d-none');
            } else {
                kantutaniSection.classList.remove('d-none');
                misionesSection.classList.add('d-none');
            }

            updateTaxes(); // Recalculate taxes for the new section
            updateUI();    // Update totals for the new section
            saveData();
        });
    }

    const pdfBtn = document.getElementById('generate-pdf-btn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generatePDF);
    }
});
