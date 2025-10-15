'use client';

import type React from 'react';

import type { DesignElement } from '@/app/page';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

interface CanvasEngineProps {
    elements: DesignElement[];
    selectedElement: string | null;
    canvasSize: { width: number; height: number };
    zoom: number;
    showGrid: boolean;
    previewMode: boolean;
    onSelectElement: (id: string | null) => void;
    onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
    onDeleteElement: (id: string) => void;
}

interface DragState {
    isDragging: boolean;
    isResizing: boolean;
    dragStart: { x: number; y: number };
    elementStart: { x: number; y: number; width: number; height: number };
    resizeHandle: string | null;
}

export const CanvasEngine = forwardRef<HTMLDivElement, CanvasEngineProps>(
    ({ elements, selectedElement, canvasSize, zoom, showGrid, previewMode, onSelectElement, onUpdateElement, onDeleteElement }, ref) => {
        const [dragState, setDragState] = useState<DragState>({
            isDragging: false,
            isResizing: false,
            dragStart: { x: 0, y: 0 },
            elementStart: { x: 0, y: 0, width: 0, height: 0 },
            resizeHandle: null,
        });

        const canvasRef = useRef<HTMLDivElement>(null);

        const [isEditingText, setIsEditingText] = useState(false);
        const [editingElementId, setEditingElementId] = useState<string | null>(null);

        const handleMouseDown = useCallback(
            (e: React.MouseEvent, elementId: string, handle?: string) => {
                e.preventDefault();
                e.stopPropagation();

                const element = elements.find((el) => el.id === elementId);
                if (!element) return;

                onSelectElement(elementId);

                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;

                const startX = (e.clientX - rect.left) / zoom;
                const startY = (e.clientY - rect.top) / zoom;

                setDragState({
                    isDragging: !handle,
                    isResizing: !!handle,
                    dragStart: { x: startX, y: startY },
                    elementStart: {
                        x: element.x,
                        y: element.y,
                        width: element.width,
                        height: element.height,
                    },
                    resizeHandle: handle || null,
                });
            },
            [elements, zoom, onSelectElement]
        );

        const handleMouseMove = useCallback(
            (e: MouseEvent) => {
                if (!dragState.isDragging && !dragState.isResizing) return;
                if (!selectedElement) return;

                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;

                const currentX = (e.clientX - rect.left) / zoom;
                const currentY = (e.clientY - rect.top) / zoom;
                const deltaX = currentX - dragState.dragStart.x;
                const deltaY = currentY - dragState.dragStart.y;

                if (dragState.isDragging) {
                    // Handle dragging
                    const newX = Math.max(0, Math.min(canvasSize.width - dragState.elementStart.width, dragState.elementStart.x + deltaX));
                    const newY = Math.max(0, Math.min(canvasSize.height - dragState.elementStart.height, dragState.elementStart.y + deltaY));

                    onUpdateElement(selectedElement, { x: newX, y: newY });
                } else if (dragState.isResizing && dragState.resizeHandle) {
                    // Handle resizing
                    let newWidth = dragState.elementStart.width;
                    let newHeight = dragState.elementStart.height;
                    let newX = dragState.elementStart.x;
                    let newY = dragState.elementStart.y;

                    switch (dragState.resizeHandle) {
                        case 'se':
                            newWidth = Math.max(20, dragState.elementStart.width + deltaX);
                            newHeight = Math.max(20, dragState.elementStart.height + deltaY);
                            break;
                        case 'sw':
                            newWidth = Math.max(20, dragState.elementStart.width - deltaX);
                            newHeight = Math.max(20, dragState.elementStart.height + deltaY);
                            newX = dragState.elementStart.x + (dragState.elementStart.width - newWidth);
                            break;
                        case 'ne':
                            newWidth = Math.max(20, dragState.elementStart.width + deltaX);
                            newHeight = Math.max(20, dragState.elementStart.height - deltaY);
                            newY = dragState.elementStart.y + (dragState.elementStart.height - newHeight);
                            break;
                        case 'nw':
                            newWidth = Math.max(20, dragState.elementStart.width - deltaX);
                            newHeight = Math.max(20, dragState.elementStart.height - deltaY);
                            newX = dragState.elementStart.x + (dragState.elementStart.width - newWidth);
                            newY = dragState.elementStart.y + (dragState.elementStart.height - newHeight);
                            break;
                    }

                    // Ensure element stays within canvas bounds
                    newX = Math.max(0, Math.min(canvasSize.width - newWidth, newX));
                    newY = Math.max(0, Math.min(canvasSize.height - newHeight, newY));

                    onUpdateElement(selectedElement, {
                        x: newX,
                        y: newY,
                        width: newWidth,
                        height: newHeight,
                    });
                }
            },
            [dragState, selectedElement, zoom, canvasSize, onUpdateElement]
        );

        const handleMouseUp = useCallback(() => {
            setDragState({
                isDragging: false,
                isResizing: false,
                dragStart: { x: 0, y: 0 },
                elementStart: { x: 0, y: 0, width: 0, height: 0 },
                resizeHandle: null,
            });
        }, []);

        const handleCanvasClick = useCallback(
            (e: React.MouseEvent) => {
                if (e.target === e.currentTarget) {
                    onSelectElement(null);
                }
            },
            [onSelectElement]
        );

        const handleKeyDown = useCallback(
            (e: KeyboardEvent) => {
                if (selectedElement && (e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
                    e.preventDefault();
                    onDeleteElement(selectedElement);
                }
            },
            [selectedElement, onDeleteElement, isEditingText]
        );

        const handleTextEdit = useCallback(
            (elementId: string, newContent: string) => {
                onUpdateElement(elementId, { content: newContent });
            },
            [onUpdateElement]
        );

        const startTextEditing = useCallback((elementId: string) => {
            setIsEditingText(true);
            setEditingElementId(elementId);
        }, []);

        const stopTextEditing = useCallback(() => {
            setIsEditingText(false);
            setEditingElementId(null);
        }, []);

        useEffect(() => {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [handleMouseMove, handleMouseUp, handleKeyDown]);

        const renderElement = (element: DesignElement) => {
            const isSelected = selectedElement === element.id && !previewMode;
            const isCurrentlyEditing = isEditingText && editingElementId === element.id;

            const style: React.CSSProperties = {
                position: 'absolute',
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: `rotate(${element.rotation}deg)`,
                zIndex: element.zIndex,
                opacity: element.opacity || 1,
            };

            let content: React.ReactNode;

            switch (element.type) {
                case 'text':
                    content = (
                        <div
                            className={`design-element ${isSelected ? 'selected' : ''}`}
                            style={{
                                ...style,
                                fontSize: element.fontSize || 24,
                                fontFamily: element.fontFamily || 'Arial',
                                color: element.color || '#1f2937',
                                backgroundColor: element.backgroundColor || 'transparent',
                                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : 'none',
                                borderRadius: element.borderRadius || 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                cursor: previewMode ? 'default' : 'move',
                            }}
                            onMouseDown={(e) => !previewMode && handleMouseDown(e, element.id)}
                            onDoubleClick={() => !previewMode && startTextEditing(element.id)}
                        >
                            {isCurrentlyEditing ? (
                                <div
                                    contentEditable
                                    suppressContentEditableWarning={true}
                                    style={{
                                        outline: 'none',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'text',
                                    }}
                                    onBlur={(e) => {
                                        handleTextEdit(element.id, e.currentTarget.textContent || '');
                                        stopTextEditing();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            e.currentTarget.blur();
                                        }
                                        // Allow normal text editing behavior (backspace, delete, etc.)
                                        e.stopPropagation();
                                    }}
                                    onInput={(e) => {
                                        handleTextEdit(element.id, e.currentTarget.textContent || '');
                                    }}
                                    autoFocus
                                >
                                    {element.content || 'Text'}
                                </div>
                            ) : (
                                <span>{element.content || 'Text'}</span>
                            )}
                        </div>
                    );
                    break;

                case 'shape':
                    content = (
                        <div
                            className={`design-element ${isSelected ? 'selected' : ''}`}
                            style={{
                                ...style,
                                backgroundColor: element.backgroundColor || '#8b5cf6',
                                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : 'none',
                                borderRadius: element.borderRadius || 0,
                                cursor: previewMode ? 'default' : 'move',
                            }}
                            onMouseDown={(e) => !previewMode && handleMouseDown(e, element.id)}
                        />
                    );
                    break;

                case 'image':
                    content = (
                        <div
                            className={`design-element ${isSelected ? 'selected' : ''}`}
                            style={{
                                ...style,
                                backgroundImage: element.src ? `url(${element.src})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundColor: element.src ? 'transparent' : '#f3f4f6',
                                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : 'none',
                                borderRadius: element.borderRadius || 0,
                                cursor: previewMode ? 'default' : 'move',
                            }}
                            onMouseDown={(e) => !previewMode && handleMouseDown(e, element.id)}
                        >
                            {!element.src && (
                                <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                    <span>Image</span>
                                </div>
                            )}
                        </div>
                    );
                    break;

                default:
                    content = null;
            }

            return (
                <div key={element.id}>
                    {content}
                    {isSelected && !previewMode && !isCurrentlyEditing && (
                        <>
                            <div
                                className='resize-handle nw'
                                style={{
                                    left: element.x - 4,
                                    top: element.y - 4,
                                    zIndex: element.zIndex + 1000,
                                }}
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'nw')}
                            />
                            <div
                                className='resize-handle ne'
                                style={{
                                    left: element.x + element.width - 4,
                                    top: element.y - 4,
                                    zIndex: element.zIndex + 1000,
                                }}
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'ne')}
                            />
                            <div
                                className='resize-handle sw'
                                style={{
                                    left: element.x - 4,
                                    top: element.y + element.height - 4,
                                    zIndex: element.zIndex + 1000,
                                }}
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'sw')}
                            />
                            <div
                                className='resize-handle se'
                                style={{
                                    left: element.x + element.width - 4,
                                    top: element.y + element.height - 4,
                                    zIndex: element.zIndex + 1000,
                                }}
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'se')}
                            />
                        </>
                    )}
                </div>
            );
        };

        return (
            <div
                ref={ref}
                className='relative bg-white shadow-lg'
                style={{
                    width: canvasSize.width * zoom,
                    height: canvasSize.height * zoom,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                }}
            >
                <div
                    ref={canvasRef}
                    className={`relative w-full h-full ${showGrid && !previewMode ? 'canvas-container' : ''}`}
                    style={{
                        width: canvasSize.width,
                        height: canvasSize.height,
                    }}
                    onClick={handleCanvasClick}
                >
                    {elements.sort((a, b) => a.zIndex - b.zIndex).map(renderElement)}
                </div>
            </div>
        );
    }
);

CanvasEngine.displayName = 'CanvasEngine';
