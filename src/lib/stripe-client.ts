
'use server';

import type { StripeOrder, StripeProduct } from './stripe';

// This is a placeholder for a client-safe way to get Stripe data.
// In a real app, this would be an API route that calls the server-side Stripe functions.
// For this prototype, we are calling server functions directly in a 'use server' file.

import { getStripeOrders as serverGetStripeOrders, getStripeProducts as serverGetStripeProducts } from './stripe';

export async function getStripeOrders(): Promise<StripeOrder[]> {
  return serverGetStripeOrders();
}

export async function getStripeProducts(): Promise<StripeProduct[]> {
    return serverGetStripeProducts();
}
