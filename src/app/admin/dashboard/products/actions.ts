
'use server';

import { 
  createStripeProduct, 
  updateStripeProduct, 
  archiveStripeProduct,
  stripe 
} from '@/lib/stripe';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

async function saveFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0 || file.name === 'undefined') return null;
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const safeFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const fileName = `prod-${Date.now()}-${safeFileName}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    return `/uploads/${fileName}`;
  } catch (e) {
    console.error("Error al guardar archivo de producto:", e);
    return null;
  }
}

export async function upsertProductAction(formData: FormData, productId?: string) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    
    // Manejar archivos locales
    const imageFile = formData.get('imageFile') as File | null;
    const image2File = formData.get('image2File') as File | null;
    
    let image = formData.get('image') as string;
    let image2 = formData.get('image2') as string;
    
    const uploadedImage = await saveFile(imageFile);
    if (uploadedImage) image = uploadedImage;
    
    const uploadedImage2 = await saveFile(image2File);
    if (uploadedImage2) image2 = uploadedImage2;

    const metadataStr = formData.get('metadata') as string;
    const metadata = JSON.parse(metadataStr || '{}');
    
    // Convertir precio a céntimos
    const priceInCents = Math.round(parseFloat(price.replace(',', '.')) * 100);

    // Filtrar imágenes válidas (URLs de Stripe o locales de public/uploads)
    const images = [image, image2].filter(img => !!img && (img.startsWith('http') || img.startsWith('/uploads/')));

    // Preparar metadatos finales
    const finalMetadata: Record<string, string> = {
      category,
    };

    if (productId) {
      const existing = await stripe.products.retrieve(productId);
      Object.keys(existing.metadata).forEach(key => {
        if (key.startsWith('notas_') || key.startsWith('stock_')) {
          finalMetadata[key] = ""; 
        }
      });
    }

    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'notas_temp') {
        finalMetadata[key] = String(value);
      }
    });

    if (category === 'cafe' && metadata.notas_temp) {
      const notes = metadata.notas_temp
        .split(',')
        .map((n: string) => n.trim())
        .filter((n: string) => n !== '');
      
      notes.forEach((note: string, index: number) => {
        finalMetadata[`notas_${index + 1}`] = note;
      });
    }

    const productData = {
      name,
      description,
      priceInCents,
      images,
      metadata: finalMetadata
    };

    if (productId) {
      await updateStripeProduct(productId, productData);
    } else {
      await createStripeProduct(productData);
    }

    revalidatePath('/admin/dashboard/products');
    revalidatePath('/');
    
    return { success: true, message: productId ? 'Producto actualizado' : 'Producto creado' };
  } catch (error: any) {
    console.error('Error in upsertProductAction:', error);
    return { success: false, message: error.message || 'Error al procesar el producto' };
  }
}

export async function archiveProductAction(productId: string) {
  try {
    await archiveStripeProduct(productId);
    revalidatePath('/admin/dashboard/products');
    revalidatePath('/');
    return { success: true, message: 'Producto archivado' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
