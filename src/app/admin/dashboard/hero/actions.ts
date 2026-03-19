
'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const heroSchema = z.object({
  text: z.string().min(1, "El texto no puede estar vacío"),
  position: z.string(),
  textSize: z.coerce.number().min(10, "El tamaño del texto debe ser al menos 10"),
  backgroundType: z.enum(['youtube', 'external_video', 'image']),
  backgroundUrl: z.string().min(1, "La URL o ID del fondo es obligatoria"),
  button: z.object({
    enabled: z.boolean(),
    text: z.string().optional(),
    href: z.string().optional(),
    padding: z.coerce.number().min(0).optional(),
  }),
});

export type HeroFormData = z.infer<typeof heroSchema>;

export type FormState = {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
};

export async function updateHero(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get('backgroundFile') as File | null;
  let backgroundUrl = formData.get('backgroundUrl') as string;

  // Procesar subida de archivo local si existe
  if (file && file.size > 0 && file.name !== 'undefined') {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Definir la ruta de la carpeta public/uploads
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Crear carpeta si no existe
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Limpiar nombre de archivo y añadir timestamp para unicidad
      const safeFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const fileName = `hero-${Date.now()}-${safeFileName}`;
      const filePath = path.join(uploadDir, fileName);
      
      await fs.writeFile(filePath, buffer);
      
      // URL relativa para el navegador
      backgroundUrl = `/uploads/${fileName}`;
    } catch (error) {
      console.error("Error al guardar el archivo del Héroe:", error);
      return { message: "Error al subir el archivo al almacenamiento local.", success: false };
    }
  }

  const rawData = {
    text: formData.get('text'),
    position: formData.get('position'),
    textSize: formData.get('textSize'),
    backgroundType: formData.get('backgroundType'),
    backgroundUrl: backgroundUrl,
    button: {
      enabled: formData.get('button.enabled') === 'true',
      text: formData.get('button.text'),
      href: formData.get('button.href'),
      padding: formData.get('button.padding'),
    }
  };

  const validatedData = heroSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      message: "Error de validación. Revisa los campos.",
      success: false,
      errors: validatedData.error.issues,
    };
  }

  try {
    const heroContent = JSON.stringify(validatedData.data, null, 2);
    const configPath = path.join(process.cwd(), 'src', 'lib', 'hero-data.json');
    await fs.writeFile(configPath, heroContent, 'utf8');
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/hero');

    return { message: "Sección Héroe actualizada con éxito.", success: true };

  } catch (error) {
    console.error("Error al actualizar la sección héroe:", error);
    return { message: "Error del servidor al guardar la configuración.", success: false };
  }
}
