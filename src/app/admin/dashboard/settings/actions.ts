
'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const settingsSchema = z.object({
  stripeSecretKey: z.string().min(1, "La Secret Key es obligatoria"),
  stripePublishableKey: z.string().min(1, "La Publishable Key es obligatoria"),
  stripeWebhookSecret: z.string().optional().or(z.string().length(0)),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export type FormState = {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
};

export async function updateSettings(
  prevState: FormState,
  formData: SettingsFormData
): Promise<FormState> {
  const validatedData = settingsSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: "Error de validación. Revisa los campos.",
      success: false,
      errors: validatedData.error.issues,
    };
  }

  try {
    const settingsContent = JSON.stringify(validatedData.data, null, 2);
    const filePath = path.join(process.cwd(), 'src', 'lib', 'settings-data.json');
    await fs.writeFile(filePath, settingsContent, 'utf8');
    
    revalidatePath('/admin/dashboard/settings');
    revalidatePath('/');

    return { message: "Configuración de Stripe actualizada con éxito.", success: true };

  } catch (error) {
    console.error("Error al actualizar los ajustes:", error);
    return { message: "Error del servidor al guardar los ajustes.", success: false };
  }
}
