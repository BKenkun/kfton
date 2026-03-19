import Hero from '@/components/sections/hero';
import Menu from '@/components/sections/menu';
import Shop from '@/components/sections/shop';
import { getStripeProducts } from '@/lib/stripe';

export default async function Home() {
  const allProducts = await getStripeProducts();

  const coffees = allProducts.filter(p => p.metadata.category?.toLowerCase() === 'cafe');
  
  const merchandise = allProducts.filter(p => p.metadata.category?.toLowerCase() === 'merchan');

  return (
    <>
      <Hero />
      <Menu />
      <Shop coffees={coffees} merchandise={merchandise} />
    </>
  );
}
