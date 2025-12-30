const STORAGE_KEY = 'minuta_data_v2';

export function saveData() {
    const data = {};

    // 1. Save inputs with IDs (Header info, Arancel, Impuesto, Selects)
    document.querySelectorAll('input[id], select[id]').forEach(input => {
        data[input.id] = input.value;
    });

    // 2. Save Observations specifically
    const obs = [];
    document.querySelectorAll('.observacion-input').forEach(input => {
        obs.push(input.value);
    });
    data.observaciones = obs;

    // 3. Save Costo Transferencia inputs
    const transfer = [];
    document.querySelectorAll('.costo-transferencia').forEach(input => {
        transfer.push(input.value);
    });
    data.costoTransferencia = transfer;

    // 4. Save Costo General inputs
    const general = [];
    document.querySelectorAll('.costo-general').forEach(input => {
        general.push(input.value);
    });
    data.costoGeneral = general;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadData() {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return;

    try {
        const data = JSON.parse(json);

        // 1. Load IDs
        for (const [key, value] of Object.entries(data)) {
            if (['observaciones', 'costoTransferencia', 'costoGeneral'].includes(key)) continue;
            const element = document.getElementById(key);
            if (element) element.value = value;
        }

        // 2. Load Observations
        if (data.observaciones) {
            const inputs = document.querySelectorAll('.observacion-input');
            data.observaciones.forEach((val, index) => {
                if (inputs[index]) inputs[index].value = val;
            });
        }

        // 3. Load Costo Transferencia
        if (data.costoTransferencia) {
            const inputs = document.querySelectorAll('.costo-transferencia');
            data.costoTransferencia.forEach((val, index) => {
                if (inputs[index]) inputs[index].value = val;
            });
        }

        // 4. Load Costo General
        if (data.costoGeneral) {
            const inputs = document.querySelectorAll('.costo-general');
            data.costoGeneral.forEach((val, index) => {
                if (inputs[index]) inputs[index].value = val;
            });
        }

    } catch (e) {
        console.error("Error loading data", e);
    }
}
