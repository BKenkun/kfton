
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { YouTubeProps } from 'react-youtube';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import heroData from '@/lib/hero-data.json';
import { cn } from '@/lib/utils';

const YouTube = dynamic(() => import('react-youtube'), {
  ssr: false,
  loading: () => <Skeleton className="absolute inset-0 w-full h-full" />,
});

const positionClasses: { [key: string]: string } = {
    'top-left': 'justify-start items-start text-left',
    'top-center': 'justify-center items-start text-center',
    'top-right': 'justify-end items-start text-right',
    'center-left': 'justify-start items-center text-left',
    'center-center': 'justify-center items-center text-center',
    'center-right': 'justify-end items-center text-right',
    'bottom-left': 'justify-start items-end text-left',
    'bottom-center': 'justify-center items-end text-center',
    'bottom-right': 'justify-end items-end text-right',
};

const Hero = () => {
  const { text, position, textSize, backgroundType, backgroundUrl, button } = heroData;

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    const player = event.target;
    player.setPlaybackQuality('hd720');
    player.playVideo();
  };

  const opts: YouTubeProps['opts'] = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      showinfo: 0,
      mute: 1,
      loop: 1,
      playlist: backgroundType === 'youtube' ? backgroundUrl : undefined,
    },
  };

  const renderBackground = () => {
    switch (backgroundType) {
      case 'youtube':
        return (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] overflow-hidden pointer-events-none z-0">
            <YouTube
              videoId={backgroundUrl}
              opts={opts}
              onReady={onPlayerReady}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
              iframeClassName="w-full h-full"
            />
          </div>
        );
      case 'external_video':
         return (
            <video
              key={backgroundUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
              <source src={backgroundUrl} type="video/mp4" />
              Tu navegador no soporta el tag de video.
            </video>
          );
      case 'image':
        return (
          <Image
            src={backgroundUrl}
            alt="Fondo de la sección Héroe"
            fill
            className="object-cover z-0"
            priority
          />
        );
      default:
        return null;
    }
  }

  const buttonStyle = button.padding ? { paddingLeft: `${button.padding}px`, paddingRight: `${button.padding}px` } : {};
  
  const responsiveTextSize = `clamp(32px, 8vw, ${textSize}px)`;


  return (
    <section id="home" className={cn("relative h-screen w-full flex overflow-hidden p-4 sm:p-8 md:p-12", positionClasses[position] || 'justify-center items-center text-center')}>
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>
      
      {renderBackground()}

      <div className="z-10 text-white max-w-4xl">
        <h1 
          className="font-logo font-normal"
          style={{ fontSize: responsiveTextSize }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {button.enabled && button.href && button.text && (
            <Button asChild style={buttonStyle} className="mt-8">
                <Link href={button.href}>{button.text}</Link>
            </Button>
        )}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <Link href="#menu" aria-label="Scroll down">
          <ArrowDown className="h-8 w-8 animate-bounce text-white/70 hover:text-white transition-colors" />
          </Link>
      </div>
    </section>
  );
};

export default Hero;
