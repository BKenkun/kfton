
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import scheduleData from '@/lib/schedule-data.json';
import reviewsData from '@/lib/reviews-data.json';

const ScheduleItem = ({ day, hours }: { day: string, hours: string }) => (
    <div className="flex justify-between">
        <span>{day}</span>
        <span>{hours}</span>
    </div>
);

const Footer = () => {
  const { schedule } = scheduleData;
  const { reviews } = reviewsData;

  return (
    <footer id="location" className="bg-secondary text-foreground py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-left mb-12 sm:mb-16 max-w-2xl">
          <h2 className="font-headline text-5xl sm:text-6xl font-normal">Encuéntranos</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-12">
            <div>
                <h3 className="font-headline text-2xl sm:text-3xl mb-4">Dirección</h3>
                <a href="https://maps.app.goo.gl/CdBhtKiEkPVkXEU26" target="_blank" rel="noopener noreferrer" className='hover:underline text-base sm:text-lg'>
                  <p>C. Maruja Pastor, 2, local 6A, 03540 Alacant, Alicante</p>
                </a>
            </div>
            <div>
                <h3 className="font-headline text-2xl sm:text-3xl mb-4">Horario</h3>
                <div className='space-y-1 text-foreground/80 text-base sm:text-lg'>
                    {schedule.map(item => (
                      <ScheduleItem key={item.day} day={item.day} hours={item.hours} />
                    ))}
                </div>
            </div>
          </div>
          
          <div className="w-full aspect-[4/3] lg:aspect-video">
             <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6256.393795995668!2d-0.4299134883552444!3d38.36756627767491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd62390033281c73%3A0xf8fec08ce7ee6d1e!2sKFTON!5e0!3m2!1ses!2ses!4v1758664164176!5m2!1ses!2ses"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map to Kfton"
              ></iframe>
          </div>
        </div>

        {reviews && reviews.length > 0 && (
            <div className='mt-24'>
                <h3 className="font-headline text-3xl sm:text-4xl mb-6">Qué dicen nuestros clientes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                    <div key={index} className='border-t border-foreground/20 pt-6'>
                        <div className='flex items-center mb-2'>
                            <div className="flex">
                                {[...Array(review.rating)].map((_, i) => <Star key={i} className='w-4 h-4 fill-current' />)}
                            </div>
                        </div>
                        <p className="text-foreground/80 mb-2">&quot;{review.text}&quot;</p>
                        <p className="font-bold">{review.author}</p>
                    </div>
                    ))}
                </div>
            </div>
        )}

        <div className="text-left text-muted-foreground mt-24 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <Link href="/admin/login" className="font-logo text-2xl font-bold tracking-wider mb-4 sm:mb-0">
            kfton
          </Link>
          <p className='text-sm'>&copy; {new Date().getFullYear()} kfton</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
