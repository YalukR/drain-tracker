import { Injectable } from '@angular/core';
import { CleaningLog, Drain, LIQUID_COLORS } from '../models';

@Injectable({ providedIn: 'root' })
export class PdfService {

  async generate(logs: CleaningLog[], drains: Drain[]): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Header ──────────────────────────────────────────────────────────────
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Registro de Drenajes', 14, 16);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Informe no oficial — generado por la app de registro de drenajes', 14, 24);
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 14, 31);

    // ── Drenajes configurados ───────────────────────────────────────────────
    let y = 50;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Drenajes registrados', 14, y);
    y += 6;
    drains.forEach(d => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const since = new Date(d.startDate + 'T12:00:00').toLocaleDateString('es-MX', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      doc.text(`• ${d.label}  —  desde ${since}`, 18, y);
      y += 5;
    });
    y += 6;

    // ── Tabla principal ─────────────────────────────────────────────────────
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Historial de limpiezas', 14, y);
    y += 4;

    const rows: (string | { content: string; styles?: object })[][] = [];

    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      log.entries.forEach((entry, i) => {
        const colorLabel = LIQUID_COLORS.find(c => c.value === entry.liquidColor)?.label ?? '—';
        let clotInfo = '—';
        if (entry.hasClot) {
          const size = entry.clotSize === 'grande' ? 'Grande' : 'Pequeño';
          const status = entry.clotStatus === 'atascado' ? 'se atasó' : 'se drenó';
          clotInfo = `${size}, ${status}`;
        }
        const extras: string[] = [];
        if (i === 0) {
          if (log.bathed) extras.push('Baño');
          if (log.bandageChanged) extras.push('Vendaje');
          if (log.symptoms?.fever) extras.push(`Fiebre${log.symptoms.feverTemp ? ' ' + log.symptoms.feverTemp + '°C' : ''}`);
        }

        rows.push([
          i === 0 ? dateStr : '',
          i === 0 ? timeStr : '',
          entry.drainLabel,
          `${entry.amountMl} ml`,
          colorLabel,
          clotInfo,
          entry.leakingOutside ? 'Sí' : '—',
          i === 0 ? (extras.join(', ') || '—') : '',
        ]);
      });

      // Fila de síntomas si existen
      const s = log.symptoms;
      if (s) {
        const symptomList: string[] = [];
        if (s.redness) symptomList.push('Enrojecimiento');
        if (s.numbness) symptomList.push('Adormecimiento');
        if (s.suctionSensation) symptomList.push('Sensación de vacío');
        if (s.tingling) symptomList.push('Pinchazos');
        if (s.itching) symptomList.push('Comezón');
        if (s.painLevel !== 'ninguno') symptomList.push(`Dolor ${s.painLevel}`);
        if (s.skinColorChange) symptomList.push(`Cambio de piel${s.bruiseColor ? ' (' + s.bruiseColor + ')' : ''}`);

        if (symptomList.length > 0) {
          rows.push([
            { content: `Síntomas: ${symptomList.join(', ')}`, styles: { fontStyle: 'italic', textColor: [100, 116, 139], colSpan: 8 } },
            '', '', '', '', '', '', ''
          ]);
        }
      }

      if (log.notes) {
        rows.push([
          { content: `Nota: ${log.notes}`, styles: { fontStyle: 'italic', textColor: [100, 116, 139], colSpan: 8 } },
          '', '', '', '', '', '', ''
        ]);
      }
    });

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Hora', 'Drenaje', 'Cantidad', 'Color', 'Coágulo', 'Fuga piel', 'Extras']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [6, 182, 212],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 13 },
        2: { cellWidth: 22 },
        3: { cellWidth: 16 },
        4: { cellWidth: 22 },
        5: { cellWidth: 28 },
        6: { cellWidth: 16 },
        7: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });

    // ── Footer ──────────────────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${pageCount}  —  Este documento no reemplaza el seguimiento médico profesional`,
        pageW / 2, 290, { align: 'center' }
      );
    }

    doc.save(`drenajes_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
