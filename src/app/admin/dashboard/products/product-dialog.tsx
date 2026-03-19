
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { upsertProductAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Info, Image as ImageIcon, Upload } from 'lucide-react';
import type { StripeProduct } from '@/lib/stripe';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.string().min(1, 'El precio es obligatorio'),
  category: z.enum(['cafe', 'merchan']),
  image: z.string().optional().or(z.string().length(0)),
  image2: z.string().optional().or(z.string().length(0)),
  imageFile: z.any().optional(),
  image2File: z.any().optional(),
  metadata: z.record(z.string()).default({}),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  product?: StripeProduct;
  trigger?: React.ReactNode;
}

export function ProductDialog({ product, trigger }: ProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!product;

  const getExistingNotes = () => {
    if (!product?.metadata) return '';
    return Object.entries(product.metadata)
      .filter(([key]) => key.startsWith('notas_'))
      .map(([, val]) => val)
      .filter(Boolean)
      .join(', ');
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product ? ((product.priceInCents || 0) / 100).toString().replace('.', ',') : '',
      category: (product?.metadata?.category as 'cafe' | 'merchan') || 'cafe',
      image: product?.images?.[0] || '',
      image2: product?.images?.[1] || '',
      metadata: {
        ...product?.metadata,
        notas_temp: getExistingNotes(),
      },
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: product?.name || '',
        description: product?.description || '',
        price: product ? ((product.priceInCents || 0) / 100).toString().replace('.', ',') : '',
        category: (product?.metadata?.category as 'cafe' | 'merchan') || 'cafe',
        image: product?.images?.[0] || '',
        image2: product?.images?.[1] || '',
        metadata: {
          ...product?.metadata,
          notas_temp: getExistingNotes(),
        },
      });
    }
  }, [open, product, form]);

  const category = form.watch('category');

  async function onSubmit(values: ProductFormValues) {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description || '');
    formData.append('price', values.price);
    formData.append('category', values.category);
    formData.append('image', values.image || '');
    formData.append('image2', values.image2 || '');
    
    // Adjuntar archivos si existen
    if (values.imageFile && values.imageFile[0]) {
      formData.append('imageFile', values.imageFile[0]);
    }
    if (values.image2File && values.image2File[0]) {
      formData.append('image2File', values.image2File[0]);
    }

    formData.append('metadata', JSON.stringify(values.metadata));

    const result = await upsertProductAction(formData, product?.id);
    setLoading(false);

    if (result.success) {
      toast({ title: 'Éxito', description: result.message });
      setOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            Gestiona los detalles del producto. Puedes usar URLs externas o subir archivos locales.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Café kfton Blend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (€)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Ej: 15,50" {...field} />
                    </FormControl>
                    <FormDescription>Usa coma para los céntimos.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe el producto..." {...field} className="min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cafe">Café</SelectItem>
                        <SelectItem value="merchan">Merchandising</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Imagen Principal
                </h4>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">URL externa</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1"><Upload className="h-3 w-3"/> O subir archivo</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          className="cursor-pointer"
                          onChange={(e) => onChange(e.target.files)} 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Imagen Secundaria
                </h4>
                <FormField
                  control={form.control}
                  name="image2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">URL externa</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image2File"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1"><Upload className="h-3 w-3"/> O subir archivo</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          className="cursor-pointer"
                          onChange={(e) => onChange(e.target.files)} 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-sm">Atributos de {category === 'cafe' ? 'Café' : 'Merchan'}</h4>
              </div>
              
              {category === 'cafe' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Origen</FormLabel>
                    <Input {...form.register('metadata.origen')} placeholder="Ej: Etiopía" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Proceso</FormLabel>
                    <Input {...form.register('metadata.proceso')} placeholder="Ej: Natural" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Tueste</FormLabel>
                    <Input {...form.register('metadata.tueste')} placeholder="Ej: Filtro" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Stock Total (Bolsas)</FormLabel>
                    <Input type="number" {...form.register('metadata.stock')} placeholder="Ej: 50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <FormLabel>Notas de Cata</FormLabel>
                    <Input {...form.register('metadata.notas_temp')} placeholder="Ej: Chocolate, Arándanos, Jazmín" />
                    <FormDescription>Separa las notas con comas.</FormDescription>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <FormLabel>Tallas Disponibles</FormLabel>
                    <Input {...form.register('metadata.tallas')} placeholder="Ej: S, M, L, XL" />
                    <FormDescription>Separadas por comas.</FormDescription>
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Material</FormLabel>
                    <Input {...form.register('metadata.material')} placeholder="Ej: Algodón orgánico" />
                  </div>
                   <div className="space-y-2">
                    <FormLabel>Color</FormLabel>
                    <Input {...form.register('metadata.color')} placeholder="Ej: Off-white" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Stock S</FormLabel>
                    <Input type="number" {...form.register('metadata.stock_s')} defaultValue="0" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Stock M</FormLabel>
                    <Input type="number" {...form.register('metadata.stock_m')} defaultValue="0" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Stock L</FormLabel>
                    <Input type="number" {...form.register('metadata.stock_l')} defaultValue="0" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Stock XL</FormLabel>
                    <Input type="number" {...form.register('metadata.stock_xl')} defaultValue="0" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background pb-2 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
