
'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const scheduleItemSchema = z.object({
  day: z.string(),
  hours: z.string(),
});

const scheduleSchema = z.object({
  schedule: z.array(scheduleItemSchema),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

export type FormState = {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
};

export async function updateSchedule(
  prevState: FormState,
  formData: ScheduleFormData
): Promise<FormState> {
  const validatedData = scheduleSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: "Error de validación. Revisa los campos.",
      success: false,
      errors: validatedData.error.issues,
    };
  }

  try {
    const scheduleContent = JSON.stringify(validatedData.data, null, 2);
    const filePath = path.join(process.cwd(), 'src', 'lib', 'schedule-data.json');
    await fs.writeFile(filePath, scheduleContent, 'utf8');
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/schedule');

    return { message: "Horario actualizado con éxito.", success: true };

  } catch (error) {
    console.error("Error al actualizar el horario:", error);
    return { message: "Error del servidor al guardar el horario.", success: false };
  }
}
