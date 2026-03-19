
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { StripeOrder, StripeProduct } from '@/lib/stripe';
import { getStripeOrders, getStripeProducts } from '@/lib/stripe-client';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, AlertTriangle } from 'lucide-react';
import StatsCards from './analytics/stats-cards';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import RevenueChart from './analytics/revenue-chart';
import SalesChart from './analytics/sales-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type TimeRange = 'week' | 'month' | 'quarter';

const useDashboardData = () => {
    const [orders, setOrders] = useState<StripeOrder[]>([]);
    const [products, setProducts] = useState<StripeProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [fetchedOrders, fetchedProducts] = await Promise.all([
                getStripeOrders(),
                getStripeProducts()
            ]);
            fetchedOrders.sort((a, b) => b.fullDate.getTime() - a.fullDate.getTime());
            setOrders(fetchedOrders);
            setProducts(fetchedProducts);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return { orders, products, isLoading };
};

const filterAndProcessOrders = (orders: StripeOrder[], range: TimeRange) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (range) {
        case 'month':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        case 'quarter':
            startDate = subDays(now, 90);
            break;
        case 'week':
        default:
            startDate = startOfWeek(now, { weekStartsOn: 1 });
            endDate = endOfWeek(now, { weekStartsOn: 1});
            break;
    }

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.fullDate);
        return orderDate >= startDate && orderDate <= endDate;
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalInCents, 0);
    const totalSales = filteredOrders.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    const stats = {
        totalRevenue,
        totalSales,
        averageOrderValue,
    };

    let chartData;
    if (range === 'week') {
        const daysOfWeek = ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
        const dataByDay: { [key: string]: { revenue: number; sales: number } } = {};
        filteredOrders.forEach(order => {
            const day = format(new Date(order.fullDate), 'E', { locale: es }).replace('.', '');
            if (!dataByDay[day]) dataByDay[day] = { revenue: 0, sales: 0 };
            dataByDay[day].revenue += order.totalInCents / 100;
            dataByDay[day].sales += 1;
        });
        chartData = daysOfWeek.map(day => {
            const dayKey = day.replace('.', '');
            return {
                label: day,
                revenue: dataByDay[dayKey]?.revenue || 0,
                sales: dataByDay[dayKey]?.sales || 0,
            };
        });
    } else if (range === 'month') {
        const dataByWeek: { [key: string]: { revenue: number; sales: number } } = {};
        filteredOrders.forEach(order => {
            const week = `Sem ${getWeek(new Date(order.fullDate), { weekStartsOn: 1 })}`;
            if (!dataByWeek[week]) dataByWeek[week] = { revenue: 0, sales: 0 };
            dataByWeek[week].revenue += order.totalInCents / 100;
            dataByWeek[week].sales += 1;
        });
        chartData = Object.entries(dataByWeek).map(([label, data]) => ({ label, ...data })).sort((a,b) => a.label.localeCompare(b.label));
    } else {
        const dataByMonth: { [key: string]: { revenue: number; sales: number } } = {};
        filteredOrders.forEach(order => {
            const month = format(new Date(order.fullDate), 'MMM', { locale: es });
            if (!dataByMonth[month]) dataByMonth[month] = { revenue: 0, sales: 0 };
            dataByMonth[month].revenue += order.totalInCents / 100;
            dataByMonth[month].sales += 1;
        });

        const monthNames = Array.from({length: 3}).map((_, i) => {
            return format(subDays(now, i * 30), 'MMM', { locale: es });
        }).reverse();
        
        chartData = monthNames.map(month => ({
            label: month,
            revenue: dataByMonth[month]?.revenue || 0,
            sales: dataByMonth[month]?.sales || 0,
        }));
    }

    return { stats, chartData };
};

export default function Dashboard() {
  const { orders, products, isLoading } = useDashboardData();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  const { stats, chartData } = useMemo(() => filterAndProcessOrders(orders, timeRange), [orders, timeRange]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => {
        const stockValues = Object.entries(p.metadata)
            .filter(([key]) => key.startsWith('stock'))
            .map(([, val]) => parseInt(val || '0', 10));
        return stockValues.length > 0 && stockValues.some(s => s <= 5);
    }).slice(0, 4);
  }, [products]);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-9 w-28" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="h-80 lg:col-span-4" />
                <Skeleton className="h-80 lg:col-span-3" />
            </div>
        </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <Button asChild className="gap-1">
          <Link href="https://dashboard.stripe.com" target="_blank">
            Ir a Stripe
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:gap-8">
        <StatsCards stats={stats} />
        
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
                <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                    <TabsList>
                        <TabsTrigger value="week">Semana</TabsTrigger>
                        <TabsTrigger value="month">Mes</TabsTrigger>
                        <TabsTrigger value="quarter">Trimestre</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                        <CardTitle>Ingresos</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                        <RevenueChart data={chartData} />
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Ventas</CardTitle>
                            <CardDescription>Total de ventas en el período.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <SalesChart data={chartData} />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pedidos Recientes</CardTitle>
                        <CardDescription>Los 5 pedidos más recientes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="hidden sm:table-cell">Estado Pago</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead><span className="sr-only">Ver</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'secondary'}>
                                                {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{order.total}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="icon">
                                                <Link href={`/admin/dashboard/orders/${order.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {recentOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">Sin pedidos todavía</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/admin/dashboard/orders">
                                Ver todos los pedidos
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <aside className="w-full lg:w-80 space-y-6">
                <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <CardTitle className="text-lg">Alertas de Stock</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {lowStockProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Todo el stock está al día.</p>
                        ) : (
                            lowStockProducts.map(product => {
                                const stockTotal = Object.entries(product.metadata)
                                    .filter(([key]) => key.startsWith('stock'))
                                    .reduce((acc, [, val]) => acc + parseInt(val || '0', 10), 0);
                                return (
                                    <div key={product.id} className="flex flex-col gap-1 border-b border-amber-100 pb-2 last:border-0">
                                        <span className="text-sm font-medium line-clamp-1">{product.name}</span>
                                        <div className="flex items-center justify-between">
                                            <Badge variant={stockTotal === 0 ? "destructive" : "warning"} className="text-[10px] px-1.5 py-0 h-5">
                                                {stockTotal === 0 ? 'Agotado' : `${stockTotal} uds.`}
                                            </Badge>
                                            <Button asChild variant="link" className="h-auto p-0 text-xs">
                                                <Link href="/admin/dashboard/products">Reponer</Link>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>
            </aside>
        </div>
      </div>
    </>
  );
}
