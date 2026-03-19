'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu as MenuIcon, X as XIcon, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import Cart from '@/components/sections/cart';
import { Badge } from '@/components/ui/badge';


const navLinks = [
  { href: '#menu', label: 'Carta' },
  { href: '#shop', label: 'Shop' },
  { href: '#location', label: 'Encuéntranos' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground'>
      <div className="container mx-auto px-4">
        <div className="flex h-24 items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider font-logo">
            kfton
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <div className='flex items-center space-x-12'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium uppercase tracking-widest text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className='flex items-center space-x-2'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className='relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
                    <ShoppingCart />
                    {itemCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{itemCount}</Badge>
                    )}
                    <span className="sr-only">Shopping Cart</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className='p-0'>
                  <Cart />
                </SheetContent>
              </Sheet>
            </div>
          </nav>

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
                  <MenuIcon />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full bg-background p-0">
                <div className='flex items-center justify-between h-24 px-4 border-b'>
                    <Link href="/" className="text-2xl font-bold tracking-wider font-logo" onClick={() => setMobileMenuOpen(false)}>
                       kfton
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                        <XIcon />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </div>
                <nav className="flex flex-col items-center justify-center pt-16 space-y-12">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-2xl font-medium uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className='flex items-center space-x-8 mt-12'>
                    <Sheet>
                      <SheetTrigger asChild>
                         <Button variant="ghost" size="icon" className='relative'>
                          <ShoppingCart className='h-8 w-8'/>
                          {itemCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{itemCount}</Badge>
                          )}
                          <span className="sr-only">Shopping Cart</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent className='p-0'>
                          <Cart />
                      </SheetContent>
                    </Sheet>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
