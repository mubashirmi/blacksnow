import { AlertTriangle, CheckCircle2, Download, FileText, Home, Loader2, PenLine, Trash2, Type, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type SignMode = 'draw' | 'write';

const BG = '#050608';
const ACCENT = '#2c7bbe';
const DANGER = '#ef4444';
const SUCCESS = '#22c55e';

// Signature font used to turn a typed name into a handwritten-style signature.
const SIGNATURE_FONT_FAMILY = 'Great Vibes';
const SIGNATURE_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

type Contract = {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    contractName: string;
    email: string;
    businessName: string;
    pdf: string;
    signed: boolean;
    authId: number;
};

type GetContractResponse = {
    contract: Contract;
};

declare global {
    // eslint-disable-next-line
    interface Window {
        pdfjsLib?: any;
    }
}

// ---- PDF.js CDN loader (frontend-only, avoids bundler issues) ----
const PDFJS_CDN_VERSION = '3.11.174';
let pdfjsCdnPromise: Promise<any> | null = null;

function loadPdfJsFromCdn(): Promise<any> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('PDF.js can only be loaded in the browser.'));
    }
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfjsCdnPromise) return pdfjsCdnPromise;

    pdfjsCdnPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-pdfjs-cdn="1"]');
        if (existing) {
            existing.addEventListener('load', () => {
                const lib = window.pdfjsLib;
                if (!lib) return reject(new Error('PDF.js loaded but pdfjsLib is missing.'));
                lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_CDN_VERSION}/pdf.worker.min.js`;
                resolve(lib);
            });
            existing.addEventListener('error', () => reject(new Error('Failed to load PDF.js (existing script).')));
            return;
        }

        const script = document.createElement('script');
        script.dataset.pdfjsCdn = '1';
        script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_CDN_VERSION}/pdf.min.js`;
        script.async = true;

        script.onload = () => {
            const lib = window.pdfjsLib;
            if (!lib) return reject(new Error('PDF.js loaded but pdfjsLib is missing.'));
            lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_CDN_VERSION}/pdf.worker.min.js`;
            resolve(lib);
        };

        script.onerror = () => reject(new Error('Failed to load PDF.js from CDN.'));
        document.head.appendChild(script);
    });

    return pdfjsCdnPromise;
}

const ContractSignPage: React.FC = () => {
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [contractId, setContractId] = useState<string>('');
    const [contract, setContract] = useState<Contract | null>(null);

    const [mode, setMode] = useState<SignMode>('draw');
    // ✅ NEW: typed name that becomes the signature (replaces image upload)
    const [typedName, setTypedName] = useState('');

    const [isSigning, setIsSigning] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isFetchingContract, setIsFetchingContract] = useState(false);
    const [isPdfFrameLoading, setIsPdfFrameLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Sign flow modals
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [signedPdfBlob, setSignedPdfBlob] = useState<Blob | null>(null);

    // Reject flow modals
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showRejectSuccessModal, setShowRejectSuccessModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
    });

    const sigCanvasRef = useRef<SignatureCanvas | null>(null);
    const sigWrapRef = useRef<HTMLDivElement | null>(null);
    const [sigSize, setSigSize] = useState({ width: 560, height: 180 });

    // Cache signature + PDF bytes so modal submit can regenerate PDF with updated name/businessName without re-signing/re-fetching.
    const cachedSigPngBytesRef = useRef<ArrayBuffer | null>(null);
    const cachedPdfBytesRef = useRef<ArrayBuffer | null>(null);
    const cachedPdfUrlRef = useRef<string>('');

    // Load the signature webfont once (used both for the on-screen preview and the canvas render).
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (document.querySelector('link[data-signature-font="1"]')) return;

        const link = document.createElement('link');
        link.dataset.signatureFont = '1';
        link.rel = 'stylesheet';
        link.href = SIGNATURE_FONT_HREF;
        document.head.appendChild(link);
    }, []);

    // Get contract ID from URL query
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) setContractId(id);
        else setError('Missing contract id in URL. Example: /contractsignature?id=27');
    }, []);

    // Fetch contract by ID and use returned PDF link
    useEffect(() => {
        if (!contractId) return;

        let cancelled = false;

        (async () => {
            setError(null);
            setIsFetchingContract(true);

            try {
                const res = await fetch(`/api/v2/contract?id=${encodeURIComponent(contractId)}`, {
                    method: 'GET',
                });

                if (!res.ok) {
                    throw new Error('Failed to load contract. Please check the contract id.');
                }

                const data = (await res.json()) as GetContractResponse;

                if (!data?.contract?.pdf) {
                    throw new Error('Contract PDF link not found in response.');
                }

                if (cancelled) return;

                setContract(data.contract);
                setPdfUrl(data.contract.pdf);

                setFormData({
                    name: data.contract.name ?? '',
                    businessName: data.contract.businessName ?? '',
                });

                // Pre-fill the typed signature with the contract name (only if the user hasn't typed yet)
                setTypedName((prev) => prev || (data.contract.name ?? ''));

                setIsPdfFrameLoading(true);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Something went wrong while loading the contract.';
                if (!cancelled) setError(msg);
            } finally {
                if (!cancelled) setIsFetchingContract(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [contractId]);

    // Responsive signature-area sizing.
    // Keep the canvas bitmap dimensions identical to its displayed dimensions so
    // pointer coordinates map 1:1 to the actual signature stroke position.
    useEffect(() => {
        const el = sigWrapRef.current;
        if (!el) return;

        const syncSignatureSize = () => {
            const width = Math.max(260, Math.floor(el.clientWidth));
            const height = Math.max(150, Math.round(width * 0.34));
            setSigSize((current) => (current.width === width && current.height === height ? current : { width, height }));
        };

        syncSignatureSize();

        const ro = new ResizeObserver(syncSignatureSize);
        ro.observe(el);
        return () => ro.disconnect();
    }, [mode]);

    useEffect(() => {
        if (!pdfUrl) return;
        setIsPdfFrameLoading(true);
        // Invalidate cached PDF bytes if URL changes
        if (cachedPdfUrlRef.current !== pdfUrl) {
            cachedPdfBytesRef.current = null;
            cachedPdfUrlRef.current = '';
        }
    }, [pdfUrl]);

    // Any change to the typed name invalidates the cached signature image
    useEffect(() => {
        cachedSigPngBytesRef.current = null;
    }, [typedName]);

    const accentStyle = useMemo(
        () =>
            ({
                ['--accent' as any]: ACCENT,
                ['--bg' as any]: BG,
            } as React.CSSProperties),
        []
    );

    const handleClearDrawing = () => {
        sigCanvasRef.current?.clear();
        cachedSigPngBytesRef.current = null;
    };

    // --- Helpers: ensure signature is BLACK on PDF ---
    const canvasToBlackPngBytes = async (srcCanvas: HTMLCanvasElement): Promise<ArrayBuffer> => {
        const canvas = document.createElement('canvas');
        canvas.width = srcCanvas.width;
        canvas.height = srcCanvas.height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas not supported.');

        // Copy pixels from the signature canvas
        ctx.drawImage(srcCanvas, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;

        // Detect if the image likely has an opaque white background
        const samples: Array<[number, number]> = [
            [0, 0],
            [canvas.width - 1, 0],
            [0, canvas.height - 1],
            [canvas.width - 1, canvas.height - 1],
            [Math.floor(canvas.width * 0.1), Math.floor(canvas.height * 0.1)],
            [Math.floor(canvas.width * 0.9), Math.floor(canvas.height * 0.1)],
            [Math.floor(canvas.width * 0.1), Math.floor(canvas.height * 0.9)],
            [Math.floor(canvas.width * 0.9), Math.floor(canvas.height * 0.9)],
        ];

        const idx = (x: number, y: number) => (y * canvas.width + x) * 4;
        let whiteOpaqueCount = 0;

        for (const [sx, sy] of samples) {
            const i = idx(Math.max(0, Math.min(canvas.width - 1, sx)), Math.max(0, Math.min(canvas.height - 1, sy)));
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const a = d[i + 3];
            if (a > 200 && r > 245 && g > 245 && b > 245) whiteOpaqueCount++;
        }

        const hasWhiteBg = whiteOpaqueCount >= Math.ceil(samples.length * 0.75);

        // Recolor strokes to pure black; if there's a white background, make it transparent
        for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const a = d[i + 3];

            if (a === 0) continue;

            if (hasWhiteBg && r > 245 && g > 245 && b > 245) {
                // Remove white background
                d[i + 3] = 0;
                continue;
            }

            // Force signature pixels to black
            d[i] = 0;
            d[i + 1] = 0;
            d[i + 2] = 0;
            // keep alpha
        }

        ctx.putImageData(imageData, 0, 0);

        const outDataUrl = canvas.toDataURL('image/png');
        const res = await fetch(outDataUrl);
        return await res.arrayBuffer();
    };

    /**
     * ✅ NEW: Render the typed name using the signature webfont into a transparent PNG (black ink).
     */
    const renderTypedSignatureToPngBytes = async (text: string): Promise<ArrayBuffer> => {
        const fontSize = 120;
        const paddingX = 40;
        const paddingY = 30;

        // Make sure the webfont is actually available before drawing to the canvas.
        try {
            const fonts = (document as any).fonts;
            if (fonts?.load) {
                await fonts.load(`${fontSize}px "${SIGNATURE_FONT_FAMILY}"`, text);
            }
            if (fonts?.ready) {
                await fonts.ready;
            }
        } catch {
            // Fall back to whatever font the browser can use.
        }

        const fontSpec = `${fontSize}px "${SIGNATURE_FONT_FAMILY}", cursive`;

        // Measure first so the canvas fits the signature nicely.
        const measureCanvas = document.createElement('canvas');
        const mctx = measureCanvas.getContext('2d');
        if (!mctx) throw new Error('Canvas not supported.');
        mctx.font = fontSpec;

        const metrics = mctx.measureText(text);
        const textWidth = Math.max(1, Math.ceil(metrics.width));
        const ascent = Math.ceil(metrics.actualBoundingBoxAscent || fontSize * 0.85);
        const descent = Math.ceil(metrics.actualBoundingBoxDescent || fontSize * 0.35);

        const canvas = document.createElement('canvas');
        canvas.width = textWidth + paddingX * 2;
        canvas.height = ascent + descent + paddingY * 2;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas not supported.');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSpec;
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text, paddingX, paddingY + ascent);

        const outDataUrl = canvas.toDataURL('image/png');
        const res = await fetch(outDataUrl);
        return await res.arrayBuffer();
    };

    const getSignatureBlackPngBytes = async (): Promise<ArrayBuffer | null> => {
        if (mode === 'draw') {
            if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
                setError('Please draw your signature first.');
                return null;
            }
            const canvas = sigCanvasRef.current.getCanvas();
            // Ensure final bytes are BLACK regardless of UI penColor
            return await canvasToBlackPngBytes(canvas);
        }

        // ✅ write mode: typed name → signature font
        const name = typedName.trim();
        if (!name) {
            setError('Please type your name to generate your signature.');
            return null;
        }

        return await renderTypedSignatureToPngBytes(name);
    };

    const fetchPdfBytes = async (): Promise<ArrayBuffer> => {
        const pdfRes = await fetch(pdfUrl);
        if (!pdfRes.ok) throw new Error('Failed to fetch PDF. Check URL/CORS.');
        return await pdfRes.arrayBuffer();
    };

    const getPdfBytesCached = async (): Promise<ArrayBuffer> => {
        if (cachedPdfBytesRef.current && cachedPdfUrlRef.current === pdfUrl) return cachedPdfBytesRef.current;

        const bytes = await fetchPdfBytes();
        cachedPdfBytesRef.current = bytes;
        cachedPdfUrlRef.current = pdfUrl;
        return bytes;
    };

    const sanitizePdfText = (v: string) =>
        (v ?? '')
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();

    const wrapText = (font: any, text: string, fontSize: number, maxWidth: number): string[] => {
        const cleaned = sanitizePdfText(text);
        if (!cleaned) return [''];

        // If it already fits, keep it as one line
        try {
            if (font.widthOfTextAtSize(cleaned, fontSize) <= maxWidth) return [cleaned];
        } catch {
            // if measurement fails for any reason, fall back to a single line
            return [cleaned];
        }

        const words = cleaned.split(' ').filter(Boolean);
        const lines: string[] = [];
        let line = '';

        for (const w of words) {
            const next = line ? `${line} ${w}` : w;
            let fits = true;
            try {
                fits = font.widthOfTextAtSize(next, fontSize) <= maxWidth;
            } catch {
                fits = true;
            }

            if (fits) {
                line = next;
            } else {
                if (line) lines.push(line);
                line = w;
            }
        }

        if (line) lines.push(line);
        return lines.length ? lines : [''];
    };

    const drawNameBusinessOnLeft = (
        page: any,
        font: any,
        rgb: any,
        pageW: number,
        signatureWidth: number,
        margin: number,
        name: string,
        businessName: string
    ) => {
        const fontSize = 11;
        const lineHeight = 14;

        const safeName = sanitizePdfText(name);
        const safeBiz = sanitizePdfText(businessName);

        // Available width on the left so it doesn't collide with bottom-right signature
        const rightEdgeBeforeSignature = pageW - margin - signatureWidth - 12;
        const maxTextWidth = Math.max(140, rightEdgeBeforeSignature - margin);

        const label1 = `Name: ${safeName || ''}`.trim();
        const label2 = `Business: ${safeBiz || ''}`.trim();

        const lines1 = wrapText(font, label1, fontSize, maxTextWidth);
        const lines2 = wrapText(font, label2, fontSize, maxTextWidth);

        const allLines = [...lines1, ...lines2].filter((l) => l !== null && l !== undefined);

        const baseY = margin + 25; // bottom-left area
        const total = allLines.length;

        for (let i = 0; i < total; i++) {
            const textLine = allLines[i] ?? '';
            const y = baseY + (total - 1 - i) * lineHeight;

            // Avoid drawing empty placeholder lines unless both are empty
            if (!textLine && (safeName || safeBiz)) continue;

            page.drawText(textLine, {
                x: margin,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });
        }
    };

    const trySignWithPdfLib = async (pdfBytes: ArrayBuffer, sigPngBytes: ArrayBuffer, name: string, businessName: string): Promise<Blob> => {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        if (!pages.length) throw new Error('The PDF has no pages.');

        // Signature is always PNG and always black
        const image = await pdfDoc.embedPng(sigPngBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const lastPage = pages[pages.length - 1];

        const margin = 40;
        const pageW = lastPage.getWidth();
        const pageH = lastPage.getHeight();
        const maxW = Math.max(1, pageW - margin * 2);
        const maxH = Math.max(1, pageH - margin * 2);

        let scaleFactor = 0.5;
        let dims = image.scale(scaleFactor);

        // Ensure it fits inside the page
        const fit = Math.min(1, maxW / dims.width, maxH / dims.height);
        if (fit < 1) {
            scaleFactor = scaleFactor * fit;
            dims = image.scale(scaleFactor);
        }

        // ✅ Bottom-right placement (signature)
        const x = pageW - margin - dims.width;
        const y = margin + 17;

        lastPage.drawImage(image, {
            x,
            y,
            width: dims.width,
            height: dims.height,
        });

        // ✅ Print Name + Business Name on the LEFT side (bottom-left) of last page
        drawNameBusinessOnLeft(lastPage, font, rgb, pageW, dims.width, margin, name, businessName);

        const signedPdfBytes = await pdfDoc.save();
        return new Blob([signedPdfBytes], { type: 'application/pdf' });
    };

    /**
     * Frontend-only fallback for encrypted PDFs:
     * - Load PDF.js from CDN
     * - Render each page to an image (flatten)
     * - Build a fresh PDF via pdf-lib
     * - Draw signature on last page
     * - Draw name/businessName on last page (left side)
     */
    const signByRasterizingPdf = async (pdfBytes: ArrayBuffer, sigPngBytes: ArrayBuffer, name: string, businessName: string): Promise<Blob> => {
        const pdfjsLib = await loadPdfJsFromCdn();

        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });

        // If PDF requires a password, prompt the user
        loadingTask.onPassword = (updatePassword: (p: string) => void, reason: number) => {
            const need = reason === pdfjsLib.PasswordResponses?.NEED_PASSWORD;
            const msg = need ? 'This PDF is password-protected. Enter the password to continue:' : 'Incorrect password. Try again:';
            const pwd = window.prompt(msg);
            updatePassword(pwd ?? '');
        };

        const pdf = await loadingTask.promise;

        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const outDoc = await PDFDocument.create();
        const font = await outDoc.embedFont(StandardFonts.Helvetica);

        const renderScale = 2; // quality vs performance

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);

            const baseViewport = page.getViewport({ scale: 1 });
            const renderViewport = page.getViewport({ scale: renderScale });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported.');

            canvas.width = Math.floor(renderViewport.width);
            canvas.height = Math.floor(renderViewport.height);

            await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

            const dataUrl = canvas.toDataURL('image/png');
            const imgBytes = await (await fetch(dataUrl)).arrayBuffer();
            const img = await outDoc.embedPng(imgBytes);

            const outPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
            outPage.drawImage(img, {
                x: 0,
                y: 0,
                width: baseViewport.width,
                height: baseViewport.height,
            });
        }

        const outPages = outDoc.getPages();
        if (!outPages.length) throw new Error('The PDF has no pages.');
        const lastOutPage = outPages[outPages.length - 1];

        const sigImg = await outDoc.embedPng(sigPngBytes);

        const margin = 40;
        const pageW = lastOutPage.getWidth();
        const pageH = lastOutPage.getHeight();
        const maxW = Math.max(1, pageW - margin * 2);
        const maxH = Math.max(1, pageH - margin * 2);

        let sigScale = 0.5;
        let sigDims = sigImg.scale(sigScale);

        const fit = Math.min(1, maxW / sigDims.width, maxH / sigDims.height);
        if (fit < 1) {
            sigScale = sigScale * fit;
            sigDims = sigImg.scale(sigScale);
        }

        // ✅ Bottom-right placement (signature)
        const x = pageW - margin - sigDims.width;
        const y = margin + 17;

        lastOutPage.drawImage(sigImg, {
            x,
            y,
            width: sigDims.width,
            height: sigDims.height,
        });

        // ✅ Print Name + Business Name on the LEFT side (bottom-left) of last page
        drawNameBusinessOnLeft(lastOutPage, font, rgb, pageW, sigDims.width, margin, name, businessName);

        const signedPdfBytes = await outDoc.save();
        return new Blob([signedPdfBytes], { type: 'application/pdf' });
    };

    const createSignedPdf = async (nameForPdf: string, businessNameForPdf: string, preferCachedBytes = false): Promise<Blob | null> => {
        try {
            const safeName = sanitizePdfText(nameForPdf);
            const safeBiz = sanitizePdfText(businessNameForPdf);

            // Signature bytes
            let sigPngBytes: ArrayBuffer | null = null;

            if (preferCachedBytes && cachedSigPngBytesRef.current) {
                sigPngBytes = cachedSigPngBytesRef.current;
            } else {
                sigPngBytes = await getSignatureBlackPngBytes();
                if (!sigPngBytes) return null;
                cachedSigPngBytesRef.current = sigPngBytes;
            }

            // PDF bytes (cache by URL)
            const pdfBytes = await getPdfBytesCached();

            try {
                // fast path for normal PDFs
                return await trySignWithPdfLib(pdfBytes, sigPngBytes, safeName, safeBiz);
            } catch {
                // encrypted or unsupported → rasterize fallback (frontend-only)
                return await signByRasterizingPdf(pdfBytes, sigPngBytes, safeName, safeBiz);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong while signing the PDF.';
            setError(msg);
            return null;
        }
    };

    const handleSignClick = async () => {
        setError(null);

        if (!contractId) {
            setError('Missing contract id in URL.');
            return;
        }

        if (!pdfUrl) {
            setError('PDF URL not loaded yet.');
            return;
        }

        setIsSigning(true);

        // Generate a signed PDF immediately using current form values (pre-filled from backend).
        // On Submit we regenerate again to ensure the PDF matches the final edited fields.
        const blob = await createSignedPdf(formData.name, formData.businessName);

        if (blob) {
            setSignedPdfBlob(blob);
            setShowModal(true);
        }

        setIsSigning(false);
    };

    // ✅ This PUT now sends the SIGNED PDF (signature + name + businessName)
    const handleModalSubmit = async () => {
        if (!formData.name.trim() || !formData.businessName.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        setError(null);
        setIsSigning(true);

        try {
            // Regenerate the PDF using the final (edited) name/businessName.
            // Prefer cached signature + PDF bytes for reliability and speed.
            const finalBlob = await createSignedPdf(formData.name.trim(), formData.businessName.trim(), true);
            if (!finalBlob) {
                setIsSigning(false);
                return;
            }

            setSignedPdfBlob(finalBlob);

            const fd = new FormData();
            fd.append('name', formData.name.trim());
            fd.append('businessName', formData.businessName.trim());
            fd.append('signed', 'signed');

            // Use a File so backends that rely on filename/mimetype don’t drop it.
            const signedFile = new File([finalBlob], 'signed-contract.pdf', { type: 'application/pdf' });
            fd.append('pdf', signedFile);

            const response = await fetch(`/api/v2/contract?id=${encodeURIComponent(contractId)}`, {
                method: 'PUT',
                body: fd,
            });

            if (!response.ok) {
                throw new Error('Failed to update contract. Please try again.');
            }

            setShowModal(false);
            setShowSuccessModal(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong while updating the contract.';
            setError(msg);
        } finally {
            setIsSigning(false);
        }
    };

    const handleRejectClick = () => {
        setError(null);
        if (!contractId) {
            setError('Missing contract id in URL.');
            return;
        }
        setShowRejectModal(true);
    };

    const handleRejectSubmit = async () => {
        setError(null);
        setIsRejecting(true);

        try {
            const fd = new FormData();
            fd.append('signed', 'rejected');

            const response = await fetch(`/api/v2/contract?id=${encodeURIComponent(contractId)}`, {
                method: 'PUT',
                body: fd,
            });

            if (!response.ok) {
                throw new Error('Failed to reject contract. Please try again.');
            }

            setShowRejectModal(false);
            setShowRejectSuccessModal(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong while rejecting the contract.';
            setError(msg);
        } finally {
            setIsRejecting(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!signedPdfBlob) return;

        const url = URL.createObjectURL(signedPdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'signed-contract.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const goHome = () => {
        window.location.href = '/';
    };

    const actionsDisabled = isSigning || isRejecting || isFetchingContract || !pdfUrl;

    return (
        <div className='min-h-screen px-4 py-8 sm:px-6 lg:px-8' style={{ backgroundColor: BG, ...accentStyle }}>
            <div
                aria-hidden
                className='pointer-events-none fixed inset-0 opacity-50'
                style={{
                    background:
                        'radial-gradient(900px 450px at 20% 10%, rgba(44,123,190,0.22), transparent 60%), radial-gradient(800px 400px at 80% 15%, rgba(44,123,190,0.16), transparent 55%), radial-gradient(900px 450px at 50% 90%, rgba(44,123,190,0.10), transparent 60%)',
                }}
            />

            <div className='relative mx-auto max-w-7xl'>
                <div className='grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3'>
                    <section className='h-full lg:col-span-2'>
                        <div className='h-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-6'>
                            <div className='mb-4 flex items-center justify-between gap-3'>
                                <div className='flex items-center gap-3'>
                                    <div className='flex h-10 w-10 items-center justify-center rounded-xl' style={{ backgroundColor: 'rgba(44,123,190,0.20)' }}>
                                        <FileText className='h-5 w-5' style={{ color: ACCENT }} />
                                    </div>
                                    <div>
                                        <h1 className='text-xl font-semibold tracking-tight text-white sm:text-2xl'>Contract Preview</h1>
                                        {contract?.contractName ? (
                                            <p className='mt-0.5 text-xs text-white/50'>{contract.contractName}</p>
                                        ) : (
                                            <p className='mt-0.5 text-xs text-white/50'>Contract ID: {contractId || '—'}</p>
                                        )}
                                    </div>
                                </div>

                                {(isFetchingContract || isPdfFrameLoading) && (
                                    <div className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70'>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        Loading…
                                    </div>
                                )}
                            </div>

                            <div className='mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20'>
                                <div className='relative h-[55vh] min-h-[360px] w-full sm:h-[65vh] lg:h-[640px]'>
                                    {pdfUrl ? (
                                        <>
                                            <iframe src={pdfUrl} className='h-full w-full' title='PDF Preview' onLoad={() => setIsPdfFrameLoading(false)} />
                                            {isPdfFrameLoading && (
                                                <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                                                    <div className='inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80'>
                                                        <Loader2 className='h-4 w-4 animate-spin' />
                                                        Loading PDF…
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center'>
                                            <p className='text-sm text-white/60'>{isFetchingContract ? 'Loading contract…' : 'Enter a PDF URL to preview'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className='h-full lg:col-span-1'>
                        <div className='flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-6 lg:sticky lg:top-8 lg:p-7'>
                            <div className='mb-4'>
                                <h2 className='text-lg font-semibold text-white sm:text-xl'>Sign Contract</h2>
                                <p className='mt-1 text-sm text-white/60'>Add your signature to finalize this agreement.</p>
                            </div>

                            {/* ✅ Draw / Write toggle */}
                            <div className='mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-black/25 p-2'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setMode('draw');
                                        setError(null);
                                        cachedSigPngBytesRef.current = null;
                                    }}
                                    className={cx(
                                        'flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                                        mode === 'draw' ? 'text-white shadow' : 'text-white/60 hover:text-white'
                                    )}
                                    style={mode === 'draw' ? { backgroundColor: ACCENT, boxShadow: '0 10px 30px rgba(44,123,190,0.35)' } : undefined}
                                >
                                    <PenLine className='h-4 w-4' />
                                    Draw
                                </button>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setMode('write');
                                        setError(null);
                                        cachedSigPngBytesRef.current = null;
                                    }}
                                    className={cx(
                                        'flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                                        mode === 'write' ? 'text-white shadow' : 'text-white/60 hover:text-white'
                                    )}
                                    style={mode === 'write' ? { backgroundColor: ACCENT, boxShadow: '0 10px 30px rgba(44,123,190,0.35)' } : undefined}
                                >
                                    <Type className='h-4 w-4' />
                                    Write
                                </button>
                            </div>

                            <div className='flex flex-1 items-center'>
                                <div className='w-full'>
                                    {mode === 'draw' && (
                                        <div>
                                            <p className='mb-2 text-xs font-medium text-white/70'>Draw your signature</p>

                                            <div
                                                ref={sigWrapRef}
                                                className='relative w-full overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/20'
                                            >
                                                <SignatureCanvas
                                                    ref={sigCanvasRef}
                                                    // ✅ draw in black (PDF will always be black too)
                                                    penColor='#000000'
                                                    canvasProps={{
                                                        width: sigSize.width,
                                                        height: sigSize.height,
                                                        style: {
                                                            display: 'block',
                                                            width: `${sigSize.width}px`,
                                                            height: `${sigSize.height}px`,
                                                            maxWidth: '100%',
                                                            // ✅ light background so black ink is visible to user
                                                            backgroundColor: 'rgba(255,255,255,0.92)',
                                                            touchAction: 'none',
                                                        },
                                                    }}
                                                />

                                                <button
                                                    type='button'
                                                    onClick={handleClearDrawing}
                                                    className='absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/85 px-3 py-2 text-xs font-medium text-black/65 shadow-sm backdrop-blur transition hover:bg-white hover:text-black'
                                                >
                                                    <Trash2 className='h-3.5 w-3.5' />
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ✅ NEW: Write mode — type your name, it becomes a signature */}
                                    {mode === 'write' && (
                                        <div>
                                            <p className='mb-2 text-xs font-medium text-white/70'>Type your name — it becomes your signature</p>

                                            <input
                                                type='text'
                                                value={typedName}
                                                onChange={(e) => setTypedName(e.target.value)}
                                                placeholder='John Doe'
                                                autoComplete='name'
                                                className='w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:ring-2'
                                            />

                                            <div
                                                ref={sigWrapRef}
                                                className='mt-3 flex w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 px-4 py-6'
                                                style={{
                                                    height: sigSize.height,
                                                    backgroundColor: 'rgba(255,255,255,0.92)',
                                                }}
                                            >
                                                {typedName.trim() ? (
                                                    <span
                                                        className='w-full truncate text-center'
                                                        style={{
                                                            fontFamily: `"${SIGNATURE_FONT_FAMILY}", cursive`,
                                                            color: '#000000',
                                                            fontSize: 'clamp(30px, 7vw, 52px)',
                                                            lineHeight: 1.25,
                                                        }}
                                                    >
                                                        {typedName.trim()}
                                                    </span>
                                                ) : (
                                                    <span className='text-sm text-black/40'>Your signature preview</span>
                                                )}
                                            </div>

                                            <p className='mt-2 text-xs text-white/45'>This is how your signature will appear on the document.</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className='mt-4 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-sm text-red-200'>
                                            <AlertTriangle className='mt-0.5 h-4 w-4 flex-none' />
                                            <p className='leading-snug'>{error}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='mt-auto pt-5'>
                                {/* ✅ Accept (green) + Reject (red) on one line */}
                                <div className='grid grid-cols-2 gap-2 rounded-2xl bg-black/25 p-2'>
                                    <button
                                        type='button'
                                        onClick={handleSignClick}
                                        disabled={actionsDisabled}
                                        className={cx(
                                            'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white transition',
                                            actionsDisabled ? 'cursor-not-allowed bg-white/10 text-white/50' : 'hover:opacity-95'
                                        )}
                                        style={!actionsDisabled ? { backgroundColor: SUCCESS, boxShadow: '0 10px 30px rgba(34,197,94,0.35)' } : undefined}
                                    >
                                        {isSigning ? <Loader2 className='h-4 w-4 animate-spin' /> : <CheckCircle2 className='h-4 w-4' />}
                                        {isSigning ? 'Processing…' : isFetchingContract ? 'Loading…' : 'Accept'}
                                    </button>

                                    <button
                                        type='button'
                                        onClick={handleRejectClick}
                                        disabled={isSigning || isRejecting || isFetchingContract}
                                        className={cx(
                                            'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white transition',
                                            isSigning || isRejecting || isFetchingContract ? 'cursor-not-allowed bg-white/10 text-white/50' : 'hover:opacity-95'
                                        )}
                                        style={
                                            !isSigning && !isRejecting && !isFetchingContract
                                                ? { backgroundColor: DANGER, boxShadow: '0 10px 30px rgba(239,68,68,0.35)' }
                                                : undefined
                                        }
                                    >
                                        {isRejecting ? <Loader2 className='h-4 w-4 animate-spin' /> : <X className='h-4 w-4' />}
                                        {isRejecting ? 'Rejecting…' : 'Reject'}
                                    </button>
                                </div>

                                <p className='mt-4 text-xs leading-relaxed text-white/45'>
                                    Your signature, name, and business name will be added to the last page of the document.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Sign details modal */}
            {showModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-black/70 backdrop-blur' onClick={() => (!isSigning ? setShowModal(false) : null)} />

                    <div className='relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0c10] p-6 shadow-2xl shadow-black/40 sm:p-8'>
                        <button
                            type='button'
                            onClick={() => setShowModal(false)}
                            disabled={isSigning}
                            className='absolute right-4 top-4 rounded-4xl border bg-black/20 p-2 transition hover:bg-black/30 disabled:cursor-not-allowed'
                            aria-label='Close'
                            style={{ borderColor: ACCENT, color: ACCENT }}
                        >
                            <X className='h-4 w-4' />
                        </button>

                        <h3 className='text-xl font-semibold text-white sm:text-2xl'>Complete your signature</h3>
                        <p className='mt-2 text-sm text-white/60'>Provide your details to finalize the contract (these will also print on the PDF).</p>

                        <div className='mt-6 space-y-4'>
                            <div>
                                <label className='text-sm font-medium text-white/80'>Full name</label>
                                <input
                                    type='text'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder='John Doe'
                                    className='mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-2'
                                />
                            </div>

                            <div>
                                <label className='text-sm font-medium text-white/80'>Business name</label>
                                <input
                                    type='text'
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    placeholder='Acme Corporation'
                                    className='mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:ring-2'
                                />
                            </div>

                            {error && (
                                <div className='flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-sm text-red-200'>
                                    <AlertTriangle className='mt-0.5 h-4 w-4 flex-none' />
                                    <p className='leading-snug'>{error}</p>
                                </div>
                            )}
                        </div>

                        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
                            <button
                                type='button'
                                onClick={() => setShowModal(false)}
                                disabled={isSigning}
                                className='w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-black/30 hover:text-white disabled:cursor-not-allowed sm:w-1/2'
                            >
                                Cancel
                            </button>
                            <button
                                type='button'
                                onClick={handleModalSubmit}
                                disabled={isSigning}
                                className={cx(
                                    'w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition sm:w-1/2',
                                    isSigning ? 'cursor-not-allowed bg-white/15' : 'hover:opacity-95'
                                )}
                                style={!isSigning ? { backgroundColor: SUCCESS, boxShadow: '0 14px 40px rgba(34,197,94,0.25)' } : undefined}
                            >
                                {isSigning ? (
                                    <span className='inline-flex items-center gap-2'>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        Submitting…
                                    </span>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Signed success modal (UNCLOSEABLE: no X, no Close button, no backdrop close) */}
            {showSuccessModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-black/75 backdrop-blur' />

                    <div className='relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0c10] p-6 text-center shadow-2xl shadow-black/50 sm:p-10'>
                        <div
                            className='mx-auto flex h-16 w-16 items-center justify-center rounded-full'
                            style={{
                                backgroundColor: 'rgba(44,123,190,0.20)',
                                boxShadow: '0 18px 60px rgba(44,123,190,0.20)',
                            }}
                        >
                            <CheckCircle2 className='h-8 w-8' style={{ color: ACCENT }} />
                        </div>

                        <h3 className='mt-5 text-2xl font-semibold text-white sm:text-3xl'>Successfully signed</h3>
                        <p className='mt-3 text-sm leading-relaxed text-white/60 sm:text-base'>Your contract is signed and ready to download.</p>

                        <div className='mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                            <button
                                type='button'
                                onClick={handleDownloadPdf}
                                className='inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95'
                                style={{ backgroundColor: ACCENT, boxShadow: '0 14px 40px rgba(44,123,190,0.35)' }}
                            >
                                <Download className='h-4 w-4' />
                                Download PDF
                            </button>

                            <button
                                type='button'
                                onClick={goHome}
                                className='inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-black/30 hover:text-white'
                            >
                                <Home className='h-4 w-4' />
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject confirm modal */}
            {showRejectModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-black/70 backdrop-blur' onClick={() => (!isRejecting ? setShowRejectModal(false) : null)} />
                    <div className='relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0c10] p-6 shadow-2xl shadow-black/40 sm:p-8'>
                        <button
                            type='button'
                            onClick={() => setShowRejectModal(false)}
                            disabled={isRejecting}
                            className='absolute right-4 top-4 rounded-4xl border bg-black/20 p-2 transition hover:bg-black/30 disabled:cursor-not-allowed'
                            aria-label='Close'
                            style={{ borderColor: DANGER, color: DANGER }}
                        >
                            <X className='h-4 w-4' />
                        </button>

                        <h3 className='text-xl font-semibold text-white sm:text-2xl'>Reject contract?</h3>
                        <p className='mt-2 text-sm text-white/60'>
                            Are you sure you want to reject this contract? This will mark it as <span className='font-semibold text-white'>rejected</span>.
                        </p>

                        {error && (
                            <div className='mt-4 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-sm text-red-200'>
                                <AlertTriangle className='mt-0.5 h-4 w-4 flex-none' />
                                <p className='leading-snug'>{error}</p>
                            </div>
                        )}

                        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
                            <button
                                type='button'
                                onClick={() => setShowRejectModal(false)}
                                disabled={isRejecting}
                                className='w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-black/30 hover:text-white disabled:cursor-not-allowed sm:w-1/2'
                            >
                                Cancel
                            </button>
                            <button
                                type='button'
                                onClick={handleRejectSubmit}
                                disabled={isRejecting}
                                className={cx(
                                    'w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition sm:w-1/2',
                                    isRejecting ? 'cursor-not-allowed bg-white/15' : 'hover:opacity-95'
                                )}
                                style={!isRejecting ? { backgroundColor: DANGER, boxShadow: '0 14px 40px rgba(239,68,68,0.25)' } : undefined}
                            >
                                {isRejecting ? (
                                    <span className='inline-flex items-center gap-2'>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        Rejecting…
                                    </span>
                                ) : (
                                    'Yes, Reject'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Reject success modal (UNCLOSEABLE: no X, no Close button, no backdrop close) */}
            {showRejectSuccessModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-black/75 backdrop-blur' />

                    <div className='relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0c10] p-6 text-center shadow-2xl shadow-black/50 sm:p-10'>
                        <div
                            className='mx-auto flex h-16 w-16 items-center justify-center rounded-full'
                            style={{ backgroundColor: 'rgba(239,68,68,0.15)', boxShadow: '0 18px 60px rgba(239,68,68,0.18)' }}
                        >
                            <AlertTriangle className='h-8 w-8' style={{ color: DANGER }} />
                        </div>

                        <h3 className='mt-5 text-2xl font-semibold text-white sm:text-3xl'>Contract rejected</h3>
                        <p className='mt-3 text-sm leading-relaxed text-white/60 sm:text-base'>You successfully rejected the contract.</p>

                        <div className='mt-7 grid grid-cols-1 gap-3'>
                            <button
                                type='button'
                                onClick={goHome}
                                className='inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-black/30 hover:text-white'
                            >
                                <Home className='h-4 w-4' />
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractSignPage;
