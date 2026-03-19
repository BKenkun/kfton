'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

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

export type MenuFormData = z.infer<typeof menuSchema>;

export type FormState = {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
};

export async function updateMenu(
  prevState: FormState,
  formData: MenuFormData
): Promise<FormState> {
  const validatedData = menuSchema.safeParse(formData);

  if (!validatedData.success) {
    console.log(validatedData.error.issues);
    return {
      message: "Error de validación. Revisa los campos.",
      success: false,
      errors: validatedData.error.issues,
    };
  }

  try {
    const menuContent = JSON.stringify(validatedData.data, null, 2);
    const filePath = path.join(process.cwd(), 'src', 'lib', 'menu-data.json');
    await fs.writeFile(filePath, menuContent, 'utf8');
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/menu');

    return { message: "Menú actualizado con éxito.", success: true };

  } catch (error) {
    console.error("Error al actualizar el menú:", error);
    return { message: "Error del servidor al guardar el menú.", success: false };
  }
}
