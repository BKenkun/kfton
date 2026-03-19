'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateSettings, type SettingsFormData, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useActionState } from 'react';
import { Loader2, Save, Key, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const settingsSchema = z.object({
  stripeSecretKey: z.string().min(1, "La Secret Key es obligatoria"),
  stripePublishableKey: z.string().min(1, "La Publishable Key es obligatoria"),
  stripeWebhookSecret: z.string().optional().or(z.string().length(0)),
});

const initialState: FormState = {
  message: '',
  success: false,
};

export default function SettingsForm({ initialData }: { initialData: SettingsFormData }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateSettings, initialState);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

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
    <form action={formAction}>
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Seguridad Crítica</AlertTitle>
          <AlertDescription>
            Estas claves permiten realizar transacciones reales. El archivo de configuración ha sido añadido al <code>.gitignore</code> para que no se suba a GitHub, pero asegúrate de que solo personas de confianza tengan acceso a este panel.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Conexión con Stripe</CardTitle>
            <CardDescription>
              Introduce las API Keys de tu cuenta de Stripe. Estos valores se guardan localmente en el servidor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="stripePublishableKey" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Publishable Key (pk_...)
              </Label>
              <Input
                id="stripePublishableKey"
                {...register('stripePublishableKey')}
                placeholder="pk_test_..."
                type="text"
              />
              {errors.stripePublishableKey && <p className="text-sm text-destructive">{errors.stripePublishableKey.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripeSecretKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Secret Key (sk_...)
              </Label>
              <Input
                id="stripeSecretKey"
                {...register('stripeSecretKey')}
                placeholder="sk_test_..."
                type="password"
              />
              {errors.stripeSecretKey && <p className="text-sm text-destructive">{errors.stripeSecretKey.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripeWebhookSecret" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Webhook Secret (whsec_...)
              </Label>
              <Input
                id="stripeWebhookSecret"
                {...register('stripeWebhookSecret')}
                placeholder="whsec_..."
                type="password"
              />
              <p className="text-xs text-muted-foreground">Necesario para que Stripe avise a la web de pagos completados.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Configuración
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}