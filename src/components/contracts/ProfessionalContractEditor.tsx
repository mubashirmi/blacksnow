/* eslint-disable */
import { Canvas, FabricImage, FabricObject, Line, Rect, Textbox } from 'fabric';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ProfessionalContractEditorProps = {
    authId: string;
    backHref: string;
    editorTitle?: string;
};

type PageSizeKey = 'letter' | 'a4';
type ZoomMode = 'fit' | 'custom';
type TemplateKind = 'service' | 'nda' | 'contractor';
type TemplateField = 'contractName' | 'recipientEmail';

type PageModel = {
    id: string;
    initialJson?: Record<string, unknown> | null;
};

type InspectorState = {
    isText: boolean;
    fontFamily: string;
    fontSize: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    fill: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    charSpacing: number;
    left: number;
    top: number;
    angle: number;
    opacity: number;
    locked: boolean;
};

type HistoryState = {
    undo: string[];
    redo: string[];
    timer?: ReturnType<typeof setTimeout>;
};

type SuccessState = {
    contractId: number;
    shareLink: string;
};

type EditorFabricObject = FabricObject & {
    dataField?: TemplateField;
    templateRole?: 'decoration' | 'template-field';
};

const PAGE_SIZES: Record<PageSizeKey, { label: string; width: number; height: number; pdfWidth: number; pdfHeight: number }> = {
    letter: {
        label: 'US Letter',
        width: 816,
        height: 1056,
        pdfWidth: 612,
        pdfHeight: 792,
    },
    a4: {
        label: 'A4',
        width: 794,
        height: 1123,
        pdfWidth: 595.28,
        pdfHeight: 841.89,
    },
};

const FONT_FAMILIES = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Garamond', 'Palatino', 'Verdana', 'Trebuchet MS', 'Courier New'];

const CLAUSES = [
    {
        label: 'Parties',
        heading: 'PARTIES',
        body: 'This Agreement is entered into between [Provider Name] ("Provider") and [Client Name] ("Client").',
    },
    {
        label: 'Services',
        heading: 'SERVICES',
        body: 'Provider will perform the services and deliverables described in this Agreement, including [scope, deliverables, milestones and deadlines].',
    },
    {
        label: 'Payment',
        heading: 'PAYMENT TERMS',
        body: 'Client will pay [amount/rate] according to the agreed schedule. Invoices are due within [number] days of receipt.',
    },
    {
        label: 'Confidentiality',
        heading: 'CONFIDENTIALITY',
        body: 'Each party will protect non-public business, technical, financial and customer information received from the other party and use it only for this Agreement.',
    },
    {
        label: 'Intellectual Property',
        heading: 'INTELLECTUAL PROPERTY',
        body: 'Ownership and licensing of work product, pre-existing materials and third-party materials will be handled as described in this section.',
    },
    {
        label: 'Termination',
        heading: 'TERMINATION',
        body: 'Either party may terminate this Agreement by providing [number] days written notice. Accrued fees and approved expenses remain payable.',
    },
    {
        label: 'Governing Law',
        heading: 'GOVERNING LAW',
        body: 'This Agreement will be governed by the laws of [State/Country], without regard to conflict-of-law principles.',
    },
];

const EMPTY_INSPECTOR: InspectorState = {
    isText: false,
    fontFamily: 'Arial',
    fontSize: 16,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    fill: '#111827',
    textAlign: 'left',
    lineHeight: 1.25,
    charSpacing: 0,
    left: 0,
    top: 0,
    angle: 0,
    opacity: 1,
    locked: false,
};

const makePageId = () => `page_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const CANVAS_SERIALIZED_PROPERTIES = ['dataField', 'templateRole'];

const normalizeObjectOrigin = <T extends FabricObject>(object: T) => {
    if (object.originX !== 'left' || object.originY !== 'top') {
        object.set({ originX: 'left', originY: 'top' });
    }
    object.setCoords();
    return object;
};

const isEditableKeyboardTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable ||
        Boolean(target.closest('[contenteditable="true"]'))
    );
};

const serializeCanvas = (canvas: Canvas) => canvas.toObject(CANVAS_SERIALIZED_PROPERTIES) as Record<string, unknown>;

const setObjectMetadata = <T extends FabricObject>(object: T, metadata: Pick<EditorFabricObject, 'dataField' | 'templateRole'>) => {
    Object.assign(object, metadata);
    return object;
};

const loadCanvasFromJson = async (canvas: Canvas, json: string | Record<string, unknown>) => {
    await canvas.loadFromJSON(json, (serializedObject, instance) => {
        const serialized = serializedObject as {
            dataField?: TemplateField;
            templateRole?: EditorFabricObject['templateRole'];
        };
        if (!instance) return;
        if (serialized.dataField) {
            Object.assign(instance as object, { dataField: serialized.dataField });
        }
        if (serialized.templateRole) {
            Object.assign(instance as object, { templateRole: serialized.templateRole });
        }
    });
};

const safePdfFileName = (name: string) => {
    const safe = (name || 'contract')
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .replace(/\s+/g, '-');
    return `${safe || 'contract'}.pdf`;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
        reader.readAsDataURL(file);
    });

const selectionTextStyle = (textbox: Textbox, key: string, fallback: unknown) => {
    if (textbox.isEditing && textbox.selectionStart !== textbox.selectionEnd) {
        const styles = textbox.getSelectionStyles(textbox.selectionStart, textbox.selectionEnd, true);
        const first = styles[0] as Record<string, unknown> | undefined;
        if (first && first[key] !== undefined) return first[key];
    }
    return (textbox as unknown as Record<string, unknown>)[key] ?? fallback;
};

function CanvasPage({
    page,
    sizeKey,
    zoom,
    active,
    snapEnabled,
    onReady,
    onDispose,
    onActivate,
    onSelectionChange,
    onObjectChange,
    onPageResize,
}: {
    page: PageModel;
    sizeKey: PageSizeKey;
    zoom: number;
    active: boolean;
    snapEnabled: boolean;
    onReady: (pageId: string, canvas: Canvas) => void;
    onDispose: (pageId: string) => void;
    onActivate: (pageId: string) => void;
    onSelectionChange: (pageId: string, canvas: Canvas) => void;
    onObjectChange: (pageId: string, canvas: Canvas) => void;
    onPageResize: (pageId: string, canvas: Canvas) => void;
}) {
    const elementRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRef = useRef<Canvas | null>(null);
    const snapRef = useRef(snapEnabled);
    const size = PAGE_SIZES[sizeKey];
    const sizeRef = useRef(size);
    const renderedSizeRef = useRef(size);

    useEffect(() => {
        snapRef.current = snapEnabled;
    }, [snapEnabled]);

    useEffect(() => {
        sizeRef.current = size;
    }, [size]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const canvas = new Canvas(element, {
            width: size.width,
            height: size.height,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
        });
        canvasRef.current = canvas;

        const syncSelection = () => {
            onActivate(page.id);
            onSelectionChange(page.id, canvas);
        };

        const changed = () => onObjectChange(page.id, canvas);
        const handleObjectAdded = (event: { target?: FabricObject }) => {
            if (event.target) normalizeObjectOrigin(event.target);
            changed();
        };

        const keepObjectOnPage = (target: FabricObject) => {
            const currentSize = sizeRef.current;
            const objectWidth = Math.max(1, target.getScaledWidth());
            const objectHeight = Math.max(1, target.getScaledHeight());
            const maxLeft = Math.max(0, currentSize.width - objectWidth);
            const maxTop = Math.max(0, currentSize.height - objectHeight);
            target.set({
                left: Math.min(maxLeft, Math.max(0, Number(target.left || 0))),
                top: Math.min(maxTop, Math.max(0, Number(target.top || 0))),
            });
            target.setCoords();
        };

        const moving = (event: { target?: FabricObject }) => {
            const target = event.target;
            if (!target) return;
            if (snapRef.current) {
                const grid = 8;
                if (typeof target.left === 'number') target.set('left', Math.round(target.left / grid) * grid);
                if (typeof target.top === 'number') target.set('top', Math.round(target.top / grid) * grid);
            }
            keepObjectOnPage(target);
        };

        canvas.on('mouse:down', syncSelection);
        canvas.on('selection:created', syncSelection);
        canvas.on('selection:updated', syncSelection);
        canvas.on('selection:cleared', syncSelection);
        canvas.on('object:modified', changed);
        canvas.on('object:added', handleObjectAdded);
        canvas.on('object:removed', changed);
        canvas.on('text:changed', changed);
        canvas.on('object:moving', moving);
        canvas.on('object:scaling', moving);

        const load = async () => {
            if (page.initialJson) {
                await loadCanvasFromJson(canvas, page.initialJson);
                canvas.backgroundColor = '#ffffff';
                canvas.requestRenderAll();
            }
            onReady(page.id, canvas);
            onSelectionChange(page.id, canvas);
        };
        void load();

        return () => {
            onDispose(page.id);
            void canvas.dispose();
            canvasRef.current = null;
        };
        // We intentionally initialize one Fabric canvas per page only once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.id]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const previousSize = renderedSizeRef.current;
        const wasResized = previousSize.width !== size.width || previousSize.height !== size.height;
        if (wasResized) {
            const widthRatio = size.width / previousSize.width;
            const heightRatio = size.height / previousSize.height;
            canvas.getObjects().forEach((object) => {
                object.set({
                    left: Number(object.left || 0) * widthRatio,
                    top: Number(object.top || 0) * heightRatio,
                    scaleX: Number(object.scaleX || 1) * widthRatio,
                    scaleY: Number(object.scaleY || 1) * widthRatio,
                });
                object.setCoords();
            });
        }
        canvas.setDimensions({ width: size.width, height: size.height });
        canvas.backgroundColor = '#ffffff';
        canvas.requestRenderAll();
        renderedSizeRef.current = size;
        if (wasResized) onPageResize(page.id, canvas);
    }, [onPageResize, page.id, size.height, size.width]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const frame = requestAnimationFrame(() => {
            canvas.calcOffset();
            canvas.requestRenderAll();
        });
        return () => cancelAnimationFrame(frame);
    }, [size.height, size.width, zoom]);

    return (
        <div
            className={`contract-editor-canvas-frame relative overflow-hidden rounded-sm bg-white shadow-[0_18px_55px_rgba(15,23,42,0.18)] ring-2 transition ${
                active ? 'ring-blue-500' : 'ring-transparent'
            }`}
            style={{
                width: size.width * zoom,
                height: size.height * zoom,
                minWidth: size.width * zoom,
                maxWidth: size.width * zoom,
                flexShrink: 0,
            }}
            onMouseDown={() => onActivate(page.id)}
        >
            <div
                className='contract-editor-canvas-surface absolute left-0 top-0'
                style={{
                    width: size.width,
                    height: size.height,
                    transform: `scale(${zoom})`,
                    transformOrigin: '0 0',
                }}
            >
                <canvas ref={elementRef} />
                <div className='pointer-events-none absolute inset-[48px] border border-dashed border-slate-300/70' />
            </div>
        </div>
    );
}

export default function ProfessionalContractEditor({ authId, backHref, editorTitle = 'Contract Studio' }: ProfessionalContractEditorProps) {
    const router = useRouter();
    const [contractName, setContractName] = useState('');
    const [email, setEmail] = useState('');
    const [pageSizeKey, setPageSizeKey] = useState<PageSizeKey>('letter');
    const [pages, setPages] = useState<PageModel[]>([{ id: makePageId(), initialJson: null }]);
    const [activePageId, setActivePageId] = useState<string>('');
    const [zoom, setZoom] = useState(0.72);
    const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
    const [snapEnabled, setSnapEnabled] = useState(true);
    const [inspector, setInspector] = useState<InspectorState>(EMPTY_INSPECTOR);
    const [isExporting, setIsExporting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SuccessState | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const canvasesRef = useRef(new Map<string, Canvas>());
    const historiesRef = useRef(new Map<string, HistoryState>());
    const restoringRef = useRef(false);
    const clipboardRef = useRef<FabricObject | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const mainViewportRef = useRef<HTMLElement | null>(null);

    const activePage = useMemo(() => pages.find((page) => page.id === activePageId) || pages[0], [pages, activePageId]);
    const activeCanvas = useCallback(() => canvasesRef.current.get(activePage?.id || '') || null, [activePage?.id]);
    const pageSize = PAGE_SIZES[pageSizeKey];
    const draftKey = useMemo(() => `blacksnow-contract-editor:${authId}`, [authId]);

    const updateFitZoom = useCallback(() => {
        const viewport = mainViewportRef.current;
        if (!viewport) return;
        const availableWidth = Math.max(120, viewport.clientWidth - 56);
        const nextZoom = Math.min(1, Math.max(0.16, availableWidth / pageSize.width));
        setZoom(Number(nextZoom.toFixed(3)));
        requestAnimationFrame(() => {
            viewport.scrollLeft = 0;
        });
    }, [pageSize.width]);

    const fitPageToViewport = useCallback(() => {
        setZoomMode('fit');
        updateFitZoom();
    }, [updateFitZoom]);

    const changeZoom = useCallback((amount: number) => {
        setZoomMode('custom');
        setZoom((value) => Math.min(1.2, Math.max(0.28, Number((value + amount).toFixed(2)))));
    }, []);

    useEffect(() => {
        if (zoomMode !== 'fit') return;
        const viewport = mainViewportRef.current;
        if (!viewport) return;
        updateFitZoom();
        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(updateFitZoom);
        observer.observe(viewport);
        return () => observer.disconnect();
    }, [updateFitZoom, zoomMode]);

    useEffect(() => {
        if (!activePageId && pages[0]) setActivePageId(pages[0].id);
    }, [activePageId, pages]);

    const snapshotCanvas = useCallback((canvas: Canvas) => JSON.stringify(serializeCanvas(canvas)), []);

    const pushHistory = useCallback(
        (pageId: string, canvas: Canvas, immediate = false) => {
            if (restoringRef.current) return;
            let history = historiesRef.current.get(pageId);
            if (!history) {
                history = { undo: [], redo: [] };
                historiesRef.current.set(pageId, history);
            }

            const commit = () => {
                const json = snapshotCanvas(canvas);
                if (history!.undo[history!.undo.length - 1] !== json) {
                    history!.undo.push(json);
                    if (history!.undo.length > 70) history!.undo.shift();
                    history!.redo = [];
                }
            };

            if (history.timer) clearTimeout(history.timer);
            if (immediate) commit();
            else history.timer = setTimeout(commit, 180);
        },
        [snapshotCanvas]
    );

    const syncTemplateFields = useCallback(
        (pageId: string, canvas: Canvas, recordHistory = true) => {
            const fieldValues: Record<TemplateField, string> = {
                contractName: contractName.trim() || 'Untitled contract',
                recipientEmail: email.trim() || 'Recipient not added',
            };

            let changed = false;
            canvas.getObjects().forEach((object) => {
                const dataField = (object as EditorFabricObject).dataField;
                if (!dataField || !(object instanceof Textbox)) return;
                const nextText = fieldValues[dataField];
                if (object.text === nextText) return;
                object.set('text', nextText);
                object.setCoords();
                changed = true;
            });
            if (!changed) return;
            canvas.requestRenderAll();
            if (recordHistory) pushHistory(pageId, canvas);
        },
        [contractName, email, pushHistory]
    );

    useEffect(() => {
        canvasesRef.current.forEach((canvas, pageId) => {
            syncTemplateFields(pageId, canvas);
        });
    }, [syncTemplateFields]);

    const syncInspector = useCallback((canvas: Canvas | null) => {
        const object = canvas?.getActiveObject();
        if (!object) {
            setInspector(EMPTY_INSPECTOR);
            return;
        }

        const left = Math.round(Number(object.left || 0));
        const top = Math.round(Number(object.top || 0));
        const angle = Math.round(Number(object.angle || 0));
        const opacity = Number(object.opacity ?? 1);
        const locked = Boolean(object.lockMovementX && object.lockMovementY && object.lockScalingX && object.lockScalingY);

        if (object instanceof Textbox) {
            setInspector({
                isText: true,
                fontFamily: String(selectionTextStyle(object, 'fontFamily', object.fontFamily || 'Arial')),
                fontSize: Number(selectionTextStyle(object, 'fontSize', object.fontSize || 16)),
                bold:
                    String(selectionTextStyle(object, 'fontWeight', object.fontWeight || 'normal')) === 'bold' ||
                    Number(selectionTextStyle(object, 'fontWeight', 400)) >= 600,
                italic: String(selectionTextStyle(object, 'fontStyle', object.fontStyle || 'normal')) === 'italic',
                underline: Boolean(selectionTextStyle(object, 'underline', object.underline || false)),
                strike: Boolean(selectionTextStyle(object, 'linethrough', object.linethrough || false)),
                fill: String(selectionTextStyle(object, 'fill', object.fill || '#111827')),
                textAlign: (object.textAlign as InspectorState['textAlign']) || 'left',
                lineHeight: Number(object.lineHeight || 1.25),
                charSpacing: Number(object.charSpacing || 0),
                left,
                top,
                angle,
                opacity,
                locked,
            });
            return;
        }

        setInspector((current) => ({ ...current, isText: false, left, top, angle, opacity, locked }));
    }, []);

    const registerCanvas = useCallback(
        (pageId: string, canvas: Canvas) => {
            canvasesRef.current.set(pageId, canvas);
            syncTemplateFields(pageId, canvas, false);
            pushHistory(pageId, canvas, true);
        },
        [pushHistory, syncTemplateFields]
    );

    const unregisterCanvas = useCallback((pageId: string) => {
        canvasesRef.current.delete(pageId);
        historiesRef.current.delete(pageId);
    }, []);

    const handleSelectionChange = useCallback(
        (pageId: string, canvas: Canvas) => {
            if (pageId === activePageId || !activePageId) syncInspector(canvas);
        },
        [activePageId, syncInspector]
    );

    const handleObjectChange = useCallback(
        (pageId: string, canvas: Canvas) => {
            pushHistory(pageId, canvas);
            if (pageId === activePageId) syncInspector(canvas);
        },
        [activePageId, pushHistory, syncInspector]
    );

    const handlePageResize = useCallback(
        (pageId: string, canvas: Canvas) => {
            historiesRef.current.set(pageId, {
                undo: [snapshotCanvas(canvas)],
                redo: [],
            });
            if (pageId === activePageId) syncInspector(canvas);
        },
        [activePageId, snapshotCanvas, syncInspector]
    );

    const selectObject = useCallback(
        (canvas: Canvas, object: FabricObject) => {
            canvas.setActiveObject(object);
            canvas.requestRenderAll();
            syncInspector(canvas);
        },
        [syncInspector]
    );

    const addText = useCallback(
        (preset: 'heading' | 'subheading' | 'body' | 'small' = 'body', text?: string) => {
            const canvas = activeCanvas();
            if (!canvas) return;
            const presets = {
                heading: { fontSize: 28, fontWeight: 'bold', width: 560, text: 'Contract heading' },
                subheading: { fontSize: 18, fontWeight: 'bold', width: 540, text: 'Section heading' },
                body: { fontSize: 14, fontWeight: 'normal', width: 570, text: 'Start typing your contract text here.' },
                small: { fontSize: 11, fontWeight: 'normal', width: 420, text: 'Small text' },
            } as const;
            const config = presets[preset];
            const current = canvas.getActiveObject();
            const nextTop = Math.min(
                pageSize.height - 130,
                Math.max(72, current ? Number(current.top || 72) + Number(current.getScaledHeight?.() || 0) + 24 : 72)
            );
            const object = new Textbox(text || config.text, {
                left: 72,
                top: nextTop,
                width: config.width,
                fontFamily: 'Arial',
                fontSize: config.fontSize,
                fontWeight: config.fontWeight,
                fill: '#111827',
                lineHeight: 1.25,
                editable: true,
                splitByGrapheme: false,
            });
            canvas.add(object);
            selectObject(canvas, object);
        },
        [activeCanvas, pageSize.height, selectObject]
    );

    const addClause = useCallback(
        (heading: string, body: string) => {
            const canvas = activeCanvas();
            if (!canvas) return;
            const current = canvas.getActiveObject();
            const y = Math.min(pageSize.height - 220, Math.max(72, current ? Number(current.top || 72) + Number(current.getScaledHeight?.() || 0) + 26 : 72));
            const headingBox = new Textbox(heading, {
                left: 72,
                top: y,
                width: 600,
                fontFamily: 'Arial',
                fontSize: 15,
                fontWeight: 'bold',
                fill: '#0f172a',
            });
            const bodyBox = new Textbox(body, {
                left: 72,
                top: y + 30,
                width: 630,
                fontFamily: 'Arial',
                fontSize: 13.5,
                lineHeight: 1.35,
                fill: '#1f2937',
            });
            canvas.add(headingBox, bodyBox);
            selectObject(canvas, bodyBox);
        },
        [activeCanvas, pageSize.height, selectObject]
    );

    const addLine = useCallback(() => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const line = new Line([0, 0, 420, 0], {
            left: 120,
            top: 220,
            stroke: '#475569',
            strokeWidth: 1.5,
        });
        canvas.add(line);
        selectObject(canvas, line);
    }, [activeCanvas, selectObject]);

    const addRectangle = useCallback(() => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const rect = new Rect({
            left: 150,
            top: 210,
            width: 300,
            height: 120,
            fill: 'rgba(255,255,255,0)',
            stroke: '#64748b',
            strokeWidth: 1.5,
            rx: 8,
            ry: 8,
        });
        canvas.add(rect);
        selectObject(canvas, rect);
    }, [activeCanvas, selectObject]);

    const addTable = useCallback(() => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const rows = 3;
        const columns = 3;
        const cellWidth = 185;
        const cellHeight = 52;
        const startX = 90;
        const startY = 260;
        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < columns; col += 1) {
                const x = startX + col * cellWidth;
                const y = startY + row * cellHeight;
                const border = new Rect({
                    left: x,
                    top: y,
                    width: cellWidth,
                    height: cellHeight,
                    fill: row === 0 ? '#f8fafc' : '#ffffff',
                    stroke: '#cbd5e1',
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                });
                const text = new Textbox(row === 0 ? `Heading ${col + 1}` : 'Edit cell', {
                    left: x + 8,
                    top: y + 14,
                    width: cellWidth - 16,
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fontWeight: row === 0 ? 'bold' : 'normal',
                    fill: '#0f172a',
                });
                canvas.add(border, text);
            }
        }
        canvas.requestRenderAll();
    }, [activeCanvas]);

    const addSignatureBlock = useCallback(() => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const y = 650;
        const leftX = 85;
        const rightX = 430;
        const makeSignatureColumn = (x: number, title: string) => {
            const titleBox = new Textbox(title, {
                left: x,
                top: y,
                width: 250,
                fontSize: 13,
                fontWeight: 'bold',
                fontFamily: 'Arial',
                fill: '#0f172a',
            });
            const signatureLine = new Line([0, 0, 250, 0], { left: x, top: y + 72, stroke: '#0f172a', strokeWidth: 1 });
            const signatureLabel = new Textbox('Signature', { left: x, top: y + 78, width: 120, fontSize: 10, fill: '#64748b' });
            const dateLine = new Line([0, 0, 120, 0], { left: x + 130, top: y + 72, stroke: '#0f172a', strokeWidth: 1 });
            const dateLabel = new Textbox('Date', { left: x + 130, top: y + 78, width: 80, fontSize: 10, fill: '#64748b' });
            const nameBox = new Textbox('Name: __________________________', { left: x, top: y + 110, width: 250, fontSize: 11.5, fill: '#334155' });
            canvas.add(titleBox, signatureLine, signatureLabel, dateLine, dateLabel, nameBox);
        };
        makeSignatureColumn(leftX, 'PROVIDER');
        makeSignatureColumn(rightX, 'CLIENT');
        canvas.requestRenderAll();
    }, [activeCanvas]);

    const addHeader = useCallback(() => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const header = new Textbox(contractName || 'YOUR COMPANY / CONTRACT', {
            left: 72,
            top: 26,
            width: pageSize.width - 144,
            fontFamily: 'Arial',
            fontSize: 10,
            fontWeight: 'bold',
            fill: '#64748b',
            textAlign: 'center',
            charSpacing: 80,
        });
        canvas.add(header);
        selectObject(canvas, header);
    }, [activeCanvas, contractName, pageSize.width, selectObject]);

    const addFooter = useCallback(() => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const footer = new Textbox('Confidential • Page', {
            left: 72,
            top: pageSize.height - 44,
            width: pageSize.width - 144,
            fontFamily: 'Arial',
            fontSize: 9.5,
            fill: '#94a3b8',
            textAlign: 'center',
        });
        canvas.add(footer);
        selectObject(canvas, footer);
    }, [activeCanvas, pageSize.height, pageSize.width, selectObject]);

    const addImage = useCallback(
        async (file: File) => {
            const canvas = activeCanvas();
            if (!canvas) return;
            setError(null);
            try {
                const dataUrl = await readFileAsDataUrl(file);
                const image = await FabricImage.fromURL(dataUrl);
                image.set({ left: 110, top: 130 });
                if (image.width && image.width > 300) image.scaleToWidth(300);
                canvas.add(image);
                selectObject(canvas, image);
            } catch (imageError) {
                setError(imageError instanceof Error ? imageError.message : 'Could not add the image.');
            }
        },
        [activeCanvas, selectObject]
    );

    const applyTextProperty = useCallback(
        (property: string, value: unknown) => {
            const canvas = activeCanvas();
            const object = canvas?.getActiveObject();
            if (!canvas || !(object instanceof Textbox)) return;
            if (object.isEditing && object.selectionStart !== object.selectionEnd) {
                object.setSelectionStyles({ [property]: value }, object.selectionStart, object.selectionEnd);
            } else {
                object.set(property as never, value as never);
            }
            object.setCoords();
            canvas.requestRenderAll();
            pushHistory(activePageId, canvas);
            syncInspector(canvas);
        },
        [activeCanvas, activePageId, pushHistory, syncInspector]
    );

    const applyObjectProperty = useCallback(
        (property: string, value: unknown) => {
            const canvas = activeCanvas();
            const object = canvas?.getActiveObject();
            if (!canvas || !object) return;
            object.set(property as never, value as never);
            object.setCoords();
            canvas.requestRenderAll();
            pushHistory(activePageId, canvas);
            syncInspector(canvas);
        },
        [activeCanvas, activePageId, pushHistory, syncInspector]
    );

    const deleteSelected = useCallback(() => {
        const canvas = activeCanvas();
        const active = canvas?.getActiveObject();
        if (!canvas || !active) return;
        const objects =
            'getObjects' in active && typeof (active as unknown as { getObjects?: () => FabricObject[] }).getObjects === 'function'
                ? (active as unknown as { getObjects: () => FabricObject[] }).getObjects()
                : [active];
        canvas.discardActiveObject();
        objects.forEach((object) => canvas.remove(object));
        canvas.requestRenderAll();
        syncInspector(canvas);
    }, [activeCanvas, syncInspector]);

    const copySelected = useCallback(async () => {
        const canvas = activeCanvas();
        const active = canvas?.getActiveObject();
        if (!active) return;
        clipboardRef.current = await active.clone();
        setStatusMessage('Copied');
        setTimeout(() => setStatusMessage(null), 900);
    }, [activeCanvas]);

    const pasteSelected = useCallback(async () => {
        const canvas = activeCanvas();
        const clipboard = clipboardRef.current;
        if (!canvas || !clipboard) return;
        const cloned = await clipboard.clone();
        cloned.set({
            left: Number(cloned.left || 0) + 18,
            top: Number(cloned.top || 0) + 18,
            evented: true,
        });
        canvas.add(cloned);
        selectObject(canvas, cloned);
        clipboardRef.current = await cloned.clone();
    }, [activeCanvas, selectObject]);

    const duplicateSelected = useCallback(async () => {
        const canvas = activeCanvas();
        const active = canvas?.getActiveObject();
        if (!canvas || !active) return;
        const cloned = await active.clone();
        cloned.set({ left: Number(active.left || 0) + 22, top: Number(active.top || 0) + 22 });
        canvas.add(cloned);
        selectObject(canvas, cloned);
    }, [activeCanvas, selectObject]);

    const changeLayer = useCallback(
        (direction: 'forward' | 'backward') => {
            const canvas = activeCanvas();
            const active = canvas?.getActiveObject();
            if (!canvas || !active) return;
            if (direction === 'forward') canvas.bringObjectForward(active);
            else canvas.sendObjectBackwards(active);
            canvas.requestRenderAll();
            pushHistory(activePageId, canvas);
        },
        [activeCanvas, activePageId, pushHistory]
    );

    const toggleLock = useCallback(() => {
        const canvas = activeCanvas();
        const active = canvas?.getActiveObject();
        if (!canvas || !active) return;
        const locked = !(active.lockMovementX && active.lockMovementY && active.lockScalingX && active.lockScalingY);
        active.set({
            lockMovementX: locked,
            lockMovementY: locked,
            lockScalingX: locked,
            lockScalingY: locked,
            lockRotation: locked,
        });
        canvas.requestRenderAll();
        syncInspector(canvas);
        pushHistory(activePageId, canvas);
    }, [activeCanvas, activePageId, pushHistory, syncInspector]);

    const undo = useCallback(async () => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const history = historiesRef.current.get(activePageId);
        if (!history || history.undo.length < 2) return;
        const current = history.undo.pop();
        if (current) history.redo.push(current);
        const previous = history.undo[history.undo.length - 1];
        if (!previous) return;
        restoringRef.current = true;
        try {
            await loadCanvasFromJson(canvas, previous);
            canvas.backgroundColor = '#ffffff';
            syncTemplateFields(activePageId, canvas, false);
            canvas.requestRenderAll();
            syncInspector(canvas);
        } finally {
            restoringRef.current = false;
        }
    }, [activeCanvas, activePageId, syncInspector, syncTemplateFields]);

    const redo = useCallback(async () => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const history = historiesRef.current.get(activePageId);
        const next = history?.redo.pop();
        if (!history || !next) return;
        restoringRef.current = true;
        try {
            await loadCanvasFromJson(canvas, next);
            canvas.backgroundColor = '#ffffff';
            syncTemplateFields(activePageId, canvas, false);
            canvas.requestRenderAll();
            history.undo.push(snapshotCanvas(canvas));
            syncInspector(canvas);
        } finally {
            restoringRef.current = false;
        }
    }, [activeCanvas, activePageId, snapshotCanvas, syncInspector, syncTemplateFields]);

    const addPage = useCallback(() => {
        const id = makePageId();
        setPages((current) => [...current, { id, initialJson: null }]);
        setActivePageId(id);
    }, []);

    const duplicatePage = useCallback(() => {
        const canvas = activeCanvas();
        if (!canvas) return;
        const id = makePageId();
        const initialJson = serializeCanvas(canvas);
        const index = pages.findIndex((page) => page.id === activePageId);
        setPages((current) => {
            const copy = [...current];
            copy.splice(index + 1, 0, { id, initialJson });
            return copy;
        });
        setActivePageId(id);
    }, [activeCanvas, activePageId, pages]);

    const deletePage = useCallback(() => {
        if (pages.length <= 1) return;
        const index = pages.findIndex((page) => page.id === activePageId);
        const next = pages[index + 1] || pages[index - 1];
        setPages((current) => current.filter((page) => page.id !== activePageId));
        if (next) setActivePageId(next.id);
    }, [activePageId, pages]);

    const insertTemplate = useCallback(
        (kind: TemplateKind) => {
            const canvas = activeCanvas();
            if (!canvas) return;
            if (canvas.getObjects().length > 0 && !window.confirm('Replace the current page content with this template?')) return;

            const templates = {
                service: {
                    title: 'SERVICE AGREEMENT',
                    eyebrow: 'PROFESSIONAL SERVICES • MASTER AGREEMENT',
                    description: 'A clear framework for scope, delivery, payment and ownership.',
                    accent: '#1d4ed8',
                    accentSoft: '#eff6ff',
                    accentBorder: '#bfdbfe',
                    partyA: 'SERVICE PROVIDER',
                    partyB: 'CLIENT',
                    sections: [
                        [
                            'PARTIES & EFFECTIVE DATE',
                            'This Agreement is entered into by [Provider legal name] and [Client legal name] and becomes effective on [effective date].',
                        ],
                        [
                            'SERVICES & DELIVERABLES',
                            'Provider will perform the services, milestones and deliverables described in an approved scope of work, including agreed acceptance criteria.',
                        ],
                        [
                            'FEES & PAYMENT',
                            'Client will pay [amount/rate] according to [schedule]. Undisputed invoices are due within [number] days of receipt.',
                        ],
                        [
                            'CLIENT RESPONSIBILITIES',
                            'Client will provide timely access, information, materials, decisions and approvals reasonably needed to complete the services.',
                        ],
                        [
                            'CHANGES & APPROVALS',
                            'Changes to scope, timing or price must be documented and approved by both parties before the additional work begins.',
                        ],
                        [
                            'INTELLECTUAL PROPERTY',
                            'Ownership of deliverables, pre-existing materials and third-party materials will transfer or remain licensed as specified here.',
                        ],
                        [
                            'CONFIDENTIALITY & DATA',
                            'Each party will protect confidential information and use it only to perform or receive services under this Agreement.',
                        ],
                        [
                            'TERM, TERMINATION & LAW',
                            'This Agreement continues until [date/completion]. Termination requires [number] days notice and is governed by the laws of [jurisdiction].',
                        ],
                    ],
                },
                nda: {
                    title: 'NON-DISCLOSURE AGREEMENT',
                    eyebrow: 'MUTUAL CONFIDENTIALITY • BUSINESS DISCUSSIONS',
                    description: 'A balanced structure for protecting information shared by either party.',
                    accent: '#4338ca',
                    accentSoft: '#eef2ff',
                    accentBorder: '#c7d2fe',
                    partyA: 'DISCLOSING PARTY',
                    partyB: 'RECEIVING PARTY',
                    sections: [
                        [
                            'PARTIES & PURPOSE',
                            'The parties wish to evaluate or pursue [business purpose] and may exchange Confidential Information solely for that purpose.',
                        ],
                        [
                            'CONFIDENTIAL INFORMATION',
                            'Protected information includes non-public business, financial, customer, product, technical and strategic information disclosed in any form.',
                        ],
                        [
                            'STANDARD OF CARE',
                            'The receiving party will protect Confidential Information with at least reasonable care and limit access to people who need it for the purpose.',
                        ],
                        [
                            'PERMITTED USE',
                            'Confidential Information may not be copied, reverse engineered or used for any purpose beyond the discussions without prior written permission.',
                        ],
                        [
                            'EXCLUSIONS',
                            'Protection does not apply to information lawfully known, independently developed, publicly available or received without a duty of confidentiality.',
                        ],
                        [
                            'REQUIRED DISCLOSURE',
                            'A legally required disclosure is permitted after prompt notice, where lawful, and reasonable cooperation to seek protective treatment.',
                        ],
                        [
                            'RETURN, DELETION & TERM',
                            'On request, protected materials will be returned or destroyed. These duties continue for [number] years, subject to trade-secret law.',
                        ],
                        [
                            'NO LICENSE & GOVERNING LAW',
                            'Disclosure grants no ownership or license. This Agreement is governed by the laws and courts of [jurisdiction].',
                        ],
                    ],
                },
                contractor: {
                    title: 'INDEPENDENT CONTRACTOR AGREEMENT',
                    eyebrow: 'INDEPENDENT SERVICES • WORK PRODUCT',
                    description: 'A practical agreement for engagement terms, delivery and independent status.',
                    accent: '#047857',
                    accentSoft: '#ecfdf5',
                    accentBorder: '#a7f3d0',
                    partyA: 'COMPANY',
                    partyB: 'CONTRACTOR',
                    sections: [
                        [
                            'ENGAGEMENT & SCOPE',
                            'Company engages Contractor to perform the services, milestones and deliverables stated in this Agreement or an approved statement of work.',
                        ],
                        [
                            'TERM & AVAILABILITY',
                            'The engagement begins on [date] and continues until [date/completion], subject to the scheduling and notice terms below.',
                        ],
                        [
                            'COMPENSATION & EXPENSES',
                            'Company will pay [amount/rate] under [billing schedule]. Expenses require written approval and supporting documentation.',
                        ],
                        [
                            'INDEPENDENT STATUS',
                            'Contractor controls the manner of work and is responsible for applicable taxes, insurance, equipment and ordinary business expenses.',
                        ],
                        [
                            'WORK PRODUCT & IP',
                            'Rights in specially commissioned work product will be assigned or licensed to Company as described, excluding identified background materials.',
                        ],
                        [
                            'CONFIDENTIALITY & SECURITY',
                            'Contractor will protect Company information, follow agreed security requirements and promptly report any suspected unauthorized access.',
                        ],
                        [
                            'REPRESENTATIONS & CONFLICTS',
                            'Contractor will perform professionally, avoid conflicting obligations and will not knowingly infringe third-party rights.',
                        ],
                        [
                            'TERMINATION & GOVERNING LAW',
                            'Either party may terminate with [number] days notice. Earned fees remain payable. The laws of [jurisdiction] govern.',
                        ],
                    ],
                },
            } as const;

            const template = templates[kind];
            const margin = 70;
            const contentWidth = pageSize.width - margin * 2;
            const makeDecoration = <T extends FabricObject>(object: T) => {
                object.set({ selectable: false, evented: false });
                return setObjectMetadata(object, { templateRole: 'decoration' });
            };
            const addTemplateObjects = (...objects: FabricObject[]) => {
                canvas.add(...objects.map((object) => normalizeObjectOrigin(object)));
            };

            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            canvas.calcOffset();

            const topAccent = makeDecoration(
                new Rect({
                    left: 0,
                    top: 0,
                    width: pageSize.width,
                    height: 11,
                    fill: template.accent,
                    strokeWidth: 0,
                })
            );
            const eyebrow = new Textbox(template.eyebrow, {
                left: margin,
                top: 43,
                width: contentWidth * 0.7,
                fontFamily: 'Arial',
                fontSize: 9.5,
                fontWeight: 'bold',
                fill: template.accent,
                charSpacing: 105,
            });
            const effectiveDate = new Textbox('EFFECTIVE  •  [DATE]', {
                left: margin + contentWidth * 0.68,
                top: 43,
                width: contentWidth * 0.32,
                fontFamily: 'Arial',
                fontSize: 9.5,
                fontWeight: 'bold',
                fill: '#64748b',
                textAlign: 'right',
                charSpacing: 55,
            });
            const title = new Textbox(template.title, {
                left: margin,
                top: 71,
                width: contentWidth,
                fontFamily: 'Georgia',
                fontSize: kind === 'contractor' ? 26 : 29,
                fontWeight: 'bold',
                fill: '#0f172a',
                charSpacing: 8,
            });
            const description = new Textbox(template.description, {
                left: margin,
                top: 111,
                width: contentWidth,
                fontFamily: 'Arial',
                fontSize: 11,
                fill: '#64748b',
            });

            const metaPanel = makeDecoration(
                new Rect({
                    left: margin,
                    top: 148,
                    width: contentWidth,
                    height: 82,
                    rx: 8,
                    ry: 8,
                    fill: template.accentSoft,
                    stroke: template.accentBorder,
                    strokeWidth: 1,
                })
            );
            const metaDivider = makeDecoration(
                new Line([0, 0, 0, 50], {
                    left: pageSize.width / 2,
                    top: 164,
                    stroke: template.accentBorder,
                    strokeWidth: 1,
                })
            );
            const contractLabel = new Textbox('CONTRACT NAME', {
                left: margin + 18,
                top: 163,
                width: contentWidth / 2 - 36,
                fontFamily: 'Arial',
                fontSize: 8.5,
                fontWeight: 'bold',
                fill: template.accent,
                charSpacing: 90,
            });
            const contractValue = setObjectMetadata(
                new Textbox(contractName.trim() || 'Untitled contract', {
                    left: margin + 18,
                    top: 184,
                    width: contentWidth / 2 - 36,
                    fontFamily: 'Arial',
                    fontSize: 12.5,
                    fontWeight: 'bold',
                    fill: '#0f172a',
                }),
                { dataField: 'contractName', templateRole: 'template-field' }
            );
            const recipientLabel = new Textbox('RECIPIENT EMAIL', {
                left: pageSize.width / 2 + 18,
                top: 163,
                width: contentWidth / 2 - 36,
                fontFamily: 'Arial',
                fontSize: 8.5,
                fontWeight: 'bold',
                fill: template.accent,
                charSpacing: 90,
            });
            const recipientValue = setObjectMetadata(
                new Textbox(email.trim() || 'Recipient not added', {
                    left: pageSize.width / 2 + 18,
                    top: 184,
                    width: contentWidth / 2 - 36,
                    fontFamily: 'Arial',
                    fontSize: 11.5,
                    fontWeight: 'bold',
                    fill: '#0f172a',
                }),
                { dataField: 'recipientEmail', templateRole: 'template-field' }
            );

            addTemplateObjects(
                topAccent,
                eyebrow,
                effectiveDate,
                title,
                description,
                metaPanel,
                metaDivider,
                contractLabel,
                contractValue,
                recipientLabel,
                recipientValue
            );

            let y = 259;
            template.sections.forEach(([heading, body], index) => {
                const numberBadge = makeDecoration(
                    new Rect({
                        left: margin,
                        top: y - 2,
                        width: 28,
                        height: 23,
                        rx: 6,
                        ry: 6,
                        fill: template.accentSoft,
                        stroke: template.accentBorder,
                        strokeWidth: 1,
                    })
                );
                const number = new Textbox(String(index + 1).padStart(2, '0'), {
                    left: margin,
                    top: y + 4,
                    width: 28,
                    fontFamily: 'Arial',
                    fontSize: 8.5,
                    fontWeight: 'bold',
                    fill: template.accent,
                    textAlign: 'center',
                    charSpacing: 30,
                });
                const headingBox = new Textbox(heading, {
                    left: margin + 42,
                    top: y,
                    width: contentWidth - 42,
                    fontFamily: 'Arial',
                    fontSize: 11.5,
                    fontWeight: 'bold',
                    fill: '#0f172a',
                    charSpacing: 20,
                });
                const bodyBox = new Textbox(body, {
                    left: margin + 42,
                    top: y + 21,
                    width: contentWidth - 42,
                    fontFamily: 'Arial',
                    fontSize: 10.25,
                    lineHeight: 1.32,
                    fill: '#475569',
                });
                addTemplateObjects(numberBadge, number, headingBox, bodyBox);
                y += Math.max(61, Number(bodyBox.height || 28) + 34);
            });

            const signatureTop = Math.min(pageSize.height - 188, Math.max(y + 10, 820));
            const signaturePanel = makeDecoration(
                new Rect({
                    left: margin,
                    top: signatureTop,
                    width: contentWidth,
                    height: 132,
                    rx: 8,
                    ry: 8,
                    fill: '#f8fafc',
                    stroke: '#e2e8f0',
                    strokeWidth: 1,
                })
            );
            const signatureHeading = new Textbox('ACCEPTANCE & SIGNATURES', {
                left: margin + 18,
                top: signatureTop + 15,
                width: contentWidth - 36,
                fontFamily: 'Arial',
                fontSize: 9.5,
                fontWeight: 'bold',
                fill: template.accent,
                charSpacing: 85,
            });
            const signatureColumns = [
                { x: margin + 18, label: template.partyA },
                { x: margin + contentWidth / 2 + 12, label: template.partyB },
            ];
            addTemplateObjects(signaturePanel, signatureHeading);
            signatureColumns.forEach(({ x, label }) => {
                const columnWidth = contentWidth / 2 - 36;
                const partyLabel = new Textbox(label, {
                    left: x,
                    top: signatureTop + 45,
                    width: columnWidth,
                    fontFamily: 'Arial',
                    fontSize: 9,
                    fontWeight: 'bold',
                    fill: '#334155',
                });
                const signatureLine = makeDecoration(
                    new Line([0, 0, columnWidth, 0], {
                        left: x,
                        top: signatureTop + 88,
                        stroke: '#94a3b8',
                        strokeWidth: 1,
                    })
                );
                const signatureHint = new Textbox('Signature', {
                    left: x,
                    top: signatureTop + 95,
                    width: columnWidth * 0.55,
                    fontFamily: 'Arial',
                    fontSize: 8.5,
                    fill: '#94a3b8',
                });
                const dateHint = new Textbox('Date: ______________', {
                    left: x + columnWidth * 0.52,
                    top: signatureTop + 95,
                    width: columnWidth * 0.48,
                    fontFamily: 'Arial',
                    fontSize: 8.5,
                    fill: '#94a3b8',
                    textAlign: 'right',
                });
                addTemplateObjects(partyLabel, signatureLine, signatureHint, dateHint);
            });

            const footerRule = makeDecoration(
                new Line([0, 0, contentWidth, 0], {
                    left: margin,
                    top: pageSize.height - 49,
                    stroke: '#e2e8f0',
                    strokeWidth: 1,
                })
            );
            const footer = new Textbox('CONFIDENTIAL  •  REVIEW ALL PLACEHOLDERS BEFORE SENDING', {
                left: margin,
                top: pageSize.height - 35,
                width: contentWidth * 0.8,
                fontFamily: 'Arial',
                fontSize: 7.8,
                fontWeight: 'bold',
                fill: '#94a3b8',
                charSpacing: 65,
            });
            const pageNumber = new Textbox('PAGE 01', {
                left: margin + contentWidth * 0.8,
                top: pageSize.height - 35,
                width: contentWidth * 0.2,
                fontFamily: 'Arial',
                fontSize: 7.8,
                fontWeight: 'bold',
                fill: '#94a3b8',
                textAlign: 'right',
                charSpacing: 65,
            });
            addTemplateObjects(footerRule, footer, pageNumber);
            canvas.requestRenderAll();
            selectObject(canvas, title);
            pushHistory(activePageId, canvas, true);
            requestAnimationFrame(fitPageToViewport);
        },
        [activeCanvas, activePageId, contractName, email, fitPageToViewport, pageSize.height, pageSize.width, pushHistory, selectObject]
    );

    const serializeDocument = useCallback(() => {
        return {
            version: 1,
            contractName,
            email,
            pageSizeKey,
            pages: pages.map((page) => ({
                id: page.id,
                json: canvasesRef.current.has(page.id) ? serializeCanvas(canvasesRef.current.get(page.id)!) : page.initialJson || null,
            })),
        };
    }, [contractName, email, pageSizeKey, pages]);

    const saveDraft = useCallback(() => {
        try {
            localStorage.setItem(draftKey, JSON.stringify(serializeDocument()));
            setStatusMessage('Draft saved');
            setTimeout(() => setStatusMessage(null), 1200);
        } catch {
            setError('The draft could not be saved in this browser.');
        }
    }, [draftKey, serializeDocument]);

    const loadDraft = useCallback(async () => {
        const raw = localStorage.getItem(draftKey);
        if (!raw) {
            setStatusMessage('No saved draft found');
            setTimeout(() => setStatusMessage(null), 1200);
            return;
        }
        try {
            const parsed = JSON.parse(raw) as {
                contractName?: string;
                email?: string;
                pageSizeKey?: PageSizeKey;
                pages?: Array<{ id?: string; json?: Record<string, unknown> | null }>;
            };
            if (!parsed.pages?.length) throw new Error('Draft is empty.');
            setContractName(parsed.contractName || '');
            setEmail(parsed.email || '');
            setPageSizeKey(parsed.pageSizeKey === 'a4' ? 'a4' : 'letter');
            const restoredPages = parsed.pages.map((page) => ({ id: makePageId(), initialJson: page.json || null }));
            setPages(restoredPages);
            setActivePageId(restoredPages[0].id);
            setStatusMessage('Draft restored');
            setTimeout(() => setStatusMessage(null), 1200);
        } catch (draftError) {
            setError(draftError instanceof Error ? draftError.message : 'The saved draft could not be loaded.');
        }
    }, [draftKey]);

    const generatePdfBlob = useCallback(async () => {
        const size = PAGE_SIZES[pageSizeKey];
        const doc = new jsPDF({
            unit: 'pt',
            format: [size.pdfWidth, size.pdfHeight],
            orientation: size.pdfWidth > size.pdfHeight ? 'landscape' : 'portrait',
            compress: true,
        });
        doc.setProperties({
            title: contractName || 'Contract',
            subject: 'Contract created in Black Snow Contract Studio',
            creator: 'Black Snow Contract Studio',
        });

        for (let index = 0; index < pages.length; index += 1) {
            const page = pages[index];
            const canvas = canvasesRef.current.get(page.id);
            if (!canvas) continue;
            canvas.discardActiveObject();
            canvas.backgroundColor = '#ffffff';
            canvas.requestRenderAll();
            const image = canvas.toDataURL({ format: 'png', multiplier: 2 });
            if (index > 0) doc.addPage([size.pdfWidth, size.pdfHeight], size.pdfWidth > size.pdfHeight ? 'landscape' : 'portrait');
            doc.addImage(image, 'PNG', 0, 0, size.pdfWidth, size.pdfHeight, undefined, 'FAST');
        }
        return doc.output('blob');
    }, [contractName, pageSizeKey, pages]);

    const downloadPdf = useCallback(async () => {
        setError(null);
        setIsExporting(true);
        try {
            const blob = await generatePdfBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = safePdfFileName(contractName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (exportError) {
            setError(exportError instanceof Error ? exportError.message : 'Could not generate the PDF.');
        } finally {
            setIsExporting(false);
        }
    }, [contractName, generatePdfBlob]);

    const createContract = useCallback(async () => {
        setError(null);
        setSuccess(null);
        if (!contractName.trim()) {
            setError('Contract name is required.');
            return;
        }
        if (!email.trim()) {
            setError('Recipient email is required.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Enter a valid recipient email address.');
            return;
        }
        if (!authId) {
            setError('Unauthorized.');
            return;
        }

        setIsSubmitting(true);
        try {
            const blob = await generatePdfBlob();
            const file = new File([blob], safePdfFileName(contractName), { type: 'application/pdf' });
            const formData = new FormData();
            formData.append('contractName', contractName.trim());
            formData.append('email', email.trim());
            formData.append('authId', authId);
            formData.append('pdf', file);

            const response = await fetch(`/api/v2/contract?authId=${encodeURIComponent(authId)}`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to create contract.');
            }
            const data = (await response.json()) as { id?: number; contract?: { id?: number } };
            const contractId = data.contract?.id ?? data.id;
            if (!contractId) throw new Error('Contract id not returned from API.');
            const shareLink = `https://www.blacksnowholdings.com/contractsignature?id=${contractId}`;
            localStorage.removeItem(draftKey);
            setSuccess({ contractId, shareLink });
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Something went wrong while creating the contract.');
        } finally {
            setIsSubmitting(false);
        }
    }, [authId, contractName, draftKey, email, generatePdfBlob]);

    const copyShareLink = useCallback(async () => {
        if (!success) return;
        try {
            await navigator.clipboard.writeText(success.shareLink);
            setCopyStatus('success');
        } catch {
            setCopyStatus('error');
        }
    }, [success]);

    useEffect(() => {
        const handleKeyboard = (event: KeyboardEvent) => {
            if (isEditableKeyboardTarget(event.target)) return;
            const canvas = activeCanvas();
            const active = canvas?.getActiveObject();
            const isEditingText = active instanceof Textbox && active.isEditing;
            const modifier = event.metaKey || event.ctrlKey;

            if (modifier && event.key.toLowerCase() === 's') {
                event.preventDefault();
                saveDraft();
                return;
            }
            if (modifier && event.key.toLowerCase() === 'z' && !event.shiftKey) {
                event.preventDefault();
                void undo();
                return;
            }
            if ((modifier && event.key.toLowerCase() === 'y') || (modifier && event.shiftKey && event.key.toLowerCase() === 'z')) {
                event.preventDefault();
                void redo();
                return;
            }
            if (modifier && event.key.toLowerCase() === 'd' && !isEditingText) {
                event.preventDefault();
                void duplicateSelected();
                return;
            }
            if (modifier && event.key.toLowerCase() === 'c' && !isEditingText) {
                event.preventDefault();
                void copySelected();
                return;
            }
            if (modifier && event.key.toLowerCase() === 'v' && !isEditingText) {
                event.preventDefault();
                void pasteSelected();
                return;
            }
            if (event.key === 'Escape' && canvas) {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
                syncInspector(canvas);
                return;
            }
            if (canvas && active && !isEditingText && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault();
                const distance = event.shiftKey ? 10 : 1;
                if (event.key === 'ArrowLeft') active.set('left', Number(active.left || 0) - distance);
                if (event.key === 'ArrowRight') active.set('left', Number(active.left || 0) + distance);
                if (event.key === 'ArrowUp') active.set('top', Number(active.top || 0) - distance);
                if (event.key === 'ArrowDown') active.set('top', Number(active.top || 0) + distance);
                active.set({
                    left: Math.min(Math.max(0, pageSize.width - active.getScaledWidth()), Math.max(0, Number(active.left || 0))),
                    top: Math.min(Math.max(0, pageSize.height - active.getScaledHeight()), Math.max(0, Number(active.top || 0))),
                });
                active.setCoords();
                canvas.requestRenderAll();
                pushHistory(activePageId, canvas);
                syncInspector(canvas);
                return;
            }
            if ((event.key === 'Delete' || event.key === 'Backspace') && !isEditingText) {
                event.preventDefault();
                deleteSelected();
            }
        };
        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [
        activeCanvas,
        activePageId,
        copySelected,
        deleteSelected,
        duplicateSelected,
        pageSize.height,
        pageSize.width,
        pasteSelected,
        pushHistory,
        redo,
        saveDraft,
        syncInspector,
        undo,
    ]);

    return (
        <div className='min-h-screen bg-slate-100 text-slate-900'>
            <input
                ref={imageInputRef}
                type='file'
                accept='image/png,image/jpeg,image/webp'
                className='hidden'
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void addImage(file);
                    event.currentTarget.value = '';
                }}
            />

            <header className='sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur'>
                <div className='flex min-h-[66px] items-center gap-3 px-4'>
                    <button
                        type='button'
                        onClick={() => void router.push(backHref)}
                        className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                    >
                        ← Contracts
                    </button>
                    <div className='min-w-0'>
                        <div className='text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600'>Black Snow</div>
                        <h1 className='truncate text-[17px] font-semibold'>{editorTitle}</h1>
                    </div>

                    <div className='ml-auto flex flex-wrap items-center justify-end gap-2'>
                        {statusMessage && <span className='hidden text-xs font-medium text-emerald-700 sm:inline'>{statusMessage}</span>}
                        <button
                            type='button'
                            onClick={loadDraft}
                            className='rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50'
                        >
                            Restore draft
                        </button>
                        <button
                            type='button'
                            onClick={saveDraft}
                            className='rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50'
                        >
                            Save draft
                        </button>
                        <button
                            type='button'
                            onClick={() => void downloadPdf()}
                            disabled={isExporting || isSubmitting}
                            className='rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50'
                        >
                            {isExporting ? 'Exporting…' : 'Download PDF'}
                        </button>
                        <button
                            type='button'
                            onClick={() => void createContract()}
                            disabled={isSubmitting || isExporting}
                            className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50'
                        >
                            {isSubmitting ? 'Creating…' : 'Finish & Create Contract'}
                        </button>
                    </div>
                </div>

                <div className='flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-2'>
                    <button type='button' onClick={() => void undo()} className='toolbar-btn' title='Undo (Ctrl/Cmd + Z)'>
                        ↶
                    </button>
                    <button type='button' onClick={() => void redo()} className='toolbar-btn' title='Redo (Ctrl/Cmd + Y)'>
                        ↷
                    </button>
                    <span className='mx-1 h-6 w-px bg-slate-200' />
                    <select
                        value={inspector.fontFamily}
                        disabled={!inspector.isText}
                        onChange={(event) => applyTextProperty('fontFamily', event.target.value)}
                        className='h-9 rounded-md border border-slate-200 bg-white px-2 text-sm disabled:bg-slate-50 disabled:text-slate-400'
                    >
                        {FONT_FAMILIES.map((font) => (
                            <option key={font}>{font}</option>
                        ))}
                    </select>
                    <input
                        type='number'
                        min={6}
                        max={144}
                        value={Math.round(inspector.fontSize)}
                        disabled={!inspector.isText}
                        onChange={(event) => applyTextProperty('fontSize', Math.max(6, Number(event.target.value) || 6))}
                        className='h-9 w-[68px] rounded-md border border-slate-200 px-2 text-sm disabled:bg-slate-50'
                        title='Font size'
                    />
                    <button
                        type='button'
                        disabled={!inspector.isText}
                        onClick={() => applyTextProperty('fontWeight', inspector.bold ? 'normal' : 'bold')}
                        className={`toolbar-btn font-bold ${inspector.bold ? 'toolbar-btn-active' : ''}`}
                    >
                        B
                    </button>
                    <button
                        type='button'
                        disabled={!inspector.isText}
                        onClick={() => applyTextProperty('fontStyle', inspector.italic ? 'normal' : 'italic')}
                        className={`toolbar-btn italic ${inspector.italic ? 'toolbar-btn-active' : ''}`}
                    >
                        I
                    </button>
                    <button
                        type='button'
                        disabled={!inspector.isText}
                        onClick={() => applyTextProperty('underline', !inspector.underline)}
                        className={`toolbar-btn underline ${inspector.underline ? 'toolbar-btn-active' : ''}`}
                    >
                        U
                    </button>
                    <button
                        type='button'
                        disabled={!inspector.isText}
                        onClick={() => applyTextProperty('linethrough', !inspector.strike)}
                        className={`toolbar-btn line-through ${inspector.strike ? 'toolbar-btn-active' : ''}`}
                    >
                        S
                    </button>
                    <label className='flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-500'>
                        Text
                        <input
                            type='color'
                            disabled={!inspector.isText}
                            value={/^#[0-9A-Fa-f]{6}$/.test(inspector.fill) ? inspector.fill : '#111827'}
                            onChange={(event) => applyTextProperty('fill', event.target.value)}
                            className='h-5 w-6 border-0 bg-transparent p-0'
                        />
                    </label>
                    {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                        <button
                            key={align}
                            type='button'
                            disabled={!inspector.isText}
                            onClick={() => applyTextProperty('textAlign', align)}
                            className={`toolbar-btn text-xs ${inspector.textAlign === align ? 'toolbar-btn-active' : ''}`}
                            title={`Align ${align}`}
                        >
                            {align === 'left' ? '≡←' : align === 'center' ? '≡' : align === 'right' ? '→≡' : '☰'}
                        </button>
                    ))}
                    <span className='mx-1 h-6 w-px bg-slate-200' />
                    <button type='button' onClick={() => void copySelected()} className='toolbar-btn' title='Copy selected'>
                        Copy
                    </button>
                    <button type='button' onClick={() => void pasteSelected()} className='toolbar-btn' title='Paste'>
                        Paste
                    </button>
                    <button type='button' onClick={() => void duplicateSelected()} className='toolbar-btn' title='Duplicate (Ctrl/Cmd + D)'>
                        Duplicate
                    </button>
                    <button type='button' onClick={deleteSelected} className='toolbar-btn text-rose-600' title='Delete'>
                        Delete
                    </button>
                </div>
            </header>

            <div className='grid min-h-[calc(100vh-116px)] grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_286px]'>
                <aside className='border-r border-slate-200 bg-white p-4 xl:sticky xl:top-[116px] xl:h-[calc(100vh-116px)] xl:overflow-y-auto'>
                    <div className='mb-5'>
                        <div className='mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400'>Document</div>
                        <label className='mb-3 block'>
                            <span className='mb-1 block text-xs font-medium text-slate-600'>Contract name</span>
                            <input
                                value={contractName}
                                onChange={(event) => setContractName(event.target.value)}
                                placeholder='Service Agreement 2026'
                                className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            />
                        </label>
                        <label className='block'>
                            <span className='mb-1 block text-xs font-medium text-slate-600'>Recipient email</span>
                            <input
                                type='email'
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder='client@example.com'
                                className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            />
                        </label>
                        <p className='mt-2 text-[11px] leading-4 text-slate-400'>These details update the selected template automatically.</p>
                    </div>

                    <div className='mb-5'>
                        <div className='mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400'>Templates</div>
                        <div className='grid gap-2'>
                            <button type='button' onClick={() => insertTemplate('service')} className='sidebar-action'>
                                Service Agreement
                            </button>
                            <button type='button' onClick={() => insertTemplate('nda')} className='sidebar-action'>
                                NDA
                            </button>
                            <button type='button' onClick={() => insertTemplate('contractor')} className='sidebar-action'>
                                Contractor Agreement
                            </button>
                        </div>
                    </div>

                    <div className='mb-5'>
                        <div className='mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400'>Add content</div>
                        <div className='grid grid-cols-2 gap-2'>
                            <button type='button' onClick={() => addText('heading')} className='sidebar-action'>
                                Heading
                            </button>
                            <button type='button' onClick={() => addText('body')} className='sidebar-action'>
                                Text
                            </button>
                            <button type='button' onClick={() => imageInputRef.current?.click()} className='sidebar-action'>
                                Image / Logo
                            </button>
                            <button type='button' onClick={addTable} className='sidebar-action'>
                                3 × 3 Table
                            </button>
                            <button type='button' onClick={addLine} className='sidebar-action'>
                                Line
                            </button>
                            <button type='button' onClick={addRectangle} className='sidebar-action'>
                                Box
                            </button>
                            <button type='button' onClick={addSignatureBlock} className='sidebar-action col-span-2'>
                                Signature Block
                            </button>
                            <button type='button' onClick={addHeader} className='sidebar-action'>
                                Header
                            </button>
                            <button type='button' onClick={addFooter} className='sidebar-action'>
                                Footer
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className='mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400'>Contract clauses</div>
                        <div className='space-y-1'>
                            {CLAUSES.map((clause) => (
                                <button
                                    key={clause.label}
                                    type='button'
                                    onClick={() => addClause(clause.heading, clause.body)}
                                    className='w-full rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-100'
                                >
                                    + {clause.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <main ref={mainViewportRef} className='min-w-0 overflow-x-auto overflow-y-auto bg-slate-100 px-5 py-6'>
                    <div className='mb-5 flex flex-wrap items-center justify-center gap-2'>
                        <label className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm'>
                            Page size
                            <select
                                value={pageSizeKey}
                                onChange={(event) => setPageSizeKey(event.target.value as PageSizeKey)}
                                className='bg-transparent text-sm font-semibold text-slate-900 outline-none'
                            >
                                {Object.entries(PAGE_SIZES).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button
                            type='button'
                            onClick={() => setSnapEnabled((value) => !value)}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm ${
                                snapEnabled ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
                            }`}
                        >
                            Snap {snapEnabled ? 'On' : 'Off'}
                        </button>
                        <button type='button' onClick={() => changeZoom(-0.1)} className='toolbar-btn bg-white' title='Zoom out'>
                            −
                        </button>
                        <span className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm'>{Math.round(zoom * 100)}%</span>
                        <button type='button' onClick={() => changeZoom(0.1)} className='toolbar-btn bg-white' title='Zoom in'>
                            +
                        </button>
                        <button
                            type='button'
                            onClick={fitPageToViewport}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm ${
                                zoomMode === 'fit' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
                            }`}
                            title='Fit the full page inside the editor'
                        >
                            Fit page
                        </button>
                    </div>

                    <div
                        className='contract-editor-stage flex flex-col items-center gap-8 pb-20'
                        style={{
                            width: 'max-content',
                            minWidth: '100%',
                            maxWidth: 'none',
                        }}
                    >
                        {pages.map((page, index) => (
                            <div
                                key={page.id}
                                className='contract-editor-page relative flex flex-col'
                                style={{
                                    width: Math.ceil(pageSize.width * zoom),
                                    minWidth: Math.ceil(pageSize.width * zoom),
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                }}
                            >
                                <div className='mb-2 flex items-center justify-between text-xs font-medium text-slate-500'>
                                    <span>Page {index + 1}</span>
                                    {activePageId === page.id && <span className='text-blue-600'>Active page</span>}
                                </div>
                                <CanvasPage
                                    page={page}
                                    sizeKey={pageSizeKey}
                                    zoom={zoom}
                                    active={activePageId === page.id}
                                    snapEnabled={snapEnabled}
                                    onReady={registerCanvas}
                                    onDispose={unregisterCanvas}
                                    onActivate={(pageId) => {
                                        setActivePageId(pageId);
                                        syncInspector(canvasesRef.current.get(pageId) || null);
                                    }}
                                    onSelectionChange={handleSelectionChange}
                                    onObjectChange={handleObjectChange}
                                    onPageResize={handlePageResize}
                                />
                            </div>
                        ))}
                        <button
                            type='button'
                            onClick={addPage}
                            className='rounded-xl border border-dashed border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm hover:border-blue-400 hover:text-blue-700'
                        >
                            + Add page
                        </button>
                    </div>
                </main>

                <aside className='border-l border-slate-200 bg-white p-4 xl:sticky xl:top-[116px] xl:h-[calc(100vh-116px)] xl:overflow-y-auto'>
                    <div className='mb-5'>
                        <div className='mb-2 flex items-center justify-between'>
                            <div className='text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400'>Pages</div>
                            <span className='text-xs text-slate-400'>{pages.length}</span>
                        </div>
                        <div className='space-y-2'>
                            {pages.map((page, index) => (
                                <button
                                    key={page.id}
                                    type='button'
                                    onClick={() => setActivePageId(page.id)}
                                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                                        activePageId === page.id ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className='font-medium'>Page {index + 1}</span>
                                    <span className='text-xs opacity-60'>{PAGE_SIZES[pageSizeKey].label}</span>
                                </button>
                            ))}
                        </div>
                        <div className='mt-2 grid grid-cols-3 gap-2'>
                            <button type='button' onClick={addPage} className='mini-action'>
                                Add
                            </button>
                            <button type='button' onClick={duplicatePage} className='mini-action'>
                                Duplicate
                            </button>
                            <button type='button' onClick={deletePage} disabled={pages.length <= 1} className='mini-action text-rose-600 disabled:opacity-40'>
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className='mb-5'>
                        <div className='mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400'>Position & object</div>
                        <div className='grid grid-cols-2 gap-2'>
                            <label className='inspector-field'>
                                X
                                <input
                                    type='number'
                                    value={inspector.left}
                                    onChange={(event) => applyObjectProperty('left', Number(event.target.value) || 0)}
                                />
                            </label>
                            <label className='inspector-field'>
                                Y<input type='number' value={inspector.top} onChange={(event) => applyObjectProperty('top', Number(event.target.value) || 0)} />
                            </label>
                            <label className='inspector-field'>
                                Rotate
                                <input
                                    type='number'
                                    value={inspector.angle}
                                    onChange={(event) => applyObjectProperty('angle', Number(event.target.value) || 0)}
                                />
                            </label>
                            <label className='inspector-field'>
                                Opacity
                                <input
                                    type='number'
                                    min={0}
                                    max={100}
                                    value={Math.round(inspector.opacity * 100)}
                                    onChange={(event) => applyObjectProperty('opacity', Math.min(1, Math.max(0, (Number(event.target.value) || 0) / 100)))}
                                />
                            </label>
                        </div>
                        <div className='mt-2 grid grid-cols-2 gap-2'>
                            <button type='button' onClick={() => changeLayer('forward')} className='mini-action'>
                                Bring forward
                            </button>
                            <button type='button' onClick={() => changeLayer('backward')} className='mini-action'>
                                Send backward
                            </button>
                            <button
                                type='button'
                                onClick={toggleLock}
                                className={`mini-action col-span-2 ${inspector.locked ? 'bg-amber-50 text-amber-700' : ''}`}
                            >
                                {inspector.locked ? 'Unlock object' : 'Lock object'}
                            </button>
                        </div>
                    </div>

                    <div className='mb-5'>
                        <div className='mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400'>Typography</div>
                        {!inspector.isText ? (
                            <div className='rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500'>
                                Select a text box to edit typography, spacing, alignment and color.
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                <label className='block text-xs font-medium text-slate-600'>
                                    Line height
                                    <input
                                        type='range'
                                        min={0.8}
                                        max={2.4}
                                        step={0.05}
                                        value={inspector.lineHeight}
                                        onChange={(event) => applyTextProperty('lineHeight', Number(event.target.value))}
                                        className='mt-1 w-full'
                                    />
                                    <span className='text-[11px] text-slate-400'>{inspector.lineHeight.toFixed(2)}</span>
                                </label>
                                <label className='block text-xs font-medium text-slate-600'>
                                    Letter spacing
                                    <input
                                        type='range'
                                        min={-100}
                                        max={600}
                                        step={10}
                                        value={inspector.charSpacing}
                                        onChange={(event) => applyTextProperty('charSpacing', Number(event.target.value))}
                                        className='mt-1 w-full'
                                    />
                                    <span className='text-[11px] text-slate-400'>{inspector.charSpacing}</span>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600'>
                        <div className='mb-1 font-semibold text-slate-800'>Editor shortcuts</div>
                        <div>Ctrl/Cmd + Z: Undo</div>
                        <div>Ctrl/Cmd + Y: Redo</div>
                        <div>Ctrl/Cmd + D: Duplicate</div>
                        <div>Ctrl/Cmd + S: Save draft</div>
                        <div>Delete: Remove selected</div>
                    </div>
                </aside>
            </div>

            {error && (
                <div className='fixed bottom-5 left-1/2 z-50 w-[min(92vw,620px)] -translate-x-1/2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-700 shadow-2xl'>
                    <div className='flex items-start justify-between gap-3'>
                        <span>{error}</span>
                        <button type='button' onClick={() => setError(null)} className='font-bold text-rose-500'>
                            ×
                        </button>
                    </div>
                </div>
            )}

            {success && (
                <div className='fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-4'>
                    <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl'>
                        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700'>✓</div>
                        <h2 className='text-xl font-semibold text-slate-900'>Contract created</h2>
                        <p className='mt-1 text-sm text-slate-500'>
                            Your designed PDF was generated and uploaded to the existing contract system successfully.
                        </p>
                        <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3'>
                            <div className='mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400'>Signature link</div>
                            <div className='break-all text-sm text-slate-800'>{success.shareLink}</div>
                        </div>
                        {copyStatus === 'success' && <p className='mt-2 text-xs font-medium text-emerald-700'>Link copied.</p>}
                        {copyStatus === 'error' && <p className='mt-2 text-xs font-medium text-rose-700'>Could not copy automatically.</p>}
                        <div className='mt-5 flex flex-wrap justify-end gap-2'>
                            <button
                                type='button'
                                onClick={() => void copyShareLink()}
                                className='rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50'
                            >
                                Copy signature link
                            </button>
                            <button
                                type='button'
                                onClick={() => void router.push(backHref)}
                                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
                            >
                                Back to contracts
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                :global(.contract-editor-stage) {
                    box-sizing: border-box;
                    align-items: center;
                }
                :global(.contract-editor-page) {
                    align-self: center;
                }
                :global(.contract-editor-canvas-surface .canvas-container) {
                    left: 0 !important;
                    top: 0 !important;
                    margin: 0 !important;
                    transform: none !important;
                }
                :global(.contract-editor-canvas-surface canvas) {
                    left: 0 !important;
                    top: 0 !important;
                    margin: 0 !important;
                    max-width: none !important;
                    max-height: none !important;
                    transform: none !important;
                }
                :global(.toolbar-btn) {
                    min-height: 36px;
                    border: 1px solid #e2e8f0;
                    border-radius: 7px;
                    padding: 0 10px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #334155;
                    background: #ffffff;
                    transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
                }
                :global(.toolbar-btn:hover:not(:disabled)) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
                :global(.toolbar-btn:disabled) {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                :global(.toolbar-btn-active) {
                    background: #eff6ff !important;
                    border-color: #93c5fd !important;
                    color: #1d4ed8 !important;
                }
                :global(.sidebar-action) {
                    min-height: 42px;
                    border: 1px solid #e2e8f0;
                    border-radius: 9px;
                    background: white;
                    padding: 9px 10px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: #334155;
                }
                :global(.sidebar-action:hover) {
                    border-color: #bfdbfe;
                    background: #eff6ff;
                    color: #1d4ed8;
                }
                :global(.mini-action) {
                    min-height: 34px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    padding: 6px 8px;
                    font-size: 11px;
                    font-weight: 600;
                }
                :global(.mini-action:hover:not(:disabled)) {
                    background: #f8fafc;
                }
                :global(.inspector-field) {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                }
                :global(.inspector-field input) {
                    height: 34px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 0 8px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #334155;
                    outline: none;
                }
                :global(.inspector-field input:focus) {
                    border-color: #60a5fa;
                    box-shadow: 0 0 0 2px #dbeafe;
                }
            `}</style>
        </div>
    );
}
