
import Link from 'next/link';
import { getStripeOrders } from '@/lib/stripe';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import type { Stripe } from 'stripe';

const formatAddress = (address: Stripe.Address | null): string => {
    if (!address) return 'N/A';
    const parts = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country
    ];
    return parts.filter(Boolean).join(', ');
};

export default async function OrdersAdminPage() {
  const orders = await getStripeOrders();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión de Pedidos</h1>
        <Button asChild className="ml-auto gap-1">
          <Link href="https://dashboard.stripe.com" target="_blank">
            Ir a Stripe
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
                Aquí se muestran los últimos pedidos realizados en tu tienda.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="hidden sm:table-cell">Estado Pago</TableHead>
                        <TableHead className="hidden lg:table-cell">Dirección de Envío</TableHead>
                        <TableHead className="hidden md:table-cell">Fecha</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                No hay pedidos todavía.
                            </TableCell>
                        </TableRow>
                    )}
                    {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                                {order.customerEmail}
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                                style={order.paymentStatus === 'paid' ? { backgroundColor: 'hsl(var(--chart-2))' } : {}}
                            >
                                {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {formatAddress(order.shippingAddress)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                        <TableCell className="text-right">{order.total}</TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="ghost" size="icon">
                                <Link href={`/admin/dashboard/orders/${order.id}`}>
                                    <ArrowRight className="h-4 w-4" />
                                    <span className="sr-only">Ver Pedido</span>
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
