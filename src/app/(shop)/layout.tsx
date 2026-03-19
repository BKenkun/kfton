import type { Metadata } from 'next';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/hooks/use-cart';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'kfton Experience',
  description: 'The essence of kfton, from our coffee to our story.',
  keywords: 'kfton, coffee, cafe, specialty coffee, online store, merchandise',
};

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
      <Toaster />
    </CartProvider>
  );
}

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}
