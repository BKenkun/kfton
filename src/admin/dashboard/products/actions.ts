
'use server';

import { getStripeProducts } from '@/lib/stripe-client';

export async function getProducts() {
  return await getStripeProducts();
}
