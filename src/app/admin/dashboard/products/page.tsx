
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { StripeProduct } from '@/lib/stripe';
import { getStripeProducts } from '@/lib/stripe-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, ArrowUpDown, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { ProductDialog } from './product-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { archiveProductAction } from './actions';
import { useToast } from '@/hooks/use-toast';

const getStockVariant = (stockValue: number) => {
    if (stockValue > 5) return 'success';
    if (stockValue > 0) return 'warning';
    return 'destructive';
}

const StockBadge = ({ metadata }: { metadata: StripeProduct['metadata'] }) => {
  const stockEntries = Object.entries(metadata)
    .filter(([key]) => key.startsWith('stock'))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  if (stockEntries.length === 0) {
    return <Badge variant="secondary">N/A</Badge>;
  }

  if (stockEntries.length === 1 && stockEntries[0][0] === 'stock') {
    const stockValue = parseInt(stockEntries[0][1] || '0', 10);
    const variant = getStockVariant(stockValue);
     return (
        <Badge variant={variant} className={cn({
            'bg-emerald-600 hover:bg-emerald-700 text-white': variant === 'success',
            'bg-amber-500 hover:bg-amber-600 text-white': variant === 'warning',
        })}>
            {stockValue} uds.
        </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {stockEntries.map(([key, value]) => {
        const size = key.replace('stock_', '').toUpperCase();
        const stockValue = parseInt(value || '0', 10);
        const variant = getStockVariant(stockValue);
        return (
          <Badge key={key} variant={variant} className={cn('capitalize', {
            'bg-emerald-600 hover:bg-emerald-700 text-white': variant === 'success',
            'bg-amber-500 hover:bg-amber-600 text-white': variant === 'warning',
          })}>
            {size}: {stockValue}
          </Badge>
        );
      })}
    </div>
  );
};


function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Imagen</span>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-16 w-16 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
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

type SortableKeys = 'name' | 'category' | 'stock' | 'price';
type SortDirection = 'asc' | 'desc';

const getStockValues = (metadata: StripeProduct['metadata']): number[] => {
    return Object.entries(metadata)
        .filter(([key]) => key.startsWith('stock'))
        .map(([, value]) => parseInt(value || '0', 10));
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryTab, setCategoryTab] = useState('all');
  const [stockTab, setStockTab] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: SortDirection } | null>(null);
  const { toast } = useToast();

  const loadProducts = async () => {
    setIsLoading(true);
    const fetchedProducts = await getStripeProducts();
    setProducts(fetchedProducts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleArchive = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres archivar este producto? Dejará de aparecer en la tienda.')) return;
    
    const result = await archiveProductAction(id);
    if (result.success) {
      toast({ title: 'Producto archivado' });
      loadProducts();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const categories = useMemo(() => 
    [...new Set(products.map(p => p.metadata.category).filter(Boolean) as string[])], 
  [products]);

  const sortedAndFilteredProducts = useMemo(() => {
    let tempProducts = [...products];

    // Filtering logic
    if (categoryTab !== 'all') {
      tempProducts = tempProducts.filter(p => p.metadata.category === categoryTab);
    }
    
    if (stockTab !== 'all') {
        tempProducts = tempProducts.filter(p => {
            const stockValues = getStockValues(p.metadata);
            if (stockValues.length === 0) {
                return stockTab === 'all';
            }

            if (stockTab === 'in-stock') {
                return stockValues.every(stock => stock > 5);
            }
            if (stockTab === 'low-stock') {
                return stockValues.some(stock => stock > 0 && stock <= 5) && stockValues.every(stock => stock > 0);
            }
            if (stockTab === 'out-of-stock') {
                return stockValues.some(stock => stock === 0);
            }
            return true;
        });
    }

    // Sorting logic
    if (sortConfig !== null) {
      tempProducts.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (sortConfig.key) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'category':
            aValue = a.metadata.category || '';
            bValue = b.metadata.category || '';
            break;
          case 'stock':
            aValue = getStockValues(a.metadata).reduce((sum, current) => sum + current, 0);
            bValue = getStockValues(b.metadata).reduce((sum, current) => sum + current, 0);
            break;
          case 'price':
            aValue = a.priceInCents;
            bValue = b.priceInCents;
            break;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return tempProducts;
  }, [products, categoryTab, stockTab, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión de Productos</h1>
        <div className="flex gap-2">
           <ProductDialog />
           <Button asChild variant="outline" className="gap-1">
            <Link href="https://dashboard.stripe.com/products" target="_blank">
              Stripe
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Catálogo de Productos</CardTitle>
            <CardDescription>
                Gestiona tus productos, precios y stock. Los cambios se sincronizan directamente con Stripe.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col space-y-4">
                <Tabs value={categoryTab} onValueChange={setCategoryTab}>
                    <TabsList>
                        <TabsTrigger value="all">Todas las Categorías</TabsTrigger>
                        {categories.map(category => (
                            <TabsTrigger key={category} value={category} className="capitalize">
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <Tabs value={stockTab} onValueChange={setStockTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">Todo el Stock</TabsTrigger>
                      <TabsTrigger value="in-stock" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">En Stock</TabsTrigger>
                      <TabsTrigger value="low-stock" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">Stock Bajo</TabsTrigger>
                      <TabsTrigger value="out-of-stock" className="data-[state=active]:bg-destructive data-[state=active]:text-white">Sin Stock</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            
            <Separator className="my-6" />

            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Imagen</span>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => requestSort('name')}>
                    Nombre {getSortIndicator('name')}
                  </Button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => requestSort('category')}>
                    Categoría {getSortIndicator('category')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => requestSort('stock')}>
                    Stock {getSortIndicator('stock')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => requestSort('price')}>
                    Precio {getSortIndicator('price')}
                  </Button>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedAndFilteredProducts.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            No se encontraron productos con los filtros seleccionados.
                        </TableCell>
                    </TableRow>
                ) : (
                    sortedAndFilteredProducts.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                        <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={product.images[0] || `https://placehold.co/64x64/F8F8F2/4A4A4A/png?text=${product.name.charAt(0)}`}
                            width="64"
                        />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="capitalize">{product.metadata.category || 'Sin categoría'}</Badge>
                        </TableCell>
                        <TableCell>
                          <StockBadge metadata={product.metadata} />
                        </TableCell>
                        <TableCell className="text-right">{product.price}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <ProductDialog 
                                product={product} 
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit2 className="mr-2 h-4 w-4" /> Editar
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleArchive(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Archivar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
