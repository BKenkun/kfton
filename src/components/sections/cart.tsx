
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import Image from 'next/image';
import { Trash2, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const totalPrice = cart.reduce((total, item) => total + item.priceInCents * item.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js has not loaded yet.');
      }
      
      const lineItems = cart.map(item => ({
        price: item.priceId,
        quantity: item.quantity,
        description: item.size ? `Talla: ${item.size}` : undefined,
      }));

      const { error } = await stripe.redirectToCheckout({
        lineItems,
        mode: 'payment',
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/`,
        shippingAddressCollection: {
            allowed_countries: ['ES', 'US', 'CA', 'GB', 'FR', 'DE', 'IT', 'PT'],
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        variant: "destructive",
        title: "Error en el pago",
        description: error.message || "No se pudo iniciar el proceso de pago. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <SheetHeader className='p-6'>
        <SheetTitle>Tu Carrito</SheetTitle>
      </SheetHeader>
      <ScrollArea className="flex-grow">
        <div className="pr-6">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 px-6">
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <div className='divide-y'>
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 pl-6">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={80}
                  className="object-cover rounded-md aspect-[4/5]"
                />
                <div className="flex-grow">
                  <p className="font-medium">{item.name} {item.size && `(${item.size})`}</p>
                  <p className="text-sm text-muted-foreground">{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 h-8"
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
        </div>
      </ScrollArea>
      {cart.length > 0 && (
        <SheetFooter className='p-6 bg-secondary'>
          <div className="w-full space-y-4">
             <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{(totalPrice / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
            </div>
            <Button className="w-full" onClick={handleCheckout} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Procesando...' : 'Finalizar compra'}
            </Button>
          </div>
        </SheetFooter>
      )}
    </div>
  );
}
