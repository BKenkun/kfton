
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (sessionId) {
      // Vaciar el carrito inmediatamente al llegar con éxito
      clearCart();
      setLoading(false);
    } else {
      // Si no hay session_id, redirigir a la tienda
      router.push('/#shop');
    }
  }, [sessionId, clearCart, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Confirmando tu pedido...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32 flex justify-center">
      <Card className="max-w-md w-full text-center p-8">
        <CardHeader className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <CardTitle className="font-headline text-4xl">¡Gracias por tu pedido!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Hemos recibido tu pago correctamente. Pronto recibirás un correo electrónico con los detalles de tu envío.
          </p>
          <div className="bg-secondary p-4 rounded-md text-sm font-mono break-all">
            <span className="block text-xs uppercase text-muted-foreground mb-1">ID de Transacción:</span>
            {sessionId}
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild className="w-full">
              <Link href="/#shop">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Seguir comprando
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
