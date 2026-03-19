import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import menuData from '@/lib/menu-data.json';

interface MenuItemProps {
  name: string;
  price: string;
  description?: string;
}

interface MenuCategory {
    name: string;
    subcategories: {
        name: string;
        items: MenuItemProps[];
    }[];
}

const MenuItem = ({ name, price, description }: MenuItemProps) => (
    <div className="flex justify-between items-start py-3">
        <div>
            <p className="font-body text-lg">{name}</p>
            {description && <p className="text-sm text-foreground/70 mt-1 max-w-md">{description}</p>}
        </div>
        <div className="flex-grow border-b border-dotted border-foreground/30 mx-2 sm:mx-4 self-center relative top-2"></div>
        <p className="font-body text-lg font-mono whitespace-nowrap">{price} €</p>
    </div>
);

const Menu = () => {
  const { dishesOfTheWeek, categories } = menuData as {
    dishesOfTheWeek?: MenuItemProps[];
    categories: MenuCategory[];
  };

  return (
    <section id="menu" className="py-24 sm:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-left mb-12 sm:mb-16 max-w-2xl">
          <h2 className="font-headline text-5xl sm:text-6xl font-normal">Nuestra Carta</h2>
          <p className="text-lg text-foreground/80 mt-4">
            Descubre una cuidada selección de cafés de autor, tés y otras bebidas. Hecho con cariño, para que lo disfrutes sin prisa.
          </p>
        </div>
        
        {dishesOfTheWeek && dishesOfTheWeek.length > 0 && (
            <div className="w-full max-w-4xl mx-auto">
                <div className='bg-primary text-primary-foreground rounded-lg p-6 sm:p-8 mb-8'>
                    <h3 className='font-headline text-3xl sm:text-4xl mb-4'>
                      {dishesOfTheWeek.length > 1 ? 'Platos de la Semana' : 'Plato de la Semana'}
                    </h3>
                    <div className='border-t border-primary-foreground/50 pt-4 divide-y divide-primary-foreground/20'>
                        {dishesOfTheWeek.map((dish) => (
                             <div key={dish.name} className="flex justify-between items-start py-3">
                                <div>
                                    <p className="font-body text-lg">{dish.name}</p>
                                    {dish.description && <p className="text-sm text-primary-foreground/80 mt-1 max-w-md">{dish.description}</p>}
                                </div>
                                <div className="flex-grow border-b border-dotted border-primary-foreground/30 mx-2 sm:mx-4 self-center relative top-2"></div>
                                <p className="font-body text-lg font-mono whitespace-nowrap">{dish.price} €</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <Accordion type="multiple" className="w-full max-w-4xl mx-auto">
            {categories.map((category: MenuCategory) => (
                <AccordionItem key={category.name} value={category.name.toLowerCase()} className='border-b border-foreground/50'>
                    <AccordionTrigger className='font-headline text-3xl sm:text-4xl py-6 sm:py-8 hover:no-underline text-left'>
                        {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="multiple" className='pl-2 sm:pl-8'>
                            {category.subcategories.map((subcategory, index) => (
                                <AccordionItem 
                                    key={subcategory.name} 
                                    value={subcategory.name.toLowerCase()} 
                                    className={index === category.subcategories.length - 1 ? 'border-b-0' : 'border-b border-foreground/30'}
                                >
                                    <AccordionTrigger className='font-headline text-2xl sm:text-3xl py-5 sm:py-6 hover:no-underline text-left'>
                                        {subcategory.name}
                                    </AccordionTrigger>
                                    <AccordionContent className='pt-2'>
                                        {subcategory.items.map(item => (
                                            <MenuItem key={item.name} {...item} />
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Menu;
