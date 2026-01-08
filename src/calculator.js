export function calculateTotals() {
    // Find the visible section
    const visibleSection = document.querySelector('.company-section:not(.d-none)');
    if (!visibleSection) return { totalTransferencia: 0, totalConceptos: 0, totalGeneral: 0 };

    let totalTransferencia = 0;
    visibleSection.querySelectorAll('.costo-transferencia').forEach(input => {
        totalTransferencia += parseFloat(input.value) || 0;
    });

    let totalConceptos = 0;
    visibleSection.querySelectorAll('.costo-general').forEach(input => {
        totalConceptos += parseFloat(input.value) || 0;
    });

    // Select tax inputs within the visible section by data attribute
    const arancelInput = visibleSection.querySelector('[data-tax-type="arancel"]');
    const impuestoInput = visibleSection.querySelector('[data-tax-type="impuesto"]');

    const arancel = arancelInput ? (parseFloat(arancelInput.value) || 0) : 0;
    const impuesto = impuestoInput ? (parseFloat(impuestoInput.value) || 0) : 0;

    totalConceptos += arancel + impuesto;

    return {
        totalTransferencia,
        totalConceptos,
        totalGeneral: totalTransferencia + totalConceptos
    };
}

export function calculateTaxes(valorLote) {
    const arancel = (valorLote * 5) / 1000;
    const impuesto = valorLote * 0.03;
    return { arancel, impuesto };
}
