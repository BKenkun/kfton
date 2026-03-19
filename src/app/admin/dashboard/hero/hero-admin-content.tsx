
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import HeroEditorForm from './hero-editor-form';
import HeroPreview from './hero-preview';
import type { HeroFormData } from './actions';
import { updateHero } from './actions';

const heroSchema = z.object({
    text: z.string().min(1, "El texto no puede estar vacío"),
    position: z.string(),
    textSize: z.coerce.number().min(10, "El tamaño del texto debe ser al menos 10"),
    backgroundType: z.enum(['youtube', 'external_video', 'image']),
    backgroundUrl: z.string().min(1, "La URL o ID del fondo es obligatoria"),
    backgroundFile: z.any().optional(),
    button: z.object({
        enabled: z.boolean(),
        text: z.string().optional(),
        href: z.string().optional(),
        padding: z.coerce.number().min(0).optional(),
    }),
});

export default function HeroAdminContent({ heroContent }: { heroContent: HeroFormData }) {
    const { register, control, handleSubmit, getValues, watch, formState: { errors } } = useForm<HeroFormData>({
        resolver: zodResolver(heroSchema),
        defaultValues: heroContent
    });
    
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewData, setPreviewData] = useState(heroContent);

    const backgroundType = watch('backgroundType');
    const buttonEnabled = watch('button.enabled');

    const handleFormSubmit = async (data: any) => {
        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append('text', data.text);
        formData.append('position', data.position);
        formData.append('textSize', data.textSize.toString());
        formData.append('backgroundType', data.backgroundType);
        formData.append('backgroundUrl', data.backgroundUrl);
        formData.append('button.enabled', data.button.enabled.toString());
        if (data.button.text) formData.append('button.text', data.button.text);
        if (data.button.href) formData.append('button.href', data.button.href);
        if (data.button.padding) formData.append('button.padding', data.button.padding.toString());

        // Manejar archivo si existe
        if (data.backgroundFile && data.backgroundFile[0]) {
            formData.append('backgroundFile', data.backgroundFile[0]);
        }

        const result = await updateHero({ message: '', success: false }, formData);
        setIsSubmitting(false);

        toast({
            title: result.success ? 'Éxito' : 'Error',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });
    };
    
    const handlePreviewUpdate = () => {
        const values = getValues();
        setPreviewData(values);
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full gap-8 pb-24">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Gestión de Héroe</h1>
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Previsualización</h2>
                    <Card className="overflow-hidden">
                        <HeroPreview heroContent={previewData} />
                    </Card>
                </div>

                <HeroEditorForm 
                    heroContent={heroContent}
                    onSubmit={handleSubmit(handleFormSubmit)}
                    control={control}
                    register={register}
                    errors={errors}
                    backgroundType={backgroundType}
                    buttonEnabled={buttonEnabled}
                    isSubmitting={isSubmitting}
                />

                <div className="fixed bottom-6 right-6 z-50 bg-background/80 backdrop-blur-sm p-2 rounded-lg border flex items-center gap-2 shadow-lg">
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button type="button" variant="outline" size="icon" onClick={handlePreviewUpdate}>
                                <RefreshCw className="h-4 w-4" />
                                <span className="sr-only">Actualizar Previsualización</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Actualizar Previsualización</p>
                        </TooltipContent>
                    </Tooltip>
                   
                    <Button 
                        type="button" 
                        size="icon" 
                        disabled={isSubmitting}
                        onClick={handleSubmit(handleFormSubmit)}
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span className="sr-only">Guardar Cambios</span>
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
}
