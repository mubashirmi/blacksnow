'use client';

import type React from 'react';

import type { DesignElement } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Circle, ImageIcon, Square, Triangle, Type } from 'lucide-react';
import { useState } from 'react';

interface ToolPanelProps {
    selectedElement: DesignElement | null;
    onAddElement: (type: DesignElement['type'], options?: Partial<DesignElement>) => void;
    onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
}

export function ToolPanel({ selectedElement, onAddElement, onUpdateElement }: ToolPanelProps) {
    const [imageUrl, setImageUrl] = useState('');

    const handleAddText = () => {
        onAddElement('text');
    };

    const handleAddShape = (shapeType: string) => {
        const options: Partial<DesignElement> = {
            backgroundColor: '#8b5cf6',
        };

        if (shapeType === 'circle') {
            options.borderRadius = 50;
        } else if (shapeType === 'rounded-rect') {
            options.borderRadius = 12;
        }

        onAddElement('shape', options);
    };

    const handleAddImage = () => {
        if (imageUrl.trim()) {
            onAddElement('image', { src: imageUrl.trim() });
            setImageUrl('');
        } else {
            onAddElement('image');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                onAddElement('image', { src });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='p-4 space-y-6'>
            {/* Add Elements */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-lg'>Add Elements</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Text */}
                    <div>
                        <Label className='text-sm font-medium mb-2 block'>Text</Label>
                        <Button onClick={handleAddText} className='w-full justify-start bg-transparent' variant='outline'>
                            <Type className='w-4 h-4 mr-2' />
                            Add Text
                        </Button>
                    </div>

                    {/* Shapes */}
                    <div>
                        <Label className='text-sm font-medium mb-2 block'>Shapes</Label>
                        <div className='grid grid-cols-2 gap-2'>
                            <Button onClick={() => handleAddShape('rectangle')} variant='outline' size='sm'>
                                <Square className='w-4 h-4 mr-1' />
                                Rectangle
                            </Button>
                            <Button onClick={() => handleAddShape('circle')} variant='outline' size='sm'>
                                <Circle className='w-4 h-4 mr-1' />
                                Circle
                            </Button>
                            <Button onClick={() => handleAddShape('rounded-rect')} variant='outline' size='sm'>
                                <Square className='w-4 h-4 mr-1' />
                                Rounded
                            </Button>
                            <Button onClick={() => handleAddShape('triangle')} variant='outline' size='sm'>
                                <Triangle className='w-4 h-4 mr-1' />
                                Triangle
                            </Button>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <Label className='text-sm font-medium mb-2 block'>Images</Label>
                        <div className='space-y-2'>
                            <div className='flex gap-2'>
                                <Input placeholder='Image URL' value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className='flex-1' />
                                <Button onClick={handleAddImage} size='sm'>
                                    Add
                                </Button>
                            </div>
                            <div className='relative'>
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleImageUpload}
                                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                                />
                                <Button variant='outline' className='w-full justify-start bg-transparent'>
                                    <ImageIcon className='w-4 h-4 mr-2' />
                                    Upload Image
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Element Properties */}
            {selectedElement && (
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>Properties</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {/* Position & Size */}
                        <div className='grid grid-cols-2 gap-2'>
                            <div>
                                <Label className='text-xs'>X Position</Label>
                                <Input
                                    type='number'
                                    value={Math.round(selectedElement.x)}
                                    onChange={(e) => onUpdateElement(selectedElement.id, { x: Number.parseInt(e.target.value) || 0 })}
                                    className='h-8'
                                />
                            </div>
                            <div>
                                <Label className='text-xs'>Y Position</Label>
                                <Input
                                    type='number'
                                    value={Math.round(selectedElement.y)}
                                    onChange={(e) => onUpdateElement(selectedElement.id, { y: Number.parseInt(e.target.value) || 0 })}
                                    className='h-8'
                                />
                            </div>
                            <div>
                                <Label className='text-xs'>Width</Label>
                                <Input
                                    type='number'
                                    value={Math.round(selectedElement.width)}
                                    onChange={(e) => onUpdateElement(selectedElement.id, { width: Number.parseInt(e.target.value) || 1 })}
                                    className='h-8'
                                />
                            </div>
                            <div>
                                <Label className='text-xs'>Height</Label>
                                <Input
                                    type='number'
                                    value={Math.round(selectedElement.height)}
                                    onChange={(e) => onUpdateElement(selectedElement.id, { height: Number.parseInt(e.target.value) || 1 })}
                                    className='h-8'
                                />
                            </div>
                        </div>

                        {/* Rotation */}
                        <div>
                            <Label className='text-sm'>Rotation: {selectedElement.rotation}°</Label>
                            <Slider
                                value={[selectedElement.rotation]}
                                onValueChange={([value]) => onUpdateElement(selectedElement.id, { rotation: value })}
                                min={-180}
                                max={180}
                                step={1}
                                className='mt-2'
                            />
                        </div>

                        {/* Opacity */}
                        <div>
                            <Label className='text-sm'>Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%</Label>
                            <Slider
                                value={[(selectedElement.opacity || 1) * 100]}
                                onValueChange={([value]) => onUpdateElement(selectedElement.id, { opacity: value / 100 })}
                                min={0}
                                max={100}
                                step={1}
                                className='mt-2'
                            />
                        </div>

                        <Separator />

                        {/* Text Properties */}
                        {selectedElement.type === 'text' && (
                            <div className='space-y-3'>
                                <div>
                                    <Label className='text-sm'>Content</Label>
                                    <Input
                                        value={selectedElement.content || ''}
                                        onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                                        placeholder='Enter text'
                                    />
                                </div>

                                <div>
                                    <Label className='text-sm'>Font Size</Label>
                                    <Input
                                        type='number'
                                        value={selectedElement.fontSize || 24}
                                        onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: Number.parseInt(e.target.value) || 24 })}
                                    />
                                </div>

                                <div>
                                    <Label className='text-sm'>Font Family</Label>
                                    <Select
                                        value={selectedElement.fontFamily || 'Arial'}
                                        onValueChange={(value) => onUpdateElement(selectedElement.id, { fontFamily: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Arial'>Arial</SelectItem>
                                            <SelectItem value='Helvetica'>Helvetica</SelectItem>
                                            <SelectItem value='Times New Roman'>Times New Roman</SelectItem>
                                            <SelectItem value='Georgia'>Georgia</SelectItem>
                                            <SelectItem value='Verdana'>Verdana</SelectItem>
                                            <SelectItem value='Courier New'>Courier New</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className='text-sm'>Text Color</Label>
                                    <Input
                                        type='color'
                                        value={selectedElement.color || '#1f2937'}
                                        onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Shape/Image Properties */}
                        {(selectedElement.type === 'shape' || selectedElement.type === 'image') && (
                            <div className='space-y-3'>
                                <div>
                                    <Label className='text-sm'>Background Color</Label>
                                    <Input
                                        type='color'
                                        value={selectedElement.backgroundColor || '#8b5cf6'}
                                        onChange={(e) => onUpdateElement(selectedElement.id, { backgroundColor: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label className='text-sm'>Border Radius</Label>
                                    <Input
                                        type='number'
                                        value={selectedElement.borderRadius || 0}
                                        onChange={(e) => onUpdateElement(selectedElement.id, { borderRadius: Number.parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div>
                                    <Label className='text-sm'>Border Width</Label>
                                    <Input
                                        type='number'
                                        value={selectedElement.borderWidth || 0}
                                        onChange={(e) => onUpdateElement(selectedElement.id, { borderWidth: Number.parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                {selectedElement.borderWidth && selectedElement.borderWidth > 0 && (
                                    <div>
                                        <Label className='text-sm'>Border Color</Label>
                                        <Input
                                            type='color'
                                            value={selectedElement.borderColor || '#000000'}
                                            onChange={(e) => onUpdateElement(selectedElement.id, { borderColor: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Image-specific Properties */}
                        {selectedElement.type === 'image' && (
                            <div>
                                <Label className='text-sm'>Image URL</Label>
                                <Input
                                    value={selectedElement.src || ''}
                                    onChange={(e) => onUpdateElement(selectedElement.id, { src: e.target.value })}
                                    placeholder='Enter image URL'
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
