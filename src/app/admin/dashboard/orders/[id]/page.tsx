import Link from 'next/link';
import { getStripeOrder } from '@/lib/stripe';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Truck } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getStripeOrder(params.id);

  if (!order) {
    notFound();
  }
  
  const shipping = order.shippingAddress;

  return (
    <div className="flex flex-col h-full gap-6">
       <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href="/admin/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver a pedidos</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Detalle del Pedido
          </h1>
           <Badge variant="outline" className="ml-auto sm:ml-0">
            {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" disabled>
              <Truck className="mr-2" />
              Marcar como enviado
            </Button>
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Productos</CardTitle>
                    <span className="text-sm text-muted-foreground">{order.items.reduce((acc, item) => acc + item.quantity, 0)} artículos</span>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] hidden sm:table-cell">Imagen</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead className="text-right">Precio</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            src={item.image || `https://placehold.co/80x80/F8F8F2/4A4A4A/png?text=N/A`}
                                            alt={item.name}
                                            width={80}
                                            height={80}
                                            className="aspect-square rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.name}
                                        {item.size && <span className="text-muted-foreground ml-2">({item.size})</span>}
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{item.price}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Resumen de Pago</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center">
                        <div>ID del Pedido</div>
                        <div className="ml-auto font-mono text-sm">{order.id}</div>
                    </div>
                     <Separator />
                    <div className="flex items-center font-medium">
                        <div>Total</div>
                        <div className="ml-auto text-lg">{order.total}</div>
                    </div>
                </CardContent>
             </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Cliente</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Nombre</span>
                        <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <a href={`mailto:${order.customerEmail}`} className="underline">{order.customerEmail}</a>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <Home className="h-5 w-5"/>
                    <CardTitle>Dirección de Envío</CardTitle>
                </CardHeader>
                 <CardContent className="text-sm">
                    {shipping ? (
                        <address className="grid gap-0.5 not-italic text-muted-foreground">
                            <span>{order.customerName}</span>
                            <span>{shipping.line1}</span>
                            {shipping.line2 && <span>{shipping.line2}</span>}
                            <span>{shipping.postal_code} {shipping.city}</span>
                            <span>{shipping.state}, {shipping.country}</span>
                        </address>
                    ) : (
                        <span>No se proporcionó dirección de envío.</span>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
