export function calculateTotals() {
    let totalTransferencia = 0;
    document.querySelectorAll('.costo-transferencia').forEach(input => {
        totalTransferencia += parseFloat(input.value) || 0;
    });

    let totalConceptos = 0;
    document.querySelectorAll('.costo-general').forEach(input => {
        totalConceptos += parseFloat(input.value) || 0;
    });
    
    const arancel = parseFloat(document.getElementById('arancel').value) || 0;
    const impuesto = parseFloat(document.getElementById('impuesto').value) || 0;
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
