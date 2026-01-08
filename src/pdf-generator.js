import { jsPDF } from "jspdf";
import "jspdf-autotable";

export function generatePDF() {
    console.log("Starting PDF generation...");
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
    // --- CLIENT DATA ---
    // Compact this section to save vertical space
    let startY = 36; // Reduced from 42
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

        currentY += 3.5; // Reduced from 4.5

        // Values
        doc.setTextColor(33, 37, 41);
        if (item1.style === 'bold-lg') {
            doc.setFontSize(10); // Reduced from 10.5
            doc.setFont('helvetica', 'bold');
        } else {
            doc.setFontSize(9); // Reduced from 9.5
            doc.setFont('helvetica', 'bold');
        }

        doc.text(item1.value, leftMargin, currentY);
        if (item2) {
            if (item2.style === 'bold-lg') {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
            }
            doc.text(item2.value, rightMargin, currentY);
        }

        currentY += 7; // Reduced from 8.5
        if (item1.fullWidth) i--;
    }

    // Separator
    startY = currentY - 1; // Reduced from -2
    doc.setDrawColor(222, 226, 230);
    doc.line(leftMargin, startY, pageWidth - 14, startY);

    // --- IDENTIFY ACTIVE COMPANY SECTION ---
    const visibleSection = document.querySelector('.company-section:not(.d-none)');
    console.log("Visible Section:", visibleSection);
    if (!visibleSection) {
        console.error("No visible company section found");
        alert("Error: No visible company section found.");
        return;
    }

    const tables = visibleSection.querySelectorAll('table');
    const table1 = tables[0];
    const table2 = tables[1];

    // --- TABLES ---
    const headStyles = {
        fillColor: [233, 236, 239],
        textColor: [33, 37, 41],
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 1.5, // Reduced from 2
        lineWidth: 0,
        fontSize: 8 // Reduced from 8.5
    };
    const bodyStyles = {
        cellPadding: 1.5, // Reduced from 2
        textColor: [50, 50, 50],
        fontSize: 8, // Reduced from 8.5
        valign: 'middle'
    };
    const footStyles = {
        fillColor: [248, 249, 250],
        textColor: [33, 37, 41],
        fontStyle: 'bold',
        halign: 'right',
        fontSize: 8.5 // Reduced from 9
    };
    const columnStyles = {
        0: { cellWidth: 85 }, // Concepto - Reduced needed width
        1: { halign: 'right', cellWidth: 35 }, // Importe
        2: { cellWidth: 'auto' } // Observaciones - Takes remaining space (wider)
    };

    // Table 1 Data
    const table1Body = [];
    if (table1) {
        const table1Rows = table1.querySelectorAll('tbody tr');
        table1Rows.forEach((row, index) => {
            // Include valid rows, excluding the last one if it's typically the total row
            // A better check might be to see if it has inputs.
            if (index < table1Rows.length - 1) {
                const amountInput = row.querySelector('input[type="number"]');
                table1Body.push([
                    row.cells[0].innerText,
                    parseFloat(amountInput ? (amountInput.value || 0) : (row.cells[1].textContent || 0)).toFixed(2),
                    row.querySelector('.observacion-input') ? row.querySelector('.observacion-input').value : ''
                ]);
            }
        });
    }

    // Get total from the visible section
    const total1Element = visibleSection.querySelector('.totalTransferencia');
    const total1 = total1Element ? total1Element.textContent : '0.00';

    // Title Table 1
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    // Adjust title based on company selection if needed, or keep generic
    const title1 = visibleSection.querySelector('h4') ? visibleSection.querySelector('h4').textContent : 'Costo por trámite de transferencia';
    doc.text(title1, leftMargin, startY + 5); // Reduced from 8

    // Draw Table 1
    doc.autoTable({
        startY: startY + 7, // Reduced from 11
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
    let finalY = doc.lastAutoTable.finalY || (startY + 20);
    const table2Body = [];
    if (table2) {
        const table2Rows = table2.querySelectorAll('tbody tr');
        table2Rows.forEach((row, index) => {
            if (index < table2Rows.length - 1) {
                const amountInput = row.querySelector('input[type="number"]');
                table2Body.push([
                    row.cells[0].innerText,
                    parseFloat(amountInput ? (amountInput.value || 0) : (row.cells[1].textContent || 0)).toFixed(2),
                    row.querySelector('.observacion-input') ? row.querySelector('.observacion-input').value : ''
                ]);
            }
        });

        const total2Element = visibleSection.querySelector('.totalGeneralConceptos');
        const total2 = total2Element ? total2Element.textContent : '0.00';

        // Draw Table 2
        doc.autoTable({
            startY: finalY + 4, // Reduced from 6
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
        finalY = doc.lastAutoTable.finalY + 10;
    } else {
        finalY = finalY + 10;
    }

    // --- GRAND TOTAL ---

    // Check page break logic
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    const grandTotalElement = document.getElementById('totalGeneral');
    const grandTotal = grandTotalElement ? grandTotalElement.textContent : '0.00';

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

    console.log("Saving PDF:", fileName);
    try {
        doc.save(fileName);
        console.log("PDF Saved successfully.");
    } catch (e) {
        console.error("Error saving PDF:", e);
        alert("Error al guardar el PDF: " + e.message);
    }
}
