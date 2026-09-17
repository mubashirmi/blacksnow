'use client';

import { ArrowLeft, Building2, CheckCircle2, DollarSign, Download, FileText, Plus, Trash2, Upload, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

const PLATFORM_FEE_RATE = 0.08;
const ADMIN_AUTH_ID = 5;

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface CustomField {
    id: string;
    label: string;
    value: string;
}

interface InvoiceData {
    invoiceName: string; // ✅ editable (and used as API "name")
    invoiceNumber: string; // ✅ editable
    issueDate: string;
    dueDate: string;

    senderName: string;
    senderContact: string;

    clientName: string; // ✅ for contract "name"
    clientEmail: string; // ✅ for API "email"
    businessName: string; // ✅ for API "businessName"
    recipientContact: string; // address / notes

    items: InvoiceItem[];
    currency: string;
    tax: number;

    customFields: CustomField[];
    terms: string;
    logo: string | null;

    companyInfo: string;
    clientInfo: string;
    description: string;
    paymentInfo: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    children: React.ReactNode;
    closable?: boolean; // default true
}

function Modal({ isOpen, onClose, title, children, closable = true }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-fadeIn'>
                <div className='flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50'>
                    <h3 className='text-xl font-bold text-slate-800'>{title}</h3>
                    {closable && onClose && (
                        <button onClick={onClose} className='text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg p-2 transition-all'>
                            <X className='w-5 h-5' />
                        </button>
                    )}
                </div>
                <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>{children}</div>
            </div>
        </div>
    );
}

function formatCanvasText(value: string, fallback = '—'): string {
    const cleaned = value.trim();
    return cleaned || fallback;
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const paragraphs = String(text || '').split(/\r?\n/);
    const lines: string[] = [];

    paragraphs.forEach((paragraph, paragraphIndex) => {
        const words = paragraph.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
            lines.push('');
        } else {
            let currentLine = words[0];
            for (let index = 1; index < words.length; index += 1) {
                const testLine = `${currentLine} ${words[index]}`;
                if (context.measureText(testLine).width <= maxWidth) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = words[index];
                }
            }
            lines.push(currentLine);
        }

        if (paragraphIndex < paragraphs.length - 1) lines.push('');
    });

    return lines;
}

function drawWrappedCanvasText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines = Number.POSITIVE_INFINITY
): number {
    const lines = wrapCanvasText(context, text, maxWidth).slice(0, maxLines);

    lines.forEach((line, index) => {
        const isLastVisibleLine = index === lines.length - 1;
        const allLines = wrapCanvasText(context, text, maxWidth);
        const visibleLine = isLastVisibleLine && allLines.length > maxLines ? `${line.replace(/[.,;:]?$/, '')}…` : line;
        context.fillText(visibleLine, x, y + index * lineHeight);
    });

    return y + Math.max(lines.length, 1) * lineHeight;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.94): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to generate invoice file.'));
            },
            type,
            quality
        );
    });
}

function loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load an invoice image.'));
        image.src = source;
    });
}

function loadBlobImage(blob: Blob): Promise<HTMLImageElement> {
    const objectUrl = URL.createObjectURL(blob);
    return loadImage(objectUrl).finally(() => URL.revokeObjectURL(objectUrl));
}

async function createStampedInvoiceImage(invoice: InvoiceData, total: number, status: 'PAID' | 'UNPAID'): Promise<File> {
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the invoice image.');

    const pagePadding = 76;
    const contentWidth = canvas.width - pagePadding * 2;
    const blue = '#2563EB';
    const navy = '#0F172A';
    const slate = '#475569';
    const light = '#F8FAFC';
    const border = '#CBD5E1';

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = navy;
    context.fillRect(0, 0, canvas.width, 22);

    if (invoice.logo) {
        try {
            const logo = await loadImage(invoice.logo);
            const maxLogoWidth = 150;
            const maxLogoHeight = 110;
            const scale = Math.min(maxLogoWidth / logo.naturalWidth, maxLogoHeight / logo.naturalHeight, 1);
            const logoWidth = logo.naturalWidth * scale;
            const logoHeight = logo.naturalHeight * scale;
            context.drawImage(logo, pagePadding, 74, logoWidth, logoHeight);
        } catch {
            // A logo failure should not prevent invoice creation.
        }
    }

    // Branded heading. It stays in the top-right area but is left-aligned.
    context.textBaseline = 'top';
    context.textAlign = 'left';
    context.fillStyle = navy;
    context.font = '700 46px Arial';
    const headingX = canvas.width - pagePadding - 500;
    context.fillText('BLACKSNOW INVOICE', headingX, 78);

    context.strokeStyle = border;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(pagePadding, 236);
    context.lineTo(canvas.width - pagePadding, 236);
    context.stroke();

    const columnGap = 36;
    const columnWidth = (contentWidth - columnGap) / 2;
    const rightColumnX = pagePadding + columnWidth + columnGap;

    // Issue Date and Due Date sit directly above their matching billing boxes.
    const dateTop = 278;
    const dateHeight = 92;

    context.fillStyle = light;
    context.fillRect(pagePadding, dateTop, columnWidth, dateHeight);
    context.fillRect(rightColumnX, dateTop, columnWidth, dateHeight);
    context.strokeStyle = border;
    context.strokeRect(pagePadding, dateTop, columnWidth, dateHeight);
    context.strokeRect(rightColumnX, dateTop, columnWidth, dateHeight);

    context.fillStyle = blue;
    context.font = '700 17px Arial';
    context.fillText('ISSUE DATE', pagePadding + 24, dateTop + 18);
    context.fillText('DUE DATE', rightColumnX + 24, dateTop + 18);

    context.fillStyle = navy;
    context.font = '700 22px Arial';
    context.fillText(formatCanvasText(invoice.issueDate), pagePadding + 24, dateTop + 50);
    context.fillText(formatCanvasText(invoice.dueDate), rightColumnX + 24, dateTop + 50);

    // Bill From / Bill To.
    const detailsTop = dateTop + dateHeight + 24;
    const detailsHeight = 252;

    context.fillStyle = light;
    context.fillRect(pagePadding, detailsTop, columnWidth, detailsHeight);
    context.fillRect(rightColumnX, detailsTop, columnWidth, detailsHeight);
    context.strokeStyle = border;
    context.strokeRect(pagePadding, detailsTop, columnWidth, detailsHeight);
    context.strokeRect(rightColumnX, detailsTop, columnWidth, detailsHeight);

    context.fillStyle = blue;
    context.font = '700 18px Arial';
    context.fillText('BILL FROM', pagePadding + 28, detailsTop + 24);
    context.fillText('BILL TO', rightColumnX + 28, detailsTop + 24);

    context.fillStyle = navy;
    context.font = '700 27px Arial';
    context.fillText(formatCanvasText(invoice.senderName, 'Your Company'), pagePadding + 28, detailsTop + 64);
    context.fillText(formatCanvasText(invoice.clientName, 'Client Name'), rightColumnX + 28, detailsTop + 64);

    context.fillStyle = slate;
    context.font = '400 18px Arial';
    drawWrappedCanvasText(context, formatCanvasText(invoice.senderContact), pagePadding + 28, detailsTop + 108, columnWidth - 56, 25, 5);

    context.fillStyle = navy;
    context.font = '600 22px Arial';
    context.fillText(formatCanvasText(invoice.businessName, 'Client Business'), rightColumnX + 28, detailsTop + 106);
    context.fillStyle = slate;
    context.font = '400 18px Arial';
    context.fillText(formatCanvasText(invoice.clientEmail, 'Client email unavailable'), rightColumnX + 28, detailsTop + 146);
    drawWrappedCanvasText(context, formatCanvasText(invoice.recipientContact), rightColumnX + 28, detailsTop + 180, columnWidth - 56, 24, 2);

    let currentY = detailsTop + detailsHeight + 50;

    if (invoice.description.trim()) {
        context.fillStyle = '#EFF6FF';
        context.fillRect(pagePadding, currentY, contentWidth, 110);
        context.strokeStyle = '#93C5FD';
        context.strokeRect(pagePadding, currentY, contentWidth, 110);
        context.fillStyle = navy;
        context.font = '700 18px Arial';
        context.fillText('DESCRIPTION', pagePadding + 24, currentY + 18);
        context.fillStyle = slate;
        context.font = '400 17px Arial';
        drawWrappedCanvasText(context, invoice.description, pagePadding + 24, currentY + 49, contentWidth - 48, 23, 2);
        currentY += 140;
    }

    const tableTop = currentY;
    context.fillStyle = navy;
    context.fillRect(pagePadding, tableTop, contentWidth, 58);
    context.fillStyle = '#FFFFFF';
    context.font = '700 17px Arial';
    context.fillText('DESCRIPTION', pagePadding + 22, tableTop + 19);
    context.textAlign = 'center';
    context.fillText('QTY', pagePadding + 710, tableTop + 19);
    context.textAlign = 'right';
    context.fillText('RATE', pagePadding + 890, tableTop + 19);
    context.fillText('AMOUNT', canvas.width - pagePadding - 22, tableTop + 19);
    context.textAlign = 'left';

    const visibleItems = invoice.items.slice(0, 8);
    const rows = visibleItems.length > 0 ? visibleItems : [{ id: 'empty', description: 'No invoice items added', quantity: 0, rate: 0, amount: 0 }];
    const rowHeight = 62;

    rows.forEach((item, index) => {
        const rowTop = tableTop + 58 + index * rowHeight;
        context.fillStyle = index % 2 === 0 ? '#FFFFFF' : light;
        context.fillRect(pagePadding, rowTop, contentWidth, rowHeight);
        context.strokeStyle = border;
        context.beginPath();
        context.moveTo(pagePadding, rowTop + rowHeight);
        context.lineTo(canvas.width - pagePadding, rowTop + rowHeight);
        context.stroke();

        context.fillStyle = navy;
        context.font = '500 18px Arial';
        const description = item.description.trim() || 'Untitled item';
        const descriptionLines = wrapCanvasText(context, description, 585).slice(0, 2);
        descriptionLines.forEach((line, lineIndex) => context.fillText(line, pagePadding + 22, rowTop + 13 + lineIndex * 22));

        context.textAlign = 'center';
        context.fillText(String(item.quantity), pagePadding + 710, rowTop + 21);
        context.textAlign = 'right';
        context.fillText(`${invoice.currency} ${item.rate.toFixed(2)}`, pagePadding + 890, rowTop + 21);
        context.font = '700 18px Arial';
        context.fillText(`${invoice.currency} ${item.amount.toFixed(2)}`, canvas.width - pagePadding - 22, rowTop + 21);
        context.textAlign = 'left';
    });

    currentY = tableTop + 58 + rows.length * rowHeight + 36;

    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const summaryRows: Array<[string, string, boolean]> = [
        ['Subtotal', `${invoice.currency} ${subtotal.toFixed(2)}`, false],
        ['Tax', `${invoice.currency} ${invoice.tax.toFixed(2)}`, false],
        [`Platform fee (${(PLATFORM_FEE_RATE * 100).toFixed(0)}%)`, `${invoice.currency} ${platformFee.toFixed(2)}`, false],
        ['Total', `${invoice.currency} ${total.toFixed(2)}`, true],
    ];

    // Status and summary use matching boxes on the same row.
    const bottomBoxHeight = 270;
    const statusX = pagePadding;
    const summaryX = rightColumnX;

    context.fillStyle = light;
    context.fillRect(statusX, currentY, columnWidth, bottomBoxHeight);
    context.fillRect(summaryX, currentY, columnWidth, bottomBoxHeight);
    context.strokeStyle = border;
    context.strokeRect(statusX, currentY, columnWidth, bottomBoxHeight);
    context.strokeRect(summaryX, currentY, columnWidth, bottomBoxHeight);

    context.fillStyle = blue;
    context.font = '700 18px Arial';
    context.fillText('PAYMENT STATUS', statusX + 28, currentY + 24);
    context.fillText('SUMMARY', summaryX + 28, currentY + 24);

    const statusColor = status === 'PAID' ? '#16A34A' : '#DC2626';
    context.fillStyle = statusColor;
    context.font = '800 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(status, statusX + columnWidth / 2, currentY + bottomBoxHeight / 2 + 16);
    context.textAlign = 'left';
    context.textBaseline = 'top';

    summaryRows.forEach(([label, value, strong], index) => {
        const rowY = currentY + 64 + index * 44;
        context.fillStyle = strong ? navy : slate;
        context.font = strong ? '700 24px Arial' : '600 17px Arial';
        context.fillText(label, summaryX + 28, rowY);
        context.textAlign = 'right';
        context.fillStyle = strong ? blue : navy;
        context.fillText(value, summaryX + columnWidth - 28, rowY);
        context.textAlign = 'left';
    });

    const footerTop = Math.min(currentY + bottomBoxHeight + 40, 1490);

    if (invoice.paymentInfo.trim()) {
        context.fillStyle = navy;
        context.font = '700 17px Arial';
        context.fillText('PAYMENT INFORMATION', pagePadding, footerTop);
        context.fillStyle = slate;
        context.font = '400 16px Arial';
        drawWrappedCanvasText(context, invoice.paymentInfo, pagePadding, footerTop + 30, 600, 22, 3);
    }

    if (invoice.terms.trim()) {
        context.fillStyle = navy;
        context.font = '700 17px Arial';
        context.fillText('TERMS & CONDITIONS', pagePadding, footerTop + 112);
        context.fillStyle = slate;
        context.font = '400 15px Arial';
        drawWrappedCanvasText(context, invoice.terms, pagePadding, footerTop + 141, contentWidth, 21, 3);
    }

    context.fillStyle = '#94A3B8';
    context.font = '400 14px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.fillText('Generated electronically', canvas.width / 2, canvas.height - 34);

    const blob = await canvasToBlob(canvas);
    const safeInvoiceNumber = (invoice.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]+/g, '-');
    return new File([blob], `${safeInvoiceNumber}-${status.toLowerCase()}.jpg`, { type: 'image/jpeg' });
}

function latin1Bytes(value: string): Uint8Array {
    const bytes = new Uint8Array(value.length);
    for (let index = 0; index < value.length; index += 1) bytes[index] = value.charCodeAt(index) & 0xff;
    return bytes;
}

function concatByteArrays(chunks: Uint8Array[]): Uint8Array {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach((chunk) => {
        result.set(chunk, offset);
        offset += chunk.length;
    });
    return result;
}

function escapePdfString(value: string): string {
    return value.replace(/([\\()])/g, '\\$1');
}

function buildSinglePagePdfFromJpeg(
    jpegBytes: Uint8Array,
    imageWidth: number,
    imageHeight: number,
    paymentLink: string,
    linkRectangle: { x: number; y: number; width: number; height: number }
): Blob {
    const pageWidth = 595;
    const pageHeight = 842;
    const scaleX = pageWidth / imageWidth;
    const scaleY = pageHeight / imageHeight;
    const linkX1 = linkRectangle.x * scaleX;
    const linkX2 = (linkRectangle.x + linkRectangle.width) * scaleX;
    const linkY1 = pageHeight - (linkRectangle.y + linkRectangle.height) * scaleY;
    const linkY2 = pageHeight - linkRectangle.y * scaleY;

    const objectOffsets: number[] = [0];
    const chunks: Uint8Array[] = [];
    let byteLength = 0;

    const push = (chunk: Uint8Array) => {
        chunks.push(chunk);
        byteLength += chunk.length;
    };

    push(latin1Bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));

    const addTextObject = (objectNumber: number, body: string) => {
        objectOffsets[objectNumber] = byteLength;
        push(latin1Bytes(`${objectNumber} 0 obj\n${body}\nendobj\n`));
    };

    addTextObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
    addTextObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addTextObject(
        3,
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R /Annots [6 0 R] >>'
    );

    objectOffsets[4] = byteLength;
    push(
        latin1Bytes(
            `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
        )
    );
    push(jpegBytes);
    push(latin1Bytes('\nendstream\nendobj\n'));

    const contentStream = 'q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n';
    addTextObject(5, `<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`);

    addTextObject(
        6,
        `<< /Type /Annot /Subtype /Link /Rect [${linkX1.toFixed(2)} ${linkY1.toFixed(2)} ${linkX2.toFixed(2)} ${linkY2.toFixed(
            2
        )}] /Border [0 0 0] /A << /S /URI /URI (${escapePdfString(paymentLink)}) >> >>`
    );

    const crossReferenceOffset = byteLength;
    let crossReference = 'xref\n0 7\n0000000000 65535 f \n';
    for (let objectNumber = 1; objectNumber <= 6; objectNumber += 1) {
        crossReference += `${String(objectOffsets[objectNumber]).padStart(10, '0')} 00000 n \n`;
    }
    crossReference += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`;
    push(latin1Bytes(crossReference));

    return new Blob([concatByteArrays(chunks)], { type: 'application/pdf' });
}

function buildInvoicePdfFromJpeg(jpegBytes: Uint8Array, imageWidth: number, imageHeight: number): Blob {
    const pageWidth = 595;
    const pageHeight = 842;
    const scale = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
    const renderedWidth = imageWidth * scale;
    const renderedHeight = imageHeight * scale;
    const x = (pageWidth - renderedWidth) / 2;
    const y = (pageHeight - renderedHeight) / 2;

    const objectOffsets: number[] = [0];
    const chunks: Uint8Array[] = [];
    let byteLength = 0;

    const push = (chunk: Uint8Array) => {
        chunks.push(chunk);
        byteLength += chunk.length;
    };

    const addTextObject = (objectNumber: number, body: string) => {
        objectOffsets[objectNumber] = byteLength;
        push(latin1Bytes(`${objectNumber} 0 obj\n${body}\nendobj\n`));
    };

    push(latin1Bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
    addTextObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
    addTextObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addTextObject(
        3,
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>'
    );

    objectOffsets[4] = byteLength;
    push(
        latin1Bytes(
            `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
        )
    );
    push(jpegBytes);
    push(latin1Bytes('\nendstream\nendobj\n'));

    const contentStream = `q\n${renderedWidth.toFixed(2)} 0 0 ${renderedHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    addTextObject(5, `<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`);

    const crossReferenceOffset = byteLength;
    let crossReference = 'xref\n0 6\n0000000000 65535 f \n';
    for (let objectNumber = 1; objectNumber <= 5; objectNumber += 1) {
        crossReference += `${String(objectOffsets[objectNumber]).padStart(10, '0')} 00000 n \n`;
    }
    crossReference += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`;
    push(latin1Bytes(crossReference));

    return new Blob([concatByteArrays(chunks)], { type: 'application/pdf' });
}

async function createInvoiceDownloadPdf(invoiceImage: File, invoiceNumber: string): Promise<File> {
    const image = await loadBlobImage(invoiceImage);
    const jpegBytes = new Uint8Array(await invoiceImage.arrayBuffer());
    const pdfBlob = buildInvoicePdfFromJpeg(jpegBytes, image.naturalWidth, image.naturalHeight);
    const safeInvoiceNumber = (invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]+/g, '-');

    return new File([pdfBlob], `${safeInvoiceNumber}.pdf`, { type: 'application/pdf' });
}

function downloadFile(file: File): void {
    const objectUrl = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = file.name;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function createPaymentRequestPdf(paymentLink: string, unpaidInvoiceImage: File, invoiceNumber: string): Promise<File> {
    const invoiceImage = await loadBlobImage(unpaidInvoiceImage);
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the payment PDF.');

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#0F172A';
    context.fillRect(0, 0, canvas.width, 28);

    // Show the invoice/subscription image first.
    const imageTop = 55;
    const maxImageWidth = 1060;
    const maxImageHeight = 1480;
    const scale = Math.min(maxImageWidth / invoiceImage.naturalWidth, maxImageHeight / invoiceImage.naturalHeight);
    const renderedWidth = invoiceImage.naturalWidth * scale;
    const renderedHeight = invoiceImage.naturalHeight * scale;
    const imageX = (canvas.width - renderedWidth) / 2;

    context.shadowColor = 'rgba(15, 23, 42, 0.18)';
    context.shadowBlur = 20;
    context.shadowOffsetY = 7;
    context.drawImage(invoiceImage, imageX, imageTop, renderedWidth, renderedHeight);
    context.shadowColor = 'transparent';
    context.strokeStyle = '#CBD5E1';
    context.lineWidth = 2;
    context.strokeRect(imageX, imageTop, renderedWidth, renderedHeight);

    // Draw a clear payment button below the image. The PDF annotation makes
    // the entire button clickable without displaying the raw payment URL.
    const buttonText = paymentLink.includes('paymentType=subscription') ? 'PAY SUBSCRIPTION' : 'PAY INVOICE';
    const buttonBox = {
        x: 270,
        y: Math.min(imageTop + renderedHeight + 38, canvas.height - 142),
        width: 700,
        height: 92,
    };

    context.fillStyle = '#2563EB';
    context.fillRect(buttonBox.x, buttonBox.y, buttonBox.width, buttonBox.height);
    context.strokeStyle = '#1D4ED8';
    context.lineWidth = 3;
    context.strokeRect(buttonBox.x, buttonBox.y, buttonBox.width, buttonBox.height);

    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillStyle = '#FFFFFF';
    context.font = '700 27px Arial';
    context.fillText(buttonText, buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2);

    const pageJpeg = await canvasToBlob(canvas, 'image/jpeg', 0.95);
    const jpegBytes = new Uint8Array(await pageJpeg.arrayBuffer());
    const pdfBlob = buildSinglePagePdfFromJpeg(jpegBytes, canvas.width, canvas.height, paymentLink, buttonBox);
    const safeInvoiceNumber = (invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]+/g, '-');

    return new File([pdfBlob], `${safeInvoiceNumber}-payment-request.pdf`, { type: 'application/pdf' });
}

async function readApiResponse(response: Response): Promise<any> {
    const responseText = await response.text();
    if (!responseText) return {};

    try {
        return JSON.parse(responseText);
    } catch {
        return { message: responseText };
    }
}

function getCreatedInvoiceId(data: any): string | null {
    const possibleIds = [
        data?.invoice?.id,
        data?.invoice?._id,
        data?.data?.invoice?.id,
        data?.data?.invoice?._id,
        data?.data?.id,
        data?.data?._id,
        data?.newInvoice?.id,
        data?.newInvoice?._id,
        data?.invoiceId,
        data?.id,
        data?._id,
    ];

    const invoiceId = possibleIds.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
    return invoiceId === undefined ? null : String(invoiceId);
}

export default function InvoiceGenerator() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contractId = searchParams.get('contractId');

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const duePlus30 = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], []);

    const [invoice, setInvoice] = useState<InvoiceData>({
        invoiceName: 'Invoice',
        invoiceNumber: 'INV-0004',
        issueDate: '2025-12-09',
        dueDate: '2026-01-08',

        senderName: 'Your Company Name',
        senderContact: 'Address Line 1\nCity, State ZIP\nemail@company.com',

        clientName: '',
        clientEmail: '',
        businessName: 'Client Company Name',
        recipientContact: 'Client Address\nCity, State ZIP',

        items: [],
        currency: 'USD',
        tax: 0,

        customFields: [],
        terms: '',
        logo: null,

        companyInfo: '',
        clientInfo: '',
        description: '',
        paymentInfo: '',
    });

    const [modalState, setModalState] = useState({
        customField: false,
        companyInfo: false,
        clientInfo: false,
        description: false,
        paymentInfo: false,
        created: false,
    });

    const [tempData, setTempData] = useState({
        fieldLabel: '',
        fieldValue: '',
        companyInfo: '',
        clientInfo: '',
        description: '',
        paymentInfo: '',
    });

    const [isPrefilling, setIsPrefilling] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [creationStatus, setCreationStatus] = useState('');
    const [createdInvoicePdf, setCreatedInvoicePdf] = useState<File | null>(null);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    // Prefill from contractId when provided.
    useEffect(() => {
        if (!contractId) return;

        let cancelled = false;
        (async () => {
            try {
                setIsPrefilling(true);
                const res = await fetch(`/api/v2/contract?id=${encodeURIComponent(contractId)}`, { method: 'GET' });
                if (!res.ok) throw new Error('Failed to fetch contract');
                const data = await res.json();

                if (cancelled) return;
                const c = data?.contract;

                setInvoice((prev) => ({
                    ...prev,
                    invoiceName: c?.contractName ?? prev.invoiceName, // contractName -> Invoice name
                    clientName: c?.name ?? prev.clientName,
                    clientEmail: c?.email ?? prev.clientEmail,
                    businessName: c?.businessName ?? prev.businessName,
                }));
            } catch {
                alert('Failed to load contract info.');
            } finally {
                if (!cancelled) setIsPrefilling(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [contractId]);

    const openModal = (type: keyof typeof modalState) => {
        if (type === 'companyInfo') setTempData((t) => ({ ...t, companyInfo: invoice.companyInfo }));
        if (type === 'clientInfo') setTempData((t) => ({ ...t, clientInfo: invoice.clientInfo }));
        if (type === 'description') setTempData((t) => ({ ...t, description: invoice.description }));
        if (type === 'paymentInfo') setTempData((t) => ({ ...t, paymentInfo: invoice.paymentInfo }));
        setModalState((s) => ({ ...s, [type]: true }));
    };

    const closeModal = (type: keyof typeof modalState) => {
        setModalState((s) => ({ ...s, [type]: false }));
        setTempData({ fieldLabel: '', fieldValue: '', companyInfo: '', clientInfo: '', description: '', paymentInfo: '' });
    };

    const calculateSubtotal = () => invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const calculatePlatformFee = () => calculateSubtotal() * PLATFORM_FEE_RATE;
    const calculateTotal = () => calculateSubtotal() + invoice.tax + calculatePlatformFee();

    const addItem = () => {
        const newItem: InvoiceItem = { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 };
        setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setInvoice((prev) => ({
            ...prev,
            items: prev.items.map((item) => {
                if (item.id !== id) return item;
                const updated: InvoiceItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') updated.amount = updated.quantity * updated.rate;
                return updated;
            }),
        }));
    };

    const removeItem = (id: string) => setInvoice((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));

    const addCustomField = () => {
        if (tempData.fieldLabel && tempData.fieldValue) {
            const newField: CustomField = { id: Date.now().toString(), label: tempData.fieldLabel, value: tempData.fieldValue };
            setInvoice((prev) => ({ ...prev, customFields: [...prev.customFields, newField] }));
            closeModal('customField');
        }
    };

    const removeCustomField = (id: string) => setInvoice((prev) => ({ ...prev, customFields: prev.customFields.filter((f) => f.id !== id) }));

    const saveCompanyInfo = () => {
        setInvoice((prev) => ({ ...prev, companyInfo: tempData.companyInfo }));
        closeModal('companyInfo');
    };

    const saveClientInfo = () => {
        setInvoice((prev) => ({ ...prev, clientInfo: tempData.clientInfo }));
        closeModal('clientInfo');
    };

    const saveDescription = () => {
        setInvoice((prev) => ({ ...prev, description: tempData.description }));
        closeModal('description');
    };

    const savePaymentInfo = () => {
        setInvoice((prev) => ({ ...prev, paymentInfo: tempData.paymentInfo }));
        closeModal('paymentInfo');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setInvoice((prev) => ({ ...prev, logo: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const downloadPDF = async () => {
        if (isDownloadingPdf) return;

        try {
            const total = calculateTotal();
            if (total <= 0) throw new Error('Please add invoice items or enter a total greater than zero.');

            setIsDownloadingPdf(true);
            const unpaidImage = await createStampedInvoiceImage(invoice, total, 'UNPAID');
            const pdf = await createInvoiceDownloadPdf(unpaidImage, invoice.invoiceNumber);
            downloadFile(pdf);
        } catch (error: any) {
            alert(error?.message || 'Failed to download the invoice PDF.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // ✅ Create the stamped files, create the invoice, then email the payment-request PDF.
    const createInvoice = async () => {
        try {
            if (!invoice.clientName.trim()) throw new Error('Please enter the client name.');
            if (!invoice.clientEmail.trim()) throw new Error('Please enter the client email.');
            if (!invoice.businessName.trim()) throw new Error('Please enter the client business name.');
            if (calculateTotal() <= 0) throw new Error('Please add invoice items or enter a total greater than zero.');

            setIsCreating(true);
            setCreatedInvoicePdf(null);
            setCreationStatus('Preparing invoice images…');

            const total = calculateTotal();
            const [paidImage, unpaidImage] = await Promise.all([
                createStampedInvoiceImage(invoice, total, 'PAID'),
                createStampedInvoiceImage(invoice, total, 'UNPAID'),
            ]);
            const invoicePdf = await createInvoiceDownloadPdf(unpaidImage, invoice.invoiceNumber);
            setCreatedInvoicePdf(invoicePdf);

            setCreationStatus('Creating invoice…');

            const invoiceFormData = new FormData();
            invoiceFormData.append('name', invoice.clientName.trim());
            invoiceFormData.append('email', invoice.clientEmail.trim());
            invoiceFormData.append('businessName', invoice.businessName.trim());
            invoiceFormData.append('price', total.toFixed(2));
            invoiceFormData.append('authId', String(ADMIN_AUTH_ID));
            if (contractId) invoiceFormData.append('contractId', String(contractId));
            invoiceFormData.append('paidImage', paidImage);
            invoiceFormData.append('unpaidImage', unpaidImage);

            const invoiceResponse = await fetch('/api/v2/invoices', {
                method: 'POST',
                body: invoiceFormData,
            });

            const invoiceResponseData = await readApiResponse(invoiceResponse);
            if (!invoiceResponse.ok) throw new Error(invoiceResponseData?.message || 'Failed to create invoice.');

            const createdInvoiceId = getCreatedInvoiceId(invoiceResponseData);
            if (!createdInvoiceId) {
                throw new Error('Invoice was created, but the API response did not include its ID, so the payment PDF could not be generated.');
            }

            const paymentLink = `${window.location.origin}/invoicepaymentrequest?id=${encodeURIComponent(createdInvoiceId)}&paymentType=invoice`;

            setCreationStatus('Preparing payment PDF…');
            const paymentPdf = await createPaymentRequestPdf(paymentLink, unpaidImage, invoice.invoiceNumber);

            setCreationStatus('Emailing payment request…');
            const emailFormData = new FormData();
            emailFormData.append('to', invoice.clientEmail.trim());
            emailFormData.append('subject', `Payment request for invoice ${invoice.invoiceNumber}`);
            emailFormData.append(
                'text',
                `Hello ${invoice.clientName.trim()}, please find the invoice payment PDF attached. Click the payment button below the invoice inside the PDF to complete your payment.`
            );
            emailFormData.append('pdf', paymentPdf);

            const emailResponse = await fetch('/api/v5/send-email-with-pdf', {
                method: 'POST',
                body: emailFormData,
            });

            const emailResponseData = await readApiResponse(emailResponse);
            if (!emailResponse.ok) throw new Error(emailResponseData?.message || 'Invoice was created, but the payment email could not be sent.');

            // Success is displayed only after both POST requests finish successfully.
            setModalState((state) => ({ ...state, created: true }));
        } catch (error: any) {
            alert(error?.message || 'Failed to create and email the invoice.');
        } finally {
            setIsCreating(false);
            setCreationStatus('');
        }
    };

    const deleteInvoice = () => {
        if (confirm('Are you sure you want to clear this invoice?')) {
            setInvoice({
                invoiceName: 'Invoice',
                invoiceNumber: 'INV-0001',
                issueDate: today,
                dueDate: duePlus30,

                senderName: 'Your Company Name',
                senderContact: 'Address Line 1\nCity, State ZIP\nemail@company.com',

                clientName: '',
                clientEmail: '',
                businessName: 'Client Company Name',
                recipientContact: 'Client Address\nCity, State ZIP',

                items: [],
                currency: 'USD',
                tax: 0,

                customFields: [],
                terms: '',
                logo: null,

                companyInfo: '',
                clientInfo: '',
                description: '',
                paymentInfo: '',
            });
        }
    };

    // ✅ Close & go back
    const closeAndGoBack = () => {
        alert('Invoice is not saved.');
        router.push('/admin/dashboard/invoicecontractdashboard/invoice');
    };

    const goToInvoices = () => router.push('/admin/dashboard/invoicecontractdashboard/invoice');

    const downloadThenGo = () => {
        if (!createdInvoicePdf) {
            alert('The PDF is not ready. Please create the invoice again.');
            return;
        }

        downloadFile(createdInvoicePdf);
        router.push('/admin/dashboard/invoicecontractdashboard/invoice');
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8'>
            <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>

            {/* ✅ Loading overlay (contract prefill) */}
            {isPrefilling && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-sm text-center'>
                        <div className='w-8 h-8 mx-auto mb-3 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin' />
                        <p className='text-slate-800 font-semibold'>Loading contract…</p>
                        <p className='text-slate-500 text-sm mt-1'>Prefilling invoice details</p>
                    </div>
                </div>
            )}

            {/* ✅ Created modal (uncloseable) */}
            <Modal isOpen={modalState.created} title='Invoice Created' closable={false}>
                <div className='space-y-4'>
                    <div className='flex items-start gap-3'>
                        <CheckCircle2 className='w-6 h-6 text-green-600 mt-0.5' />
                        <div>
                            <p className='text-slate-800 font-bold'>Invoice created and emailed successfully!</p>
                            <p className='text-slate-600 text-sm mt-1'>What would you like to do next?</p>
                        </div>
                    </div>

                    <div className='flex gap-3 pt-2'>
                        <button
                            onClick={goToInvoices}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-md'
                        >
                            Back to invoices
                        </button>
                        <button
                            onClick={downloadThenGo}
                            className='flex-1 bg-slate-900 text-white rounded-lg py-3 font-semibold hover:bg-slate-800 transition-all shadow-md'
                        >
                            Download as PDF
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modals */}
            <Modal isOpen={modalState.customField} onClose={() => closeModal('customField')} title='Add Custom Field'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Field Label</label>
                        <input
                            type='text'
                            value={tempData.fieldLabel}
                            onChange={(e) => setTempData((t) => ({ ...t, fieldLabel: e.target.value }))}
                            placeholder='e.g., PO Number, Project ID'
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Field Value</label>
                        <input
                            type='text'
                            value={tempData.fieldValue}
                            onChange={(e) => setTempData((t) => ({ ...t, fieldValue: e.target.value }))}
                            placeholder='Enter the value'
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                        />
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={addCustomField}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Add Field
                        </button>
                        <button
                            onClick={() => closeModal('customField')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.companyInfo} onClose={() => closeModal('companyInfo')} title='Company Information'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Additional Company Details</label>
                        <textarea
                            value={tempData.companyInfo}
                            onChange={(e) => setTempData((t) => ({ ...t, companyInfo: e.target.value }))}
                            placeholder={'Tax ID: 123-45-6789\nRegistration Number: ABC123\nWebsite: www.company.com'}
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                            rows={5}
                        />
                        <p className='text-xs text-slate-500 mt-2'>Enter additional company information like tax ID, registration number, website, etc.</p>
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={saveCompanyInfo}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Save
                        </button>
                        <button
                            onClick={() => closeModal('companyInfo')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.clientInfo} onClose={() => closeModal('clientInfo')} title='Client Information'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Additional Client Details</label>
                        <textarea
                            value={tempData.clientInfo}
                            onChange={(e) => setTempData((t) => ({ ...t, clientInfo: e.target.value }))}
                            placeholder={'Contact Person: John Doe\nPhone: +1 234 567 8900\nAccount Number: ACC-12345'}
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                            rows={5}
                        />
                        <p className='text-xs text-slate-500 mt-2'>
                            Enter additional client information like contact person, phone number, account details, etc.
                        </p>
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={saveClientInfo}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Save
                        </button>
                        <button
                            onClick={() => closeModal('clientInfo')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.description} onClose={() => closeModal('description')} title='Invoice Description'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Description / Notes</label>
                        <textarea
                            value={tempData.description}
                            onChange={(e) => setTempData((t) => ({ ...t, description: e.target.value }))}
                            placeholder='This invoice is for professional services rendered during the month of December 2025...'
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                            rows={6}
                        />
                        <p className='text-xs text-slate-500 mt-2'>Add a description or note about this invoice that will appear prominently at the top.</p>
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={saveDescription}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Save
                        </button>
                        <button
                            onClick={() => closeModal('description')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.paymentInfo} onClose={() => closeModal('paymentInfo')} title='Payment Information'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Payment Instructions</label>
                        <textarea
                            value={tempData.paymentInfo}
                            onChange={(e) => setTempData((t) => ({ ...t, paymentInfo: e.target.value }))}
                            placeholder={
                                'Bank Name: ABC Bank\nAccount Number: 1234567890\nSWIFT Code: ABCDEF12\nPayment Methods: Bank Transfer, PayPal, Credit Card'
                            }
                            className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                            rows={6}
                        />
                        <p className='text-xs text-slate-500 mt-2'>Enter bank details, payment methods, or any payment-related instructions.</p>
                    </div>
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={savePaymentInfo}
                            className='flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl'
                        >
                            Save
                        </button>
                        <button
                            onClick={() => closeModal('paymentInfo')}
                            className='flex-1 bg-slate-200 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-300 transition-all'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6'>
                {/* Main Invoice Section */}
                <div id='invoice-print' className='lg:col-span-3 bg-white rounded-xl shadow-lg p-6 md:p-10 border border-slate-200'>
                    {/* Branded Header */}
                    <div className='flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-200'>
                        <div className='flex items-center gap-4'>
                            <label className='cursor-pointer no-print'>
                                <div className='w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all'>
                                    {invoice.logo ? (
                                        <Image width={100} height={100} src={invoice.logo} alt='Logo' className='w-full h-full object-contain rounded-lg' />
                                    ) : (
                                        <div className='text-center'>
                                            <Upload className='w-6 h-6 mx-auto text-slate-400 mb-1' />
                                            <span className='text-xs text-slate-500'>Logo</span>
                                        </div>
                                    )}
                                </div>
                                <input type='file' accept='image/*' onChange={handleLogoUpload} className='hidden' />
                            </label>
                        </div>

                        <div className='min-w-[280px] text-left'>
                            <h1 className='text-3xl font-bold text-slate-800 tracking-tight'>BLACKSNOW INVOICE</h1>
                        </div>
                    </div>

                    {/* Invoice Description */}
                    {invoice.description && (
                        <div className='mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 shadow-sm'>
                            <div className='flex items-start gap-3'>
                                <FileText className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                                <div>
                                    <h3 className='font-bold text-slate-800 mb-2'>Invoice Description</h3>
                                    <p className='text-slate-700 text-sm leading-relaxed whitespace-pre-wrap'>{invoice.description}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dates and Billing Section */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-7'>
                        <div className='space-y-3'>
                            <div className='bg-slate-50 p-4 rounded-xl border border-slate-200'>
                                <label className='block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2'>Issue Date</label>
                                <input
                                    type='date'
                                    value={invoice.issueDate}
                                    onChange={(e) => setInvoice((p) => ({ ...p, issueDate: e.target.value }))}
                                    className='w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                                />
                            </div>

                            <div className='bg-slate-50 p-6 rounded-xl border border-slate-200'>
                                <div className='flex items-center gap-3 mb-4 pb-3 border-b-2 border-slate-300'>
                                    <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
                                        <Building2 className='w-5 h-5 text-white' />
                                    </div>
                                    <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider'>Bill From</h3>
                                </div>

                                <input
                                    type='text'
                                    value={invoice.senderName}
                                    onChange={(e) => setInvoice((p) => ({ ...p, senderName: e.target.value }))}
                                    className='font-bold text-lg text-slate-800 mb-2 w-full border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                    placeholder='Your Company Name'
                                />
                                <textarea
                                    value={invoice.senderContact}
                                    onChange={(e) => setInvoice((p) => ({ ...p, senderContact: e.target.value }))}
                                    className='text-sm text-slate-600 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none resize-none bg-transparent leading-relaxed'
                                    placeholder='Your contact details'
                                    rows={3}
                                />

                                {invoice.companyInfo && (
                                    <div className='mt-4 pt-4 border-t border-slate-200'>
                                        <p className='text-xs text-slate-500 font-semibold mb-2'>ADDITIONAL INFO</p>
                                        <p className='text-sm text-slate-600 leading-relaxed whitespace-pre-wrap'>{invoice.companyInfo}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <div className='bg-slate-50 p-4 rounded-xl border border-slate-200'>
                                <label className='block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2'>Due Date</label>
                                <input
                                    type='date'
                                    value={invoice.dueDate}
                                    onChange={(e) => setInvoice((p) => ({ ...p, dueDate: e.target.value }))}
                                    className='w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                                />
                            </div>

                            <div className='bg-slate-50 p-6 rounded-xl border border-slate-200'>
                                <div className='flex items-center gap-3 mb-4 pb-3 border-b-2 border-slate-300'>
                                    <div className='w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center'>
                                        <User className='w-5 h-5 text-white' />
                                    </div>
                                    <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider'>Bill To</h3>
                                </div>

                                <input
                                    type='text'
                                    value={invoice.clientName}
                                    onChange={(e) => setInvoice((p) => ({ ...p, clientName: e.target.value }))}
                                    className='font-semibold text-base text-slate-800 mb-2 w-full border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                    placeholder='Client Name'
                                />

                                <input
                                    type='text'
                                    value={invoice.businessName}
                                    onChange={(e) => setInvoice((p) => ({ ...p, businessName: e.target.value }))}
                                    className='font-bold text-lg text-slate-800 mb-2 w-full border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                    placeholder='Client Business Name'
                                />

                                <input
                                    type='email'
                                    value={invoice.clientEmail}
                                    onChange={(e) => setInvoice((p) => ({ ...p, clientEmail: e.target.value }))}
                                    className='text-sm text-slate-700 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent mb-2'
                                    placeholder='client@email.com'
                                />

                                <textarea
                                    value={invoice.recipientContact}
                                    onChange={(e) => setInvoice((p) => ({ ...p, recipientContact: e.target.value }))}
                                    className='text-sm text-slate-600 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none resize-none bg-transparent leading-relaxed'
                                    placeholder='Client address / details'
                                    rows={3}
                                />

                                {invoice.clientInfo && (
                                    <div className='mt-4 pt-4 border-t border-slate-200'>
                                        <p className='text-xs text-slate-500 font-semibold mb-2'>ADDITIONAL INFO</p>
                                        <p className='text-sm text-slate-600 leading-relaxed whitespace-pre-wrap'>{invoice.clientInfo}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {invoice.customFields.length > 0 && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-7'>
                            {invoice.customFields.map((field) => (
                                <div key={field.id} className='flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200 group'>
                                    <label className='text-slate-700 font-semibold w-28'>{field.label}:</label>
                                    <span className='flex-1 text-slate-700'>{field.value}</span>
                                    <button
                                        onClick={() => removeCustomField(field.id)}
                                        className='no-print text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1.5 transition-all opacity-0 group-hover:opacity-100'
                                    >
                                        <X className='w-4 h-4' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Items Table */}
                    <div className='mb-8'>
                        {invoice.items.length > 0 && (
                            <div className='mb-4 overflow-x-auto'>
                                <div className='min-w-full bg-slate-50 rounded-lg p-4'>
                                    <div className='grid grid-cols-12 gap-3 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 pb-3 border-b-2 border-slate-300'>
                                        <div className='col-span-5'>Description</div>
                                        <div className='col-span-2 text-center'>Qty</div>
                                        <div className='col-span-2 text-right'>Rate</div>
                                        <div className='col-span-2 text-right'>Amount</div>
                                        <div className='col-span-1' />
                                    </div>

                                    {invoice.items.map((item) => (
                                        <div key={item.id} className='grid grid-cols-12 gap-3 mb-3 items-center bg-white rounded-lg p-3 shadow-sm'>
                                            <input
                                                type='text'
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                className='col-span-5 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                                                placeholder='Item description'
                                            />
                                            <input
                                                type='number'
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                className='col-span-2 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm'
                                                min='0'
                                            />
                                            <input
                                                type='number'
                                                value={item.rate}
                                                onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                className='col-span-2 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm'
                                                min='0'
                                                step='0.01'
                                            />
                                            <div className='col-span-2 px-3 py-2 text-slate-800 font-bold text-right text-sm'>
                                                {invoice.currency} {item.amount.toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className='col-span-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-2 transition-all no-print'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={addItem}
                            className='w-full border-2 border-dashed border-slate-300 rounded-lg py-5 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-semibold no-print'
                        >
                            <Plus className='w-5 h-5' />
                            Add Invoice Item
                        </button>
                    </div>

                    {/* Summary */}
                    <div className='flex justify-end mb-10'>
                        <div className='w-full md:w-96'>
                            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 shadow-md border border-slate-200'>
                                <div className='mb-5 pb-3 border-b border-slate-300'>
                                    <h3 className='font-bold text-slate-800 text-lg'>Summary</h3>
                                </div>

                                <div className='space-y-4'>
                                    <div className='flex justify-between text-slate-700'>
                                        <span className='font-medium'>Subtotal</span>
                                        <span className='font-bold'>
                                            {invoice.currency} {calculateSubtotal().toFixed(2)}
                                        </span>
                                    </div>

                                    <div className='flex justify-between text-slate-700'>
                                        <span className='font-medium'>Tax</span>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm text-slate-500'>{invoice.currency}</span>
                                            <input
                                                type='number'
                                                value={invoice.tax}
                                                onChange={(e) => setInvoice((p) => ({ ...p, tax: parseFloat(e.target.value) || 0 }))}
                                                className='w-24 text-right font-bold border-b-2 border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent'
                                                min='0'
                                                step='0.01'
                                                placeholder='0.00'
                                            />
                                        </div>
                                    </div>

                                    <div className='flex justify-between text-slate-700'>
                                        <span className='font-medium'>Platform fee (8%)</span>
                                        <span className='font-bold'>
                                            {invoice.currency} {calculatePlatformFee().toFixed(2)}
                                        </span>
                                    </div>

                                    <div className='flex justify-between text-slate-900 font-bold text-xl pt-4 border-t-2 border-slate-400'>
                                        <span>Total</span>
                                        <span className='text-blue-600'>
                                            {invoice.currency} {calculateTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {invoice.paymentInfo && (
                        <div className='mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500 shadow-sm'>
                            <div className='flex items-start gap-3'>
                                <DollarSign className='w-6 h-6 text-green-600 flex-shrink-0 mt-0.5' />
                                <div className='flex-1'>
                                    <h3 className='font-bold text-slate-800 mb-3 text-lg'>Payment Information</h3>
                                    <p className='text-slate-700 text-sm whitespace-pre-wrap leading-relaxed'>{invoice.paymentInfo}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Terms */}
                    {invoice.terms && (
                        <div className='mb-4 p-6 bg-slate-50 rounded-xl border border-slate-200'>
                            <h3 className='font-bold text-slate-800 mb-3 flex items-center gap-2'>
                                <FileText className='w-5 h-5' />
                                Terms & Conditions
                            </h3>
                            <p className='text-slate-700 text-sm whitespace-pre-wrap leading-relaxed'>{invoice.terms}</p>
                        </div>
                    )}

                    <textarea
                        value={invoice.terms}
                        onChange={(e) => setInvoice((p) => ({ ...p, terms: e.target.value }))}
                        className='w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none no-print text-sm'
                        placeholder='Enter terms and conditions...'
                        rows={3}
                    />
                </div>

                {/* Sidebar */}
                <div className='lg:col-span-1 no-print'>
                    <div className='bg-white rounded-xl shadow-lg p-5 space-y-3 sticky top-4 border border-slate-200'>
                        <h2 className='font-bold text-slate-800 text-lg mb-4 pb-3 border-b border-slate-200'>Invoice Actions</h2>

                        <button
                            onClick={() => openModal('customField')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <FileText className='w-4 h-4' />
                            Add Custom Field
                        </button>

                        <button
                            onClick={() => openModal('companyInfo')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <Building2 className='w-4 h-4' />
                            {invoice.companyInfo ? 'Edit' : 'Add'} Company Info
                        </button>

                        <button
                            onClick={() => openModal('clientInfo')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <User className='w-4 h-4' />
                            {invoice.clientInfo ? 'Edit' : 'Add'} Client Info
                        </button>

                        <button
                            onClick={() => openModal('description')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <FileText className='w-4 h-4' />
                            {invoice.description ? 'Edit' : 'Add'} Description
                        </button>

                        <button
                            onClick={() => openModal('paymentInfo')}
                            className='w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 rounded-lg py-3 hover:bg-blue-50 transition-all font-medium'
                        >
                            <DollarSign className='w-4 h-4' />
                            {invoice.paymentInfo ? 'Edit' : 'Add'} Payment Info
                        </button>

                        <div className='pt-4 space-y-3 border-t border-slate-200'>
                            {/* ✅ Save -> Create Invoice */}
                            <button
                                onClick={createInvoice}
                                disabled={isCreating}
                                className='w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
                            >
                                {isCreating ? creationStatus || 'Creating…' : 'Create Invoice'}
                            </button>

                            <button
                                // eslint-disable-next-line
                                onClick={() => void downloadPDF()}
                                disabled={isDownloadingPdf}
                                className='w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60'
                            >
                                <Download className='w-4 h-4' />
                                {isDownloadingPdf ? 'Preparing PDF…' : 'Download PDF'}
                            </button>

                            <button
                                onClick={deleteInvoice}
                                className='w-full flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg py-3 hover:bg-red-700 transition-all font-semibold shadow-md hover:shadow-lg'
                            >
                                <Trash2 className='w-4 h-4' />
                                Clear Invoice
                            </button>

                            {/* ✅ Close & Go back */}
                            <button
                                onClick={closeAndGoBack}
                                className='w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg py-3 hover:bg-slate-800 transition-all font-semibold shadow-md hover:shadow-lg'
                            >
                                <ArrowLeft className='w-4 h-4' />
                                Close &amp; Go back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
