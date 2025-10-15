'use client';

import type { DesignElement } from '@/app/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Copy, ImageIcon, Square, Trash2, Type } from 'lucide-react';

interface LayerPanelProps {
    elements: DesignElement[];
    selectedElement: string | null;
    onSelectElement: (id: string | null) => void;
    onDeleteElement: (id: string) => void;
    onDuplicateElement: (id: string) => void;
    onMoveElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
}

export function LayerPanel({ elements, selectedElement, onSelectElement, onDeleteElement, onDuplicateElement, onMoveElement }: LayerPanelProps) {
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

    const getElementIcon = (type: DesignElement['type']) => {
        switch (type) {
            case 'text':
                return <Type className='w-4 h-4' />;
            case 'shape':
                return <Square className='w-4 h-4' />;
            case 'image':
                return <ImageIcon className='w-4 h-4' />;
            default:
                return <Square className='w-4 h-4' />;
        }
    };

    const getElementName = (element: DesignElement) => {
        switch (element.type) {
            case 'text':
                return element.content?.substring(0, 20) + (element.content && element.content.length > 20 ? '...' : '') || 'Text';
            case 'shape':
                return 'Shape';
            case 'image':
                return 'Image';
            default:
                return 'Element';
        }
    };

    return (
        <div className='p-4'>
            <Card>
                <CardHeader>
                    <CardTitle className='text-lg flex items-center justify-between'>
                        Layers
                        <Badge variant='secondary'>{elements.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                    <ScrollArea className='h-[500px]'>
                        <div className='space-y-1 p-4'>
                            {sortedElements.length === 0 ? (
                                <div className='text-center py-8 text-muted-foreground'>
                                    <p className='text-sm'>No elements on canvas</p>
                                    <p className='text-xs'>Add elements using the Tools panel</p>
                                </div>
                            ) : (
                                sortedElements.map((element, index) => (
                                    <div
                                        key={element.id}
                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                                            selectedElement === element.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                                        }`}
                                        onClick={() => onSelectElement(element.id)}
                                    >
                                        <div className='flex items-center gap-2 flex-1 min-w-0'>
                                            {getElementIcon(element.type)}
                                            <span className='text-sm truncate'>{getElementName(element)}</span>
                                            <Badge variant='outline' className='text-xs ml-auto'>
                                                {element.zIndex}
                                            </Badge>
                                        </div>

                                        {selectedElement === element.id && (
                                            <div className='flex items-center gap-1'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 w-6 p-0'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMoveElement(element.id, 'top');
                                                    }}
                                                    disabled={index === 0}
                                                >
                                                    <ChevronsUp className='w-3 h-3' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 w-6 p-0'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMoveElement(element.id, 'up');
                                                    }}
                                                    disabled={index === 0}
                                                >
                                                    <ChevronUp className='w-3 h-3' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 w-6 p-0'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMoveElement(element.id, 'down');
                                                    }}
                                                    disabled={index === sortedElements.length - 1}
                                                >
                                                    <ChevronDown className='w-3 h-3' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 w-6 p-0'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMoveElement(element.id, 'bottom');
                                                    }}
                                                    disabled={index === sortedElements.length - 1}
                                                >
                                                    <ChevronsDown className='w-3 h-3' />
                                                </Button>

                                                <Separator orientation='vertical' className='h-4' />

                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 w-6 p-0'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDuplicateElement(element.id);
                                                    }}
                                                >
                                                    <Copy className='w-3 h-3' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 w-6 p-0 text-destructive hover:text-destructive'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteElement(element.id);
                                                    }}
                                                >
                                                    <Trash2 className='w-3 h-3' />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
