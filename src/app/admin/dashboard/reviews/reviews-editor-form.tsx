'use client';

import React, { useEffect, useActionState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateReviews, type ReviewsFormData, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';
import { Loader2, PlusCircle, Star, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const reviewSchema = z.object({
  author: z.string().min(1, "El autor no puede estar vacío"),
  text: z.string().min(1, "El texto de la reseña no puede estar vacío"),
  rating: z.coerce.number().min(1, "La valoración debe ser de al menos 1 estrella").max(5, "La valoración no puede superar las 5 estrellas"),
});

const reviewsSchema = z.object({
  reviews: z.array(reviewSchema),
});

const initialState: FormState = {
  message: '',
  success: false,
};

const StarRatingInput = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    const [hover, setHover] = React.useState(0);
    return (
        <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        onClick={() => onChange(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none"
                    >
                        <Star
                            className={cn(
                                "h-6 w-6 cursor-pointer transition-colors",
                                ratingValue <= (hover || value) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Guardando...' : 'Guardar Reseñas'}
    </Button>
  );
}

export default function ReviewsEditorForm({ reviewsContent }: { reviewsContent: ReviewsFormData }) {
  const { toast } = useToast();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<ReviewsFormData>({
    resolver: zodResolver(reviewsSchema),
    defaultValues: reviewsContent,
  });
  
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'reviews',
  });

  const [state, formAction] = useActionState(updateReviews, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Éxito' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);
  
  return (
    <form onSubmit={handleSubmit(formAction)}>
      <Card>
        <CardHeader>
          <CardTitle>Editor de Reseñas</CardTitle>
          <CardDescription>
            Añade, elimina, modifica y reordena las reseñas que se muestran en la web.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Accordion type="multiple" className="w-full">
            {fields.map((field, index) => (
               <AccordionItem key={field.id} value={`item-${index}`}>
                 <div className="flex items-center gap-2">
                    <AccordionTrigger className="text-lg font-semibold flex-1">
                        Reseña de: {field.author || '...'}
                    </AccordionTrigger>
                     <div className='flex items-center'>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => move(index, index - 1)}
                            disabled={index === 0}
                            aria-label="Mover hacia arriba"
                        >
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => move(index, index + 1)}
                            disabled={index === fields.length - 1}
                            aria-label="Mover hacia abajo"
                        >
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </div>
                  <AccordionContent className="p-4 border rounded-lg space-y-4 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`reviews.${index}.author`}>Autor</Label>
                            <Input
                                id={`reviews.${index}.author`}
                                {...register(`reviews.${index}.author`)}
                                placeholder="Nombre del autor"
                            />
                            {errors?.reviews?.[index]?.author && (
                                <p className="text-sm text-destructive mt-1">
                                {errors.reviews[index]!.author!.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                           <Label>Estrellas</Label>
                           <Controller
                                control={control}
                                name={`reviews.${index}.rating`}
                                render={({ field }) => (
                                    <StarRatingInput value={field.value} onChange={field.onChange} />
                                )}
                            />
                             {errors?.reviews?.[index]?.rating && (
                                <p className="text-sm text-destructive mt-1">
                                {errors.reviews[index]!.rating!.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`reviews.${index}.text`}>Texto de la reseña</Label>
                        <Textarea
                            id={`reviews.${index}.text`}
                            {...register(`reviews.${index}.text`)}
                            placeholder="Escribe la reseña aquí..."
                            rows={4}
                        />
                        {errors?.reviews?.[index]?.text && (
                        <p className="text-sm text-destructive mt-1">
                            {errors.reviews[index]!.text!.message}
                        </p>
                        )}
                    </div>
                  </AccordionContent>
               </AccordionItem>
            ))}
          </Accordion>
           <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => append({ author: "", text: "", rating: 5 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Reseña
          </Button>

        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}