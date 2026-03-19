
import fs from 'fs/promises';
import path from 'path';
import SettingsForm from './settings-form';
import type { SettingsFormData } from './actions';

async function getSettings(): Promise<SettingsFormData> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'settings-data.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Si no existe, devolvemos las de las variables de entorno actuales (si existen)
    return {
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    };
  }
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Ajustes de la Plataforma</h1>
      </div>
      <div className="max-w-3xl">
        <SettingsForm initialData={settings} />
      </div>
    </div>
  );
}
