
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateMenu, type FormState, type MenuFormData } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { z } from 'zod';

const menuItemSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío"),
  price: z.string().min(1, "El precio no puede estar vacío"),
  description: z.string().optional(),
});

const subcategorySchema = z.object({
  name: z.string().min(1, "El nombre de la subcategoría no puede estar vacío"),
  items: z.array(menuItemSchema),
});

const categorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoría no puede estar vacío"),
  subcategories: z.array(subcategorySchema),
});

const dishOfTheWeekSchema = z.object({
    name: z.string().min(1, "El nombre del plato de la semana no puede estar vacío"),
    description: z.string().optional(),
    price: z.string().min(1, "El precio del plato de la semana no puede estar vacío"),
});

const menuSchema = z.object({
  dishesOfTheWeek: z.array(dishOfTheWeekSchema),
  categories: z.array(categorySchema),
});


const initialState: FormState = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Guardando...' : 'Guardar Cambios'}
    </Button>
  );
}

export default function MenuEditorForm({ menuContent }: { menuContent: MenuFormData }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: menuContent
  });
  
  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control,
    name: 'categories',
  });
  
  const { fields: dishFields, append: appendDish, remove: removeDish } = useFieldArray({
    control,
    name: 'dishesOfTheWeek',
  });

  const { toast } = useToast();

  const [state, formAction] = useActionState(updateMenu, initialState);

  const onFormSubmit = (data: MenuFormData) => {
    formAction(data);
  };
  
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
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Editor del Menú</CardTitle>
          <CardDescription>
            Modifica, añade o elimina platos, precios y descripciones de tu menú.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl sm:text-2xl font-headline">Platos de la Semana</h3>
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendDish({ name: 'Nuevo Plato', description: '', price: '' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Plato
                </Button>
            </div>
            <div className="space-y-6">
                {dishFields.map((dish, index) => (
                    <div key={dish.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-3 -right-3 h-7 w-7 bg-background"
                            onClick={() => removeDish(index)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <div className="space-y-2">
                            <Label htmlFor={`dishesOfTheWeek.${index}.name`}>Nombre</Label>
                            <Input id={`dishesOfTheWeek.${index}.name`} {...register(`dishesOfTheWeek.${index}.name`)} />
                            {errors.dishesOfTheWeek?.[index]?.name && <p className="text-sm text-destructive">{errors.dishesOfTheWeek[index]!.name!.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`dishesOfTheWeek.${index}.price`}>Precio</Label>
                            <Input id={`dishesOfTheWeek.${index}.price`} {...register(`dishesOfTheWeek.${index}.price`)} />
                            {errors.dishesOfTheWeek?.[index]?.price && <p className="text-sm text-destructive">{errors.dishesOfTheWeek[index]!.price!.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`dishesOfTheWeek.${index}.description`}>Descripción</Label>
                            <Textarea id={`dishesOfTheWeek.${index}.description`} {...register(`dishesOfTheWeek.${index}.description`)} />
                        </div>
                    </div>
                ))}
                 {dishFields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay platos de la semana.</p>
                )}
            </div>
          </div>
          
          <Separator />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl sm:text-2xl font-headline">Categorías y Platos</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendCategory({ name: 'Nueva Categoría', subcategories: [] })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Categoría
              </Button>
            </div>
            <Accordion type="multiple" className="w-full">
              {categoryFields.map((category, categoryIndex) => (
                <AccordionItem key={category.id} value={`category-${categoryIndex}`}>
                  <div className="flex items-center gap-2">
                    <AccordionTrigger className="text-2xl sm:text-3xl font-headline flex-1">
                      <Controller
                          control={control}
                          name={`categories.${categoryIndex}.name`}
                          render={({ field }) => <Input {...field} placeholder="Nombre de la categoría" className="text-2xl sm:text-3xl font-headline border-none shadow-none focus-visible:ring-0 p-0 h-auto" />}
                      />
                    </AccordionTrigger>
                     <Button type="button" variant="ghost" size="icon" onClick={() => removeCategory(categoryIndex)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <AccordionContent className="pl-2 sm:pl-8 space-y-4">
                     <Subcategories control={control} categoryIndex={categoryIndex} errors={errors} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </CardContent>
        <CardFooter>
            <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}

const Subcategories = ({ control, categoryIndex, errors }: { control: any, categoryIndex: number, errors: any }) => {
    const { fields: subcategoryFields, append: appendSubcategory, remove: removeSubcategory } = useFieldArray({
        control,
        name: `categories.${categoryIndex}.subcategories`,
    });

    return (
      <>
        <Accordion type="multiple" className="w-full">
            {subcategoryFields.map((subcategory, subcategoryIndex) => (
                <AccordionItem key={subcategory.id} value={`subcategory-${categoryIndex}-${subcategoryIndex}`}>
                  <div className="flex items-center gap-2">
                    <AccordionTrigger className="text-xl sm:text-2xl font-headline flex-1">
                         <Controller
                            control={control}
                            name={`categories.${categoryIndex}.subcategories.${subcategoryIndex}.name`}
                            render={({ field }) => <Input {...field} placeholder="Nombre de la subcategoría" className="text-xl sm:text-2xl font-headline border-none shadow-none focus-visible:ring-0 p-0 h-auto" />}
                        />
                    </AccordionTrigger>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSubcategory(subcategoryIndex)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                    <AccordionContent className="space-y-4 pt-4">
                        <MenuItems control={control} categoryIndex={categoryIndex} subcategoryIndex={subcategoryIndex} errors={errors} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
         <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => appendSubcategory({ name: 'Nueva Subcategoría', items: [] })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Subcategoría
        </Button>
      </>
    );
};

const MenuItems = ({ control, categoryIndex, subcategoryIndex, errors }: { control: any, categoryIndex: number, subcategoryIndex: number, errors: any }) => {
    const { fields: menuItemsFields, append: appendMenuItem, remove: removeMenuItem } = useFieldArray({
        control,
        name: `categories.${categoryIndex}.subcategories.${subcategoryIndex}.items`,
    });

    return (
        <div className="space-y-6">
            {menuItemsFields.map((item, itemIndex) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-4 relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-3 -right-3 h-7 w-7 bg-background"
                        onClick={() => removeMenuItem(itemIndex)}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre del Plato</Label>
                             <Controller
                                control={control}
                                name={`categories.${categoryIndex}.subcategories.${subcategoryIndex}.items.${itemIndex}.name`}
                                render={({ field }) => <Input {...field} placeholder="Ej: Café con Leche"/>}
                            />
                        </div>
                        <div className="space-y-2">
                             <Label>Precio</Label>
                             <Controller
                                control={control}
                                name={`categories.${categoryIndex}.subcategories.${subcategoryIndex}.items.${itemIndex}.price`}
                                render={({ field }) => <Input {...field} placeholder="Ej: 2,70" />}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Descripción (opcional)</Label>
                        <Controller
                            control={control}
                            name={`categories.${categoryIndex}.subcategories.${subcategoryIndex}.items.${itemIndex}.description`}
                            render={({ field }) => <Textarea {...field} placeholder="Ej: Café con leche de avena" />}
                        />
                    </div>
                </div>
            ))}
             <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => appendMenuItem({ name: '', price: '', description: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Plato
            </Button>
        </div>
    );
}

    
