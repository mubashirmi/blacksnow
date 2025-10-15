'use client';

import type React from 'react';

import type { DesignElement } from '@/app/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { FileImage, FileText, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ExportPanelProps {
    canvasRef: React.RefObject<HTMLDivElement>;
    elements: DesignElement[];
    canvasSize: { width: number; height: number };
}

export function ExportPanel({ canvasRef, elements, canvasSize }: ExportPanelProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
    const [exportQuality, setExportQuality] = useState(300); // DPI
    const [exportScale, setExportScale] = useState(2); // Scale multiplier for high quality

    const createHighQualityCanvas = useCallback(
        (scale = 2): HTMLCanvasElement => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            // Set canvas size with scale for high quality
            canvas.width = canvasSize.width * scale;
            canvas.height = canvasSize.height * scale;

            // Scale the context to match
            ctx.scale(scale, scale);

            // Set high quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Fill background with white
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

            return canvas;
        },
        [canvasSize]
    );

    const renderElementToCanvas = useCallback((ctx: CanvasRenderingContext2D, element: DesignElement, scale = 1): Promise<void> => {
        return new Promise((resolve) => {
            ctx.save();

            // Apply transformations
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate((element.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);

            // Apply opacity
            ctx.globalAlpha = element.opacity || 1;

            switch (element.type) {
                case 'text': {
                    // Set text properties
                    ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
                    ctx.fillStyle = element.color || '#1f2937';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Draw background if specified
                    if (element.backgroundColor && element.backgroundColor !== 'transparent') {
                        ctx.fillStyle = element.backgroundColor;
                        if (element.borderRadius) {
                            // Draw rounded rectangle
                            const radius = element.borderRadius;
                            ctx.beginPath();
                            ctx.roundRect(element.x, element.y, element.width, element.height, radius);
                            ctx.fill();
                        } else {
                            ctx.fillRect(element.x, element.y, element.width, element.height);
                        }
                    }

                    // Draw border if specified
                    if (element.borderWidth && element.borderWidth > 0) {
                        ctx.strokeStyle = element.borderColor || '#000000';
                        ctx.lineWidth = element.borderWidth;
                        if (element.borderRadius) {
                            ctx.beginPath();
                            ctx.roundRect(element.x, element.y, element.width, element.height, element.borderRadius);
                            ctx.stroke();
                        } else {
                            ctx.strokeRect(element.x, element.y, element.width, element.height);
                        }
                    }

                    // Draw text
                    ctx.fillStyle = element.color || '#1f2937';
                    const lines = (element.content || '').split('\n');
                    const lineHeight = (element.fontSize || 24) * 1.2;
                    const startY = element.y + element.height / 2 - ((lines.length - 1) * lineHeight) / 2;

                    lines.forEach((line, index) => {
                        ctx.fillText(line, element.x + element.width / 2, startY + index * lineHeight);
                    });
                    break;
                }
                case 'shape':
                    ctx.fillStyle = element.backgroundColor || '#8b5cf6';

                    if (element.borderRadius && element.borderRadius > 0) {
                        // Draw rounded rectangle or circle
                        ctx.beginPath();
                        if (element.borderRadius >= Math.min(element.width, element.height) / 2) {
                            // Circle
                            const radius = Math.min(element.width, element.height) / 2;
                            ctx.arc(element.x + element.width / 2, element.y + element.height / 2, radius, 0, 2 * Math.PI);
                        } else {
                            // Rounded rectangle
                            ctx.roundRect(element.x, element.y, element.width, element.height, element.borderRadius);
                        }
                        ctx.fill();
                    } else {
                        // Regular rectangle
                        ctx.fillRect(element.x, element.y, element.width, element.height);
                    }

                    // Draw border if specified
                    if (element.borderWidth && element.borderWidth > 0) {
                        ctx.strokeStyle = element.borderColor || '#000000';
                        ctx.lineWidth = element.borderWidth;
                        if (element.borderRadius && element.borderRadius > 0) {
                            ctx.beginPath();
                            if (element.borderRadius >= Math.min(element.width, element.height) / 2) {
                                const radius = Math.min(element.width, element.height) / 2;
                                ctx.arc(element.x + element.width / 2, element.y + element.height / 2, radius, 0, 2 * Math.PI);
                            } else {
                                ctx.roundRect(element.x, element.y, element.width, element.height, element.borderRadius);
                            }
                            ctx.stroke();
                        } else {
                            ctx.strokeRect(element.x, element.y, element.width, element.height);
                        }
                    }
                    break;

                case 'image':
                    if (element.src) {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                            // Draw background color if specified
                            if (element.backgroundColor && element.backgroundColor !== 'transparent') {
                                ctx.fillStyle = element.backgroundColor;
                                if (element.borderRadius) {
                                    ctx.beginPath();
                                    ctx.roundRect(element.x, element.y, element.width, element.height, element.borderRadius);
                                    ctx.fill();
                                } else {
                                    ctx.fillRect(element.x, element.y, element.width, element.height);
                                }
                            }

                            // Clip for rounded corners
                            if (element.borderRadius && element.borderRadius > 0) {
                                ctx.save();
                                ctx.beginPath();
                                ctx.roundRect(element.x, element.y, element.width, element.height, element.borderRadius);
                                ctx.clip();
                            }

                            ctx.drawImage(img, element.x, element.y, element.width, element.height);

                            if (element.borderRadius && element.borderRadius > 0) {
                                ctx.restore();
                            }

                            // Draw border if specified
                            if (element.borderWidth && element.borderWidth > 0) {
                                ctx.strokeStyle = element.borderColor || '#000000';
                                ctx.lineWidth = element.borderWidth;
                                if (element.borderRadius) {
                                    ctx.beginPath();
                                    ctx.roundRect(element.x, element.y, element.width, element.height, element.borderRadius);
                                    ctx.stroke();
                                } else {
                                    ctx.strokeRect(element.x, element.y, element.width, element.height);
                                }
                            }

                            resolve();
                        };
                        img.onerror = () => resolve();
                        img.src = element.src;
                    } else {
                        // Draw placeholder
                        ctx.fillStyle = element.backgroundColor || '#f3f4f6';
                        if (element.borderRadius) {
                            ctx.beginPath();
                            ctx.roundRect(element.x, element.y, element.width, element.height, element.borderRadius);
                            ctx.fill();
                        } else {
                            ctx.fillRect(element.x, element.y, element.width, element.height);
                        }

                        // Draw "Image" text
                        ctx.fillStyle = '#9ca3af';
                        ctx.font = '16px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('Image', element.x + element.width / 2, element.y + element.height / 2);
                        resolve();
                    }
                    break;

                default:
                    resolve();
            }

            ctx.restore();
            if (element.type !== 'image' || !element.src) {
                resolve();
            }
        });
    }, []);

    const exportAsImage = useCallback(async () => {
        if (elements.length === 0) {
            alert('No elements to export. Please add some content to your flyer first.');
            return;
        }

        setIsExporting(true);

        try {
            const canvas = createHighQualityCanvas(exportScale);
            const ctx = canvas.getContext('2d')!;

            // Sort elements by z-index
            const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

            // Render all elements
            for (const element of sortedElements) {
                await renderElementToCanvas(ctx, element, exportScale);
            }

            // Convert to blob and download
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `flyer-${Date.now()}.${exportFormat}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }
                    setIsExporting(false);
                },
                `image/${exportFormat}`,
                exportFormat === 'jpg' ? 0.95 : undefined
            );
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
            setIsExporting(false);
        }
    }, [elements, exportFormat, exportScale, createHighQualityCanvas, renderElementToCanvas]);

    const exportAsPDF = useCallback(async () => {
        if (elements.length === 0) {
            alert('No elements to export. Please add some content to your flyer first.');
            return;
        }

        setIsExporting(true);

        try {
            // Dynamic import of jsPDF to avoid SSR issues
            const { jsPDF } = await import('jspdf');

            // Create high-quality canvas
            const canvas = createHighQualityCanvas(exportScale);
            const ctx = canvas.getContext('2d')!;

            // Sort elements by z-index
            const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

            // Render all elements
            for (const element of sortedElements) {
                await renderElementToCanvas(ctx, element, exportScale);
            }

            // Convert canvas to image data
            const imgData = canvas.toDataURL('image/png', 1.0);

            // eslint-disable-next-line new-cap
            const pdf = new jsPDF({
                orientation: canvasSize.height > canvasSize.width ? 'portrait' : 'landscape',
                unit: 'px',
                format: [canvasSize.width, canvasSize.height],
            });

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 0, 0, canvasSize.width, canvasSize.height);

            // Download PDF
            pdf.save(`flyer-${Date.now()}.pdf`);
            setIsExporting(false);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('PDF export failed. Please try again.');
            setIsExporting(false);
        }
    }, [elements, canvasSize, exportScale, createHighQualityCanvas, renderElementToCanvas]);

    const handleExport = useCallback(() => {
        if (exportFormat === 'pdf') {
            exportAsPDF();
        } else {
            exportAsImage();
        }
    }, [exportFormat, exportAsImage, exportAsPDF]);

    const getFileSizeEstimate = useCallback(() => {
        const pixels = canvasSize.width * canvasSize.height * exportScale * exportScale;
        const bytesPerPixel = exportFormat === 'jpg' ? 3 : 4;
        const estimatedBytes = pixels * bytesPerPixel;
        const estimatedMB = estimatedBytes / (1024 * 1024);
        return estimatedMB.toFixed(1);
    }, [canvasSize, exportScale, exportFormat]);

    return (
        <div className='p-4 space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='text-lg'>Export Settings</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Format Selection */}
                    <div>
                        <Label className='text-sm font-medium mb-2 block'>Export Format</Label>
                        <Select value={exportFormat} onValueChange={(value: 'png' | 'jpg' | 'pdf') => setExportFormat(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='png'>PNG (High Quality, Transparent)</SelectItem>
                                <SelectItem value='jpg'>JPG (Smaller Size, No Transparency)</SelectItem>
                                <SelectItem value='pdf'>PDF (Print Ready)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quality Settings */}
                    {exportFormat !== 'pdf' && (
                        <>
                            <div>
                                <Label className='text-sm font-medium mb-2 block'>
                                    Export Quality: {exportScale}x ({exportQuality} DPI)
                                </Label>
                                <Slider
                                    value={[exportScale]}
                                    onValueChange={([value]) => {
                                        setExportScale(value);
                                        setExportQuality(value * 150); // Base DPI of 150
                                    }}
                                    min={1}
                                    max={4}
                                    step={0.5}
                                    className='mt-2'
                                />
                                <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                                    <span>Standard (1x)</span>
                                    <span>Ultra High (4x)</span>
                                </div>
                            </div>

                            <div className='text-xs text-muted-foreground'>
                                <p>Estimated file size: ~{getFileSizeEstimate()} MB</p>
                                <p>
                                    Output resolution: {canvasSize.width * exportScale} × {canvasSize.height * exportScale} pixels
                                </p>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Export Actions */}
                    <div className='space-y-3'>
                        <Button onClick={handleExport} disabled={isExporting || elements.length === 0} className='w-full'>
                            {isExporting ? (
                                <>
                                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    {exportFormat === 'pdf' ? <FileText className='w-4 h-4 mr-2' /> : <FileImage className='w-4 h-4 mr-2' />}
                                    Export as {exportFormat.toUpperCase()}
                                </>
                            )}
                        </Button>

                        {elements.length === 0 && <p className='text-xs text-muted-foreground text-center'>Add elements to your flyer to enable export</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Export Tips */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-lg'>Export Tips</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm text-muted-foreground'>
                    <div className='flex items-start gap-2'>
                        <Badge variant='outline' className='text-xs'>
                            PNG
                        </Badge>
                        <p>Best for designs with transparency, logos, or when you need the highest quality.</p>
                    </div>
                    <div className='flex items-start gap-2'>
                        <Badge variant='outline' className='text-xs'>
                            JPG
                        </Badge>
                        <p>Smaller file size, ideal for photographs or when transparency isn&apos;t needed.</p>
                    </div>
                    <div className='flex items-start gap-2'>
                        <Badge variant='outline' className='text-xs'>
                            PDF
                        </Badge>
                        <p>Perfect for printing, maintains vector quality and professional standards.</p>
                    </div>
                    <Separator />
                    <div className='space-y-1'>
                        <p className='font-medium text-foreground'>Quality Guidelines:</p>
                        <p>• 1x-2x: Web use, social media</p>
                        <p>• 2x-3x: High-quality prints</p>
                        <p>• 3x-4x: Professional printing, large formats</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
