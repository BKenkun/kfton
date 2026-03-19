
'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const reviewSchema = z.object({
  author: z.string().min(1, "El autor no puede estar vacío"),
  text: z.string().min(1, "El texto de la reseña no puede estar vacío"),
  rating: z.number().min(1, "La valoración debe ser de al menos 1 estrella").max(5, "La valoración no puede superar las 5 estrellas"),
});

const reviewsSchema = z.object({
  reviews: z.array(reviewSchema),
});

export type ReviewsFormData = z.infer<typeof reviewsSchema>;

export type FormState = {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
};

export async function updateReviews(
  prevState: FormState,
  formData: ReviewsFormData
): Promise<FormState> {
  // We need to coerce rating to a number as it comes from a select
  const transformedData = {
    ...formData,
    reviews: formData.reviews.map(r => ({ ...r, rating: Number(r.rating) }))
  };

  const validatedData = reviewsSchema.safeParse(transformedData);

  if (!validatedData.success) {
    return {
      message: "Error de validación. Revisa los campos.",
      success: false,
      errors: validatedData.error.issues,
    };
  }

  try {
    const reviewsContent = JSON.stringify(validatedData.data, null, 2);
    const filePath = path.join(process.cwd(), 'src', 'lib', 'reviews-data.json');
    await fs.writeFile(filePath, reviewsContent, 'utf8');
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/reviews');

    return { message: "Reseñas actualizadas con éxito.", success: true };

  } catch (error) {
    console.error("Error al actualizar las reseñas:", error);
    return { message: "Error del servidor al guardar las reseñas.", success: false };
  }
}
