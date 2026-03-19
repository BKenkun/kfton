
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell, Home, Package, Settings, ShoppingCart, UtensilsCrossed, ExternalLink, Clock, Star, MonitorPlay, PanelLeftClose, PanelLeftOpen, Store, ChevronRight, Menu as MenuIcon, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
    { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/admin/dashboard/hero', icon: MonitorPlay, label: 'Héroe' },
    { href: '/admin/dashboard/menu', icon: UtensilsCrossed, label: 'Menú' },
    { 
      href: '#', 
      icon: Store, 
      label: 'Shop',
      children: [
        { href: '/admin/dashboard/products', icon: Package, label: 'Productos' },
        { href: '/admin/dashboard/orders', icon: ShoppingCart, label: 'Pedidos' },
      ] 
    },
    { href: '/admin/dashboard/schedule', icon: Clock, label: 'Horario' },
    { href: '/admin/dashboard/reviews', icon: Star, label: 'Reseñas' },
    { href: '/admin/dashboard/settings', icon: Settings, label: 'Ajustes' },
];

const NavContent = ({ isCollapsed, closeSheet }: { isCollapsed: boolean, closeSheet?: () => void }) => {
    const pathname = usePathname();
    const [isShopSubMenuOpen, setIsShopSubMenuOpen] = useState(false);

    useEffect(() => {
        setIsShopSubMenuOpen(pathname.startsWith('/admin/dashboard/products') || pathname.startsWith('/admin/dashboard/orders'));
    }, [pathname]);

    const isActive = (href: string, exact = false) => {
        if (exact) {
            return pathname === href;
        }
        // Para subrutas como /orders/[id]
        if (href.endsWith('s')) {
            return pathname.startsWith(href);
        }
        return pathname === href;
    };
  
    const isShopActive = isActive('/admin/dashboard/products') || isActive('/admin/dashboard/orders');

    return (
        <TooltipProvider>
            <nav className={cn(
                "grid items-start text-sm font-medium gap-1",
                isCollapsed ? "px-2" : "px-2 lg:px-4"
            )}>
                {navItems.map((item) => (
                  item.children ? (
                     isCollapsed ? (
                        <Collapsible open={isShopSubMenuOpen} onOpenChange={setIsShopSubMenuOpen} key={item.label} className="w-full">
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant={isShopActive ? 'secondary' : 'ghost'}
                                            className="w-full justify-center h-10 w-10 my-1"
                                            size="icon"
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span className="sr-only">{item.label}</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
                            </Tooltip>
                            <CollapsibleContent className="space-y-1 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden pl-3 mt-1">
                                {item.children.map(child => (
                                    <Tooltip key={child.label} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={child.href}
                                                className={cn(
                                                    'flex items-center justify-center rounded-lg h-9 w-9 transition-colors',
                                                    isActive(child.href)
                                                    ? 'bg-muted text-primary'
                                                    : 'text-muted-foreground hover:text-primary'
                                                )}
                                                onClick={closeSheet}
                                            >
                                                <child.icon className="h-5 w-5" />
                                                <span className="sr-only">{child.label}</span>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right"><p>{child.label}</p></TooltipContent>
                                    </Tooltip>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    ) : (
                        <Accordion key={item.label} type="single" collapsible defaultValue={isShopActive ? "shop" : undefined} className="w-full">
                            <AccordionItem value="shop" className="border-b-0">
                                <AccordionTrigger className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-muted-foreground hover:text-primary hover:no-underline ${isShopActive && 'text-primary'}`}>
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </AccordionTrigger>
                                <AccordionContent className="pl-8 pt-1">
                                    {item.children.map(child => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                                isActive(child.href)
                                                ? 'bg-muted text-primary'
                                                : 'text-muted-foreground hover:text-primary'
                                            }`}
                                            onClick={closeSheet}
                                            >
                                            <child.icon className="h-4 w-4" />
                                            {child.label}
                                        </Link>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )
                  ) : (
                    isCollapsed ? (
                    <Tooltip key={item.label} delayDuration={0}>
                      <TooltipTrigger asChild>
                         <Link
                          href={item.href}
                          className={`flex items-center justify-center gap-3 rounded-lg h-10 w-10 transition-all ${
                            isActive(item.href, item.href === '/admin/dashboard')
                              ? 'bg-muted text-primary'
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                           onClick={closeSheet}
                        >
                          <item.icon className="h-5 w-5" />
                           <span className="sr-only">{item.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive(item.href, item.href === '/admin/dashboard')
                          ? 'bg-muted text-primary'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      onClick={closeSheet}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                  )
                ))}
            </nav>
        </TooltipProvider>
    )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className={cn(
        "grid min-h-screen w-full",
        isCollapsed ? "md:grid-cols-[5rem_1fr]" : "md:grid-cols-[280px_1fr]",
        "transition-all duration-300 ease-in-out"
    )}>
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className={cn(
                "flex h-14 items-center border-b lg:h-[60px]",
                isCollapsed ? "justify-center" : "px-4 lg:px-6"
            )}>
              <Link href="/admin/dashboard" className={cn("flex items-center gap-2 font-semibold", isCollapsed && "px-4")}>
                <span className={cn("font-logo text-2xl font-bold tracking-wider", isCollapsed && "sr-only")}>kfton</span>
                 {!isCollapsed && <Badge variant="outline">Admin</Badge>}
              </Link>
               <Button variant="ghost" size="icon" className={cn("ml-auto", isCollapsed ? "hidden" : "block")} onClick={toggleSidebar}>
                    <PanelLeftOpen className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <NavContent isCollapsed={isCollapsed} />
            </div>
             <div className={cn(
                "mt-auto flex h-14 items-center border-t lg:h-[60px]",
                isCollapsed ? "justify-center" : "px-4 lg:px-6"
             )}>
                <Button variant="ghost" size="icon" className={cn(isCollapsed ? "block" : "hidden")} onClick={toggleSidebar}>
                    <PanelLeftClose className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <MenuIcon className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <SheetTitle className='sr-only'>Menú de Navegación</SheetTitle>
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                      <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                        <span className="font-logo text-2xl font-bold tracking-wider">kfton</span>
                        <Badge variant="outline">Admin</Badge>
                      </Link>
                       <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-auto">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close navigation menu</span>
                        </Button>
                       </SheetTrigger>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <NavContent isCollapsed={false} closeSheet={() => setIsSheetOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>
            
            <div className="w-full flex-1">
              {/* Search could go here */}
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="icon" className="h-8 w-8">
                            <Link href="/" target="_blank">
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">Ir a la web</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver web</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
    </div>
  );
}
