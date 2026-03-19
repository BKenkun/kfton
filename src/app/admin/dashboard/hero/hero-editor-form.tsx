
'use client';

import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, Radio } from 'react-aria-components';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Link as LinkIcon } from 'lucide-react';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), {
    ssr: false,
    loading: () => <Skeleton className="min-h-[150px] w-full rounded-md border border-input" />,
});

interface HeroEditorFormProps {
    heroContent: any;
    onSubmit: (e: React.FormEvent) => void;
    control: any;
    register: any;
    errors: any;
    backgroundType: 'youtube' | 'external_video' | 'image';
    buttonEnabled: boolean;
    isSubmitting: boolean;
}

const PositionSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const positions = [
        'top-left', 'top-center', 'top-right',
        'center-left', 'center-center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right'
    ];

    return (
        <div className="grid grid-cols-3 gap-2 w-48 h-32">
            {positions.map(pos => (
                <button
                    key={pos}
                    type="button"
                    onClick={() => onChange(pos)}
                    className={cn(
                        'border rounded-md transition-colors flex items-center justify-center',
                        value === pos ? 'bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2' : 'hover:bg-accent'
                    )}
                    aria-label={`Posición ${pos.replace('-', ' ')}`}
                >
                  <div className={cn('w-3 h-3 rounded-full', value === pos ? 'bg-primary-foreground' : 'bg-muted-foreground' )}></div>
                </button>
            ))}
        </div>
    );
};

const backgroundTypeLabels: { [key: string]: string } = {
    'youtube': 'ID del vídeo de YouTube',
    'external_video': 'URL del vídeo (MP4, WebM, etc.)',
    'image': 'URL de la imagen'
};

const backgroundTypePlaceholders: { [key: string]: string } = {
    'youtube': 'Ej: j7rUThNFB6A',
    'external_video': 'Ej: https://example.com/video.mp4',
    'image': 'Ej: https://example.com/imagen.jpg'
};

export default function HeroEditorForm({
    onSubmit,
    control,
    register,
    errors,
    backgroundType,
    buttonEnabled,
    isSubmitting
}: HeroEditorFormProps) {

  return (
    <form onSubmit={onSubmit} className="space-y-8">
        <Card>
            <CardHeader>
            <CardTitle>Editor de Contenido</CardTitle>
            <CardDescription>
                Personaliza el contenido de la sección principal de tu página de inicio.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="text">Texto principal</Label>
                    <Controller
                    control={control}
                    name="text"
                    render={({ field }) => (
                        <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                        />
                    )}
                    />
                    {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label>Posición del texto</Label>
                        <Controller
                            control={control}
                            name="position"
                            render={({ field }) => <PositionSelector value={field.value} onChange={field.onChange} />}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="textSize">Tamaño del Texto (px)</Label>
                        <Input
                        id="textSize"
                        type="number"
                        {...register('textSize')}
                        placeholder="Ej: 64"
                        />
                        {errors.textSize && <p className="text-sm text-destructive">{errors.textSize.message}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Fondo</CardTitle>
                <CardDescription>Configura lo que se verá detrás del texto principal.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-6">
                <Controller
                    control={control}
                    name="backgroundType"
                    render={({ field }) => (
                        <RadioGroup {...field} className="flex flex-col sm:flex-row flex-wrap gap-4">
                            <Radio value="youtube" className={({isSelected}) => cn("flex items-center gap-2 cursor-pointer", isSelected && "font-bold")}>
                                {({isSelected}) => (
                                    <>
                                        <div className={cn("w-4 h-4 rounded-full border border-primary flex items-center justify-center", isSelected && 'bg-primary')}>
                                            <div className={cn("w-2 h-2 rounded-full", isSelected && "bg-primary-foreground")}></div>
                                        </div>
                                        YouTube
                                    </>
                                )}
                            </Radio>
                            <Radio value="external_video" className={({isSelected}) => cn("flex items-center gap-2 cursor-pointer", isSelected && "font-bold")}>
                                {({isSelected}) => (
                                    <>
                                        <div className={cn("w-4 h-4 rounded-full border border-primary flex items-center justify-center", isSelected && 'bg-primary')}>
                                            <div className={cn("w-2 h-2 rounded-full", isSelected && "bg-primary-foreground")}></div>
                                        </div>
                                        Vídeo
                                    </>
                                )}
                            </Radio>
                            <Radio value="image" className={({isSelected}) => cn("flex items-center gap-2 cursor-pointer", isSelected && "font-bold")}>
                                {({isSelected}) => (
                                    <>
                                        <div className={cn("w-4 h-4 rounded-full border border-primary flex items-center justify-center", isSelected && 'bg-primary')}>
                                            <div className={cn("w-2 h-2 rounded-full", isSelected && "bg-primary-foreground")}></div>
                                        </div>
                                        Imagen
                                    </>
                                )}
                            </Radio>
                        </RadioGroup>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                        <Label htmlFor="backgroundUrl" className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            {backgroundTypeLabels[backgroundType] || 'URL/ID del fondo'}
                        </Label>
                        <Input
                            id="backgroundUrl"
                            {...register('backgroundUrl')}
                            placeholder={backgroundTypePlaceholders[backgroundType] || ''}
                        />
                        <p className="text-xs text-muted-foreground">Usa un enlace externo o ID de vídeo.</p>
                        {errors.backgroundUrl && <p className="text-sm text-destructive">{errors.backgroundUrl.message}</p>}
                    </div>

                    {backgroundType !== 'youtube' && (
                        <div className="space-y-2">
                            <Label htmlFor="backgroundFile" className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                O sube un archivo local
                            </Label>
                            <Input
                                id="backgroundFile"
                                type="file"
                                accept={backgroundType === 'image' ? "image/*" : "video/*"}
                                {...register('backgroundFile')}
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">Sube el archivo directamente al servidor.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Botón</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="button-enabled" className='text-base'>Llamada a la acción</Label>
                    <Controller
                        control={control}
                        name="button.enabled"
                        render={({ field }) => (
                            <Switch
                                id="button-enabled"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>
                {buttonEnabled && (
                    <div className='space-y-4 pt-4 border-t'>
                        <div className="space-y-2">
                            <Label htmlFor="button-text">Texto del botón</Label>
                            <Input
                                id="button-text"
                                {...register('button.text')}
                                placeholder="Ej: Ver menú"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="button-href">Enlace del botón</Label>
                            <Input
                                id="button-href"
                                {...register('button.href')}
                                placeholder="Ej: #menu o /tienda"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="button-padding">Relleno del Botón (px)</Label>
                            <Input
                                id="button-padding"
                                type="number"
                                {...register('button.padding')}
                                placeholder="Ej: 32"
                            />
                            {errors.button?.padding && <p className="text-sm text-destructive">{errors.button.padding.message}</p>}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </form>
  );
}
