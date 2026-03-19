
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateSchedule, type FormState, type ScheduleFormData } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const scheduleItemSchema = z.object({
  day: z.string(),
  hours: z.string().min(1, 'El horario no puede estar vacío'),
});

const scheduleSchema = z.object({
  schedule: z.array(scheduleItemSchema),
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
      {pending ? 'Guardando...' : 'Guardar Horario'}
    </Button>
  );
}

export default function ScheduleEditorForm({ scheduleContent }: { scheduleContent: ScheduleFormData }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: scheduleContent,
  });
  
  const { fields: scheduleFields } = useFieldArray({
    control,
    name: 'schedule',
  });

  const { toast } = useToast();
  const [state, formAction] = useActionState(updateSchedule, initialState);

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
          <CardTitle>Editor de Horario</CardTitle>
          <CardDescription>
            Actualiza el horario de apertura de la tienda. Los cambios se reflejarán inmediatamente en la web.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduleFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-center gap-4">
              <Label htmlFor={`schedule.${index}.hours`} className="font-semibold">{field.day}</Label>
              <div>
                <Input
                  id={`schedule.${index}.hours`}
                  {...register(`schedule.${index}.hours`)}
                  placeholder="Ej: 8:00 - 16:00 o Cerrado"
                />
                {errors?.schedule?.[index]?.hours && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.schedule[index]!.hours!.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}

    