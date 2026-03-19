'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart, type CartItem } from '@/hooks/use-cart';
import type { StripeProduct } from '@/lib/stripe';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { RadioGroup, Radio, Label } from 'react-aria-components';
import { cn } from '@/lib/utils';
import Autoplay from "embla-carousel-autoplay";

export type Product = StripeProduct;

const ProductCarousel = ({ products, direction, speed }: { products: Product[], direction: 'forward' | 'backward', speed: number }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No hay productos disponibles en este momento.</p>
      </div>
    );
  }

  return (
  <Carousel
    plugins={[Autoplay({ delay: speed, stopOnInteraction: true, playOnInit: true, direction: direction })]}
    opts={{
      align: "start",
      loop: products.length > 1,
    }}
    className="w-full"
  >
    <CarouselContent className="-ml-4 py-4">
      {products.map((product) => (
         <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
           <ProductCard product={product} />
         </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious className="ml-12 hidden md:flex" />
    <CarouselNext className="mr-12 hidden md:flex"/>
  </Carousel>
  );
};


const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  
  const isCoffee = product.metadata.category?.toLowerCase() === 'cafe';
  const isMerch = product.metadata.category?.toLowerCase() === 'merchan';
  const hasSizes = isMerch && product.metadata.tallas;
  const sizes = hasSizes ? product.metadata.tallas!.split(',').map(s => s.trim()) : [];
  
  const additionalImages = Object.entries(product.metadata || {})
    .filter(([key]) => key.startsWith('image_') && !key.startsWith('image_carousel_'))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, value]) => value);

  const allImages = [...product.images, ...additionalImages];
  const hasMultipleImages = allImages.length > 1;

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) return;

    const itemToAdd: CartItem = {
      id: hasSizes && selectedSize ? `${product.id}-${selectedSize}` : product.id,
      priceId: product.defaultPriceId, // CRUCIAL: Usamos el ID del precio para Stripe
      name: product.name,
      price: product.price,
      priceInCents: product.priceInCents,
      image: allImages[0] || `https://placehold.co/400x500/F8F8F2/4A4A4A/png?text=${product.name.charAt(0)}`,
      quantity: 1,
      size: selectedSize,
    };
    addToCart(itemToAdd);
    toast({
      title: "Añadido al carrito",
      description: `${product.name}${selectedSize ? ` (Talla: ${selectedSize})` : ''} ha sido añadido a tu carrito.`,
    });
  };

  const coffeeDetailsKeys = ['origen', 'proceso', 'tueste'];
  const merchDetailsKeys = ['material', 'color', 'corte'];

  const techDetails = Object.entries(product.metadata || {})
    .filter(([key]) => 
      (isCoffee && coffeeDetailsKeys.includes(key.toLowerCase())) ||
      (isMerch && merchDetailsKeys.includes(key.toLowerCase()))
    );
  
  const notes = Object.entries(product.metadata || {})
    .filter(([key]) => key.startsWith('notas_'))
    .map(([, value]) => value)
    .filter(Boolean);

  return (
    <div className="group h-full">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-lg group/image-carousel">
          {hasMultipleImages ? (
              <Carousel className="w-full h-full" opts={{ loop: true }}>
                <CarouselContent>
                  {allImages.map((img, index) => (
                    <CarouselItem key={index}>
                      <Image
                        src={img}
                        alt={`${product.name} - Imagen ${index + 1}`}
                        width={400}
                        height={500}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/image-carousel:opacity-100 transition-opacity" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/image-carousel:opacity-100 transition-opacity" />
              </Carousel>
          ) : (
            <Image
              src={allImages[0] || `https://placehold.co/400x500/F8F8F2/4A4A4A/png?text=${product.name.charAt(0)}`}
              alt={product.name}
              width={400}
              height={500}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {isCoffee && notes.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {notes.map((note, index) => (
                  <Badge key={index} variant="default" className="bg-primary text-primary-foreground">
                    {note}
                  </Badge>
                ))}
              </div>
          )}
        </div>
        <CardContent className='flex-grow flex flex-col p-4'>
          <h3 className="font-headline text-2xl">{product.name}</h3>
          <p className="text-foreground/80 mt-1 flex-grow">{product.description}</p>
          
          {techDetails.length > 0 && (
            <div className="my-4 space-y-2 text-sm">
              {techDetails.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-bold capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-foreground/80 text-right">{value}</span>
                </div>
              ))}
            </div>
          )}

          {hasSizes && (
            <RadioGroup 
              aria-label="Seleccionar talla" 
              className="flex flex-wrap gap-2 my-4"
              value={selectedSize}
              onChange={setSelectedSize}
            >
              <Label className='sr-only'>Tallas</Label>
              {sizes.map((size) => {
                const stockKey = `stock_${size.toLowerCase()}`;
                const stock = product.metadata[stockKey] ? parseInt(product.metadata[stockKey]!, 10) : 0;
                const isOutOfStock = stock === 0;

                return (
                  <Radio 
                    key={size} 
                    value={size} 
                    isDisabled={isOutOfStock}
                    className={({isSelected}) => cn(
                      'cursor-pointer border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative',
                      isSelected ? 'bg-primary text-primary-foreground border-transparent' : 'bg-background hover:bg-accent',
                      isOutOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' : ''
                    )}
                  >
                     {size}
                     {isOutOfStock && <span className="absolute -top-px -left-px -right-px h-px bg-muted-foreground/50 transform rotate-[15deg] scale-x-150"></span>}
                  </Radio>
                )
              })}
            </RadioGroup>
          )}

            <Button 
              className='w-full mt-auto group/button' 
              onClick={handleAddToCart}
              disabled={hasSizes && !selectedSize}
            >
              <span className="group-hover/button:hidden font-mono">{product.price}</span>
              <span className="hidden group-hover/button:inline">Añadir al carrito</span>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
};


const Shop = ({ coffees, merchandise }: { coffees: Product[], merchandise: Product[] }) => {
  return (
    <section id="shop" className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-left mb-12 sm:mb-16">
          <h2 className="font-headline text-5xl sm:text-6xl font-normal">Shop</h2>
        </div>
        <div className="space-y-16">
          <div>
            <h3 className="font-headline text-3xl sm:text-4xl mb-4 sm:mb-8">Café</h3>
            <ProductCarousel products={coffees} direction="forward" speed={5000} />
          </div>
          <div>
            <h3 className="font-headline text-3xl sm:text-4xl mb-4 sm:mb-8">Merchandise</h3>
            <ProductCarousel products={merchandise} direction="backward" speed={7000} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shop;