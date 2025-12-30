import { jsPDF } from "jspdf";
import "jspdf-autotable";

export function generatePDF() {
    // Letter format: 215.9mm x 279.4mm
    const doc = new jsPDF({
        format: 'letter',
        unit: 'mm'
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- UTILS ---
    const addFooter = (doc, pageNum, totalPages) => {
        const date = new Date().toLocaleString('es-BO');
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setDrawColor(200);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        doc.text(`Generado el: ${date}`, 14, pageHeight - 10);
        doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });

        const securityId = Math.random().toString(36).substring(2, 10).toUpperCase();
        doc.text(`ID: ${securityId}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    // --- HEADER ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text('TRÁMITE DE TITULARIZACIÓN', pageWidth / 2, 18, { align: 'center' });

    // Banner background
    doc.setFillColor(233, 236, 239);
    doc.rect(40, 23, pageWidth - 80, 9, 'F');

    doc.setFontSize(11);
    doc.setTextColor(13, 110, 253);

    // Get Selected Company
    const empresaSelect = document.getElementById('empresa');
    const empresaText = empresaSelect ? empresaSelect.value : 'INMOBILIARIA KANTUTANI S.A.';

    doc.text(empresaText, pageWidth / 2, 29, { align: 'center' });

    // --- CLIENT DATA ---
    // Compact this section slightly to save vertical space
    let startY = 42;
    const leftMargin = 14;
    const rightMargin = 110;
    doc.setFont('helvetica', 'normal');

    const clientData = [
        { label: 'Nombre Cliente', value: document.getElementById('nombreCliente').value, style: 'bold-lg' },
        { label: 'Contrato', value: document.getElementById('contrato').value, style: 'bold-lg' },
        { label: 'Valor Lote (Bs)', value: document.getElementById('valorLote').value, style: 'bold' },
        { label: 'Base imponible actualizado (Bs)', value: document.getElementById('baseImponible').value, style: 'bold' },
        { label: 'Tipo de cambio', value: document.getElementById('tipoCambio').value, style: 'bold' },
        { label: 'Lote', value: document.getElementById('lote').value, style: 'bold' },
        { label: 'Proyecto / Sector', value: document.getElementById('proyecto').value, fullWidth: true, style: 'bold-lg' },
    ];

    let currentY = startY;
    for (let i = 0; i < clientData.length; i += 2) {
        const item1 = clientData[i];
        const item2 = (i + 1 < clientData.length && !item1.fullWidth) ? clientData[i + 1] : null;

        // Labels
        doc.setFontSize(8);
        doc.setTextColor(108, 117, 125); // Text muted
        doc.setFont('helvetica', 'normal');
        doc.text(item1.label, leftMargin, currentY);
        if (item2) doc.text(item2.label, rightMargin, currentY);

        currentY += 4.5; // Tighter vertical spacing

        // Values
        doc.setTextColor(33, 37, 41);
        if (item1.style === 'bold-lg') {
            doc.setFontSize(10.5);
            doc.setFont('helvetica', 'bold');
        } else {
            doc.setFontSize(9.5);
            doc.setFont('helvetica', 'bold');
        }

        doc.text(item1.value, leftMargin, currentY);
        if (item2) {
            if (item2.style === 'bold-lg') {
                doc.setFontSize(10.5);
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setFontSize(9.5);
                doc.setFont('helvetica', 'bold');
            }
            doc.text(item2.value, rightMargin, currentY);
        }

        currentY += 8.5; // Tighter spacing between rows
        if (item1.fullWidth) i--;
    }

    // Separator
    startY = currentY - 2;
    doc.setDrawColor(222, 226, 230);
    doc.line(leftMargin, startY, pageWidth - 14, startY);

    // --- TABLES ---
    const headStyles = {
        fillColor: [233, 236, 239],
        textColor: [33, 37, 41],
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2, // Reduced padding
        lineWidth: 0,
        fontSize: 8.5
    };
    const bodyStyles = {
        cellPadding: 2,
        textColor: [50, 50, 50],
        fontSize: 8.5,
        valign: 'middle' // Ensure text is centered vertically
    };
    const footStyles = {
        fillColor: [248, 249, 250],
        textColor: [33, 37, 41],
        fontStyle: 'bold',
        halign: 'right',
        fontSize: 9
    };
    const columnStyles = {
        0: { cellWidth: 85 }, // Concepto - Reduced needed width
        1: { halign: 'right', cellWidth: 35 }, // Importe
        2: { cellWidth: 'auto' } // Observaciones - Takes remaining space (wider)
    };

    // Table 1 Data
    const table1Body = [];
    const table1Rows = document.querySelectorAll('#tabla-transferencia tbody tr');
    table1Rows.forEach((row, index) => {
        if (index < table1Rows.length - 1) {
            // Need to wrap text manually if it's too long? AutoTable handles wrapping.
            // Just ensure we capture user input.
            table1Body.push([
                row.cells[0].innerText,
                parseFloat(row.querySelector('input[type="number"]').value).toFixed(2),
                row.querySelector('.observacion-input').value
            ]);
        }
    });
    const total1 = document.getElementById('totalTransferencia').textContent;

    // Title Table 1
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('Costo por trámite de transferencia', leftMargin, startY + 8);

    // Draw Table 1
    doc.autoTable({
        startY: startY + 11,
        head: [['CONCEPTO', 'IMPORTE (BS)', 'OBSERVACIONES']],
        body: table1Body,
        foot: [[{ content: 'Total', colSpan: 1, styles: { halign: 'right' } }, total1, '']],
        theme: 'plain',
        headStyles: headStyles,
        bodyStyles: bodyStyles,
        footStyles: footStyles,
        columnStyles: columnStyles,
        styles: { lineColor: [222, 226, 230], lineWidth: 0.1 },
        didParseCell: function (data) {
            data.cell.styles.lineColor = [222, 226, 230];
            data.cell.styles.lineWidth = 0.1;
        },
        margin: { left: leftMargin, right: 14 }
    });

    // Table 2 Data
    let finalY = doc.lastAutoTable.finalY;
    const table2Body = [];
    const table2Rows = document.querySelectorAll('#tabla-regularizacion tbody tr');
    table2Rows.forEach((row, index) => {
        if (index < table2Rows.length - 1) {
            const amountInput = row.querySelector('input[type="number"]');
            table2Body.push([
                row.cells[0].innerText,
                parseFloat(amountInput ? amountInput.value : row.cells[1].textContent).toFixed(2),
                row.querySelector('.observacion-input').value
            ]);
        }
    });
    const total2 = document.getElementById('totalGeneralConceptos').textContent;

    // Draw Table 2
    doc.autoTable({
        startY: finalY + 6, // Reduced gap between tables
        head: [['CONCEPTO', 'IMPORTE (BS)', 'OBSERVACIONES']],
        body: table2Body,
        foot: [[{ content: 'Total', colSpan: 1, styles: { halign: 'right' } }, total2, '']],
        theme: 'plain',
        headStyles: headStyles,
        bodyStyles: bodyStyles,
        footStyles: footStyles,
        columnStyles: columnStyles,
        styles: { lineColor: [222, 226, 230], lineWidth: 0.1 },
        didParseCell: function (data) {
            data.cell.styles.lineColor = [222, 226, 230];
            data.cell.styles.lineWidth = 0.1;
        },
        margin: { left: leftMargin, right: 14 }
    });

    // --- GRAND TOTAL ---
    finalY = doc.lastAutoTable.finalY + 10;

    // Check page break logic (unlikely with compression, but safe to keep)
    // Letter height 279mm. Safe area up to ~260mm.
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    const grandTotal = document.getElementById('totalGeneral').textContent;

    const boxWidth = 80;
    const boxX = pageWidth - boxWidth - 14;

    doc.setFillColor(241, 243, 245);
    doc.roundedRect(boxX, finalY, boxWidth, 18, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(73, 80, 87);
    doc.setFont('helvetica', 'bold');
    doc.text('Total General (Bs)', boxX + 5, finalY + 7);

    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text(grandTotal, pageWidth - 18, finalY + 14, { align: 'right' });

    // --- PAGE NUMBERS & FOOTER ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
    }

    // --- SAVE ---
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const contrato = document.getElementById('contrato').value.trim();
    const fileName = `Minuta_${nombreCliente.replace(/ /g, '_')}_${contrato}.pdf`;
    doc.save(fileName);
}
